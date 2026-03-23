import { useState } from 'react'
import {
  ChevronLeft, ChevronRight, CalendarDays, Plus, Filter, X,
  LayoutGrid, Eye,
} from 'lucide-react'
import { useStore } from '../store'
import { formatWeekRange } from '../utils/dateUtils'
import WeekTimeline from '../components/WeekTimeline'
import EventDetailPanel from '../components/EventDetailPanel'
import EventForm from '../components/EventForm'

// ── Legend ────────────────────────────────────────────────────────────────────
function Legend({ trainers, categories }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 bg-white border-b border-gray-100">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
        Formadores:
      </span>
      {trainers.filter((t) => t.active !== false).map((t) => (
        <div key={t.id} className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: t.color }}
          />
          <span className="text-xs text-slate-600">{t.icon} {t.name.split(' ')[0]}</span>
        </div>
      ))}
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-2 mr-1">
        Períodos:
      </span>
      <div className="flex items-center gap-1">
        <span className="w-10 h-3 rounded bg-sky-100 border border-sky-200 inline-block" />
        <span className="text-xs text-slate-500">🌅 Mañana</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="w-10 h-3 rounded bg-amber-100 border border-amber-200 inline-block" />
        <span className="text-xs text-slate-500">🌆 Tarde</span>
      </div>
    </div>
  )
}

// ── Filter Panel ──────────────────────────────────────────────────────────────
function FilterPanel({ trainers, clients, categories, filters, onChange, onClose }) {
  const toggle = (group, id) => {
    const current = filters[group]
    const updated = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id]
    onChange({ ...filters, [group]: updated })
  }

  const totalActive =
    filters.trainers.length +
    filters.clients.length +
    filters.categories.length +
    filters.statuses.length

  return (
    <div className="absolute top-full right-0 mt-1 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-40 animate-fade-in p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-700 text-sm">Filtros</h3>
        <div className="flex items-center gap-2">
          {totalActive > 0 && (
            <button
              onClick={() => onChange({ trainers: [], clients: [], categories: [], statuses: [] })}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Limpiar todo
            </button>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Trainers */}
      <FilterGroup
        title="Formadores"
        items={trainers.map((t) => ({ id: t.id, label: `${t.icon} ${t.name}`, color: t.color }))}
        selected={filters.trainers}
        onToggle={(id) => toggle('trainers', id)}
      />

      {/* Categories */}
      <FilterGroup
        title="Categorías"
        items={categories.map((c) => ({ id: c.id, label: `${c.icon} ${c.name}`, color: c.color }))}
        selected={filters.categories}
        onToggle={(id) => toggle('categories', id)}
      />

      {/* Clients */}
      <FilterGroup
        title="Clientes"
        items={clients.map((c) => ({ id: c.id, label: `${c.icon} ${c.name}`, color: c.color }))}
        selected={filters.clients}
        onToggle={(id) => toggle('clients', id)}
      />

      {/* Status */}
      <FilterGroup
        title="Estado"
        items={[
          { id: 'programada', label: '🟡 Programada', color: '#F59E0B' },
          { id: 'en-curso',   label: '🔵 En curso',   color: '#3B82F6' },
          { id: 'completada', label: '🟢 Completada', color: '#10B981' },
          { id: 'facturada',  label: '🟣 Facturada',  color: '#8B5CF6' },
          { id: 'cancelada',  label: '🔴 Cancelada',  color: '#EF4444' },
        ]}
        selected={filters.statuses}
        onToggle={(id) => toggle('statuses', id)}
      />
    </div>
  )
}

function FilterGroup({ title, items, selected, onToggle }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
        {title}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => {
          const active = selected.includes(item.id)
          return (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all font-medium
                ${active ? 'text-white border-transparent shadow-sm' : 'bg-white border-gray-200 text-slate-600 hover:border-gray-300'}`}
              style={active ? { backgroundColor: item.color, borderColor: item.color } : {}}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  CalendarPage
// ─────────────────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const {
    trainers, clients, categories, formations,
    currentWeekStart,
    goToPrevWeek, goToNextWeek, goToToday,
    selectedFormation, showEventPanel, closeEventPanel, selectFormation,
    showEventForm, editingFormation, openNewEventForm, closeEventForm,
    activeFilters, setActiveFilters,
    showWeekends, toggleShowWeekends,
  } = useStore()

  const [showFilters, setShowFilters] = useState(false)

  const totalFilters =
    activeFilters.trainers.length +
    activeFilters.clients.length +
    activeFilters.categories.length +
    activeFilters.statuses.length

  const handleAddClick = (prefill) => {
    openNewEventForm(prefill)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Top bar ──────────────────────────────────────────── */}
      <div className="shrink-0 px-4 py-3 bg-white border-b border-gray-100 flex items-center gap-3 flex-wrap">
        {/* Week navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={goToPrevWeek}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={goToNextWeek}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Week label */}
        <h1 className="text-base font-bold text-slate-800 capitalize">
          <CalendarDays size={16} className="inline mr-2 text-blue-500" />
          {formatWeekRange(currentWeekStart)}
        </h1>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Weekends toggle */}
          <button
            onClick={toggleShowWeekends}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all
              ${showWeekends ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-gray-200 hover:border-gray-300'}`}
            title="Mostrar/ocultar fin de semana"
          >
            <Eye size={13} />
            {showWeekends ? '7 días' : 'L–V'}
          </button>

          {/* Filters */}
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all
                ${totalFilters > 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-gray-200 hover:border-gray-300'}`}
            >
              <Filter size={13} />
              Filtros
              {totalFilters > 0 && (
                <span className="bg-white text-blue-600 rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-bold">
                  {totalFilters}
                </span>
              )}
            </button>
            {showFilters && (
              <FilterPanel
                trainers={trainers}
                clients={clients}
                categories={categories}
                filters={activeFilters}
                onChange={setActiveFilters}
                onClose={() => setShowFilters(false)}
              />
            )}
          </div>

          {/* New formation */}
          <button
            onClick={() => openNewEventForm()}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow transition-colors"
          >
            <Plus size={14} />
            Nueva formación
          </button>
        </div>
      </div>

      {/* ── Legend ───────────────────────────────────────────── */}
      <Legend trainers={trainers} categories={categories} />

      {/* ── Main area ────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden gap-0">
        {/* Timeline */}
        <div className={`flex-1 overflow-hidden flex flex-col p-4 transition-all ${showEventPanel ? 'min-w-0' : ''}`}>
          <WeekTimeline
            weekStart={currentWeekStart}
            trainers={trainers}
            formations={formations}
            categories={categories}
            clients={clients}
            activeFilters={activeFilters}
            showWeekends={showWeekends}
            onSessionClick={selectFormation}
            onAddClick={handleAddClick}
          />
        </div>

        {/* Detail panel (slide from right) */}
        {showEventPanel && selectedFormation && (
          <div className="w-[400px] shrink-0 overflow-y-auto border-l border-gray-200 bg-white">
            <EventDetailPanel
              formation={selectedFormation}
              onClose={closeEventPanel}
            />
          </div>
        )}
      </div>

      {/* ── Event form modal ─────────────────────────────────── */}
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
