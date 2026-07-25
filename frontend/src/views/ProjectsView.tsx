import { useMemo, useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { Icon } from '../components/Icon'
import { ClaudeBadge } from '../components/shared/ClaudeBadge'
import { ProgressBar } from '../components/shared/ProgressBar'
import { EmptyState } from '../components/shared/EmptyState'
import { useProjectsStore } from '../stores/projects'
import { useTasksStore } from '../stores/tasks'
import { useEventsStore } from '../stores/events'
import { useModalStore } from '../stores/modal'
import { useProjectNotesStore } from '../stores/projectNotes'
import { TEMPO_DATA } from '../data/mock'
import { PRIORITY_COLOR } from '../constants/ui'
import { useIsMobile } from '../lib/useViewport'
import type { Project, ProjectId, TaskCol, Task, CalendarEvent, Milestone } from '../data/mock'

type TabId = 'tareas' | 'eventos' | 'hitos' | 'progreso' | 'notas'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'tareas',   label: 'Tareas',   icon: 'check-square' },
  { id: 'eventos',  label: 'Eventos',  icon: 'calendar' },
  { id: 'hitos',    label: 'Hitos',    icon: 'flag' },
  { id: 'progreso', label: 'Progreso', icon: 'trending-up' },
  { id: 'notas',    label: 'Notas',    icon: 'file-text' },
]

const COL_ORDER: TaskCol[] = ['today', 'week', 'upcoming', 'inbox', 'done']
const COL_LABEL: Record<TaskCol, string> = {
  today: 'Hoy',
  week: 'Esta semana',
  upcoming: 'Próximas',
  inbox: 'Inbox',
  done: 'Completadas',
}
const COL_COLOR: Record<TaskCol, string> = {
  today: '#e09050',
  week: '#5b7fa6',
  upcoming: '#7a6ba0',
  inbox: 'var(--text-3)',
  done: '#4a7759',
}

function matchesProject(ev: CalendarEvent, proj: Project): boolean {
  const hay = ev.title.toLowerCase()
  return hay.includes(proj.name.toLowerCase()) || hay.includes(proj.id.toLowerCase())
}

