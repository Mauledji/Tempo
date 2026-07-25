import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Icon } from '../components/Icon'
import { useEventsStore } from '../stores/events'
import { useModalStore } from '../stores/modal'
import { CAT_COLOR, CAT_LABELS } from '../constants/ui'
import { TODAY, toDateKey } from '../lib/date'
import type { CalendarEvent } from '../data/mock'

const HOUR_H = 60
const START_HOUR = 0
const END_HOUR = 24

function timeToMinutes(iso: string) {
  const [, t] = iso.split('T')
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function formatTimeRange(ev: CalendarEvent) {
  return `${ev.start.split('T')[1].slice(0, 5)}–${ev.end.split('T')[1].slice(0, 5)}`
}

function catColor(cat: string) {
  return CAT_COLOR[cat] || '#4a7759'
}
function catBg(cat: string) {
  return catColor(cat) + '22'
}

type LaidEvent = { event: CalendarEvent; col: number; totalCols: number }

function layoutEvents(dayEvents: CalendarEvent[]): LaidEvent[] {
  if (dayEvents.length === 0) return []
  const parsed = dayEvents
    .map((ev) => ({ ev, start: timeToMinutes(ev.start), end: timeToMinutes(ev.end) }))
    .sort((a, b) => a.start - b.start || a.end - b.end)
  const result: LaidEvent[] = []
  let cluster: typeof parsed = []
  let clusterEnd = 0
  const flush = () => {
    if (cluster.length === 0) return
    const colEnds: number[] = []
    const assigned: number[] = []
    for (const item of cluster) {
      let chosen = -1
      for (let i = 0; i < colEnds.length; i++) {
        if (colEnds[i] <= item.start) {
          chosen = i
          colEnds[i] = item.end
          break
        }
      }
      if (chosen === -1) {
        chosen = colEnds.length
        colEnds.push(item.end)
      }
      assigned.push(chosen)
    }
    const totalCols = colEnds.length
    cluster.forEach((item, i) =>
      result.push({ event: item.ev, col: assigned[i], totalCols }),
    )
    cluster = []
  }
  for (const item of parsed) {
    if (cluster.length === 0) {
      cluster.push(item)
      clusterEnd = item.end
    } else if (item.start < clusterEnd) {
      cluster.push(item)
      clusterEnd = Math.max(clusterEnd, item.end)
    } else {
      flush()
      cluster.push(item)
      clusterEnd = item.end
    }
  }
  flush()
  return result
}

export function DailyView() {
  const events = useEventsStore((s) => s.events)
  const openModal = useModalStore((s) => s.open)
  const navigate = useNavigate()

  const [dateOffset, setDateOffset] = useState(0)
  const [nowTs, setNowTs] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])
  const now = useMemo(() => new Date(nowTs), [nowTs])
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  const currentDate = useMemo(() => {
    const d = new Date(TODAY)
    d.setDate(d.getDate() + dateOffset)
    return d
  }, [dateOffset])

  const dateKey = toDateKey(currentDate)
  const dateLabel = currentDate.toLocaleDateString('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const isToday = currentDate.toDateString() === TODAY.toDateString()
  const dayEvents = events.filter((e) => e.start.startsWith(dateKey))
  const laid = layoutEvents(dayEvents)

  const totalHeight = (END_HOUR - START_HOUR) * HOUR_H

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
          <h1 className="view-title">Día</h1>
          <p className="view-subtitle" style={{ textTransform: 'capitalize' }}>
            {dateLabel} · {dayEvents.length} eventos
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 10, marginRight: 8 }}>
            {Object.entries(CAT_LABELS).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: catColor(k),
                  }}
                />
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{v}</span>
              </div>
            ))}
          </div>
          <button
            className="btn-primary"
            onClick={() => openModal({ type: 'new-event' })}
          >
            <Icon name="plus" size={14} />
            <span>Nuevo evento</span>
          </button>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              className="icon-btn"
              onClick={() => setDateOffset((d) => d - 1)}
            >
              <Icon name="chevron-left" size={16} />
            </button>
            <button className="icon-btn" onClick={() => setDateOffset(0)}>
              Hoy
            </button>
            <button
              className="icon-btn"
              onClick={() => setDateOffset((d) => d + 1)}
            >
              <Icon name="chevron-right" size={16} />
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px 28px 28px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '56px 1fr',
            position: 'relative',
          }}
        >
          {/* Hour labels */}
          <div>
            {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR).map(
              (h) => (
                <div
                  key={h}
                  style={{
                    height: HOUR_H,
                    textAlign: 'right',
                    paddingRight: 10,
                    paddingTop: 2,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--text-3)',
                      fontWeight: 500,
                    }}
                  >
                    {String(h).padStart(2, '0')}:00
                  </span>
                </div>
              ),
            )}
          </div>

          {/* Event column */}
          <div
            style={{
              position: 'relative',
              borderLeft: '1px solid var(--border)',
              height: totalHeight,
            }}
          >
            {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR).map(
              (h) => (
                <div
                  key={h}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: (h - START_HOUR) * HOUR_H,
                    height: HOUR_H,
                    borderBottom: '1px dashed var(--border)',
                  }}
                >
                  {/* half-hour tick */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: HOUR_H / 2,
                      borderTop: '1px dotted var(--border)',
                      opacity: 0.5,
                    }}
                  />
                </div>
              ),
            )}

            {laid.map(({ event: ev, col, totalCols }) => {
              const startMin = timeToMinutes(ev.start)
              const endMin = timeToMinutes(ev.end)
              const top = ((startMin - START_HOUR * 60) / 60) * HOUR_H
              const height = Math.max(((endMin - startMin) / 60) * HOUR_H - 2, 22)
              const color = catColor(ev.category)
              const widthPct = 100 / totalCols
              const gap = 4
              return (
                <div
                  key={ev.id}
                  title={`${ev.title}\n${formatTimeRange(ev)}${
                    ev.location ? `\n${ev.location}` : ''
                  }${ev.notes ? `\n\n${ev.notes}` : ''}`}
                  onClick={() =>
                    navigate({
                      to: '/calendario/$eventId',
                      params: { eventId: ev.id },
                    })
                  }
                  style={{
                    position: 'absolute',
                    left: `calc(${col * widthPct}% + ${gap}px)`,
                    width: `calc(${widthPct}% - ${gap * 2}px)`,
                    top,
                    height,
                    background: catBg(ev.category),
                    border: `1px solid ${color}44`,
                    borderLeft: `3px solid ${color}`,
                    borderRadius: 8,
                    padding: '6px 10px',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    transition: 'transform 0.15s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = 'translateY(-1px)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = 'translateY(0)')
                  }
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color,
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {ev.title}
                  </div>
                  {height > 36 && (
                    <div
                      style={{
                        fontSize: 11,
                        color: color + 'bb',
                        marginTop: 2,
                      }}
                    >
                      {formatTimeRange(ev)}
                    </div>
                  )}
                  {height > 60 && ev.location && (
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
              )
            })}

            {isToday && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: (nowMinutes / 60) * HOUR_H,
                  height: 0,
                  borderTop: '1.5px solid #ef4444',
                  zIndex: 5,
                  pointerEvents: 'none',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: -6,
                    top: -6,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: '#ef4444',
                  }}
                />
              </div>
            )}

            {dayEvents.length === 0 && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 12,
                  pointerEvents: 'none',
                }}
              >
                <Icon
                  name="calendar"
                  size={32}
                  style={{ color: 'var(--text-3)', opacity: 0.5 }}
                />
                <div style={{ fontSize: 13, color: 'var(--text-3)' }}>
                  Sin eventos programados
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
