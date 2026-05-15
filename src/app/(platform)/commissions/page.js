"use client";

import { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { COMMISSION_LABELS, COMMISSION_COLORS } from "@/lib/constants";
import { GlassCard, GlassInput, Modal, Spinner, StatCard } from "@/components/ui";
import {
  DollarSign, Users, Target, PieChart, Wallet, Plus,
  Edit3, Trash2, Check, X, Calendar, Filter, Search,
  ChevronLeft, ChevronRight, Download, TrendingUp,
} from "lucide-react";
import * as XLSX from "xlsx";

const TYPES = Object.keys(COMMISSION_LABELS);

function getPeriodLabel(period) {
  if (!period) return "";
  const [y, m] = period.split("-");
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${months[parseInt(m) - 1]}/${y}`;
}

function getCurrentPeriod() {
  return new Date().toISOString().slice(0, 7);
}

function shiftPeriod(period, delta) {
  const [y, m] = period.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return d.toISOString().slice(0, 7);
}

export default function CommissionsPage() {
  const supabase = getSupabaseBrowserClient();

  const [commissions, setCommissions] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [period, setPeriod] = useState(getCurrentPeriod());
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");

  // CRUD
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [delId, setDelId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    client_id: "", type: "management_fee", amount: "",
    reference_period: getCurrentPeriod(), description: "", paid_at: "",
  });

  // ─── Load data ───
  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    const [{ data: commData }, { data: clientData }] = await Promise.all([
      supabase
        .from("commissions")
        .select("*, clients(full_name)")
        .order("created_at", { ascending: false }),
      supabase
        .from("clients")
        .select("id, full_name")
        .eq("is_active", true)
        .order("full_name"),
    ]);
    setCommissions(commData || []);
    setClients(clientData || []);
    setLoading(false);
  }

  // ─── Filtered data ───
  const filtered = useMemo(() => {
    return commissions.filter((c) => {
      const matchPeriod = c.reference_period === period;
      const matchType = filterType === "all" || c.type === filterType;
      const matchSearch = !search ||
        c.clients?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase());
      return matchPeriod && matchType && matchSearch;
    });
  }, [commissions, period, filterType, search]);

  const totalPeriod = filtered.reduce((s, c) => s + Number(c.amount), 0);
  const uniqueClients = new Set(filtered.map((c) => c.client_id)).size;

  // By type breakdown
  const byType = useMemo(() => {
    return Object.entries(
      filtered.reduce((acc, c) => {
        acc[c.type] = (acc[c.type] || 0) + Number(c.amount);
        return acc;
      }, {})
    )
      .map(([type, amount]) => ({ type, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filtered]);

  // Last 6 months chart
  const chartData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      months.push(shiftPeriod(period, -i));
    }
    return months.map((m) => ({
      mes: getPeriodLabel(m),
      periodo: m,
      total: commissions
        .filter((c) => c.reference_period === m)
        .reduce((s, c) => s + Number(c.amount), 0),
    }));
  }, [commissions, period]);

  // ─── CRUD operations ───
  async function addCommission() {
    if (!form.client_id || !form.amount) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("commissions").insert({
      consultant_id: user.id,
      client_id: form.client_id,
      type: form.type,
      amount: parseFloat(form.amount) || 0,
      reference_period: form.reference_period,
      description: form.description,
      paid_at: form.paid_at || null,
    });
    resetForm();
    setShowAdd(false);
    await loadAll();
    setSaving(false);
  }

  async function updateCommission() {
    if (!showEdit || !form.amount) return;
    setSaving(true);
    await supabase.from("commissions").update({
      client_id: form.client_id,
      type: form.type,
      amount: parseFloat(form.amount) || 0,
      reference_period: form.reference_period,
      description: form.description,
      paid_at: form.paid_at || null,
    }).eq("id", showEdit);
    resetForm();
    setShowEdit(null);
    await loadAll();
    setSaving(false);
  }

  async function deleteCommission(id) {
    await supabase.from("commissions").delete().eq("id", id);
    setDelId(null);
    await loadAll();
  }

  function openEdit(c) {
    setForm({
      client_id: c.client_id,
      type: c.type,
      amount: String(c.amount),
      reference_period: c.reference_period,
      description: c.description || "",
      paid_at: c.paid_at ? c.paid_at.slice(0, 10) : "",
    });
    setShowEdit(c.id);
  }

  function resetForm() {
    setForm({
      client_id: "", type: "management_fee", amount: "",
      reference_period: period, description: "", paid_at: "",
    });
  }

  // ─── Export ───
  function exportXlsx() {
    const data = filtered.map((c) => ({
      Cliente: c.clients?.full_name || "",
      Tipo: COMMISSION_LABELS[c.type] || c.type,
      "Valor (R$)": Number(c.amount),
      Período: c.reference_period,
      Descrição: c.description || "",
      "Data Pagamento": c.paid_at ? new Date(c.paid_at).toLocaleDateString("pt-BR") : "",
    }));
    data.push({ Cliente: "TOTAL", Tipo: "", "Valor (R$)": totalPeriod, Período: "", Descrição: "", "Data Pagamento": "" });
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [{ wch: 25 }, { wch: 16 }, { wch: 14 }, { wch: 10 }, { wch: 30 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Comissões");
    XLSX.writeFile(wb, `comissoes_${period}.xlsx`);
  }

  const TT = { background: "rgba(15,15,40,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Spinner size={28} /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Comissões</h2>
          <p className="text-xs text-white/40 mt-0.5">Controle de receita por cliente e tipo</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportXlsx} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white/40 hover:text-white/70 transition-all">
            <Download size={13} /> Exportar
          </button>
          <button onClick={() => { resetForm(); setForm((p) => ({ ...p, reference_period: period })); setShowAdd(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <Plus size={15} /> Nova comissão
          </button>
        </div>
      </div>

      {/* Period navigator */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={() => setPeriod(shiftPeriod(period, -1))} className="p-2 rounded-lg bg-white/[0.04] border border-white/10 text-white/40 hover:text-white/70 transition-all">
          <ChevronLeft size={16} />
        </button>
        <div className="text-center min-w-[140px]">
          <p className="text-lg font-bold">{getPeriodLabel(period)}</p>
          <p className="text-[10px] text-white/30">{period}</p>
        </div>
        <button onClick={() => setPeriod(shiftPeriod(period, 1))} className="p-2 rounded-lg bg-white/[0.04] border border-white/10 text-white/40 hover:text-white/70 transition-all">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Receita do período" value={formatCurrency(totalPeriod)} icon={DollarSign} delay={0} />
        <StatCard label="Clientes pagantes" value={uniqueClients} icon={Users} delay={0.05} />
        <StatCard label="Ticket médio" value={formatCurrency(totalPeriod / (uniqueClients || 1))} icon={Target} delay={0.1} />
        <StatCard label="Lançamentos" value={filtered.length} icon={Wallet} delay={0.15} />
      </div>

      {/* Chart + Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart */}
        <GlassCard className="lg:col-span-2 p-5" delay={0.2}>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={14} className="text-indigo-400" /> Evolução (6 meses)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="mes" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={TT} formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="total" fill="#818cf8" radius={[4, 4, 0, 0]} name="Receita"
                onClick={(d) => d?.periodo && setPeriod(d.periodo)} cursor="pointer" />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Breakdown by type */}
        <GlassCard className="p-5" delay={0.25}>
          <h3 className="text-sm font-semibold mb-4">Por tipo</h3>
          {byType.length > 0 ? (
            <div className="space-y-3">
              {byType.map((t, i) => (
                <div key={t.type} style={{ animation: `fadeInUp 0.25s ease ${i * 0.05}s both` }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs ${(COMMISSION_COLORS[t.type] || "text-gray-400").split(" ")[0]}`}>
                      {COMMISSION_LABELS[t.type] || t.type}
                    </span>
                    <span className="text-xs font-mono text-white/60">{formatCurrency(t.amount)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                      style={{ width: `${totalPeriod > 0 ? (t.amount / totalPeriod) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-white/25 py-4 text-center">Sem dados neste período.</p>
          )}
        </GlassCard>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input placeholder="Buscar cliente ou descrição..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/40" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setFilterType("all")}
            className={`px-3 py-2 rounded-lg text-[10px] font-medium border transition-all ${filterType === "all" ? "bg-indigo-500/15 border-indigo-500/20 text-indigo-300" : "border-white/10 text-white/30 hover:text-white/50"}`}>
            Todos
          </button>
          {TYPES.map((t) => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-3 py-2 rounded-lg text-[10px] font-medium border transition-all ${filterType === t ? "bg-indigo-500/15 border-indigo-500/20 text-indigo-300" : "border-white/10 text-white/30 hover:text-white/50"}`}>
              {COMMISSION_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <GlassCard className="overflow-hidden" delay={0.3}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.05] text-[10px] uppercase tracking-wider text-white/30">
                <th className="text-left py-2.5 px-5">Cliente</th>
                <th className="text-left py-2.5 px-3">Tipo</th>
                <th className="text-right py-2.5 px-3">Valor</th>
                <th className="text-left py-2.5 px-3 hidden sm:table-cell">Descrição</th>
                <th className="text-center py-2.5 px-3 hidden md:table-cell">Pago</th>
                <th className="text-center py-2.5 px-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-white/25 text-sm">Nenhuma comissão neste período.</td></tr>
              ) : (
                filtered.map((c, i) => (
                  <tr key={c.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors"
                    style={{ animation: `fadeInUp 0.25s ease ${i * 0.03}s both` }}>
                    <td className="py-2.5 px-5 text-xs text-white/80">{c.clients?.full_name || "—"}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md border font-medium ${COMMISSION_COLORS[c.type] || COMMISSION_COLORS.other}`}>
                        {COMMISSION_LABELS[c.type] || c.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-xs text-emerald-400">{formatCurrency(Number(c.amount))}</td>
                    <td className="py-2.5 px-3 text-xs text-white/35 hidden sm:table-cell truncate max-w-[200px]">{c.description || "—"}</td>
                    <td className="py-2.5 px-3 text-center hidden md:table-cell">
                      {c.paid_at ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          {new Date(c.paid_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400">Pendente</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {delId === c.id ? (
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => deleteCommission(c.id)} className="p-1 rounded-md bg-red-500/10 text-red-400"><Check size={12} /></button>
                          <button onClick={() => setDelId(null)} className="p-1 rounded-md text-white/30"><X size={12} /></button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openEdit(c)} className="p-1 rounded-md text-white/15 hover:text-white/50 hover:bg-white/[0.05] transition-all"><Edit3 size={12} /></button>
                          <button onClick={() => setDelId(c.id)} className="p-1 rounded-md text-white/15 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={12} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="border-t border-white/10 bg-white/[0.02]">
                  <td className="py-2.5 px-5 text-xs font-semibold text-white/40 uppercase">Total</td>
                  <td className="py-2.5 px-3 text-[10px] text-white/25">{filtered.length} lançamentos</td>
                  <td className="py-2.5 px-3 text-right font-mono text-xs font-semibold text-emerald-400">{formatCurrency(totalPeriod)}</td>
                  <td className="hidden sm:table-cell" /><td className="hidden md:table-cell" /><td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </GlassCard>

      {/* Add / Edit Modal */}
      {(showAdd || showEdit) && (
        <Modal
          title={showEdit ? "Editar comissão" : "Nova comissão"}
          icon={showEdit ? Edit3 : Plus}
          onClose={() => { setShowAdd(false); setShowEdit(null); resetForm(); }}
        >
          <div className="space-y-3">
            {/* Client */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-white/40 ml-1">Cliente</label>
              <select value={form.client_id} onChange={(e) => setForm((p) => ({ ...p, client_id: e.target.value }))}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40">
                <option value="" className="bg-slate-900">Selecione</option>
                {clients.map((c) => <option key={c.id} value={c.id} className="bg-slate-900">{c.full_name}</option>)}
              </select>
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-white/40 ml-1">Tipo</label>
              <div className="grid grid-cols-3 gap-1.5">
                {TYPES.map((t) => (
                  <button key={t} onClick={() => setForm((p) => ({ ...p, type: t }))}
                    className={`py-2 rounded-lg text-[10px] font-medium border transition-all ${form.type === t
                      ? COMMISSION_COLORS[t] + " border-current"
                      : "border-white/10 text-white/25 hover:text-white/40"}`}>
                    {COMMISSION_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount + Period */}
            <div className="grid grid-cols-2 gap-3">
              <GlassInput icon={DollarSign} label="Valor (R$)" placeholder="5000" type="number"
                value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} />
              <GlassInput icon={Calendar} label="Período" type="month"
                value={form.reference_period} onChange={(e) => setForm((p) => ({ ...p, reference_period: e.target.value }))} />
            </div>

            {/* Description */}
            <GlassInput label="Descrição" placeholder="Taxa administração 0.5% a.a."
              value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />

            {/* Paid at */}
            <GlassInput label="Data pagamento (opcional)" type="date"
              value={form.paid_at} onChange={(e) => setForm((p) => ({ ...p, paid_at: e.target.value }))} />

            {/* Submit */}
            <button
              onClick={showEdit ? updateCommission : addCommission}
              disabled={!form.client_id || !form.amount || saving}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40">
              {saving ? <Spinner /> : showEdit
                ? <><Check size={15} /> Salvar alterações</>
                : <><Plus size={15} /> Registrar comissão</>}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
