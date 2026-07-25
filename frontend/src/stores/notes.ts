import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NotesState {
  notes: Record<string, string>
  setNote: (dateKey: string, value: string) => void
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set) => ({
      notes: {},
      setNote: (dateKey, value) =>
        set((s) => ({ notes: { ...s.notes, [dateKey]: value } })),
    }),
    { name: 'tempo-notes' },
  ),
)
