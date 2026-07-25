import { Icon } from '../Icon'

interface RegenKeyModalProps {
  onClose: () => void
  onConfirm: () => void
}

export function RegenKeyModal({ onClose, onConfirm }: RegenKeyModalProps) {
  return (
    <div
      style={{
        width: 420,
        background: 'var(--surface)',
        borderRadius: 14,
        border: '1px solid var(--border)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '18px 22px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--text-1)',
            margin: 0,
          }}
        >
          Regenerar API key
        </h3>
        <button
          onClick={onClose}
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
      <div style={{ padding: '16px 22px' }}>
        <div
          style={{
            padding: '12px 14px',
            background: '#c0392b12',
            border: '1px solid #c0392b30',
            borderRadius: 10,
            marginBottom: 16,
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
          }}
        >
          <Icon
            name="alert-triangle"
            size={16}
            style={{ color: '#c0392b', flexShrink: 0, marginTop: 1 }}
          />
          <div style={{ fontSize: 12, color: '#c0392b', lineHeight: 1.5 }}>
            La clave actual dejará de funcionar inmediatamente. Todos los scripts de
            Claude Code que la usen necesitarán actualizarse.
          </div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
          ¿Estás seguro de que querés generar una nueva API key para Tempo?
        </div>
      </div>
      <div
        style={{
          padding: '12px 22px 18px',
          display: 'flex',
          gap: 8,
          justifyContent: 'flex-end',
          borderTop: '1px solid var(--border)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            padding: '7px 14px',
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
          onClick={() => {
            onConfirm()
            onClose()
          }}
          style={{
            padding: '7px 16px',
            borderRadius: 7,
            border: 'none',
            background: '#c0392b',
            color: 'white',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Icon name="refresh-cw" size={13} />
          Regenerar
        </button>
      </div>
    </div>
  )
}
