import { Shield, UserCheck, Eye } from "lucide-react";

// ─── Asset Classes ───
export const ASSET_CLASSES = [
  "Renda Fixa",
  "Ações Brasil",
  "Ações EUA",
  "FIIs",
  "Cripto",
  "Internacional",
  "Multimercado",
  "Commodities",
  "Caixa",
  "Outros",
];

export const CLASS_COLORS = {
  "Renda Fixa": "#34d399",
  "Ações Brasil": "#60a5fa",
  "Ações EUA": "#a78bfa",
  "FIIs": "#fbbf24",
  "Cripto": "#fb923c",
  "Internacional": "#22d3ee",
  "Multimercado": "#f472b6",
  "Commodities": "#facc15",
  "Caixa": "#94a3b8",
  "Outros": "#9ca3af",
};

export const PIE_COLORS = [
  "#6366f1", "#34d399", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#ec4899", "#f97316", "#22c55e", "#64748b",
];

// ─── User Roles ───
export const ROLE_CONFIG = {
  admin: {
    label: "Admin",
    icon: Shield,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  consultant: {
    label: "Consultor",
    icon: UserCheck,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
  },
  viewer: {
    label: "Viewer",
    icon: Eye,
    color: "text-slate-400",
    bg: "bg-slate-500/10 border-slate-500/20",
  },
};

// ─── Risk Profiles ───
export const RISK_LABELS = {
  conservative: "Conservador",
  moderate: "Moderado",
  balanced: "Balanceado",
  growth: "Crescimento",
  aggressive: "Agressivo",
};

// ─── Commission Types ───
export const COMMISSION_LABELS = {
  management_fee: "Administração",
  performance_fee: "Performance",
  brokerage: "Corretagem",
  rebate: "Rebate",
  advisory_fee: "Consultoria",
  other: "Outro",
};

export const COMMISSION_COLORS = {
  management_fee: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  performance_fee: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  brokerage: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  rebate: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  advisory_fee: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  other: "text-gray-400 bg-gray-500/10 border-gray-500/20",
};
