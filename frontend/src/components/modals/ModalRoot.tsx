import { useCallback, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useModalStore, type ModalState } from '../../stores/modal'
import { useTasksStore } from '../../stores/tasks'
import { useEventsStore } from '../../stores/events'
import { useIsMobile } from '../../lib/useViewport'
import { useFocusTrap } from '../../lib/useFocusTrap'
import { NewTaskModal } from './NewTaskModal'
import { EditTaskModal } from './EditTaskModal'
import { TaskDetailPanel } from './TaskDetailPanel'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import { NewEventModal } from './NewEventModal'
import { NewProjectModal } from './NewProjectModal'
import { EventDetailModal } from './EventDetailModal'
import { RecurringEditModal } from './RecurringEditModal'
import { ImportPreviewModal } from './ImportPreviewModal'
import { ApiKeyGeneratedModal } from './ApiKeyGeneratedModal'
import { RegenKeyModal } from './RegenKeyModal'
import { ShortcutsCheatsheet } from './ShortcutsCheatsheet'

export function ModalRoot() {
  const params = useParams({ strict: false }) as {
    taskId?: string
    eventId?: string
  }
  const navigate = useNavigate()
  const tasks = useTasksStore((s) => s.tasks)
  const events = useEventsStore((s) => s.events)
  const storeModal = useModalStore((s) => s.modal)
  const closeStore = useModalStore((s) => s.close)
  const isMobile = useIsMobile()

  const urlTask = useMemo(
    () => (params.taskId ? tasks.find((t) => t.id === params.taskId) : undefined),
    [params.taskId, tasks],
  )
  const urlEvent = useMemo(
    () => (params.eventId ? events.find((e) => e.id === params.eventId) : undefined),
    [params.eventId, events],
  )

  // Redirect silently when URL points to a non-existent id
  useEffect(() => {
    if (params.taskId && !urlTask) {
      navigate({ to: '/tareas', replace: true })
    }
  }, [params.taskId, urlTask, navigate])

  useEffect(() => {
    if (params.eventId && !urlEvent) {
      navigate({ to: '/calendario', replace: true })
    }
  }, [params.eventId, urlEvent, navigate])

  const close = useCallback(() => {
    if (storeModal) {
      closeStore()
    } else if (urlTask) {
      navigate({ to: '/tareas' })
    } else if (urlEvent) {
      navigate({ to: '/calendario' })
    }
  }, [storeModal, urlTask, urlEvent, navigate, closeStore])

  const activeModal: ModalState | null =
    storeModal ??
    (urlTask ? { type: 'task-detail', task: urlTask } : null) ??
    (urlEvent ? { type: 'event-detail', event: urlEvent } : null)

  useEffect(() => {
    if (!activeModal) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeModal, close])

  if (!activeModal) return null

  return <ModalShell modal={activeModal} close={close} isMobile={isMobile} />
}

interface ModalShellProps {
  modal: ModalState
  close: () => void
  isMobile: boolean
}

function ModalShell({ modal, close, isMobile }: ModalShellProps) {
  const trapRef = useFocusTrap<HTMLDivElement>(true)
  const isDrawer = modal.type === 'task-detail'

  if (isDrawer) {
    return (
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 600, display: 'flex' }}
        onClick={close}
        role="presentation"
      >
        <div style={{ flex: 1, background: 'rgba(0,0,0,0.35)' }} />
        <div
          ref={trapRef}
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
          className="drawer-slide"
        >
          <div
            style={{
              height: '100vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {renderContent(modal, close)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 600,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        padding: isMobile ? 0 : 20,
      }}
      onClick={close}
      role="presentation"
    >
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="modal-overlay"
      >
        {renderContent(modal, close)}
      </div>
    </div>
  )
}

function renderContent(modal: ModalState, close: () => void) {
  switch (modal.type) {
    case 'new-task':
      return (
        <NewTaskModal
          onClose={close}
          initialCol={modal.initialCol}
          initialProject={modal.initialProject}
        />
      )
    case 'edit-task':
      return <EditTaskModal onClose={close} task={modal.task} />
    case 'task-detail':
      return <TaskDetailPanel onClose={close} task={modal.task} />
    case 'delete-confirm':
      return (
        <DeleteConfirmModal
          onClose={close}
          itemName={modal.itemName}
          onConfirm={modal.onConfirm}
        />
      )
    case 'new-event':
      return <NewEventModal onClose={close} />
    case 'new-project':
      return <NewProjectModal onClose={close} />
    case 'event-detail':
      return <EventDetailModal onClose={close} event={modal.event} />
    case 'recurring-edit':
      return (
        <RecurringEditModal onClose={close} event={modal.event} onConfirm={modal.onConfirm} />
      )
    case 'import-preview':
      return <ImportPreviewModal onClose={close} />
    case 'api-key-generated':
      return <ApiKeyGeneratedModal onClose={close} apiKey={modal.apiKey} />
    case 'regen-key':
      return <RegenKeyModal onClose={close} onConfirm={modal.onConfirm} />
    case 'shortcuts-cheatsheet':
      return <ShortcutsCheatsheet onClose={close} />
  }
}
