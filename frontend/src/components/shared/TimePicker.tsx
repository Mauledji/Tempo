import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '../Icon'

interface TimePickerProps {
  value: string
  onChange: (v: string) => void
  step?: number
  minHour?: number
  maxHour?: number
}

function buildSlots(step: number, minHour: number, maxHour: number): string[] {
  const slots: string[] = []
  for (let h = minHour; h < maxHour; h++) {
    for (let m = 0; m < 60; m += step) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return slots
}

export function TimePicker({ value, onChange, step = 15, minHour = 0, maxHour = 24 }: TimePickerProps) {
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState<DOMRect | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

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
        <Icon name="clock" size={14} style={{ color: 'var(--text-3)' }} />
        <span style={{ flex: 1 }}>{value || '--:--'}</span>
      </button>
      {open && anchor && (
        <TimePopover
          anchor={anchor}
          value={value}
          slots={buildSlots(step, minHour, maxHour)}
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

interface TimePopoverProps {
  anchor: DOMRect
  value: string
  slots: string[]
  onSelect: (v: string) => void
  onClose: () => void
}

function TimePopover({ anchor, value, slots, onSelect, onClose }: TimePopoverProps) {
  const ref = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: anchor.bottom + 4, left: anchor.left, width: anchor.width })

  useLayoutEffect(() => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    let top = anchor.bottom + 4
    let left = anchor.left
    if (top + r.height > window.innerHeight - 8) top = anchor.top - r.height - 4
    if (left + r.width > window.innerWidth - 8) left = window.innerWidth - r.width - 8
    setPos({ top, left, width: anchor.width })
  }, [anchor])

  useLayoutEffect(() => {
    if (!listRef.current || !value) return
    const idx = slots.indexOf(value)
    if (idx < 0) return
    const el = listRef.current.children[idx] as HTMLElement | undefined
    if (el) listRef.current.scrollTop = el.offsetTop - listRef.current.clientHeight / 2 + el.clientHeight / 2
  }, [slots, value])

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

  return createPortal(
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        width: Math.max(pos.width, 110),
        zIndex: 1300,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
        overflow: 'hidden',
      }}
    >
      <div ref={listRef} style={{ maxHeight: 220, overflowY: 'auto', padding: 4 }}>
        {slots.map((s) => {
          const sel = s === value
          return (
            <button
              key={s}
              type="button"
              onClick={() => onSelect(s)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'center',
                padding: '6px 10px',
                fontSize: 12,
                fontFamily: 'var(--font-mono, monospace)',
                color: sel ? 'white' : 'var(--text-1)',
                background: sel ? 'var(--accent)' : 'transparent',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!sel) e.currentTarget.style.background = 'var(--surface-2)'
              }}
              onMouseLeave={(e) => {
                if (!sel) e.currentTarget.style.background = 'transparent'
              }}
            >
              {s}
            </button>
          )
        })}
      </div>
    </div>,
    document.body,
  )
}
