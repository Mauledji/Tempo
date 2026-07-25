import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TEMPO_DATA, type CalendarEvent, type EventCategory } from '../data/mock'

export interface NewEventInput {
  title: string
  category: EventCategory
  start: string
  end: string
  recurrent: boolean
  location?: string
  notes?: string
}

interface EventsState {
  events: CalendarEvent[]
  addEvent: (input: NewEventInput) => CalendarEvent
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => void
  removeEvent: (id: string) => void
}

export const useEventsStore = create<EventsState>()(
  persist(
    (set) => ({
      events: import.meta.env.DEV ? TEMPO_DATA.events.map((e) => ({ ...e })) : [],

      addEvent: (input) => {
        const ev: CalendarEvent = {
          id: crypto.randomUUID(),
          title: input.title.trim(),
          category: input.category,
          start: input.start,
          end: input.end,
          recurrent: input.recurrent,
          location: input.location,
          notes: input.notes,
        }
        set((s) => ({ events: [...s.events, ev] }))
        return ev
      },

      updateEvent: (id, patch) =>
        set((s) => ({
          events: s.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),

      removeEvent: (id) =>
        set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
    }),
    { name: 'tempo-events' },
  ),
)
