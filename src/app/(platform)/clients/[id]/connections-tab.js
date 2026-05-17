"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatCurrency, formatPct } from "@/lib/utils";
import { CLASS_COLORS } from "@/lib/constants";
import { GlassCard, Spinner } from "@/components/ui";
import {
  AlertTriangle, CheckCircle, Clock, Link2, Lock,
  RefreshCw, Trash2, Unlink, Archive, Plus,
  ChevronDown, TrendingUp, TrendingDown, Wallet,
} from "lucide-react";

export default function ConnectionsTab({ clientId, onInviteClick }) {
  const supabase = getSupabaseBrowserClient();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyItemId, setBusyItemId] = useState(null);
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    // Trazemos accounts/investments aninhados.
    // Os campos detalhados (quantity, amount_invested, code, etc.) alimentam
    // o drill-down do card; o header agrega contagens e total.
    const { data, error: fetchErr } = await supabase
      .from("pluggy_items")
      .select(`
        id, pluggy_item_id, connector_name, connector_image_url,
        status, execution_status, last_synced_at, disconnected_at,
        portfolio_id, created_at,
        pluggy_accounts (
          id, name, marketing_name, number, balance, currency_code,
          pluggy_investments (
            id, name, code, isin, type, subtype,
            quantity, amount, amount_invested, unit_price,
            currency_code, due_date, rate, rate_type, asset_class
          )
        )
      `)
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (fetchErr) {
      setError(fetchErr.message);
      setItems([]);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  }, [clientId, supabase]);

  useEffect(() => { load(); }, [load]);

  async function syncNow(itemId) {
    setBusyItemId(itemId);
    setError("");
    try {
      const res = await fetch(`/api/pluggy/items/${itemId}/sync`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao sincronizar.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyItemId(null);
    }
  }

  async function disconnect(itemId, connectorName) {
    if (!confirm(`Desconectar "${connectorName}"?\n\nA conexão será encerrada na Pluggy. O snapshot atual permanece como histórico read-only.`)) {
      return;
    }
    setBusyItemId(itemId);
    setError("");
    try {
      const res = await fetch(`/api/pluggy/items/${itemId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao desconectar.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyItemId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size={22} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <GlassCard className="p-10 text-center" delay={0}>
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mx-auto mb-3 flex items-center justify-center">
          <Link2 size={18} className="text-indigo-400" />
        </div>
        <h3 className="text-sm font-semibold mb-1">Nenhuma conexão ainda</h3>
        <p className="text-xs text-white/40 max-w-sm mx-auto mb-4 leading-relaxed">
          Envie um convite para o cliente conectar uma corretora ou banco via Open Finance.
          As posições serão importadas automaticamente.
        </p>
        <button
          onClick={onInviteClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 hover:bg-indigo-500/20 transition-all"
        >
          <Plus size={12} /> Convidar para conectar
        </button>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-[11px] text-red-400 flex items-center gap-1.5 px-1">
          <AlertTriangle size={11} /> {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider text-white/35">
          {items.filter((i) => !i.disconnected_at).length} ativas
          {items.some((i) => i.disconnected_at) && ` • ${items.filter((i) => i.disconnected_at).length} arquivadas`}
        </p>
        <button
          onClick={onInviteClick}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 hover:bg-indigo-500/20 transition-all"
        >
          <Plus size={11} /> Nova conexão
        </button>
      </div>

      {items.map((item, idx) => (
        <ConnectionCard
          key={item.id}
          item={item}
          delay={0.05 + idx * 0.03}
          busy={busyItemId === item.id}
          expanded={expandedItemId === item.id}
          onToggle={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
          onSync={() => syncNow(item.id)}
          onDisconnect={() => disconnect(item.id, item.connector_name || "Conexão")}
          onReconnect={onInviteClick}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ConnectionCard
// ─────────────────────────────────────────────────────────────

function ConnectionCard({ item, delay, busy, expanded, onToggle, onSync, onDisconnect, onReconnect }) {
  const accounts = item.pluggy_accounts || [];
  const totalInvestments = useMemo(
    () => accounts.reduce((sum, a) => sum + (a.pluggy_investments?.length || 0), 0),
    [accounts]
  );
  const totalValue = useMemo(
    () =>
      accounts.reduce(
        (sum, a) =>
          sum +
          (a.pluggy_investments || []).reduce((s, inv) => s + Number(inv.amount || 0), 0),
        0
      ),
    [accounts]
  );
  const totalInvested = useMemo(
    () =>
      accounts.reduce(
        (sum, a) =>
          sum +
          (a.pluggy_investments || []).reduce((s, inv) => s + Number(inv.amount_invested || 0), 0),
        0
      ),
    [accounts]
  );

  const isDisconnected = !!item.disconnected_at;
  const statusInfo = getStatusInfo(item.status, item.execution_status, isDisconnected);
  const canExpand = totalInvestments > 0;

  // Botões internos não devem propagar toggle. Usamos stopPropagation.
  const stop = (fn) => (e) => { e.stopPropagation(); fn?.(); };

  return (
    <GlassCard className="overflow-hidden" delay={delay}>
      <div
        onClick={canExpand ? onToggle : undefined}
        className={`p-4 ${canExpand ? "cursor-pointer hover:bg-white/[0.02]" : ""} transition-colors`}
      >
        <div className="flex items-start gap-3">
          {/* Logo */}
          <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
            {item.connector_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.connector_image_url} alt="" className="w-7 h-7 object-contain" />
            ) : (
              <Link2 size={16} className="text-white/30" />
            )}
          </div>

          {/* Body */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate flex items-center gap-1.5">
                  {item.connector_name || "Conexão Pluggy"}
                  {canExpand && (
                    <ChevronDown
                      size={13}
                      className={`text-white/30 transition-transform ${expanded ? "rotate-180" : ""}`}
                    />
                  )}
                </p>
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <StatusBadge info={statusInfo} />
                  <span className="text-[10px] text-white/30">
                    {item.last_synced_at
                      ? `Atualizado ${formatRelative(item.last_synced_at)}`
                      : "Nunca sincronizado"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {isDisconnected ? (
                  <button
                    onClick={stop(onReconnect)}
                    disabled={busy}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 hover:bg-indigo-500/20 transition-all disabled:opacity-40"
                  >
                    <Link2 size={10} /> Reconectar
                  </button>
                ) : (
                  <>
                    <button
                      onClick={stop(onSync)}
                      disabled={busy}
                      title="Forçar atualização agora"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-[11px] text-white/60 hover:bg-white/[0.08] transition-all disabled:opacity-40"
                    >
                      {busy ? <Spinner size={10} /> : <><RefreshCw size={10} /> Atualizar</>}
                    </button>
                    <button
                      onClick={stop(onDisconnect)}
                      disabled={busy}
                      title="Desconectar (snapshot mantido)"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/5 border border-red-500/15 text-[11px] text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
                    >
                      <Unlink size={10} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/[0.05]">
              <Stat label="Contas" value={accounts.length} />
              <Stat label="Ativos" value={totalInvestments} />
              <Stat label="Valor" value={formatCurrency(totalValue)} mono />
            </div>

            {/* Notas pra status problemático */}
            {statusInfo.hint && (
              <p className={`text-[11px] mt-3 flex items-start gap-1.5 ${statusInfo.color}`}>
                <AlertTriangle size={11} className="mt-0.5 shrink-0" /> {statusInfo.hint}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Drill-down: contas + posições */}
      {expanded && canExpand && (
        <div
          className="border-t border-white/[0.06] bg-black/10"
          style={{ animation: "fadeInUp 0.2s ease both" }}
        >
          <DrillDown
            accounts={accounts}
            totalValue={totalValue}
            totalInvested={totalInvested}
          />
        </div>
      )}
    </GlassCard>
  );
}

// ─────────────────────────────────────────────────────────────
// DrillDown: contas + posições da Pluggy
// ─────────────────────────────────────────────────────────────

function DrillDown({ accounts, totalValue, totalInvested }) {
  const totalReturn = totalValue - totalInvested;
  const totalReturnPct = totalInvested > 0 ? totalReturn / totalInvested : null;

  return (
    <div>
      {/* Resumo da conexão */}
      {totalInvested > 0 && (
        <div className="px-4 py-3 border-b border-white/[0.04] flex items-center gap-5 text-[11px]">
          <SummaryStat label="Investido" value={formatCurrency(totalInvested)} />
          <SummaryStat label="Atual" value={formatCurrency(totalValue)} highlight />
          <SummaryStat
            label="Retorno"
            value={formatReturn(totalReturn, totalReturnPct)}
            color={totalReturn >= 0 ? "text-emerald-400" : "text-red-400"}
          />
        </div>
      )}

      {accounts.map((account) => {
        const investments = account.pluggy_investments || [];
        const accountValue = investments.reduce((s, i) => s + Number(i.amount || 0), 0);

        return (
          <div key={account.id} className="px-1">
            {/* Header da conta — só mostra se houver mais de 1 conta ou nome relevante */}
            {(accounts.length > 1 || account.name) && (
              <div className="px-3 py-2 flex items-center justify-between border-b border-white/[0.03]">
                <div className="flex items-center gap-2">
                  <Wallet size={11} className="text-white/30" />
                  <span className="text-[11px] text-white/60">
                    {account.marketing_name || account.name || "Conta"}
                  </span>
                  {account.number && (
                    <span className="text-[10px] text-white/25 font-mono">{account.number}</span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-white/50">{formatCurrency(accountValue)}</span>
              </div>
            )}

            {investments.length === 0 ? (
              <p className="px-3 py-3 text-[11px] text-white/30">Nenhuma posição nesta conta.</p>
            ) : (
              <PositionsTable investments={investments} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PositionsTable({ investments }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-[9px] uppercase tracking-wider text-white/25 border-b border-white/[0.04]">
            <th className="text-left py-2 px-3">Ativo</th>
            <th className="text-left py-2 px-2">Classe</th>
            <th className="text-right py-2 px-2">Qtd</th>
            <th className="text-right py-2 px-2">Investido</th>
            <th className="text-right py-2 px-2">Atual</th>
            <th className="text-right py-2 px-3">Retorno</th>
          </tr>
        </thead>
        <tbody>
          {investments.map((inv) => {
            const invested = Number(inv.amount_invested || 0);
            const current = Number(inv.amount || 0);
            const ret = current - invested;
            const retPct = invested > 0 ? ret / invested : null;
            const positive = ret >= 0;

            return (
              <tr key={inv.id} className="border-b border-white/[0.02] hover:bg-white/[0.02]">
                <td className="py-2 px-3">
                  <p className="text-[11px] font-medium text-white/80 truncate max-w-[200px]" title={inv.name}>
                    {inv.name || "—"}
                  </p>
                  {inv.code && <p className="text-[9px] text-white/30 font-mono">{inv.code}</p>}
                  {inv.due_date && (
                    <p className="text-[9px] text-white/25 mt-0.5">
                      Vence {new Date(inv.due_date).toLocaleDateString("pt-BR")}
                      {inv.rate ? ` · ${inv.rate}${inv.rate_type ? ` ${inv.rate_type}` : ""}` : ""}
                    </p>
                  )}
                </td>
                <td className="py-2 px-2">
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-md text-white/55"
                    style={{ background: (CLASS_COLORS[classLabel(inv.asset_class)] || "#9ca3af") + "18" }}
                  >
                    {(inv.asset_class || "outros").replace("_", " ")}
                  </span>
                </td>
                <td className="py-2 px-2 text-right font-mono text-[10.5px] text-white/55">
                  {formatQuantity(inv.quantity)}
                </td>
                <td className="py-2 px-2 text-right font-mono text-[10.5px] text-white/45">
                  {invested > 0 ? formatCurrency(invested) : "—"}
                </td>
                <td className="py-2 px-2 text-right font-mono text-[10.5px] text-white/80">
                  {formatCurrency(current)}
                </td>
                <td className="py-2 px-3 text-right">
                  {invested > 0 ? (
                    <span className={`inline-flex items-center gap-1 font-mono text-[10.5px] ${positive ? "text-emerald-400" : "text-red-400"}`}>
                      {positive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                      {formatReturn(ret, retPct)}
                    </span>
                  ) : (
                    <span className="text-[10.5px] text-white/25">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SummaryStat({ label, value, color, highlight }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-[9px] uppercase tracking-wider text-white/35">{label}</span>
      <span className={`font-mono ${color || (highlight ? "text-white/90" : "text-white/60")}`}>{value}</span>
    </div>
  );
}

function formatReturn(absolute, pct) {
  const sign = absolute >= 0 ? "+" : "−";
  const abs = formatCurrency(Math.abs(absolute));
  if (pct == null) return `${sign}${abs}`;
  return `${sign}${abs} (${sign}${formatPct(Math.abs(pct))})`;
}

function formatQuantity(q) {
  const n = Number(q || 0);
  if (n === 0) return "—";
  // Cripto/fundos podem ter muitas casas; ações são inteiras.
  if (Number.isInteger(n) || n >= 100) return n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 6 });
}

// CLASS_COLORS está indexado pela label legível (ex: "Ações Brasil"),
// não pelo valor do enum. Mapa inverso para o badge.
const ENUM_TO_LABEL = {
  renda_fixa: "Renda Fixa",
  acoes_brasil: "Ações Brasil",
  acoes_eua: "Ações EUA",
  fiis: "FIIs",
  cripto: "Cripto",
  internacional: "Internacional",
  multimercado: "Multimercado",
  commodities: "Commodities",
  caixa: "Caixa",
  outros: "Outros",
};
function classLabel(enumValue) {
  return ENUM_TO_LABEL[enumValue] || "Outros";
}

function Stat({ label, value, mono }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-wider text-white/30">{label}</p>
      <p className={`text-xs text-white/75 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ info }) {
  const { label, color, bg, Icon } = info;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md border ${bg} ${color}`}>
      <Icon size={9} /> {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function getStatusInfo(status, executionStatus, isDisconnected) {
  if (isDisconnected) {
    return {
      label: "Desconectado",
      color: "text-white/50",
      bg: "bg-white/[0.04] border-white/10",
      Icon: Archive,
      hint: "Snapshot read-only. Os dados desta carteira refletem o último sync antes da desconexão.",
    };
  }
  switch (status) {
    case "UPDATED":
      return {
        label: "Atualizado",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10 border-emerald-500/20",
        Icon: CheckCircle,
      };
    case "UPDATING":
      return {
        label: "Sincronizando",
        color: "text-indigo-300",
        bg: "bg-indigo-500/10 border-indigo-500/20",
        Icon: RefreshCw,
      };
    case "WAITING_USER_INPUT":
      return {
        label: "Aguarda ação",
        color: "text-amber-400",
        bg: "bg-amber-500/10 border-amber-500/20",
        Icon: Lock,
        hint: "A instituição pediu autenticação adicional (MFA, token, etc.). Envie um novo convite para o cliente concluir.",
      };
    case "LOGIN_ERROR":
      return {
        label: "Erro de login",
        color: "text-red-400",
        bg: "bg-red-500/10 border-red-500/20",
        Icon: AlertTriangle,
        hint: "A senha do banco/corretora pode ter sido alterada. Envie um novo convite para o cliente reconectar.",
      };
    case "OUTDATED":
      return {
        label: "Desatualizado",
        color: "text-amber-300",
        bg: "bg-amber-500/10 border-amber-500/20",
        Icon: Clock,
        hint: "A Pluggy não conseguiu atualizar recentemente. Use 'Atualizar' para tentar novamente.",
      };
    default:
      return {
        label: status || "Pendente",
        color: "text-white/50",
        bg: "bg-white/[0.04] border-white/10",
        Icon: Clock,
      };
  }
}

function formatRelative(timestamp) {
  const date = new Date(timestamp);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 30) return `há ${diffD}d`;
  return date.toLocaleDateString("pt-BR");
}
