"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { detectAlerts } from "@/lib/alerts-detector";
import { GlassCard, Modal, Spinner, StatCard } from "@/components/ui";
import {
  Bell, BellOff, AlertTriangle, Info, AlertCircle, RefreshCw, Check,
  Eye, Trash2, Filter, Search, ArrowRight, ExternalLink, Plus,
  Inbox, CheckCheck, Sparkles,
} from "lucide-react";

const TYPE_LABEL = {
  portfolio_drift:         "Carteira",
  client_birthday:         "Aniversário",
  suitability_expiring:    "Suitability",
  document_expiring:       "Documento",
  goal_reached:            "Meta",
  pluggy_connection_issue: "Conexão Pluggy",
  manual:                  "Manual",
};

const TYPE_PILL = {
  portfolio_drift:         "bg-amber-500/15 text-amber-300 border-amber-500/20",
  client_birthday:         "bg-pink-500/15 text-pink-300 border-pink-500/20",
  suitability_expiring:    "bg-violet-500/15 text-violet-300 border-violet-500/20",
  document_expiring:       "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
  goal_reached:            "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  pluggy_connection_issue: "bg-indigo-500/15 text-indigo-300 border-indigo-500/20",
  manual:                  "bg-slate-500/15 text-slate-300 border-slate-500/20",
};

const SEVERITY_CONFIG = {
  info:     { label: "Info",     icon: Info,           color: "text-indigo-300", bg: "bg-indigo-500/10 border-indigo-500/20" },
  warning:  { label: "Atenção",  icon: AlertTriangle,  color: "text-amber-300",  bg: "bg-amber-500/10 border-amber-500/20" },
  critical: { label: "Crítico",  icon: AlertCircle,    color: "text-rose-300",   bg: "bg-rose-500/10 border-rose-500/20" },
};

const SEVERITY_OPTIONS = [
  { key: "all",      label: "Todas" },
  { key: "critical", label: "Críticas" },
  { key: "warning",  label: "Atenção" },
  { key: "info",     label: "Info" },
];

const STATUS_OPTIONS = [
  { key: "active",  label: "Ativos" },
  { key: "unread",  label: "Não lidos" },
  { key: "read",    label: "Lidos" },
  { key: "dismissed", label: "Descartados" },
  { key: "all",     label: "Todos" },
];

const TYPE_FILTER_OPTIONS = [
  { key: "all",                     label: "Todos os tipos" },
  { key: "portfolio_drift",         label: "Carteira desenquadrada" },
  { key: "client_birthday",         label: "Aniversário" },
  { key: "suitability_expiring",    label: "Suitability" },
  { key: "document_expiring",       label: "Documento" },
  { key: "goal_reached",            label: "Meta atingida" },
  { key: "pluggy_connection_issue", label: "Conexão Pluggy" },
  { key: "manual",                  label: "Manual" },
];

const EMPTY_MANUAL = {
  title: "",
  message: "",
  severity: "info",
  client_id: "",
  link: "",
};

