import { useState, type CSSProperties } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Icon } from '../components/Icon'
import { ClaudeBadge } from '../components/shared/ClaudeBadge'
import { EmptyState } from '../components/shared/EmptyState'
import { KanbanSkeleton } from '../components/shared/Skeleton'
import { useContextMenu, type ContextMenuItem } from '../components/shared/ContextMenu'
import { useTasksStore } from '../stores/tasks'
import { useProjectsStore } from '../stores/projects'
import { useModalStore } from '../stores/modal'
import { useViewStore } from '../stores/view'
import { useArchiveStore } from '../stores/archive'
import { useToastStore } from '../stores/toast'
import { useFakeLoading } from '../lib/useFakeLoading'
import { PRIORITY_COLOR } from '../constants/ui'
import type { Task, TaskCol, Priority, ProjectId } from '../data/mock'

interface Column {
  id: TaskCol
  label: string
  icon: string
}

const COLUMNS: Column[] = [
  { id: 'inbox', label: 'Inbox', icon: 'inbox' },
  { id: 'today', label: 'Hoy', icon: 'sun' },
  { id: 'week', label: 'Esta semana', icon: 'calendar' },
  { id: 'upcoming', label: 'Próximas', icon: 'clock' },
  { id: 'done', label: 'Completadas', icon: 'check-circle' },
]

interface KanbanCardProps {
  task: Task
  onClick: () => void
}

