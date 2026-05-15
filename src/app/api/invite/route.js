import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { generatePassword } from "@/lib/utils";

export async function POST(request) {
  try {
    const { full_name, email, role } = await request.json();

    if (!full_name || !email) {
      return NextResponse.json(
        { error: "Nome e e-mail são obrigatórios" },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseAdminClient();
    const password = generatePassword(12);

    // Create user in Supabase Auth (bypasses RLS with service role)
    const { data: userData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Skip email confirmation
        user_metadata: {
          full_name,
          role: role || "consultant",
          must_change_password: true,
        },
      });

    if (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // Send welcome email via Resend
    try {
      const resendKey = process.env.RESEND_API_KEY;
      const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
      const appName = process.env.NEXT_PUBLIC_APP_NAME || "Rebalanceador";
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      if (resendKey) {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);

        await resend.emails.send({
          from: `${appName} <${fromEmail}>`,
          to: email,
          subject: `Bem-vindo ao ${appName} — Suas credenciais de acesso`,
          html: `
            <div style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #0f0f2d; color: #e2e8f0; border-radius: 16px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 12px; line-height: 48px; font-size: 20px; color: white;">📊</div>
                <h1 style="font-size: 20px; margin: 12px 0 4px; color: white;">${appName}</h1>
                <p style="font-size: 13px; color: #94a3b8; margin: 0;">Plataforma de Consultoria</p>
              </div>

              <p style="font-size: 14px; color: #cbd5e1;">Olá, <strong style="color: white;">${full_name}</strong>!</p>
              <p style="font-size: 14px; color: #cbd5e1;">Sua conta foi criada. Use as credenciais abaixo para acessar a plataforma:</p>

              <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px; margin: 20px 0;">
                <p style="font-size: 12px; color: #64748b; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px;">E-mail</p>
                <p style="font-size: 14px; color: white; margin: 0 0 12px; font-family: monospace;">${email}</p>
                <p style="font-size: 12px; color: #64748b; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px;">Senha temporária</p>
                <p style="font-size: 16px; color: #fbbf24; margin: 0; font-family: monospace; background: rgba(251,191,36,0.05); padding: 8px; border-radius: 8px; border: 1px solid rgba(251,191,36,0.15);">${password}</p>
              </div>

              <p style="font-size: 13px; color: #94a3b8;">⚠️ Você precisará trocar a senha no primeiro login.</p>

              <a href="${appUrl}/login" style="display: block; text-align: center; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-size: 14px; font-weight: 600; margin-top: 20px;">Acessar a plataforma</a>

              <p style="font-size: 11px; color: #475569; text-align: center; margin-top: 24px;">Este é um e-mail automático. Não responda.</p>
            </div>
          `,
        });
      }
    } catch (emailError) {
      // Log but don't fail — user was already created
      console.error("Email send error:", emailError);
    }

    return NextResponse.json({
      success: true,
      password,
      userId: userData.user?.id,
    });
  } catch (err) {
    console.error("Invite error:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
