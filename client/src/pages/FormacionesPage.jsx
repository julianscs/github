import { useState } from 'react'
import { Plus, Search, Edit3, Trash2, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { useStore } from '../store'
import { formatDateEs, totalFormationHours } from '../utils/dateUtils'
import EventForm from '../components/EventForm'

const STATUS_CONFIG = {
  programada:  { label: 'Programada',  cls: 'badge-programada' },
  'en-curso':  { label: 'En curso',    cls: 'badge-en-curso' },
  completada:  { label: 'Completada',  cls: 'badge-completada' },
  facturada:   { label: 'Facturada',   cls: 'badge-facturada' },
  cancelada:   { label: 'Cancelada',   cls: 'badge-cancelada' },
}

export default function FormacionesPage() {
  const { formations, trainers, clients, categories, deleteFormation, showEventForm, editingFormation, openEditEventForm, openNewEventForm, closeEventForm } = useStore()
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('name')
  const [sortDir, setSortDir] = useState('asc')

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const filtered = formations
    .filter(f => {
      if (!search) return true
      const q = search.toLowerCase()
      const trainer = trainers.find(t => t.id === f.trainerId)
      const client = clients.find(c => c.id === f.clientId)
      return (
        f.name.toLowerCase().includes(q) ||
        trainer?.name.toLowerCase().includes(q) ||
        client?.name.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      let va = a[sortField] ?? '', vb = b[sortField] ?? ''
      if (typeof va === 'string') va = va.toLowerCase()
      if (typeof vb === 'string') vb = vb.toLowerCase()
      return sortDir === 'asc' ? (va < vb ? -1 : va > vb ? 1 : 0) : (va > vb ? -1 : va < vb ? 1 : 0)
    })

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronDown size={13} className="opacity-30" />
    return sortDir === 'asc' ? <ChevronUp size={13} className="text-blue-400" /> : <ChevronDown size={13} className="text-blue-400" />
  }

  const stats = {
    total: formations.length,
    active: formations.filter(f => f.status === 'en-curso').length,
    pending: formations.filter(f => f.status === 'programada').length,
    revenue: formations.filter(f => f.invoiced).reduce((s, f) => s + (f.price ?? 0), 0),
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">📚 Formaciones</h1>
            <p className="text-sm text-slate-400 mt-0.5">Gestión de todos los cursos y formaciones</p>
          </div>
          <button
            onClick={() => openNewEventForm()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow transition-colors"
          >
            <Plus size={15} /> Nueva formación
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          {[
            { label: 'Total', value: stats.total, color: 'bg-slate-50 text-slate-700' },
            { label: 'En curso', value: stats.active, color: 'bg-blue-50 text-blue-700' },
            { label: 'Programadas', value: stats.pending, color: 'bg-amber-50 text-amber-700' },
            { label: 'Facturado', value: `${stats.revenue.toLocaleString('es-ES')} €`, color: 'bg-emerald-50 text-emerald-700' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-xl px-4 py-3`}>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs font-medium opacity-70 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mt-3 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, formador o cliente…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {[
                  ['name', 'Formación'],
                  ['status', 'Estado'],
                  [null, 'Categoría'],
                  [null, 'Formador'],
                  [null, 'Cliente'],
                  [null, 'Sesiones'],
                  ['price', 'Importe'],
                  [null, 'Acciones'],
                ].map(([field, label]) => (
                  <th
                    key={label}
                    onClick={field ? () => handleSort(field) : undefined}
                    className={`text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider
                      ${field ? 'cursor-pointer hover:text-slate-700 select-none' : ''}`}
                  >
                    <div className="flex items-center gap-1">
                      {label}
                      {field && <SortIcon field={field} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    No se encontraron formaciones
                  </td>
                </tr>
              )}
              {filtered.map(f => {
                const trainer = trainers.find(t => t.id === f.trainerId)
                const client = clients.find(c => c.id === f.clientId)
                const category = categories.find(c => c.id === f.categoryId)
                const status = STATUS_CONFIG[f.status] ?? STATUS_CONFIG.programada
                const hours = totalFormationHours(f.sessions)

                return (
                  <tr key={f.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{f.name}</div>
                      {f.group && <div className="text-xs text-slate-400">{f.group}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={status.cls}>{status.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      {category ? (
                        <span
                          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: `${category.color}20`, color: category.color }}
                        >
                          {category.icon} {category.name}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {trainer ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: trainer.color }} />
                          <span className="text-slate-700">{trainer.icon} {trainer.name}</span>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {client ? (
                        <span className="flex items-center gap-1 text-slate-700">
                          {client.icon} {client.name}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {f.sessions.length} sesiones · {hours}h
                    </td>
                    <td className="px-4 py-3">
                      {f.price > 0 ? (
                        <div>
                          <div className="font-semibold text-slate-700">{f.price.toLocaleString('es-ES')} €</div>
                          {f.invoiced && <div className="text-xs text-purple-600">✓ Facturada</div>}
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditEventForm(f)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar "${f.name}"?`)) deleteFormation(f.id)
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modal */}
      {showEventForm && (
        <EventForm
          formation={editingFormation?.id ? editingFormation : null}
          prefill={editingFormation?.id ? null : editingFormation}
          onClose={closeEventForm}
        />
      )}
    </div>
  )
}
