import { useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import { useTasksStore } from '../stores/tasks'
import { useProjectsStore } from '../stores/projects'
import { useArchiveStore } from '../stores/archive'
import { useToastStore } from '../stores/toast'

type Tab = 'tasks' | 'projects'

export function ArchivedView() {
  const tasks = useTasksStore((s) => s.tasks)
  const projects = useProjectsStore((s) => s.projects)
  const archivedTasks = useArchiveStore((s) => s.archivedTasks)
  const archivedProjects = useArchiveStore((s) => s.archivedProjects)
  const unarchiveTask = useArchiveStore((s) => s.unarchiveTask)
  const unarchiveProject = useArchiveStore((s) => s.unarchiveProject)
  const addToast = useToastStore((s) => s.addToast)

  const [tab, setTab] = useState<Tab>('tasks')

  const archivedTaskList = useMemo(
    () => tasks.filter((t) => archivedTasks.includes(t.id)),
    [tasks, archivedTasks],
  )
  const archivedProjectList = useMemo(
    () => projects.filter((p) => archivedProjects.includes(p.id)),
    [projects, archivedProjects],
  )

  const handleRestoreTask = (id: string, title: string) => {
    unarchiveTask(id)
    addToast({ type: 'success', text: 'Tarea restaurada', sub: title })
  }
  const handleRestoreProject = (id: string, name: string) => {
    unarchiveProject(id)
    addToast({ type: 'success', text: 'Proyecto restaurado', sub: name })
  }

  const TABS: { id: Tab; label: string; icon: string; count: number }[] = [
    {
      id: 'tasks',
      label: 'Tareas archivadas',
      icon: 'check-square',
      count: archivedTaskList.length,
    },
    {
      id: 'projects',
      label: 'Proyectos archivados',
      icon: 'folder-open',
      count: archivedProjectList.length,
    },
  ]

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h1 className="view-title">Archivo</h1>
          <p className="view-subtitle">
            {archivedTaskList.length} tareas · {archivedProjectList.length} proyectos
            archivados
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 20,
          borderBottom: '1px solid var(--border)',
        }}
      >
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '10px 14px',
                border: 'none',
                background: 'none',
                fontSize: 13,
                fontWeight: 500,
                color: active ? 'var(--accent)' : 'var(--text-2)',
                borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
                marginBottom: -1,
                cursor: 'pointer',
                transition: 'color var(--transition)',
              }}
            >
              <Icon name={t.icon} size={13} />
              <span>{t.label}</span>
              <span className="badge">{t.count}</span>
            </button>
          )
        })}
      </div>

      {tab === 'tasks' && (
        <>
          {archivedTaskList.length === 0 ? (
            <EmptyState
              icon="archive"
              title="No hay tareas archivadas"
              description="Las tareas que archives aparecerán aquí. Puedes restaurarlas en cualquier momento."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {archivedTaskList.map((t) => {
                const project = projects.find((p) => p.id === t.project)
                return (
                  <div
                    key={t.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 14px',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 7,
                        background: (project?.color || 'var(--accent)') + '22',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon
                        name="check-square"
                        size={13}
                        style={{ color: project?.color || 'var(--accent)' }}
                      />
                    </div>
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
                        {t.title}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: 'var(--text-3)',
                          marginTop: 2,
                        }}
                      >
                        {project?.name || t.project} · {t.col}
                      </div>
                    </div>
                    <button
                      className="icon-btn"
                      onClick={() => handleRestoreTask(t.id, t.title)}
                    >
                      <Icon name="rotate-ccw" size={12} />
                      <span>Restaurar</span>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {tab === 'projects' && (
        <>
          {archivedProjectList.length === 0 ? (
            <EmptyState
              icon="archive"
              title="No hay proyectos archivados"
              description="Los proyectos que archives aparecerán aquí. Podrás restaurarlos cuando quieras."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {archivedProjectList.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      background: p.color + '22',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon name={p.icon} size={13} style={{ color: p.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--text-1)',
                      }}
                    >
                      {p.fullName}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--text-3)',
                        marginTop: 2,
                      }}
                    >
                      {p.phase} · {p.progress}% · {p.done}/{p.tasks} tareas
                    </div>
                  </div>
                  <button
                    className="icon-btn"
                    onClick={() => handleRestoreProject(p.id, p.fullName)}
                  >
                    <Icon name="rotate-ccw" size={12} />
                    <span>Restaurar</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '80px 20px',
        color: 'var(--text-3)',
      }}
    >
      <Icon name={icon} size={40} style={{ opacity: 0.5, marginBottom: 14 }} />
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4, color: 'var(--text-2)' }}>
        {title}
      </div>
      <div style={{ fontSize: 12, maxWidth: 340, margin: '0 auto' }}>{description}</div>
    </div>
  )
}