function KanbanCard({ task, onClick }: KanbanCardProps) {
  const project = useProjectsStore((s) => s.projects.find((p) => p.id === task.project))
  const toggleDone = useTasksStore((s) => s.toggleDone)
  const addTask = useTasksStore((s) => s.addTask)
  const removeTask = useTasksStore((s) => s.removeTask)
  const archiveTask = useArchiveStore((s) => s.archiveTask)
  const openModal = useModalStore((s) => s.open)
  const navigate = useNavigate()
  const addToast = useToastStore((s) => s.addToast)
  const ctx = useContextMenu()
  const [completing, setCompleting] = useState(false)

  // useSortable wires up keyboard a11y (Space picks up, arrows move, Space drops,
  // Esc cancels) and pointer drag in one go. data.col is read in handleDragEnd
  // to figure out the source column without scanning the tasks store.
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: 'task', col: task.col },
  })

  const dragStyle: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: 'relative',
  }

  const handleCheck = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCompleting(true)
  }

  // Fires once the .completing fade-out finishes; replaces a fragile
  // setTimeout(350) that drifted whenever the CSS transition duration changed.
  // We filter on opacity + currentTarget so child element transitions don't
  // trigger an early toggle.
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (
      completing &&
      e.propertyName === 'opacity' &&
      e.target === e.currentTarget
    ) {
      toggleDone(task.id)
    }
  }

  const items: ContextMenuItem[] = [
    {
      label: 'Ver detalle',
      icon: 'eye',
      onSelect: () =>
        navigate({ to: '/tareas/$taskId', params: { taskId: task.id } }),
    },
    {
      label: 'Editar',
      icon: 'pencil',
      onSelect: () => openModal({ type: 'edit-task', task }),
    },
    {
      label: 'Duplicar',
      icon: 'copy',
      onSelect: () => {
        addTask({
          title: task.title + ' (copia)',
          description: task.description,
          priority: task.priority,
          project: task.project,
          tags: [...task.tags],
          col: task.col,
          due: task.due,
          subtasks: task.subtasks ? [...task.subtasks] : undefined,
          claude: task.claude,
        })
        addToast({ type: 'success', text: 'Tarea duplicada' })
      },
    },
    {
      label: 'Archivar',
      icon: 'archive',
      onSelect: () => {
        archiveTask(task.id)
        addToast({ type: 'info', text: 'Tarea archivada', sub: task.title })
      },
    },
    { label: '', separator: true },
    {
      label: 'Eliminar',
      icon: 'trash-2',
      danger: true,
      onSelect: () =>
        openModal({
          type: 'delete-confirm',
          itemName: task.title,
          onConfirm: () => {
            removeTask(task.id)
            addToast({ type: 'success', text: 'Tarea eliminada' })
          },
        }),
    },
  ]

  // Custom shortcuts (Enter/e/j/k) but only when NOT actively dragging — once
  // a drag starts, dnd-kit owns Space/arrows/Esc and we forward to its handler.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isDragging) {
      listeners?.onKeyDown?.(e)
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      onClick()
      return
    }
    if (e.key === 'e') {
      e.preventDefault()
      openModal({ type: 'edit-task', task })
      return
    }
    if (e.key === 'j' || e.key === 'ArrowDown') {
      e.preventDefault()
      const next = e.currentTarget.nextElementSibling as HTMLElement | null
      next?.focus?.()
      return
    }
    if (e.key === 'k' || e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = e.currentTarget.previousElementSibling as HTMLElement | null
      prev?.focus?.()
      return
    }
    // Forward Space (pickup), Tab, etc. to dnd-kit.
    listeners?.onKeyDown?.(e)
  }

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      className={`kanban-card ${completing ? 'completing' : ''} ${
        isDragging ? 'dragging' : ''
      }`}
      {...attributes}
      // Spread pointer listeners but override keyboard to compose with our shortcuts.
      onPointerDown={listeners?.onPointerDown}
      aria-label={`Tarea: ${task.title}. Enter para abrir, e para editar, j/k para navegar, Espacio para mover.`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onTransitionEnd={handleTransitionEnd}
      onContextMenu={(e) => ctx.open(e, items)}
    >
      <button
        type="button"
        className="kanban-more-btn"
        onClick={(e) => {
          e.stopPropagation()
          ctx.open(e, items)
        }}
        aria-label="Más acciones"
      >
        <Icon name="more-horizontal" size={14} />
      </button>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <button
          type="button"
          className={`task-check ${task.done ? 'checked' : ''}`}
          style={{ marginTop: 1 }}
          onClick={handleCheck}
        >
          {task.done && <Icon name="check" size={11} />}
        </button>
        <div style={{ flex: 1, minWidth: 0, paddingRight: 20 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: task.done ? 'var(--text-3)' : 'var(--text-1)',
              textDecoration: task.done ? 'line-through' : 'none',
              lineHeight: 1.4,
            }}
          >
            {task.title}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 8,
              flexWrap: 'wrap',
            }}
          >
            {project && (
              <span
                className="task-tag"
                style={{ background: project.color + '20', color: project.color }}
              >
                {project.name}
              </span>
            )}
            {task.tags.map((tag) => (
              <span key={tag} className="task-tag muted">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {task.due && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                color: 'var(--text-3)',
              }}
            >
              <Icon name="calendar" size={11} />
              {new Date(task.due).toLocaleDateString('es', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {task.claude && <ClaudeBadge />}
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              flexShrink: 0,
              background: PRIORITY_COLOR[task.priority],
            }}
          />
        </div>
      </div>
      {ctx.menu}
    </div>
  )
}

interface KanbanColumnProps {
  col: Column
  tasks: Task[]
  onAddTask: (colId: TaskCol) => void
  onCardClick: (task: Task) => void
}

function KanbanColumn({ col, tasks, onAddTask, onCardClick }: KanbanColumnProps) {
  // useDroppable lets the column accept a drop even when empty (SortableContext
  // by itself only emits collisions for present sortable items).
  const { setNodeRef, isOver } = useDroppable({
    id: col.id,
    data: { type: 'column', col: col.id },
  })

  return (
    <div ref={setNodeRef} className={`kanban-col ${isOver ? 'drop-over' : ''}`}>
      <div className="kanban-col-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Icon name={col.icon} size={14} style={{ color: 'var(--text-3)' }} />
          <span className="kanban-col-title">{col.label}</span>
          <span className="badge">{tasks.length}</span>
        </div>
      </div>

      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="kanban-cards">
          {tasks.map((t) => (
            <KanbanCard key={t.id} task={t} onClick={() => onCardClick(t)} />
          ))}
          {tasks.length === 0 && (
            <EmptyState
              size="sm"
              icon={col.id === 'inbox' ? 'inbox' : col.icon}
              title={col.id === 'inbox' ? 'Inbox en cero' : 'Sin tareas'}
              description={col.id === 'inbox' ? 'Capturá ideas rápido con ⌘N' : undefined}
            />
          )}
        </div>
      </SortableContext>

      <button type="button" className="kanban-add-btn" onClick={() => onAddTask(col.id)}>
        <Icon name="plus" size={13} />
        <span>Agregar</span>
      </button>
    </div>
  )
}

