import { Shield, UserCheck, Eye } from "lucide-react";

// ─── Asset Classes ───
// Mantemos label legível em PT separado do valor do enum no Postgres.
// Fonte de verdade do enum: src/stores/migrations/001_initial_schema.sql (asset_class).
// Qualquer mudança aqui precisa ser refletida lá e vice-versa.
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

// Mapa label (UI) -> valor do enum asset_class (Postgres).
// Use sempre este mapa para gravar — derivar o valor por regex/normalize
// é frágil e já causou bug de "Ações Brasil" virar "acacoes_brasil".
export const ASSET_CLASS_VALUE_BY_LABEL = {
  "Renda Fixa": "renda_fixa",
  "Ações Brasil": "acoes_brasil",
  "Ações EUA": "acoes_eua",
  "FIIs": "fiis",
  "Cripto": "cripto",
  "Internacional": "internacional",
  "Multimercado": "multimercado",
  "Commodities": "commodities",
  "Caixa": "caixa",
  "Outros": "outros",
};

const ASSET_CLASS_VALUES = new Set(Object.values(ASSET_CLASS_VALUE_BY_LABEL));

// Aliases tolerantes a typos / variantes (uso típico: import de Excel).
// Chave SEMPRE normalizada (lowercase, sem acentos, sem espaços extras).
const ASSET_CLASS_ALIASES = {
  "rendafixa": "renda_fixa",
  "renda fixa": "renda_fixa",
  "acoes": "acoes_brasil",
  "acoes brasil": "acoes_brasil",
  "acoes br": "acoes_brasil",
  "acoes eua": "acoes_eua",
  "acoes us": "acoes_eua",
  "fii": "fiis",
  "fiis": "fiis",
  "cripto": "cripto",
  "cripomoedas": "cripto",
  "criptomoedas": "cripto",
  "internacional": "internacional",
  "multimercado": "multimercado",
  "commodities": "commodities",
  "caixa": "caixa",
  "outros": "outros",
};

/**
 * Normaliza uma label (vinda de UI, Excel, etc.) para o valor do enum asset_class.
 * Retorna 'outros' se não conseguir identificar.
 *
 * @param {unknown} input - label ou valor já normalizado
 * @returns {string} valor válido do enum asset_class
 */
export function normalizeAssetClass(input) {
  if (input == null) return "outros";
  const str = String(input).trim();
  if (!str) return "outros";

  // Já é um valor válido do enum?
  if (ASSET_CLASS_VALUES.has(str)) return str;

  // Match exato com label da UI?
  if (ASSET_CLASS_VALUE_BY_LABEL[str]) return ASSET_CLASS_VALUE_BY_LABEL[str];

  // Normaliza (lowercase, sem acentos, espaços colapsados) e tenta alias.
  const normalized = str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return ASSET_CLASS_ALIASES[normalized] || "outros";
}

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
