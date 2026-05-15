"use client";

import { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { GlassCard, StatCard, Spinner } from "@/components/ui";
import {
  Activity, BarChart3, TrendingUp, Target, Download,
  Users, Briefcase, Calendar, RefreshCw,
} from "lucide-react";

const TT = {
  background: "rgba(15,15,40,0.95)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  fontSize: 12,
};

/**
 * Build monthly performance from rebalancing snapshots.
 *
 * Each rebalancing_operation has:
 *   - executed_at: when it happened
 *   - total_before: portfolio value BEFORE the operation (organic growth)
 *   - new_capital: cash added
 *   - total_after: value AFTER (total_before + new_capital, redistributed)
 *
 * Between two operations the portfolio grew from total_after(prev) → total_before(next).
 * That organic delta is the real return (excluding new capital).
 *
 * We group by month and compute a TWR (Time-Weighted Return) approximation.
 */
function buildPerformance(operations, cdiAnnual) {
  if (!operations || operations.length < 2) return { monthly: [], accumulated: [], kpis: null };

  const sorted = [...operations].sort(
    (a, b) => new Date(a.executed_at) - new Date(b.executed_at)
  );

  // Build return periods between consecutive operations
  const periods = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];

    const baseValue = Number(prev.total_after);
    const endValue = Number(curr.total_before);

    if (baseValue <= 0) continue;

    const periodReturn = (endValue - baseValue) / baseValue;
    const date = new Date(curr.executed_at);

    periods.push({
      date,
      month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      monthLabel: date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      periodReturn,
      baseValue,
      endValue,
    });
  }

  if (periods.length === 0) return { monthly: [], accumulated: [], kpis: null };

  // Group by month — compound returns within the same month
  const monthMap = new Map();
  for (const p of periods) {
    if (!monthMap.has(p.month)) {
      monthMap.set(p.month, { month: p.month, label: p.monthLabel, factor: 1 });
    }
    const entry = monthMap.get(p.month);
    entry.factor *= (1 + p.periodReturn);
  }

  // Monthly CDI rate
  const cdiMonthly = Math.pow(1 + (cdiAnnual / 100), 1 / 12) - 1;

  // Build monthly data
  const monthlyData = [];
  const months = [...monthMap.values()].sort((a, b) => a.month.localeCompare(b.month));

  for (const m of months) {
    const carteira = Math.round((m.factor - 1) * 10000) / 100;
    const cdi = Math.round(cdiMonthly * 10000) / 100;
    monthlyData.push({ mes: m.label, month: m.month, carteira, cdi });
  }

  // Build accumulated data
  let cartAcc = 0;
  let cdiAcc = 0;
  const accumulated = monthlyData.map((m) => {
    cartAcc += m.carteira;
    cdiAcc += m.cdi;
    return {
      mes: m.mes,
      cartAcc: Math.round(cartAcc * 100) / 100,
      cdiAcc: Math.round(cdiAcc * 100) / 100,
    };
  });

  // KPIs
  const totalReturn = cartAcc;
  const totalCdi = cdiAcc;
  const excessReturn = Math.round((totalReturn - totalCdi) * 100) / 100;

  // Sharpe ratio approximation
  const returns = monthlyData.map((m) => m.carteira);
  const avgReturn = returns.reduce((s, r) => s + r, 0) / returns.length;
  const variance = returns.reduce((s, r) => s + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  const sharpe = stdDev > 0
    ? Math.round(((avgReturn - cdiMonthly * 100) / stdDev) * 100) / 100
    : 0;

  const kpis = {
    totalReturn: Math.round(totalReturn * 100) / 100,
    vsCdi: excessReturn,
    sharpe,
    months: monthlyData.length,
  };

  return { monthly: monthlyData, accumulated, kpis };
}

