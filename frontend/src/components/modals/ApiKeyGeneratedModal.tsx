import { useState } from 'react'
import { Icon } from '../Icon'
import { useToastStore } from '../../stores/toast'

interface ApiKeyGeneratedModalProps {
  onClose: () => void
  apiKey: string
}

export function ApiKeyGeneratedModal({ onClose, apiKey }: ApiKeyGeneratedModalProps) {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)
  const addToast = useToastStore((s) => s.addToast)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey)
      setCopied(true)
      addToast({ type: 'success', text: 'API key copiada' })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      addToast({ type: 'error', text: 'No se pudo copiar' })
    }
  }

  return (
    <div
      style={{
        width: 460,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="key" size={18} style={{ color: 'var(--accent)' }} />
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--text-1)',
              margin: 0,
            }}
          >
            Tu nueva API key
          </h3>
        </div>
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
            background: '#e0905012',
            border: '1px solid #e0905040',
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
            style={{ color: '#c77c3c', flexShrink: 0, marginTop: 1 }}
          />
          <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>
            Esta clave <strong>solo se muestra una vez</strong>. Copiala y guardala en un
            lugar seguro — no podrás volver a verla.
          </div>
        </div>
        <div
          style={{
            position: 'relative',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 12,
          }}
        >
          <code
            style={{
              flex: 1,
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--text-1)',
              wordBreak: 'break-all',
              filter: revealed ? 'none' : 'blur(5px)',
              userSelect: revealed ? 'text' : 'none',
              transition: 'filter 0.15s',
            }}
          >
            {apiKey}
          </code>
          <button
            onClick={() => setRevealed((v) => !v)}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            title={revealed ? 'Ocultar' : 'Mostrar'}
          >
            <Icon
              name={revealed ? 'eye-off' : 'eye'}
              size={13}
              style={{ color: 'var(--text-2)' }}
            />
          </button>
        </div>
        <button
          onClick={copy}
          style={{
            width: '100%',
            padding: '9px 14px',
            borderRadius: 8,
            border: 'none',
            background: copied ? '#3a8f5a' : 'var(--accent)',
            color: 'white',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'background 0.15s',
          }}
        >
          <Icon name={copied ? 'check' : 'copy'} size={14} />
          {copied ? 'Copiado' : 'Copiar al portapapeles'}
        </button>
      </div>
      <div
        style={{
          padding: '12px 22px 18px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <button
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
          Listo
        </button>
      </div>
    </div>
  )
}
