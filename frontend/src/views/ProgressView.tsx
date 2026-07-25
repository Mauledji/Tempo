import { Icon } from '../components/Icon'
import { ProgressBar } from '../components/shared/ProgressBar'
import { useProjectsStore } from '../stores/projects'
import { TEMPO_DATA } from '../data/mock'
import { TODAY } from '../lib/date'
import type { WeeklyStat, CategoryHours } from '../data/mock'

interface MiniBarProps {
  data: WeeklyStat[]
  color: string
}

function MiniBarChart({ data, color }: MiniBarProps) {
  const max = Math.max(...data.map((d) => d.tasks))
  return (
    <div
      style={{
        display: 'flex',
        gap: 6,
        height: 64,
        alignItems: 'flex-end',
      }}
    >
      {data.map((d, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            flex: 1,
          }}
        >
          <div
            style={{
              width: '100%',
              borderRadius: '3px 3px 0 0',
              height: Math.max((d.tasks / max) * 52, 4),
              background: i === data.length - 1 ? color : color + '60',
              transition: 'height 0.6s ease',
            }}
          />
          <span
            style={{ fontSize: 9, color: 'var(--text-3)', whiteSpace: 'nowrap' }}
          >
            {d.week}
          </span>
        </div>
      ))}
    </div>
  )
}

interface MiniLineProps {
  data: WeeklyStat[]
  color: string
}

function MiniLineChart({ data, color }: MiniLineProps) {
  const max = Math.max(...data.map((d) => d.hours))
  const W = 240
  const H = 64
  const pts = data.map((d, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - (d.hours / max) * (H - 8),
  }))
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const area = `${path} L ${W} ${H} L 0 ${H} Z`
  return (
    <svg width={W} height={H} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#areaGrad)" />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={i === pts.length - 1 ? 4 : 2.5}
          fill={i === pts.length - 1 ? color : 'var(--surface)'}
          stroke={color}
          strokeWidth="1.5"
        />
      ))}
    </svg>
  )
}

interface DonutProps {
  data: CategoryHours[]
}

function DonutChart({ data }: DonutProps) {
  const total = data.reduce((s, d) => s + d.hours, 0)
  let cumAngle = -90
  const R = 36
  const CX = 44
  const CY = 44
  const slices = data.map((d) => {
    const angle = (d.hours / total) * 360
    const start = cumAngle
    cumAngle += angle
    return { ...d, startAngle: start, sweepAngle: angle }
  })
  const polar = (cx: number, cy: number, r: number, deg: number) => ({
    x: cx + r * Math.cos((deg * Math.PI) / 180),
    y: cy + r * Math.sin((deg * Math.PI) / 180),
  })
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width={88} height={88}>
        {slices.map((s, i) => {
          const p1 = polar(CX, CY, R, s.startAngle)
          const p2 = polar(CX, CY, R, s.startAngle + s.sweepAngle - 0.5)
          const large = s.sweepAngle > 180 ? 1 : 0
          const p1i = polar(CX, CY, R - 14, s.startAngle)
          const p2i = polar(CX, CY, R - 14, s.startAngle + s.sweepAngle - 0.5)
          const d = `M ${p1.x} ${p1.y} A ${R} ${R} 0 ${large} 1 ${p2.x} ${p2.y} L ${p2i.x} ${p2i.y} A ${R - 14} ${R - 14} 0 ${large} 0 ${p1i.x} ${p1i.y} Z`
          return <path key={i} d={d} fill={s.color} opacity={0.85} />
        })}
        <text
          x={CX}
          y={CY + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontSize: 13, fontWeight: 600, fill: 'var(--text-1)' }}
        >
          {total}h
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {data.map((d) => (
          <div
            key={d.cat}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: d.color,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 12, color: 'var(--text-2)', minWidth: 60 }}>
              {d.cat}
            </span>
            <span
              style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}
            >
              {d.hours}h
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const MONTH_LABELS_ES = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
]

function intensityFor(dayIndex: number, dow: number) {
  // Deterministic pseudo-random activity: denser near the end, lighter on weekends
  const base = (dayIndex * 9301 + dow * 49297) % 233
  const weekendPenalty = dow === 0 || dow === 6 ? 40 : 0
  const recencyBoost = dayIndex > 300 ? 30 : dayIndex > 200 ? 15 : 0
  const score = base - weekendPenalty + recencyBoost
  if (score < 40) return 0
  if (score < 90) return 1
  if (score < 140) return 2
  if (score < 180) return 3
  return 4
}