export default function AlertasPage() {
  const supabase = getSupabaseBrowserClient();

  const [alerts, setAlerts] = useState([]);
  const [clients, setClients] = useState([]);
  const [loadingInit, setLoadingInit] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [lastDetectionMsg, setLastDetectionMsg] = useState("");

  // Filters
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("active");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Manual modal
  const [showManual, setShowManual] = useState(false);
  const [manualForm, setManualForm] = useState(EMPTY_MANUAL);
  const [savingManual, setSavingManual] = useState(false);
  const [manualError, setManualError] = useState("");

  // ─── Init ───
  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function init() {
    setLoadingInit(true);
    const [cRes] = await Promise.all([
      supabase.from("clients").select("id, full_name").eq("is_active", true).order("full_name"),
    ]);
    setClients(cRes.data || []);
    await loadAlerts();
    await runDetection(true);
    setLoadingInit(false);
  }

  async function loadAlerts() {
    const { data, error } = await supabase
      .from("alerts")
      .select("*, clients(full_name)")
      .order("triggered_at", { ascending: false })
      .limit(500);
    if (error) console.error("[alertas] load failed:", error);
    setAlerts(data || []);
  }

  async function runDetection(silent = false) {
    setDetecting(true);
    if (!silent) setLastDetectionMsg("");

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      setDetecting(false);
      if (!silent) setLastDetectionMsg("Sessão expirada.");
      return;
    }

    const result = await detectAlerts(supabase, userData.user.id);
    setDetecting(false);

    if (result.error) {
      if (!silent) setLastDetectionMsg("Erro ao detectar. Veja o console.");
      return;
    }

    if (!silent) {
      setLastDetectionMsg(
        result.inserted > 0
          ? `${result.inserted} novo${result.inserted === 1 ? "" : "s"} alerta${result.inserted === 1 ? "" : "s"} detectado${result.inserted === 1 ? "" : "s"}.`
          : result.candidates > 0
          ? "Tudo em dia — nenhum alerta novo (já existiam)."
          : "Tudo em dia — nenhum alerta encontrado.",
      );
    }
    await loadAlerts();
  }

  // ─── Stats ───
  const stats = useMemo(() => {
    const active = alerts.filter((a) => !a.dismissed_at);
    const unread = active.filter((a) => !a.is_read);
    const critical = active.filter((a) => a.severity === "critical");
    const today = active.filter((a) => {
      const t = new Date(a.triggered_at);
      const now = new Date();
      return t.getFullYear() === now.getFullYear() && t.getMonth() === now.getMonth() && t.getDate() === now.getDate();
    });
    return {
      unread: unread.length,
      critical: critical.length,
      today: today.length,
      total: active.length,
    };
  }, [alerts]);

  // ─── Filtered list ───
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return alerts.filter((a) => {
      if (status === "active" && a.dismissed_at) return false;
      if (status === "unread" && (a.is_read || a.dismissed_at)) return false;
      if (status === "read" && (!a.is_read || a.dismissed_at)) return false;
      if (status === "dismissed" && !a.dismissed_at) return false;
      if (severity !== "all" && a.severity !== severity) return false;
      if (typeFilter !== "all" && a.type !== typeFilter) return false;
      if (term) {
        const hay = `${a.title} ${a.message} ${a.clients?.full_name || ""}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [alerts, severity, status, typeFilter, search]);

  // ─── Actions ───
  async function markRead(a, read = true) {
    const { error } = await supabase
      .from("alerts")
      .update({ is_read: read })
      .eq("id", a.id);
    if (error) {
      console.error("[alertas] mark read failed:", error);
      return;
    }
    setAlerts((prev) => prev.map((x) => (x.id === a.id ? { ...x, is_read: read } : x)));
  }

  async function dismiss(a) {
    const { error } = await supabase
      .from("alerts")
      .update({ dismissed_at: new Date().toISOString(), is_read: true })
      .eq("id", a.id);
    if (error) {
      console.error("[alertas] dismiss failed:", error);
      return;
    }
    setAlerts((prev) =>
      prev.map((x) => (x.id === a.id ? { ...x, dismissed_at: new Date().toISOString(), is_read: true } : x)),
    );
  }

  async function restore(a) {
    const { error } = await supabase
      .from("alerts")
      .update({ dismissed_at: null })
      .eq("id", a.id);
    if (error) {
      console.error("[alertas] restore failed:", error);
      return;
    }
    setAlerts((prev) => prev.map((x) => (x.id === a.id ? { ...x, dismissed_at: null } : x)));
  }

  async function deleteAlert(a) {
    if (!confirm("Excluir este alerta?")) return;
    const { error } = await supabase.from("alerts").delete().eq("id", a.id);
    if (error) {
      console.error("[alertas] delete failed:", error);
      return;
    }
    setAlerts((prev) => prev.filter((x) => x.id !== a.id));
  }

  async function markAllRead() {
    const ids = alerts.filter((a) => !a.is_read && !a.dismissed_at).map((a) => a.id);
    if (ids.length === 0) return;
    const { error } = await supabase.from("alerts").update({ is_read: true }).in("id", ids);
    if (error) {
      console.error("[alertas] mark all failed:", error);
      return;
    }
    setAlerts((prev) => prev.map((a) => (ids.includes(a.id) ? { ...a, is_read: true } : a)));
  }

  // ─── Manual create ───
  function openManual() {
    setManualForm(EMPTY_MANUAL);
    setManualError("");
    setShowManual(true);
  }

  async function saveManual() {
    setManualError("");
    if (!manualForm.title.trim()) { setManualError("Dê um título ao alerta."); return; }
    if (!manualForm.message.trim()) { setManualError("Escreva a mensagem do alerta."); return; }

    setSavingManual(true);
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      setManualError("Sessão expirada.");
      setSavingManual(false);
      return;
    }

    const { error } = await supabase.from("alerts").insert({
      consultant_id: userData.user.id,
      client_id: manualForm.client_id || null,
      type: "manual",
      severity: manualForm.severity,
      title: manualForm.title.trim(),
      message: manualForm.message.trim(),
      link: manualForm.link.trim(),
      dedupe_key: `manual-${crypto.randomUUID()}`,
    });

    setSavingManual(false);
    if (error) {
      console.error("[alertas] insert manual failed:", error);
      setManualError(error.message || "Erro ao criar alerta.");
      return;
    }
    setShowManual(false);
    await loadAlerts();
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
          <h2 className="text-xl font-bold tracking-tight">Alertas</h2>
          <p className="text-xs text-white/40 mt-0.5">
            Carteiras desenquadradas, aniversários, vencimentos e metas atingidas — detectados automaticamente
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => runDetection(false)}
            disabled={detecting}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white/70 hover:text-white/95 hover:bg-white/[0.08] transition-all disabled:opacity-50"
          >
            {detecting ? <Spinner size={12} /> : <RefreshCw size={12} />}
            Detectar agora
          </button>
          <button
            type="button"
            onClick={markAllRead}
            disabled={stats.unread === 0}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white/70 hover:text-white/95 hover:bg-white/[0.08] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <CheckCheck size={12} /> Marcar todos lidos
          </button>
          <button
            type="button"
            onClick={openManual}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-xs font-semibold hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus size={12} /> Manual
          </button>
        </div>
      </div>

      {lastDetectionMsg && (
        <p className="text-[11px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-2 flex items-center gap-2">
          <Sparkles size={12} /> {lastDetectionMsg}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Não lidos"   value={stats.unread}   icon={Bell}           delay={0.05} />
        <StatCard label="Críticos"    value={stats.critical} icon={AlertCircle}    delay={0.1} />
        <StatCard label="Hoje"        value={stats.today}    icon={Sparkles}       delay={0.15} />
        <StatCard label="Total ativo" value={stats.total}    icon={Inbox}          delay={0.2} />
      </div>

      {/* Filters */}
      <GlassCard className="p-4" delay={0.2}>
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter size={12} className="text-white/40 mr-1" />
            {STATUS_OPTIONS.map((o) => (
              <button
                key={o.key}
                type="button"
                onClick={() => setStatus(o.key)}
                className={`px-2.5 py-1 rounded-lg text-[11px] uppercase tracking-wider font-medium transition-all ${
                  status === o.key
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
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
            >
              {SEVERITY_OPTIONS.map((o) => (
                <option key={o.key} value={o.key} className="bg-slate-900">{o.label}</option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
            >
              {TYPE_FILTER_OPTIONS.map((o) => (
                <option key={o.key} value={o.key} className="bg-slate-900">{o.label}</option>
              ))}
            </select>
            <div className="relative flex-1 min-w-[180px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Buscar título, mensagem ou cliente..."
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
          <BellOff size={28} className="mx-auto mb-3 text-white/15" />
          <p className="text-sm text-white/40">
            {alerts.length === 0
              ? "Nenhum alerta ainda. Clique em \"Detectar agora\" pra varrer os dados."
              : "Nenhum alerta bate com o filtro atual."}
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((a) => {
            const sev = SEVERITY_CONFIG[a.severity] || SEVERITY_CONFIG.info;
            const SevIcon = sev.icon;
            const dismissed = !!a.dismissed_at;
            return (
              <GlassCard
                key={a.id}
                className={`p-3 transition-all ${
                  dismissed
                    ? "opacity-60"
                    : !a.is_read
                    ? "ring-1 ring-indigo-500/20 bg-indigo-500/[0.03]"
                    : ""
                }`}
                delay={0}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl ${sev.bg} flex-shrink-0`}>
                    <SevIcon size={15} className={sev.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h4 className={`text-sm ${!a.is_read && !dismissed ? "font-semibold text-white" : "font-medium text-white/85"}`}>
                        {a.title}
                      </h4>
                      {!a.is_read && !dismissed && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                      )}
                      <span className={`px-1.5 py-0.5 rounded border text-[9px] uppercase tracking-wider ${TYPE_PILL[a.type] || TYPE_PILL.manual}`}>
                        {TYPE_LABEL[a.type] || a.type}
                      </span>
                      {a.clients?.full_name && (
                        <span className="text-[10px] text-white/35">· {a.clients.full_name}</span>
                      )}
                    </div>
                    <p className="text-xs text-white/55 leading-relaxed">{a.message}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-white/30">
                      <span>{new Date(a.triggered_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                      {dismissed && (
                        <span className="text-rose-400/60">descartado em {new Date(a.dismissed_at).toLocaleDateString("pt-BR")}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {a.link && !dismissed && (
                      <Link
                        href={a.link}
                        className="p-1.5 rounded-md text-white/40 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all"
                        title="Ir para"
                      >
                        <ExternalLink size={13} />
                      </Link>
                    )}
                    {!dismissed && (
                      <>
                        <button
                          type="button"
                          onClick={() => markRead(a, !a.is_read)}
                          className="p-1.5 rounded-md text-white/40 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all"
                          title={a.is_read ? "Marcar não lido" : "Marcar lido"}
                        >
                          {a.is_read ? <Eye size={13} /> : <Check size={13} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => dismiss(a)}
                          className="p-1.5 rounded-md text-white/40 hover:text-amber-300 hover:bg-amber-500/10 transition-all"
                          title="Descartar"
                        >
                          <BellOff size={13} />
                        </button>
                      </>
                    )}
                    {dismissed && (
                      <button
                        type="button"
                        onClick={() => restore(a)}
                        className="p-1.5 rounded-md text-white/40 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all"
                        title="Restaurar"
                      >
                        <ArrowRight size={13} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteAlert(a)}
                      className="p-1.5 rounded-md text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                      title="Excluir"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* ─── Manual create modal ─── */}
      {showManual && (
        <Modal
          title="Criar alerta manual"
          icon={Plus}
          size="lg"
          onClose={() => setShowManual(false)}
        >
          <div className="space-y-3">
            <div>
              <label htmlFor="m-title" className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">Título</label>
              <input
                id="m-title"
                type="text"
                placeholder="Ex.: Ligar pro João sobre aporte"
                value={manualForm.title}
                onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
              />
            </div>
            <div>
              <label htmlFor="m-message" className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">Mensagem</label>
              <textarea
                id="m-message"
                rows={3}
                placeholder="Contexto do alerta..."
                value={manualForm.message}
                onChange={(e) => setManualForm({ ...manualForm, message: e.target.value })}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="m-sev" className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">Severidade</label>
                <select
                  id="m-sev"
                  value={manualForm.severity}
                  onChange={(e) => setManualForm({ ...manualForm, severity: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                >
                  <option value="info" className="bg-slate-900">Info</option>
                  <option value="warning" className="bg-slate-900">Atenção</option>
                  <option value="critical" className="bg-slate-900">Crítico</option>
                </select>
              </div>
              <div>
                <label htmlFor="m-client" className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">Cliente (opcional)</label>
                <select
                  id="m-client"
                  value={manualForm.client_id}
                  onChange={(e) => setManualForm({ ...manualForm, client_id: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                >
                  <option value="" className="bg-slate-900">— Nenhum —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900">{c.full_name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="m-link" className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">Link (opcional)</label>
              <input
                id="m-link"
                type="text"
                placeholder="/clients/abc, /metas..."
                value={manualForm.link}
                onChange={(e) => setManualForm({ ...manualForm, link: e.target.value })}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
              />
            </div>

            {manualError && (
              <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                {manualError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowManual(false)}
                className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white/80 hover:bg-white/[0.05] transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveManual}
                disabled={savingManual}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingManual ? <Spinner size={14} /> : <><Plus size={14} /> Criar</>}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
