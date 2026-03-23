import { Outlet } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import {
  CalendarDays,
  BookOpen,
  Users,
  Building2,
  Tag,
  GraduationCap,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/calendario', icon: CalendarDays, label: 'Calendario', title: 'Vista de calendario' },
  { to: '/formaciones', icon: BookOpen, label: 'Formaciones', title: 'Gestionar formaciones' },
  { to: '/formadores', icon: Users, label: 'Formadores', title: 'Gestionar formadores' },
  { to: '/clientes', icon: Building2, label: 'Clientes', title: 'Gestionar clientes' },
  { to: '/categorias', icon: Tag, label: 'Categorías', title: 'Gestionar categorías' },
]

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="w-56 shrink-0 bg-slate-900 flex flex-col shadow-xl">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-tight">PyMIT</div>
              <div className="text-slate-400 text-xs">Training Hub</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label, title }) => (
            <NavLink
              key={to}
              to={to}
              title={title}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                 ${
                   isActive
                     ? 'bg-blue-600 text-white shadow-md'
                     : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                 }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-700">
          <p className="text-slate-500 text-xs text-center">v1.0 · Pymit 2026</p>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <main className="flex-1 overflow-hidden flex flex-col min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
