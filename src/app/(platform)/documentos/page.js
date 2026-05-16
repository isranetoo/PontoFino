"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { GlassCard, Modal, Spinner, StatCard } from "@/components/ui";
import {
  FolderOpen, Upload, Users, Trash2, Download, History, Search,
  FileText, FileSpreadsheet, FileImage, File as FileIcon, Presentation,
  AlertCircle, Clock, HardDrive, Files,
} from "lucide-react";

const BUCKET = "client-files";
const MAX_SIZE_BYTES = 25 * 1024 * 1024;

const CATEGORIES = [
  { key: "all",            label: "Todos",          pill: "bg-white/[0.05] text-white/70 border-white/10" },
  { key: "contratos",      label: "Contratos",      pill: "bg-indigo-500/15 text-indigo-300 border-indigo-500/20" },
  { key: "kyc",            label: "KYC",            pill: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20" },
  { key: "relatorios",     label: "Relatórios",     pill: "bg-amber-500/15 text-amber-300 border-amber-500/20" },
  { key: "suitability",    label: "Suitability",    pill: "bg-cyan-500/15 text-cyan-300 border-cyan-500/20" },
  { key: "identificacao",  label: "Identificação",  pill: "bg-rose-500/15 text-rose-300 border-rose-500/20" },
  { key: "outros",         label: "Outros",         pill: "bg-slate-500/15 text-slate-300 border-slate-500/20" },
];

const CATEGORY_PILL = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.pill]));
const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.label]));

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/png",
  "image/jpeg",
  "image/webp",
];

const ALLOWED_EXT_HINT = ".pdf, .doc(x), .xls(x), .ppt(x), .png, .jpg, .webp";

