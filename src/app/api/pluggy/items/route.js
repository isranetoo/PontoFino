// ============================================================
// POST /api/pluggy/items
//
// Callback do widget após o cliente concluir a conexão.
// Recebe { inviteToken, itemId } — valida o JWT, executa o sync
// completo (item -> accounts -> investments -> portfolio_assets)
// usando o admin client (service_role) já que o cliente final
// não tem session Supabase.
// ============================================================

import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { verifyInviteToken } from "@/lib/pluggy/invite-token";
import { syncItem } from "@/lib/pluggy/sync";

export async function POST(request) {
  try {
    const { inviteToken, itemId } = await request.json();

    if (!itemId) {
      return NextResponse.json({ error: "itemId é obrigatório." }, { status: 400 });
    }

    let payload;
    try {
      payload = await verifyInviteToken(inviteToken);
    } catch (err) {
      return NextResponse.json(
        { error: err.message || "Convite inválido." },
        { status: 401 }
      );
    }

    const supabase = await getSupabaseAdminClient();

    // Defesa em profundidade: confirma que o (clientId, consultantId) do JWT
    // ainda existem e ainda estão pareados. Se o consultor deletou o cliente,
    // negar a criação.
    const { data: clientCheck, error: clientErr } = await supabase
      .from("clients")
      .select("id, consultant_id")
      .eq("id", payload.clientId)
      .eq("consultant_id", payload.consultantId)
      .maybeSingle();

    if (clientErr || !clientCheck) {
      return NextResponse.json(
        { error: "Cliente não encontrado para este convite." },
        { status: 404 }
      );
    }

    const result = await syncItem(supabase, {
      consultantId: payload.consultantId,
      clientId: payload.clientId,
      pluggyItemId: itemId,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[pluggy/items] erro:", err);
    return NextResponse.json(
      { error: err.message || "Erro ao sincronizar item." },
      { status: 500 }
    );
  }
}
