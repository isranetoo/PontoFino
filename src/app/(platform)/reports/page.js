"use client";

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { GlassCard, StatCard } from "@/components/ui";
import { Activity, BarChart3, TrendingUp, Target, Download } from "lucide-react";

const PERF_DATA = [
  { mes: "Jan", carteira: 2.1, cdi: 1.0, ibov: 1.8 },
  { mes: "Fev", carteira: 1.8, cdi: 1.0, ibov: -0.5 },
  { mes: "Mar", carteira: -0.5, cdi: 1.1, ibov: -2.3 },
  { mes: "Abr", carteira: 3.2, cdi: 1.0, ibov: 4.1 },
  { mes: "Mai", carteira: 1.5, cdi: 1.1, ibov: 0.8 },
  { mes: "Jun", carteira: 2.8, cdi: 1.0, ibov: 2.2 },
  { mes: "Jul", carteira: 0.9, cdi: 1.0, ibov: -1.0 },
  { mes: "Ago", carteira: 1.7, cdi: 1.1, ibov: 3.5 },
  { mes: "Set", carteira: 2.4, cdi: 1.0, ibov: 1.2 },
  { mes: "Out", carteira: -0.3, cdi: 1.1, ibov: -0.7 },
  { mes: "Nov", carteira: 3.1, cdi: 1.0, ibov: 2.8 },
  { mes: "Dez", carteira: 1.9, cdi: 1.1, ibov: 1.5 },
];

const TOOLTIP_STYLE = {
  background: "rgba(15,15,40,0.95)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  fontSize: 12,
};

export default function ReportsPage() {
  const accumulated = PERF_DATA.reduce((acc, m, i) => {
    const prev = i > 0 ? acc[i - 1] : { cartAcc: 0, cdiAcc: 0, ibovAcc: 0 };
    acc.push({
      mes: m.mes,
      cartAcc: prev.cartAcc + m.carteira,
      cdiAcc: prev.cdiAcc + m.cdi,
      ibovAcc: prev.ibovAcc + m.ibov,
    });
    return acc;
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Relatórios</h2>
          <p className="text-xs text-white/40 mt-0.5">Performance e análise de carteira</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all">
          <Download size={15} /> Exportar PDF
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Rent. 12M" value="20.6%" icon={TrendingUp} delay={0} />
        <StatCard label="vs CDI" value="+8.1%" icon={Target} trend={8.1} delay={0.05} />
        <StatCard label="vs IBOV" value="+7.2%" icon={Activity} trend={7.2} delay={0.1} />
        <StatCard label="Sharpe Ratio" value="1.42" icon={BarChart3} delay={0.15} />
      </div>

      <GlassCard className="p-5" delay={0.2}>
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Activity size={14} className="text-indigo-400" /> Rentabilidade acumulada (%)
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={accumulated}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="mes" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v.toFixed(0)}%`} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => `${v.toFixed(1)}%`} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="cartAcc" stroke="#818cf8" strokeWidth={2} dot={false} name="Carteira" />
            <Line type="monotone" dataKey="cdiAcc" stroke="#34d399" strokeWidth={1.5} dot={false} name="CDI" strokeDasharray="4 3" />
            <Line type="monotone" dataKey="ibovAcc" stroke="#fbbf24" strokeWidth={1.5} dot={false} name="IBOV" strokeDasharray="4 3" />
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>

      <GlassCard className="p-5" delay={0.3}>
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <BarChart3 size={14} className="text-indigo-400" /> Retorno mensal (%)
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={PERF_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="mes" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => `${v}%`} />
            <Bar dataKey="carteira" fill="#818cf8" radius={[4, 4, 0, 0]} name="Carteira" />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}
