import { useState } from 'react'
import { Plus, Edit3, Trash2, Save } from 'lucide-react'
import { useStore } from '../store'

const COLORS = [
  '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#0EA5E9',
  '#8B5CF6', '#EC4899', '#F97316', '#84CC16', '#64748B',
]
const ICONS = ['🛡️', '☁️', '💻', '📊', '📧', '🤝', '🎯', '⚙️', '📱', '🔐', '🧪', '📈', '🌐', '🤖', '🎓']

const inputCls = 'w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400'

function CategoryForm({ category, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: category?.name ?? '',
    description: category?.description ?? '',
    color: category?.color ?? COLORS[0],
    icon: category?.icon ?? '📋',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="bg-white rounded-2xl border border-blue-200 shadow-lg p-5 space-y-4 animate-fade-in">
      <h3 className="font-bold text-slate-800">{category ? '✏️ Editar categoría' : '➕ Nueva categoría'}</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">Nombre *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} placeholder="Ciberseguridad" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">Descripción</label>
          <input value={form.description} onChange={e => set('description', e.target.value)} className={inputCls} placeholder="Cursos de seguridad informática, hacking ético…" />
        </div>
      </div>

      {/* Icon */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">Icono</label>
        <div className="flex flex-wrap gap-2">
          {ICONS.map(ic => (
            <button key={ic} type="button" onClick={() => set('icon', ic)}
              className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all
                ${form.icon === ic ? 'ring-2 ring-offset-1 scale-110' : 'bg-gray-100 hover:bg-gray-200'}`}
              style={form.icon === ic ? { backgroundColor: `${form.color}25`, ringColor: form.color } : {}}>
              {ic}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
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

      {/* Preview pill */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">Vista previa:</span>
        <span
          className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full font-medium"
          style={{ backgroundColor: `${form.color}18`, color: form.color }}
        >
          {form.icon} {form.name || 'Nombre categoría'}
        </span>
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={() => form.name.trim() && onSave(form)}
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

export default function CategoriasPage() {
  const { categories, formations, addCategory, updateCategory, deleteCategory } = useStore()
  const [editing, setEditing] = useState(null)

  const getCount = (catId) => formations.filter(f => f.categoryId === catId).length

  const handleSave = (data) => {
    if (editing === 'new') addCategory(data)
    else updateCategory(editing.id, data)
    setEditing(null)
  }

  const handleDelete = (cat) => {
    const count = getCount(cat.id)
    if (count > 0) {
      alert(`No se puede eliminar: la categoría "${cat.name}" tiene ${count} formación(es) asignada(s).`)
      return
    }
    if (confirm(`¿Eliminar la categoría "${cat.name}"?`)) deleteCategory(cat.id)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">🏷️ Categorías</h1>
          <p className="text-sm text-slate-400 mt-0.5">Tipos de formación con color e icono propios</p>
        </div>
        <button onClick={() => setEditing('new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow transition-colors">
          <Plus size={15} /> Nueva categoría
        </button>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {editing === 'new' && (
            <div className="sm:col-span-2 lg:col-span-3">
              <CategoryForm onSave={handleSave} onCancel={() => setEditing(null)} />
            </div>
          )}

          {categories.map(cat => (
            editing?.id === cat.id ? (
              <div key={cat.id} className="sm:col-span-2 lg:col-span-3">
                <CategoryForm category={cat} onSave={handleSave} onCancel={() => setEditing(null)} />
              </div>
            ) : (
              <div key={cat.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group cursor-default">
                {/* Top color bar */}
                <div className="h-1.5 w-full" style={{ backgroundColor: cat.color }} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${cat.color}18` }}
                      >
                        {cat.icon}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{cat.name}</div>
                        {cat.description && (
                          <div className="text-xs text-slate-400 mt-0.5 leading-tight">{cat.description}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditing(cat)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => handleDelete(cat)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{ backgroundColor: `${cat.color}18`, color: cat.color }}
                    >
                      {cat.icon} {cat.name}
                    </span>
                    <div className="text-right">
                      <div className="text-xl font-bold text-slate-700">{getCount(cat.id)}</div>
                      <div className="text-xs text-slate-400">formaciones</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          ))}

          {categories.length === 0 && editing !== 'new' && (
            <div className="col-span-3 text-center py-16 text-slate-400">
              <div className="text-4xl mb-3">🏷️</div>
              <p>No hay categorías. Añade la primera.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
