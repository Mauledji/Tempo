import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Icon } from './Icon'
import { useThemeStore } from '../stores/theme'
import { useModalStore } from '../stores/modal'
import { useProjectsStore } from '../stores/projects'
import { useTasksStore } from '../stores/tasks'
import { useToastStore } from '../stores/toast'
import { parseSmartDate } from '../lib/date'
import { NAV_LABEL, NAV_ICON, VIEW_PATH, type ViewId } from '../constants/nav'
import type { ProjectId, Priority } from '../data/mock'

type CmdAction =
  | { id: string; action: 'nav'; view: ViewId; label: string; icon: string; group: string }
  | { id: string; action: 'create'; type: 'task' | 'event' | 'project'; label: string; icon: string; group: string }
  | { id: string; action: 'theme'; label: string; icon: string; group: string }
  | { id: string; action: 'quick-task'; label: string; icon: string; group: string }

const NAV_ORDER: ViewId[] = [
  'dashboard',
  'calendar',
  'day',
  'agenda',
  'kanban',
  'projects',
  'timeline',
  'daily',
  'progress',
  'tags',
  'search',
  'archived',
  'settings',
]

const NAV_COMMANDS: CmdAction[] = NAV_ORDER.map((view) => ({
  id: `goto-${view}`,
  label: `Ir a ${NAV_LABEL[view]}`,
  icon: NAV_ICON[view],
  action: 'nav' as const,
  view,
  group: 'Navegar',
}))

const COMMANDS: CmdAction[] = [
  ...NAV_COMMANDS,
  { id: 'quick-task', label: 'Crear tarea rápida', icon: 'zap', action: 'quick-task', group: 'Crear' },
  { id: 'new-task', label: 'Nueva tarea (formulario completo)', icon: 'plus-circle', action: 'create', type: 'task', group: 'Crear' },
  { id: 'new-event', label: 'Nuevo evento', icon: 'calendar-plus', action: 'create', type: 'event', group: 'Crear' },
  { id: 'new-project', label: 'Nuevo proyecto', icon: 'folder-plus', action: 'create', type: 'project', group: 'Crear' },
  { id: 'toggle-dark', label: 'Cambiar modo claro/oscuro', icon: 'moon', action: 'theme', group: 'Ajustes' },
]

interface CmdPaletteProps {
  onClose: () => void
}