export function KanbanView() {
  const tasks = useTasksStore((s) => s.tasks)
  const moveToColumn = useTasksStore((s) => s.moveToColumn)
  const projects = useProjectsStore((s) => s.projects)
  const openModal = useModalStore((s) => s.open)
  const navigate = useNavigate()
  const tagFilter = useViewStore((s) => s.tagFilter)
  const setTagFilter = useViewStore((s) => s.setTagFilter)
  const loading = useFakeLoading('kanban')

  const [filterProject, setFilterProject] = useState<ProjectId | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')

  // Activation constraints: pointer needs 5px movement so a click on the card
  // body (which navigates to detail) doesn't accidentally start a drag.
  // KeyboardSensor with sortableKeyboardCoordinates is what gives keyboard
  // users full cross-container drag (Space + arrows + Space).
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragStart = (_event: DragStartEvent) => {
    // Reserved for future state (e.g., DragOverlay preview).
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    // The over target carries `data.current.col` whether it's another task or
    // the column container itself, thanks to the data we pass to the hooks.
    const sourceCol = active.data.current?.col as TaskCol | undefined
    const targetCol = (over.data.current?.col as TaskCol | undefined) ?? null

    if (!sourceCol || !targetCol) return
    if (sourceCol === targetCol) return

    moveToColumn(active.id as string, targetCol)
  }

  const filtered = tasks.filter((t) => {
    if (filterProject !== 'all' && t.project !== filterProject) return false
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false
    if (tagFilter && !t.tags.includes(tagFilter)) return false
    return true
  })

  if (loading) {
    return (
      <div
        className="view-container fill"
        style={{ display: 'flex', flexDirection: 'column', paddingTop: 24 }}
      >
        <KanbanSkeleton />
      </div>
    )
  }

  return (
    <div
      className="view-container fill"
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <div
        className="view-header"
        style={{ flexShrink: 0, padding: '24px 28px 0', margin: 0 }}
      >
        <div>
          <h1 className="view-title">Tareas</h1>
          <p className="view-subtitle">
            {tasks.filter((t) => t.col === 'done').length} completadas ·{' '}
            {tasks.filter((t) => t.col !== 'done').length} pendientes
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            className="filter-select"
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value as ProjectId | 'all')}
          >
            <option value="all">Todos los proyectos</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')}
          >
            <option value="all">Todas las prioridades</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
          <button
            type="button"
            className="btn-primary"
            onClick={() => openModal({ type: 'new-task' })}
          >
            <Icon name="plus" size={14} />
            <span>Nueva tarea</span>
          </button>
        </div>
      </div>

      {tagFilter && (
        <div
          style={{
            margin: '0 28px 12px',
            padding: '8px 14px',
            background: 'var(--accent-subtle)',
            border: '1px solid var(--accent-subtle-border)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 12,
            color: 'var(--accent)',
            flexShrink: 0,
          }}
        >
          <Icon name="filter" size={13} />
          <span>
            Filtrando por tag <strong>#{tagFilter}</strong> · {filtered.length} tareas
          </span>
          <button
            type="button"
            onClick={() => setTagFilter(null)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: 'var(--accent)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
            }}
          >
            <Icon name="x" size={12} />
            <span>Quitar</span>
          </button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          className="kanban-board"
          style={{ flex: 1, overflowX: 'auto', padding: '0 28px 20px' }}
        >
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              col={col}
              tasks={filtered.filter((t) => t.col === col.id)}
              onAddTask={(colId) => openModal({ type: 'new-task', initialCol: colId })}
              onCardClick={(task) =>
                navigate({ to: '/tareas/$taskId', params: { taskId: task.id } })
              }
            />
          ))}
        </div>
      </DndContext>
    </div>
  )
}
