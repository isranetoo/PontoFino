"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatCurrency, formatPct, getInitials } from "@/lib/utils";
import { RISK_LABELS, ASSET_CLASSES, ASSET_CLASS_VALUE_BY_LABEL, CLASS_COLORS } from "@/lib/constants";
import { GlassCard, GlassInput, Modal, Spinner, StatCard } from "@/components/ui";
import {
  ChevronLeft, User, Mail, Phone, FileText, Edit3, Save,
  Briefcase, Plus, Trash2, Check, X, TrendingUp, Target,
  AlertTriangle, RefreshCw, PieChart, BarChart3,
  Link2, Copy, Mail as MailIcon, ShieldCheck,
} from "lucide-react";
import ConnectionsTab from "./connections-tab";

export default function ClientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [client, setClient] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  // Portfolio management
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState({ name: "", benchmark: "CDI" });
  const [portfolioError, setPortfolioError] = useState("");
  const [savingPortfolio, setSavingPortfolio] = useState(false);
  const [expandedPortfolio, setExpandedPortfolio] = useState(null);

  // Asset management
  const [showAddAsset, setShowAddAsset] = useState(null); // portfolio_id
  const [assetForm, setAssetForm] = useState({
    asset_name: "", asset_ticker: "", asset_class: "outros",
    current_value: "", target_pct: "",
  });
  const [assetError, setAssetError] = useState("");
  const [savingAsset, setSavingAsset] = useState(false);

  // Tabs (Carteiras | Conexões Pluggy)
  const [activeTab, setActiveTab] = useState("portfolios");

  // Pluggy invite
  const [showInvite, setShowInvite] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [sendingInviteEmail, setSendingInviteEmail] = useState(false);
  const [emailSentStatus, setEmailSentStatus] = useState(""); // "" | "sent" | "skipped"
  const [linkCopied, setLinkCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    const { data: clientData } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();

    if (!clientData) { router.push("/clients"); return; }
    setClient(clientData);
    setEditForm(clientData);

    const { data: portfolioData } = await supabase
      .from("portfolios")
      .select("*, portfolio_assets(*)")
      .eq("client_id", id)
      .order("created_at", { ascending: false });

    setPortfolios(portfolioData || []);
    if (portfolioData?.length > 0 && !expandedPortfolio) {
      setExpandedPortfolio(portfolioData[0].id);
    }
    setLoading(false);
  }, [id, supabase, router]);

  useEffect(() => { load(); }, [load]);

  // ─── Client CRUD ───
  async function saveClient() {
    setSaving(true);
    await supabase.from("clients").update({
      full_name: editForm.full_name,
      email: editForm.email,
      phone: editForm.phone,
      document: editForm.document,
      risk_profile: editForm.risk_profile,
      notes: editForm.notes,
      is_active: editForm.is_active,
    }).eq("id", id);
    await load();
    setEditing(false);
    setSaving(false);
  }

  async function toggleActive() {
    await supabase.from("clients").update({ is_active: !client.is_active }).eq("id", id);
    await load();
  }

  // ─── Portfolio CRUD ───
  async function addPortfolio() {
    if (!portfolioForm.name) return;
    setPortfolioError("");
    setSavingPortfolio(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("portfolios").insert({
      client_id: id,
      consultant_id: user.id,
      name: portfolioForm.name,
      benchmark: portfolioForm.benchmark,
    });
    setSavingPortfolio(false);
    if (error) {
      setPortfolioError(error.message || "Não foi possível criar a carteira.");
      return;
    }
    setPortfolioForm({ name: "", benchmark: "CDI" });
    setShowAddPortfolio(false);
    await load();
  }

  async function deletePortfolio(portfolioId) {
    const { error } = await supabase.from("portfolios").delete().eq("id", portfolioId);
    if (error) {
      alert(`Não foi possível remover a carteira: ${error.message}`);
      return;
    }
    await load();
  }

  // ─── Asset CRUD ───
  async function addAsset(portfolioId) {
    if (!assetForm.asset_name || !assetForm.current_value) return;
    setAssetError("");
    setSavingAsset(true);
    const { error } = await supabase.from("portfolio_assets").insert({
      portfolio_id: portfolioId,
      asset_name: assetForm.asset_name,
      asset_ticker: assetForm.asset_ticker,
      asset_class: assetForm.asset_class,
      current_value: parseFloat(assetForm.current_value) || 0,
      target_pct: (parseFloat(assetForm.target_pct) || 0) / 100,
    });
    setSavingAsset(false);
    if (error) {
      setAssetError(error.message || "Não foi possível adicionar o ativo.");
      return;
    }
    setAssetForm({ asset_name: "", asset_ticker: "", asset_class: "outros", current_value: "", target_pct: "" });
    setShowAddAsset(null);
    await load();
  }

  async function deleteAsset(assetId) {
    const { error } = await supabase.from("portfolio_assets").delete().eq("id", assetId);
    if (error) {
      alert(`Não foi possível remover o ativo: ${error.message}`);
      return;
    }
    await load();
  }

  // ─── Pluggy invite ───
  async function openInviteModal() {
    setShowInvite(true);
    setInviteUrl("");
    setInviteError("");
    setEmailSentStatus("");
    setLinkCopied(false);
    setGeneratingInvite(true);
    try {
      const res = await fetch("/api/pluggy/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao gerar convite.");
      setInviteUrl(json.url);
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setGeneratingInvite(false);
    }
  }

  async function copyInviteLink() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setInviteError("Não foi possível copiar — copie manualmente o link abaixo.");
    }
  }

  async function sendInviteEmail() {
    if (!client?.email) {
      setEmailSentStatus("skipped");
      return;
    }
    setSendingInviteEmail(true);
    setInviteError("");
    try {
      const res = await fetch("/api/pluggy/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: id, sendEmail: true }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao enviar e-mail.");
      setInviteUrl(json.url);
      setEmailSentStatus(json.emailed ? "sent" : "skipped");
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setSendingInviteEmail(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size={28} />
      </div>
    );
  }

  if (!client) return null;

  const totalAum = portfolios
    .filter((p) => p.is_active)
    .reduce((s, p) => s + Number(p.total_value || 0), 0);

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <button onClick={() => router.push("/clients")} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors">
        <ChevronLeft size={14} /> Voltar para clientes
      </button>

      {/* Client header */}
      <GlassCard className="p-5" delay={0}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center text-lg font-semibold text-white/50">
              {getInitials(client.full_name)}
            </div>
            <div>
              {editing ? (
                <input value={editForm.full_name} onChange={(e) => setEditForm((p) => ({ ...p, full_name: e.target.value }))} className="bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1.5 text-lg font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40 mb-1" />
              ) : (
                <h2 className="text-lg font-bold">{client.full_name}</h2>
              )}
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-white/50">
                  {RISK_LABELS[client.risk_profile]}
                </span>
                {client.is_active ? (
                  <span className="text-[9px] px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Ativo</span>
                ) : (
                  <span className="text-[9px] px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400">Inativo</span>
                )}
                <span className="text-[10px] text-white/25">
                  Desde {new Date(client.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button onClick={saveClient} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-xs text-emerald-400 hover:bg-emerald-500/25 transition-all">
                  {saving ? <Spinner size={14} /> : <><Save size={12} /> Salvar</>}
                </button>
                <button onClick={() => { setEditing(false); setEditForm(client); }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-white/40 hover:text-white/70 transition-all">
                  <X size={12} /> Cancelar
                </button>
              </>
            ) : (
              <>
                <button onClick={openInviteModal} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 hover:bg-indigo-500/20 transition-all">
                  <Link2 size={12} /> Convidar para conectar
                </button>
                <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-white/40 hover:text-white/70 transition-all">
                  <Edit3 size={12} /> Editar
                </button>
                <button onClick={toggleActive} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${client.is_active ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/15" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/15"}`}>
                  {client.is_active ? "Desativar" : "Reativar"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Contact info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/[0.06]">
          {editing ? (
            <>
              <GlassInput icon={Mail} label="E-mail" value={editForm.email || ""} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} />
              <GlassInput icon={Phone} label="Telefone" value={editForm.phone || ""} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} />
              <GlassInput label="CPF/CNPJ" value={editForm.document || ""} onChange={(e) => setEditForm((p) => ({ ...p, document: e.target.value }))} />
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-white/40 ml-1">Perfil</label>
                <select value={editForm.risk_profile} onChange={(e) => setEditForm((p) => ({ ...p, risk_profile: e.target.value }))} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none">
                  {Object.entries(RISK_LABELS).map(([k, v]) => <option key={k} value={k} className="bg-slate-900">{v}</option>)}
                </select>
              </div>
            </>
          ) : (
            <>
              <div><p className="text-[9px] uppercase text-white/25 mb-0.5">E-mail</p><p className="text-xs text-white/60 font-mono">{client.email || "—"}</p></div>
              <div><p className="text-[9px] uppercase text-white/25 mb-0.5">Telefone</p><p className="text-xs text-white/60">{client.phone || "—"}</p></div>
              <div><p className="text-[9px] uppercase text-white/25 mb-0.5">CPF/CNPJ</p><p className="text-xs text-white/60 font-mono">{client.document || "—"}</p></div>
              <div><p className="text-[9px] uppercase text-white/25 mb-0.5">Observações</p><p className="text-xs text-white/60">{client.notes || "—"}</p></div>
            </>
          )}
        </div>
      </GlassCard>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="AUM Total" value={formatCurrency(totalAum)} icon={TrendingUp} delay={0.1} />
        <StatCard label="Carteiras" value={portfolios.filter((p) => p.is_active).length} icon={Briefcase} delay={0.15} />
        <StatCard label="Ativos" value={portfolios.reduce((s, p) => s + (p.portfolio_assets?.length || 0), 0)} icon={PieChart} delay={0.2} />
        <StatCard label="Perfil" value={RISK_LABELS[client.risk_profile]} icon={Target} delay={0.25} />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/[0.06]">
        <TabButton
          active={activeTab === "portfolios"}
          onClick={() => setActiveTab("portfolios")}
          icon={Briefcase}
          label="Carteiras"
          count={portfolios.length}
        />
        <TabButton
          active={activeTab === "connections"}
          onClick={() => setActiveTab("connections")}
          icon={Link2}
          label="Conexões"
        />
      </div>

      {activeTab === "connections" ? (
        <ConnectionsTab clientId={id} onInviteClick={openInviteModal} />
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Briefcase size={14} className="text-indigo-400" /> Carteiras
            </h3>
            <button onClick={() => setShowAddPortfolio(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 hover:bg-indigo-500/20 transition-all">
              <Plus size={12} /> Nova carteira
            </button>
          </div>

          {portfolios.length === 0 ? (
        <GlassCard className="p-8 text-center" delay={0.3}>
          <Briefcase size={24} className="text-white/15 mx-auto mb-2" />
          <p className="text-sm text-white/25">Nenhuma carteira cadastrada.</p>
          <button onClick={() => setShowAddPortfolio(true)} className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">+ Criar primeira carteira</button>
        </GlassCard>
      ) : (
        portfolios.map((p, pi) => {
          const isExpanded = expandedPortfolio === p.id;
          const assets = p.portfolio_assets || [];
          const totalMeta = assets.reduce((s, a) => s + Number(a.target_pct || 0), 0);
          const metaOk = assets.length === 0 || Math.abs(totalMeta - 1) < 0.005;

          return (
            <GlassCard key={p.id} className="overflow-hidden" delay={0.3 + pi * 0.05}>
              {/* Portfolio header */}
              <button
                onClick={() => setExpandedPortfolio(isExpanded ? null : p.id)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 size={16} className="text-indigo-400" />
                  <div className="text-left">
                    <p className="text-sm font-semibold">{p.name}</p>
                    <p className="text-[10px] text-white/30">{assets.length} ativos · Benchmark: {p.benchmark}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono font-semibold text-white/80">{formatCurrency(Number(p.total_value || 0))}</span>
                  <ChevronLeft size={14} className={`text-white/25 transition-transform ${isExpanded ? "-rotate-90" : ""}`} />
                </div>
              </button>

              {/* Assets table */}
              {isExpanded && (
                <div className="border-t border-white/[0.06]" style={{ animation: "fadeInUp 0.2s ease both" }}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/[0.04] text-[9px] uppercase tracking-wider text-white/25">
                          <th className="text-left py-2 px-5">Ativo</th>
                          <th className="text-left py-2 px-3">Classe</th>
                          <th className="text-right py-2 px-3">Valor</th>
                          <th className="text-right py-2 px-3">% Atual</th>
                          <th className="text-right py-2 px-3">% Meta</th>
                          <th className="text-center py-2 px-3 w-10" />
                        </tr>
                      </thead>
                      <tbody>
                        {assets.map((a, ai) => {
                          const pctAtual = Number(p.total_value) > 0 ? Number(a.current_value) / Number(p.total_value) : 0;
                          return (
                            <tr key={a.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors" style={{ animation: `fadeInUp 0.2s ease ${ai * 0.02}s both` }}>
                              <td className="py-2 px-5">
                                <p className="text-xs font-medium text-white/80">{a.asset_name}</p>
                                {a.asset_ticker && <p className="text-[9px] text-white/25 font-mono">{a.asset_ticker}</p>}
                              </td>
                              <td className="py-2 px-3">
                                <span className="text-[9px] px-1.5 py-0.5 rounded-md text-white/50" style={{ background: (CLASS_COLORS[a.asset_class] || "#9ca3af") + "18" }}>
                                  {a.asset_class?.replace("_", " ")}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right font-mono text-xs text-white/60">{formatCurrency(Number(a.current_value))}</td>
                              <td className="py-2 px-3 text-right font-mono text-xs text-white/40">{formatPct(pctAtual)}</td>
                              <td className="py-2 px-3 text-right font-mono text-xs text-indigo-300">{formatPct(Number(a.target_pct))}</td>
                              <td className="py-2 px-3 text-center">
                                <button onClick={() => deleteAsset(a.id)} className="p-0.5 rounded text-white/15 hover:text-red-400 transition-colors">
                                  <Trash2 size={12} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer: meta status + actions */}
                  <div className="px-5 py-3 border-t border-white/[0.04] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-lg border ${metaOk ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"}`}>
                        {metaOk ? <Check size={9} className="inline mr-1" /> : <AlertTriangle size={9} className="inline mr-1" />}
                        Meta: {formatPct(totalMeta)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setShowAddAsset(p.id); setAssetForm({ asset_name: "", asset_ticker: "", asset_class: "outros", current_value: "", target_pct: "" }); }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-300 hover:bg-indigo-500/20 transition-all">
                        <Plus size={10} /> Ativo
                      </button>
                      <button onClick={() => router.push("/rebalance")}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-[10px] text-violet-300 hover:bg-violet-500/20 transition-all">
                        <RefreshCw size={10} /> Rebalancear
                      </button>
                      <button onClick={() => deletePortfolio(p.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/5 border border-red-500/10 text-[10px] text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </GlassCard>
          );
        })
      )}
        </div>
      )}

      {/* Add portfolio modal */}
      {showAddPortfolio && (
        <Modal title="Nova carteira" icon={Briefcase} onClose={() => { setShowAddPortfolio(false); setPortfolioError(""); }}>
          <div className="space-y-3">
            <GlassInput label="Nome da carteira" placeholder="Ex: Carteira Principal, Previdência" value={portfolioForm.name} onChange={(e) => setPortfolioForm((p) => ({ ...p, name: e.target.value }))} />
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-white/40 ml-1">Benchmark</label>
              <select value={portfolioForm.benchmark} onChange={(e) => setPortfolioForm((p) => ({ ...p, benchmark: e.target.value }))} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none">
                {["CDI", "IPCA+", "IBOV", "S&P 500", "Dólar"].map((b) => <option key={b} value={b} className="bg-slate-900">{b}</option>)}
              </select>
            </div>
            {portfolioError && (
              <p className="text-[11px] text-red-400 flex items-center gap-1.5 px-1">
                <AlertTriangle size={11} /> {portfolioError}
              </p>
            )}
            <button onClick={addPortfolio} disabled={!portfolioForm.name || savingPortfolio} className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40">
              {savingPortfolio ? <Spinner size={15} /> : <><Plus size={15} /> Criar carteira</>}
            </button>
          </div>
        </Modal>
      )}

      {/* Add asset modal */}
      {showAddAsset && (
        <Modal title="Novo ativo" icon={Plus} onClose={() => { setShowAddAsset(null); setAssetError(""); }}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <GlassInput label="Nome do ativo" placeholder="Tesouro Selic 2029" value={assetForm.asset_name} onChange={(e) => setAssetForm((p) => ({ ...p, asset_name: e.target.value }))} />
              <GlassInput label="Ticker (opcional)" placeholder="PETR4" value={assetForm.asset_ticker} onChange={(e) => setAssetForm((p) => ({ ...p, asset_ticker: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-white/40 ml-1">Classe de ativo</label>
              <select value={assetForm.asset_class} onChange={(e) => setAssetForm((p) => ({ ...p, asset_class: e.target.value }))} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none">
                {ASSET_CLASSES.map((label) => (
                  <option key={label} value={ASSET_CLASS_VALUE_BY_LABEL[label]} className="bg-slate-900">{label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <GlassInput label="Valor atual (R$)" placeholder="50000" type="number" value={assetForm.current_value} onChange={(e) => setAssetForm((p) => ({ ...p, current_value: e.target.value }))} />
              <GlassInput label="Meta (%)" placeholder="20" type="number" value={assetForm.target_pct} onChange={(e) => setAssetForm((p) => ({ ...p, target_pct: e.target.value }))} />
            </div>
            {assetError && (
              <p className="text-[11px] text-red-400 flex items-center gap-1.5 px-1">
                <AlertTriangle size={11} /> {assetError}
              </p>
            )}
            <button onClick={() => addAsset(showAddAsset)} disabled={!assetForm.asset_name || !assetForm.current_value || savingAsset} className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40">
              {savingAsset ? <Spinner size={15} /> : <><Plus size={15} /> Adicionar ativo</>}
            </button>
          </div>
        </Modal>
      )}

      {/* Pluggy invite modal */}
      {showInvite && (
        <Modal
          title="Convidar para conectar"
          icon={ShieldCheck}
          onClose={() => setShowInvite(false)}
          size="lg"
        >
          <div className="space-y-4">
            <p className="text-xs text-white/55 leading-relaxed">
              Gere um link seguro para <strong className="text-white">{client.full_name}</strong> autorizar
              a leitura das posições de investimento (corretora ou banco) via Open Finance. O link expira em 7 dias.
            </p>

            {generatingInvite ? (
              <div className="flex items-center justify-center py-6">
                <Spinner size={20} />
              </div>
            ) : inviteUrl ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-white/40 ml-1">Link do convite</label>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={inviteUrl}
                      className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white/70 font-mono focus:outline-none"
                    />
                    <button
                      onClick={copyInviteLink}
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white/70 hover:bg-white/[0.1] transition-all whitespace-nowrap"
                    >
                      {linkCopied ? <><Check size={13} className="text-emerald-400" /> Copiado</> : <><Copy size={13} /> Copiar</>}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                  <button
                    onClick={sendInviteEmail}
                    disabled={sendingInviteEmail || !client.email}
                    title={!client.email ? "Cliente sem e-mail cadastrado." : ""}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-sm text-violet-300 hover:bg-violet-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {sendingInviteEmail ? <Spinner size={14} /> : <><MailIcon size={14} /> Enviar por e-mail</>}
                  </button>
                </div>

                {emailSentStatus === "sent" && (
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                    <Check size={11} /> E-mail enviado para {client.email}.
                  </p>
                )}
                {emailSentStatus === "skipped" && !client.email && (
                  <p className="text-[11px] text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle size={11} /> Cliente sem e-mail cadastrado. Use o botão "Copiar" para compartilhar manualmente.
                  </p>
                )}
              </>
            ) : null}

            {inviteError && (
              <p className="text-[11px] text-red-400 flex items-center gap-1.5">
                <AlertTriangle size={11} /> {inviteError}
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 -mb-px text-xs font-medium border-b-2 transition-colors ${
        active
          ? "text-white border-indigo-400"
          : "text-white/40 border-transparent hover:text-white/70"
      }`}
    >
      <Icon size={13} /> {label}
      {typeof count === "number" && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${active ? "bg-indigo-500/15 text-indigo-300" : "bg-white/[0.06] text-white/40"}`}>
          {count}
        </span>
      )}
    </button>
  );
}
