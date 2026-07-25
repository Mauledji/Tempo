import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Icon } from '../components/Icon'
import { EmptyState } from '../components/shared/EmptyState'
import { CalendarSkeleton } from '../components/shared/Skeleton'
import { useEventsStore } from '../stores/events'
import { useModalStore } from '../stores/modal'
import { CAT_COLOR, CAT_LABELS } from '../constants/ui'
import { DAYS_ES, MONTHS_ES, toDateKey } from '../lib/date'
import { useFakeLoading } from '../lib/useFakeLoading'
import type { CalendarEvent } from '../data/mock'

type Mode = 'week' | 'month'

const BASE = new Date(2026, 3, 19)
const HOURS = Array.from({ length: 16 }, (_, i) => i + 6)
const SLOT_H = 56
const HOUR_START = 6
const HOUR_END = 22

function catColor(cat: string) {
  return CAT_COLOR[cat] || '#4a7759'
}
function catBg(cat: string) {
  return catColor(cat) + '22'
}

function timeToMinutes(iso: string) {
  const [, t] = iso.split('T')
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
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
    cluster.forEach((item, i) => {
      result.push({ event: item.ev, col: assigned[i], totalCols })
    })
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

function eventTopHeight(ev: CalendarEvent) {
  const startMin = timeToMinutes(ev.start)
  const endMin = timeToMinutes(ev.end)
  const startH = startMin / 60
  const endH = endMin / 60
  const top = (startH - HOUR_START) * SLOT_H
  const height = Math.max((endH - startH) * SLOT_H - 2, 20)
  return { top, height }
}

function formatTimeRange(ev: CalendarEvent) {
  return `${ev.start.split('T')[1].slice(0, 5)}–${ev.end.split('T')[1].slice(0, 5)}`
}

export function CalendarView() {
  const events = useEventsStore((s) => s.events)
  const openModal = useModalStore((s) => s.open)
  const navigate = useNavigate()

  const [mode, setMode] = useState<Mode>('week')
  const loading = useFakeLoading('calendar')
  const [weekOffset, setWeekOffset] = useState(0)
  const [monthOffset, setMonthOffset] = useState(0)

  // Live "now" tick — re-render every minute so the red line advances
  const [nowTs, setNowTs] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])
  const now = useMemo(() => new Date(nowTs), [nowTs])
  const nowHours = now.getHours() + now.getMinutes() / 60
  const nowWithinRange = nowHours >= HOUR_START && nowHours < HOUR_END
  const nowTop = (nowHours - HOUR_START) * SLOT_H

  const getWeekStart = (offset: number) => {
    const d = new Date(BASE)
    d.setDate(d.getDate() - d.getDay() + offset * 7)
    return d
  }

  const weekStart = getWeekStart(weekOffset)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  const eventsForDay = (dateStr: string) =>
    events.filter((e) => e.start.startsWith(dateStr))

  const weekHasEvents = weekDays.some((d) => eventsForDay(toDateKey(d)).length > 0)

  const monthDate = new Date(BASE.getFullYear(), BASE.getMonth() + monthOffset, 1)
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getDay()
  const daysInMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0,
  ).getDate()
  const calCells: (number | null)[] = Array.from(
    { length: firstDay + daysInMonth },
    (_, i) => (i < firstDay ? null : i - firstDay + 1),
  )
  while (calCells.length % 7 !== 0) calCells.push(null)

  const monthEventsForDay = (day: number | null) => {
    if (!day) return []
    const dateStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(
      2,
      '0',
    )}-${String(day).padStart(2, '0')}`
    return events.filter((e) => e.start.startsWith(dateStr))
  }

  const isToday = (day: number | null) =>
    !!day &&
    monthDate.getMonth() === BASE.getMonth() &&
    monthDate.getFullYear() === BASE.getFullYear() &&
    day === BASE.getDate()

  const weekLabel = () => {
    const end = new Date(weekStart)
    end.setDate(end.getDate() + 6)
    if (weekStart.getMonth() === end.getMonth())
      return `${weekStart.getDate()}–${end.getDate()} de ${
        MONTHS_ES[weekStart.getMonth()]
      } ${weekStart.getFullYear()}`
    return `${weekStart.getDate()} ${MONTHS_ES[weekStart.getMonth()]} – ${end.getDate()} ${
      MONTHS_ES[end.getMonth()]
    }`
  }

  if (loading) {
    return (
      <div
        className="view-container fill"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <CalendarSkeleton />
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
          <h1 className="view-title">Calendario</h1>
          <p className="view-subtitle">
            {mode === 'week'
              ? weekLabel()
              : `${MONTHS_ES[monthDate.getMonth()]} ${monthDate.getFullYear()}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="cal-legend">
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
          <div className="toggle-group">
            <button
              className={`toggle-btn ${mode === 'week' ? 'active' : ''}`}
              onClick={() => setMode('week')}
            >
              Semana
            </button>
            <button
              className={`toggle-btn ${mode === 'month' ? 'active' : ''}`}
              onClick={() => setMode('month')}
            >
              Mes
            </button>
          </div>
          <button className="btn-primary" onClick={() => openModal({ type: 'new-event' })}>
            <Icon name="plus" size={14} />
            <span>Nuevo evento</span>
          </button>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              className="icon-btn"
              onClick={() =>
                mode === 'week'
                  ? setWeekOffset((w) => w - 1)
                  : setMonthOffset((m) => m - 1)
              }
            >
              <Icon name="chevron-left" size={16} />
            </button>
            <button
              className="icon-btn"
              onClick={() => (mode === 'week' ? setWeekOffset(0) : setMonthOffset(0))}
            >
              Hoy
            </button>
            <button
              className="icon-btn"
              onClick={() =>
                mode === 'week'
                  ? setWeekOffset((w) => w + 1)
                  : setMonthOffset((m) => m + 1)
              }
            >
              <Icon name="chevron-right" size={16} />
            </button>
          </div>
        </div>
      </div>

      {mode === 'week' && (
        <div
          style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}
        >
          {!weekHasEvents && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 5,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.10)',
                  pointerEvents: 'auto',
                }}
              >
                <EmptyState
                  icon="calendar"
                  title="Semana libre"
                  description="No hay eventos agendados para esta semana."
                  actionLabel="Nuevo evento"
                  onAction={() => openModal({ type: 'new-event' })}
                />
              </div>
            </div>
          )}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '48px repeat(7, 1fr)',
              borderBottom: '1px solid var(--border)',
              flexShrink: 0,
            }}
          >
            <div />
            {weekDays.map((d, i) => {
              const isNow = d.toDateString() === BASE.toDateString()
              return (
                <div key={i} style={{ padding: '10px 8px', textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--text-3)',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {DAYS_ES[d.getDay()]}
                  </div>
                  <div
                    style={{
                      display: 'inline-flex',
                      width: 28,
                      height: 28,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 4,
                      borderRadius: '50%',
                      fontSize: 14,
                      fontWeight: isNow ? 600 : 400,
                      background: isNow ? 'var(--accent)' : 'transparent',
                      color: isNow ? 'white' : 'var(--text-1)',
                    }}
                  >
                    {d.getDate()}
                  </div>
                </div>
              )
            })}
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: '48px repeat(7, 1fr)',
            }}
          >
            <div>
              {HOURS.map((h) => (
                <div
                  key={h}
                  style={{
                    height: SLOT_H,
                    borderBottom: '1px solid var(--border)',
                    paddingTop: 4,
                    paddingRight: 8,
                    textAlign: 'right',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 500 }}>
                    {h}:00
                  </span>
                </div>
              ))}
            </div>

            {weekDays.map((d, di) => {
              const dateStr = toDateKey(d)
              const dayEvents = eventsForDay(dateStr)
              const laid = layoutEvents(dayEvents)
              const isTodayCol = d.toDateString() === BASE.toDateString()
              return (
                <div
                  key={di}
                  style={{
                    position: 'relative',
                    borderLeft: '1px solid var(--border)',
                    borderRight: di === 6 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      style={{
                        height: SLOT_H,
                        borderBottom: '1px solid var(--border)',
                        borderBottomStyle: 'dashed',
                      }}
                    />
                  ))}
                  {laid.map(({ event: ev, col, totalCols }) => {
                    const { top, height } = eventTopHeight(ev)
                    const color = catColor(ev.category)
                    const widthPct = 100 / totalCols
                    const gap = 2
                    return (
                      <div
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate({
                            to: '/calendario/$eventId',
                            params: { eventId: ev.id },
                          })
                        }}
                        title={`${ev.title}\n${formatTimeRange(ev)}${
                          ev.location ? `\n${ev.location}` : ''
                        }${ev.notes ? `\n\n${ev.notes}` : ''}`}
                        style={{
                          position: 'absolute',
                          left: `calc(${col * widthPct}% + ${gap}px)`,
                          width: `calc(${widthPct}% - ${gap * 2}px)`,
                          top,
                          height,
                          background: catBg(ev.category),
                          border: `1px solid ${color}44`,
                          borderLeft: `3px solid ${color}`,
                          borderRadius: 6,
                          padding: '3px 6px',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          transition: 'opacity 0.15s, transform 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color,
                            lineHeight: 1.2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {ev.title}
                        </div>
                        {height > 30 && (
                          <div style={{ fontSize: 10, color: color + 'bb' }}>
                            {formatTimeRange(ev)}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {isTodayCol && nowWithinRange && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: nowTop,
                        height: 0,
                        borderTop: '1.5px solid #ef4444',
                        zIndex: 2,
                        pointerEvents: 'none',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          left: -5,
                          top: -5,
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: '#ef4444',
                        }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {mode === 'month' && (
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            padding: '0 0 20px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7,1fr)',
              borderBottom: '1px solid var(--border)',
              flexShrink: 0,
            }}
          >
            {DAYS_ES.map((d) => (
              <div
                key={d}
                style={{
                  padding: '8px 0',
                  textAlign: 'center',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {d}
              </div>
            ))}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7,1fr)',
              flex: 1,
            }}
          >
            {calCells.map((day, idx) => {
              const evts = monthEventsForDay(day)
              const today = isToday(day)
              return (
                <div
                  key={idx}
                  style={{
                    borderRight: '1px solid var(--border)',
                    borderBottom: '1px solid var(--border)',
                    padding: '6px 8px',
                    minHeight: 90,
                    background: today ? 'var(--accent-subtle)' : 'transparent',
                  }}
                >
                  {day && (
                    <>
                      <div
                        style={{
                          display: 'inline-flex',
                          width: 22,
                          height: 22,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          fontSize: 12,
                          fontWeight: today ? 600 : 400,
                          background: today ? 'var(--accent)' : 'transparent',
                          color: today ? 'white' : 'var(--text-1)',
                          marginBottom: 4,
                        }}
                      >
                        {day}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {evts.slice(0, 3).map((e) => (
                          <div
                            key={e.id}
                            onClick={() =>
                              navigate({
                                to: '/calendario/$eventId',
                                params: { eventId: e.id },
                              })
                            }
                            title={`${e.title}\n${formatTimeRange(e)}${
                              e.location ? `\n${e.location}` : ''
                            }`}
                            style={{
                              fontSize: 10,
                              fontWeight: 500,
                              color: catColor(e.category),
                              background: catBg(e.category),
                              borderRadius: 3,
                              padding: '1px 4px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              cursor: 'pointer',
                            }}
                          >
                            {e.title}
                          </div>
                        ))}
                        {evts.length > 3 && (
                          <div style={{ fontSize: 10, color: 'var(--text-3)' }}>
                            +{evts.length - 3} más
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
