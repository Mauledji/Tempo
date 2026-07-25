import { useId, type ReactNode } from 'react'
import { Icon } from '../Icon'

interface ModalChromeProps {
  title: string
  width?: number
  onClose: () => void
  // Called when the user clicks the primary button or presses Enter inside any
  // form field. RHF's `handleSubmit(onValid)` returns `(e?) => Promise<void>`
  // which is assignable to `() => void`, so callers using react-hook-form just
  // pass `form.handleSubmit(onValid)` here.
  onSubmit?: () => void
  submitLabel?: string
  danger?: boolean
  showDelete?: boolean
  onDelete?: () => void
  children: ReactNode
}

export function ModalChrome({
  title,
  width = 520,
  onClose,
  onSubmit,
  submitLabel = 'Guardar',
  danger,
  showDelete,
  onDelete,
  children,
}: ModalChromeProps) {
  const titleId = useId()

  // The body + footer go inside a real <form> when onSubmit is provided so
  // Enter inside any input naturally triggers submission and the browser's
  // built-in form semantics apply.
  const Wrapper: 'form' | 'div' = onSubmit ? 'form' : 'div'
  const wrapperProps = onSubmit
    ? {
        onSubmit: (e: React.FormEvent) => {
          e.preventDefault()
          onSubmit()
        },
        // noValidate disables the browser's native validation bubbles so our
        // zod-driven inline error UI is the only error surface.
        noValidate: true,
      }
    : {}

  return (
    <div
      aria-labelledby={titleId}
      style={{
        width,
        background: 'var(--surface)',
        borderRadius: 14,
        border: '1px solid var(--border)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
        overflow: 'hidden',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 22px 0',
          flexShrink: 0,
        }}
      >
        <h3
          id={titleId}
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--text-1)',
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'var(--surface-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Icon name="x" size={14} style={{ color: 'var(--text-3)' }} />
        </button>
      </div>
      <Wrapper
        {...wrapperProps}
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
        }}
      >
        <div style={{ padding: '16px 22px', overflowY: 'auto', flex: 1 }}>{children}</div>
        <div
          style={{
            padding: '0 22px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            borderTop: '1px solid var(--border)',
            paddingTop: 14,
          }}
        >
          {showDelete ? (
            <button
              type="button"
              onClick={onDelete}
              style={{
                fontSize: 12,
                color: '#c0392b',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Icon name="trash-2" size={13} />
              Eliminar
            </button>
          ) : (
            <div />
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '7px 16px',
                borderRadius: 7,
                border: '1px solid var(--border)',
                background: 'var(--surface-2)',
                fontSize: 13,
                color: 'var(--text-2)',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type={onSubmit ? 'submit' : 'button'}
              style={{
                padding: '7px 18px',
                borderRadius: 7,
                border: 'none',
                background: danger ? '#c0392b' : 'var(--accent)',
                color: 'white',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </Wrapper>
    </div>
  )
}
