"use client";

import { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, ReferenceLine,
} from "recharts";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { GlassCard, GlassInput, Modal, Spinner, StatCard } from "@/components/ui";
import {
  Target, Users, Plus, Edit3, Trash2, Check, TrendingUp,
  Briefcase, Home, GraduationCap, Plane, Shield, Car, MoreHorizontal,
  Calendar, CheckCircle2, PlayCircle, PauseCircle, AlertCircle,
} from "lucide-react";

const TT = {
  background: "rgba(15,15,40,0.95)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  fontSize: 12,
};

const TYPE_CONFIG = {
  aposentadoria:      { label: "Aposentadoria",         icon: Briefcase,      dot: "text-indigo-400",  pill: "bg-indigo-500/15 text-indigo-300 border-indigo-500/20" },
  imovel:             { label: "Imóvel",                icon: Home,           dot: "text-emerald-400", pill: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20" },
  educacao:           { label: "Educação",              icon: GraduationCap,  dot: "text-amber-400",   pill: "bg-amber-500/15 text-amber-300 border-amber-500/20" },
  viagem:             { label: "Viagem",                icon: Plane,          dot: "text-cyan-400",    pill: "bg-cyan-500/15 text-cyan-300 border-cyan-500/20" },
  reserva_emergencia: { label: "Reserva de emergência", icon: Shield,         dot: "text-rose-400",    pill: "bg-rose-500/15 text-rose-300 border-rose-500/20" },
  veiculo:            { label: "Veículo",               icon: Car,            dot: "text-orange-400",  pill: "bg-orange-500/15 text-orange-300 border-orange-500/20" },
  outro:              { label: "Outro",                 icon: MoreHorizontal, dot: "text-slate-400",   pill: "bg-slate-500/15 text-slate-300 border-slate-500/20" },
};

const STATUS_CONFIG = {
  ativo:     { label: "Ativo",     pill: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20" },
  pausado:   { label: "Pausado",   pill: "bg-amber-500/10 text-amber-300 border-amber-500/20" },
  atingido:  { label: "Atingido",  pill: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
  cancelado: { label: "Cancelado", pill: "bg-red-500/10 text-red-300 border-red-500/20" },
};

const EMPTY_FORM = {
  name: "",
  type: "outro",
  target_amount: "",
  initial_amount: "0",
  monthly_contribution: "",
  expected_return_rate: "10",
  start_date: "",
  target_date: "",
  description: "",
};

function toISODate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function monthsBetween(start, end) {
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
}

function buildProjection(goal, contributions) {
  const start = new Date(`${goal.start_date}T00:00:00`);
  const end = new Date(`${goal.target_date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const initial = Number(goal.initial_amount) || 0;
  const monthly = Number(goal.monthly_contribution) || 0;
  const annualRate = Number(goal.expected_return_rate) / 100;
  const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;

  const totalMonths = Math.max(1, monthsBetween(start, end));

  const sortedContribs = [...(contributions || [])].sort(
    (a, b) => new Date(a.contributed_at) - new Date(b.contributed_at),
  );

  let projected = initial;
  let realCumulative = initial;
  let contribIdx = 0;

  const points = [];

  for (let m = 0; m <= totalMonths; m++) {
    const pointDate = new Date(start);
    pointDate.setMonth(start.getMonth() + m);

    if (m > 0) projected = projected * (1 + monthlyRate) + monthly;

    while (
      contribIdx < sortedContribs.length &&
      new Date(`${sortedContribs[contribIdx].contributed_at}T00:00:00`) <= pointDate
    ) {
      realCumulative += Number(sortedContribs[contribIdx].amount);
      contribIdx++;
    }

    const point = {
      label: pointDate.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      projetado: Math.round(projected * 100) / 100,
    };

    if (pointDate <= today) {
      point.real = Math.round(realCumulative * 100) / 100;
    }

    points.push(point);
  }

  return { points, totalContributed: realCumulative, projectedFinal: projected };
}

export default function MetasPage() {
  const supabase = getSupabaseBrowserClient();

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [goals, setGoals] = useState([]);
  const [contributionsByGoal, setContributionsByGoal] = useState({});
  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingGoals, setLoadingGoals] = useState(false);

  // Form modal
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Detail modal
  const [detailGoal, setDetailGoal] = useState(null);
  const [contribForm, setContribForm] = useState({ amount: "", contributed_at: "", notes: "" });
  const [contribError, setContribError] = useState("");
  const [savingContrib, setSavingContrib] = useState(false);

  // ─── Init: load clients ───
  useEffect(() => {
    async function init() {
      const { data } = await supabase
        .from("clients")
        .select("id, full_name")
        .eq("is_active", true)
        .order("full_name");
      setClients(data || []);
      setLoadingInit(false);
    }
    init();
  }, [supabase]);

  // ─── Load goals when client changes ───
  useEffect(() => {
    if (!selectedClient) {
      setGoals([]);
      setContributionsByGoal({});
      return;
    }
    async function load() {
      setLoadingGoals(true);
      const { data: goalsData } = await supabase
        .from("financial_goals")
        .select("*")
        .eq("client_id", selectedClient)
        .order("target_date", { ascending: true });

      const goalIds = (goalsData || []).map((g) => g.id);
      let contribs = [];
      if (goalIds.length > 0) {
        const { data: cData } = await supabase
          .from("goal_contributions")
          .select("*")
          .in("goal_id", goalIds)
          .order("contributed_at", { ascending: true });
        contribs = cData || [];
      }

      const byGoal = {};
      for (const c of contribs) {
        if (!byGoal[c.goal_id]) byGoal[c.goal_id] = [];
        byGoal[c.goal_id].push(c);
      }

      setGoals(goalsData || []);
      setContributionsByGoal(byGoal);
      setLoadingGoals(false);
    }
    load();
  }, [selectedClient, supabase]);

  async function reloadGoals() {
    if (!selectedClient) return;
    const { data: goalsData } = await supabase
      .from("financial_goals")
      .select("*")
      .eq("client_id", selectedClient)
      .order("target_date", { ascending: true });

    const goalIds = (goalsData || []).map((g) => g.id);
    let contribs = [];
    if (goalIds.length > 0) {
      const { data: cData } = await supabase
        .from("goal_contributions")
        .select("*")
        .in("goal_id", goalIds)
        .order("contributed_at", { ascending: true });
      contribs = cData || [];
    }
    const byGoal = {};
    for (const c of contribs) {
      if (!byGoal[c.goal_id]) byGoal[c.goal_id] = [];
      byGoal[c.goal_id].push(c);
    }
    setGoals(goalsData || []);
    setContributionsByGoal(byGoal);

    if (detailGoal) {
      const updated = (goalsData || []).find((g) => g.id === detailGoal.id);
      if (updated) setDetailGoal(updated);
      else setDetailGoal(null);
    }
  }

  // ─── Enriched goals ───
  const enriched = useMemo(() => {
    return goals.map((g) => {
      const cs = contributionsByGoal[g.id] || [];
      const contributed = cs.reduce((s, c) => s + Number(c.amount), 0) + Number(g.initial_amount || 0);
      const progress = Number(g.target_amount) > 0
        ? Math.min(1, contributed / Number(g.target_amount))
        : 0;
      return { ...g, contributed, progress };
    });
  }, [goals, contributionsByGoal]);

  // ─── Stats ───
  const stats = useMemo(() => {
    const active = enriched.filter((g) => g.status === "ativo");
    const totalTarget = active.reduce((s, g) => s + Number(g.target_amount), 0);
    const totalContributed = enriched.reduce((s, g) => s + g.contributed, 0);
    const avgProgress = active.length > 0
      ? active.reduce((s, g) => s + g.progress, 0) / active.length
      : 0;
    const reached = enriched.filter((g) => g.status === "atingido" || g.progress >= 1).length;
    return { totalTarget, totalContributed, avgProgress, reached };
  }, [enriched]);

  // ─── Goal form ───
  function openNew() {
    if (!selectedClient) return;
    const today = new Date();
    const inFiveYears = new Date(today.getFullYear() + 5, today.getMonth(), today.getDate());
    setEditing(null);
    setForm({
      ...EMPTY_FORM,
      start_date: toISODate(today),
      target_date: toISODate(inFiveYears),
    });
    setFormError("");
    setShowForm(true);
  }

  function openEdit(g) {
    setEditing(g);
    setForm({
      name: g.name,
      type: g.type,
      target_amount: String(g.target_amount),
      initial_amount: String(g.initial_amount),
      monthly_contribution: String(g.monthly_contribution),
      expected_return_rate: String(g.expected_return_rate),
      start_date: g.start_date,
      target_date: g.target_date,
      description: g.description || "",
    });
    setFormError("");
    setShowForm(true);
  }

  async function saveGoal() {
    setFormError("");
    if (!form.name.trim()) { setFormError("Dê um nome à meta."); return; }
    const target = parseFloat(form.target_amount);
    if (!target || target <= 0) { setFormError("Defina um valor alvo válido."); return; }
    if (!form.start_date || !form.target_date) { setFormError("Defina data de início e data alvo."); return; }
    if (new Date(form.target_date) <= new Date(form.start_date)) {
      setFormError("A data alvo deve ser depois da data de início.");
      return;
    }

    setSaving(true);
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      console.error("[metas] auth.getUser failed:", userErr);
      setFormError("Sessão expirada. Faça login novamente.");
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name.trim(),
      type: form.type,
      target_amount: target,
      initial_amount: parseFloat(form.initial_amount) || 0,
      monthly_contribution: parseFloat(form.monthly_contribution) || 0,
      expected_return_rate: parseFloat(form.expected_return_rate) || 0,
      start_date: form.start_date,
      target_date: form.target_date,
      description: form.description.trim(),
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from("financial_goals").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("financial_goals").insert({
        ...payload,
        client_id: selectedClient,
        consultant_id: userData.user.id,
        status: "ativo",
      }));
    }

    setSaving(false);
    if (error) {
      console.error("[metas] save failed:", error);
      setFormError(error.message || "Erro ao salvar a meta.");
      return;
    }

    await reloadGoals();
    setShowForm(false);
    setEditing(null);
  }

  async function setStatus(g, status) {
    const { error } = await supabase.from("financial_goals").update({ status }).eq("id", g.id);
    if (error) {
      console.error("[metas] status update failed:", error);
      return;
    }
    await reloadGoals();
  }

  async function deleteGoal(g) {
    if (!confirm(`Excluir a meta "${g.name}" e todos os seus aportes?`)) return;
    const { error } = await supabase.from("financial_goals").delete().eq("id", g.id);
    if (error) {
      console.error("[metas] delete failed:", error);
      return;
    }
    if (detailGoal?.id === g.id) setDetailGoal(null);
    await reloadGoals();
  }

  // ─── Contributions ───
  function openDetail(g) {
    setDetailGoal(g);
    setContribForm({
      amount: "",
      contributed_at: toISODate(new Date()),
      notes: "",
    });
    setContribError("");
  }

  async function addContribution() {
    setContribError("");
    const amount = parseFloat(contribForm.amount);
    if (!amount || amount <= 0) { setContribError("Informe um valor de aporte válido."); return; }
    if (!contribForm.contributed_at) { setContribError("Informe a data do aporte."); return; }

    setSavingContrib(true);
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      setContribError("Sessão expirada. Faça login novamente.");
      setSavingContrib(false);
      return;
    }

    const { error } = await supabase.from("goal_contributions").insert({
      goal_id: detailGoal.id,
      consultant_id: userData.user.id,
      amount,
      contributed_at: contribForm.contributed_at,
      notes: contribForm.notes.trim(),
    });

    setSavingContrib(false);
    if (error) {
      console.error("[metas] add contribution failed:", error);
      setContribError(error.message || "Erro ao adicionar aporte.");
      return;
    }

    setContribForm({ amount: "", contributed_at: toISODate(new Date()), notes: "" });
    await reloadGoals();
  }

  async function deleteContribution(id) {
    const { error } = await supabase.from("goal_contributions").delete().eq("id", id);
    if (error) {
      console.error("[metas] delete contribution failed:", error);
      return;
    }
    await reloadGoals();
  }

  // ─── Render ───
  if (loadingInit) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size={28} />
      </div>
    );
  }

  const detailEnriched = detailGoal
    ? enriched.find((g) => g.id === detailGoal.id) || detailGoal
    : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Metas financeiras</h2>
          <p className="text-xs text-white/40 mt-0.5">Planeje objetivos por cliente e acompanhe progresso real vs projetado</p>
        </div>
        <button
          type="button"
          onClick={openNew}
          disabled={!selectedClient}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            selectedClient
              ? "bg-gradient-to-r from-indigo-500 to-violet-500 hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98]"
              : "bg-white/[0.05] text-white/25 cursor-not-allowed"
          }`}
        >
          <Plus size={15} /> Nova meta
        </button>
      </div>

      {/* Client selector */}
      <GlassCard className="p-5" delay={0}>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Users size={14} className="text-indigo-400" /> Selecione um cliente
        </h3>
        <select
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className="w-full sm:w-1/2 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
        >
          <option value="" className="bg-slate-900">— Escolha um cliente —</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id} className="bg-slate-900">{c.full_name}</option>
          ))}
        </select>
      </GlassCard>

      {!selectedClient ? (
        <GlassCard className="p-12 text-center" delay={0.05}>
          <Target size={28} className="mx-auto mb-3 text-white/15" />
          <p className="text-sm text-white/40">Selecione um cliente acima para ver e criar suas metas.</p>
        </GlassCard>
      ) : loadingGoals ? (
        <div className="py-10 flex justify-center"><Spinner /></div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total em metas" value={formatCurrency(stats.totalTarget)} icon={Target} delay={0.05} />
            <StatCard label="Contribuído" value={formatCurrency(stats.totalContributed)} icon={TrendingUp} delay={0.1} />
            <StatCard label="Progresso médio" value={`${Math.round(stats.avgProgress * 100)}%`} icon={Calendar} delay={0.15} />
            <StatCard label="Metas atingidas" value={stats.reached} icon={CheckCircle2} delay={0.2} />
          </div>

          {/* Goals list */}
          {enriched.length === 0 ? (
            <GlassCard className="p-12 text-center" delay={0.25}>
              <Target size={28} className="mx-auto mb-3 text-white/15" />
              <p className="text-sm text-white/40 mb-3">Nenhuma meta cadastrada para este cliente.</p>
              <button
                type="button"
                onClick={openNew}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Plus size={14} /> Criar primeira meta
              </button>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {enriched.map((g, idx) => {
                const tCfg = TYPE_CONFIG[g.type] || TYPE_CONFIG.outro;
                const sCfg = STATUS_CONFIG[g.status] || STATUS_CONFIG.ativo;
                const TIcon = tCfg.icon;
                const pct = Math.round(g.progress * 100);
                const target = new Date(g.target_date);
                return (
                  <GlassCard
                    key={g.id}
                    className="p-4 cursor-pointer hover:bg-white/[0.04] transition-all group"
                    delay={0.25 + idx * 0.03}
                    onClick={() => openDetail(g)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className={`p-2 rounded-lg bg-white/[0.05] border border-white/10 flex-shrink-0 ${tCfg.dot}`}>
                          <TIcon size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-white/90 truncate">{g.name}</h4>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`px-1.5 py-0.5 rounded border text-[9px] uppercase tracking-wider ${tCfg.pill}`}>{tCfg.label}</span>
                            <span className={`px-1.5 py-0.5 rounded border text-[9px] uppercase tracking-wider ${sCfg.pill}`}>{sCfg.label}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); openEdit(g); }}
                          className="p-1 rounded-md text-white/30 hover:text-white/80 hover:bg-white/[0.05] transition-all"
                          title="Editar"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); deleteGoal(g); }}
                          className="p-1 rounded-md text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Amounts */}
                    <div className="flex items-baseline justify-between mb-2">
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-white/30">Acumulado</p>
                        <p className="text-base font-semibold text-white/90">{formatCurrency(g.contributed)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] uppercase tracking-wider text-white/30">Alvo</p>
                        <p className="text-sm font-mono text-white/50">{formatCurrency(Number(g.target_amount))}</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct >= 100
                            ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                            : "bg-gradient-to-r from-indigo-500 to-violet-400"
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-white/40">
                      <span className="font-mono">{pct}% concluído</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={9} /> {target.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ─── Goal form modal ─── */}
      {showForm && (
        <Modal
          title={editing ? "Editar meta" : "Nova meta"}
          icon={editing ? Edit3 : Plus}
          size="lg"
          onClose={() => { setShowForm(false); setEditing(null); }}
        >
          <div className="space-y-3">
            <GlassInput
              label="Nome da meta"
              placeholder="Aposentadoria, casa própria, intercâmbio do João..."
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="goal-type" className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">Categoria</label>
                <select
                  id="goal-type"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                >
                  {Object.entries(TYPE_CONFIG).map(([k, c]) => (
                    <option key={k} value={k} className="bg-slate-900">{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="goal-target" className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">Valor alvo (R$)</label>
                <input
                  id="goal-target"
                  type="number"
                  min={0}
                  step={100}
                  value={form.target_amount}
                  onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="goal-initial" className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">Valor inicial</label>
                <input
                  id="goal-initial"
                  type="number"
                  min={0}
                  step={100}
                  value={form.initial_amount}
                  onChange={(e) => setForm({ ...form, initial_amount: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                />
              </div>
              <div>
                <label htmlFor="goal-monthly" className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">Aporte mensal</label>
                <input
                  id="goal-monthly"
                  type="number"
                  min={0}
                  step={50}
                  value={form.monthly_contribution}
                  onChange={(e) => setForm({ ...form, monthly_contribution: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                />
              </div>
              <div>
                <label htmlFor="goal-rate" className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">Taxa esperada (%a.a.)</label>
                <input
                  id="goal-rate"
                  type="number"
                  min={0}
                  step={0.5}
                  value={form.expected_return_rate}
                  onChange={(e) => setForm({ ...form, expected_return_rate: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="goal-start" className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">Início</label>
                <input
                  id="goal-start"
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                />
              </div>
              <div>
                <label htmlFor="goal-target-date" className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">Data alvo</label>
                <input
                  id="goal-target-date"
                  type="date"
                  value={form.target_date}
                  onChange={(e) => setForm({ ...form, target_date: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                />
              </div>
            </div>

            <div>
              <label htmlFor="goal-desc" className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">Observações</label>
              <textarea
                id="goal-desc"
                rows={2}
                placeholder="Contexto, premissas, lembretes..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40 resize-none"
              />
            </div>

            {formError && (
              <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                {formError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditing(null); }}
                className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white/80 hover:bg-white/[0.05] transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveGoal}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Spinner size={14} /> : <><Check size={14} /> {editing ? "Salvar" : "Criar meta"}</>}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Detail modal ─── */}
      {detailEnriched && (
        <Modal
          title={detailEnriched.name}
          icon={(TYPE_CONFIG[detailEnriched.type] || TYPE_CONFIG.outro).icon}
          size="2xl"
          onClose={() => setDetailGoal(null)}
        >
          <GoalDetail
            goal={detailEnriched}
            contributions={contributionsByGoal[detailEnriched.id] || []}
            projection={buildProjection(detailEnriched, contributionsByGoal[detailEnriched.id] || [])}
            contribForm={contribForm}
            setContribForm={setContribForm}
            contribError={contribError}
            savingContrib={savingContrib}
            onAddContribution={addContribution}
            onDeleteContribution={deleteContribution}
            onSetStatus={setStatus}
            onEdit={() => { setDetailGoal(null); openEdit(detailEnriched); }}
            onDelete={() => deleteGoal(detailEnriched)}
          />
        </Modal>
      )}
    </div>
  );
}

// ─── Detail content (separate to keep the page component readable) ───
function GoalDetail({
  goal, contributions, projection,
  contribForm, setContribForm, contribError, savingContrib,
  onAddContribution, onDeleteContribution, onSetStatus, onEdit, onDelete,
}) {
  const tCfg = TYPE_CONFIG[goal.type] || TYPE_CONFIG.outro;
  const sCfg = STATUS_CONFIG[goal.status] || STATUS_CONFIG.ativo;
  const pct = Math.round(goal.progress * 100);
  const target = new Date(goal.target_date);
  const start = new Date(goal.start_date);
  const today = new Date();
  const monthsLeft = Math.max(0, monthsBetween(today, target));

  return (
    <div className="space-y-4">
      {/* Top row: status, badges, actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`px-2 py-0.5 rounded border text-[10px] uppercase tracking-wider ${tCfg.pill}`}>{tCfg.label}</span>
          <span className={`px-2 py-0.5 rounded border text-[10px] uppercase tracking-wider ${sCfg.pill}`}>{sCfg.label}</span>
        </div>
        <div className="flex items-center gap-1">
          {goal.status === "ativo" ? (
            <>
              <button
                type="button"
                onClick={() => onSetStatus(goal, "atingido")}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
              >
                <CheckCircle2 size={11} /> Marcar atingida
              </button>
              <button
                type="button"
                onClick={() => onSetStatus(goal, "pausado")}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
              >
                <PauseCircle size={11} /> Pausar
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onSetStatus(goal, "ativo")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all"
            >
              <PlayCircle size={11} /> Reativar
            </button>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.05] transition-all"
            title="Editar"
          >
            <Edit3 size={13} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Excluir"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <SummaryCell label="Acumulado" value={formatCurrency(goal.contributed)} accent="text-white/90" />
        <SummaryCell label="Alvo" value={formatCurrency(Number(goal.target_amount))} />
        <SummaryCell label="Progresso" value={`${pct}%`} accent={pct >= 100 ? "text-emerald-300" : "text-white/90"} />
        <SummaryCell label="Meses restantes" value={monthsLeft} />
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            pct >= 100
              ? "bg-gradient-to-r from-emerald-500 to-teal-400"
              : "bg-gradient-to-r from-indigo-500 to-violet-400"
          }`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>

      {/* Chart */}
      <div>
        <h4 className="text-xs font-semibold mb-2 flex items-center gap-2">
          <TrendingUp size={13} className="text-indigo-400" /> Projeção vs realidade
        </h4>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={projection.points}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={TT} formatter={(v) => formatCurrency(v)} />
            <Legend wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }} />
            <ReferenceLine y={Number(goal.target_amount)} stroke="rgba(52, 211, 153, 0.4)" strokeDasharray="4 4" label={{ value: "Alvo", fill: "#34d399", fontSize: 10, position: "insideTopRight" }} />
            <Line type="monotone" dataKey="projetado" stroke="#818cf8" strokeWidth={2} dot={false} name="Projetado" />
            <Line type="monotone" dataKey="real" stroke="#34d399" strokeWidth={2} dot={false} name="Real" connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Add contribution */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
        <h4 className="text-xs font-semibold mb-2.5 flex items-center gap-2">
          <Plus size={12} className="text-indigo-400" /> Registrar aporte
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1.5fr_auto] gap-2">
          <input
            type="date"
            value={contribForm.contributed_at}
            onChange={(e) => setContribForm({ ...contribForm, contributed_at: e.target.value })}
            className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
          />
          <input
            type="number"
            min={0}
            step={50}
            placeholder="Valor (R$)"
            value={contribForm.amount}
            onChange={(e) => setContribForm({ ...contribForm, amount: e.target.value })}
            className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
          />
          <input
            type="text"
            placeholder="Observação (opcional)"
            value={contribForm.notes}
            onChange={(e) => setContribForm({ ...contribForm, notes: e.target.value })}
            className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
          />
          <button
            type="button"
            onClick={onAddContribution}
            disabled={savingContrib}
            className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-xs font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {savingContrib ? <Spinner size={12} /> : <><Plus size={12} /> Adicionar</>}
          </button>
        </div>
        {contribError && (
          <p className="text-[10px] text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5 mt-2 flex items-center gap-1">
            <AlertCircle size={10} /> {contribError}
          </p>
        )}
      </div>

      {/* Contributions log */}
      <div>
        <h4 className="text-xs font-semibold mb-2 text-white/60">Aportes ({contributions.length})</h4>
        {contributions.length === 0 ? (
          <p className="text-[11px] text-white/30 py-3 text-center bg-white/[0.02] rounded-lg">
            Nenhum aporte registrado ainda.
          </p>
        ) : (
          <div className="space-y-1 max-h-[180px] overflow-y-auto pr-1">
            {[...contributions].sort((a, b) => new Date(b.contributed_at) - new Date(a.contributed_at)).map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-2 bg-white/[0.02] border border-white/[0.04] rounded-lg px-3 py-1.5 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[10px] font-mono text-white/40 w-16 flex-shrink-0">
                    {new Date(`${c.contributed_at}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                  </span>
                  <span className="text-emerald-300 font-mono font-semibold">+{formatCurrency(Number(c.amount))}</span>
                  {c.notes && <span className="text-[10px] text-white/35 truncate">{c.notes}</span>}
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteContribution(c.id)}
                  className="p-1 rounded text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                  title="Excluir aporte"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {goal.description && (
        <div className="text-[11px] text-white/45 bg-white/[0.02] border border-white/[0.04] rounded-lg p-2.5">
          {goal.description}
        </div>
      )}
    </div>
  );
}

function SummaryCell({ label, value, accent = "text-white/80" }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
      <p className="text-[9px] uppercase tracking-wider text-white/30">{label}</p>
      <p className={`text-sm font-semibold ${accent}`}>{value}</p>
    </div>
  );
}
