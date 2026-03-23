import { formatTimeRange } from '../utils/dateUtils'

const STATUS_CONFIG = {
  programada:  { label: 'Programada',  bg: 'bg-amber-100',  text: 'text-amber-800',  dot: 'bg-amber-400' },
  'en-curso':  { label: 'En curso',    bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-500 animate-pulse' },
  completada:  { label: 'Completada',  bg: 'bg-emerald-100',text: 'text-emerald-800',dot: 'bg-emerald-500' },
  facturada:   { label: 'Facturada',   bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
  cancelada:   { label: 'Cancelada',   bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-500' },
}

export default function SessionBlock({ session, formation, categories, clients, onClick }) {
  const category = categories.find((c) => c.id === formation.categoryId)
  const client = clients.find((c) => c.id === formation.clientId)
  const status = STATUS_CONFIG[formation.status] ?? STATUS_CONFIG.programada

  // Trainer color for left border (passed via formation → we look up trainer color externally)
  // We receive trainerColor as prop from parent if needed, but we use category color as bg
  const catColor = category?.color ?? '#64748B'

  // Build a very light bg from category color (10% opacity)
  const catBgStyle = {
    backgroundColor: `${catColor}18`,
    borderLeftColor: catColor,
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg border-l-4 p-1.5 hover:brightness-95
                 transition-all shadow-sm hover:shadow-md active:scale-[0.98]
                 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
      style={catBgStyle}
    >
      {/* Top line: category icon + name + status dot */}
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-xs leading-none shrink-0">{category?.icon ?? '📋'}</span>
          <span
            className="text-[10px] font-semibold truncate"
            style={{ color: catColor }}
          >
            {category?.name ?? 'Sin categoría'}
          </span>
        </div>
        {/* Status dot */}
        <span className={`w-2 h-2 rounded-full shrink-0 ${status.dot}`} title={status.label} />
      </div>

      {/* Formation name */}
      <div className="text-xs font-bold text-slate-800 leading-tight truncate">
        {formation.name}
      </div>

      {/* Client + time */}
      <div className="flex items-center gap-1 mt-0.5 min-w-0">
        {client && (
          <>
            <span className="text-[10px] leading-none">{client.icon}</span>
            <span className="text-[10px] text-slate-500 truncate">{client.name}</span>
            <span className="text-[10px] text-slate-300">·</span>
          </>
        )}
        <span className="text-[10px] text-slate-500 shrink-0">
          {formatTimeRange(session.startTime, session.endTime)}
        </span>
      </div>
    </button>
  )
}