function formatBytes(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function getFileVisual(mime) {
  if (!mime) return { Icon: FileIcon, color: "text-white/40", bg: "bg-white/[0.05]" };
  if (mime === "application/pdf") return { Icon: FileText, color: "text-red-300", bg: "bg-red-500/10" };
  if (mime.includes("word")) return { Icon: FileText, color: "text-blue-300", bg: "bg-blue-500/10" };
  if (mime.includes("sheet") || mime.includes("excel")) return { Icon: FileSpreadsheet, color: "text-emerald-300", bg: "bg-emerald-500/10" };
  if (mime.includes("presentation") || mime.includes("powerpoint")) return { Icon: Presentation, color: "text-orange-300", bg: "bg-orange-500/10" };
  if (mime.startsWith("image/")) return { Icon: FileImage, color: "text-cyan-300", bg: "bg-cyan-500/10" };
  return { Icon: FileIcon, color: "text-white/40", bg: "bg-white/[0.05]" };
}

function getExtension(filename) {
  const idx = filename.lastIndexOf(".");
  return idx >= 0 ? filename.substring(idx + 1).toLowerCase() : "";
}

export default function DocumentosPage() {
  const supabase = getSupabaseBrowserClient();

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [docs, setDocs] = useState([]);
  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);

  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  // Upload modal
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCategory, setUploadCategory] = useState("contratos");
  const [uploadName, setUploadName] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Versions modal
  const [versionsFor, setVersionsFor] = useState(null);

  // ─── Init: load clients ───
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
  }, [supabase]);

  // ─── Load docs when client changes ───
  useEffect(() => {
    if (!selectedClient) {
      setDocs([]);
      return;
    }
    loadDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClient]);

  async function loadDocs() {
    setLoadingDocs(true);
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("client_id", selectedClient)
      .order("uploaded_at", { ascending: false });
    if (error) console.error("[documentos] load failed:", error);
    setDocs(data || []);
    setLoadingDocs(false);
  }

  // ─── Filtered list (only current versions) ───
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return docs
      .filter((d) => d.is_current)
      .filter((d) => activeCategory === "all" || d.category === activeCategory)
      .filter((d) => !term || d.name.toLowerCase().includes(term) || d.description.toLowerCase().includes(term));
  }, [docs, activeCategory, search]);

  // ─── Stats (over all docs of the client, not just filtered) ───
  const stats = useMemo(() => {
    const current = docs.filter((d) => d.is_current);
    const totalSize = docs.reduce((s, d) => s + Number(d.size_bytes), 0);
    const lastUpload = docs.length > 0
      ? new Date(Math.max(...docs.map((d) => new Date(d.uploaded_at).getTime())))
      : null;
    const versionedCount = current.filter((d) => d.version > 1).length;
    return {
      total: current.length,
      totalSize,
      lastUpload,
      versionedCount,
    };
  }, [docs]);

  // ─── Versions for one logical document ───
  function getVersions(doc) {
    return docs
      .filter((d) => d.client_id === doc.client_id && d.name === doc.name)
      .sort((a, b) => b.version - a.version);
  }

  // ─── Upload flow ───
  function openUpload() {
    if (!selectedClient) return;
    setUploadFile(null);
    setUploadName("");
    setUploadCategory("contratos");
    setUploadDescription("");
    setUploadError("");
    setShowUpload(true);
  }

  function pickFile(file) {
    if (!file) return;
    setUploadError("");
    if (file.size > MAX_SIZE_BYTES) {
      setUploadError(`Arquivo maior que ${formatBytes(MAX_SIZE_BYTES)}.`);
      return;
    }
    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
      setUploadError(`Tipo de arquivo não permitido. Aceitos: ${ALLOWED_EXT_HINT}`);
      return;
    }
    setUploadFile(file);
    if (!uploadName) setUploadName(file.name);
  }

  function onFilePickerChange(e) {
    const file = e.target.files?.[0];
    pickFile(file);
  }

  function onDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    pickFile(file);
  }

  async function uploadDoc() {
    setUploadError("");
    if (!uploadFile) { setUploadError("Selecione um arquivo."); return; }
    if (!uploadName.trim()) { setUploadError("Dê um nome ao documento."); return; }

    setUploading(true);

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      console.error("[documentos] auth.getUser failed:", userErr);
      setUploadError("Sessão expirada. Faça login novamente.");
      setUploading(false);
      return;
    }
    const consultantId = userData.user.id;

    const finalName = uploadName.trim();

    // Look for existing current version with same client + name
    const existing = docs.find(
      (d) => d.is_current && d.client_id === selectedClient && d.name === finalName,
    );

    const ext = getExtension(uploadFile.name);
    const newDocId = crypto.randomUUID();
    const storagePath = `${consultantId}/${newDocId}${ext ? "." + ext : ""}`;

    // 1. Upload to storage
    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, uploadFile, {
        contentType: uploadFile.type || "application/octet-stream",
        upsert: false,
      });
    if (uploadErr) {
      console.error("[documentos] storage upload failed:", uploadErr);
      setUploadError(uploadErr.message || "Erro ao enviar o arquivo.");
      setUploading(false);
      return;
    }

    // 2. If new version: mark previous as not current
    if (existing) {
      const { error: updErr } = await supabase
        .from("documents")
        .update({ is_current: false })
        .eq("id", existing.id);
      if (updErr) {
        console.error("[documentos] mark old version failed:", updErr);
        // rollback storage
        await supabase.storage.from(BUCKET).remove([storagePath]);
        setUploadError(updErr.message || "Erro ao atualizar versão anterior.");
        setUploading(false);
        return;
      }
    }

    // 3. Insert new doc row
    const nextVersion = existing ? existing.version + 1 : 1;
    const { error: insertErr } = await supabase.from("documents").insert({
      id: newDocId,
      consultant_id: consultantId,
      client_id: selectedClient,
      category: uploadCategory,
      name: finalName,
      storage_path: storagePath,
      mime_type: uploadFile.type || "application/octet-stream",
      size_bytes: uploadFile.size,
      version: nextVersion,
      previous_version_id: existing?.id || null,
      is_current: true,
      description: uploadDescription.trim(),
    });

    if (insertErr) {
      console.error("[documentos] insert doc row failed:", insertErr);
      // rollback storage upload
      await supabase.storage.from(BUCKET).remove([storagePath]);
      if (existing) {
        // revert is_current flip
        await supabase.from("documents").update({ is_current: true }).eq("id", existing.id);
      }
      setUploadError(insertErr.message || "Erro ao salvar o documento.");
      setUploading(false);
      return;
    }

    setUploading(false);
    setShowUpload(false);
    await loadDocs();
  }

  // ─── Download ───
  async function downloadDoc(doc) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(doc.storage_path, 60, { download: doc.name });
    if (error) {
      console.error("[documentos] signed url failed:", error);
      alert("Erro ao gerar link de download.");
      return;
    }
    window.open(data.signedUrl, "_blank");
  }

  // ─── Delete entire document chain (all versions + storage files) ───
  async function deleteDocChain(doc) {
    const versions = getVersions(doc);
    const count = versions.length;
    const msg = count > 1
      ? `Excluir "${doc.name}" e suas ${count} versões? Os arquivos serão removidos do storage.`
      : `Excluir "${doc.name}"? O arquivo será removido do storage.`;
    if (!confirm(msg)) return;

    const paths = versions.map((v) => v.storage_path);
    const ids = versions.map((v) => v.id);

    const { error: storageErr } = await supabase.storage.from(BUCKET).remove(paths);
    if (storageErr) {
      console.error("[documentos] storage remove failed:", storageErr);
      // continue anyway — we still want to clean DB so the entry doesn't linger
    }

    const { error: dbErr } = await supabase.from("documents").delete().in("id", ids);
    if (dbErr) {
      console.error("[documentos] db delete failed:", dbErr);
      alert("Erro ao excluir documento. Tente novamente.");
      return;
    }
    if (versionsFor && ids.includes(versionsFor.id)) setVersionsFor(null);
    await loadDocs();
  }

  // ─── Delete one specific version (only when there are others) ───
  async function deleteOneVersion(version, allVersions) {
    if (allVersions.length <= 1) return;
    if (!confirm(`Excluir a versão v${version.version} de "${version.name}"?`)) return;

    const wasCurrent = version.is_current;

    const { error: storageErr } = await supabase.storage.from(BUCKET).remove([version.storage_path]);
    if (storageErr) console.error("[documentos] storage remove failed:", storageErr);

    const { error: dbErr } = await supabase.from("documents").delete().eq("id", version.id);
    if (dbErr) {
      console.error("[documentos] delete version failed:", dbErr);
      alert("Erro ao excluir versão.");
      return;
    }

    // If we deleted the current version, promote the next most recent one
    if (wasCurrent) {
      const remaining = allVersions
        .filter((v) => v.id !== version.id)
        .sort((a, b) => b.version - a.version);
      if (remaining[0]) {
        await supabase.from("documents").update({ is_current: true }).eq("id", remaining[0].id);
      }
    }
    await loadDocs();
    // refresh versions modal
    if (versionsFor) {
      const updated = (await supabase.from("documents").select("*").eq("client_id", selectedClient));
      const fresh = (updated.data || []).find((d) => d.id === versionsFor.id);
      if (fresh) setVersionsFor(fresh);
      else setVersionsFor(null);
    }
  }

  if (loadingInit) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Documentos</h2>
          <p className="text-xs text-white/40 mt-0.5">Contratos, KYC, relatórios e mais — organizados por cliente e categoria</p>
        </div>
        <button
          type="button"
          onClick={openUpload}
          disabled={!selectedClient}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            selectedClient
              ? "bg-gradient-to-r from-indigo-500 to-violet-500 hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98]"
              : "bg-white/[0.05] text-white/25 cursor-not-allowed"
          }`}
        >
          <Upload size={15} /> Upload
        </button>
      </div>

      {/* Client selector */}
      <GlassCard className="p-5" delay={0}>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Users size={14} className="text-indigo-400" /> Selecione um cliente
        </h3>
        <select
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className="w-full sm:w-1/2 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
        >
          <option value="" className="bg-slate-900">— Escolha um cliente —</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id} className="bg-slate-900">{c.full_name}</option>
          ))}
        </select>
      </GlassCard>

      {!selectedClient ? (
        <GlassCard className="p-12 text-center" delay={0.05}>
          <FolderOpen size={28} className="mx-auto mb-3 text-white/15" />
          <p className="text-sm text-white/40">Selecione um cliente acima para ver e enviar documentos.</p>
        </GlassCard>
      ) : loadingDocs ? (
        <div className="py-10 flex justify-center"><Spinner /></div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Documentos" value={stats.total} icon={Files} delay={0.05} />
            <StatCard label="Espaço usado" value={formatBytes(stats.totalSize)} icon={HardDrive} delay={0.1} />
            <StatCard label="Com versões" value={stats.versionedCount} icon={History} delay={0.15} />
            <StatCard
              label="Último upload"
              value={stats.lastUpload ? stats.lastUpload.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "—"}
              icon={Clock}
              delay={0.2}
            />
          </div>

          {/* Filter chips + search */}
          <GlassCard className="p-4" delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="flex items-center gap-1.5 flex-wrap flex-1">
                {CATEGORIES.map((c) => (
                  <button
                    type="button"
                    key={c.key}
                    onClick={() => setActiveCategory(c.key)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium uppercase tracking-wider transition-all ${
                      activeCategory === c.key
                        ? c.pill
                        : "bg-white/[0.02] border-white/[0.06] text-white/35 hover:text-white/60"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="relative w-full sm:w-64">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder="Buscar nome ou observação..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                />
              </div>
            </div>
          </GlassCard>

          {/* List */}
          {filtered.length === 0 ? (
            <GlassCard className="p-12 text-center" delay={0.25}>
              <FolderOpen size={28} className="mx-auto mb-3 text-white/15" />
              <p className="text-sm text-white/40 mb-3">
                {docs.length === 0
                  ? "Nenhum documento ainda. Faça o primeiro upload."
                  : "Nenhum documento bate com o filtro atual."}
              </p>
              {docs.length === 0 && (
                <button
                  type="button"
                  onClick={openUpload}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Upload size={14} /> Enviar primeiro arquivo
                </button>
              )}
            </GlassCard>
          ) : (
            <GlassCard className="p-2" delay={0.25}>
              <div className="divide-y divide-white/[0.04]">
                {filtered.map((d) => {
                  const { Icon, color, bg } = getFileVisual(d.mime_type);
                  const versions = getVersions(d);
                  return (
                    <div
                      key={d.id}
                      className="group flex items-center gap-3 px-3 py-3 hover:bg-white/[0.03] rounded-lg transition-all"
                    >
                      <div className={`p-2.5 rounded-xl ${bg} flex-shrink-0`}>
                        <Icon size={18} className={color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-medium text-white/90 truncate">{d.name}</h4>
                          {d.version > 1 && (
                            <button
                              type="button"
                              onClick={() => setVersionsFor(d)}
                              className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/20 hover:bg-amber-500/25 transition-all"
                              title="Ver versões"
                            >
                              v{d.version}
                            </button>
                          )}
                          <span className={`px-1.5 py-0.5 rounded border text-[9px] uppercase tracking-wider ${CATEGORY_PILL[d.category] || CATEGORY_PILL.outros}`}>
                            {CATEGORY_LABEL[d.category] || d.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-white/35">
                          <span className="font-mono">{formatBytes(d.size_bytes)}</span>
                          <span>{new Date(d.uploaded_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })}</span>
                          {d.description && <span className="truncate">{d.description}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {versions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setVersionsFor(d)}
                            className="p-1.5 rounded-md text-white/30 hover:text-amber-300 hover:bg-amber-500/10 transition-all"
                            title={`${versions.length} versões`}
                          >
                            <History size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => downloadDoc(d)}
                          className="p-1.5 rounded-md text-white/30 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all"
                          title="Baixar"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteDocChain(d)}
                          className="p-1.5 rounded-md text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          )}
        </>
      )}

      {/* ─── Upload modal ─── */}
      {showUpload && (
        <Modal
          title="Enviar documento"
          icon={Upload}
          size="lg"
          onClose={() => setShowUpload(false)}
        >
          <div className="space-y-3">
            {/* Drop zone / file picker */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={`w-full flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed transition-all ${
                isDragging
                  ? "border-indigo-500/60 bg-indigo-500/10"
                  : uploadFile
                  ? "border-emerald-500/40 bg-emerald-500/[0.04]"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={ALLOWED_MIME_TYPES.join(",")}
                onChange={onFilePickerChange}
              />
              {uploadFile ? (
                <>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const { Icon, color, bg } = getFileVisual(uploadFile.type);
                      return (
                        <div className={`p-2 rounded-lg ${bg}`}>
                          <Icon size={18} className={color} />
                        </div>
                      );
                    })()}
                    <div className="text-left">
                      <p className="text-sm font-medium text-white/90 truncate max-w-[280px]">{uploadFile.name}</p>
                      <p className="text-[10px] text-white/40 font-mono">{formatBytes(uploadFile.size)}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-white/40">Clique pra trocar</span>
                </>
              ) : (
                <>
                  <Upload size={22} className="text-white/30" />
                  <p className="text-sm text-white/60">Clique ou arraste um arquivo</p>
                  <p className="text-[10px] text-white/30">{ALLOWED_EXT_HINT} — máx. 25 MB</p>
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="doc-category" className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">Categoria</label>
                <select
                  id="doc-category"
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                >
                  {CATEGORIES.filter((c) => c.key !== "all").map((c) => (
                    <option key={c.key} value={c.key} className="bg-slate-900">{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="doc-name" className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">Nome (lógico)</label>
                <input
                  id="doc-name"
                  type="text"
                  placeholder="Contrato 2026.pdf"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                />
              </div>
            </div>

            <div>
              <label htmlFor="doc-desc" className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">Observação (opcional)</label>
              <textarea
                id="doc-desc"
                rows={2}
                placeholder="Notas, contexto, vencimento..."
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40 resize-none"
              />
            </div>

            {/* Versioning hint */}
            {uploadFile && uploadName && (() => {
              const existing = docs.find(
                (d) => d.is_current && d.client_id === selectedClient && d.name === uploadName.trim(),
              );
              if (!existing) return null;
              return (
                <p className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 flex items-center gap-2">
                  <History size={12} /> Já existe um documento com este nome (v{existing.version}). Este upload criará a v{existing.version + 1}.
                </p>
              );
            })()}

            {uploadError && (
              <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 flex items-center gap-2">
                <AlertCircle size={12} /> {uploadError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUpload(false)}
                className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white/80 hover:bg-white/[0.05] transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={uploadDoc}
                disabled={uploading || !uploadFile}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? <Spinner size={14} /> : <><Upload size={14} /> Enviar</>}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Versions modal ─── */}
      {versionsFor && (() => {
        const versions = getVersions(versionsFor);
        return (
          <Modal
            title={`Versões — ${versionsFor.name}`}
            icon={History}
            size="lg"
            onClose={() => setVersionsFor(null)}
          >
            <div className="space-y-2">
              {versions.map((v) => {
                const { Icon, color, bg } = getFileVisual(v.mime_type);
                return (
                  <div
                    key={v.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      v.is_current
                        ? "bg-indigo-500/[0.06] border-indigo-500/20"
                        : "bg-white/[0.02] border-white/[0.05]"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${bg} flex-shrink-0`}>
                      <Icon size={16} className={color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-white/80">v{v.version}</span>
                        {v.is_current && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                            atual
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-[10px] text-white/40">
                        <span className="font-mono">{formatBytes(v.size_bytes)}</span>
                        <span>{new Date(v.uploaded_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => downloadDoc(v)}
                        className="p-1.5 rounded-md text-white/40 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all"
                        title="Baixar esta versão"
                      >
                        <Download size={13} />
                      </button>
                      {versions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => deleteOneVersion(v, versions)}
                          className="p-1.5 rounded-md text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Excluir esta versão"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-white/[0.06]">
                <p className="text-[10px] text-white/30">
                  {versions.length} {versions.length === 1 ? "versão" : "versões"} no total
                </p>
                <button
                  type="button"
                  onClick={() => setVersionsFor(null)}
                  className="px-4 py-1.5 rounded-xl text-xs text-white/60 hover:text-white/90 hover:bg-white/[0.05] transition-all"
                >
                  Fechar
                </button>
              </div>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}
