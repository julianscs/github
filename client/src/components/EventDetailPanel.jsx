import { useState } from 'react'
import {
  X, Edit3, Trash2, ExternalLink, Video, Users, BookOpen,
  FileText, Image, StickyNote, CheckSquare, Square, Plus,
  ChevronDown, ChevronUp, Euro, Link, Calendar,
} from 'lucide-react'
import { useStore } from '../store'
import {
  formatDateEs, formatTimeRange, formatDuration, totalFormationHours, completedSessions,
} from '../utils/dateUtils'

// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  programada:  { label: 'Programada',  cls: 'badge-programada',  icon: '🟡' },
  'en-curso':  { label: 'En curso',    cls: 'badge-en-curso',    icon: '🔵' },
  completada:  { label: 'Completada',  cls: 'badge-completada',  icon: '🟢' },
  facturada:   { label: 'Facturada',   cls: 'badge-facturada',   icon: '🟣' },
  cancelada:   { label: 'Cancelada',   cls: 'badge-cancelada',   icon: '🔴' },
}

function Section({ icon: Icon, title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Icon size={15} className="text-slate-400" />
          {title}
        </div>
        {open ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-4">{children}</div>}
    </div>
  )
}

// ── Attendance table ──────────────────────────────────────────────────────────
function AttendanceSection({ formation, onUpdate }) {
  const sessionDates = formation.sessions.map((s) => s.date)

  const toggleAttendance = (attendeeIdx, sessionIdx) => {
    const updated = formation.attendees.map((a, ai) => {
      if (ai !== attendeeIdx) return a
      const att = [...(a.attendance ?? [])]
      att[sessionIdx] = !att[sessionIdx]
      return { ...a, attendance: att }
    })
    onUpdate({ attendees: updated })
  }

  if (!formation.attendees.length) {
    return <p className="text-sm text-slate-400 italic">Sin asistentes registrados aún.</p>
  }

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left py-1 px-1 text-slate-500 font-medium">Asistente</th>
            {sessionDates.map((d, i) => (
              <th key={i} className="px-2 py-1 text-slate-500 font-medium text-center">
                {d.slice(8)} {/* DD */}
              </th>
            ))}
            <th className="px-1 py-1 text-slate-500 font-medium text-center">%</th>
          </tr>
        </thead>
        <tbody>
          {formation.attendees.map((a, ai) => {
            const total = sessionDates.length
            const present = (a.attendance ?? []).filter(Boolean).length
            const pct = total ? Math.round((present / total) * 100) : 0
            return (
              <tr key={ai} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="py-1 px-1">
                  <div className="font-medium text-slate-700 truncate max-w-[110px]">{a.name}</div>
                  <div className="text-slate-400 text-[10px] truncate">{a.email}</div>
                </td>
                {sessionDates.map((_, si) => {
                  const val = a.attendance?.[si]
                  return (
                    <td key={si} className="text-center px-2">
                      <button onClick={() => toggleAttendance(ai, si)}>
                        {val === true ? (
                          <CheckSquare size={14} className="text-emerald-500 mx-auto" />
                        ) : val === false ? (
                          <Square size={14} className="text-red-300 mx-auto" />
                        ) : (
                          <Square size={14} className="text-gray-200 mx-auto" />
                        )}
                      </button>
                    </td>
                  )
                })}
                <td className="text-center px-1">
                  <span className={`font-semibold ${pct >= 75 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                    {pct}%
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Syllabus ──────────────────────────────────────────────────────────────────
function SyllabusSection({ formation, onUpdate }) {
  const [newItem, setNewItem] = useState('')

  const toggleItem = (id) => {
    const updated = formation.syllabus.map((s) =>
      s.id === id ? { ...s, done: !s.done } : s
    )
    onUpdate({ syllabus: updated })
  }

  const addItem = () => {
    if (!newItem.trim()) return
    const updated = [
      ...formation.syllabus,
      { id: `sy-${Date.now()}`, item: newItem.trim(), done: false },
    ]
    onUpdate({ syllabus: updated })
    setNewItem('')
  }

  const done = formation.syllabus.filter((s) => s.done).length
  const total = formation.syllabus.length

  return (
    <div className="space-y-1.5">
      {total > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all"
              style={{ width: total ? `${(done / total) * 100}%` : '0%' }}
            />
          </div>
          <span className="text-xs text-slate-500">{done}/{total}</span>
        </div>
      )}
      {formation.syllabus.map((s) => (
        <button
          key={s.id}
          onClick={() => toggleItem(s.id)}
          className="w-full flex items-start gap-2 text-left hover:bg-gray-50 rounded-md p-1 -mx-1 transition-colors"
        >
          {s.done ? (
            <CheckSquare size={15} className="text-emerald-500 mt-0.5 shrink-0" />
          ) : (
            <Square size={15} className="text-gray-300 mt-0.5 shrink-0" />
          )}
          <span className={`text-sm ${s.done ? 'line-through text-gray-400' : 'text-slate-700'}`}>
            {s.item}
          </span>
        </button>
      ))}
      <div className="flex gap-2 mt-2">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          placeholder="Añadir tema…"
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={addItem}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}

// ── Links list (materials / evidences) ───────────────────────────────────────
function LinksSection({ items, onUpdate, placeholder, fieldName }) {
  const [newName, setNewName] = useState('')
  const [newUrl, setNewUrl] = useState('')

  const addItem = () => {
    if (!newName.trim() || !newUrl.trim()) return
    const updated = [
      ...items,
      { id: `lnk-${Date.now()}`, name: newName.trim(), url: newUrl.trim() },
    ]
    onUpdate({ [fieldName]: updated })
    setNewName('')
    setNewUrl('')
  }

  const removeItem = (id) =>
    onUpdate({ [fieldName]: items.filter((i) => i.id !== id) })

  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <p className="text-sm text-slate-400 italic">Sin {placeholder.toLowerCase()} aún.</p>
      )}
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2 group">
          <Link size={13} className="text-slate-400 shrink-0" />
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-sm text-blue-600 hover:underline truncate flex items-center gap-1"
          >
            {item.name}
            <ExternalLink size={11} className="shrink-0 opacity-60" />
          </a>
          <button
            onClick={() => removeItem(item.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600"
          >
            <X size={13} />
          </button>
        </div>
      ))}
      <div className="flex flex-col gap-1.5 mt-2 border-t border-gray-100 pt-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={`Nombre del ${placeholder.toLowerCase()}`}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="flex gap-2">
          <input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            placeholder="https://..."
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={addItem}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main Panel
// ─────────────────────────────────────────────────────────────────────────────

export default function EventDetailPanel({ formation, onClose }) {
  const { trainers, clients, categories, updateFormation, deleteFormation, openEditEventForm } = useStore()

  const trainer = trainers.find((t) => t.id === formation.trainerId)
  const client = clients.find((c) => c.id === formation.clientId)
  const category = categories.find((c) => c.id === formation.categoryId)
  const status = STATUS_CONFIG[formation.status] ?? STATUS_CONFIG.programada

  const totalH = totalFormationHours(formation.sessions)
  const doneSessions = completedSessions(formation.sessions)
  const totalSessions = formation.sessions.length

  const handleUpdate = (updates) => updateFormation(formation.id, updates)

  const handleDelete = () => {
    if (confirm(`¿Eliminar la formación "${formation.name}"? Esta acción no se puede deshacer.`)) {
      deleteFormation(formation.id)
      onClose()
    }
  }

  const handleStatusChange = (e) => handleUpdate({ status: e.target.value })

  const handleNotesChange = (e) => handleUpdate({ notes: e.target.value })

  return (
    <div className="animate-slide-in flex flex-col h-full bg-white shadow-2xl border-l border-gray-200 w-full max-w-md">
      {/* ── Header ─────────────────────────────────────────── */}
      <div
        className="px-5 py-4 border-b border-gray-100 shrink-0"
        style={{ borderTop: `4px solid ${category?.color ?? '#64748B'}` }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 min-w-0">
            <span className="text-2xl shrink-0">{category?.icon ?? '📋'}</span>
            <div className="min-w-0">
              <h2 className="font-bold text-slate-800 text-base leading-tight">{formation.name}</h2>
              {formation.group && (
                <p className="text-xs text-slate-400 mt-0.5">{formation.group}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => openEditEventForm(formation)}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Editar"
            >
              <Edit3 size={15} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar"
            >
              <Trash2 size={15} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-gray-100 rounded-lg transition-colors ml-1"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Quick info pills */}
        <div className="flex flex-wrap gap-2 mt-3">
          {/* Status selector */}
          <select
            value={formation.status}
            onChange={handleStatusChange}
            className={`${status.cls} border-0 text-xs font-medium rounded-full px-2 py-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400`}
          >
            {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
              <option key={val} value={val}>{cfg.icon} {cfg.label}</option>
            ))}
          </select>

          {/* Category */}
          {category && (
            <span
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: `${category.color}20`, color: category.color }}
            >
              {category.icon} {category.name}
            </span>
          )}

          {/* Total hours */}
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
            ⏱ {totalH}h totales
          </span>
        </div>
      </div>

      {/* ── Scrollable content ──────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* ── Summary ─────────────────────────────────────── */}
        <Section icon={Calendar} title="Resumen">
          <div className="space-y-2.5">
            {/* Trainer */}
            {trainer && (
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0"
                      style={{ backgroundColor: `${trainer.color}20` }}>
                  {trainer.icon}
                </span>
                <div>
                  <div className="text-xs text-slate-400">Formador</div>
                  <div className="text-sm font-semibold text-slate-700">{trainer.name}</div>
                </div>
                <span
                  className="ml-auto w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: trainer.color }}
                />
              </div>
            )}

            {/* Client */}
            {client && (
              <div className="flex items-center gap-2">
                <span className="text-xl">{client.icon}</span>
                <div>
                  <div className="text-xs text-slate-400">Cliente</div>
                  <div className="text-sm font-semibold text-slate-700">{client.name}</div>
                  <div className="text-xs text-slate-400">{client.contact} · {client.email}</div>
                </div>
              </div>
            )}

            {/* Sessions summary */}
            <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Sesiones completadas</span>
                <span className="font-semibold text-slate-700">{doneSessions} / {totalSessions}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all"
                  style={{ width: totalSessions ? `${(doneSessions / totalSessions) * 100}%` : '0%' }}
                />
              </div>
              <div className="space-y-1 mt-2">
                {formation.sessions.map((s, i) => {
                  const past = s.date < new Date().toISOString().split('T')[0]
                  return (
                    <div key={s.id} className="flex items-center gap-2 text-xs">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0
                        ${past ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {i + 1}
                      </span>
                      <span className={past ? 'text-emerald-700' : 'text-slate-600'}>
                        {formatDateEs(s.date)}
                      </span>
                      <span className="text-slate-400">
                        {formatTimeRange(s.startTime, s.endTime)}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-400">{formatDuration(s.startTime, s.endTime)}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Meeting link */}
            {formation.meetingLink && (
              <a
                href={formation.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                <Video size={14} className="shrink-0" />
                Unirse a la videoconferencia
                <ExternalLink size={12} />
              </a>
            )}

            {/* Price */}
            {formation.price > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Euro size={14} className="text-slate-400 shrink-0" />
                <span className="text-slate-500">Importe:</span>
                <span className="font-semibold text-slate-700">
                  {formation.price.toLocaleString('es-ES')} {formation.currency}
                </span>
                {formation.invoiced && (
                  <span className="badge-facturada ml-auto">✓ Facturada</span>
                )}
              </div>
            )}
          </div>
        </Section>

        {/* ── Temario ─────────────────────────────────────── */}
        <Section icon={BookOpen} title={`Temario (${formation.syllabus.filter(s=>s.done).length}/${formation.syllabus.length})`}>
          <SyllabusSection formation={formation} onUpdate={handleUpdate} />
        </Section>

        {/* ── Asistencia ──────────────────────────────────── */}
        <Section icon={Users} title={`Asistencia (${formation.attendees.length} personas)`} defaultOpen={false}>
          <AttendanceSection formation={formation} onUpdate={handleUpdate} />
        </Section>

        {/* ── Materiales ──────────────────────────────────── */}
        <Section icon={FileText} title="Material didáctico" defaultOpen={false}>
          <LinksSection
            items={formation.materials}
            onUpdate={handleUpdate}
            placeholder="Material"
            fieldName="materials"
          />
        </Section>

        {/* ── Evidencias ──────────────────────────────────── */}
        <Section icon={Image} title="Evidencias" defaultOpen={false}>
          <LinksSection
            items={formation.evidences}
            onUpdate={handleUpdate}
            placeholder="Evidencia"
            fieldName="evidences"
          />
        </Section>

        {/* ── Notas ───────────────────────────────────────── */}
        <Section icon={StickyNote} title="Notas internas" defaultOpen={false}>
          <textarea
            value={formation.notes ?? ''}
            onChange={handleNotesChange}
            placeholder="Notas para el equipo interno…"
            rows={4}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none text-slate-700 placeholder:text-slate-300"
          />
        </Section>
      </div>
    </div>
  )
}
