"use client";

import { useState, useEffect, useMemo } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { COMMISSION_LABELS } from "@/lib/constants";
import {
  nextInvoiceNumber, computeTotals, visualStatus, isoToday, addDaysISO,
} from "@/lib/invoices";
import { GlassCard, Modal, Spinner, StatCard } from "@/components/ui";
import {
  Receipt, Plus, Search, Filter, FileText, CheckCircle2, Clock,
  AlertTriangle, XCircle, Trash2, Eye, Printer,
  DollarSign, Calendar, Check, X as XIcon,
} from "lucide-react";

const STATUS_CONFIG = {
  pendente:   { label: "Pendente",  pill: "bg-amber-500/15 text-amber-300 border-amber-500/20",     icon: Clock },
  vencida:    { label: "Vencida",   pill: "bg-rose-500/15 text-rose-300 border-rose-500/20",        icon: AlertTriangle },
  paga:       { label: "Paga",      pill: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20", icon: CheckCircle2 },
  cancelada:  { label: "Cancelada", pill: "bg-slate-500/15 text-slate-300 border-slate-500/20",     icon: XCircle },
};

const STATUS_FILTER_OPTIONS = [
  { key: "all",        label: "Todas" },
  { key: "pendente",   label: "Pendentes" },
  { key: "vencida",    label: "Vencidas" },
  { key: "paga",       label: "Pagas" },
  { key: "cancelada",  label: "Canceladas" },
];

export default function FaturamentoPage() {
  const supabase = getSupabaseBrowserClient();

  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loadingInit, setLoadingInit] = useState(true);

  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("");
  const [search, setSearch] = useState("");

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [formClient, setFormClient] = useState("");
  const [unbilledCommissions, setUnbilledCommissions] = useState([]);
  const [selectedCommissionIds, setSelectedCommissionIds] = useState(new Set());
  const [manualItems, setManualItems] = useState([]); // [{description, amount}]
  const [issuedAt, setIssuedAt] = useState(isoToday());
  const [dueAt, setDueAt] = useState(addDaysISO(15));
  const [taxPct, setTaxPct] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState("");
  const [loadingCommissions, setLoadingCommissions] = useState(false);

  // View modal
  const [viewInvoice, setViewInvoice] = useState(null);
  const [viewItems, setViewItems] = useState([]);
  const [loadingView, setLoadingView] = useState(false);

  // ─── Init ───
  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function init() {
    setLoadingInit(true);
    const [cRes, iRes] = await Promise.all([
      supabase.from("clients").select("id, full_name").eq("is_active", true).order("full_name"),
      supabase
        .from("invoices")
        .select("*, clients(full_name)")
        .order("issued_at", { ascending: false })
        .limit(300),
    ]);
    setClients(cRes.data || []);
    setInvoices(iRes.data || []);
    setLoadingInit(false);
  }

  async function reloadInvoices() {
    const { data } = await supabase
      .from("invoices")
      .select("*, clients(full_name)")
      .order("issued_at", { ascending: false })
      .limit(300);
    setInvoices(data || []);
  }

  // ─── Stats ───
  const stats = useMemo(() => {
    const visStatus = (i) => visualStatus(i);
    const active = invoices.filter((i) => i.status !== "cancelada");
    const totalIssued = active.reduce((s, i) => s + Number(i.total || 0), 0);
    const paid = active.filter((i) => visStatus(i) === "paga").reduce((s, i) => s + Number(i.total || 0), 0);
    const pending = active.filter((i) => visStatus(i) === "pendente").reduce((s, i) => s + Number(i.total || 0), 0);
    const overdue = active.filter((i) => visStatus(i) === "vencida").reduce((s, i) => s + Number(i.total || 0), 0);
    return { totalIssued, paid, pending, overdue };
  }, [invoices]);

  // ─── Filtered list ───
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return invoices.filter((i) => {
      const status = visualStatus(i);
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (clientFilter && i.client_id !== clientFilter) return false;
      if (term) {
        const hay = `${i.number} ${i.clients?.full_name || ""} ${i.notes || ""}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [invoices, statusFilter, clientFilter, search]);

  // ─── Create flow ───
  function openCreate() {
    setFormClient("");
    setUnbilledCommissions([]);
    setSelectedCommissionIds(new Set());
    setManualItems([]);
    setIssuedAt(isoToday());
    setDueAt(addDaysISO(15));
    setTaxPct("0");
    setPaymentMethod("");
    setInvoiceNotes("");
    setCreateError("");
    setShowCreate(true);
  }

  async function loadUnbilledFor(clientId) {
    if (!clientId) { setUnbilledCommissions([]); return; }
    setLoadingCommissions(true);

    // Pega todas comissões do cliente
    const { data: comms } = await supabase
      .from("commissions")
      .select("id, type, amount, reference_period, description, paid_at, created_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    // Pega ids que já estão em invoice_items
    const ids = (comms || []).map((c) => c.id);
    let used = new Set();
    if (ids.length > 0) {
      const { data: usedItems } = await supabase
        .from("invoice_items")
        .select("commission_id")
        .in("commission_id", ids);
      used = new Set((usedItems || []).map((i) => i.commission_id));
    }

    setUnbilledCommissions((comms || []).filter((c) => !used.has(c.id)));
    setLoadingCommissions(false);
  }

  useEffect(() => {
    loadUnbilledFor(formClient);
    setSelectedCommissionIds(new Set());
  }, [formClient]);

  function toggleCommission(id) {
    setSelectedCommissionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function selectAllUnbilled() {
    setSelectedCommissionIds(new Set(unbilledCommissions.map((c) => c.id)));
  }
  function selectNoneUnbilled() {
    setSelectedCommissionIds(new Set());
  }

  function addManualItem() {
    setManualItems((prev) => [...prev, { description: "", amount: "" }]);
  }
  function updateManualItem(idx, field, value) {
    setManualItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  }
  function removeManualItem(idx) {
    setManualItems((prev) => prev.filter((_, i) => i !== idx));
  }

  // Preview totals
  const previewItems = useMemo(() => {
    const fromComms = unbilledCommissions
      .filter((c) => selectedCommissionIds.has(c.id))
      .map((c) => ({
        description: `${COMMISSION_LABELS[c.type] || c.type}${c.reference_period ? ` — ${c.reference_period}` : ""}${c.description ? ` (${c.description})` : ""}`,
        amount: Number(c.amount),
        source: "commission",
        commission_id: c.id,
      }));
    const fromManual = manualItems
      .filter((m) => (m.description || "").trim() && Number(m.amount) > 0)
      .map((m) => ({
        description: m.description.trim(),
        amount: Number(m.amount),
        source: "manual",
        commission_id: null,
      }));
    return [...fromComms, ...fromManual];
  }, [unbilledCommissions, selectedCommissionIds, manualItems]);

  const totals = useMemo(() => computeTotals(previewItems, taxPct), [previewItems, taxPct]);

  async function saveInvoice() {
    setCreateError("");
    if (!formClient) { setCreateError("Selecione um cliente."); return; }
    if (previewItems.length === 0) { setCreateError("Adicione ao menos um item (comissão ou avulso)."); return; }
    if (!issuedAt || !dueAt) { setCreateError("Informe data de emissão e vencimento."); return; }
    if (new Date(dueAt) < new Date(issuedAt)) { setCreateError("Vencimento não pode ser antes da emissão."); return; }

    setSaving(true);

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      setCreateError("Sessão expirada.");
      setSaving(false);
      return;
    }

    const number = await nextInvoiceNumber(supabase, userData.user.id);

    const { data: invoice, error: invErr } = await supabase
      .from("invoices")
      .insert({
        consultant_id: userData.user.id,
        client_id: formClient,
        number,
        status: "pendente",
        issued_at: issuedAt,
        due_at: dueAt,
        subtotal: totals.subtotal,
        tax_pct: parseFloat(taxPct) || 0,
        tax_amount: totals.tax_amount,
        total: totals.total,
        payment_method: paymentMethod.trim(),
        notes: invoiceNotes.trim(),
      })
      .select()
      .single();

    if (invErr || !invoice) {
      console.error("[faturamento] insert invoice failed:", invErr);
      setCreateError(invErr?.message || "Erro ao criar fatura.");
      setSaving(false);
      return;
    }

    const itemsPayload = previewItems.map((it) => ({
      invoice_id: invoice.id,
      commission_id: it.commission_id,
      description: it.description,
      amount: it.amount,
    }));

    const { error: itemsErr } = await supabase.from("invoice_items").insert(itemsPayload);
    if (itemsErr) {
      console.error("[faturamento] insert items failed:", itemsErr);
      // rollback invoice
      await supabase.from("invoices").delete().eq("id", invoice.id);
      setCreateError(itemsErr.message || "Erro ao salvar itens da fatura.");
      setSaving(false);
      return;
    }

    setSaving(false);
    setShowCreate(false);
    await reloadInvoices();
  }

  // ─── View flow ───
  async function openView(i) {
    setViewInvoice(i);
    setViewItems([]);
    setLoadingView(true);
    const { data } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", i.id)
      .order("created_at", { ascending: true });
    setViewItems(data || []);
    setLoadingView(false);
  }

  async function markPaid(i) {
    const { error } = await supabase
      .from("invoices")
      .update({ status: "paga", paid_at: isoToday() })
      .eq("id", i.id);
    if (error) {
      console.error("[faturamento] mark paid failed:", error);
      return;
    }
    if (viewInvoice?.id === i.id) {
      setViewInvoice({ ...viewInvoice, status: "paga", paid_at: isoToday() });
    }
    await reloadInvoices();
  }

  async function markPending(i) {
    const { error } = await supabase
      .from("invoices")
      .update({ status: "pendente", paid_at: null })
      .eq("id", i.id);
    if (error) {
      console.error("[faturamento] mark pending failed:", error);
      return;
    }
    if (viewInvoice?.id === i.id) {
      setViewInvoice({ ...viewInvoice, status: "pendente", paid_at: null });
    }
    await reloadInvoices();
  }

  async function cancelInvoice(i) {
    if (!confirm(`Cancelar a fatura ${i.number}?`)) return;
    const { error } = await supabase
      .from("invoices")
      .update({ status: "cancelada" })
      .eq("id", i.id);
    if (error) {
      console.error("[faturamento] cancel failed:", error);
      return;
    }
    if (viewInvoice?.id === i.id) setViewInvoice({ ...viewInvoice, status: "cancelada" });
    await reloadInvoices();
  }

  async function deleteInvoice(i) {
    if (!confirm(`Excluir a fatura ${i.number} e seus itens? Esta ação não pode ser desfeita.`)) return;
    // Items cascade via FK
    const { error } = await supabase.from("invoices").delete().eq("id", i.id);
    if (error) {
      console.error("[faturamento] delete failed:", error);
      return;
    }
    if (viewInvoice?.id === i.id) setViewInvoice(null);
    await reloadInvoices();
  }

  function openPrint(i) {
    window.open(`/faturamento/print/${i.id}`, "_blank", "noopener,noreferrer");
  }

  if (loadingInit) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Faturamento</h2>
          <p className="text-xs text-white/40 mt-0.5">Gere cobranças a partir das comissões, acompanhe status e exporte PDF</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus size={15} /> Nova fatura
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total emitido" value={formatCurrency(stats.totalIssued)} icon={Receipt} delay={0.05} />
        <StatCard label="Recebido" value={formatCurrency(stats.paid)} icon={CheckCircle2} delay={0.1} />
        <StatCard label="Pendente" value={formatCurrency(stats.pending)} icon={Clock} delay={0.15} />
        <StatCard label="Vencido" value={formatCurrency(stats.overdue)} icon={AlertTriangle} delay={0.2} />
      </div>

      {/* Filters */}
      <GlassCard className="p-4" delay={0.2}>
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter size={12} className="text-white/40 mr-1" />
            {STATUS_FILTER_OPTIONS.map((o) => (
              <button
                key={o.key}
                type="button"
                onClick={() => setStatusFilter(o.key)}
                className={`px-2.5 py-1 rounded-lg text-[11px] uppercase tracking-wider font-medium transition-all ${
                  statusFilter === o.key
                    ? "bg-indigo-500/15 border border-indigo-500/30 text-indigo-300"
                    : "bg-white/[0.02] border border-white/[0.06] text-white/35 hover:text-white/60"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-1">
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
            >
              <option value="" className="bg-slate-900">Todos os clientes</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900">{c.full_name}</option>
              ))}
            </select>
            <div className="relative flex-1 min-w-[180px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Buscar número, cliente ou nota..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* List */}
      {filtered.length === 0 ? (
        <GlassCard className="p-12 text-center" delay={0.25}>
          <Receipt size={28} className="mx-auto mb-3 text-white/15" />
          <p className="text-sm text-white/40 mb-3">
            {invoices.length === 0
              ? "Nenhuma fatura ainda. Crie a primeira a partir das comissões."
              : "Nenhuma fatura bate com o filtro atual."}
          </p>
          {invoices.length === 0 && (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus size={14} /> Criar primeira fatura
            </button>
          )}
        </GlassCard>
      ) : (
        <GlassCard className="p-2" delay={0.25}>
          <div className="divide-y divide-white/[0.04]">
            {filtered.map((i) => {
              const status = visualStatus(i);
              const cfg = STATUS_CONFIG[status];
              const SIcon = cfg.icon;
              return (
                <div
                  key={i.id}
                  className="group grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-3 hover:bg-white/[0.03] rounded-lg transition-all cursor-pointer"
                  onClick={() => openView(i)}
                >
                  <div className={`p-2.5 rounded-xl ${cfg.pill.split(" ").slice(0, 1).join(" ")} border border-white/[0.05] flex-shrink-0`}>
                    <SIcon size={16} className={cfg.pill.split(" ").find((c) => c.startsWith("text-"))} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-white/90 font-mono">{i.number}</h4>
                      <span className={`px-1.5 py-0.5 rounded border text-[9px] uppercase tracking-wider ${cfg.pill}`}>
                        {cfg.label}
                      </span>
                      <span className="text-[11px] text-white/45 truncate">{i.clients?.full_name || "—"}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-[10px] text-white/35">
                      <span className="flex items-center gap-1">
                        <Calendar size={9} />
                        emitida em {new Date(`${i.issued_at}T00:00:00`).toLocaleDateString("pt-BR")}
                      </span>
                      <span>vence em {new Date(`${i.due_at}T00:00:00`).toLocaleDateString("pt-BR")}</span>
                      {i.paid_at && (
                        <span className="text-emerald-400/70">pago em {new Date(`${i.paid_at}T00:00:00`).toLocaleDateString("pt-BR")}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-semibold font-mono text-white/90">{formatCurrency(Number(i.total))}</span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); openPrint(i); }}
                        className="p-1.5 rounded-md text-white/30 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all"
                        title="Imprimir / PDF"
                      >
                        <Printer size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); openView(i); }}
                        className="p-1.5 rounded-md text-white/30 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all"
                        title="Visualizar"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); deleteInvoice(i); }}
                        className="p-1.5 rounded-md text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* ─── Create modal ─── */}
      {showCreate && (
        <Modal
          title="Nova fatura"
          icon={Receipt}
          size="2xl"
          onClose={() => setShowCreate(false)}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="inv-client" className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">Cliente</label>
                <select
                  id="inv-client"
                  value={formClient}
                  onChange={(e) => setFormClient(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                >
                  <option value="" className="bg-slate-900">— Escolha um cliente —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900">{c.full_name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="inv-issued" className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">Emissão</label>
                  <input
                    id="inv-issued"
                    type="date"
                    value={issuedAt}
                    onChange={(e) => setIssuedAt(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                  />
                </div>
                <div>
                  <label htmlFor="inv-due" className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">Vencimento</label>
                  <input
                    id="inv-due"
                    type="date"
                    value={dueAt}
                    onChange={(e) => setDueAt(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                  />
                </div>
              </div>
            </div>

            {/* Commissions */}
            {formClient && (
              <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-white/70 flex items-center gap-2">
                    <DollarSign size={12} className="text-indigo-400" /> Comissões não faturadas ({unbilledCommissions.length})
                  </h4>
                  {unbilledCommissions.length > 0 && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={selectAllUnbilled}
                        className="text-[10px] text-white/40 hover:text-white/70 px-2 py-0.5 rounded hover:bg-white/[0.05] transition-all"
                      >
                        Todos
                      </button>
                      <button
                        type="button"
                        onClick={selectNoneUnbilled}
                        className="text-[10px] text-white/40 hover:text-white/70 px-2 py-0.5 rounded hover:bg-white/[0.05] transition-all"
                      >
                        Nenhum
                      </button>
                    </div>
                  )}
                </div>
                {loadingCommissions ? (
                  <div className="py-3 flex justify-center"><Spinner size={14} /></div>
                ) : unbilledCommissions.length === 0 ? (
                  <p className="text-[11px] text-white/30 py-2 text-center">
                    Nenhuma comissão faturável para este cliente.
                  </p>
                ) : (
                  <div className="space-y-1 max-h-[180px] overflow-y-auto pr-1">
                    {unbilledCommissions.map((c) => {
                      const checked = selectedCommissionIds.has(c.id);
                      return (
                        <label
                          key={c.id}
                          className={`flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer text-xs transition-all border ${
                            checked
                              ? "bg-indigo-500/10 border-indigo-500/30"
                              : "bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleCommission(c.id)}
                            className="accent-indigo-500"
                          />
                          <span className="text-[10px] font-mono text-white/40 w-16 flex-shrink-0">
                            {c.reference_period || "—"}
                          </span>
                          <span className="px-1.5 py-0.5 rounded border text-[9px] uppercase tracking-wider bg-white/[0.04] border-white/[0.08] text-white/60 flex-shrink-0">
                            {COMMISSION_LABELS[c.type] || c.type}
                          </span>
                          <span className="text-white/70 truncate flex-1">{c.description || "—"}</span>
                          <span className="font-mono font-semibold text-white/90 flex-shrink-0">{formatCurrency(Number(c.amount))}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Manual items */}
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-white/70 flex items-center gap-2">
                  <FileText size={12} className="text-indigo-400" /> Itens avulsos
                </h4>
                <button
                  type="button"
                  onClick={addManualItem}
                  className="flex items-center gap-1 text-[10px] text-indigo-300 hover:text-indigo-200 px-2 py-0.5 rounded hover:bg-indigo-500/10 transition-all"
                >
                  <Plus size={10} /> Adicionar
                </button>
              </div>
              {manualItems.length === 0 ? (
                <p className="text-[11px] text-white/25 text-center py-2">Sem itens avulsos.</p>
              ) : (
                <div className="space-y-1.5">
                  {manualItems.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Descrição"
                        value={it.description}
                        onChange={(e) => updateManualItem(idx, "description", e.target.value)}
                        className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                      />
                      <input
                        type="number"
                        step={0.01}
                        placeholder="Valor"
                        value={it.amount}
                        onChange={(e) => updateManualItem(idx, "amount", e.target.value)}
                        className="w-28 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                      />
                      <button
                        type="button"
                        onClick={() => removeManualItem(idx)}
                        className="p-1.5 rounded-md text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                      >
                        <XIcon size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tax + payment + notes */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="inv-tax" className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">Imposto sobre subtotal (%)</label>
                <input
                  id="inv-tax"
                  type="number"
                  step={0.01}
                  min={0}
                  value={taxPct}
                  onChange={(e) => setTaxPct(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                />
              </div>
              <div>
                <label htmlFor="inv-method" className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">Forma de pagamento</label>
                <input
                  id="inv-method"
                  type="text"
                  placeholder="PIX, boleto, transferência..."
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                />
              </div>
            </div>
            <div>
              <label htmlFor="inv-notes" className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">Observação (opcional)</label>
              <textarea
                id="inv-notes"
                rows={2}
                placeholder="Mensagem que aparecerá na nota..."
                value={invoiceNotes}
                onChange={(e) => setInvoiceNotes(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40 resize-none"
              />
            </div>

            {/* Totals preview */}
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-5 text-xs">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/30">Itens</p>
                  <p className="font-mono font-semibold text-white/80">{previewItems.length}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/30">Subtotal</p>
                  <p className="font-mono font-semibold text-white/80">{formatCurrency(totals.subtotal)}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/30">Imposto</p>
                  <p className="font-mono font-semibold text-white/80">{formatCurrency(totals.tax_amount)}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/30">Total</p>
                  <p className="font-mono font-bold text-white text-base">{formatCurrency(totals.total)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white/80 hover:bg-white/[0.05] transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={saveInvoice}
                  disabled={saving || previewItems.length === 0 || !formClient}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? <Spinner size={14} /> : <><Check size={14} /> Emitir fatura</>}
                </button>
              </div>
            </div>

            {createError && (
              <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                {createError}
              </p>
            )}
          </div>
        </Modal>
      )}

      {/* ─── View modal ─── */}
      {viewInvoice && (
        <Modal
          title={`Fatura ${viewInvoice.number}`}
          icon={Receipt}
          size="2xl"
          onClose={() => setViewInvoice(null)}
        >
          {(() => {
            const status = visualStatus(viewInvoice);
            const cfg = STATUS_CONFIG[status];
            const SIcon = cfg.icon;
            return (
              <div className="space-y-3">
                {/* Top actions */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded border text-[10px] uppercase tracking-wider flex items-center gap-1 ${cfg.pill}`}>
                      <SIcon size={10} /> {cfg.label}
                    </span>
                    <span className="text-[11px] text-white/45">{viewInvoice.clients?.full_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {viewInvoice.status === "pendente" && (
                      <button
                        type="button"
                        onClick={() => markPaid(viewInvoice)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                      >
                        <CheckCircle2 size={11} /> Marcar paga
                      </button>
                    )}
                    {viewInvoice.status === "paga" && (
                      <button
                        type="button"
                        onClick={() => markPending(viewInvoice)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                      >
                        <Clock size={11} /> Marcar pendente
                      </button>
                    )}
                    {viewInvoice.status !== "cancelada" && (
                      <button
                        type="button"
                        onClick={() => cancelInvoice(viewInvoice)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] text-rose-300 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
                      >
                        <XCircle size={11} /> Cancelar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openPrint(viewInvoice)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all"
                    >
                      <Printer size={11} /> Imprimir / PDF
                    </button>
                  </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <SummaryCell label="Emitida em" value={new Date(`${viewInvoice.issued_at}T00:00:00`).toLocaleDateString("pt-BR")} />
                  <SummaryCell label="Vencimento" value={new Date(`${viewInvoice.due_at}T00:00:00`).toLocaleDateString("pt-BR")} />
                  <SummaryCell label="Subtotal" value={formatCurrency(Number(viewInvoice.subtotal))} />
                  <SummaryCell label="Total" value={formatCurrency(Number(viewInvoice.total))} accent="text-white" />
                </div>

                {/* Items */}
                <div>
                  <h4 className="text-xs font-semibold mb-2 flex items-center gap-2">
                    <FileText size={12} className="text-indigo-400" /> Itens
                  </h4>
                  {loadingView ? (
                    <div className="py-4 flex justify-center"><Spinner size={16} /></div>
                  ) : viewItems.length === 0 ? (
                    <p className="text-[11px] text-white/30 py-3 text-center">Sem itens.</p>
                  ) : (
                    <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl overflow-hidden">
                      <div className="grid grid-cols-[1fr_auto] gap-2 px-3 py-2 text-[10px] uppercase tracking-wider text-white/30 border-b border-white/[0.04]">
                        <span>Descrição</span>
                        <span className="text-right">Valor</span>
                      </div>
                      <div className="divide-y divide-white/[0.03]">
                        {viewItems.map((it) => (
                          <div key={it.id} className="grid grid-cols-[1fr_auto] gap-2 px-3 py-2 text-xs">
                            <span className="text-white/75">
                              {it.description}
                              {it.commission_id && (
                                <span className="ml-2 text-[9px] text-white/30 uppercase">comissão</span>
                              )}
                            </span>
                            <span className="font-mono font-semibold text-white/85">{formatCurrency(Number(it.amount))}</span>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-[1fr_auto] gap-2 px-3 py-2 border-t border-white/[0.06] bg-white/[0.02]">
                        <span className="text-[11px] text-white/50">Subtotal</span>
                        <span className="text-xs font-mono text-white/70">{formatCurrency(Number(viewInvoice.subtotal))}</span>
                      </div>
                      {Number(viewInvoice.tax_amount) > 0 && (
                        <div className="grid grid-cols-[1fr_auto] gap-2 px-3 py-1.5 bg-white/[0.02]">
                          <span className="text-[11px] text-white/50">Imposto ({Number(viewInvoice.tax_pct)}%)</span>
                          <span className="text-xs font-mono text-white/70">{formatCurrency(Number(viewInvoice.tax_amount))}</span>
                        </div>
                      )}
                      <div className="grid grid-cols-[1fr_auto] gap-2 px-3 py-2 bg-white/[0.04]">
                        <span className="text-xs font-semibold text-white/80">Total</span>
                        <span className="text-sm font-mono font-bold text-white">{formatCurrency(Number(viewInvoice.total))}</span>
                      </div>
                    </div>
                  )}
                </div>

                {(viewInvoice.payment_method || viewInvoice.notes) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {viewInvoice.payment_method && (
                      <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-2.5">
                        <p className="text-[9px] uppercase tracking-wider text-white/30">Pagamento</p>
                        <p className="text-white/70">{viewInvoice.payment_method}</p>
                      </div>
                    )}
                    {viewInvoice.notes && (
                      <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-2.5">
                        <p className="text-[9px] uppercase tracking-wider text-white/30">Observação</p>
                        <p className="text-white/70 whitespace-pre-wrap">{viewInvoice.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
}

function SummaryCell({ label, value, accent = "text-white/85" }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
      <p className="text-[9px] uppercase tracking-wider text-white/30">{label}</p>
      <p className={`text-sm font-semibold ${accent}`}>{value}</p>
    </div>
  );
}
