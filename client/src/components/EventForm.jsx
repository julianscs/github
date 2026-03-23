import { useState } from 'react'
import { X, Plus, Trash2, Calendar } from 'lucide-react'
import { useStore } from '../store'

const STATUS_OPTIONS = [
  { value: 'programada', label: '🟡 Programada' },
  { value: 'en-curso',   label: '🔵 En curso' },
  { value: 'completada', label: '🟢 Completada' },
  { value: 'facturada',  label: '🟣 Facturada' },
  { value: 'cancelada',  label: '🔴 Cancelada' },
]

function emptySession() {
  const today = new Date().toISOString().split('T')[0]
  return { id: `s-${Date.now()}`, date: today, startTime: '09:00', endTime: '14:00' }
}

function FormField({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-slate-800'
const selectCls = `${inputCls} cursor-pointer`

export default function EventForm({ formation: editingFormation, prefill, onClose }) {
  const { trainers, clients, categories, addFormation, updateFormation } = useStore()

  const isEdit = !!editingFormation

  const [form, setForm] = useState({
    name: editingFormation?.name ?? '',
    trainerId: editingFormation?.trainerId ?? prefill?.trainerId ?? '',
    clientId: editingFormation?.clientId ?? '',
    categoryId: editingFormation?.categoryId ?? '',
    status: editingFormation?.status ?? 'programada',
    group: editingFormation?.group ?? '',
    meetingLink: editingFormation?.meetingLink ?? '',
    notes: editingFormation?.notes ?? '',
    price: editingFormation?.price ?? 0,
    currency: editingFormation?.currency ?? 'EUR',
    invoiced: editingFormation?.invoiced ?? false,
    sessions: editingFormation?.sessions ?? [
      {
        id: `s-${Date.now()}`,
        date: prefill?.date ?? new Date().toISOString().split('T')[0],
        startTime: prefill?.period === 'afternoon' ? '15:00' : '09:00',
        endTime: prefill?.period === 'afternoon' ? '20:00' : '14:00',
      },
    ],
    syllabus: editingFormation?.syllabus ?? [],
    attendees: editingFormation?.attendees ?? [],
    materials: editingFormation?.materials ?? [],
    evidences: editingFormation?.evidences ?? [],
  })

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  // Sessions
  const addSession = () => setForm((f) => ({ ...f, sessions: [...f.sessions, emptySession()] }))
  const removeSession = (id) => setForm((f) => ({ ...f, sessions: f.sessions.filter((s) => s.id !== id) }))
  const updateSession = (id, field, value) =>
    setForm((f) => ({
      ...f,
      sessions: f.sessions.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    }))

  // Syllabus
  const [newTema, setNewTema] = useState('')
  const addTema = () => {
    if (!newTema.trim()) return
    setForm((f) => ({
      ...f,
      syllabus: [...f.syllabus, { id: `sy-${Date.now()}`, item: newTema.trim(), done: false }],
    }))
    setNewTema('')
  }
  const removeTema = (id) =>
    setForm((f) => ({ ...f, syllabus: f.syllabus.filter((s) => s.id !== id) }))

  // Attendees
  const [newAtteeName, setNewAtteeName] = useState('')
  const [newAtteeEmail, setNewAtteeEmail] = useState('')
  const addAttendee = () => {
    if (!newAtteeName.trim()) return
    setForm((f) => ({
      ...f,
      attendees: [
        ...f.attendees,
        { name: newAtteeName.trim(), email: newAtteeEmail.trim(), attendance: [] },
      ],
    }))
    setNewAtteeName('')
    setNewAtteeEmail('')
  }
  const removeAttendee = (idx) =>
    setForm((f) => ({ ...f, attendees: f.attendees.filter((_, i) => i !== idx) }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.trainerId || !form.sessions.length) return

    if (isEdit) {
      updateFormation(editingFormation.id, form)
    } else {
      addFormation(form)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col mx-4">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-slate-800">
            {isEdit ? '✏️ Editar formación' : '➕ Nueva formación'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Name */}
          <FormField label="Nombre de la formación" required>
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Ej: Ciberseguridad Esencial – Nivel 1"
              className={inputCls}
              required
            />
          </FormField>

          {/* Trainer + Category row */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Formador" required>
              <select value={form.trainerId} onChange={(e) => set('trainerId', e.target.value)} className={selectCls} required>
                <option value="">Seleccionar…</option>
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Categoría" required>
              <select value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)} className={selectCls} required>
                <option value="">Seleccionar…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </FormField>
          </div>

          {/* Client + Status row */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Cliente">
              <select value={form.clientId} onChange={(e) => set('clientId', e.target.value)} className={selectCls}>
                <option value="">Sin cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Estado">
              <select value={form.status} onChange={(e) => set('status', e.target.value)} className={selectCls}>
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </FormField>
          </div>

          {/* Group + Meeting link */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Grupo / Etiqueta">
              <input
                value={form.group}
                onChange={(e) => set('group', e.target.value)}
                placeholder="Ej: Grupo A – Mañana"
                className={inputCls}
              />
            </FormField>
            <FormField label="Enlace videoconferencia">
              <input
                value={form.meetingLink}
                onChange={(e) => set('meetingLink', e.target.value)}
                placeholder="https://teams.microsoft.com/..."
                className={inputCls}
                type="url"
              />
            </FormField>
          </div>

          {/* Price */}
          <div className="grid grid-cols-3 gap-4 items-end">
            <div className="col-span-2">
              <FormField label="Importe (€)">
                <input
                  value={form.price}
                  onChange={(e) => set('price', Number(e.target.value))}
                  type="number"
                  min="0"
                  step="100"
                  className={inputCls}
                />
              </FormField>
            </div>
            <label className="flex items-center gap-2 pb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.invoiced}
                onChange={(e) => set('invoiced', e.target.checked)}
                className="w-4 h-4 rounded text-blue-600"
              />
              <span className="text-sm text-slate-700">Facturada</span>
            </label>
          </div>

          {/* ── Sessions ──────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">
                <Calendar size={14} className="inline mr-1.5" />
                Sesiones <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addSession}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
              >
                <Plus size={13} /> Añadir sesión
              </button>
            </div>
            <div className="space-y-2">
              {form.sessions.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                  <span className="text-xs font-semibold text-slate-400 w-5 shrink-0">{i + 1}</span>
                  <input
                    type="date"
                    value={s.date}
                    onChange={(e) => updateSession(s.id, 'date', e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  />
                  <input
                    type="time"
                    value={s.startTime}
                    onChange={(e) => updateSession(s.id, 'startTime', e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white w-24"
                  />
                  <span className="text-slate-400 text-xs">–</span>
                  <input
                    type="time"
                    value={s.endTime}
                    onChange={(e) => updateSession(s.id, 'endTime', e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white w-24"
                  />
                  <button
                    type="button"
                    onClick={() => removeSession(s.id)}
                    className="ml-auto text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── Temario ───────────────────────────────────── */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Temario</label>
            <div className="space-y-1 mb-2">
              {form.syllabus.map((s) => (
                <div key={s.id} className="flex items-center gap-2 text-sm">
                  <span className="flex-1 text-slate-700 truncate">{s.item}</span>
                  <button type="button" onClick={() => removeTema(s.id)} className="text-slate-300 hover:text-red-500">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newTema}
                onChange={(e) => setNewTema(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTema() } }}
                placeholder="Añadir tema al temario…"
                className={inputCls}
              />
              <button
                type="button"
                onClick={addTema}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* ── Asistentes ────────────────────────────────── */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Asistentes</label>
            <div className="space-y-1 mb-2">
              {form.attendees.map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-1.5">
                  <span className="flex-1 truncate text-slate-700">{a.name} {a.email && <span className="text-slate-400">({a.email})</span>}</span>
                  <button type="button" onClick={() => removeAttendee(i)} className="text-slate-300 hover:text-red-500">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newAtteeName}
                onChange={(e) => setNewAtteeName(e.target.value)}
                placeholder="Nombre"
                className={inputCls}
              />
              <input
                value={newAtteeEmail}
                onChange={(e) => setNewAtteeEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAttendee() } }}
                placeholder="email@empresa.es"
                className={inputCls}
              />
              <button
                type="button"
                onClick={addAttendee}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm transition-colors shrink-0"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Notes */}
          <FormField label="Notas internas">
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Notas internas del equipo…"
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </FormField>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-slate-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            form="event-form"
            onClick={handleSubmit}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow transition-colors"
          >
            {isEdit ? '💾 Guardar cambios' : '✅ Crear formación'}
          </button>
        </div>
      </div>
    </div>
  )
}