export default function ReportsPage() {
  const supabase = getSupabaseBrowserClient();

  const [clients, setClients] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedPortfolio, setSelectedPortfolio] = useState("");
  const [operations, setOperations] = useState([]);

  const [cdiRate, setCdiRate] = useState(12.25);

  const [loading, setLoading] = useState(true);
  const [loadingOps, setLoadingOps] = useState(false);

  // ─── Init ───
  useEffect(() => {
    async function init() {
      const { data } = await supabase
        .from("clients")
        .select("id, full_name")
        .eq("is_active", true)
        .order("full_name");
      setClients(data || []);
      setLoading(false);
    }
    init();
  }, [supabase]);

  // ─── Load portfolios when client changes ───
  useEffect(() => {
    if (!selectedClient) {
      setPortfolios([]);
      setSelectedPortfolio("");
      setOperations([]);
      return;
    }
    async function load() {
      const { data } = await supabase
        .from("portfolios")
        .select("id, name, total_value")
        .eq("client_id", selectedClient)
        .eq("is_active", true);
      setPortfolios(data || []);
    }
    load();
  }, [selectedClient, supabase]);

  // ─── Load operations when portfolio changes ───
  useEffect(() => {
    if (!selectedPortfolio) {
      setOperations([]);
      return;
    }
    async function loadOps() {
      setLoadingOps(true);
      const { data } = await supabase
        .from("rebalancing_operations")
        .select("*")
        .eq("portfolio_id", selectedPortfolio)
        .order("executed_at", { ascending: true });
      setOperations(data || []);
      setLoadingOps(false);
    }
    loadOps();
  }, [selectedPortfolio, supabase]);

  // ─── Compute performance ───
  const { monthly, accumulated, kpis } = useMemo(
    () => buildPerformance(operations, cdiRate),
    [operations, cdiRate]
  );

  const hasData = monthly.length > 0 && kpis;

  if (loading) {
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
          <h2 className="text-xl font-bold tracking-tight">Relatórios</h2>
          <p className="text-xs text-white/40 mt-0.5">Performance real a partir do histórico de rebalanceamentos</p>
        </div>
        {hasData && (
          <button type="button" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all">
            <Download size={15} /> Exportar PDF
          </button>
        )}
      </div>

      {/* Selectors */}
      <GlassCard className="p-5" delay={0}>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Users size={14} className="text-indigo-400" /> Selecionar carteira
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              <option value="" className="bg-slate-900">Selecione um cliente</option>
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

          <div className="space-y-1.5">
            <label htmlFor="cdi-rate" className="text-[10px] uppercase tracking-wider text-white/35">CDI/Selic benchmark (%a.a.)</label>
            <input
              id="cdi-rate"
              type="number"
              value={cdiRate}
              onChange={(e) => setCdiRate(parseFloat(e.target.value) || 0)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
            />
          </div>
        </div>
      </GlassCard>

      {/* Loading */}
      {loadingOps && (
        <div className="py-8 flex justify-center"><Spinner size={24} /></div>
      )}

      {/* No portfolio selected */}
      {!selectedPortfolio && !loadingOps && (
        <GlassCard className="p-12 text-center" delay={0.1}>
          <Briefcase size={28} className="text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/25">Selecione um cliente e carteira para ver a performance real.</p>
          <p className="text-[10px] text-white/15 mt-1">Os dados são calculados a partir do histórico de rebalanceamentos.</p>
        </GlassCard>
      )}

      {/* Insufficient data */}
      {selectedPortfolio && !loadingOps && !hasData && (
        <GlassCard className="p-12 text-center" delay={0.1}>
          <RefreshCw size={28} className="text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/25">
            {operations.length === 0
              ? "Nenhum rebalanceamento encontrado para esta carteira."
              : "É necessário pelo menos 2 rebalanceamentos para calcular performance."}
          </p>
          <p className="text-[10px] text-white/15 mt-1">
            Operações encontradas: {operations.length}. Execute rebalanceamentos para gerar dados.
          </p>
        </GlassCard>
      )}

      {/* Real data */}
      {hasData && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label={`Rent. ${kpis.months}M`} value={`${kpis.totalReturn}%`} icon={TrendingUp} delay={0.1} />
            <StatCard label="vs CDI" value={`${kpis.vsCdi >= 0 ? "+" : ""}${kpis.vsCdi}%`} icon={Target} trend={kpis.vsCdi} delay={0.15} />
            <StatCard label="Operações" value={operations.length} icon={Activity} delay={0.2} />
            <StatCard label="Sharpe Ratio" value={kpis.sharpe.toFixed(2)} icon={BarChart3} delay={0.25} />
          </div>

          {/* Accumulated chart */}
          <GlassCard className="p-5" delay={0.3}>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Activity size={14} className="text-indigo-400" /> Rentabilidade acumulada (%)
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={accumulated}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="mes" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                <Tooltip contentStyle={TT} formatter={(v) => `${v.toFixed(2)}%`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="cartAcc" stroke="#818cf8" strokeWidth={2} dot={false} name="Carteira" />
                <Line type="monotone" dataKey="cdiAcc" stroke="#34d399" strokeWidth={1.5} dot={false} name="CDI" strokeDasharray="4 3" />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Monthly returns */}
          <GlassCard className="p-5" delay={0.35}>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <BarChart3 size={14} className="text-indigo-400" /> Retorno mensal (%)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="mes" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={TT} formatter={(v) => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="carteira" fill="#818cf8" radius={[4, 4, 0, 0]} name="Carteira" />
                <Bar dataKey="cdi" fill="#34d399" radius={[4, 4, 0, 0]} name="CDI" opacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Operations timeline */}
          <GlassCard className="p-5" delay={0.4}>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Calendar size={14} className="text-indigo-400" /> Histórico de operações
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {[...operations].reverse().map((op, i) => (
                <div
                  key={op.id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                  style={{ animation: `fadeInUp 0.25s ease ${i * 0.03}s both` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                      <RefreshCw size={13} className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs text-white/70">
                        {new Date(op.executed_at).toLocaleDateString("pt-BR", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </p>
                      <p className="text-[10px] text-white/30">
                        {Number(op.new_capital) > 0
                          ? `Aporte: ${formatCurrency(Number(op.new_capital))}`
                          : "Rebalanceamento sem aporte"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-white/50">
                      {formatCurrency(Number(op.total_before))}
                    </p>
                    <p className="text-[10px] font-mono text-white/25">
                      → {formatCurrency(Number(op.total_after))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Methodology note */}
          <div className="text-center py-2">
            <p className="text-[9px] text-white/15">
              Performance calculada via TWR aproximado entre operações de rebalanceamento.
              CDI benchmark estimado a {cdiRate}% a.a. Resultados passados não garantem retornos futuros.
            </p>
          </div>
        </>
      )}
    </div>
  );
}