export function ProjectsView() {
  const projects = useProjectsStore((s) => s.projects)
  const tasks = useTasksStore((s) => s.tasks)
  const events = useEventsStore((s) => s.events)
  const toggleDone = useTasksStore((s) => s.toggleDone)
  const openModal = useModalStore((s) => s.open)
  const notesMap = useProjectNotesStore((s) => s.notes)
  const setNote = useProjectNotesStore((s) => s.setNote)
  const params = useParams({ strict: false }) as { projectId?: string }
  const navigate = useNavigate()

  const fallbackId: ProjectId = projects[0]?.id ?? 'clf'
  const selected: ProjectId = (params.projectId as ProjectId | undefined) ?? fallbackId
  const setSelected = (id: ProjectId) =>
    navigate({ to: '/proyectos/$projectId', params: { projectId: id } })
  const [tab, setTab] = useState<TabId>('tareas')
  const isMobile = useIsMobile()
  const [showList, setShowList] = useState(true)

  const proj = projects.find((p) => p.id === selected)
  const projTasks = useMemo(() => tasks.filter((t) => t.project === selected), [tasks, selected])
  const projEvents = useMemo(
    () => (proj ? events.filter((e) => matchesProject(e, proj)).sort((a, b) => a.start.localeCompare(b.start)) : []),
    [events, proj],
  )
  const milestones = TEMPO_DATA.milestones.filter((m) => m.project === selected)
  const timelineRow = TEMPO_DATA.timeline.find((r) => r.project === selected)

  const showSidebar = !isMobile || showList
  const showDetail = !isMobile || !showList

  return (
    <div className="view-container fill" style={{ display: 'flex', gap: 0 }}>
      {showSidebar && (
      <div
        style={{
          width: isMobile ? '100%' : 220,
          flexShrink: 0,
          borderRight: isMobile ? 'none' : '1px solid var(--border)',
          padding: '24px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            padding: '0 16px 12px',
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Proyectos
        </div>
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setSelected(p.id)
              setTab('tareas')
              if (isMobile) setShowList(false)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 16px',
              border: 'none',
              background: selected === p.id ? 'var(--accent-subtle)' : 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              borderLeft:
                selected === p.id ? `3px solid ${p.color}` : '3px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: p.color,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--text-1)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {p.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                {p.progress}% · {p.phase}
              </div>
            </div>
          </button>
        ))}
        <div style={{ padding: '16px 16px 0' }}>
          <button
            className="btn-ghost"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => openModal({ type: 'new-project' })}
          >
            <Icon name="plus" size={13} />
            <span>Nuevo proyecto</span>
          </button>
        </div>
      </div>
      )}

      {showDetail && (
      <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? 16 : 28 }}>
        {isMobile && (
          <button
            className="btn-ghost"
            onClick={() => setShowList(true)}
            style={{ marginBottom: 14 }}
          >
            <Icon name="chevron-left" size={14} />
            <span>Proyectos</span>
          </button>
        )}
        {proj && (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: proj.color,
                    }}
                  />
                  <h2
                    style={{
                      fontSize: 22,
                      fontWeight: 600,
                      color: 'var(--text-1)',
                      margin: 0,
                    }}
                  >
                    {proj.fullName}
                  </h2>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
                    Fase:{' '}
                    <span style={{ color: proj.color, fontWeight: 500 }}>{proj.phase}</span>
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
                    Deadline:{' '}
                    <span style={{ color: 'var(--text-2)' }}>
                      {new Date(proj.deadline).toLocaleDateString('es', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </span>
                </div>
              </div>
              <button
                className="btn-primary"
                style={{ background: proj.color }}
                onClick={() =>
                  openModal({ type: 'new-task', initialProject: proj.id })
                }
              >
                <Icon name="plus" size={14} />
                <span>Nueva tarea</span>
              </button>
            </div>

            <div
              role="tablist"
              style={{
                display: 'flex',
                gap: 4,
                borderBottom: '1px solid var(--border)',
                marginBottom: 20,
              }}
            >
              {TABS.map((t) => {
                const active = tab === t.id
                return (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(t.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      padding: '10px 14px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: active ? 600 : 500,
                      color: active ? 'var(--text-1)' : 'var(--text-3)',
                      borderBottom: active ? `2px solid ${proj.color}` : '2px solid transparent',
                      marginBottom: -1,
                      transition: 'color 0.15s',
                    }}
                  >
                    <Icon name={t.icon} size={14} />
                    <span>{t.label}</span>
                  </button>
                )
              })}
            </div>

            {tab === 'tareas' && (
              <TareasPanel
                tasks={projTasks}
                onToggle={(id) => toggleDone(id)}
                onOpen={(task) =>
                  navigate({ to: '/tareas/$taskId', params: { taskId: task.id } })
                }
              />
            )}

            {tab === 'eventos' && (
              <EventosPanel
                events={projEvents}
                onOpen={(event) =>
                  navigate({
                    to: '/calendario/$eventId',
                    params: { eventId: event.id },
                  })
                }
              />
            )}

            {tab === 'hitos' && (
              <HitosPanel milestones={milestones} accent={proj.color} />
            )}

            {tab === 'progreso' && (
              <ProgresoPanel proj={proj} tasks={projTasks} timelineRow={timelineRow} />
            )}

            {tab === 'notas' && (
              <NotasPanel
                value={notesMap[proj.id] ?? ''}
                onChange={(v) => setNote(proj.id, v)}
              />
            )}
          </>
        )}
      </div>
      )}
    </div>
  )
}

// ── Panels ────────────────────────────────────────────────────────

interface TareasPanelProps {
  tasks: Task[]
  onToggle: (id: string) => void
  onOpen: (task: Task) => void
}

