import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { EmptyState } from '../components/shared/EmptyState'
import { useTasksStore } from '../stores/tasks'
import { useEventsStore } from '../stores/events'
import { useProjectsStore } from '../stores/projects'
import { useNotesStore } from '../stores/notes'
import { useProjectNotesStore } from '../stores/projectNotes'
import { useNavigate } from '@tanstack/react-router'
import { CAT_COLOR } from '../constants/ui'
import { VIEW_PATH } from '../constants/nav'
import type { Task, CalendarEvent, Project } from '../data/mock'

type ResultGroup = 'tasks' | 'events' | 'projects' | 'notes'

interface NoteResult {
  kind: 'daily' | 'project'
  key: string
  label: string
  excerpt: string
}

function matches(haystack: string | undefined, needle: string) {
  if (!haystack) return false
  return haystack.toLowerCase().includes(needle.toLowerCase())
}

function excerptAround(text: string, needle: string, radius = 50) {
  const i = text.toLowerCase().indexOf(needle.toLowerCase())
  if (i === -1) return text.slice(0, radius * 2)
  const start = Math.max(0, i - radius)
  const end = Math.min(text.length, i + needle.length + radius)
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '')
}

export function GlobalSearchView() {
  const tasks = useTasksStore((s) => s.tasks)
  const events = useEventsStore((s) => s.events)
  const projects = useProjectsStore((s) => s.projects)
  const dailyNotes = useNotesStore((s) => s.notes)
  const projectNotes = useProjectNotesStore((s) => s.notes)
  const navigate = useNavigate()

  const [q, setQ] = useState('')
  const [active, setActive] = useState<ResultGroup | 'all'>('all')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const results = useMemo(() => {
    const needle = q.trim()
    if (!needle) {
      return {
        tasks: [] as Task[],
        events: [] as CalendarEvent[],
        projects: [] as Project[],
        notes: [] as NoteResult[],
      }
    }
    const taskHits = tasks.filter(
      (t) =>
        matches(t.title, needle) ||
        matches(t.description, needle) ||
        t.tags.some((tag) => matches(tag, needle)),
    )
    const eventHits = events.filter(
      (e) =>
        matches(e.title, needle) ||
        matches(e.notes, needle) ||
        matches(e.location, needle),
    )
    const projectHits = projects.filter(
      (p) =>
        matches(p.name, needle) ||
        matches(p.fullName, needle) ||
        matches(p.description, needle) ||
        matches(p.phase, needle),
    )
    const noteHits: NoteResult[] = []
    for (const [k, v] of Object.entries(dailyNotes)) {
      if (matches(v, needle)) {
        noteHits.push({
          kind: 'daily',
          key: k,
          label: `Nota del ${new Date(k).toLocaleDateString('es', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}`,
          excerpt: excerptAround(v, needle),
        })
      }
    }
    for (const [projId, v] of Object.entries(projectNotes)) {
      if (matches(v, needle)) {
        const proj = projects.find((p) => p.id === projId)
        noteHits.push({
          kind: 'project',
          key: projId,
          label: `Notas de ${proj?.name || projId}`,
          excerpt: excerptAround(v, needle),
        })
      }
    }
    return {
      tasks: taskHits.slice(0, 15),
      events: eventHits.slice(0, 15),
      projects: projectHits.slice(0, 15),
      notes: noteHits.slice(0, 15),
    }
  }, [q, tasks, events, projects, dailyNotes, projectNotes])

  const totalCount =
    results.tasks.length +
    results.events.length +
    results.projects.length +
    results.notes.length

  const shouldShow = (g: ResultGroup) => active === 'all' || active === g

  const TABS: Array<{ id: ResultGroup | 'all'; label: string; count: number }> = [
    { id: 'all', label: 'Todo', count: totalCount },
    { id: 'tasks', label: 'Tareas', count: results.tasks.length },
    { id: 'events', label: 'Eventos', count: results.events.length },
    { id: 'projects', label: 'Proyectos', count: results.projects.length },
    { id: 'notes', label: 'Notas', count: results.notes.length },
  ]

  return (
    <div className="view-container" style={{ maxWidth: 820, margin: '0 auto' }}>
      <div style={{ paddingTop: 24 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '16px 20px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            boxShadow: 'var(--shadow)',
          }}
        >
          <Icon name="search" size={20} style={{ color: 'var(--text-3)' }} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar en tareas, eventos, proyectos y notas…"
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: 17,
              color: 'var(--text-1)',
              outline: 'none',
              fontFamily: 'var(--font)',
            }}
          />
          {q && (
            <button
              className="icon-btn"
              onClick={() => setQ('')}
              style={{ padding: '4px 8px' }}
            >
              <Icon name="x" size={13} />
            </button>
          )}
        </div>

        {q && (
          <div
            style={{
              marginTop: 16,
              display: 'flex',
              gap: 4,
              flexWrap: 'wrap',
            }}
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 500,
                  background:
                    active === t.id ? 'var(--accent-subtle)' : 'var(--surface-2)',
                  color: active === t.id ? 'var(--accent)' : 'var(--text-2)',
                  border: `1px solid ${
                    active === t.id ? 'var(--accent-subtle-border)' : 'var(--border)'
                  }`,
                  cursor: 'pointer',
                }}
              >
                {t.label} · {t.count}
              </button>
            ))}
          </div>
        )}
      </div>

      {!q && (
        <div style={{ marginTop: 32 }}>
          <EmptyState
            icon="search"
            title="Busca en todo tu espacio"
            description="Tareas, eventos, proyectos y notas · todo desde un solo sitio"
            size="lg"
          />
        </div>
      )}

      {q && totalCount === 0 && (
        <div style={{ marginTop: 32 }}>
          <EmptyState
            icon="search-x"
            title="Sin resultados"
            description={`No se encontró nada para "${q}"`}
            size="lg"
          />
        </div>
      )}

      {q && totalCount > 0 && (
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 28 }}>
          {shouldShow('tasks') && results.tasks.length > 0 && (
            <ResultSection title="Tareas" count={results.tasks.length} icon="check-square">
              {results.tasks.map((t) => {
                const project = projects.find((p) => p.id === t.project)
                return (
                  <ResultItem
                    key={t.id}
                    onClick={() =>
                      navigate({ to: '/tareas/$taskId', params: { taskId: t.id } })
                    }
                    icon="check-square"
                    iconColor={project?.color || 'var(--accent)'}
                    title={t.title}
                    subtitle={
                      project
                        ? `${project.name} · ${t.col}`
                        : t.col
                    }
                    right={t.done ? 'Hecho' : undefined}
                  />
                )
              })}
            </ResultSection>
          )}

          {shouldShow('events') && results.events.length > 0 && (
            <ResultSection title="Eventos" count={results.events.length} icon="calendar">
              {results.events.map((ev) => (
                <ResultItem
                  key={ev.id}
                  onClick={() =>
                    navigate({ to: '/calendario/$eventId', params: { eventId: ev.id } })
                  }
                  icon="calendar"
                  iconColor={CAT_COLOR[ev.category] || 'var(--accent)'}
                  title={ev.title}
                  subtitle={`${ev.start.split('T')[0]} · ${ev.start
                    .split('T')[1]
                    .slice(0, 5)}–${ev.end.split('T')[1].slice(0, 5)}`}
                  right={ev.location}
                />
              ))}
            </ResultSection>
          )}

          {shouldShow('projects') && results.projects.length > 0 && (
            <ResultSection
              title="Proyectos"
              count={results.projects.length}
              icon="folder-open"
            >
              {results.projects.map((p) => (
                <ResultItem
                  key={p.id}
                  onClick={() => navigate({ to: VIEW_PATH.projects })}
                  icon={p.icon}
                  iconColor={p.color}
                  title={p.fullName}
                  subtitle={`${p.phase} · ${p.progress}%`}
                  right={`${p.done}/${p.tasks} tareas`}
                />
              ))}
            </ResultSection>
          )}

          {shouldShow('notes') && results.notes.length > 0 && (
            <ResultSection title="Notas" count={results.notes.length} icon="file-text">
              {results.notes.map((n) => (
                <ResultItem
                  key={`${n.kind}-${n.key}`}
                  onClick={() =>
                    navigate({ to: n.kind === 'daily' ? VIEW_PATH.daily : VIEW_PATH.projects })
                  }
                  icon={n.kind === 'daily' ? 'book-open' : 'file-text'}
                  iconColor="var(--accent)"
                  title={n.label}
                  subtitle={n.excerpt}
                />
              ))}
            </ResultSection>
          )}
        </div>
      )}
    </div>
  )
}

function ResultSection({
  title,
  count,
  icon,
  children,
}: {
  title: string
  count: number
  icon: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 10,
          paddingBottom: 6,
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Icon name={icon} size={14} style={{ color: 'var(--text-3)' }} />
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
          }}
        >
          {title}
        </span>
        <span className="badge">{count}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>{children}</div>
    </div>
  )
}

function ResultItem({
  icon,
  iconColor,
  title,
  subtitle,
  right,
  onClick,
}: {
  icon: string
  iconColor: string
  title: string
  subtitle: string
  right?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: '28px 1fr auto',
        gap: 12,
        alignItems: 'center',
        padding: '10px 12px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--surface-2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--surface)'
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 7,
          background: iconColor + '22',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name={icon} size={14} style={{ color: iconColor }} />
      </div>
      <div style={{ minWidth: 0 }}>
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
          {title}
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-3)',
            marginTop: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {subtitle}
        </div>
      </div>
      {right && (
        <span
          style={{
            fontSize: 11,
            color: 'var(--text-3)',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {right}
        </span>
      )}
    </button>
  )
}
