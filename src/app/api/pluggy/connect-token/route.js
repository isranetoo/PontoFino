// ============================================================
// POST /api/pluggy/connect-token
//
// Chamado pela página pública /conectar/[token].
// Valida o JWT de convite e devolve um connect token da Pluggy
// que o widget usa para autenticar o cliente final.
//
// Sem session do Supabase — o JWT é a única credencial.
// ============================================================

import { NextResponse } from "next/server";
import { verifyInviteToken } from "@/lib/pluggy/invite-token";
import { createConnectToken } from "@/lib/pluggy/client";

export async function POST(request) {
  try {
    const { inviteToken } = await request.json();

    let payload;
    try {
      payload = await verifyInviteToken(inviteToken);
    } catch (err) {
      return NextResponse.json(
        { error: err.message || "Convite inválido." },
        { status: 401 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const webhookUrl = `${appUrl.replace(/\/$/, "")}/api/pluggy/webhook`;

    const { accessToken } = await createConnectToken({
      // Usamos clientId do PontoFino como clientUserId na Pluggy.
      // Isso facilita auditoria do lado deles e correlaciona itens.
      clientUserId: payload.clientId,
      webhookUrl,
    });

    return NextResponse.json({ accessToken });
  } catch (err) {
    console.error("[pluggy/connect-token] erro:", err);
    return NextResponse.json(
      { error: "Não foi possível iniciar a conexão. Tente novamente em instantes." },
      { status: 500 }
    );
  }
}
