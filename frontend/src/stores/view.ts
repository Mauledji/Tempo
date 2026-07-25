import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ViewState {
  tagFilter: string | null
  setTagFilter: (t: string | null) => void
}

export const useViewStore = create<ViewState>()(
  persist(
    (set) => ({
      tagFilter: null,
      setTagFilter: (t) => set({ tagFilter: t }),
    }),
    { name: 'tempo-view' },
  ),
)
