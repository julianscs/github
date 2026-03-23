import { useState } from 'react'
import { Plus, Edit3, Trash2, X, Save } from 'lucide-react'
import { useStore } from '../store'

const COLORS = [
  '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444',
  '#EC4899', '#0EA5E9', '#84CC16', '#64748B', '#F97316',
  '#06B6D4', '#6366F1',
]
const ICONS = ['👨‍🏫', '👩‍🏫', '👨‍💻', '👩‍💻', '🔧', '🏢', '🎓', '🧑‍🔬', '👔', '🧑‍🏫']
const TYPES = [
  { value: 'internal', label: 'Interno' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'company', label: 'Empresa' },
]

function TrainerForm({ trainer, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: trainer?.name ?? '',
    email: trainer?.email ?? '',
    phone: trainer?.phone ?? '',
    color: trainer?.color ?? COLORS[0],
    icon: trainer?.icon ?? '👨‍🏫',
    type: trainer?.type ?? 'internal',
    specialties: trainer?.specialties?.join(', ') ?? '',
    active: trainer?.active ?? true,
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.name.trim()) return
    onSave({
      ...form,
      specialties: form.specialties.split(',').map(s => s.trim()).filter(Boolean),
    })
  }

  const inputCls = 'w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400'

  return (
    <div className="bg-white rounded-2xl border border-blue-200 shadow-lg p-5 space-y-4 animate-fade-in">
      <h3 className="font-bold text-slate-800">{trainer ? '✏️ Editar formador' : '➕ Nuevo formador'}</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Nombre *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} placeholder="Nombre completo" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
          <input value={form.email} onChange={e => set('email', e.target.value)} className={inputCls} placeholder="email@empresa.es" type="email" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Teléfono</label>
          <input value={form.phone} onChange={e => set('phone', e.target.value)} className={inputCls} placeholder="+34 600 000 000" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Tipo</label>
          <select value={form.type} onChange={e => set('type', e.target.value)} className={inputCls}>
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Especialidades (separadas por comas)</label>
        <input value={form.specialties} onChange={e => set('specialties', e.target.value)} className={inputCls} placeholder="Ciberseguridad, Cloud, Python…" />
      </div>

      {/* Icon picker */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">Icono</label>
        <div className="flex flex-wrap gap-2">
          {ICONS.map(ic => (
            <button
              key={ic}
              onClick={() => set('icon', ic)}
              className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all
                ${form.icon === ic ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {ic}
            </button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">Color identificador</label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => set('color', c)}
              className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
        <span className="text-2xl">{form.icon}</span>
        <div>
          <div className="font-semibold text-slate-800 text-sm">{form.name || 'Nombre formador'}</div>
          <div className="text-xs text-slate-400">{form.email || 'email@empresa.es'}</div>
        </div>
        <span className="w-4 h-4 rounded-full ml-auto" style={{ backgroundColor: form.color }} />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Save size={14} /> Guardar
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default function FormadoresPage() {
  const { trainers, formations, addTrainer, updateTrainer, deleteTrainer } = useStore()
  const [editing, setEditing] = useState(null) // null | 'new' | trainer object
  const [confirmDelete, setConfirmDelete] = useState(null)

  const getFormationCount = (trainerId) =>
    formations.filter(f => f.trainerId === trainerId).length

  const handleSave = (data) => {
    if (editing === 'new') {
      addTrainer(data)
    } else {
      updateTrainer(editing.id, data)
    }
    setEditing(null)
  }

  const handleDelete = (trainer) => {
    const count = getFormationCount(trainer.id)
    if (count > 0) {
      alert(`No se puede eliminar: "${trainer.name}" tiene ${count} formación(es) asignada(s).`)
      return
    }
    deleteTrainer(trainer.id)
    setConfirmDelete(null)
  }

  const typeBadge = (type) => {
    const map = {
      internal: 'bg-blue-100 text-blue-700',
      freelance: 'bg-amber-100 text-amber-700',
      company: 'bg-slate-100 text-slate-600',
    }
    const labels = { internal: 'Interno', freelance: 'Freelance', company: 'Empresa' }
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[type] ?? 'bg-gray-100 text-gray-600'}`}>{labels[type] ?? type}</span>
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">👥 Formadores</h1>
          <p className="text-sm text-slate-400 mt-0.5">{trainers.length} formador{trainers.length !== 1 ? 'es' : ''} registrado{trainers.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setEditing('new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow transition-colors"
        >
          <Plus size={15} /> Añadir formador
        </button>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="space-y-3 max-w-3xl mx-auto">
          {/* New form */}
          {editing === 'new' && (
            <TrainerForm onSave={handleSave} onCancel={() => setEditing(null)} />
          )}

          {trainers.map(trainer => (
            <div key={trainer.id}>
              {editing?.id === trainer.id ? (
                <TrainerForm trainer={trainer} onSave={handleSave} onCancel={() => setEditing(null)} />
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow group">
                  {/* Color bar */}
                  <div className="w-1 self-stretch rounded-full" style={{ backgroundColor: trainer.color }} />

                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                    style={{ backgroundColor: `${trainer.color}18` }}
                  >
                    {trainer.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800">{trainer.name}</span>
                      {typeBadge(trainer.type)}
                      {!trainer.active && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">Inactivo</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-400 mt-0.5">{trainer.email} {trainer.phone && `· ${trainer.phone}`}</div>
                    {trainer.specialties?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {trainer.specialties.map(s => (
                          <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-slate-600">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Formation count */}
                  <div className="text-center shrink-0 hidden sm:block">
                    <div className="text-2xl font-bold text-slate-700">{getFormationCount(trainer.id)}</div>
                    <div className="text-xs text-slate-400">formaciones</div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditing(trainer)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(trainer)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {trainers.length === 0 && editing !== 'new' && (
            <div className="text-center py-16 text-slate-400">
              <div className="text-4xl mb-3">👥</div>
              <p>No hay formadores aún. Añade el primero.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
