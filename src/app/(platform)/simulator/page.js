"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { GlassCard, StatCard } from "@/components/ui";
import { Calculator, Activity, Briefcase, TrendingUp, Target } from "lucide-react";

export default function SimulatorPage() {
  const [selic, setSelic] = useState(12.25);
  const [ipca, setIpca] = useState(4.5);
  const [ibov, setIbov] = useState(15);
  const [dolar, setDolar] = useState(5);
  const [months, setMonths] = useState(12);
  const [initialValue, setInitialValue] = useState(850000);
  const [rfAlloc, setRfAlloc] = useState(30);
  const [results, setResults] = useState(null);

  const run = () => {
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
        valor: Math.round(v),
        retorno: ((v / initialValue - 1) * 100).toFixed(1),
      });
    }

    setResults({
      initial: initialValue,
      final: v,
      rentab: ((v / initialValue - 1) * 100).toFixed(1),
      ganho: v - initialValue,
      proj,
    });
  };

  const params = [
    { l: "Selic (%a.a.)", v: selic, s: setSelic },
    { l: "IPCA (%a.a.)", v: ipca, s: setIpca },
    { l: "IBOV (%a.a.)", v: ibov, s: setIbov },
    { l: "USD/BRL", v: dolar, s: setDolar },
    { l: "Meses", v: months, s: setMonths },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Simulador de cenários</h2>
        <p className="text-xs text-white/40 mt-0.5">Projete a carteira sob diferentes condições de mercado</p>
      </div>

      <GlassCard className="p-5" delay={0}>
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Calculator size={14} className="text-indigo-400" /> Parâmetros
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">Valor da carteira (R$)</label>
            <input type="number" value={initialValue} onChange={(e) => setInitialValue(parseFloat(e.target.value) || 0)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">% Renda Fixa</label>
            <input type="number" value={rfAlloc} onChange={(e) => setRfAlloc(parseFloat(e.target.value) || 0)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {params.map((p, i) => (
            <div key={i}>
              <label className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">{p.l}</label>
              <input type="number" value={p.v} onChange={(e) => p.s(parseFloat(e.target.value) || 0)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40" />
            </div>
          ))}
        </div>

        <button onClick={run}
          className="mt-5 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all">
          <Activity size={15} /> Simular
        </button>
      </GlassCard>

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
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={results.proj}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="mes" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v).replace("R$", "")} />
                <Tooltip contentStyle={{ background: "rgba(15,15,40,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} formatter={(v) => formatCurrency(v)} />
                <Line type="monotone" dataKey="valor" stroke="#818cf8" strokeWidth={2} dot={false} name="Patrimônio" />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        </>
      )}
    </div>
  );
}
