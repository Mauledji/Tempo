import { useState } from 'react'
import { useProjectsStore } from '../stores/projects'
import { TEMPO_DATA } from '../data/mock'
import type { ProjectId } from '../data/mock'

type Zoom = 'week' | 'month' | 'quarter' | 'year'

interface ZoomConfig {
  days: number
  cellDays: number
  cellW: number
  fmt: (d: Date) => string | number
}

const MONTHS_SHORT = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]

const ZOOM: Record<Zoom, ZoomConfig> = {
  week: {
    days: 28,
    cellDays: 1,
    cellW: 40,
    fmt: (d) => d.getDate(),
  },
  month: {
    days: 90,
    cellDays: 7,
    cellW: 60,
    fmt: (d) => `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`,
  },
  quarter: {
    days: 180,
    cellDays: 14,
    cellW: 70,
    fmt: (d) => MONTHS_SHORT[d.getMonth()],
  },
  year: {
    days: 365,
    cellDays: 30,
    cellW: 80,
    fmt: (d) =>
      `${MONTHS_SHORT[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`,
  },
}

const ZOOM_LABEL: Record<Zoom, string> = {
  week: 'Semana',
  month: 'Mes',
  quarter: 'Trimestre',
  year: 'Año',
}

const BASE = new Date('2026-04-19')

export function TimelineView() {
  const projects = useProjectsStore((s) => s.projects)
  const [zoom, setZoom] = useState<Zoom>('month')
  const cfg = ZOOM[zoom]

  const rangeStart = new Date(BASE)
  rangeStart.setDate(rangeStart.getDate() - 14)

  const totalDays = cfg.days
  const numCells = Math.ceil(totalDays / cfg.cellDays)
  const totalWidth = numCells * cfg.cellW

  const cells = Array.from({ length: numCells }, (_, i) => {
    const d = new Date(rangeStart)
    d.setDate(d.getDate() + i * cfg.cellDays)
    return d
  })

  const todayOffset =
    (((BASE.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24)) / totalDays) *
    totalWidth

  const dateToX = (dateStr: string) => {
    const d = new Date(dateStr)
    const days = (d.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24)
    return (days / totalDays) * totalWidth
  }

  const projectColor = (id: ProjectId) =>
    projects.find((p) => p.id === id)?.color || 'var(--accent)'

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
          <h1 className="view-title">Timeline</h1>
          <p className="view-subtitle">Roadmap de proyectos y certificaciones</p>
        </div>
        <div className="toggle-group">
          {(Object.keys(ZOOM) as Zoom[]).map((z) => (
            <button
              key={z}
              className={`toggle-btn ${zoom === z ? 'active' : ''}`}
              onClick={() => setZoom(z)}
            >
              {ZOOM_LABEL[z]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto', paddingBottom: 24 }}>
        <div style={{ minWidth: totalWidth + 180, paddingRight: 20 }}>
          <div
            style={{
              display: 'flex',
              marginLeft: 180,
              borderBottom: '1px solid var(--border)',
              marginBottom: 0,
            }}
          >
            {cells.map((d, i) => (
              <div
                key={i}
                style={{
                  width: cfg.cellW,
                  flexShrink: 0,
                  padding: '6px 0',
                  borderLeft: '1px solid var(--border)',
                  fontSize: 10,
                  fontWeight: 500,
                  color: 'var(--text-3)',
                  textAlign: 'center',
                  letterSpacing: '0.03em',
                }}
              >
                {cfg.fmt(d)}
              </div>
            ))}
          </div>

          {TEMPO_DATA.timeline.map((item) => {
            const color = projectColor(item.project)
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  borderBottom: '1px solid var(--border)',
                  alignItems: 'center',
                  minHeight: 52,
                }}
              >
                <div
                  style={{
                    width: 180,
                    flexShrink: 0,
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: 'var(--text-1)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.name}
                  </span>
                </div>

                <div style={{ flex: 1, position: 'relative', height: 52 }}>
                  {cells.map((_, i) => (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        left: i * cfg.cellW,
                        top: 0,
                        bottom: 0,
                        width: 1,
                        background: 'var(--border)',
                        opacity: 0.5,
                      }}
                    />
                  ))}

                  <div
                    style={{
                      position: 'absolute',
                      left: todayOffset,
                      top: 4,
                      bottom: 4,
                      width: 2,
                      background: '#ef4444',
                      opacity: 0.85,
                      borderRadius: 1,
                      zIndex: 3,
                    }}
                  />

                  {item.phases.map((phase, pi) => {
                    const x1 = dateToX(phase.start)
                    const x2 = dateToX(phase.end)
                    const w = Math.max(x2 - x1, cfg.cellW * 0.4)
                    if (x1 > totalWidth || x2 < 0) return null
                    return (
                      <div
                        key={pi}
                        style={{
                          position: 'absolute',
                          left: Math.max(0, x1),
                          width: w,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          height: 22,
                          borderRadius: 6,
                          background: phase.done ? color : color + '40',
                          border: `1px solid ${color}${phase.done ? 'ff' : '80'}`,
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: 8,
                          overflow: 'hidden',
                          zIndex: 2,
                          cursor: 'pointer',
                          transition: 'opacity 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 500,
                            color: phase.done ? 'white' : color,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {phase.name}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid var(--border)',
              alignItems: 'center',
              minHeight: 44,
              marginTop: 8,
            }}
          >
            <div style={{ width: 180, flexShrink: 0, padding: '8px 16px' }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Hitos
              </span>
            </div>
            <div style={{ flex: 1, position: 'relative', height: 44 }}>
              {cells.map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: i * cfg.cellW,
                    top: 0,
                    bottom: 0,
                    width: 1,
                    background: 'var(--border)',
                    opacity: 0.5,
                  }}
                />
              ))}
              <div
                style={{
                  position: 'absolute',
                  left: todayOffset,
                  top: 4,
                  bottom: 4,
                  width: 2,
                  background: '#ef4444',
                  opacity: 0.85,
                  borderRadius: 1,
                  zIndex: 3,
                }}
              />
              {TEMPO_DATA.milestones.map((m) => {
                const x = dateToX(m.date)
                if (x < 0 || x > totalWidth) return null
                const color = projectColor(m.project)
                return (
                  <div
                    key={m.id}
                    style={{
                      position: 'absolute',
                      left: x,
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 4,
                    }}
                  >
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 2,
                        transform: 'rotate(45deg)',
                        background: m.status === 'done' ? color : 'var(--surface)',
                        border: `2px solid ${color}`,
                        cursor: 'pointer',
                      }}
                      title={m.title}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 20,
              marginTop: 16,
              marginLeft: 180,
              paddingLeft: 8,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                color: 'var(--text-3)',
              }}
            >
              <div style={{ width: 24, height: 8, borderRadius: 3, background: 'var(--accent)' }} />
              <span>Completado</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                color: 'var(--text-3)',
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 8,
                  borderRadius: 3,
                  background: 'var(--accent)44',
                  border: '1px solid var(--accent)',
                }}
              />
              <span>En progreso</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                color: 'var(--text-3)',
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  transform: 'rotate(45deg)',
                  background: 'var(--surface)',
                  border: '2px solid var(--accent)',
                  display: 'inline-block',
                }}
              />
              <span>Hito</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                color: 'var(--text-3)',
              }}
            >
              <div style={{ width: 2, height: 16, background: '#ef4444', borderRadius: 1 }} />
              <span>Hoy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
