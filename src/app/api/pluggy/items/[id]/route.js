// ============================================================
// DELETE /api/pluggy/items/[id]
//
// "Desconectar" — autenticado pelo consultor.
// Política da Fase 3 (snapshot histórico):
//  - Apaga o item na Pluggy (para de cobrar / atualizar).
//  - Marca disconnected_at = now() localmente.
//  - Mantém pluggy_accounts/investments e portfolio_assets
//    source='pluggy' como histórico read-only.
//
// id na URL é o uuid local de pluggy_items.
// ============================================================

import { NextResponse } from "next/server";
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server";
import { deleteItem as deletePluggyItem } from "@/lib/pluggy/client";

export async function DELETE(_request, context) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "id é obrigatório." }, { status: 400 });
    }

    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const { data: itemRow, error: fetchErr } = await supabase
      .from("pluggy_items")
      .select("id, pluggy_item_id, disconnected_at")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr || !itemRow) {
      return NextResponse.json({ error: "Conexão não encontrada." }, { status: 404 });
    }
    if (itemRow.disconnected_at) {
      return NextResponse.json({ ok: true, alreadyDisconnected: true });
    }

    // 1) Apaga na Pluggy. Se já estiver apagado (404), seguimos —
    // o objetivo é encerrar a conexão.
    try {
      await deletePluggyItem(itemRow.pluggy_item_id);
    } catch (err) {
      if (err.status !== 404) {
        console.error("[pluggy/items DELETE] falha ao apagar na Pluggy:", err);
        return NextResponse.json(
          { error: "Não foi possível desconectar na Pluggy. Tente novamente." },
          { status: 502 }
        );
      }
    }

    // 2) Marca como desconectado (snapshot mantido).
    // Usamos admin client porque RLS update_pluggy_items_own permite
    // mas queremos garantir consistência mesmo se RLS mudar no futuro.
    const admin = await getSupabaseAdminClient();
    const { error: updErr } = await admin
      .from("pluggy_items")
      .update({
        disconnected_at: new Date().toISOString(),
        status: "DISCONNECTED",
      })
      .eq("id", id);

    if (updErr) {
      console.error("[pluggy/items DELETE] update local falhou:", updErr);
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[pluggy/items DELETE] erro:", err);
    return NextResponse.json(
      { error: err.message || "Erro ao desconectar." },
      { status: 500 }
    );
  }
}
