"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { COMMISSION_LABELS, COMMISSION_COLORS } from "@/lib/constants";
import { GlassCard, StatCard } from "@/components/ui";
import { DollarSign, Users, Target, PieChart as PieIcon, Wallet } from "lucide-react";

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowserClient();
      const currentPeriod = new Date().toISOString().slice(0, 7); // "2026-05"

      const { data } = await supabase
        .from("commissions")
        .select("*, clients(full_name)")
        .order("created_at", { ascending: false });

      setCommissions(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const currentPeriod = new Date().toISOString().slice(0, 7);
  const monthData = commissions.filter((c) => c.reference_period === currentPeriod);
  const totalMonth = monthData.reduce((s, c) => s + c.amount, 0);
  const uniqueClients = new Set(monthData.map((c) => c.client_id)).size;

  const byType = Object.entries(
    monthData.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + c.amount;
      return acc;
    }, {})
  )
    .map(([type, amount]) => ({ type, amount }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Comissões</h2>
        <p className="text-xs text-white/40 mt-0.5">Controle de receita por cliente e tipo</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Receita mensal" value={formatCurrency(totalMonth)} icon={DollarSign} trend={12.5} delay={0} />
        <StatCard label="Clientes pagantes" value={uniqueClients} icon={Users} delay={0.05} />
        <StatCard label="Ticket médio" value={formatCurrency(totalMonth / (uniqueClients || 1))} icon={Target} delay={0.1} />
        <StatCard label="Tipos" value={byType.length} icon={PieIcon} delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard className="lg:col-span-2 overflow-hidden" delay={0.2}>
          <div className="px-5 py-3 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Wallet size={14} className="text-indigo-400" /> Comissões do mês
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.05] text-[10px] uppercase tracking-wider text-white/30">
                  <th className="text-left py-2.5 px-5">Cliente</th>
                  <th className="text-left py-2.5 px-3">Tipo</th>
                  <th className="text-right py-2.5 px-3">Valor</th>
                  <th className="text-left py-2.5 px-3 hidden sm:table-cell">Descrição</th>
                </tr>
              </thead>
              <tbody>
                {monthData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-white/25 text-sm">
                      Nenhuma comissão registrada neste mês.
                    </td>
                  </tr>
                ) : (
                  monthData.map((c, i) => (
                    <tr key={c.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors"
                      style={{ animation: `fadeInUp 0.25s ease ${i * 0.03}s both` }}>
                      <td className="py-2.5 px-5 text-xs text-white/80">
                        {c.clients?.full_name || "—"}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md border font-medium ${COMMISSION_COLORS[c.type] || COMMISSION_COLORS.other}`}>
                          {COMMISSION_LABELS[c.type] || c.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-xs text-emerald-400">
                        {formatCurrency(c.amount)}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-white/35 hidden sm:table-cell">
                        {c.description}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {monthData.length > 0 && (
                <tfoot>
                  <tr className="border-t border-white/10 bg-white/[0.02]">
                    <td className="py-2.5 px-5 text-xs font-semibold text-white/40 uppercase">Total</td>
                    <td />
                    <td className="py-2.5 px-3 text-right font-mono text-xs font-semibold text-emerald-400">
                      {formatCurrency(totalMonth)}
                    </td>
                    <td className="hidden sm:table-cell" />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </GlassCard>

        <GlassCard className="p-5" delay={0.25}>
          <h3 className="text-sm font-semibold mb-4">Por tipo</h3>
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
                    style={{ width: `${(t.amount / totalMonth) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