function YearHeatmap() {
  const today = new Date(TODAY)
  // Anchor the grid to a Sunday exactly 52 weeks before today-start-of-week
  const end = new Date(today)
  const start = new Date(end)
  start.setDate(start.getDate() - 52 * 7 - end.getDay())

  const weeks: Array<Array<{ date: Date; intensity: number } | null>> = []
  const monthColumnLabels: Array<string | null> = []
  let lastMonth = -1
  let totalActive = 0

  for (let w = 0; w < 53; w++) {
    const col: Array<{ date: Date; intensity: number } | null> = []
    let columnMonth: number | null = null
    for (let d = 0; d < 7; d++) {
      const cell = new Date(start)
      cell.setDate(cell.getDate() + w * 7 + d)
      if (cell > today) {
        col.push(null)
        continue
      }
      const dayIndex = Math.floor(
        (cell.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      )
      const intensity = intensityFor(dayIndex, d)
      if (intensity > 0) totalActive++
      col.push({ date: cell, intensity })
      if (columnMonth === null) columnMonth = cell.getMonth()
    }
    if (columnMonth !== null && columnMonth !== lastMonth) {
      monthColumnLabels.push(MONTH_LABELS_ES[columnMonth])
      lastMonth = columnMonth
    } else {
      monthColumnLabels.push(null)
    }
    weeks.push(col)
  }

  const intensityBg = (i: number) => {
    if (i === 0) return 'var(--surface-3)'
    const alpha = [0, 0.25, 0.5, 0.75, 1][i]
    return `color-mix(in srgb, var(--accent) ${alpha * 100}%, transparent)`
  }

  const CELL = 11
  const GAP = 3

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Month labels */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `18px repeat(53, ${CELL}px)`,
            columnGap: GAP,
            height: 14,
          }}
        >
          <div />
          {monthColumnLabels.map((m, i) => (
            <div
              key={i}
              style={{
                fontSize: 9,
                color: 'var(--text-3)',
                fontWeight: 500,
                whiteSpace: 'nowrap',
              }}
            >
              {m || ''}
            </div>
          ))}
        </div>

        {/* Rows: day-of-week label + 53 week cells */}
        {[0, 1, 2, 3, 4, 5, 6].map((dow) => (
          <div
            key={dow}
            style={{
              display: 'grid',
              gridTemplateColumns: `18px repeat(53, ${CELL}px)`,
              columnGap: GAP,
              alignItems: 'center',
              height: CELL,
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: 'var(--text-3)',
                fontWeight: 500,
                lineHeight: 1,
              }}
            >
              {dow === 1 ? 'Lun' : dow === 3 ? 'Mié' : dow === 5 ? 'Vie' : ''}
            </div>
            {weeks.map((col, wi) => {
              const cell = col[dow]
              if (!cell) {
                return (
                  <div
                    key={wi}
                    style={{ width: CELL, height: CELL, background: 'transparent' }}
                  />
                )
              }
              return (
                <div
                  key={wi}
                  title={`${cell.date.toLocaleDateString('es', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })} · ${cell.intensity === 0 ? 'sin actividad' : `nivel ${cell.intensity}`}`}
                  style={{
                    width: CELL,
                    height: CELL,
                    borderRadius: 2,
                    background: intensityBg(cell.intensity),
                    border:
                      cell.intensity === 0
                        ? '1px solid var(--border)'
                        : '1px solid transparent',
                    cursor: 'default',
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 12,
        }}
      >
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
          {totalActive} días activos en el último año
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Menos</span>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                width: CELL,
                height: CELL,
                borderRadius: 2,
                background: intensityBg(i),
                border: i === 0 ? '1px solid var(--border)' : '1px solid transparent',
              }}
            />
          ))}
          <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Más</span>
        </div>
      </div>
    </div>
  )
}

export function ProgressView() {
  const projects = useProjectsStore((s) => s.projects)
  const lastWeek = TEMPO_DATA.weeklyStats[TEMPO_DATA.weeklyStats.length - 1]

  const stats = [
    { label: 'Racha actual', value: `${TEMPO_DATA.streak}d`, icon: 'zap', color: '#e09050' },
    {
      label: 'Tareas totales',
      value: TEMPO_DATA.totalTasksDone,
      icon: 'check-circle',
      color: 'var(--accent)',
    },
    { label: 'Esta semana', value: lastWeek.tasks, icon: 'calendar', color: '#5b7fa6' },
    {
      label: 'Horas trackeadas',
      value: `${lastWeek.hours}h`,
      icon: 'clock',
      color: '#7a6ba0',
    },
  ]

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h1 className="view-title">Progreso</h1>
          <p className="view-subtitle">
            Últimas 4 semanas · {TEMPO_DATA.totalTasksDone} tareas completadas
          </p>
        </div>
      </div>

      <div className="stats-grid" style={{ gap: 14, marginBottom: 20 }}>
        {stats.map((s) => (
          <div key={s.label} className="card" style={{ padding: '16px 18px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                {s.label}
              </span>
              <Icon name={s.icon} size={16} style={{ color: s.color }} />
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-1)' }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div className="card">
          <div className="card-header">
            <span className="card-title">Tareas por semana</span>
          </div>
          <MiniBarChart data={TEMPO_DATA.weeklyStats} color="var(--accent)" />
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Horas por semana</span>
          </div>
          <MiniLineChart data={TEMPO_DATA.weeklyStats} color="#5b7fa6" />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div className="card">
          <div className="card-header">
            <span className="card-title">Horas por categoría</span>
          </div>
          <DonutChart data={TEMPO_DATA.categoryHours} />
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Progreso por proyecto</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {projects.map((p) => (
              <div key={p.id}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: 'var(--text-2)',
                      fontWeight: 500,
                    }}
                  >
                    {p.name}
                  </span>
                  <span
                    style={{ fontSize: 12, fontWeight: 600, color: p.color }}
                  >
                    {p.progress}%
                  </span>
                </div>
                <ProgressBar value={p.progress} color={p.color} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Actividad — último año</span>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
            Racha: {TEMPO_DATA.streak} días 🔥
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <YearHeatmap />
        </div>
      </div>
    </div>
  )
}
