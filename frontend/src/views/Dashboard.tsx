import { Icon } from '../components/Icon'
import { TaskRow } from '../components/shared/TaskRow'
import { ProgressBar } from '../components/shared/ProgressBar'
import { DashboardSkeleton } from '../components/shared/Skeleton'
import { useNavigate } from '@tanstack/react-router'
import { useTasksStore } from '../stores/tasks'
import { useProjectsStore } from '../stores/projects'
import { useEventsStore } from '../stores/events'
import { useModalStore } from '../stores/modal'
import { VIEW_PATH } from '../constants/nav'
import { TEMPO_DATA } from '../data/mock'
import { TODAY, toDateKey, daysUntil } from '../lib/date'
import { CAT_COLOR } from '../constants/ui'
import { useFakeLoading } from '../lib/useFakeLoading'

function getGreeting(now: Date = new Date()): string {
  const h = now.getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function formatTodayLong(now: Date = new Date()): string {
  const formatted = now.toLocaleDateString('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function Dashboard() {
  const tasks = useTasksStore((s) => s.tasks)
  const projects = useProjectsStore((s) => s.projects)
  const events = useEventsStore((s) => s.events)
  const navigate = useNavigate()
  const openModal = useModalStore((s) => s.open)
  const loading = useFakeLoading('dashboard')

  if (loading) return <DashboardSkeleton />

  const todayTasks = tasks.filter((t) => t.col === 'today' && !t.done)
  const highTasks = todayTasks.filter((t) => t.priority === 'high')
  const otherTasks = todayTasks.filter((t) => t.priority !== 'high')

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(TODAY)
    d.setDate(d.getDate() + i)
    const dateStr = toDateKey(d)
    const evts = events.filter((e) => e.start.startsWith(dateStr))
    return {
      date: d,
      label:
        i === 0
          ? 'Hoy'
          : i === 1
          ? 'Mañana'
          : d.toLocaleDateString('es', { weekday: 'short' }),
      events: evts,
      dateStr,
    }
  })

  const upcomingMilestones = TEMPO_DATA.milestones
    .filter((m) => m.status === 'upcoming')
    .slice(0, 4)

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h1 className="view-title">{getGreeting()}, {TEMPO_DATA.user.name} 👋</h1>
          <p className="view-subtitle">
            {formatTodayLong()} · Racha {TEMPO_DATA.streak} días 🔥
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => openModal({ type: 'new-task', initialCol: 'today' })}
        >
          <Icon name="plus" size={14} />
          <span>Agregar</span>
        </button>
      </div>

      <div className="dashboard-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="sun" size={16} style={{ color: 'var(--accent)' }} />
                <span className="card-title">Hoy</span>
              </div>
              <span className="badge">{todayTasks.length} tareas</span>
            </div>

            {highTasks.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div className="section-label">PRIORIDAD ALTA</div>
                {highTasks.map((t) => (
                  <TaskRow key={t.id} task={t} />
                ))}
              </div>
            )}
            {otherTasks.length > 0 && (
              <div>
                <div className="section-label">RESTO DEL DÍA</div>
                {otherTasks.map((t) => (
                  <TaskRow key={t.id} task={t} />
                ))}
              </div>
            )}
            <button
              className="inline-add"
              onClick={() => openModal({ type: 'new-task', initialCol: 'today' })}
            >
              <Icon name="plus" size={13} />
              <span>Agregar tarea</span>
            </button>
          </div>

          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="calendar" size={16} style={{ color: 'var(--accent)' }} />
                <span className="card-title">Próximos 7 días</span>
              </div>
              <button className="text-btn" onClick={() => navigate({ to: VIEW_PATH.calendar })}>
                Ver calendario →
              </button>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 8,
                overflowX: 'auto',
                paddingBottom: 4,
              }}
            >
              {days.map((d) => (
                <div
                  key={d.dateStr}
                  className={`day-pill ${d.label === 'Hoy' ? 'today' : ''}`}
                  onClick={() => navigate({ to: VIEW_PATH.calendar })}
                  style={{ minWidth: 48, flexShrink: 0 }}
                >
                  <div className="day-pill-label">{d.label}</div>
                  <div className="day-pill-num">{d.date.getDate()}</div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 3,
                      marginTop: 4,
                    }}
                  >
                    {d.events.slice(0, 3).map((e) => (
                      <div
                        key={e.id}
                        style={{
                          width: 24,
                          height: 3,
                          borderRadius: 2,
                          background: CAT_COLOR[e.category] || 'var(--accent)',
                          opacity: 0.8,
                        }}
                      />
                    ))}
                    {d.events.length === 0 && (
                      <div
                        style={{
                          width: 24,
                          height: 3,
                          borderRadius: 2,
                          background: 'var(--surface-3)',
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="folder-open" size={16} style={{ color: 'var(--accent)' }} />
                <span className="card-title">Proyectos activos</span>
              </div>
              <button className="text-btn" onClick={() => navigate({ to: VIEW_PATH.projects })}>
                Ver todos →
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {projects.map((p) => (
                <div key={p.id}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 6,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        className="proj-dot"
                        style={{ background: p.color, width: 8, height: 8 }}
                      />
                      <span
                        style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}
                      >
                        {p.name}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{p.phase}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: p.color }}>
                      {p.progress}%
                    </span>
                  </div>
                  <ProgressBar value={p.progress} color={p.color} />
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="flag" size={16} style={{ color: 'var(--accent)' }} />
                <span className="card-title">Hitos próximos</span>
              </div>
            </div>
            <div style={{ position: 'relative', paddingLeft: 12 }}>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 4,
                  bottom: 4,
                  width: 2,
                  background: 'var(--border)',
                  borderRadius: 2,
                }}
              />
              {upcomingMilestones.map((m) => {
                const proj = projects.find((p) => p.id === m.project)
                const d = daysUntil(m.date)
                return (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      paddingBottom: 14,
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        left: -15,
                        top: 4,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: proj?.color || 'var(--accent)',
                        border: '2px solid var(--surface)',
                      }}
                    />
                    <div style={{ paddingLeft: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>
                        {m.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                        {proj?.name}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color:
                            d <= 14 ? '#e05252' : d <= 30 ? '#e09050' : 'var(--text-2)',
                        }}
                      >
                        {d === 0 ? 'Hoy' : `${d}d`}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                        {new Date(m.date).toLocaleDateString('es', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
