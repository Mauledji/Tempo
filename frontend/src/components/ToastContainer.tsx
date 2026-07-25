import { Icon } from './Icon'
import { useToastStore, type ToastType } from '../stores/toast'
import { useIsMobile } from '../lib/useViewport'

interface ToastStyle {
  icon: string
  color: string
  bg: string
  border: string
}

const TOAST_COLORS: Record<ToastType, ToastStyle> = {
  success: { icon: 'check-circle', color: '#3d6b4f', bg: '#edf4f0', border: '#c4d9cc' },
  info: { icon: 'info', color: '#2471a3', bg: '#eaf3fb', border: '#aacde8' },
  error: { icon: 'x-circle', color: '#c0392b', bg: '#fdecea', border: '#f5b7b1' },
  undo: { icon: 'rotate-ccw', color: '#6b6b68', bg: 'var(--surface)', border: 'var(--border-2)' },
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)
  const isMobile = useIsMobile()

  if (!toasts.length) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: isMobile ? 76 : 20,
        right: isMobile ? 12 : 20,
        left: isMobile ? 12 : 'auto',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {toasts.map((t) => {
        const c = TOAST_COLORS[t.type] || TOAST_COLORS.info
        return (
          <div
            key={t.id}
            className="toast-in"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '11px 14px',
              background: c.bg,
              border: `1px solid ${c.border}`,
              borderRadius: 10,
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              minWidth: 260,
              maxWidth: 340,
            }}
          >
            <Icon name={c.icon} size={15} style={{ color: c.color, flexShrink: 0, marginTop: 1 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{t.text}</div>
              {t.sub && (
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{t.sub}</div>
              )}
            </div>
            {t.action && (
              <button
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: c.color,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                {t.action}
              </button>
            )}
            <button
              onClick={() => removeToast(t.id)}
              style={{
                width: 18,
                height: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                flexShrink: 0,
                opacity: 0.5,
              }}
            >
              <Icon name="x" size={12} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
