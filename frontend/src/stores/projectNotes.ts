import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProjectId } from '../data/mock'

interface ProjectNotesState {
  notes: Record<string, string>
  setNote: (projectId: ProjectId, value: string) => void
}

export const useProjectNotesStore = create<ProjectNotesState>()(
  persist(
    (set) => ({
      notes: {},
      setNote: (projectId, value) =>
        set((s) => ({ notes: { ...s.notes, [projectId]: value } })),
    }),
    { name: 'tempo-project-notes' },
  ),
)