function TareasPanel({ tasks, onToggle, onOpen }: TareasPanelProps) {
  return (
    <div className="card">
      {COL_ORDER.map((col) => {
        const colTasks = tasks.filter((t) => t.col === col)
        if (!colTasks.length) return null
        return (
          <div key={col} style={{ marginBottom: 16 }}>
            <div className="section-label" style={{ marginBottom: 8 }}>
              {COL_LABEL[col].toUpperCase()}
            </div>
            {colTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => onOpen(t)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 0',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                }}
              >
                <button
                  className={`task-check ${t.done ? 'checked' : ''}`}
                  style={{ flexShrink: 0 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggle(t.id)
                  }}
                >
                  {t.done && <Icon name="check" size={11} />}
                </button>
                <span
                  style={{
                    flex: 1,
                    fontSize: 13,
                    color: t.done ? 'var(--text-3)' : 'var(--text-1)',
                    textDecoration: t.done ? 'line-through' : 'none',
                  }}
                >
                  {t.title}
                </span>
                <div
                  style={{
                    display: 'flex',
                    gap: 6,
                    alignItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  {t.claude && <ClaudeBadge />}
                  {t.due && (
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                      {new Date(t.due).toLocaleDateString('es', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: PRIORITY_COLOR[t.priority],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )
      })}
      {tasks.length === 0 && (
        <EmptyState
          icon="check-square"
          title="Sin tareas en este proyecto"
          description="Usá ⌘K o 'Nueva tarea' para crear la primera."
        />
      )}
    </div>
  )
}

interface EventosPanelProps {
  events: CalendarEvent[]
  onOpen: (event: CalendarEvent) => void
}

function EventosPanel({ events, onOpen }: EventosPanelProps) {
  const grouped = useMemo(() => {
    const m = new Map<string, CalendarEvent[]>()
    for (const e of events) {
      const key = e.start.slice(0, 10)
      if (!m.has(key)) m.set(key, [])
      m.get(key)!.push(e)
    }
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [events])

  if (!events.length) {
    return (
      <div className="card">
        <EmptyState
          icon="calendar"
          title="Sin eventos asociados"
          description="Los eventos se asocian por nombre del proyecto en el título."
        />
      </div>
    )
  }

  return (
    <div className="card">
      {grouped.map(([date, list]) => (
        <div key={date} style={{ marginBottom: 16 }}>
          <div className="section-label" style={{ marginBottom: 8 }}>
            {new Date(date).toLocaleDateString('es', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </div>
          {list.map((e) => {
            const start = new Date(e.start)
            const end = new Date(e.end)
            const hh = (d: Date) =>
              d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
            return (
              <div
                key={e.id}
                onClick={() => onOpen(e)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 70,
                    fontSize: 12,
                    color: 'var(--text-3)',
                    fontFamily: 'var(--font-mono)',
                    flexShrink: 0,
                  }}
                >
                  {hh(start)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>
                    {e.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                    {hh(start)} – {hh(end)}
                    {e.location ? ` · ${e.location}` : ''}
                    {e.recurrent ? ' · recurrente' : ''}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'var(--text-3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {String(e.category)}
                </span>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

interface HitosPanelProps {
  milestones: Milestone[]
  accent: string
}

function HitosPanel({ milestones, accent }: HitosPanelProps) {
  if (!milestones.length) {
    return (
      <div className="card">
        <EmptyState
          icon="flag"
          title="Sin hitos registrados"
          description="Los hitos marcan fechas clave del proyecto."
        />
      </div>
    )
  }
  return (
    <div className="card">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {milestones.map((m) => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                flexShrink: 0,
                background: m.status === 'done' ? accent : 'var(--surface-3)',
                border: `2px solid ${m.status === 'done' ? accent : 'var(--border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {m.status === 'done' && (
                <Icon name="check" size={10} style={{ color: 'white' }} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--text-1)',
                  textDecoration: m.status === 'done' ? 'line-through' : 'none',
                }}
              >
                {m.title}
              </span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
              {new Date(m.date).toLocaleDateString('es', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface ProgresoPanelProps {
  proj: Project
  tasks: Task[]
  timelineRow?: (typeof TEMPO_DATA.timeline)[number]
}

function ProgresoPanel({ proj, tasks, timelineRow }: ProgresoPanelProps) {
  const byCol = COL_ORDER.map((col) => ({
    col,
    count: tasks.filter((t) => t.col === col).length,
  })).filter((c) => c.count > 0)

  const total = byCol.reduce((s, c) => s + c.count, 0) || 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>
            Progreso general
          </span>
          <span style={{ fontSize: 22, fontWeight: 700, color: proj.color }}>
            {proj.progress}%
          </span>
        </div>
        <ProgressBar value={proj.progress} color={proj.color} />
        <div style={{ display: 'flex', gap: 20, marginTop: 14 }}>
          {[
            { label: 'Total tareas', val: proj.tasks },
            { label: 'Completadas', val: proj.done },
            { label: 'Pendientes', val: proj.tasks - proj.done },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)' }}>
                {s.val}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}
      >
        <div className="card">
          <div className="card-header">
            <span className="card-title">Tareas por columna</span>
          </div>
          {byCol.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Sin datos todavía.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {byCol.map((c) => (
                <div key={c.col}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>
                      {COL_LABEL[c.col]}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: COL_COLOR[c.col] }}>
                      {c.count} ({Math.round((c.count / total) * 100)}%)
                    </span>
                  </div>
                  <ProgressBar value={(c.count / total) * 100} color={COL_COLOR[c.col]} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Fases del roadmap</span>
          </div>
          {timelineRow ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {timelineRow.phases.map((ph, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: ph.done ? proj.color : 'var(--surface-3)',
                      border: `2px solid ${ph.done ? proj.color : 'var(--border)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {ph.done && <Icon name="check" size={8} style={{ color: 'white' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: ph.done ? 'var(--text-3)' : 'var(--text-1)',
                        textDecoration: ph.done ? 'line-through' : 'none',
                      }}
                    >
                      {ph.name}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>
                      {new Date(ph.start).toLocaleDateString('es', { month: 'short', day: 'numeric' })}
                      {' – '}
                      {new Date(ph.end).toLocaleDateString('es', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Este proyecto no tiene fases definidas.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface NotasPanelProps {
  value: string
  onChange: (v: string) => void
}

function NotasPanel({ value, onChange }: NotasPanelProps) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Notas del proyecto</span>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
          {value.length} caracteres
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Escribe aquí notas, ideas o contexto del proyecto..."
        style={{
          width: '100%',
          minHeight: 280,
          padding: '12px 14px',
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          color: 'var(--text-1)',
          lineHeight: 1.6,
          resize: 'vertical',
          outline: 'none',
        }}
      />
    </div>
  )
}

