import { create } from 'zustand'

export type ToastType = 'success' | 'info' | 'error' | 'undo'

export interface Toast {
  id: number
  type: ToastType
  text: string
  sub?: string
  action?: string
}

interface ToastStore {
  toasts: Toast[]
  addToast: (input: Omit<Toast, 'id'>) => void
  removeToast: (id: number) => void
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  addToast: (input) => {
    const id = Date.now() + Math.random()
    set((s) => ({ toasts: [...s.toasts, { ...input, id }] }))
    setTimeout(() => {
      const still = get().toasts.some((t) => t.id === id)
      if (still) set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 4000)
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
