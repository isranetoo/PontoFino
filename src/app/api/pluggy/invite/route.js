// ============================================================
// POST /api/pluggy/invite
//
// Autenticado pelo consultor (cookie Supabase).
// Recebe { clientId, sendEmail? }, valida que o cliente pertence
// ao consultor, gera um JWT de convite e retorna a URL.
// Se sendEmail=true e o cliente tem e-mail, envia o link via Resend.
// ============================================================

import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { signInviteToken } from "@/lib/pluggy/invite-token";

export async function POST(request) {
  try {
    const { clientId, sendEmail = false } = await request.json();

    if (!clientId) {
      return NextResponse.json({ error: "clientId é obrigatório." }, { status: 400 });
    }

    const supabase = await getSupabaseServerClient();

    // Sessão obrigatória. RLS já garante que o consultor só vê os clientes dele,
    // mas verificar a auth aqui dá uma mensagem de erro melhor que um 200 vazio.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    // RLS: select_clients_own só devolve cliente do próprio consultor.
    const { data: client, error: clientErr } = await supabase
      .from("clients")
      .select("id, full_name, email")
      .eq("id", clientId)
      .single();

    if (clientErr || !client) {
      return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
    }

    const token = await signInviteToken({
      clientId: client.id,
      consultantId: user.id,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const url = `${appUrl.replace(/\/$/, "")}/conectar/${token}`;

    let emailed = false;
    if (sendEmail && client.email) {
      emailed = await sendInviteEmail({
        toEmail: client.email,
        toName: client.full_name,
        url,
      });
    }

    return NextResponse.json({
      url,
      token,
      expiresInDays: 7,
      emailed,
      clientEmail: client.email || null,
    });
  } catch (err) {
    console.error("[pluggy/invite] erro:", err);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}

async function sendInviteEmail({ toEmail, toName, url }) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return false;

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "PontoFino";

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);

    await resend.emails.send({
      from: `${appName} <${fromEmail}>`,
      to: toEmail,
      subject: `${appName} — Conecte suas contas com segurança`,
      html: inviteEmailHtml({ toName, url, appName }),
    });
    return true;
  } catch (emailErr) {
    console.error("[pluggy/invite] envio de e-mail falhou:", emailErr);
    return false;
  }
}

function inviteEmailHtml({ toName, url, appName }) {
  return `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #0f0f2d; color: #e2e8f0; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 12px; line-height: 48px; font-size: 22px;">🔒</div>
        <h1 style="font-size: 20px; margin: 12px 0 4px; color: white;">${appName}</h1>
        <p style="font-size: 13px; color: #94a3b8; margin: 0;">Convite para conectar contas</p>
      </div>

      <p style="font-size: 14px; color: #cbd5e1;">Olá, <strong style="color: white;">${toName || "cliente"}</strong>!</p>

      <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
        Seu consultor está utilizando uma integração de <strong>Open Finance</strong> para acompanhar
        suas posições de investimento sem precisar pedir extratos manualmente. Para autorizar a leitura
        (somente leitura — nada de movimentação), clique no botão abaixo:
      </p>

      <a href="${url}" style="display: block; text-align: center; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 24px; border-radius: 12px; text-decoration: none; font-size: 14px; font-weight: 600; margin: 24px 0;">Conectar minhas contas</a>

      <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 14px; margin: 20px 0;">
        <p style="font-size: 11px; color: #94a3b8; margin: 0 0 6px;">Se o botão não funcionar, copie o link abaixo:</p>
        <p style="font-size: 11px; color: #cbd5e1; word-break: break-all; margin: 0; font-family: monospace;">${url}</p>
      </div>

      <p style="font-size: 12px; color: #94a3b8; line-height: 1.6;">
        Este link expira em <strong>7 dias</strong>. A autorização é feita pelo banco/corretora; nem
        nós nem seu consultor jamais vemos sua senha.
      </p>

      <p style="font-size: 11px; color: #475569; text-align: center; margin-top: 24px;">E-mail automático. Não responda.</p>
    </div>
  `;
}
