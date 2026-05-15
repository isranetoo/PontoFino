"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { GlassInput, PasswordInput, Spinner } from "@/components/ui";
import { BarChart3, Mail, LogIn, AlertTriangle, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Preencha todos os campos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signIn(email, password);

      // Initialize profile data
      await useAuthStore.getState().initialize();

      const profile = useAuthStore.getState().profile;

      if (profile?.must_change_password) {
        router.push("/change-password");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("E-mail ou senha incorretos");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
        className="w-full max-w-[380px]"
        style={{ animation: "fadeInUp 0.5s ease both" }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 mb-4">
            <BarChart3 size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Rebalanceador</h1>
          <p className="text-sm text-white/40 mt-1">Plataforma de consultoria</p>
        </div>

        {/* Login card */}
        <div
          className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
          style={shake ? { animation: "shake 0.4s ease" } : {}}
        >
          <div className="space-y-4">
            <GlassInput
              icon={Mail}
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />

            <PasswordInput
              label="Senha"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />

            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/[0.06] border border-red-500/15 text-red-400 text-xs animate-fade-in">
                <AlertTriangle size={13} />
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? <Spinner /> : <><LogIn size={15} /> Entrar</>}
            </button>
          </div>

          <p className="text-center text-[9px] text-white/15 mt-4">
            Acesso restrito · Credenciais via administrador
          </p>
        </div>
      </div>
    </div>
  );
}
