"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import * as XLSX from "xlsx";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatCurrency, formatPct } from "@/lib/utils";
import { ASSET_CLASSES, CLASS_COLORS, normalizeAssetClass } from "@/lib/constants";
import { GlassCard, GlassInput, Modal, Spinner, StatCard } from "@/components/ui";
import {
  RefreshCw, Target, DollarSign, Upload, Download, Edit3,
  Check, AlertTriangle, Plus, Trash2, CheckCircle,
  TrendingUp, TrendingDown, Briefcase, Users, Clock,
  FileSpreadsheet, ChevronDown, Save, History, ArrowRight,
} from "lucide-react";

const CLASS_LABEL = {
  renda_fixa: "Renda Fixa", acoes_brasil: "Ações Brasil", acoes_eua: "Ações EUA",
  fiis: "FIIs", cripto: "Cripto", internacional: "Internacional",
  multimercado: "Multimercado", commodities: "Commodities", caixa: "Caixa", outros: "Outros",
};

function parseExcel(data) {
  const wb = XLSX.read(data, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(ws);
  return json.map((row, i) => {
    const ativo = row["Ativo"] || row["ativo"] || row["Nome"] || `Ativo ${i + 1}`;
    const classe = row["Classe"] || row["classe"] || row["Tipo"] || "outros";
    const valorRaw = row["Valor"] || row["valor"] || row["Valor Atual"] || 0;
    const metaRaw = row["Meta"] || row["meta"] || row["% Meta"] || 0;
    const valor = typeof valorRaw === "string" ? parseFloat(valorRaw.replace(/[^\d,.-]/g, "").replace(",", ".")) : Number(valorRaw);
    const meta = typeof metaRaw === "string" ? parseFloat(metaRaw.replace(/[^\d,.-]/g, "").replace(",", ".")) : Number(metaRaw);
    return {
      id: `ex-${i}`,
      ativo,
      classe: normalizeAssetClass(classe),
      valor: isNaN(valor) ? 0 : valor,
      meta: isNaN(meta) ? 0 : meta > 1 ? meta / 100 : meta,
    };
  });
}

export default function RebalancePage() {
  const supabase = getSupabaseBrowserClient();

  // Source selection
  const [source, setSource] = useState(null); // "db" | "excel" | null
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState("");
  const [portfolioData, setPortfolioData] = useState(null);

  // Assets & calculation
  const [assets, setAssets] = useState([]);
  const [capital, setCapital] = useState("");
  const [done, setDone] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [fileName, setFileName] = useState("");

  // Save & history
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [loadingInit, setLoadingInit] = useState(true);

  // ─── Load clients on mount ───
  useEffect(() => {
    async function init() {
      const { data } = await supabase
        .from("clients")
        .select("id, full_name")
        .eq("is_active", true)
        .order("full_name");
      setClients(data || []);
      setLoadingInit(false);
    }
    init();
  }, []);

  // ─── Load portfolios when client changes ───
  useEffect(() => {
    if (!selectedClient) { setPortfolios([]); return; }
    async function loadPortfolios() {
      const { data } = await supabase
        .from("portfolios")
        .select("id, name, total_value")
        .eq("client_id", selectedClient)
        .eq("is_active", true)
        .order("name");
      setPortfolios(data || []);
    }
    loadPortfolios();
  }, [selectedClient]);

  // ─── Load portfolio assets when portfolio changes ───
  useEffect(() => {
    if (!selectedPortfolio) return;
    async function loadAssets() {
      const { data: pData } = await supabase
        .from("portfolios")
        .select("*")
        .eq("id", selectedPortfolio)
        .single();

      const { data: aData } = await supabase
        .from("portfolio_assets")
        .select("*")
        .eq("portfolio_id", selectedPortfolio)
        .order("current_value", { ascending: false });

      setPortfolioData(pData);
      setAssets(
        (aData || []).map((a) => ({
          id: a.id,
          ativo: a.asset_name,
          ticker: a.asset_ticker,
          classe: a.asset_class,
          valor: Number(a.current_value),
          meta: Number(a.target_pct),
          db_id: a.id,
        }))
      );
      setSource("db");
    }
    loadAssets();
  }, [selectedPortfolio]);

  // ─── Excel import ───
  const handleFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const parsed = parseExcel(new Uint8Array(evt.target.result));
      if (parsed.length > 0) {
        setAssets(parsed);
        setSource("excel");
        setSelectedClient("");
        setSelectedPortfolio("");
        setPortfolioData(null);
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  // ─── Calculations ───
  const totalAtual = assets.reduce((s, a) => s + a.valor, 0);
  const capNum = parseFloat(String(capital).replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
  const totalNovo = totalAtual + capNum;
  const totalMeta = assets.reduce((s, a) => s + a.meta, 0);
  const metaOk = Math.abs(totalMeta - 1) < 0.005;

  const result = useMemo(() => {
    if (!metaOk || totalNovo <= 0) return [];
    return assets
      .map((a) => {
        const ideal = totalNovo * a.meta;
        const delta = ideal - a.valor;
        const pctAt = totalAtual > 0 ? a.valor / totalAtual : 0;
        return { ...a, ideal, delta, pctAt, desvio: pctAt - a.meta };
      })
      .sort((a, b) => b.delta - a.delta);
  }, [assets, totalNovo, totalAtual, metaOk]);

  // ─── Save operation to DB ───
  async function saveOperation() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    // Create operation record
    const { data: op, error: opErr } = await supabase
      .from("rebalancing_operations")
      .insert({
        portfolio_id: selectedPortfolio || null,
        consultant_id: user.id,
        new_capital: capNum,
        total_before: totalAtual,
        total_after: totalNovo,
        notes: source === "excel" ? `Importado de: ${fileName}` : "",
      })
      .select()
      .single();

    if (opErr || !op) { setSaving(false); return; }

    // Create detail items
    const items = result.map((r) => ({
      operation_id: op.id,
      asset_name: r.ativo,
      asset_class: r.classe,
      current_value: r.valor,
      target_pct: r.meta,
      ideal_value: Math.round(r.ideal * 100) / 100,
      allocation_delta: Math.round(r.delta * 100) / 100,
    }));

    await supabase.from("rebalancing_items").insert(items);
    setSaving(false);
    setSaved(true);
  }

  // ─── Apply rebalancing (update portfolio_assets) ───
  async function applyRebalancing() {
    if (!selectedPortfolio || source !== "db") return;
    setSaving(true);

    for (const r of result) {
      if (r.db_id) {
        await supabase
          .from("portfolio_assets")
          .update({ current_value: Math.round(r.ideal * 100) / 100 })
          .eq("id", r.db_id);
      }
    }

    setSaving(false);
    setSaved(true);
  }

  // ─── Load history ───
  async function loadHistory() {
    setLoadingHistory(true);
    setShowHistory(true);

    const { data } = await supabase
      .from("rebalancing_operations")
      .select("*, rebalancing_items(*)")
      .order("executed_at", { ascending: false })
      .limit(10);

    setHistory(data || []);
    setLoadingHistory(false);
  }

  // ─── Export Excel ───
  const exportXlsx = () => {
    const clientName = clients.find((c) => c.id === selectedClient)?.full_name || "carteira";
    const d = result.map((r) => ({
      Ativo: r.ativo, Classe: CLASS_LABEL[r.classe] || r.classe,
      "Valor Atual": Math.round(r.valor * 100) / 100,
      "% Atual": Math.round(r.pctAt * 10000) / 100,
      "% Meta": Math.round(r.meta * 10000) / 100,
      "Valor Ideal": Math.round(r.ideal * 100) / 100,
      "Alocar (R$)": Math.round(r.delta * 100) / 100,
    }));
    d.push({ Ativo: "TOTAL", Classe: "", "Valor Atual": Math.round(totalAtual * 100) / 100, "% Atual": 100, "% Meta": 100, "Valor Ideal": Math.round(totalNovo * 100) / 100, "Alocar (R$)": Math.round(capNum * 100) / 100 });
    const ws = XLSX.utils.json_to_sheet(d);
    ws["!cols"] = [{ wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rebalanceamento");
    XLSX.writeFile(wb, `rebalanceamento_${clientName.replace(/ /g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // ─── Reset ───
  const resetAll = () => {
    setAssets([]); setCapital(""); setDone(false); setSaved(false);
    setSource(null); setSelectedClient(""); setSelectedPortfolio("");
    setPortfolioData(null); setFileName(""); setEditingId(null);
  };

  // ─── Asset editing ───
  const addAsset = () => {
    const newId = `new-${Date.now()}`;
    setAssets((p) => [...p, { id: newId, ativo: "", classe: "outros", valor: 0, meta: 0 }]);
    setEditingId(newId);
  };
  const updateAsset = (id, field, value) => {
    setAssets((p) => p.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  if (loadingInit) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Spinner size={28} /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Rebalanceamento</h2>
          <p className="text-xs text-white/40 mt-0.5">Calcule e salve a alocação ideal</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadHistory} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white/40 hover:text-white/70 transition-all">
            <History size={13} /> Histórico
          </button>
          {assets.length > 0 && (
            <button onClick={resetAll} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white/40 hover:text-white/70 transition-all">
              <RefreshCw size={13} /> Nova operação
            </button>
          )}
        </div>
      </div>

      {/* Source selector — only show if no assets loaded */}
      {assets.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* From DB */}
          <GlassCard className="p-5" delay={0}>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Briefcase size={14} className="text-indigo-400" /> Carregar do sistema
            </h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-white/35">Cliente</label>
                <select value={selectedClient} onChange={(e) => { setSelectedClient(e.target.value); setSelectedPortfolio(""); }}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40">
                  <option value="" className="bg-slate-900">Selecione um cliente</option>
                  {clients.map((c) => <option key={c.id} value={c.id} className="bg-slate-900">{c.full_name}</option>)}
                </select>
              </div>
              {portfolios.length > 0 && (
                <div className="space-y-1.5" style={{ animation: "fadeInUp 0.2s ease both" }}>
                  <label className="text-[10px] uppercase tracking-wider text-white/35">Carteira</label>
                  <select value={selectedPortfolio} onChange={(e) => setSelectedPortfolio(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40">
                    <option value="" className="bg-slate-900">Selecione uma carteira</option>
                    {portfolios.map((p) => <option key={p.id} value={p.id} className="bg-slate-900">{p.name} — {formatCurrency(Number(p.total_value))}</option>)}
                  </select>
                </div>
              )}
              {selectedClient && portfolios.length === 0 && (
                <p className="text-xs text-white/25 py-2">Nenhuma carteira encontrada para este cliente.</p>
              )}
            </div>
          </GlassCard>

          {/* From Excel */}
          <GlassCard className="p-5" delay={0.05}>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <FileSpreadsheet size={14} className="text-emerald-400" /> Importar Excel
            </h3>
            <label className="flex flex-col items-center gap-3 py-6 border border-dashed border-white/10 rounded-xl cursor-pointer hover:border-indigo-500/30 hover:bg-white/[0.02] transition-all">
              <Upload size={24} className="text-white/20" />
              <div className="text-center">
                <p className="text-xs text-white/50">Arraste ou clique para importar</p>
                <p className="text-[10px] text-white/25">.xlsx, .xls ou .csv</p>
              </div>
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" />
            </label>
            <button onClick={addAsset} className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white/35 hover:text-white/60 transition-all">
              <Plus size={12} /> ou inserir manualmente
            </button>
          </GlassCard>
        </div>
      )}

      {/* Capital input (show once assets are loaded) */}
      {assets.length > 0 && (
        <>
          <GlassCard className="p-5" delay={0}>
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="flex-1">
                <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5 flex items-center gap-1">
                  <DollarSign size={10} className="text-emerald-400" /> Novo aporte (R$)
                </label>
                <input type="text" value={capital} onChange={(e) => setCapital(e.target.value)} placeholder="Ex: 50000"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-lg font-semibold text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
              </div>
              <div className="flex gap-3">
                {source === "db" && portfolioData && (
                  <div className="text-center px-4 py-2 bg-indigo-500/[0.05] rounded-xl border border-indigo-500/10">
                    <p className="text-[9px] text-indigo-300/60 uppercase">Carteira</p>
                    <p className="text-xs font-semibold text-indigo-300">{portfolioData.name}</p>
                  </div>
                )}
                <div className="text-center px-4 py-2 bg-white/[0.03] rounded-xl border border-white/5">
                  <p className="text-[9px] text-white/35 uppercase">Atual</p>
                  <p className="text-sm font-semibold">{formatCurrency(totalAtual)}</p>
                </div>
                <div className="text-center px-4 py-2 bg-white/[0.03] rounded-xl border border-white/5">
                  <p className="text-[9px] text-white/35 uppercase">Final</p>
                  <p className="text-sm font-semibold text-emerald-400">{formatCurrency(totalNovo)}</p>
                </div>
              </div>
            </div>
          </GlassCard>

          {!done ? (
            <>
              {/* Asset table */}
              <GlassCard className="overflow-hidden" delay={0.1}>
                <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Carteira</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-lg border ${metaOk ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"}`}>
                      {metaOk ? <Check size={9} className="inline mr-1" /> : <AlertTriangle size={9} className="inline mr-1" />}
                      Meta: {formatPct(totalMeta)}
                    </span>
                    <button onClick={addAsset} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 hover:bg-indigo-500/20 transition-all">
                      <Plus size={11} /> Ativo
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.05] text-[10px] uppercase tracking-wider text-white/30">
                        <th className="text-left py-2.5 px-5">Ativo</th>
                        <th className="text-left py-2.5 px-3">Classe</th>
                        <th className="text-right py-2.5 px-3">Valor</th>
                        <th className="text-right py-2.5 px-3">% Atual</th>
                        <th className="text-right py-2.5 px-3">% Meta</th>
                        <th className="text-center py-2.5 px-3 w-16" />
                      </tr>
                    </thead>
                    <tbody>
                      {assets.map((a, i) => {
                        const pa = totalAtual > 0 ? a.valor / totalAtual : 0;
                        const isEd = editingId === a.id;
                        return (
                          <tr key={a.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors" style={{ animation: `fadeInUp 0.2s ease ${i * 0.02}s both` }}>
                            <td className="py-2.5 px-5">
                              {isEd ? <input value={a.ativo} onChange={(e) => updateAsset(a.id, "ativo", e.target.value)} className="bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-sm w-full max-w-[150px] text-white focus:outline-none" autoFocus />
                                : <span className="font-medium text-white/85 text-xs">{a.ativo || "—"}</span>}
                            </td>
                            <td className="py-2.5 px-3">
                              {isEd ? <select value={a.classe} onChange={(e) => updateAsset(a.id, "classe", e.target.value)} className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-white">
                                {Object.entries(CLASS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                              </select>
                                : <span className="text-[9px] px-1.5 py-0.5 rounded-md text-white/50" style={{ background: (CLASS_COLORS[CLASS_LABEL[a.classe]] || "#9ca3af") + "18" }}>{CLASS_LABEL[a.classe] || a.classe}</span>}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {isEd ? <input type="number" value={a.valor || ""} onChange={(e) => updateAsset(a.id, "valor", parseFloat(e.target.value) || 0)} className="bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-sm w-24 text-right text-white focus:outline-none" />
                                : <span className="font-mono text-xs text-white/60">{formatCurrency(a.valor)}</span>}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-xs text-white/40">{formatPct(pa)}</td>
                            <td className="py-2.5 px-3 text-right">
                              {isEd ? <input type="number" value={a.meta ? Math.round(a.meta * 1000) / 10 : ""} onChange={(e) => updateAsset(a.id, "meta", (parseFloat(e.target.value) || 0) / 100)} className="bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-sm w-16 text-right text-white focus:outline-none" placeholder="%" />
                                : <span className="font-mono text-xs text-indigo-300">{formatPct(a.meta)}</span>}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button onClick={() => setEditingId(isEd ? null : a.id)} className="p-1 rounded-md hover:bg-white/10 text-white/25 hover:text-white/60 transition-all">
                                  {isEd ? <CheckCircle size={13} /> : <Edit3 size={13} />}
                                </button>
                                <button onClick={() => setAssets((p) => p.filter((x) => x.id !== a.id))} className="p-1 rounded-md hover:bg-red-500/10 text-white/25 hover:text-red-400 transition-all">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
              <div className="flex justify-center">
                <button onClick={() => { setDone(true); setSaved(false); }} disabled={!metaOk || assets.length === 0}
                  className={`flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold transition-all ${metaOk && assets.length > 0 ? "bg-gradient-to-r from-indigo-500 to-violet-500 hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98]" : "bg-white/[0.05] text-white/25 cursor-not-allowed"}`}>
                  <Target size={15} /> Calcular rebalanceamento
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Results */}
              <GlassCard className="overflow-hidden" delay={0.1}>
                <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-2"><RefreshCw size={13} className="text-indigo-400" /> Sugestão de rebalanceamento</h3>
                  <button onClick={() => { setDone(false); setSaved(false); }} className="text-xs text-white/35 hover:text-white/60 flex items-center gap-1"><Edit3 size={11} /> Editar</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.05] text-[10px] uppercase tracking-wider text-white/30">
                        <th className="text-left py-2.5 px-5">Ativo</th>
                        <th className="text-left py-2.5 px-3 hidden sm:table-cell">Classe</th>
                        <th className="text-right py-2.5 px-3">Atual</th>
                        <th className="text-right py-2.5 px-3">% Meta</th>
                        <th className="text-right py-2.5 px-3 hidden md:table-cell">Ideal</th>
                        <th className="text-right py-2.5 px-5">Alocar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.map((r, i) => (
                        <tr key={r.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors" style={{ animation: `fadeInUp 0.3s ease ${i * 0.03}s both` }}>
                          <td className="py-2.5 px-5 font-medium text-white/85 text-xs">{r.ativo}</td>
                          <td className="py-2.5 px-3 hidden sm:table-cell"><span className="text-[9px] px-1.5 py-0.5 rounded-md text-white/50" style={{ background: (CLASS_COLORS[CLASS_LABEL[r.classe]] || "#9ca3af") + "18" }}>{CLASS_LABEL[r.classe] || r.classe}</span></td>
                          <td className="py-2.5 px-3 text-right font-mono text-xs text-white/50">{formatCurrency(r.valor)}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-xs text-indigo-300">{formatPct(r.meta)}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-xs text-white/50 hidden md:table-cell">{formatCurrency(r.ideal)}</td>
                          <td className="py-2.5 px-5 text-right">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold font-mono ${r.delta >= 0 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                              {r.delta >= 0 ? "+" : ""}{formatCurrency(r.delta)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-white/10 bg-white/[0.02]">
                        <td className="py-2.5 px-5 text-xs font-semibold text-white/40 uppercase" colSpan={2}>Total</td>
                        <td className="py-2.5 px-3 text-right font-mono text-xs font-semibold text-white/60">{formatCurrency(totalAtual)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-xs text-indigo-300">100%</td>
                        <td className="py-2.5 px-3 text-right font-mono text-xs text-white/60 hidden md:table-cell">{formatCurrency(totalNovo)}</td>
                        <td className="py-2.5 px-5 text-right font-mono text-xs font-semibold text-emerald-400">{formatCurrency(capNum)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </GlassCard>

              {/* Actions */}
              <div className="flex flex-wrap justify-center gap-3">
                {!saved ? (
                  <>
                    <button onClick={saveOperation} disabled={saving} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
                      {saving ? <Spinner size={16} /> : <><Save size={15} /> Salvar operação</>}
                    </button>
                    {source === "db" && selectedPortfolio && (
                      <button onClick={applyRebalancing} disabled={saving} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50">
                        {saving ? <Spinner size={16} /> : <><Check size={15} /> Aplicar na carteira</>}
                      </button>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 animate-fade-in">
                    <CheckCircle size={16} /> Operação salva com sucesso
                  </div>
                )}
                <button onClick={exportXlsx} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-sm text-white/50 hover:text-white hover:bg-white/10 transition-all">
                  <Download size={14} /> Excel
                </button>
                <button onClick={() => { setDone(false); setSaved(false); }} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-sm text-white/50 hover:text-white hover:bg-white/10 transition-all">
                  <Edit3 size={14} /> Ajustar
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* History modal */}
      {showHistory && (
        <Modal title="Histórico de rebalanceamentos" icon={History} onClose={() => setShowHistory(false)}>
          {loadingHistory ? (
            <div className="py-8 flex justify-center"><Spinner /></div>
          ) : history.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/25">Nenhum rebalanceamento registrado.</p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {history.map((h) => (
                <div key={h.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/60 flex items-center gap-1.5">
                      <Clock size={11} className="text-white/30" />
                      {new Date(h.executed_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">+{formatCurrency(h.new_capital)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-white/35">
                    <span>Antes: {formatCurrency(h.total_before)}</span>
                    <ArrowRight size={10} />
                    <span>Depois: {formatCurrency(h.total_after)}</span>
                    <span>· {h.rebalancing_items?.length || 0} ativos</span>
                  </div>
                  {h.notes && <p className="text-[10px] text-white/20 mt-1">{h.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
