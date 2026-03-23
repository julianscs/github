import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { initialData } from './data/initialData'

function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export const useStore = create(
  persist(
    (set, get) => ({
      // ── Data ──────────────────────────────────────────────────
      trainers: initialData.trainers,
      clients: initialData.clients,
      categories: initialData.categories,
      formations: initialData.formations,

      // ── UI State ──────────────────────────────────────────────
      currentWeekStart: getMonday(new Date()),
      selectedFormation: null,
      showEventPanel: false,
      showEventForm: false,
      editingFormation: null,
      activeFilters: {
        trainers: [],
        clients: [],
        categories: [],
        statuses: [],
      },
      showWeekends: false,

      // ── Navigation ────────────────────────────────────────────
      setCurrentWeekStart: (isoDate) => set({ currentWeekStart: isoDate }),

      goToPrevWeek: () => {
        const d = new Date(get().currentWeekStart)
        d.setDate(d.getDate() - 7)
        set({ currentWeekStart: d.toISOString() })
      },

      goToNextWeek: () => {
        const d = new Date(get().currentWeekStart)
        d.setDate(d.getDate() + 7)
        set({ currentWeekStart: d.toISOString() })
      },

      goToToday: () => set({ currentWeekStart: getMonday(new Date()) }),

      // ── Selection ─────────────────────────────────────────────
      selectFormation: (formation) =>
        set({ selectedFormation: formation, showEventPanel: true }),

      closeEventPanel: () =>
        set({ selectedFormation: null, showEventPanel: false }),

      // ── Event Form ────────────────────────────────────────────
      openNewEventForm: (prefill = null) =>
        set({ editingFormation: prefill, showEventForm: true }),

      openEditEventForm: (formation) =>
        set({ editingFormation: formation, showEventForm: true }),

      closeEventForm: () =>
        set({ editingFormation: null, showEventForm: false }),

      // ── Filters ───────────────────────────────────────────────
      setActiveFilters: (filters) => set({ activeFilters: filters }),
      clearFilters: () =>
        set({
          activeFilters: { trainers: [], clients: [], categories: [], statuses: [] },
        }),

      toggleShowWeekends: () => set((s) => ({ showWeekends: !s.showWeekends })),

      // ── CRUD: Formations ──────────────────────────────────────
      addFormation: (formation) =>
        set((s) => ({
          formations: [
            ...s.formations,
            { ...formation, id: `f-${Date.now()}` },
          ],
        })),

      updateFormation: (id, updates) =>
        set((s) => ({
          formations: s.formations.map((f) =>
            f.id === id ? { ...f, ...updates } : f
          ),
          selectedFormation:
            s.selectedFormation?.id === id
              ? { ...s.selectedFormation, ...updates }
              : s.selectedFormation,
        })),

      deleteFormation: (id) =>
        set((s) => ({
          formations: s.formations.filter((f) => f.id !== id),
          selectedFormation:
            s.selectedFormation?.id === id ? null : s.selectedFormation,
          showEventPanel:
            s.selectedFormation?.id === id ? false : s.showEventPanel,
        })),

      // ── CRUD: Trainers ────────────────────────────────────────
      addTrainer: (trainer) =>
        set((s) => ({
          trainers: [...s.trainers, { ...trainer, id: `t-${Date.now()}` }],
        })),

      updateTrainer: (id, updates) =>
        set((s) => ({
          trainers: s.trainers.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      deleteTrainer: (id) =>
        set((s) => ({ trainers: s.trainers.filter((t) => t.id !== id) })),

      // ── CRUD: Clients ─────────────────────────────────────────
      addClient: (client) =>
        set((s) => ({
          clients: [...s.clients, { ...client, id: `c-${Date.now()}` }],
        })),

      updateClient: (id, updates) =>
        set((s) => ({
          clients: s.clients.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      deleteClient: (id) =>
        set((s) => ({ clients: s.clients.filter((c) => c.id !== id) })),

      // ── CRUD: Categories ──────────────────────────────────────
      addCategory: (cat) =>
        set((s) => ({
          categories: [...s.categories, { ...cat, id: `cat-${Date.now()}` }],
        })),

      updateCategory: (id, updates) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
        })),
    }),
    {
      name: 'pymit-training-hub-v1',
      // Only persist data, not UI state
      partialize: (state) => ({
        trainers: state.trainers,
        clients: state.clients,
        categories: state.categories,
        formations: state.formations,
        showWeekends: state.showWeekends,
      }),
    }
  )
)
