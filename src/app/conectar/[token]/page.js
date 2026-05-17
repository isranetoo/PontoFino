// ============================================================
// /conectar/[token] — fluxo público de Open Finance
//
// O cliente final acessa esta página pelo link enviado pelo
// consultor. Aqui validamos o JWT, buscamos nome do cliente para
// personalizar a tela e renderizamos o widget oficial da Pluggy.
// ============================================================

import { verifyInviteToken } from "@/lib/pluggy/invite-token";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import ConnectClient from "./connect-client";

export const dynamic = "force-dynamic";

export default async function ConnectPage({ params }) {
  const { token } = await params;

  let payload;
  try {
    payload = await verifyInviteToken(token);
  } catch (err) {
    return (
      <ConnectError
        title="Convite inválido"
        message={err?.message || "O link de convite é inválido ou expirou. Peça um novo ao seu consultor."}
      />
    );
  }

  // Admin client porque o cliente final não tem session.
  const supabase = await getSupabaseAdminClient();

  const { data: client } = await supabase
    .from("clients")
    .select("full_name, consultant_id")
    .eq("id", payload.clientId)
    .eq("consultant_id", payload.consultantId)
    .maybeSingle();

  if (!client) {
    return (
      <ConnectError
        title="Convite expirado"
        message="O cliente vinculado a este convite não existe mais. Solicite um novo link ao seu consultor."
      />
    );
  }

  const { data: consultant } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", payload.consultantId)
    .maybeSingle();

  return (
    <ConnectClient
      inviteToken={token}
      clientName={client.full_name}
      consultantName={consultant?.full_name || "Seu consultor"}
    />
  );
}

function ConnectError({ title, message }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-white">
      <div className="max-w-md w-full bg-white/[0.04] border border-white/10 rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/25 mx-auto mb-4 flex items-center justify-center text-red-400 text-xl">⚠</div>
        <h1 className="text-lg font-semibold mb-2">{title}</h1>
        <p className="text-sm text-white/60 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
