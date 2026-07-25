import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '../Icon'
import {
  DAYS_ES,
  MONTHS_ES,
  TODAY,
  toDateKey,
} from '../../lib/date'

interface DatePickerProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

function parseValue(v: string): Date {
  if (!v) return new Date(TODAY)
  const [y, m, d] = v.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatDisplay(v: string): string {
  if (!v) return ''
  const d = parseValue(v)
  return `${d.getDate()} ${MONTHS_ES[d.getMonth()].slice(0, 3).toLowerCase()} ${d.getFullYear()}`
}

export function DatePicker({ value, onChange, placeholder = 'Elegir fecha' }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState<DOMRect | null>(null)
  const [month, setMonth] = useState(() => parseValue(value))
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) setMonth(parseValue(value))
  }, [open, value])

  const openPicker = () => {
    if (triggerRef.current) {
      setAnchor(triggerRef.current.getBoundingClientRect())
      setOpen(true)
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openPicker}
        style={{
          width: '100%',
          padding: '8px 10px',
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: 'var(--surface-2)',
          fontSize: 13,
          color: value ? 'var(--text-1)' : 'var(--text-3)',
          fontFamily: 'var(--font)',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          outline: 'none',
        }}
      >
        <Icon name="calendar" size={14} style={{ color: 'var(--text-3)' }} />
        <span style={{ flex: 1 }}>{value ? formatDisplay(value) : placeholder}</span>
        {value && (
          <span
            onClick={(e) => {
              e.stopPropagation()
              onChange('')
            }}
            style={{ color: 'var(--text-3)', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}
          >
            ×
          </span>
        )}
      </button>
      {open && anchor && (
        <DatePopover
          anchor={anchor}
          month={month}
          setMonth={setMonth}
          value={value}
          onSelect={(v) => {
            onChange(v)
            setOpen(false)
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

interface DatePopoverProps {
  anchor: DOMRect
  month: Date
  setMonth: (d: Date) => void
  value: string
  onSelect: (v: string) => void
  onClose: () => void
}

function DatePopover({ anchor, month, setMonth, value, onSelect, onClose }: DatePopoverProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: anchor.bottom + 4, left: anchor.left })

  useLayoutEffect(() => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    let top = anchor.bottom + 4
    let left = anchor.left
    if (top + r.height > window.innerHeight - 8) top = anchor.top - r.height - 4
    if (left + r.width > window.innerWidth - 8) left = window.innerWidth - r.width - 8
    setPos({ top, left })
  }, [anchor])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    window.addEventListener('keydown', onKey)
    setTimeout(() => window.addEventListener('mousedown', onClick), 0)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onClick)
    }
  }, [onClose])

  const year = month.getFullYear()
  const monthIdx = month.getMonth()
  const firstDay = new Date(year, monthIdx, 1).getDay()
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate()
  const todayKey = toDateKey(TODAY)

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const goPrev = () => setMonth(new Date(year, monthIdx - 1, 1))
  const goNext = () => setMonth(new Date(year, monthIdx + 1, 1))

  return createPortal(
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        zIndex: 1300,
        width: 280,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
        padding: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
        <button
          type="button"
          onClick={goPrev}
          style={iconBtnStyle}
        >
          <Icon name="chevron-left" size={14} style={{ color: 'var(--text-2)' }} />
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>
          {MONTHS_ES[monthIdx]} {year}
        </div>
        <button
          type="button"
          onClick={goNext}
          style={iconBtnStyle}
        >
          <Icon name="chevron-right" size={14} style={{ color: 'var(--text-2)' }} />
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {DAYS_ES.map((d) => (
          <div
            key={d}
            style={{
              textAlign: 'center',
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--text-3)',
              padding: '4px 0',
              textTransform: 'uppercase',
            }}
          >
            {d.slice(0, 1)}
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />
          const key = toDateKey(new Date(year, monthIdx, d))
          const isSelected = key === value
          const isToday = key === todayKey
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(key)}
              style={{
                aspectRatio: '1',
                border: 'none',
                borderRadius: 7,
                fontSize: 12,
                fontWeight: isToday ? 600 : 400,
                cursor: 'pointer',
                background: isSelected ? 'var(--accent)' : 'transparent',
                color: isSelected ? 'white' : isToday ? 'var(--accent)' : 'var(--text-1)',
                outline: isToday && !isSelected ? '1px solid var(--accent)' : 'none',
                outlineOffset: -1,
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.background = 'var(--surface-2)'
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.background = 'transparent'
              }}
            >
              {d}
            </button>
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
        <button
          type="button"
          onClick={() => onSelect(todayKey)}
          style={textBtnStyle}
        >
          Hoy
        </button>
        <button
          type="button"
          onClick={() => onSelect('')}
          style={textBtnStyle}
        >
          Limpiar
        </button>
      </div>
    </div>,
    document.body,
  )
}

const iconBtnStyle = {
  width: 26,
  height: 26,
  borderRadius: 6,
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
} as const

const textBtnStyle = {
  background: 'transparent',
  border: 'none',
  fontSize: 12,
  color: 'var(--text-2)',
  cursor: 'pointer',
  padding: '4px 8px',
  borderRadius: 5,
} as const
