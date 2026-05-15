"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { getInitials } from "@/lib/utils";
import { ROLE_CONFIG } from "@/lib/constants";
import { GlassCard, GlassInput, Modal, Spinner, StatCard } from "@/components/ui";
import {
  Users, Shield, UserCheck, KeyRound, UserPlus, Search,
  Trash2, Check, X, Mail, Copy,
} from "lucide-react";

export default function AdminPage() {
  const { profile } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", role: "consultant" });
  const [genPass, setGenPass] = useState("");
  const [copied, setCopied] = useState(false);
  const [invOk, setInvOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [delId, setDelId] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setUsers(data || []);
  }

  async function invite() {
    if (!form.email || !form.full_name) return;
    setLoading(true);

    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.password) {
        setGenPass(data.password);
        setInvOk(true);
        await loadUsers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const reset = () => {
    setShowInvite(false);
    setInvOk(false);
    setGenPass("");
    setForm({ full_name: "", email: "", role: "consultant" });
    setCopied(false);
  };

  const copyCredentials = () => {
    navigator.clipboard?.writeText(`Email: ${form.email}\nSenha temporária: ${genPass}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filtered = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Redirect non-admins
  if (profile?.role !== "admin") {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-white/40">Acesso restrito a administradores.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Painel Admin</h2>
        <p className="text-xs text-white/40 mt-0.5">Gerenciamento de usuários da plataforma</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total" value={users.length} icon={Users} delay={0} />
        <StatCard label="Admins" value={users.filter((u) => u.role === "admin").length} icon={Shield} delay={0.05} />
        <StatCard label="Consultores" value={users.filter((u) => u.role === "consultant").length} icon={UserCheck} delay={0.1} />
        <StatCard label="Pendentes" value={users.filter((u) => u.must_change_password).length} icon={KeyRound} delay={0.15} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input placeholder="Buscar usuário..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/40" />
        </div>
        <button onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all">
          <UserPlus size={15} /> Convidar
        </button>
      </div>

      <GlassCard className="overflow-hidden" delay={0.2}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.05] text-[10px] uppercase tracking-wider text-white/30">
                <th className="text-left py-2.5 px-5">Usuário</th>
                <th className="text-left py-2.5 px-3 hidden sm:table-cell">Role</th>
                <th className="text-left py-2.5 px-3 hidden md:table-cell">Status</th>
                <th className="text-left py-2.5 px-3 hidden lg:table-cell">Último login</th>
                <th className="text-center py-2.5 px-3 w-16" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const rc = ROLE_CONFIG[u.role] || ROLE_CONFIG.consultant;
                return (
                  <tr key={u.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors"
                    style={{ animation: `fadeInUp 0.25s ease ${i * 0.03}s both` }}>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/15 to-violet-500/15 border border-white/10 flex items-center justify-center text-[10px] font-semibold text-white/50">
                          {getInitials(u.full_name || "?")}
                        </div>
                        <div>
                          <p className="font-medium text-white/85 text-sm">{u.full_name}</p>
                          <p className="text-[10px] text-white/30 font-mono">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 hidden sm:table-cell">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-md border ${rc.bg} ${rc.color}`}>
                        <rc.icon size={9} /> {rc.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 hidden md:table-cell">
                      {u.must_change_password ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400">Aguardando</span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Ativo</span>
                      )}
                    </td>
                    <td className="py-3 px-3 hidden lg:table-cell text-xs text-white/30 font-mono">
                      {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString("pt-BR") : "—"}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {u.id !== profile?.id && (
                        delId === u.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => { /* TODO: delete via API */ setDelId(null); }} className="p-1 rounded-md bg-red-500/10 text-red-400"><Check size={13} /></button>
                            <button onClick={() => setDelId(null)} className="p-1 rounded-md text-white/30 hover:text-white/60"><X size={13} /></button>
                          </div>
                        ) : (
                          <button onClick={() => setDelId(u.id)} className="p-1 rounded-md text-white/15 hover:text-red-400 hover:bg-red-500/10 transition-all">
                            <Trash2 size={13} />
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Invite Modal */}
      {showInvite && (
        <Modal title={!invOk ? "Convidar usuário" : undefined} icon={!invOk ? UserPlus : undefined} onClose={reset}>
          {!invOk ? (
            <div className="space-y-3">
              <GlassInput label="Nome" placeholder="João Silva" value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} />
              <GlassInput icon={Mail} label="E-mail" placeholder="joao@consultoria.com" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-white/40 ml-1">Role</label>
                <div className="flex gap-2">
                  {["consultant", "viewer", "admin"].map((r) => {
                    const rc = ROLE_CONFIG[r];
                    const active = form.role === r;
                    return (
                      <button key={r} onClick={() => setForm((p) => ({ ...p, role: r }))}
                        className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-medium border transition-all ${active ? `${rc.bg} ${rc.color}` : "border-white/10 text-white/25 hover:text-white/40"}`}>
                        <rc.icon size={11} /> {rc.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button onClick={invite} disabled={loading || !form.email || !form.full_name}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40">
                {loading ? <Spinner /> : <><UserPlus size={15} /> Criar convite</>}
              </button>
            </div>
          ) : (
            <div className="animate-scale-in">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3">
                  <Check size={20} className="text-emerald-400" />
                </div>
                <h3 className="font-semibold">Convite criado!</h3>
                <p className="text-[10px] text-white/35 mt-1">E-mail enviado para {form.email}</p>
              </div>
              <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 space-y-2">
                <div>
                  <span className="text-[9px] uppercase text-white/25">E-mail</span>
                  <p className="text-xs font-mono text-white/70">{form.email}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-white/25">Senha temporária</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="flex-1 text-xs font-mono text-amber-400 bg-amber-500/[0.05] px-2 py-1 rounded-md border border-amber-500/15">{genPass}</p>
                    <button onClick={copyCredentials}
                      className={`p-1.5 rounded-lg border transition-all ${copied ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "border-white/10 text-white/30 hover:text-white"}`}>
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>
              </div>
              <button onClick={reset} className="w-full mt-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-sm text-white/50 hover:text-white hover:bg-white/10 transition-all">Fechar</button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
