import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TEMPO_DATA, type Project } from '../data/mock'

export interface NewProjectInput {
  name: string
  color: string
  icon: string
  deadline: string
  description?: string
}

interface ProjectsState {
  projects: Project[]
  addProject: (input: NewProjectInput) => Project
  updateProject: (id: string, patch: Partial<Project>) => void
  removeProject: (id: string) => void
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set) => ({
      projects: import.meta.env.DEV ? TEMPO_DATA.projects.map((p) => ({ ...p })) : [],

      addProject: (input) => {
        const proj: Project = {
          id: crypto.randomUUID(),
          name: input.name.trim(),
          fullName: input.name.trim(),
          color: input.color,
          icon: input.icon,
          progress: 0,
          phase: 'Inicio',
          deadline: input.deadline || '2026-12-31',
          tasks: 0,
          done: 0,
          starred: false,
          description: input.description,
        }
        set((s) => ({ projects: [...s.projects, proj] }))
        return proj
      },

      updateProject: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),

      removeProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
    }),
    { name: 'tempo-projects' },
  ),
)
