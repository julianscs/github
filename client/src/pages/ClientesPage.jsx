import { useState } from 'react'
import { Plus, Edit3, Trash2, Save } from 'lucide-react'
import { useStore } from '../store'

const COLORS = [
  '#EC4899', '#0EA5E9', '#84CC16', '#6366F1', '#F97316',
  '#EF4444', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6',
]
const ICONS = ['🏭', '🏦', '🚀', '🏛️', '🛒', '🏥', '🏗️', '🏬', '🎓', '💼', '🏪', '🌍']
const SECTORS = ['Industria', 'Banca', 'Tecnología', 'Administración Pública', 'Retail', 'Sanidad', 'Construcción', 'Educación', 'Consultoría', 'Otros']

const inputCls = 'w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400'

function ClientForm({ client, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: client?.name ?? '',
    contact: client?.contact ?? '',
    email: client?.email ?? '',
    phone: client?.phone ?? '',
    sector: client?.sector ?? '',
    color: client?.color ?? COLORS[0],
    icon: client?.icon ?? '🏢',
    active: client?.active ?? true,
    notes: client?.notes ?? '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="bg-white rounded-2xl border border-blue-200 shadow-lg p-5 space-y-4 animate-fade-in">
      <h3 className="font-bold text-slate-800">{client ? '✏️ Editar cliente' : '➕ Nuevo cliente'}</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">Empresa / Organización *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} placeholder="ACME S.L." />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Persona de contacto</label>
          <input value={form.contact} onChange={e => set('contact', e.target.value)} className={inputCls} placeholder="María García" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Sector</label>
          <select value={form.sector} onChange={e => set('sector', e.target.value)} className={inputCls}>
            <option value="">Seleccionar…</option>
            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
          <input value={form.email} onChange={e => set('email', e.target.value)} className={inputCls} type="email" placeholder="contacto@empresa.es" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Teléfono</label>
          <input value={form.phone} onChange={e => set('phone', e.target.value)} className={inputCls} placeholder="+34 91 000 0000" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">Notas</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} className={`${inputCls} resize-none`} rows={2} placeholder="Notas internas…" />
        </div>
      </div>

      {/* Icon picker */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">Icono</label>
        <div className="flex flex-wrap gap-2">
          {ICONS.map(ic => (
            <button key={ic} type="button" onClick={() => set('icon', ic)}
              className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all
                ${form.icon === ic ? 'bg-pink-100 ring-2 ring-pink-400' : 'bg-gray-100 hover:bg-gray-200'}`}>
              {ic}
            </button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">Color</label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(c => (
            <button key={c} type="button" onClick={() => set('color', c)}
              className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ backgroundColor: `${form.color}12` }}>
        <span className="text-2xl">{form.icon}</span>
        <div>
          <div className="font-semibold text-slate-800 text-sm">{form.name || 'Nombre empresa'}</div>
          <div className="text-xs text-slate-500">{form.contact || 'Persona de contacto'}</div>
        </div>
        <span className="w-3 h-3 rounded-full ml-auto" style={{ backgroundColor: form.color }} />
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={() => onSave(form)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
          <Save size={14} /> Guardar
        </button>
        <button onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default function ClientesPage() {
  const { clients, formations, addClient, updateClient, deleteClient } = useStore()
  const [editing, setEditing] = useState(null)

  const getFormationCount = (clientId) =>
    formations.filter(f => f.clientId === clientId).length

  const handleSave = (data) => {
    if (editing === 'new') addClient(data)
    else updateClient(editing.id, data)
    setEditing(null)
  }

  const handleDelete = (client) => {
    const count = getFormationCount(client.id)
    if (count > 0) {
      alert(`No se puede eliminar: "${client.name}" tiene ${count} formación(es) asociada(s).`)
      return
    }
    if (confirm(`¿Eliminar el cliente "${client.name}"?`)) deleteClient(client.id)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">🏢 Clientes</h1>
          <p className="text-sm text-slate-400 mt-0.5">{clients.length} cliente{clients.length !== 1 ? 's' : ''} registrado{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setEditing('new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow transition-colors">
          <Plus size={15} /> Añadir cliente
        </button>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {editing === 'new' && (
            <div className="sm:col-span-2 lg:col-span-3">
              <ClientForm onSave={handleSave} onCancel={() => setEditing(null)} />
            </div>
          )}

          {clients.map(client => (
            editing?.id === client.id ? (
              <div key={client.id} className="sm:col-span-2 lg:col-span-3">
                <ClientForm client={client} onSave={handleSave} onCancel={() => setEditing(null)} />
              </div>
            ) : (
              <div
                key={client.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Color header */}
                <div className="h-2" style={{ backgroundColor: client.color }} />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${client.color}18` }}
                      >
                        {client.icon}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 leading-tight">{client.name}</div>
                        {client.sector && (
                          <div className="text-xs text-slate-400 mt-0.5">{client.sector}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditing(client)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => handleDelete(client)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-slate-500">
                    {client.contact && <div>👤 {client.contact}</div>}
                    {client.email && <div>✉️ {client.email}</div>}
                    {client.phone && <div>📞 {client.phone}</div>}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700">
                      {getFormationCount(client.id)}
                    </span>
                    <span className="text-xs text-slate-400">formaciones</span>
                  </div>
                </div>
              </div>
            )
          ))}

          {clients.length === 0 && editing !== 'new' && (
            <div className="col-span-3 text-center py-16 text-slate-400">
              <div className="text-4xl mb-3">🏢</div>
              <p>No hay clientes aún. Añade el primero.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
