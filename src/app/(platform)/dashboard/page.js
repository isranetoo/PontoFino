"use client";

import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { useAuthStore } from "@/stores/auth-store";
import { formatCurrency, getInitials } from "@/lib/utils";
import { RISK_LABELS, PIE_COLORS } from "@/lib/constants";
import { GlassCard, StatCard, Spinner } from "@/components/ui";
import { useDashboardData } from "./use-dashboard-data";
import {
  TrendingUp, Users, DollarSign, RefreshCw, PieChart as PieIcon,
  AlertTriangle, Activity, Wallet, Clock,
} from "lucide-react";

const CLASS_LABELS = {
  renda_fixa: "Renda Fixa", acoes_brasil: "Ações Brasil", acoes_eua: "Ações EUA",
  fiis: "FIIs", cripto: "Cripto", internacional: "Internacional",
  multimercado: "Multimercado", commodities: "Commodities", caixa: "Caixa", outros: "Outros",
};
const ACTION_LABELS = { INSERT: "Criou", UPDATE: "Editou", DELETE: "Removeu" };
const TABLE_LABELS = {
  clients: "cliente", portfolios: "carteira", portfolio_assets: "ativo",
  rebalancing_operations: "rebalanceamento", commissions: "comissão", simulations: "simulação",
};
const TT = { background: "rgba(15,15,40,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 };

export default function DashboardPage() {
  const { profile } = useAuthStore();
  const {
    stats, allocation, unbalanced, commissionHistory,
    topClients, recentActivity, loading, refresh,
  } = useDashboardData();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Spinner size={28} />
          <p className="text-xs text-white/30">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const pieData = allocation.map((a) => ({
    name: CLASS_LABELS[a.classe] || a.classe,
    value: Number(a.valor),
    pct: Number(a.percentual),
  }));

  const barData = commissionHistory.map((c) => ({
    mes: c.periodo?.slice(5) || "",
    total: Number(c.total),
  }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-xs text-white/40 mt-0.5">Bem-vindo, {profile?.full_name?.split(" ")[0]}</p>
        </div>
        <button onClick={refresh} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-white/40 hover:text-white/70 hover:bg-white/10 transition-all">
          <RefreshCw size={12} /> Atualizar
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="AUM Total" value={formatCurrency(stats?.total_aum || 0)} icon={TrendingUp} delay={0} />
        <StatCard label="Clientes ativos" value={stats?.total_clients || 0} icon={Users} delay={0.05} />
        <StatCard label="Receita mensal" value={formatCurrency(stats?.monthly_commissions || 0)} icon={DollarSign} delay={0.1} />
        <StatCard label="Rebalanceamentos (30d)" value={stats?.recent_rebalancings || 0} icon={RefreshCw} delay={0.15} />
      </div>

      {/* Charts: Allocation + Commissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie: Allocation by class */}
        <GlassCard className="p-5" delay={0.2}>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <PieIcon size={14} className="text-indigo-400" /> Alocação por classe
          </h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                    {pieData.map((_, i) => (<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}
                  </Pie>
                  <Tooltip contentStyle={TT} formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-white/50">{d.name}</span>
                    </span>
                    <span className="text-white/70 font-mono">{d.pct}% · {formatCurrency(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-12 text-sm text-white/25">Nenhuma carteira cadastrada ainda.</div>
          )}
        </GlassCard>

        {/* Bar: Commission history */}
        <GlassCard className="p-5" delay={0.25}>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Wallet size={14} className="text-indigo-400" /> Receita mensal (6 meses)
          </h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="mes" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={TT} formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="total" fill="#818cf8" radius={[4, 4, 0, 0]} name="Receita" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center py-12 text-sm text-white/25">Nenhuma comissão registrada.</div>
          )}
        </GlassCard>
      </div>

      {/* Alerts + Top clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Unbalanced alerts */}
        <GlassCard className="p-5" delay={0.3}>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-400" /> Carteiras desbalanceadas
          </h3>
          {unbalanced.length > 0 ? (
            <div className="space-y-2">
              {unbalanced.map((p, i) => (
                <div key={p.portfolio_id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/10 hover:bg-amber-500/[0.06] transition-colors" style={{ animation: `fadeInUp 0.3s ease ${i * 0.05}s both` }}>
                  <div>
                    <p className="text-sm text-white/80">{p.client_name}</p>
                    <p className="text-[10px] text-white/35">{p.portfolio_name} · {p.total_assets} ativos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-amber-400">{(p.max_desvio * 100).toFixed(1)}pp desvio</p>
                    <p className="text-[10px] text-white/30 font-mono">{formatCurrency(p.total_value)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2">
                <TrendingUp size={16} className="text-emerald-400" />
              </div>
              <p className="text-xs text-white/40">Todas as carteiras estão balanceadas</p>
            </div>
          )}
        </GlassCard>

        {/* Top clients */}
        <GlassCard className="p-5" delay={0.35}>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Users size={14} className="text-indigo-400" /> Top clientes por AUM
          </h3>
          {topClients.length > 0 ? (
            <div className="space-y-2">
              {topClients.map((c, i) => (
                <div key={c.id} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-white/[0.03] transition-colors" style={{ animation: `fadeInUp 0.3s ease ${i * 0.04}s both` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/15 to-violet-500/15 border border-white/10 flex items-center justify-center text-[10px] font-semibold text-white/50">{getInitials(c.full_name)}</div>
                    <div>
                      <p className="text-sm text-white/80">{c.full_name}</p>
                      <p className="text-[10px] text-white/30">{RISK_LABELS[c.risk_profile] || c.risk_profile} · {c.total_portfolios} carteira{c.total_portfolios !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-white/60">{formatCurrency(c.aum)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-sm text-white/25">Nenhum cliente cadastrado.</div>
          )}
        </GlassCard>
      </div>

      {/* Recent activity (audit log) */}
      <GlassCard className="p-5" delay={0.4}>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Activity size={14} className="text-indigo-400" /> Atividade recente
        </h3>
        {recentActivity.length > 0 ? (
          <div className="space-y-1.5">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/[0.02] transition-colors" style={{ animation: `fadeInUp 0.25s ease ${i * 0.03}s both` }}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${a.action === "INSERT" ? "bg-emerald-500/10 text-emerald-400" : a.action === "UPDATE" ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400"}`}>
                  {a.action === "INSERT" ? "+" : a.action === "UPDATE" ? "✎" : "−"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/70 truncate">
                    {ACTION_LABELS[a.action] || a.action} {TABLE_LABELS[a.table_name] || a.table_name}
                    {a.entity_name && <span className="text-white/40"> — {a.entity_name}</span>}
                  </p>
                </div>
                <span className="text-[10px] text-white/25 font-mono flex-shrink-0 flex items-center gap-1">
                  <Clock size={9} />
                  {new Date(a.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-white/25 py-4 text-center">Nenhuma atividade registrada ainda.</p>
        )}
      </GlassCard>
    </div>
  );
}