export function CmdPalette({ onClose }: CmdPaletteProps) {
  const navigate = useNavigate()
  const toggleTheme = useThemeStore((s) => s.toggle)
  const openModal = useModalStore((s) => s.open)
  const projects = useProjectsStore((s) => s.projects)
  const addTask = useTasksStore((s) => s.addTask)
  const addToast = useToastStore((s) => s.addToast)

  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const [mode, setMode] = useState<'cmd' | 'task'>('cmd')
  const [taskTitle, setTaskTitle] = useState('')
  const [taskProject, setTaskProject] = useState<ProjectId | ''>('')
  const [taskPriority, setTaskPriority] = useState<Priority>('medium')
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [mode])

  const filtered = query
    ? COMMANDS.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : COMMANDS

  const groups = Array.from(new Set(filtered.map((c) => c.group)))

  const smartDate = parseSmartDate(taskTitle)

  const execute = (cmd: CmdAction) => {
    if (cmd.action === 'nav') {
      navigate({ to: VIEW_PATH[cmd.view] })
      onClose()
      return
    }
    if (cmd.action === 'theme') {
      toggleTheme()
      onClose()
      return
    }
    if (cmd.action === 'quick-task') {
      setMode('task')
      return
    }
    if (cmd.action === 'create') {
      if (cmd.type === 'task') {
        onClose()
        openModal({ type: 'new-task' })
      } else if (cmd.type === 'event') {
        onClose()
        openModal({ type: 'new-event' })
      } else if (cmd.type === 'project') {
        onClose()
        openModal({ type: 'new-project' })
      }
    }
  }

  const submitTask = () => {
    const title = taskTitle.trim()
    if (!title) return
    const fallbackProject: ProjectId = projects[0]?.id ?? 'clf'
    addTask({
      title,
      priority: taskPriority,
      project: taskProject || fallbackProject,
      tags: [],
      col: smartDate ? 'today' : 'inbox',
      due: smartDate,
    })
    addToast({ type: 'success', text: 'Tarea creada', sub: title })
    onClose()
  }

  // Mirror the latest state into a ref so the keydown listener (attached once)
  // always reads fresh values without re-binding the window listener on every
  // keystroke. This replaces a previous eslint-disable on exhaustive-deps.
  const stateRef = useRef({ mode, selected, filtered, taskTitle, execute, submitTask })
  stateRef.current = { mode, selected, filtered, taskTitle, execute, submitTask }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const { mode, selected, filtered, taskTitle, execute, submitTask } = stateRef.current
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected((s) => Math.min(s + 1, filtered.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected((s) => Math.max(s - 1, 0))
      }
      if (e.key === 'Enter') {
        if (mode === 'cmd' && filtered[selected]) execute(filtered[selected])
        else if (mode === 'task' && taskTitle.trim()) submitTask()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 80,
        background: 'rgba(0,0,0,0.35)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 560,
          maxHeight: 480,
          background: 'var(--surface)',
          borderRadius: 14,
          border: '1px solid var(--border)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {mode === 'cmd' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 16px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <Icon name="search" size={17} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSelected(0)
              }}
              placeholder="Buscar o escribir un comando…"
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                fontSize: 15,
                color: 'var(--text-1)',
                outline: 'none',
                fontFamily: 'var(--font)',
              }}
            />
            <kbd
              style={{
                fontSize: 11,
                color: 'var(--text-3)',
                background: 'var(--surface-3)',
                padding: '2px 7px',
                borderRadius: 5,
              }}
            >
              ESC
            </kbd>
          </div>
        )}

        {mode === 'task' && (
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  border: '2px solid var(--accent)',
                  flexShrink: 0,
                }}
              />
              <input
                ref={inputRef}
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Nombre de la tarea… (ej: 'mock exam mañana a las 3pm')"
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  fontSize: 15,
                  color: 'var(--text-1)',
                  outline: 'none',
                  fontFamily: 'var(--font)',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <select
                className="filter-select"
                value={taskProject}
                onChange={(e) => setTaskProject(e.target.value as ProjectId | '')}
              >
                <option value="">Sin proyecto</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <select
                className="filter-select"
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as Priority)}
              >
                <option value="urgent">Urgente</option>
                <option value="high">Alta prioridad</option>
                <option value="medium">Media prioridad</option>
                <option value="low">Baja prioridad</option>
              </select>
              {smartDate && (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 12,
                    color: 'var(--accent)',
                    background: 'var(--accent-subtle)',
                    padding: '4px 10px',
                    borderRadius: 6,
                  }}
                >
                  <Icon name="calendar" size={12} />
                  {smartDate}
                </span>
              )}
            </div>
          </div>
        )}

        {mode === 'cmd' && (
          <div style={{ overflowY: 'auto', padding: '8px 0' }}>
            {groups.map((group) => (
              <div key={group}>
                <div
                  style={{
                    padding: '6px 16px 4px',
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'var(--text-3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                  }}
                >
                  {group}
                </div>
                {filtered
                  .filter((c) => c.group === group)
                  .map((cmd) => {
                    const idx = filtered.indexOf(cmd)
                    return (
                      <div
                        key={cmd.id}
                        className={`cmd-item ${idx === selected ? 'selected' : ''}`}
                        onClick={() => execute(cmd)}
                        onMouseEnter={() => setSelected(idx)}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 7,
                            background: 'var(--surface-2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Icon name={cmd.icon} size={14} style={{ color: 'var(--text-2)' }} />
                        </div>
                        <span style={{ fontSize: 14, color: 'var(--text-1)' }}>
                          {cmd.label}
                        </span>
                      </div>
                    )
                  })}
              </div>
            ))}
            {filtered.length === 0 && (
              <div
                style={{
                  padding: '32px 0',
                  textAlign: 'center',
                  color: 'var(--text-3)',
                  fontSize: 13,
                }}
              >
                Sin resultados para "{query}"
              </div>
            )}
          </div>
        )}

        {mode === 'task' && (
          <div
            style={{
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <button className="btn-ghost" onClick={() => setMode('cmd')}>
              <Icon name="arrow-left" size={13} /> Volver
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-ghost" onClick={onClose}>
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={submitTask}
                disabled={!taskTitle.trim()}
              >
                <Icon name="plus" size={14} /> Crear tarea
              </button>
            </div>
          </div>
        )}

        {mode === 'cmd' && (
          <div
            style={{
              padding: '8px 16px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: 16,
            }}
          >
            {[
              ['↑↓', 'Navegar'],
              ['↵', 'Seleccionar'],
              ['ESC', 'Cerrar'],
            ].map(([k, l]) => (
              <div
                key={l}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 11,
                  color: 'var(--text-3)',
                }}
              >
                <kbd
                  style={{
                    background: 'var(--surface-3)',
                    borderRadius: 4,
                    padding: '1px 6px',
                    fontSize: 11,
                  }}
                >
                  {k}
                </kbd>
                <span>{l}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
