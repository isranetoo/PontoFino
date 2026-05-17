// ============================================================
// POST /api/pluggy/items/[id]/sync
//
// "Atualizar agora" — autenticado pelo consultor (Supabase cookie).
// id na URL é o uuid local de pluggy_items (RLS filtra por consultor).
// ============================================================

import { NextResponse } from "next/server";
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server";
import { syncItem } from "@/lib/pluggy/sync";

export async function POST(_request, context) {
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

    // RLS garante que só vemos items do próprio consultor.
    const { data: itemRow, error: fetchErr } = await supabase
      .from("pluggy_items")
      .select("id, consultant_id, client_id, pluggy_item_id, disconnected_at")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr || !itemRow) {
      return NextResponse.json({ error: "Conexão não encontrada." }, { status: 404 });
    }
    if (itemRow.disconnected_at) {
      return NextResponse.json(
        { error: "Esta conexão foi desconectada. Use 'Reconectar' para criar uma nova." },
        { status: 409 }
      );
    }

    // Admin client para o sync (escreve em várias tabelas com FKs cruzadas).
    const admin = await getSupabaseAdminClient();
    const result = await syncItem(admin, {
      consultantId: itemRow.consultant_id,
      clientId: itemRow.client_id,
      pluggyItemId: itemRow.pluggy_item_id,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[pluggy/items/sync] erro:", err);
    return NextResponse.json(
      { error: err.message || "Erro ao sincronizar." },
      { status: 500 }
    );
  }
}
