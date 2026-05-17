"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { ShieldCheck, Eye, Lock, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

// O SDK da Pluggy depende de `window`, então só carrega no client.
const PluggyConnect = dynamic(
  () => import("react-pluggy-connect").then((m) => m.PluggyConnect),
  { ssr: false }
);

const STAGE = {
  CONSENT: "consent",
  LOADING_TOKEN: "loading-token",
  WIDGET: "widget",
  SYNCING: "syncing",
  SUCCESS: "success",
  ERROR: "error",
};

export default function ConnectClient({ inviteToken, clientName, consultantName }) {
  const [stage, setStage] = useState(STAGE.CONSENT);
  const [errorMessage, setErrorMessage] = useState("");
  const [accessToken, setAccessToken] = useState(null);

  const handleAuthorize = useCallback(async () => {
    setStage(STAGE.LOADING_TOKEN);
    setErrorMessage("");
    try {
      const res = await fetch("/api/pluggy/connect-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteToken }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao obter token de conexão.");
      setAccessToken(json.accessToken);
      setStage(STAGE.WIDGET);
    } catch (err) {
      setErrorMessage(err.message);
      setStage(STAGE.ERROR);
    }
  }, [inviteToken]);

  const handleWidgetSuccess = useCallback(async ({ item }) => {
    setStage(STAGE.SYNCING);
    try {
      const res = await fetch("/api/pluggy/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteToken, itemId: item.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao sincronizar.");
      setStage(STAGE.SUCCESS);
    } catch (err) {
      setErrorMessage(err.message);
      setStage(STAGE.ERROR);
    }
  }, [inviteToken]);

  const handleWidgetError = useCallback((error) => {
    setErrorMessage(error?.message || "A conexão foi interrompida.");
    setStage(STAGE.ERROR);
  }, []);

  const handleWidgetClose = useCallback(() => {
    // Cliente fechou o widget antes de terminar. Volta para consent.
    if (stage === STAGE.WIDGET) setStage(STAGE.CONSENT);
  }, [stage]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        {stage === STAGE.CONSENT && (
          <ConsentScreen
            clientName={clientName}
            consultantName={consultantName}
            onAuthorize={handleAuthorize}
          />
        )}

        {stage === STAGE.LOADING_TOKEN && (
          <StatusScreen icon={Loader2} title="Preparando conexão segura..." spin />
        )}

        {stage === STAGE.WIDGET && accessToken && (
          <>
            <StatusScreen
              icon={Loader2}
              title="Selecione sua instituição"
              subtitle="Uma janela segura da Pluggy abrirá em seguida."
              spin
            />
            <PluggyConnect
              connectToken={accessToken}
              includeSandbox={process.env.NEXT_PUBLIC_PLUGGY_INCLUDE_SANDBOX === "true"}
              countries={["BR"]}
              language="pt"
              theme="dark"
              onSuccess={handleWidgetSuccess}
              onError={handleWidgetError}
              onClose={handleWidgetClose}
            />
          </>
        )}

        {stage === STAGE.SYNCING && (
          <StatusScreen
            icon={Loader2}
            title="Conectado! Importando suas posições..."
            subtitle="Isso pode levar alguns segundos."
            spin
          />
        )}

        {stage === STAGE.SUCCESS && (
          <SuccessScreen consultantName={consultantName} />
        )}

        {stage === STAGE.ERROR && (
          <ErrorScreen
            message={errorMessage}
            onRetry={() => {
              setErrorMessage("");
              setStage(STAGE.CONSENT);
            }}
          />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Telas
// ─────────────────────────────────────────────────────────────

function ConsentScreen({ clientName, consultantName, onAuthorize }) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center">
          <ShieldCheck size={20} className="text-indigo-400" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/40">Open Finance</p>
          <h1 className="text-lg font-semibold">Conectar suas contas</h1>
        </div>
      </div>

      <p className="text-sm text-white/70 leading-relaxed mb-5">
        Olá, <strong className="text-white">{clientName}</strong>. <strong className="text-white">{consultantName}</strong>{" "}
        está te convidando a autorizar a leitura das suas posições de investimento para acompanhamento
        de carteira.
      </p>

      <div className="space-y-3 mb-6">
        <ConsentPoint
          icon={Eye}
          title="Somente leitura"
          text="A autorização permite ler saldos e posições. Não é possível fazer transferências, resgates ou alterações."
        />
        <ConsentPoint
          icon={Lock}
          title="Sua senha não passa por aqui"
          text="A autenticação acontece diretamente no banco/corretora. Nem o consultor nem o PontoFino têm acesso à sua senha."
        />
        <ConsentPoint
          icon={ShieldCheck}
          title="Conexão criptografada (Pluggy)"
          text="Usamos a Pluggy, plataforma regulamentada de Open Finance, para intermediar a conexão com a instituição financeira."
        />
      </div>

      <button
        onClick={onAuthorize}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold hover:opacity-95 transition-all"
      >
        Autorizar e conectar
      </button>

      <p className="text-[11px] text-white/35 text-center mt-4 leading-relaxed">
        Você pode revogar o acesso a qualquer momento pelo seu consultor ou diretamente na instituição.
      </p>
    </div>
  );
}

function ConsentPoint({ icon: Icon, title, text }) {
  return (
    <div className="flex gap-3 items-start">
      <Icon size={15} className="text-emerald-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs font-semibold text-white">{title}</p>
        <p className="text-[11px] text-white/55 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function StatusScreen({ icon: Icon, title, subtitle, spin }) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-10 text-center">
      <Icon size={28} className={`text-indigo-400 mx-auto mb-4 ${spin ? "animate-spin" : ""}`} />
      <p className="text-sm font-semibold text-white">{title}</p>
      {subtitle && <p className="text-xs text-white/50 mt-1">{subtitle}</p>}
    </div>
  );
}

function SuccessScreen({ consultantName }) {
  return (
    <div className="bg-white/[0.04] border border-emerald-500/20 rounded-2xl p-10 text-center">
      <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 mx-auto mb-4 flex items-center justify-center">
        <CheckCircle size={26} className="text-emerald-400" />
      </div>
      <h1 className="text-base font-semibold text-white mb-2">Pronto! Suas contas estão conectadas.</h1>
      <p className="text-sm text-white/60 leading-relaxed">
        Suas posições foram importadas e estão disponíveis para <strong className="text-white">{consultantName}</strong> acompanhar.
        Você pode fechar esta página.
      </p>
    </div>
  );
}

function ErrorScreen({ message, onRetry }) {
  return (
    <div className="bg-white/[0.04] border border-red-500/20 rounded-2xl p-10 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/25 mx-auto mb-4 flex items-center justify-center">
        <AlertTriangle size={26} className="text-red-400" />
      </div>
      <h1 className="text-base font-semibold text-white mb-2">Algo deu errado</h1>
      <p className="text-sm text-white/60 leading-relaxed mb-5">
        {message || "Não foi possível concluir a conexão. Tente novamente em instantes."}
      </p>
      <button
        onClick={onRetry}
        className="px-5 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-sm text-white/80 hover:bg-white/[0.1] transition-all"
      >
        Tentar de novo
      </button>
    </div>
  );
}
