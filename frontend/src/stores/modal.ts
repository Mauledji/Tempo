import { create } from 'zustand'
import type { Task, CalendarEvent, TaskCol, ProjectId } from '../data/mock'

export type OpenableModalState =
  | { type: 'new-task'; initialCol?: TaskCol; initialProject?: ProjectId }
  | { type: 'edit-task'; task: Task }
  | { type: 'delete-confirm'; itemName: string; onConfirm: () => void }
  | { type: 'new-event' }
  | { type: 'new-project' }
  | { type: 'recurring-edit'; event: CalendarEvent; onConfirm: (choice: string) => void }
  | { type: 'import-preview' }
  | { type: 'api-key-generated'; apiKey: string }
  | { type: 'regen-key'; onConfirm: () => void }
  | { type: 'shortcuts-cheatsheet' }

export type URLDrivenModalState =
  | { type: 'task-detail'; task: Task }
  | { type: 'event-detail'; event: CalendarEvent }

export type ModalState = OpenableModalState | URLDrivenModalState

interface ModalStore {
  modal: OpenableModalState | null
  open: (modal: OpenableModalState) => void
  close: () => void
}

export const useModalStore = create<ModalStore>((set) => ({
  modal: null,
  open: (modal) => set({ modal }),
  close: () => set({ modal: null }),
}))
