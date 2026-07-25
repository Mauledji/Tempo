import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '../Icon'

export interface ContextMenuItem {
  label: string
  icon?: string
  onSelect?: () => void
  danger?: boolean
  disabled?: boolean
  separator?: boolean
}

interface ContextMenuProps {
  items: ContextMenuItem[]
  x: number
  y: number
  onClose: () => void
}

export function ContextMenu({ items, x, y, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: y, left: x })
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    if (!menuRef.current) return
    const rect = menuRef.current.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    let left = x
    let top = y
    if (left + rect.width > vw - 6) left = vw - rect.width - 6
    if (top + rect.height > vh - 6) top = vh - rect.height - 6
    left = Math.max(6, left)
    top = Math.max(6, top)
    setPos({ top, left })
    setReady(true)
  }, [x, y])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onDown)
    }
  }, [onClose])

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        zIndex: 1300,
        minWidth: 200,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        boxShadow: '0 12px 40px rgba(0,0,0,0.22)',
        padding: 6,
        opacity: ready ? 1 : 0,
        transition: 'opacity 0.1s',
      }}
    >
      {items.map((it, i) => {
        if (it.separator) {
          return (
            <div
              key={`sep-${i}`}
              style={{
                height: 1,
                background: 'var(--border)',
                margin: '4px 2px',
              }}
            />
          )
        }
        return (
          <button
            key={i}
            role="menuitem"
            disabled={it.disabled}
            onClick={() => {
              if (it.disabled) return
              it.onSelect?.()
              onClose()
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '7px 10px',
              borderRadius: 6,
              border: 'none',
              background: 'transparent',
              cursor: it.disabled ? 'not-allowed' : 'pointer',
              opacity: it.disabled ? 0.5 : 1,
              fontSize: 13,
              color: it.danger ? '#c0392b' : 'var(--text-1)',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              if (!it.disabled)
                (e.currentTarget as HTMLButtonElement).style.background =
                  'var(--surface-2)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.background =
                'transparent'
            }}
          >
            {it.icon && (
              <Icon
                name={it.icon}
                size={14}
                style={{ color: it.danger ? '#c0392b' : 'var(--text-2)' }}
              />
            )}
            <span>{it.label}</span>
          </button>
        )
      })}
    </div>,
    document.body,
  )
}

interface MenuState {
  x: number
  y: number
  items: ContextMenuItem[]
}

export function useContextMenu() {
  const [state, setState] = useState<MenuState | null>(null)

  const open = (e: React.MouseEvent, items: ContextMenuItem[]) => {
    e.preventDefault()
    e.stopPropagation()
    setState({ x: e.clientX, y: e.clientY, items })
  }

  const close = () => setState(null)

  const menu = state ? (
    <ContextMenu x={state.x} y={state.y} items={state.items} onClose={close} />
  ) : null

  return { open, close, menu }
}
