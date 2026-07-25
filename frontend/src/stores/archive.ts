import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ArchiveState {
  archivedTasks: string[]
  archivedProjects: string[]
  archiveTask: (id: string) => void
  unarchiveTask: (id: string) => void
  archiveProject: (id: string) => void
  unarchiveProject: (id: string) => void
}

export const useArchiveStore = create<ArchiveState>()(
  persist(
    (set) => ({
      archivedTasks: [],
      archivedProjects: [],
      archiveTask: (id) =>
        set((s) => ({
          archivedTasks: s.archivedTasks.includes(id)
            ? s.archivedTasks
            : [...s.archivedTasks, id],
        })),
      unarchiveTask: (id) =>
        set((s) => ({ archivedTasks: s.archivedTasks.filter((x) => x !== id) })),
      archiveProject: (id) =>
        set((s) => ({
          archivedProjects: s.archivedProjects.includes(id)
            ? s.archivedProjects
            : [...s.archivedProjects, id],
        })),
      unarchiveProject: (id) =>
        set((s) => ({ archivedProjects: s.archivedProjects.filter((x) => x !== id) })),
    }),
    { name: 'tempo-archive' },
  ),
)
