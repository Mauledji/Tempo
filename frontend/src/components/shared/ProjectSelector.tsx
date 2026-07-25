import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '../Icon'
import { useProjectsStore } from '../../stores/projects'
import type { ProjectId } from '../../data/mock'

interface ProjectSelectorProps {
  value: ProjectId | ''
  onChange: (v: ProjectId | '') => void
  placeholder?: string
}

export function ProjectSelector({ value, onChange, placeholder = 'Sin proyecto' }: ProjectSelectorProps) {
  const projects = useProjectsStore((s) => s.projects)
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState<DOMRect | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const selected = projects.find((p) => p.id === value)

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
          color: selected ? 'var(--text-1)' : 'var(--text-3)',
          fontFamily: 'var(--font)',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          outline: 'none',
        }}
      >
        {selected ? (
          <>
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: selected.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon name={selected.icon} size={12} style={{ color: 'white' }} />
            </span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selected.name}
            </span>
          </>
        ) : (
          <>
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: 'var(--surface-3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon name="folder" size={12} style={{ color: 'var(--text-3)' }} />
            </span>
            <span style={{ flex: 1 }}>{placeholder}</span>
          </>
        )}
        <Icon name="chevron-down" size={12} style={{ color: 'var(--text-3)' }} />
      </button>
      {open && anchor && (
        <ProjectPopover
          anchor={anchor}
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

interface ProjectPopoverProps {
  anchor: DOMRect
  value: ProjectId | ''
  onSelect: (v: ProjectId | '') => void
  onClose: () => void
}

function ProjectPopover({ anchor, value, onSelect, onClose }: ProjectPopoverProps) {
  const projects = useProjectsStore((s) => s.projects)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)
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

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(query.trim().toLowerCase()),
  )

  return createPortal(
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        width: Math.max(pos.width, 240),
        zIndex: 1300,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: 8, borderBottom: '1px solid var(--border)' }}>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar proyecto…"
          style={{
            width: '100%',
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
      </div>
      <div style={{ maxHeight: 240, overflowY: 'auto', padding: 4 }}>
        <button
          type="button"
          onClick={() => onSelect('')}
          style={{
            ...rowStyle,
            background: value === '' ? 'var(--surface-2)' : 'transparent',
          }}
        >
          <span style={iconWrap('var(--surface-3)')}>
            <Icon name="folder" size={11} style={{ color: 'var(--text-3)' }} />
          </span>
          <span style={{ flex: 1, color: 'var(--text-2)' }}>Sin proyecto</span>
          {value === '' && <Icon name="check" size={12} style={{ color: 'var(--accent)' }} />}
        </button>
        {filtered.map((p) => {
          const sel = p.id === value
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              style={{
                ...rowStyle,
                background: sel ? 'var(--surface-2)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!sel) e.currentTarget.style.background = 'var(--surface-2)'
              }}
              onMouseLeave={(e) => {
                if (!sel) e.currentTarget.style.background = 'transparent'
              }}
            >
              <span style={iconWrap(p.color)}>
                <Icon name={p.icon} size={11} style={{ color: 'white' }} />
              </span>
              <span style={{ flex: 1, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.name}
              </span>
              {sel && <Icon name="check" size={12} style={{ color: 'var(--accent)' }} />}
            </button>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ padding: '12px 10px', fontSize: 12, color: 'var(--text-3)', textAlign: 'center' }}>
            Sin resultados
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

const rowStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '6px 8px',
  fontSize: 12,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  borderRadius: 6,
  textAlign: 'left' as const,
  fontFamily: 'var(--font)',
}

const iconWrap = (bg: string) => ({
  width: 22,
  height: 22,
  borderRadius: 6,
  background: bg,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
})
