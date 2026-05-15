"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatCurrency, getInitials } from "@/lib/utils";
import { RISK_LABELS } from "@/lib/constants";
import { GlassCard, GlassInput, Modal, Spinner } from "@/components/ui";
import { Users, UserPlus, Search, Mail, Phone, User, Plus, X } from "lucide-react";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", risk_profile: "moderate",
  });

  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    setLoading(true);
    const { data } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });
    setClients(data || []);
    setLoading(false);
  }

  async function addClient() {
    if (!form.full_name) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("clients").insert({
      ...form,
      consultant_id: user.id,
    });
    if (!error) {
      await loadClients();
      setForm({ full_name: "", email: "", phone: "", risk_profile: "moderate" });
      setShowAdd(false);
    }
    setSaving(false);
  }

  const filtered = clients.filter(
    (c) =>
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Clientes</h2>
          <p className="text-xs text-white/40 mt-0.5">
            {clients.filter((c) => c.is_active).length} ativos · {clients.length} total
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <UserPlus size={15} /> Novo cliente
        </button>
      </div>

      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
        <input
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
        />
      </div>

      <GlassCard className="overflow-hidden" delay={0.1}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-white/30">
                <th className="text-left py-3 px-5">Cliente</th>
                <th className="text-left py-3 px-3 hidden sm:table-cell">Contato</th>
                <th className="text-left py-3 px-3">Perfil</th>
                <th className="text-center py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <Spinner />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-white/25 text-sm">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                    style={{ animation: `fadeInUp 0.3s ease ${i * 0.03}s both` }}
                  >
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/15 to-violet-500/15 border border-white/10 flex items-center justify-center text-[10px] font-semibold text-white/50">
                          {getInitials(c.full_name)}
                        </div>
                        <div>
                          <p className="font-medium text-white/85">{c.full_name}</p>
                          <p className="text-[10px] text-white/30 font-mono sm:hidden">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 hidden sm:table-cell">
                      <p className="text-xs text-white/50 font-mono">{c.email}</p>
                      <p className="text-[10px] text-white/30">{c.phone}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-white/50">
                        {RISK_LABELS[c.risk_profile] || c.risk_profile}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {c.is_active ? (
                        <span className="text-[9px] px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          Ativo
                        </span>
                      ) : (
                        <span className="text-[9px] px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400">
                          Inativo
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Add client modal */}
      {showAdd && (
        <Modal title="Novo cliente" icon={UserPlus} onClose={() => setShowAdd(false)}>
          <div className="space-y-3">
            <GlassInput icon={User} label="Nome completo" placeholder="João Silva" value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} />
            <GlassInput icon={Mail} label="E-mail" placeholder="joao@email.com" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            <GlassInput icon={Phone} label="Telefone" placeholder="(11) 99999-0000" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-white/40 ml-1">Perfil de risco</label>
              <select value={form.risk_profile} onChange={(e) => setForm((p) => ({ ...p, risk_profile: e.target.value }))} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40">
                {Object.entries(RISK_LABELS).map(([k, v]) => (
                  <option key={k} value={k} className="bg-slate-900">{v}</option>
                ))}
              </select>
            </div>
            <button onClick={addClient} disabled={!form.full_name || saving} className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40">
              {saving ? <Spinner /> : <><Plus size={15} /> Cadastrar</>}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
