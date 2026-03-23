import {
  format,
  addDays,
  isToday,
  isSameDay,
  parseISO,
  startOfWeek,
} from 'date-fns'
import { es } from 'date-fns/locale'

export function getWeekDays(weekStartIso, showWeekends = false) {
  const start = new Date(weekStartIso)
  const days = showWeekends ? 7 : 5
  return Array.from({ length: days }, (_, i) => {
    const d = addDays(start, i)
    return d.toISOString().split('T')[0] // YYYY-MM-DD
  })
}

export function formatDayHeader(dateStr) {
  const d = parseISO(dateStr)
  return {
    weekday: format(d, 'EEE', { locale: es }), // Lun, Mar, …
    day: format(d, 'd'),
    month: format(d, 'MMM', { locale: es }),
    full: format(d, "EEEE d 'de' MMMM", { locale: es }),
    isToday: isToday(d),
  }
}

export function formatWeekRange(weekStartIso) {
  const start = new Date(weekStartIso)
  const end = addDays(start, 4)
  if (start.getMonth() === end.getMonth()) {
    return `${format(start, 'd')}–${format(end, 'd')} de ${format(start, 'MMMM yyyy', { locale: es })}`
  }
  return `${format(start, "d MMM", { locale: es })} – ${format(end, "d MMM yyyy", { locale: es })}`
}

export function isMorningSession(startTime) {
  const [h] = startTime.split(':').map(Number)
  return h < 14
}

export function formatTimeRange(startTime, endTime) {
  return `${startTime} – ${endTime}`
}

export function formatDuration(startTime, endTime) {
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  const mins = (eh * 60 + em) - (sh * 60 + sm)
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function getMonday(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export function totalFormationHours(sessions) {
  return sessions.reduce((acc, s) => {
    const [sh, sm] = s.startTime.split(':').map(Number)
    const [eh, em] = s.endTime.split(':').map(Number)
    return acc + ((eh * 60 + em) - (sh * 60 + sm)) / 60
  }, 0)
}

export function completedSessions(sessions) {
  const today = new Date().toISOString().split('T')[0]
  return sessions.filter((s) => s.date < today).length
}

export function formatDateEs(dateStr) {
  const d = parseISO(dateStr)
  return format(d, "d 'de' MMMM yyyy", { locale: es })
}
