// ============================================================
// POST /api/pluggy/webhook
//
// Recebe webhooks da Pluggy (item/created, item/updated, etc.).
//
// Segurança: valida HMAC-SHA256 do header x-signature contra
// PLUGGY_WEBHOOK_SECRET. Sem assinatura válida, 401.
//
// Idempotência: cada evento tem um id único; persistimos em
// pluggy_webhook_events com event_id UNIQUE — duplicatas falham
// no INSERT e são tratadas como já-processadas.
//
// Sync: para eventos relevantes (item/updated), disparamos
// syncItem síncrono. Se o item não existir mais (apagado pelo
// consultor) ou estiver desconectado, apenas registramos.
//
// Nota sobre Vercel: o sync síncrono pode demorar alguns segundos.
// Se notarmos timeouts (10s hobby, 60s pro), migrar para `after()`
// do next/server para retornar 200 imediatamente e processar em
// background.
// ============================================================

import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { verifyWebhookSignature } from "@/lib/pluggy/client";
import { syncItem } from "@/lib/pluggy/sync";

// Eventos que disparam re-sync. Outros tipos (ex.: connector/status,
// item/created — já tratado pelo callback do widget) são apenas logados.
const SYNC_EVENTS = new Set([
  "item/updated",
  "item/waiting_user_input",
  "item/login_succeeded",
  "item/error",
]);

export async function POST(request) {
  // 1) Body bruto (necessário para validar HMAC)
  let rawBody;
  try {
    rawBody = await request.text();
  } catch (err) {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  // 2) Assinatura HMAC
  const signature = request.headers.get("x-signature");
  let signatureValid = false;
  try {
    signatureValid = verifyWebhookSignature(rawBody, signature);
  } catch (err) {
    // PLUGGY_WEBHOOK_SECRET não configurado.
    console.error("[pluggy/webhook] config:", err.message);
    return NextResponse.json({ error: "Webhook secret não configurado." }, { status: 500 });
  }
  if (!signatureValid) {
    Sentry.addBreadcrumb({
      category: "pluggy.webhook",
      message: "assinatura inválida",
      level: "warning",
    });
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
  }

  // 3) Parse do payload
  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const eventType = payload.event ?? "";
  const pluggyItemId = payload.itemId ?? payload.item?.id ?? "";

  Sentry.addBreadcrumb({
    category: "pluggy.webhook",
    message: `received ${eventType}`,
    level: "info",
    data: { event: eventType, pluggyItemId },
  });
  // A Pluggy não envia um event_id explícito hoje, então sintetizamos
  // com event+itemId+createdAt — colisões só ocorrem em retries do mesmo
  // payload, que é exatamente o que queremos deduplicar.
  const eventId =
    payload.id ??
    `${eventType}:${pluggyItemId}:${payload.createdAt ?? payload.triggeredAt ?? ""}`;

  const supabase = await getSupabaseAdminClient();

  // 4) Persiste evento (UNIQUE em event_id garante idempotência)
  const { error: insertErr } = await supabase
    .from("pluggy_webhook_events")
    .insert({
      event_id: eventId,
      event_type: eventType,
      pluggy_item_id: pluggyItemId,
      payload,
    });

  if (insertErr) {
    // Código 23505 = unique_violation = evento duplicado.
    if (insertErr.code === "23505") {
      return NextResponse.json({ ok: true, deduped: true });
    }
    console.error("[pluggy/webhook] insert falhou:", insertErr);
    return NextResponse.json({ error: "Erro ao persistir evento." }, { status: 500 });
  }

  // 5) Sync se for evento relevante
  if (SYNC_EVENTS.has(eventType) && pluggyItemId) {
    try {
      await processItemEvent(supabase, { pluggyItemId, eventId });
    } catch (err) {
      console.error("[pluggy/webhook] sync falhou:", err);
      Sentry.captureException(err, {
        tags: { component: "pluggy.webhook" },
        extra: { eventType, pluggyItemId, eventId },
      });
      await supabase
        .from("pluggy_webhook_events")
        .update({ error: String(err.message || err) })
        .eq("event_id", eventId);
      // Retornamos 200 mesmo assim — a Pluggy não precisa reentregar;
      // o erro está logado e o item pode ser re-sincronizado manualmente.
    }
  }

  // 6) Marca como processado
  await supabase
    .from("pluggy_webhook_events")
    .update({ processed_at: new Date().toISOString() })
    .eq("event_id", eventId);

  return NextResponse.json({ ok: true });
}

async function processItemEvent(supabase, { pluggyItemId, eventId }) {
  // Recupera nosso pluggy_items por pluggy_item_id.
  // Como (consultant_id, pluggy_item_id) é UNIQUE mas não (pluggy_item_id),
  // tecnicamente dois consultores podem ter conectado o MESMO item — só pode
  // acontecer se ambos compartilharem o mesmo clientUserId, o que não fazemos
  // (usamos client.id, único por consultor). Mesmo assim, single() é seguro.
  const { data: itemRow, error: fetchErr } = await supabase
    .from("pluggy_items")
    .select("consultant_id, client_id, disconnected_at")
    .eq("pluggy_item_id", pluggyItemId)
    .maybeSingle();

  if (fetchErr) {
    throw new Error(`select pluggy_items: ${fetchErr.message}`);
  }
  if (!itemRow) {
    // Webhook para item que não conhecemos. Pode acontecer se o consultor
    // criou um item via outro caminho ou se o nosso INSERT inicial falhou.
    console.warn(`[pluggy/webhook] item desconhecido: ${pluggyItemId} (event ${eventId})`);
    return;
  }
  if (itemRow.disconnected_at) {
    // Item arquivado pelo consultor: snapshot é read-only.
    return;
  }

  await syncItem(supabase, {
    consultantId: itemRow.consultant_id,
    clientId: itemRow.client_id,
    pluggyItemId,
  });
}
