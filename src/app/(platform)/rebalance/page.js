"use client";

import { useState, useMemo, useCallback } from "react";
import * as XLSX from "xlsx";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatCurrency, formatPct } from "@/lib/utils";
import { ASSET_CLASSES, CLASS_COLORS } from "@/lib/constants";
import { GlassCard } from "@/components/ui";
import {
  RefreshCw, Target, DollarSign, Upload, Download, Edit3,
  Check, AlertTriangle, Plus, Trash2, CheckCircle,
  TrendingUp, TrendingDown,
} from "lucide-react";

function parseExcel(data) {
  const wb = XLSX.read(data, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(ws);
  return json.map((row, i) => {
    const ativo = row["Ativo"] || row["ativo"] || row["Nome"] || `Ativo ${i + 1}`;
    const classe = row["Classe"] || row["classe"] || row["Tipo"] || "Outros";
    const valorRaw = row["Valor"] || row["valor"] || row["Valor Atual"] || 0;
    const metaRaw = row["Meta"] || row["meta"] || row["% Meta"] || 0;
    const valor = typeof valorRaw === "string" ? parseFloat(valorRaw.replace(/[^\d,.-]/g, "").replace(",", ".")) : Number(valorRaw);
    const meta = typeof metaRaw === "string" ? parseFloat(metaRaw.replace(/[^\d,.-]/g, "").replace(",", ".")) : Number(metaRaw);
    return {
      id: i,
      ativo,
      classe: ASSET_CLASSES.includes(classe) ? classe : "Outros",
      valor: isNaN(valor) ? 0 : valor,
      meta: isNaN(meta) ? 0 : meta > 1 ? meta / 100 : meta,
    };
  });
}

export default function RebalancePage() {
  const [assets, setAssets] = useState([]);
  const [capital, setCapital] = useState("");
  const [done, setDone] = useState(false);
  const [fileName, setFileName] = useState("");
  const [editingId, setEditingId] = useState(null);

  const totalAtual = assets.reduce((s, a) => s + a.valor, 0);
  const capNum = parseFloat(capital.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
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

  const handleFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const parsed = parseExcel(new Uint8Array(evt.target.result));
      if (parsed.length > 0) setAssets(parsed);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const addAsset = () => {
    const newId = Date.now();
    setAssets((p) => [...p, { id: newId, ativo: "", classe: "Outros", valor: 0, meta: 0 }]);
    setEditingId(newId);
  };

  const updateAsset = (id, field, value) => {
    setAssets((p) => p.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const exportXlsx = () => {
    const d = result.map((r) => ({
      Ativo: r.ativo, Classe: r.classe,
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
    XLSX.writeFile(wb, `rebalanceamento_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Rebalanceamento</h2>
          <p className="text-xs text-white/40 mt-0.5">Calcule a alocação ideal para novos aportes</p>
        </div>
        {assets.length === 0 && (
          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 cursor-pointer transition-all">
            <Upload size={15} /> Importar Excel
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" />
          </label>
        )}
      </div>

      {/* Capital input */}
      <GlassCard className="p-5" delay={0}>
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5 flex items-center gap-1">
              <DollarSign size={10} className="text-emerald-400" /> Novo aporte (R$)
            </label>
            <input type="text" value={capital} onChange={(e) => setCapital(e.target.value)} placeholder="Ex: 50000"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-lg font-semibold text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
          <div className="flex gap-3">
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
                    const isEditing = editingId === a.id;
                    return (
                      <tr key={a.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors" style={{ animation: `fadeInUp 0.25s ease ${i * 0.02}s both` }}>
                        <td className="py-2.5 px-5">
                          {isEditing ? <input value={a.ativo} onChange={(e) => updateAsset(a.id, "ativo", e.target.value)} className="bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-sm w-full max-w-[140px] text-white focus:outline-none" autoFocus />
                            : <span className="font-medium text-white/85 text-xs">{a.ativo || "—"}</span>}
                        </td>
                        <td className="py-2.5 px-3">
                          {isEditing ? <select value={a.classe} onChange={(e) => updateAsset(a.id, "classe", e.target.value)} className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-white">{ASSET_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
                            : <span className="text-[9px] px-1.5 py-0.5 rounded-md text-white/50" style={{ background: CLASS_COLORS[a.classe] + "18", border: `1px solid ${CLASS_COLORS[a.classe]}30` }}>{a.classe}</span>}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {isEditing ? <input type="number" value={a.valor || ""} onChange={(e) => updateAsset(a.id, "valor", parseFloat(e.target.value) || 0)} className="bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-sm w-24 text-right text-white focus:outline-none" />
                            : <span className="font-mono text-xs text-white/60">{formatCurrency(a.valor)}</span>}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-xs text-white/40">{formatPct(pa)}</td>
                        <td className="py-2.5 px-3 text-right">
                          {isEditing ? <input type="number" value={a.meta ? Math.round(a.meta * 1000) / 10 : ""} onChange={(e) => updateAsset(a.id, "meta", (parseFloat(e.target.value) || 0) / 100)} className="bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-sm w-16 text-right text-white focus:outline-none" placeholder="%" />
                            : <span className="font-mono text-xs text-indigo-300">{formatPct(a.meta)}</span>}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => setEditingId(isEditing ? null : a.id)} className="p-1 rounded-md hover:bg-white/10 text-white/25 hover:text-white/60 transition-all">
                              {isEditing ? <CheckCircle size={13} /> : <Edit3 size={13} />}
                            </button>
                            <button onClick={() => setAssets((p) => p.filter((x) => x.id !== a.id))} className="p-1 rounded-md hover:bg-red-500/10 text-white/25 hover:text-red-400 transition-all">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {assets.length === 0 && (
                    <tr><td colSpan={6} className="py-12 text-center text-white/25 text-sm">Importe um Excel ou adicione ativos manualmente.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
          <div className="flex justify-center">
            <button onClick={() => setDone(true)} disabled={!metaOk || assets.length === 0}
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
              <button onClick={() => setDone(false)} className="text-xs text-white/35 hover:text-white/60 flex items-center gap-1"><Edit3 size={11} /> Editar</button>
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
                      <td className="py-2.5 px-3 hidden sm:table-cell"><span className="text-[9px] px-1.5 py-0.5 rounded-md text-white/50" style={{ background: CLASS_COLORS[r.classe] + "18", border: `1px solid ${CLASS_COLORS[r.classe]}30` }}>{r.classe}</span></td>
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
          <div className="flex justify-center gap-3">
            <button onClick={exportXlsx} className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all">
              <Download size={15} /> Exportar Excel
            </button>
            <button onClick={() => setDone(false)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-sm text-white/50 hover:text-white hover:bg-white/10 transition-all">
              <Edit3 size={13} /> Ajustar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
