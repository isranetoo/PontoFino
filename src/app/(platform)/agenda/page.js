"use client";

import { useState, useEffect, useMemo } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { GlassCard, GlassInput, Modal, Spinner, StatCard } from "@/components/ui";
import {
  Calendar, Plus, ChevronLeft, ChevronRight, Clock, Users, MapPin,
  Edit3, Trash2, Check, X, AlertCircle, CheckCircle2, RotateCcw,
  CalendarDays, CalendarCheck,
} from "lucide-react";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const TYPE_CONFIG = {
  reuniao:          { label: "Reunião",  dot: "bg-indigo-400",  pill: "bg-indigo-500/15 text-indigo-300 border-indigo-500/20" },
  follow_up:        { label: "Follow-up", dot: "bg-amber-400",   pill: "bg-amber-500/15 text-amber-300 border-amber-500/20" },
  revisao_carteira: { label: "Revisão",   dot: "bg-emerald-400", pill: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20" },
  outro:            { label: "Outro",     dot: "bg-slate-400",   pill: "bg-slate-500/15 text-slate-300 border-slate-500/20" },
};

const STATUS_CONFIG = {
  agendado:  { label: "Agendado",  pill: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20" },
  concluido: { label: "Concluído", pill: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
  cancelado: { label: "Cancelado", pill: "bg-red-500/10 text-red-300 border-red-500/20 line-through" },
};

const EMPTY_FORM = {
  title: "",
  type: "reuniao",
  client_id: "",
  scheduled_date: "",
  scheduled_time: "",
  duration_minutes: 60,
  location: "",
  description: "",
};

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildMonthGrid(month) {
  const year = month.getFullYear();
  const m = month.getMonth();
  const firstDay = new Date(year, m, 1);
  const lastDay = new Date(year, m + 1, 0);
  const startWeekday = firstDay.getDay();

  const days = [];
  for (let i = startWeekday - 1; i >= 0; i--) days.push(new Date(year, m, -i));
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, m, d));
  while (days.length < 42) {
    const last = days[days.length - 1];
    days.push(new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1));
  }
  return days;
}

function toDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toTimeStr(d) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function AgendaPage() {
  const supabase = getSupabaseBrowserClient();

  const [events, setEvents] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    async function init() {
      const [{ data: evs }, { data: cls }] = await Promise.all([
        supabase.from("events").select("*, clients(id, full_name)").order("scheduled_at", { ascending: true }),
        supabase.from("clients").select("id, full_name").eq("is_active", true).order("full_name"),
      ]);
      setEvents(evs || []);
      setClients(cls || []);
      setLoading(false);
    }
    init();
  }, [supabase]);

  async function reload() {
    const { data } = await supabase
      .from("events")
      .select("*, clients(id, full_name)")
      .order("scheduled_at", { ascending: true });
    setEvents(data || []);
  }

  // ─── Calendar grid ───
  const monthDays = useMemo(() => buildMonthGrid(currentMonth), [currentMonth]);

  const eventsByDay = useMemo(() => {
    const map = {};
    for (const e of events) {
      const key = toDateKey(new Date(e.scheduled_at));
      if (!map[key]) map[key] = [];
      map[key].push(e);
    }
    return map;
  }, [events]);

  const selectedKey = toDateKey(selectedDate);
  const dayEvents = (eventsByDay[selectedKey] || []).slice().sort((a, b) =>
    new Date(a.scheduled_at) - new Date(b.scheduled_at)
  );

  // ─── Stats ───
  const stats = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59, 999);
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    let hoje = 0, semana = 0, pendentes = 0, atrasados = 0;
    for (const e of events) {
      const sched = new Date(e.scheduled_at);
      if (e.status === "agendado") {
        pendentes++;
        if (sched < now) atrasados++;
      }
      if (sched >= startOfDay && sched <= endOfDay) hoje++;
      if (sched >= startOfWeek && sched <= endOfWeek) semana++;
    }
    return { hoje, semana, pendentes, atrasados };
  }, [events]);

  // ─── Form handlers ───
  function openNew(date) {
    const d = date || selectedDate || new Date();
    setEditing(null);
    setForm({
      ...EMPTY_FORM,
      scheduled_date: toDateKey(d),
      scheduled_time: "09:00",
    });
    setFormError("");
    setShowForm(true);
  }

  function openEdit(ev) {
    const sched = new Date(ev.scheduled_at);
    setEditing(ev);
    setForm({
      title: ev.title,
      type: ev.type,
      client_id: ev.client_id || "",
      scheduled_date: toDateKey(sched),
      scheduled_time: toTimeStr(sched),
      duration_minutes: ev.duration_minutes,
      location: ev.location || "",
      description: ev.description || "",
    });
    setFormError("");
    setShowForm(true);
  }

  async function saveEvent() {
    setFormError("");

    if (!form.title.trim()) { setFormError("Dê um título ao compromisso."); return; }
    if (!form.scheduled_date || !form.scheduled_time) { setFormError("Defina data e hora."); return; }

    const iso = new Date(`${form.scheduled_date}T${form.scheduled_time}:00`).toISOString();

    setSaving(true);
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      console.error("[agenda] auth.getUser failed:", userErr);
      setFormError("Sessão expirada. Faça login novamente.");
      setSaving(false);
      return;
    }

    const payload = {
      title: form.title.trim(),
      type: form.type,
      client_id: form.client_id || null,
      scheduled_at: iso,
      duration_minutes: Number(form.duration_minutes) || 60,
      location: form.location.trim(),
      description: form.description.trim(),
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from("events").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("events").insert({
        ...payload,
        consultant_id: userData.user.id,
        status: "agendado",
      }));
    }

    setSaving(false);
    if (error) {
      console.error("[agenda] save failed:", error);
      setFormError(error.message || "Erro ao salvar.");
      return;
    }

    await reload();
    setShowForm(false);
    setEditing(null);
    setSelectedDate(new Date(iso));
  }

  async function setStatus(ev, status) {
    const patch = { status };
    if (status === "concluido") patch.completed_at = new Date().toISOString();
    if (status === "agendado") patch.completed_at = null;
    const { error } = await supabase.from("events").update(patch).eq("id", ev.id);
    if (!error) await reload();
    else console.error("[agenda] status update failed:", error);
  }

  async function deleteEvent(id) {
    if (!confirm("Excluir este compromisso?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (!error) await reload();
    else console.error("[agenda] delete failed:", error);
  }

  // ─── Render ───
  if (loading) {
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
          <h2 className="text-xl font-bold tracking-tight">Agenda</h2>
          <p className="text-xs text-white/40 mt-0.5">Reuniões, follow-ups e revisões de carteira</p>
        </div>
        <button
          type="button"
          onClick={() => openNew()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus size={15} /> Novo compromisso
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Hoje" value={stats.hoje} icon={CalendarDays} delay={0} />
        <StatCard label="Esta semana" value={stats.semana} icon={Calendar} delay={0.05} />
        <StatCard label="Pendentes" value={stats.pendentes} icon={Clock} delay={0.1} />
        <StatCard label="Atrasados" value={stats.atrasados} icon={AlertCircle} delay={0.15} />
      </div>

      {/* Calendar + Day list */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Calendar */}
        <GlassCard className="p-5 lg:col-span-3" delay={0.2}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Calendar size={14} className="text-indigo-400" />
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.05] transition-all"
                title="Mês anterior"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                  setSelectedDate(now);
                }}
                className="px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider text-white/40 hover:text-white/80 hover:bg-white/[0.05] transition-all"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.05] transition-all"
                title="Próximo mês"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Weekday header */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((w) => (
              <div key={w} className="text-[9px] uppercase tracking-wider text-white/30 text-center py-1">
                {w}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((d, i) => {
              const isCurrentMonth = d.getMonth() === currentMonth.getMonth();
              const isToday = sameDay(d, today);
              const isSelected = sameDay(d, selectedDate);
              const dayEvs = eventsByDay[toDateKey(d)] || [];
              const visible = dayEvs.filter((e) => e.status !== "cancelado");

              return (
                <button
                  type="button"
                  key={i}
                  onClick={() => setSelectedDate(d)}
                  className={`aspect-square flex flex-col items-center justify-start p-1.5 rounded-lg border text-xs transition-all ${
                    isSelected
                      ? "bg-indigo-500/15 border-indigo-500/30 text-white"
                      : isToday
                      ? "bg-white/[0.04] border-indigo-500/20 text-white/80 hover:bg-white/[0.08]"
                      : isCurrentMonth
                      ? "bg-white/[0.02] border-white/[0.05] text-white/70 hover:bg-white/[0.06]"
                      : "border-transparent text-white/15 hover:bg-white/[0.03]"
                  }`}
                >
                  <span className={`text-[11px] font-medium ${isToday ? "text-indigo-400" : ""}`}>
                    {d.getDate()}
                  </span>
                  {visible.length > 0 && (
                    <div className="flex gap-0.5 mt-auto">
                      {visible.slice(0, 3).map((ev) => (
                        <span
                          key={ev.id}
                          className={`w-1.5 h-1.5 rounded-full ${TYPE_CONFIG[ev.type]?.dot || "bg-slate-400"}`}
                        />
                      ))}
                      {visible.length > 3 && (
                        <span className="text-[8px] text-white/40 leading-none">+{visible.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex flex-wrap gap-3">
            {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-1.5 text-[10px] text-white/40">
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Day list */}
        <GlassCard className="p-5 lg:col-span-2" delay={0.25}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">
              {selectedDate.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
            </h3>
            <button
              type="button"
              onClick={() => openNew(selectedDate)}
              className="p-1.5 rounded-lg text-white/40 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
              title="Novo neste dia"
            >
              <Plus size={14} />
            </button>
          </div>

          {dayEvents.length === 0 ? (
            <div className="py-10 text-center text-xs text-white/25">
              <CalendarCheck size={28} className="mx-auto mb-2 text-white/15" />
              Nenhum compromisso neste dia.
            </div>
          ) : (
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {dayEvents.map((ev) => {
                const sched = new Date(ev.scheduled_at);
                const tCfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG.outro;
                const sCfg = STATUS_CONFIG[ev.status] || STATUS_CONFIG.agendado;
                return (
                  <div
                    key={ev.id}
                    className={`group bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 transition-all hover:bg-white/[0.05] ${
                      ev.status === "cancelado" ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xs font-mono text-white/60 flex-shrink-0">{toTimeStr(sched)}</span>
                        <h4 className="text-sm font-medium text-white/90 truncate">{ev.title}</h4>
                      </div>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {ev.status === "agendado" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setStatus(ev, "concluido")}
                              className="p-1 rounded-md text-white/30 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                              title="Concluir"
                            >
                              <CheckCircle2 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setStatus(ev, "cancelado")}
                              className="p-1 rounded-md text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                              title="Cancelar"
                            >
                              <X size={13} />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setStatus(ev, "agendado")}
                            className="p-1 rounded-md text-white/30 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                            title="Reabrir"
                          >
                            <RotateCcw size={13} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEdit(ev)}
                          className="p-1 rounded-md text-white/30 hover:text-white/80 hover:bg-white/[0.05] transition-all"
                          title="Editar"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteEvent(ev.id)}
                          className="p-1 rounded-md text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                      <span className={`px-1.5 py-0.5 rounded border ${tCfg.pill}`}>{tCfg.label}</span>
                      <span className={`px-1.5 py-0.5 rounded border ${sCfg.pill}`}>{sCfg.label}</span>
                      {ev.clients?.full_name && (
                        <span className="flex items-center gap-1 text-white/40">
                          <Users size={9} /> {ev.clients.full_name}
                        </span>
                      )}
                      {ev.duration_minutes ? (
                        <span className="flex items-center gap-1 text-white/40">
                          <Clock size={9} /> {ev.duration_minutes}min
                        </span>
                      ) : null}
                    </div>

                    {ev.location && (
                      <p className="text-[10px] text-white/35 mt-1.5 flex items-center gap-1">
                        <MapPin size={9} /> {ev.location}
                      </p>
                    )}
                    {ev.description && (
                      <p className="text-[11px] text-white/45 mt-1.5 line-clamp-2">{ev.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>

      {/* ─── Form modal ─── */}
      {showForm && (
        <Modal
          title={editing ? "Editar compromisso" : "Novo compromisso"}
          icon={editing ? Edit3 : Plus}
          size="lg"
          onClose={() => { setShowForm(false); setEditing(null); }}
        >
          <div className="space-y-3">
            <GlassInput
              label="Título"
              placeholder="Reunião com cliente, follow-up trimestral..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="event-type" className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">Tipo</label>
                <select
                  id="event-type"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                >
                  {Object.entries(TYPE_CONFIG).map(([k, c]) => (
                    <option key={k} value={k} className="bg-slate-900">{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="event-client" className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">Cliente (opcional)</label>
                <select
                  id="event-client"
                  value={form.client_id}
                  onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                >
                  <option value="" className="bg-slate-900">— Sem cliente —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900">{c.full_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="event-date" className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">Data</label>
                <input
                  id="event-date"
                  type="date"
                  value={form.scheduled_date}
                  onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                />
              </div>
              <div>
                <label htmlFor="event-time" className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">Hora</label>
                <input
                  id="event-time"
                  type="time"
                  value={form.scheduled_time}
                  onChange={(e) => setForm({ ...form, scheduled_time: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                />
              </div>
              <div>
                <label htmlFor="event-duration" className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">Duração (min)</label>
                <input
                  id="event-duration"
                  type="number"
                  min={5}
                  step={5}
                  value={form.duration_minutes}
                  onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                />
              </div>
            </div>

            <GlassInput
              label="Local / link"
              icon={MapPin}
              placeholder="Endereço, Google Meet, Zoom..."
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />

            <div>
              <label htmlFor="event-desc" className="text-[10px] uppercase tracking-wider text-white/35 mb-1 block">Observações</label>
              <textarea
                id="event-desc"
                rows={3}
                placeholder="Pauta, contexto, links de referência..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40 resize-none"
              />
            </div>

            {formError && (
              <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                {formError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditing(null); }}
                className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white/80 hover:bg-white/[0.05] transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveEvent}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Spinner size={14} /> : <><Check size={14} /> {editing ? "Salvar" : "Criar"}</>}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
