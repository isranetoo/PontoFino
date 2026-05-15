"use client";

import { useState, useEffect } from "react";
import {
  LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { formatCurrency, getInitials } from "@/lib/utils";
import { PIE_COLORS, RISK_LABELS } from "@/lib/constants";
import { GlassCard, StatCard } from "@/components/ui";
import {
  TrendingUp, Users, DollarSign, RefreshCw,
  Activity, PieChart as PieIcon,
} from "lucide-react";

const TOOLTIP_STYLE = {
  background: "rgba(15,15,40,0.95)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  fontSize: 12,
};

export default function DashboardPage() {
  const { profile } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [clients, setClients] = useState([]);
  const [perfData, setPerfData] = useState([]);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowserClient();

      // Load dashboard stats via RPC
      const { data: statsData } = await supabase.rpc("get_dashboard_stats");
      if (statsData) setStats(statsData);

      // Load recent clients
      const { data: clientsData } = await supabase
        .from("clients")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(5);
      if (clientsData) setClients(clientsData);

      // TODO: Load real performance data from portfolios
      // Using sample data for now
      setPerfData([
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
      ]);
    }
    load();
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-xs text-white/40 mt-0.5">
          Bem-vindo, {profile?.full_name?.split(" ")[0]}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="AUM Total"
          value={formatCurrency(stats?.total_aum || 0)}
          icon={TrendingUp}
          trend={5.2}
          delay={0}
        />
        <StatCard
          label="Clientes ativos"
          value={stats?.total_clients || 0}
          icon={Users}
          trend={2}
          delay={0.05}
        />
        <StatCard
          label="Receita mensal"
          value={formatCurrency(stats?.monthly_commissions || 0)}
          icon={DollarSign}
          trend={12.5}
          delay={0.1}
        />
        <StatCard
          label="Rebalanceamentos"
          value={stats?.recent_rebalancings || 0}
          icon={RefreshCw}
          delay={0.15}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard className="lg:col-span-2 p-5" delay={0.2}>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Activity size={14} className="text-indigo-400" />
            Performance mensal (%)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={perfData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="mes" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "rgba(255,255,255,0.5)" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="carteira" stroke="#818cf8" strokeWidth={2} dot={false} name="Carteira" />
              <Line type="monotone" dataKey="cdi" stroke="#34d399" strokeWidth={1.5} dot={false} name="CDI" strokeDasharray="4 3" />
              <Line type="monotone" dataKey="ibov" stroke="#fbbf24" strokeWidth={1.5} dot={false} name="IBOV" strokeDasharray="4 3" />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-5" delay={0.25}>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <PieIcon size={14} className="text-indigo-400" />
            Portfólios ativos
          </h3>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-indigo-400">
                {stats?.total_portfolios || 0}
              </p>
              <p className="text-xs text-white/40 mt-1">carteiras ativas</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Recent clients */}
      <GlassCard className="p-5" delay={0.3}>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Users size={14} className="text-indigo-400" />
          Clientes recentes
        </h3>
        {clients.length > 0 ? (
          <div className="space-y-2">
            {clients.map((c, i) => (
              <div
                key={c.id}
                className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-white/[0.03] transition-colors"
                style={{ animation: `fadeInUp 0.3s ease ${i * 0.04}s both` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/15 to-violet-500/15 border border-white/10 flex items-center justify-center text-[10px] font-semibold text-white/50">
                    {getInitials(c.full_name)}
                  </div>
                  <div>
                    <p className="text-sm text-white/80">{c.full_name}</p>
                    <p className="text-[10px] text-white/30">
                      {RISK_LABELS[c.risk_profile] || c.risk_profile}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-white/30 font-mono">
                  {c.email}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/25 py-6 text-center">
            Nenhum cliente cadastrado ainda.
          </p>
        )}
      </GlassCard>
    </div>
  );
}
