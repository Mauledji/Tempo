import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Icon } from '../components/Icon'
import { useEventsStore } from '../stores/events'
import { useProjectsStore } from '../stores/projects'
import { useModalStore } from '../stores/modal'
import { CAT_COLOR, CAT_LABELS } from '../constants/ui'
import { TODAY } from '../lib/date'
import type { CalendarEvent } from '../data/mock'

function catColor(cat: string) {
  return CAT_COLOR[cat] || '#4a7759'
}
function catBg(cat: string) {
  return catColor(cat) + '22'
}
function formatTimeRange(ev: CalendarEvent) {
  return `${ev.start.split('T')[1].slice(0, 5)}–${ev.end.split('T')[1].slice(0, 5)}`
}

function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString()
}

function dayLabel(d: Date) {
  if (sameDay(d, TODAY)) return 'Hoy'
  const tomorrow = new Date(TODAY)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (sameDay(d, tomorrow)) return 'Mañana'
  return d.toLocaleDateString('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function AgendaView() {
  const events = useEventsStore((s) => s.events)
  const projects = useProjectsStore((s) => s.projects)
  const openModal = useModalStore((s) => s.open)
  const navigate = useNavigate()

  const [catFilter, setCatFilter] = useState<string>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [showPast, setShowPast] = useState(false)

  const matchesProject = (ev: CalendarEvent, projId: string) => {
    const proj = projects.find((p) => p.id === projId)
    if (!proj) return false
    const t = ev.title.toLowerCase()
    return t.includes(proj.name.toLowerCase()) || t.includes(proj.id.toLowerCase())
  }

  const filtered = useMemo(() => {
    return events.filter((ev) => {
      const d = new Date(ev.start.split('T')[0])
      if (!showPast && d < TODAY && !sameDay(d, TODAY)) return false
      if (catFilter !== 'all' && ev.category !== catFilter) return false
      if (projectFilter !== 'all' && !matchesProject(ev, projectFilter)) return false
      return true
    })
  }, [events, catFilter, projectFilter, showPast, projects])

  const grouped = useMemo(() => {
    const groups: Record<string, CalendarEvent[]> = {}
    for (const ev of filtered) {
      const key = ev.start.split('T')[0]
      if (!groups[key]) groups[key] = []
      groups[key].push(ev)
    }
    const sortedKeys = Object.keys(groups).sort()
    return sortedKeys.map((k) => ({
      key: k,
      date: new Date(k),
      events: groups[k].sort((a, b) => a.start.localeCompare(b.start)),
    }))
  }, [filtered])

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h1 className="view-title">Agenda</h1>
          <p className="view-subtitle">
            {filtered.length} eventos · {grouped.length} días
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            className="filter-select"
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
          >
            <option value="all">Todas las categorías</option>
            {Object.entries(CAT_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="all">Todos los proyectos</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            className={`icon-btn ${showPast ? '' : ''}`}
            onClick={() => setShowPast((v) => !v)}
            style={
              showPast
                ? { background: 'var(--accent-subtle)', color: 'var(--accent)' }
                : undefined
            }
          >
            <Icon name="history" size={13} />
            <span>{showPast ? 'Ocultar pasados' : 'Ver pasados'}</span>
          </button>
          <button
            className="btn-primary"
            onClick={() => openModal({ type: 'new-event' })}
          >
            <Icon name="plus" size={14} />
            <span>Nuevo evento</span>
          </button>
        </div>
      </div>

      {grouped.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            color: 'var(--text-3)',
          }}
        >
          <Icon
            name="calendar-x"
            size={36}
            style={{ opacity: 0.5, marginBottom: 12 }}
          />
          <div style={{ fontSize: 14, fontWeight: 500 }}>Sin eventos</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>
            Ajusta los filtros o crea un evento nuevo.
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {grouped.map((g) => {
          const isPast = g.date < TODAY && !sameDay(g.date, TODAY)
          const isToday = sameDay(g.date, TODAY)
          return (
            <div key={g.key}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 10,
                  paddingBottom: 6,
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isToday ? 'var(--accent)' : 'var(--surface-2)',
                    color: isToday ? 'var(--accent-text)' : 'var(--text-1)',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 14, lineHeight: 1 }}>
                    {g.date.getDate()}
                  </span>
                  <span style={{ fontSize: 9, textTransform: 'uppercase', opacity: 0.9 }}>
                    {g.date.toLocaleDateString('es', { month: 'short' })}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--text-1)',
                      textTransform: 'capitalize',
                    }}
                  >
                    {dayLabel(g.date)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                    {g.events.length} evento{g.events.length !== 1 ? 's' : ''}
                    {isPast && ' · pasado'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {g.events.map((ev) => {
                  const color = catColor(ev.category)
                  return (
                    <button
                      key={ev.id}
                      onClick={() =>
                        navigate({
                          to: '/calendario/$eventId',
                          params: { eventId: ev.id },
                        })
                      }
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '100px 1fr auto',
                        gap: 14,
                        alignItems: 'center',
                        padding: '10px 14px',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderLeft: `3px solid ${color}`,
                        borderRadius: 8,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s',
                        opacity: isPast ? 0.65 : 1,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = color + '66'
                        e.currentTarget.style.borderLeftColor = color
                        e.currentTarget.style.background = catBg(ev.category)
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)'
                        e.currentTarget.style.borderLeftColor = color
                        e.currentTarget.style.background = 'var(--surface)'
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color,
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {formatTimeRange(ev)}
                      </span>
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
                          {ev.title}
                        </div>
                        {ev.location && (
                          <div
                            style={{
                              fontSize: 11,
                              color: 'var(--text-3)',
                              marginTop: 2,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Icon name="map-pin" size={10} />
                            {ev.location}
                          </div>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 20,
                          background: catBg(ev.category),
                          color,
                        }}
                      >
                        {CAT_LABELS[ev.category] || ev.category}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
