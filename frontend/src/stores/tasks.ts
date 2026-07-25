import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TEMPO_DATA, type Task, type TaskCol, type Priority, type ProjectId } from '../data/mock'

export interface NewTaskInput {
  title: string
  description?: string
  priority: Priority
  project: ProjectId
  tags: string[]
  col: TaskCol
  due: string | null
  subtasks?: string[]
  claude?: boolean
}

interface TasksState {
  tasks: Task[]
  addTask: (input: NewTaskInput) => Task
  updateTask: (id: string, patch: Partial<Task>) => void
  removeTask: (id: string) => void
  toggleDone: (id: string) => void
  moveToColumn: (id: string, col: TaskCol) => void
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set) => ({
      // Seed mock data only in dev — production should boot with an empty
      // store and rehydrate from the persisted user data (or the backend).
      tasks: import.meta.env.DEV ? TEMPO_DATA.tasks.map((t) => ({ ...t })) : [],

      addTask: (input) => {
        const task: Task = {
          id: crypto.randomUUID(),
          title: input.title.trim(),
          description: input.description,
          priority: input.priority,
          project: input.project,
          tags: input.tags,
          col: input.col,
          due: input.due,
          done: false,
          claude: input.claude ?? false,
          subtasks: input.subtasks?.filter((s) => s.trim()),
        }
        set((s) => ({ tasks: [...s.tasks, task] }))
        return task
      },

      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      removeTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      toggleDone: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, done: !t.done, col: !t.done ? 'done' : t.col } : t,
          ),
        })),

      moveToColumn: (id, col) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, col } : t)),
        })),
    }),
    { name: 'tempo-tasks' },
  ),
)
