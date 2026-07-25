import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '../Icon'
import { useNavigate } from '@tanstack/react-router'
import { useThemeStore } from '../../stores/theme'
import { useModalStore } from '../../stores/modal'
import { VIEW_PATH } from '../../constants/nav'
import { useToastStore } from '../../stores/toast'
import { TEMPO_DATA } from '../../data/mock'

interface UserMenuProps {
  anchor: DOMRect
  onClose: () => void
}

interface Item {
  icon: string
  label: string
  shortcut?: string
  danger?: boolean
  onSelect?: () => void
}

export function UserMenu({ anchor, onClose }: UserMenuProps) {
  const dark = useThemeStore((s) => s.dark)
  const toggleTheme = useThemeStore((s) => s.toggle)
  const navigate = useNavigate()
  const openModal = useModalStore((s) => s.open)
  const addToast = useToastStore((s) => s.addToast)
  const ref = useRef<HTMLDivElement | null>(null)
  const user = TEMPO_DATA.user
  const [pos, setPos] = useState<{ top: number; left: number }>({
    top: anchor.top,
    left: anchor.right + 8,
  })
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    let left = anchor.right + 8
    let top = anchor.top
    if (left + rect.width > vw - 6) left = anchor.left - rect.width - 8
    if (top + rect.height > vh - 6) top = vh - rect.height - 6
    setPos({ top: Math.max(6, top), left: Math.max(6, left) })
    setReady(true)
  }, [anchor])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onDown)
    }
  }, [onClose])

  const items: Array<Item | 'separator'> = [
    {
      icon: 'user',
      label: 'Perfil',
      onSelect: () =>
        addToast({
          type: 'info',
          text: 'Perfil',
          sub: 'Pendiente integración con backend.',
        }),
    },
    {
      icon: 'settings',
      label: 'Ajustes',
      shortcut: '⌘,',
      onSelect: () => navigate({ to: VIEW_PATH.settings }),
    },
    {
      icon: dark ? 'sun' : 'moon',
      label: dark ? 'Modo claro' : 'Modo oscuro',
      onSelect: toggleTheme,
    },
    'separator',
    {
      icon: 'keyboard',
      label: 'Atajos',
      shortcut: '⌘/',
      onSelect: () => openModal({ type: 'shortcuts-cheatsheet' }),
    },
    {
      icon: 'help-circle',
      label: 'Ayuda',
      onSelect: () =>
        addToast({
          type: 'info',
          text: 'Ayuda',
          sub: 'Pendiente integración.',
        }),
    },
    'separator',
    {
      icon: 'log-out',
      label: 'Cerrar sesión',
      danger: true,
      onSelect: () =>
        addToast({
          type: 'info',
          text: 'Cerrar sesión',
          sub: 'Pendiente integración con Auth.',
        }),
    },
  ]

  return createPortal(
    <div
      ref={ref}
      role="menu"
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        zIndex: 1250,
        width: 240,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        boxShadow: '0 16px 50px rgba(0,0,0,0.22)',
        overflow: 'hidden',
        opacity: ready ? 1 : 0,
        transition: 'opacity 0.1s',
      }}
    >
      <div
        style={{
          padding: '14px 14px 10px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'var(--accent)',
              color: 'var(--accent-text, white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {user.initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-1)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.name}
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'var(--text-3)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.email}
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 10,
            padding: '6px 8px',
            background: 'var(--surface-2)',
            borderRadius: 7,
          }}
        >
          <Icon name="zap" size={13} style={{ color: '#e09050' }} />
          <span style={{ fontSize: 11, color: 'var(--text-2)' }}>
            Racha de <strong>{TEMPO_DATA.streak} días</strong> 🔥
          </span>
        </div>
      </div>
      <div style={{ padding: 4 }}>
        {items.map((item, i) =>
          item === 'separator' ? (
            <div
              key={`sep-${i}`}
              style={{ height: 1, background: 'var(--border)', margin: '4px 0' }}
            />
          ) : (
            <button
              key={i}
              role="menuitem"
              onClick={() => {
                item.onSelect?.()
                onClose()
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '8px 10px',
                border: 'none',
                background: 'transparent',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12,
                color: item.danger ? '#c0392b' : 'var(--text-1)',
                textAlign: 'left',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background =
                  'var(--surface-2)')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background =
                  'transparent')
              }
            >
              <Icon
                name={item.icon}
                size={14}
                style={{
                  color: item.danger ? '#c0392b' : 'var(--text-3)',
                  flexShrink: 0,
                }}
              />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.shortcut && (
                <kbd
                  style={{
                    fontSize: 10,
                    background: 'var(--surface-3, var(--surface-2))',
                    padding: '1px 5px',
                    borderRadius: 3,
                    color: 'var(--text-3)',
                  }}
                >
                  {item.shortcut}
                </kbd>
              )}
            </button>
          ),
        )}
      </div>
    </div>,
    document.body,
  )
}
