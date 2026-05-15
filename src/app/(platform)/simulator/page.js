"use client";

import { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from "recharts";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { GlassCard, GlassInput, Modal, Spinner, StatCard } from "@/components/ui";
import {
  Calculator, Activity, Briefcase, TrendingUp, Target,
  Save, History, Trash2, Check, X, Plus, Clock,
  Users, GitCompare, Eye, ArrowRight,
} from "lucide-react";

const CHART_COLORS = ["#818cf8", "#34d399", "#fbbf24", "#f472b6", "#22d3ee"];
const TT = {
  background: "rgba(15,15,40,0.95)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  fontSize: 12,
};

function runSimulation(params) {
  const { initialValue, rfAlloc, selic, ibov, ipca, dolar, months } = params;
  const rfPct = rfAlloc / 100;
  const rvPct = 1 - rfPct;
  const proj = [];
  let v = initialValue;

  for (let m = 1; m <= months; m++) {
    const rfReturn = (selic / 100) / 12;
    const rvReturn = (ibov / 100) / 12;
    const monthlyReturn = rfPct * rfReturn + rvPct * rvReturn;
    v = v * (1 + monthlyReturn);
    proj.push({
      mes: `M${m}`,
      valor: Math.round(v * 100) / 100,
    });
  }

  return {
    initial: initialValue,
    final: Math.round(v * 100) / 100,
    rentab: Math.round((v / initialValue - 1) * 10000) / 100,
    ganho: Math.round((v - initialValue) * 100) / 100,
    proj,
  };
}

export default function SimulatorPage() {
  const supabase = getSupabaseBrowserClient();

  // Client/portfolio selection
  const [clients, setClients] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedPortfolio, setSelectedPortfolio] = useState("");

  // Params
  const [scenarioName, setScenarioName] = useState("");
  const [selic, setSelic] = useState(12.25);
  const [ipca, setIpca] = useState(4.5);
  const [ibov, setIbov] = useState(15);
  const [dolar, setDolar] = useState(5);
  const [months, setMonths] = useState(12);
  const [initialValue, setInitialValue] = useState(850000);
  const [rfAlloc, setRfAlloc] = useState(30);

  // Results
  const [results, setResults] = useState(null);

  // History & compare
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Compare mode
  const [compareIds, setCompareIds] = useState([]);
  const [compareData, setCompareData] = useState(null);
  const [showCompare, setShowCompare] = useState(false);

  const [loadingInit, setLoadingInit] = useState(true);

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

  // ─── Load portfolios when client changes ───
  useEffect(() => {
    if (!selectedClient) {
      setPortfolios([]);
      setSelectedPortfolio("");
      return;
    }
    async function load() {
      const { data } = await supabase
        .from("portfolios")
        .select("id, name, total_value")
        .eq("client_id", selectedClient)
        .eq("is_active", true);
      setPortfolios(data || []);

      if (data?.length > 0) {
        setSelectedPortfolio(data[0].id);
      }

      // Auto-set initial value from first portfolio
      if (data?.length > 0) {
        const total = data.reduce((s, p) => s + Number(p.total_value || 0), 0);
        if (total > 0) setInitialValue(total);
      }
    }
    load();
  }, [selectedClient, supabase]);

  // ─── Run simulation ───
  function run() {
    const r = runSimulation({ initialValue, rfAlloc, selic, ibov, ipca, dolar, months });
    setResults(r);
    setSaved(false);
    setSaveError("");
  }

  // ─── Save scenario to Supabase ───
  async function saveScenario() {
    setSaveError("");

    if (!results) {
      setSaveError("Rode uma simulação antes de salvar.");
      return;
    }
    if (!selectedPortfolio) {
      setSaveError("Selecione um cliente e uma carteira para salvar.");
      return;
    }

    setSaving(true);

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      console.error("[simulator] auth.getUser failed:", userErr);
      setSaveError("Sessão expirada. Faça login novamente.");
      setSaving(false);
      return;
    }
    const user = userData.user;

    const finalName =
      scenarioName.trim() ||
      `Cenário ${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

    const params = { initialValue, rfAlloc, selic, ibov, ipca, dolar, months };

    const { error } = await supabase.from("simulations").insert({
      portfolio_id: selectedPortfolio,
      consultant_id: user.id,
      scenario_name: finalName,
      description: `Selic ${selic}% | IBOV ${ibov}% | RF ${rfAlloc}% | ${months}m`,
      parameters: params,
      results: {
        initial: results.initial,
        final: results.final,
        rentab: results.rentab,
        ganho: results.ganho,
        proj: results.proj,
      },
    });

    setSaving(false);

    if (error) {
      console.error("[simulator] save failed:", error);
      setSaveError(error.message || "Erro ao salvar o cenário.");
      return;
    }

    if (!scenarioName.trim()) setScenarioName(finalName);
    setSaved(true);
  }

  // ─── Load history ───
  async function loadHistory() {
    setLoadingHistory(true);
    setShowHistory(true);
    setCompareIds([]);

    const { data } = await supabase
      .from("simulations")
      .select("*, portfolios(name, clients(full_name))")
      .order("created_at", { ascending: false })
      .limit(20);

    setSavedScenarios(data || []);
    setLoadingHistory(false);
  }

  // ─── Load a saved scenario into the form ───
  function loadScenario(s) {
    const p = s.parameters;
    if (p) {
      setInitialValue(p.initialValue || 850000);
      setRfAlloc(p.rfAlloc || 30);
      setSelic(p.selic || 12.25);
      setIbov(p.ibov || 15);
      setIpca(p.ipca || 4.5);
      setDolar(p.dolar || 5);
      setMonths(p.months || 12);
    }
    setScenarioName(s.scenario_name || "");
    if (s.results) setResults(s.results);
    setShowHistory(false);
    setSaved(false);
  }

  // ─── Delete scenario ───
  async function deleteScenario(id) {
    await supabase.from("simulations").delete().eq("id", id);
    setSavedScenarios((p) => p.filter((s) => s.id !== id));
    setCompareIds((p) => p.filter((x) => x !== id));
  }

  // ─── Compare scenarios ───
  function toggleCompare(id) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  }

  function runCompare() {
    const selected = savedScenarios.filter((s) => compareIds.includes(s.id));
    if (selected.length < 2) return;

    const maxMonths = Math.max(...selected.map((s) => s.results?.proj?.length || 0));
    const merged = [];

    for (let m = 0; m < maxMonths; m++) {
      const point = { mes: `M${m + 1}` };
      selected.forEach((s, i) => {
        const val = s.results?.proj?.[m]?.valor;
        if (val !== undefined) point[`s${i}`] = val;
      });
      merged.push(point);
    }

    setCompareData({ scenarios: selected, data: merged });
    setShowCompare(true);
  }

  // ─── Params config ───
  const paramFields = [
    { key: "selic", l: "Selic (%a.a.)", v: selic, s: setSelic },
    { key: "ipca", l: "IPCA (%a.a.)", v: ipca, s: setIpca },
    { key: "ibov", l: "IBOV (%a.a.)", v: ibov, s: setIbov },
    { key: "dolar", l: "USD/BRL", v: dolar, s: setDolar },
    { key: "months", l: "Meses", v: months, s: setMonths },
  ];

  // Can save only if portfolio is selected and we have results (name is auto-generated if missing)
  const canSave = !!results && !!selectedPortfolio;

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
          <h2 className="text-xl font-bold tracking-tight">Simulador de cenários</h2>
          <p className="text-xs text-white/40 mt-0.5">Projete, salve e compare cenários de mercado</p>
        </div>
        <button
          type="button"
          onClick={loadHistory}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white/40 hover:text-white/70 transition-all"
        >
          <History size={13} /> Cenários salvos
        </button>
      </div>

      {/* Client/Portfolio selector */}
      <GlassCard className="p-5" delay={0}>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Users size={14} className="text-indigo-400" /> Vincular a cliente (opcional para simular, obrigatório para salvar)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="selected-client" className="text-[10px] uppercase tracking-wider text-white/35">Cliente</label>
            <select
              id="selected-client"
              value={selectedClient}
              onChange={(e) => {
                setSelectedClient(e.target.value);
                setSelectedPortfolio("");
              }}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
            >
              <option value="" className="bg-slate-900">Nenhum (simulação livre)</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900">{c.full_name}</option>
              ))}
            </select>
          </div>
          {portfolios.length > 0 && (
            <div className="space-y-1.5" style={{ animation: "fadeInUp 0.2s ease both" }}>
              <label htmlFor="selected-portfolio" className="text-[10px] uppercase tracking-wider text-white/35">Carteira</label>
              <select
                id="selected-portfolio"
                value={selectedPortfolio}
                onChange={(e) => setSelectedPortfolio(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
              >
                <option value="" className="bg-slate-900">Selecione</option>
                {portfolios.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900">
                    {p.name} — {formatCurrency(Number(p.total_value))}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Parameters */}
      <GlassCard className="p-5" delay={0.05}>
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Calculator size={14} className="text-indigo-400" /> Parâmetros do cenário
        </h3>

        {/* Scenario name */}
        <div className="mb-4">
          <GlassInput
            label="Nome do cenário"
            placeholder="Ex: Base case, Selic alta, Recessão..."
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label htmlFor="initial-value" className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">Valor da carteira (R$)</label>
            <input
              id="initial-value"
              type="number"
              value={initialValue}
              onChange={(e) => setInitialValue(parseFloat(e.target.value) || 0)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
            />
          </div>
          <div>
            <label htmlFor="rf-alloc" className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">% Renda Fixa</label>
            <input
              id="rf-alloc"
              type="number"
              value={rfAlloc}
              onChange={(e) => setRfAlloc(parseFloat(e.target.value) || 0)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {paramFields.map((p) => (
            <div key={p.key}>
              <label htmlFor={`param-${p.key}`} className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">{p.l}</label>
              <input
                id={`param-${p.key}`}
                type="number"
                value={p.v}
                onChange={(e) => p.s(parseFloat(e.target.value) || 0)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={run}
          className="mt-5 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Activity size={15} /> Simular
        </button>
      </GlassCard>

      {/* Results */}
      {results && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Valor inicial" value={formatCurrency(results.initial)} icon={Briefcase} delay={0.1} />
            <StatCard label="Valor final" value={formatCurrency(results.final)} icon={TrendingUp} delay={0.15} />
            <StatCard label="Rentabilidade" value={`${results.rentab}%`} icon={Target} delay={0.2} />
            <StatCard label="Ganho" value={formatCurrency(results.ganho)} icon={Activity} delay={0.25} />
          </div>

          <GlassCard className="p-5" delay={0.3}>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Activity size={14} className="text-indigo-400" /> Projeção patrimonial
              {scenarioName && <span className="text-xs text-white/30 font-normal">— {scenarioName}</span>}
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={results.proj}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="mes" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={TT} formatter={(v) => formatCurrency(v)} />
                <Line type="monotone" dataKey="valor" stroke="#818cf8" strokeWidth={2} dot={false} name="Patrimônio" />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Save */}
          <div className="flex flex-wrap justify-center gap-3">
            {!saved ? (
              <button
                type="button"
                onClick={saveScenario}
                disabled={saving || !canSave}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                  canSave
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-white/[0.05] text-white/25 cursor-not-allowed"
                }`}
              >
                {saving ? <Spinner size={16} /> : <><Save size={15} /> Salvar cenário</>}
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 animate-fade-in">
                <Check size={16} /> Cenário salvo
              </div>
            )}
            {!canSave && results && (
              <p className="w-full text-center text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2">
                Selecione um cliente e uma carteira acima para salvar o cenário.
              </p>
            )}
            {saveError && (
              <p className="w-full text-center text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                {saveError}
              </p>
            )}
          </div>
        </>
      )}

      {/* ─── History modal ─── */}
      {showHistory && (
        <Modal title="Cenários salvos" icon={History} onClose={() => { setShowHistory(false); setCompareIds([]); }}>
          {loadingHistory ? (
            <div className="py-8 flex justify-center"><Spinner /></div>
          ) : savedScenarios.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/25">Nenhum cenário salvo ainda.</p>
          ) : (
            <>
              {/* Compare bar */}
              {compareIds.length >= 2 && (
                <div
                  className="flex items-center justify-between mb-3 px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20"
                  style={{ animation: "fadeInUp 0.2s ease both" }}
                >
                  <span className="text-xs text-indigo-300">{compareIds.length} selecionados</span>
                  <button
                    type="button"
                    onClick={runCompare}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-xs text-indigo-300 font-medium hover:bg-indigo-500/30 transition-all"
                  >
                    <GitCompare size={12} /> Comparar
                  </button>
                </div>
              )}

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {savedScenarios.map((s) => {
                  const isSelected = compareIds.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      className={`bg-white/[0.03] border rounded-xl p-3 transition-all ${
                        isSelected ? "border-indigo-500/30 bg-indigo-500/[0.04]" : "border-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleCompare(s.id)}
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                              isSelected
                                ? "bg-indigo-500 border-indigo-400"
                                : "border-white/20 hover:border-white/40"
                            }`}
                          >
                            {isSelected && <Check size={11} />}
                          </button>
                          <h4 className="text-sm font-medium text-white/80">{s.scenario_name}</h4>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => loadScenario(s)}
                            className="p-1 rounded-md text-white/25 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                            title="Carregar"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteScenario(s.id)}
                            className="p-1 rounded-md text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Excluir"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-[10px] text-white/35">
                        <span className="flex items-center gap-1">
                          <Clock size={9} />
                          {new Date(s.created_at).toLocaleDateString("pt-BR", {
                            day: "2-digit", month: "2-digit", year: "2-digit",
                          })}
                        </span>
                        {s.portfolios?.clients?.full_name && (
                          <span className="flex items-center gap-1">
                            <Users size={9} /> {s.portfolios.clients.full_name}
                          </span>
                        )}
                        {s.results?.rentab !== undefined && (
                          <span className={`font-mono ${s.results.rentab >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {s.results.rentab >= 0 ? "+" : ""}{s.results.rentab}%
                          </span>
                        )}
                      </div>

                      {s.description && (
                        <p className="text-[10px] text-white/20 mt-1">{s.description}</p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-white/30">
                        <span>{formatCurrency(s.results?.initial || 0)}</span>
                        <ArrowRight size={9} />
                        <span className="text-white/50">{formatCurrency(s.results?.final || 0)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-[9px] text-white/20 text-center mt-3">
                Selecione 2-4 cenários para comparar
              </p>
            </>
          )}
        </Modal>
      )}

      {/* ─── Compare modal ─── */}
      {showCompare && compareData?.scenarios && (
        <Modal title="Comparar cenários" icon={GitCompare} onClose={() => setShowCompare(false)}>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mb-4">
            {compareData.scenarios.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full" style={{ background: CHART_COLORS[i] }} />
                <span className="text-white/60">{s.scenario_name}</span>
                <span className="font-mono text-white/30">
                  {s.results?.rentab >= 0 ? "+" : ""}{s.results?.rentab}%
                </span>
              </div>
            ))}
          </div>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={compareData.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="mes" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={TT} formatter={(v) => formatCurrency(v)} />
              {compareData.scenarios.map((s, i) => (
                <Line key={s.id} type="monotone" dataKey={`s${i}`} stroke={CHART_COLORS[i]} strokeWidth={2} dot={false} name={s.scenario_name} />
              ))}
            </LineChart>
          </ResponsiveContainer>

          {/* Summary table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] text-[9px] uppercase text-white/30">
                  <th className="text-left py-2 px-2">Cenário</th>
                  <th className="text-right py-2 px-2">Inicial</th>
                  <th className="text-right py-2 px-2">Final</th>
                  <th className="text-right py-2 px-2">Rent.</th>
                  <th className="text-right py-2 px-2">Ganho</th>
                </tr>
              </thead>
              <tbody>
                {compareData.scenarios.map((s, i) => (
                  <tr key={s.id} className="border-b border-white/[0.03]">
                    <td className="py-2 px-2 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i] }} />
                      <span className="text-white/70">{s.scenario_name}</span>
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-white/40">
                      {formatCurrency(s.results?.initial || 0)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-white/60">
                      {formatCurrency(s.results?.final || 0)}
                    </td>
                    <td className={`py-2 px-2 text-right font-mono ${(s.results?.rentab || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {s.results?.rentab}%
                    </td>
                    <td className={`py-2 px-2 text-right font-mono ${(s.results?.ganho || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {formatCurrency(s.results?.ganho || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </div>
  );
}