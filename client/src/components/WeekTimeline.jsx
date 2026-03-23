import { useMemo } from 'react'
import { Plus } from 'lucide-react'
import { getWeekDays, formatDayHeader, isMorningSession } from '../utils/dateUtils'
import SessionBlock from './SessionBlock'

// ─────────────────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getSessionsForCell(formations, trainerId, date, period) {
  const results = []
  for (const f of formations) {
    if (f.trainerId !== trainerId) continue
    for (const s of f.sessions) {
      if (s.date !== date) continue
      const morning = isMorningSession(s.startTime)
      if ((period === 'morning' && morning) || (period === 'afternoon' && !morning)) {
        results.push({ session: s, formation: f })
      }
    }
  }
  return results
}

function hasAnySessions(formations, trainerId) {
  return formations.some((f) => f.trainerId === trainerId)
}

// ─────────────────────────────────────────────────────────────────────────────
//  Day header cell
// ─────────────────────────────────────────────────────────────────────────────

function DayHeader({ dateStr }) {
  const { weekday, day, month, isToday } = formatDayHeader(dateStr)
  return (
    <th
      className={`text-center py-3 px-2 text-sm font-semibold sticky top-0 z-20 border-r border-slate-700 last:border-r-0
        ${isToday ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-100'}`}
    >
      <div className="capitalize text-xs font-normal opacity-80">{weekday}</div>
      <div className={`text-xl font-bold leading-tight ${isToday ? 'text-white' : 'text-white'}`}>
        {day}
      </div>
      <div className="text-xs opacity-70 capitalize">{month}</div>
      {isToday && (
        <div className="mt-1 mx-auto w-1.5 h-1.5 bg-white rounded-full" />
      )}
    </th>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  Day cell (one slot: trainer × day × period)
// ─────────────────────────────────────────────────────────────────────────────

function DayCell({ items, isToday, period, onSessionClick, onAddClick, trainerId, date, categories, clients }) {
  const bg = isToday
    ? period === 'morning'
      ? 'bg-blue-50/60'
      : 'bg-amber-50/60'
    : ''

  return (
    <td
      className={`day-cell border-r border-gray-200 last:border-r-0 relative group align-top ${bg}`}
    >
      <div className="space-y-1 min-h-[68px]">
        {items.map(({ session, formation }) => (
          <SessionBlock
            key={session.id}
            session={session}
            formation={formation}
            categories={categories}
            clients={clients}
            onClick={() => onSessionClick(formation)}
          />
        ))}
      </div>
      {/* + Add button on hover */}
      <button
        onClick={() => onAddClick({ trainerId, date, period })}
        className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity
                   w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center
                   text-gray-400 hover:text-blue-600 hover:border-blue-400 shadow-sm"
        title="Nueva formación"
      >
        <Plus size={12} />
      </button>
    </td>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  Trainer label (rowSpan=2)
// ─────────────────────────────────────────────────────────────────────────────

function TrainerLabel({ trainer }) {
  const typeLabel = {
    internal: 'Interno',
    freelance: 'Freelance',
    company: 'Empresa',
  }[trainer.type] ?? trainer.type

  const typeBg = {
    internal: 'bg-blue-100 text-blue-700',
    freelance: 'bg-amber-100 text-amber-700',
    company: 'bg-slate-100 text-slate-600',
  }[trainer.type] ?? 'bg-gray-100 text-gray-600'

  return (
    <div className="flex flex-col gap-1 px-3 py-2">
      <div className="flex items-center gap-2">
        {/* Color dot */}
        <span
          className="w-3 h-3 rounded-full shrink-0 ring-2 ring-white shadow"
          style={{ backgroundColor: trainer.color }}
        />
        <span className="text-2xl leading-none">{trainer.icon}</span>
      </div>
      <div>
        <div className="font-semibold text-sm text-slate-800 leading-tight">{trainer.name}</div>
        <div className="text-xs text-slate-400 truncate">{trainer.email}</div>
      </div>
      <span className={`self-start text-[10px] px-1.5 py-0.5 rounded-full font-medium ${typeBg}`}>
        {typeLabel}
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  Period label (shown in first cell of each row)
// ─────────────────────────────────────────────────────────────────────────────

function PeriodLabel({ period }) {
  if (period === 'morning') {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5">
        <span className="text-base">🌅</span>
        <div>
          <div className="text-xs font-semibold text-sky-700">Mañana</div>
          <div className="text-[10px] text-sky-500">9:00 – 14:00</div>
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5">
      <span className="text-base">🌆</span>
      <div>
        <div className="text-xs font-semibold text-amber-700">Tarde</div>
        <div className="text-[10px] text-amber-500">14:00 – 21:00</div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main WeekTimeline component
// ─────────────────────────────────────────────────────────────────────────────

export default function WeekTimeline({
  weekStart,
  trainers,
  formations,
  categories,
  clients,
  activeFilters,
  showWeekends,
  onSessionClick,
  onAddClick,
}) {
  const weekDays = useMemo(
    () => getWeekDays(weekStart, showWeekends),
    [weekStart, showWeekends]
  )

  // Apply filters
  const filteredFormations = useMemo(() => {
    let list = formations
    if (activeFilters.trainers.length)
      list = list.filter((f) => activeFilters.trainers.includes(f.trainerId))
    if (activeFilters.clients.length)
      list = list.filter((f) => activeFilters.clients.includes(f.clientId))
    if (activeFilters.categories.length)
      list = list.filter((f) => activeFilters.categories.includes(f.categoryId))
    if (activeFilters.statuses.length)
      list = list.filter((f) => activeFilters.statuses.includes(f.status))
    return list
  }, [formations, activeFilters])

  // Only show trainers that are active (or have any formations)
  const visibleTrainers = useMemo(
    () => trainers.filter((t) => t.active !== false),
    [trainers]
  )

  return (
    <div className="overflow-auto flex-1 rounded-xl border border-slate-200 shadow-sm bg-white">
      <table className="timeline-table" style={{ minWidth: `${180 + weekDays.length * 160}px` }}>
        <thead>
          <tr>
            {/* Corner header */}
            <th className="sticky left-0 z-30 bg-slate-900 text-left px-4 py-3 min-w-[180px] border-r border-slate-700">
              <div className="text-slate-300 text-xs font-medium uppercase tracking-wider">
                Formador
              </div>
              <div className="text-slate-500 text-[10px] mt-0.5">
                {showWeekends ? '7 días' : 'Lun – Vie'}
              </div>
            </th>
            {weekDays.map((d) => (
              <DayHeader key={d} dateStr={d} />
            ))}
          </tr>
        </thead>

        <tbody>
          {visibleTrainers.map((trainer, idx) => {
            const isLast = idx === visibleTrainers.length - 1

            return (
              <>
                {/* ── Morning row ── */}
                <tr key={`${trainer.id}-morning`} className="row-morning">
                  {/* Trainer label spans 2 rows */}
                  <td
                    rowSpan={2}
                    className="sticky left-0 z-10 border-r-2 border-slate-200 align-middle"
                    style={{ background: 'white' }}
                  >
                    <TrainerLabel trainer={trainer} />
                  </td>

                  {/* Period label inside first day cell (shown outside table for cleanliness) */}
                  {weekDays.map((date, di) => {
                    const items = getSessionsForCell(filteredFormations, trainer.id, date, 'morning')
                    const { isToday } = formatDayHeader(date)
                    return (
                      <DayCell
                        key={date}
                        items={items}
                        isToday={isToday}
                        period="morning"
                        onSessionClick={onSessionClick}
                        onAddClick={onAddClick}
                        trainerId={trainer.id}
                        date={date}
                        categories={categories}
                        clients={clients}
                      />
                    )
                  })}
                </tr>

                {/* Period indicator row (between morning and afternoon) */}
                <tr
                  key={`${trainer.id}-afternoon`}
                  className="row-afternoon"
                >
                  {weekDays.map((date) => {
                    const items = getSessionsForCell(filteredFormations, trainer.id, date, 'afternoon')
                    const { isToday } = formatDayHeader(date)
                    return (
                      <DayCell
                        key={date}
                        items={items}
                        isToday={isToday}
                        period="afternoon"
                        onSessionClick={onSessionClick}
                        onAddClick={onAddClick}
                        trainerId={trainer.id}
                        date={date}
                        categories={categories}
                        clients={clients}
                      />
                    )
                  })}
                </tr>

                {/* Separator between trainers */}
                {!isLast && (
                  <tr key={`${trainer.id}-sep`} className="row-separator">
                    <td colSpan={weekDays.length + 1} />
                  </tr>
                )}
              </>
            )
          })}

          {visibleTrainers.length === 0 && (
            <tr>
              <td
                colSpan={weekDays.length + 1}
                className="text-center py-16 text-slate-400"
              >
                No hay formadores. Añade uno en la sección Formadores.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
