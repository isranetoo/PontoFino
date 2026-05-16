"use client";

import { useState, useEffect, useMemo } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { RISK_LABELS } from "@/lib/constants";
import {
  SUITABILITY_QUESTIONS, calculateScore, profileFromScore,
  observedProfileFromAllocation, matchLevel, defaultExpirationDate,
} from "@/lib/suitability";
import { GlassCard, Modal, Spinner, StatCard } from "@/components/ui";
import {
  ShieldCheck, Users, ClipboardList, AlertTriangle, CheckCircle2, Save,
  History, Calendar, FileText, Trash2, Eye, Plus, ArrowRight, Activity,
} from "lucide-react";

const PROFILE_PILL = {
  conservative: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  moderate:     "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
  balanced:     "bg-indigo-500/15 text-indigo-300 border-indigo-500/20",
  growth:       "bg-amber-500/15 text-amber-300 border-amber-500/20",
  aggressive:   "bg-rose-500/15 text-rose-300 border-rose-500/20",
};

const MATCH_CONFIG = {
  aligned: { label: "Aderente",            color: "text-emerald-300", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
  mild:    { label: "Desenquadramento leve", color: "text-amber-300",   bg: "bg-amber-500/10 border-amber-500/20",   icon: AlertTriangle },
  severe:  { label: "Desenquadramento forte", color: "text-rose-300",  bg: "bg-rose-500/10 border-rose-500/20",     icon: AlertTriangle },
};

const ASSET_CLASS_LABEL = {
  caixa: "Caixa",
  renda_fixa: "Renda Fixa",
  multimercado: "Multimercado",
  fiis: "FIIs",
  acoes_brasil: "Ações Brasil",
  acoes_eua: "Ações EUA",
  internacional: "Internacional",
  commodities: "Commodities",
  cripto: "Cripto",
  outros: "Outros",
};

function diffDays(dateStr) {
  const target = new Date(`${dateStr}T00:00:00`);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.floor((target - now) / (1000 * 60 * 60 * 24));
}

export default function SuitabilityPage() {
  const supabase = getSupabaseBrowserClient();

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingClient, setLoadingClient] = useState(false);

  const [current, setCurrent] = useState(null);            // questionário vigente
  const [questHistory, setQuestHistory] = useState([]);    // todos questionários
  const [validations, setValidations] = useState([]);      // snapshots
  const [allocation, setAllocation] = useState({});        // composição atual da carteira
  const [portfolioTotal, setPortfolioTotal] = useState(0);

  // Modals
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [answers, setAnswers] = useState({});
  const [savingQ, setSavingQ] = useState(false);
  const [qError, setQError] = useState("");

  const [viewQuestionnaire, setViewQuestionnaire] = useState(null);
  const [viewValidation, setViewValidation] = useState(null);

  const [savingV, setSavingV] = useState(false);
  const [vError, setVError] = useState("");

  // ─── Init ───
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

  async function loadForClient() {
    if (!selectedClient) return;
    setLoadingClient(true);

    const [qRes, vRes, pRes] = await Promise.all([
      supabase
        .from("suitability_questionnaires")
        .select("*")
        .eq("client_id", selectedClient)
        .order("issued_at", { ascending: false }),
      supabase
        .from("suitability_validations")
        .select("*")
        .eq("client_id", selectedClient)
        .order("validated_at", { ascending: false }),
      supabase
        .from("portfolios")
        .select("id, total_value, portfolio_assets(asset_class, current_value)")
        .eq("client_id", selectedClient)
        .eq("is_active", true),
    ]);

    const quests = qRes.data || [];
    setQuestHistory(quests);
    setCurrent(quests.find((q) => q.is_current) || null);
    setValidations(vRes.data || []);

    // Aggregate allocation across all active portfolios
    const totals = {};
    let grand = 0;
    for (const p of pRes.data || []) {
      for (const a of p.portfolio_assets || []) {
        const v = Number(a.current_value) || 0;
        totals[a.asset_class] = (totals[a.asset_class] || 0) + v;
        grand += v;
      }
    }
    const alloc = {};
    if (grand > 0) {
      for (const [k, v] of Object.entries(totals)) alloc[k] = v / grand;
    }
    setAllocation(alloc);
    setPortfolioTotal(grand);

    setLoadingClient(false);
  }

  useEffect(() => {
    if (!selectedClient) {
      setCurrent(null);
      setQuestHistory([]);
      setValidations([]);
      setAllocation({});
      setPortfolioTotal(0);
      return;
    }
    loadForClient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClient]);

  // ─── Derived: observed profile + match ───
  const observed = useMemo(
    () => observedProfileFromAllocation(allocation),
    [allocation],
  );

  const match = useMemo(() => {
    if (!current || portfolioTotal === 0) return null;
    return matchLevel(current.resulting_profile, observed.profile);
  }, [current, observed, portfolioTotal]);

  const expiry = useMemo(() => {
    if (!current) return null;
    const days = diffDays(current.expires_at);
    return { days, expired: days < 0, soon: days >= 0 && days <= 60 };
  }, [current]);

  // ─── Questionnaire flow ───
  function openQuestionnaire() {
    if (!selectedClient) return;
    setAnswers({});
    setQError("");
    setShowQuestionnaire(true);
  }

  const liveScore = useMemo(() => calculateScore(answers), [answers]);
  const liveProfile = useMemo(() => profileFromScore(liveScore), [liveScore]);
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === SUITABILITY_QUESTIONS.length;

  async function saveQuestionnaire() {
    setQError("");
    if (!allAnswered) { setQError("Responda todas as perguntas antes de salvar."); return; }
    setSavingQ(true);

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      setQError("Sessão expirada. Faça login novamente.");
      setSavingQ(false);
      return;
    }

    // Mark existing current as not current
    if (current) {
      const { error: updErr } = await supabase
        .from("suitability_questionnaires")
        .update({ is_current: false })
        .eq("id", current.id);
      if (updErr) {
        console.error("[suitability] mark old not-current failed:", updErr);
        setQError(updErr.message || "Erro ao atualizar questionário anterior.");
        setSavingQ(false);
        return;
      }
    }

    const { error } = await supabase.from("suitability_questionnaires").insert({
      consultant_id: userData.user.id,
      client_id: selectedClient,
      answers,
      total_score: liveScore,
      resulting_profile: liveProfile,
      is_current: true,
      expires_at: defaultExpirationDate(new Date()),
    });

    setSavingQ(false);
    if (error) {
      console.error("[suitability] insert questionnaire failed:", error);
      // Try to revert previous flip
      if (current) {
        await supabase.from("suitability_questionnaires").update({ is_current: true }).eq("id", current.id);
      }
      setQError(error.message || "Erro ao salvar questionário.");
      return;
    }

    setShowQuestionnaire(false);
    await loadForClient();
  }

  async function deleteQuestionnaire(q) {
    if (!confirm(`Excluir o questionário emitido em ${new Date(q.issued_at).toLocaleDateString("pt-BR")}?`)) return;
    const { error } = await supabase.from("suitability_questionnaires").delete().eq("id", q.id);
    if (error) {
      console.error("[suitability] delete questionnaire failed:", error);
      return;
    }
    await loadForClient();
  }

  // ─── Save validation snapshot ───
  async function saveValidation() {
    setVError("");
    if (!current) { setVError("Faça um questionário antes de validar."); return; }
    if (portfolioTotal === 0) { setVError("Cliente não tem ativos cadastrados em carteira ativa."); return; }

    setSavingV(true);

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      setVError("Sessão expirada. Faça login novamente.");
      setSavingV(false);
      return;
    }

    const { error } = await supabase.from("suitability_validations").insert({
      consultant_id: userData.user.id,
      client_id: selectedClient,
      questionnaire_id: current.id,
      declared_profile: current.resulting_profile,
      observed_profile: observed.profile,
      match_level: match,
      risk_score: observed.score,
      portfolio_snapshot: allocation,
    });

    setSavingV(false);
    if (error) {
      console.error("[suitability] insert validation failed:", error);
      setVError(error.message || "Erro ao salvar validação.");
      return;
    }
    await loadForClient();
  }

  async function deleteValidation(v) {
    if (!confirm("Excluir esta validação do histórico?")) return;
    const { error } = await supabase.from("suitability_validations").delete().eq("id", v.id);
    if (error) {
      console.error("[suitability] delete validation failed:", error);
      return;
    }
    await loadForClient();
  }

  // ─── Render ───
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
          <h2 className="text-xl font-bold tracking-tight">Suitability</h2>
          <p className="text-xs text-white/40 mt-0.5">Questionário de perfil, validade e alerta de desenquadramento</p>
        </div>
        <button
          type="button"
          onClick={openQuestionnaire}
          disabled={!selectedClient}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            selectedClient
              ? "bg-gradient-to-r from-indigo-500 to-violet-500 hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98]"
              : "bg-white/[0.05] text-white/25 cursor-not-allowed"
          }`}
        >
          <ClipboardList size={15} /> Novo questionário
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
          <ShieldCheck size={28} className="mx-auto mb-3 text-white/15" />
          <p className="text-sm text-white/40">Selecione um cliente acima para ver suitability, validações e histórico.</p>
        </GlassCard>
      ) : loadingClient ? (
        <div className="py-10 flex justify-center"><Spinner /></div>
      ) : (
        <>
          {/* Current status */}
          {!current ? (
            <GlassCard className="p-12 text-center" delay={0.05}>
              <ClipboardList size={28} className="mx-auto mb-3 text-white/15" />
              <p className="text-sm text-white/40 mb-3">Este cliente ainda não tem questionário de suitability.</p>
              <button
                type="button"
                onClick={openQuestionnaire}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Plus size={14} /> Aplicar primeiro questionário
              </button>
            </GlassCard>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard label="Perfil declarado" value={RISK_LABELS[current.resulting_profile] || current.resulting_profile} icon={ShieldCheck} delay={0.05} />
                <StatCard label="Score" value={`${current.total_score} / 100`} icon={Activity} delay={0.1} />
                <StatCard
                  label="Validade"
                  value={expiry?.expired ? "Vencido" : expiry?.days != null ? `${expiry.days}d` : "—"}
                  icon={Calendar}
                  delay={0.15}
                />
                <StatCard
                  label="Validações"
                  value={validations.length}
                  icon={History}
                  delay={0.2}
                />
              </div>

              {/* Alignment card */}
              <GlassCard className="p-5" delay={0.25}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                      <ShieldCheck size={14} className="text-indigo-400" /> Aderência atual
                    </h3>

                    {portfolioTotal === 0 ? (
                      <p className="text-xs text-white/40 bg-white/[0.02] border border-white/[0.05] rounded-lg px-3 py-2 inline-flex items-center gap-2">
                        <AlertTriangle size={12} className="text-amber-400" />
                        Sem carteira ativa pra comparar. Cadastre ativos do cliente em Rebalanceamento.
                      </p>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-center gap-3 text-xs mb-3">
                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-white/30">Declarado</p>
                            <span className={`mt-1 inline-block px-2 py-0.5 rounded border text-[11px] font-semibold ${PROFILE_PILL[current.resulting_profile]}`}>
                              {RISK_LABELS[current.resulting_profile]}
                            </span>
                          </div>
                          <ArrowRight size={14} className="text-white/30 self-end mb-1" />
                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-white/30">Observado (carteira)</p>
                            <span className={`mt-1 inline-block px-2 py-0.5 rounded border text-[11px] font-semibold ${PROFILE_PILL[observed.profile]}`}>
                              {RISK_LABELS[observed.profile]}
                            </span>
                          </div>
                          <div className="ml-auto">
                            <p className="text-[9px] uppercase tracking-wider text-white/30">Score de risco</p>
                            <p className="text-sm font-mono font-semibold text-white/80">{observed.score} / 10</p>
                          </div>
                        </div>

                        {match && (() => {
                          const cfg = MATCH_CONFIG[match];
                          const Icon = cfg.icon;
                          return (
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${cfg.bg} ${cfg.color}`}>
                              <Icon size={14} />
                              <span className="text-xs font-semibold">{cfg.label}</span>
                              {match !== "aligned" && (
                                <span className="text-[10px] opacity-75 ml-2">
                                  A composição atual da carteira é{" "}
                                  {match === "severe" ? "muito mais" : "mais"}{" "}
                                  {observed.profile === "aggressive" || observed.profile === "growth" ? "arriscada" : "conservadora"}{" "}
                                  do que o perfil declarado.
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </>
                    )}

                    {expiry?.expired && (
                      <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                        <AlertTriangle size={13} /> Questionário vencido em {new Date(current.expires_at).toLocaleDateString("pt-BR")}. Renove o suitability.
                      </div>
                    )}
                    {!expiry?.expired && expiry?.soon && (
                      <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                        <AlertTriangle size={13} /> Vence em {expiry.days} dias ({new Date(current.expires_at).toLocaleDateString("pt-BR")}).
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={saveValidation}
                      disabled={savingV || portfolioTotal === 0}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingV ? <Spinner size={14} /> : <><Save size={14} /> Salvar validação</>}
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewQuestionnaire(current)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white/60 hover:text-white/90 hover:bg-white/[0.08] transition-all"
                    >
                      <Eye size={12} /> Ver respostas
                    </button>
                  </div>
                </div>

                {vError && (
                  <p className="mt-3 text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                    {vError}
                  </p>
                )}

                {/* Allocation breakdown */}
                {portfolioTotal > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    <p className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Composição atual</p>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(allocation)
                        .sort((a, b) => b[1] - a[1])
                        .map(([klass, w]) => (
                          <span
                            key={klass}
                            className="px-2 py-0.5 rounded-md text-[10px] bg-white/[0.04] border border-white/[0.08] text-white/60"
                          >
                            {ASSET_CLASS_LABEL[klass] || klass}{" "}
                            <span className="font-mono font-semibold text-white/80">{Math.round(w * 100)}%</span>
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </GlassCard>

              {/* History split */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Questionários */}
                <GlassCard className="p-5" delay={0.3}>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <ClipboardList size={14} className="text-indigo-400" /> Histórico de questionários ({questHistory.length})
                  </h3>
                  {questHistory.length === 0 ? (
                    <p className="text-xs text-white/30 py-3 text-center">Nenhum questionário ainda.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                      {questHistory.map((q) => (
                        <div
                          key={q.id}
                          className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs transition-all ${
                            q.is_current
                              ? "bg-indigo-500/[0.06] border-indigo-500/20"
                              : "bg-white/[0.02] border-white/[0.04]"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`px-1.5 py-0.5 rounded border text-[9px] uppercase tracking-wider font-semibold ${PROFILE_PILL[q.resulting_profile]}`}>
                              {RISK_LABELS[q.resulting_profile]}
                            </span>
                            <span className="text-[10px] font-mono text-white/40">{q.total_score} pts</span>
                            <span className="text-[10px] text-white/40">
                              {new Date(q.issued_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                            </span>
                            {q.is_current && (
                              <span className="px-1 py-0.5 rounded text-[9px] uppercase tracking-wider font-semibold bg-indigo-500/15 text-indigo-300">vigente</span>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => setViewQuestionnaire(q)}
                              className="p-1 rounded text-white/30 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all"
                              title="Ver respostas"
                            >
                              <Eye size={11} />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteQuestionnaire(q)}
                              className="p-1 rounded text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                              title="Excluir"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </GlassCard>

                {/* Validações */}
                <GlassCard className="p-5" delay={0.35}>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-indigo-400" /> Histórico de validações ({validations.length})
                  </h3>
                  {validations.length === 0 ? (
                    <p className="text-xs text-white/30 py-3 text-center">Nenhuma validação salva ainda.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                      {validations.map((v) => {
                        const cfg = MATCH_CONFIG[v.match_level];
                        const Icon = cfg.icon;
                        return (
                          <div
                            key={v.id}
                            className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-white/[0.04] bg-white/[0.02] text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Icon size={12} className={cfg.color} />
                              <span className={`${cfg.color} font-semibold text-[10px]`}>{cfg.label}</span>
                              <span className="text-[10px] text-white/40">
                                {RISK_LABELS[v.declared_profile]} → {RISK_LABELS[v.observed_profile]}
                              </span>
                              <span className="text-[10px] text-white/30">
                                {new Date(v.validated_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                              </span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <button
                                type="button"
                                onClick={() => setViewValidation(v)}
                                className="p-1 rounded text-white/30 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all"
                                title="Detalhes"
                              >
                                <Eye size={11} />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteValidation(v)}
                                className="p-1 rounded text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                title="Excluir"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </GlassCard>
              </div>
            </>
          )}
        </>
      )}

      {/* ─── Questionnaire modal ─── */}
      {showQuestionnaire && (
        <Modal
          title="Questionário de suitability"
          icon={ClipboardList}
          size="2xl"
          onClose={() => setShowQuestionnaire(false)}
        >
          <div className="space-y-4">
            <p className="text-[11px] text-white/40">
              Responda as {SUITABILITY_QUESTIONS.length} perguntas abaixo. O perfil é calculado automaticamente
              conforme você responde. Total possível: 100 pontos. Validade: 24 meses.
            </p>

            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
              {SUITABILITY_QUESTIONS.map((q, idx) => (
                <div key={q.id} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3">
                  <p className="text-sm font-medium text-white/85 mb-2">
                    <span className="text-white/30 font-mono mr-2">{idx + 1}.</span>
                    {q.text}
                  </p>
                  <div className="space-y-1">
                    {q.options.map((opt, oi) => {
                      const checked = answers[q.id] === oi;
                      return (
                        <label
                          key={oi}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer text-xs transition-all ${
                            checked
                              ? "bg-indigo-500/10 border-indigo-500/30 text-white"
                              : "bg-white/[0.02] border-white/[0.04] text-white/60 hover:bg-white/[0.04] hover:text-white/80"
                          }`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            checked={checked}
                            onChange={() => setAnswers({ ...answers, [q.id]: oi })}
                            className="accent-indigo-500"
                          />
                          <span className="flex-1">{opt.label}</span>
                          <span className="text-[10px] font-mono text-white/30">+{opt.score}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Live score */}
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/30">Respondidas</p>
                  <p className="text-sm font-mono font-semibold text-white/80">
                    {answeredCount} / {SUITABILITY_QUESTIONS.length}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/30">Score</p>
                  <p className="text-sm font-mono font-semibold text-white/80">{liveScore} / 100</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/30">Perfil resultante</p>
                  <span className={`inline-block mt-0.5 px-2 py-0.5 rounded border text-[11px] font-semibold ${PROFILE_PILL[liveProfile]}`}>
                    {RISK_LABELS[liveProfile]}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuestionnaire(false)}
                  className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white/80 hover:bg-white/[0.05] transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={saveQuestionnaire}
                  disabled={savingQ || !allAnswered}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingQ ? <Spinner size={14} /> : <><Save size={14} /> Salvar</>}
                </button>
              </div>
            </div>

            {qError && (
              <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                {qError}
              </p>
            )}
          </div>
        </Modal>
      )}

      {/* ─── View questionnaire modal ─── */}
      {viewQuestionnaire && (
        <Modal
          title={`Questionário de ${new Date(viewQuestionnaire.issued_at).toLocaleDateString("pt-BR")}`}
          icon={FileText}
          size="2xl"
          onClose={() => setViewQuestionnaire(null)}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <SummaryCell label="Perfil" value={RISK_LABELS[viewQuestionnaire.resulting_profile]} pill={PROFILE_PILL[viewQuestionnaire.resulting_profile]} />
              <SummaryCell label="Score" value={`${viewQuestionnaire.total_score} / 100`} />
              <SummaryCell label="Emitido em" value={new Date(viewQuestionnaire.issued_at).toLocaleDateString("pt-BR")} />
              <SummaryCell label="Vence em" value={new Date(`${viewQuestionnaire.expires_at}T00:00:00`).toLocaleDateString("pt-BR")} />
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {SUITABILITY_QUESTIONS.map((q, idx) => {
                const selectedIdx = viewQuestionnaire.answers?.[q.id];
                const selectedOpt = selectedIdx != null ? q.options[selectedIdx] : null;
                return (
                  <div key={q.id} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3">
                    <p className="text-xs text-white/70 mb-1">
                      <span className="text-white/30 font-mono mr-1">{idx + 1}.</span>
                      {q.text}
                    </p>
                    {selectedOpt ? (
                      <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs">
                        <span className="text-white/85">{selectedOpt.label}</span>
                        <span className="text-[10px] font-mono text-indigo-300">+{selectedOpt.score}</span>
                      </div>
                    ) : (
                      <p className="text-[10px] text-white/25">Sem resposta</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Modal>
      )}

      {/* ─── View validation modal ─── */}
      {viewValidation && (
        <Modal
          title={`Validação — ${new Date(viewValidation.validated_at).toLocaleDateString("pt-BR")}`}
          icon={ShieldCheck}
          size="lg"
          onClose={() => setViewValidation(null)}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <SummaryCell label="Declarado" value={RISK_LABELS[viewValidation.declared_profile]} pill={PROFILE_PILL[viewValidation.declared_profile]} />
              <SummaryCell label="Observado" value={RISK_LABELS[viewValidation.observed_profile]} pill={PROFILE_PILL[viewValidation.observed_profile]} />
              <SummaryCell label="Aderência" value={MATCH_CONFIG[viewValidation.match_level].label} />
              <SummaryCell label="Score risco" value={`${viewValidation.risk_score} / 10`} />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Composição na data</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(viewValidation.portfolio_snapshot || {})
                  .sort((a, b) => b[1] - a[1])
                  .map(([klass, w]) => (
                    <span
                      key={klass}
                      className="px-2 py-0.5 rounded-md text-[10px] bg-white/[0.04] border border-white/[0.08] text-white/60"
                    >
                      {ASSET_CLASS_LABEL[klass] || klass}{" "}
                      <span className="font-mono font-semibold text-white/80">{Math.round(Number(w) * 100)}%</span>
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function SummaryCell({ label, value, pill }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
      <p className="text-[9px] uppercase tracking-wider text-white/30">{label}</p>
      {pill ? (
        <span className={`inline-block mt-0.5 px-2 py-0.5 rounded border text-[11px] font-semibold ${pill}`}>{value}</span>
      ) : (
        <p className="text-sm font-semibold text-white/85">{value}</p>
      )}
    </div>
  );
}
