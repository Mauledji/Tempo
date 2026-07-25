import { Icon } from '../Icon'

export type RecurrenceFreq = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface RecurrenceValue {
  freq: RecurrenceFreq
  interval: number
  weekdays: number[]
}

export const EMPTY_RECURRENCE: RecurrenceValue = {
  freq: 'none',
  interval: 1,
  weekdays: [],
}

interface RecurrenceBuilderProps {
  value: RecurrenceValue
  onChange: (v: RecurrenceValue) => void
}

const FREQ_OPTS: { id: RecurrenceFreq; label: string }[] = [
  { id: 'none', label: 'No se repite' },
  { id: 'daily', label: 'Diario' },
  { id: 'weekly', label: 'Semanal' },
  { id: 'monthly', label: 'Mensual' },
  { id: 'yearly', label: 'Anual' },
]

const WEEKDAYS = [
  { id: 1, label: 'L' },
  { id: 2, label: 'M' },
  { id: 3, label: 'X' },
  { id: 4, label: 'J' },
  { id: 5, label: 'V' },
  { id: 6, label: 'S' },
  { id: 0, label: 'D' },
]

const WEEKDAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

function buildPreview(v: RecurrenceValue): string {
  if (v.freq === 'none') return 'Sin recurrencia'
  const n = Math.max(1, v.interval)

  if (v.freq === 'daily') return n === 1 ? 'Cada día' : `Cada ${n} días`

  if (v.freq === 'weekly') {
    if (v.weekdays.length === 0) return n === 1 ? 'Cada semana' : `Cada ${n} semanas`
    const sorted = [...v.weekdays].sort((a, b) => {
      const order = [1, 2, 3, 4, 5, 6, 0]
      return order.indexOf(a) - order.indexOf(b)
    })
    const names = sorted.map((d) => WEEKDAY_NAMES[d])
    const list =
      names.length === 1
        ? names[0]
        : names.length === 2
          ? names.join(' y ')
          : names.slice(0, -1).join(', ') + ' y ' + names[names.length - 1]
    return n === 1 ? `Cada ${list}` : `Cada ${n} semanas, los ${list}`
  }

  if (v.freq === 'monthly') return n === 1 ? 'Cada mes' : `Cada ${n} meses`
  if (v.freq === 'yearly') return n === 1 ? 'Cada año' : `Cada ${n} años`
  return ''
}

export function RecurrenceBuilder({ value, onChange }: RecurrenceBuilderProps) {
  const update = (patch: Partial<RecurrenceValue>) => onChange({ ...value, ...patch })

  const toggleWeekday = (d: number) => {
    const has = value.weekdays.includes(d)
    update({ weekdays: has ? value.weekdays.filter((x) => x !== d) : [...value.weekdays, d] })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {FREQ_OPTS.map((f) => {
          const sel = f.id === value.freq
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => update({ freq: f.id })}
              style={{
                padding: '5px 12px',
                borderRadius: 18,
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                background: sel ? 'var(--accent)20' : 'var(--surface-2)',
                border: `1px solid ${sel ? 'var(--accent)' : 'var(--border)'}`,
                color: sel ? 'var(--accent)' : 'var(--text-2)',
                fontFamily: 'var(--font)',
                transition: 'all 0.15s',
              }}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {value.freq !== 'none' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Cada</span>
          <input
            type="number"
            min={1}
            max={99}
            value={value.interval}
            onChange={(e) => update({ interval: Math.max(1, Number(e.target.value) || 1) })}
            style={{
              width: 60,
              padding: '6px 8px',
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'var(--surface-2)',
              fontSize: 12,
              color: 'var(--text-1)',
              fontFamily: 'var(--font)',
              outline: 'none',
            }}
          />
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
            {value.freq === 'daily' && (value.interval === 1 ? 'día' : 'días')}
            {value.freq === 'weekly' && (value.interval === 1 ? 'semana' : 'semanas')}
            {value.freq === 'monthly' && (value.interval === 1 ? 'mes' : 'meses')}
            {value.freq === 'yearly' && (value.interval === 1 ? 'año' : 'años')}
          </span>
        </div>
      )}

      {value.freq === 'weekly' && (
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-3)',
              marginBottom: 6,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Días
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            {WEEKDAYS.map((w) => {
              const sel = value.weekdays.includes(w.id)
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => toggleWeekday(w.id)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: `1.5px solid ${sel ? 'var(--accent)' : 'var(--border)'}`,
                    background: sel ? 'var(--accent)' : 'var(--surface-2)',
                    color: sel ? 'white' : 'var(--text-2)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--font)',
                    transition: 'all 0.15s',
                  }}
                >
                  {w.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {value.freq !== 'none' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 10px',
            background: 'var(--accent-subtle, var(--surface-2))',
            border: '1px dashed var(--border)',
            borderRadius: 7,
          }}
        >
          <Icon name="repeat" size={12} style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{buildPreview(value)}</span>
        </div>
      )}
    </div>
  )
}
