"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { PasswordInput, PasswordStrength, Spinner } from "@/components/ui";
import { KeyRound, ShieldCheck, AlertTriangle } from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { profile, updatePassword } = useAuthStore();
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isValid =
    newPass.length >= 8 &&
    /[A-Z]/.test(newPass) &&
    /\d/.test(newPass) &&
    newPass === confirmPass &&
    confirmPass.length > 0;

  const handleSubmit = async () => {
    if (newPass !== confirmPass) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await updatePassword(newPass);
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      setError(err.message || "Erro ao alterar senha");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-scale-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#34d399"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-bold">Senha atualizada!</h2>
          <p className="text-sm text-white/40 mt-1">Entrando na plataforma...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
        className="w-full max-w-[380px]"
        style={{ animation: "fadeInUp 0.5s ease both" }}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25 mb-4">
            <KeyRound size={24} />
          </div>
          <h1 className="text-xl font-bold">Primeiro acesso</h1>
          <p className="text-sm text-white/40 mt-1">
            Olá, <span className="text-white/60">{profile?.full_name}</span>!
            Defina sua nova senha.
          </p>
        </div>

        <div className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
          <PasswordInput
            label="Nova senha"
            placeholder="Mínimo 8 caracteres"
            value={newPass}
            onChange={(e) => {
              setNewPass(e.target.value);
              setError("");
            }}
          />

          {newPass && <PasswordStrength password={newPass} />}

          <PasswordInput
            label="Confirmar senha"
            placeholder="Repita a nova senha"
            value={confirmPass}
            onChange={(e) => {
              setConfirmPass(e.target.value);
              setError("");
            }}
            error={
              confirmPass && newPass !== confirmPass
                ? "Senhas diferentes"
                : ""
            }
            onKeyDown={(e) => e.key === "Enter" && isValid && handleSubmit()}
          />

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/[0.06] border border-red-500/15 text-red-400 text-xs">
              <AlertTriangle size={13} />
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40"
          >
            {loading ? (
              <Spinner />
            ) : (
              <>
                <ShieldCheck size={15} /> Definir senha
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
