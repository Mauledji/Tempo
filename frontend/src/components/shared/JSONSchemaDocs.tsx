import { useState } from 'react'
import { Icon } from '../Icon'
import { useToastStore } from '../../stores/toast'

const SCHEMA = `{
  "tasks": [
    {
      "title": "string (requerido)",
      "description": "string (opcional)",
      "project": "clf | aiml | dbt | aws | cis | pes",
      "priority": "urgent | high | medium | low",
      "col": "inbox | today | week | upcoming",
      "due": "YYYY-MM-DD (opcional)",
      "tags": ["string"],
      "recurrence": "daily | weekly | monthly"
    }
  ],
  "events": [
    {
      "title": "string (requerido)",
      "category": "work | class | studyCLF | studyAIML | personal",
      "start": "YYYY-MM-DDTHH:MM",
      "end": "YYYY-MM-DDTHH:MM",
      "allDay": false,
      "location": "string (opcional)"
    }
  ]
}`

const CLI_EXAMPLE = `# Crear tareas desde Claude Code:
claude "Crea las tareas del sprint 5 de CIS distribuyendo lunes a viernes"

# O usar el MCP de Tempo:
tempo create --from claude_plan.json`

export function JSONSchemaDocs() {
  const addToast = useToastStore((s) => s.addToast)
  const [copiedSchema, setCopiedSchema] = useState(false)
  const [copiedCli, setCopiedCli] = useState(false)

  const copy = async (
    text: string,
    setFlag: (b: boolean) => void,
    label: string,
  ) => {
    try {
      await navigator.clipboard.writeText(text)
      setFlag(true)
      addToast({ type: 'success', text: `${label} copiado` })
      setTimeout(() => setFlag(false), 2000)
    } catch {
      addToast({ type: 'error', text: 'No se pudo copiar' })
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <span
          className="card-title"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Icon name="book-open" size={14} style={{ color: 'var(--accent)' }} />
          Schema JSON para Claude Code
        </span>
      </div>
      <div
        style={{
          fontSize: 12,
          color: 'var(--text-2)',
          marginBottom: 12,
          lineHeight: 1.6,
        }}
      >
        Usá este schema para pedirle a Claude Code que cree tareas y eventos en
        Tempo.
      </div>

      <div style={{ position: 'relative', marginBottom: 16 }}>
        <pre
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '12px 14px',
            color: 'var(--text-2)',
            lineHeight: 1.6,
            margin: 0,
            overflowX: 'auto',
          }}
        >
          {SCHEMA}
        </pre>
        <button
          onClick={() => copy(SCHEMA, setCopiedSchema, 'Schema')}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            padding: '4px 10px',
            borderRadius: 5,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            fontSize: 11,
            color: 'var(--text-2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Icon name={copiedSchema ? 'check' : 'copy'} size={11} />
          {copiedSchema ? 'Copiado' : 'Copiar'}
        </button>
      </div>

      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-2)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 8,
        }}
      >
        Ejemplo de CLI
      </div>

      <div style={{ position: 'relative' }}>
        <pre
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            background: '#0a0a0a',
            borderRadius: 8,
            padding: '12px 14px',
            color: '#c8c8c8',
            lineHeight: 1.8,
            margin: 0,
            overflowX: 'auto',
          }}
        >
          {CLI_EXAMPLE.split('\n').map((line, i) => (
            <div
              key={i}
              style={{
                color: line.startsWith('#') ? '#888' : '#c8c8c8',
              }}
            >
              {line || ' '}
            </div>
          ))}
        </pre>
        <button
          onClick={() => copy(CLI_EXAMPLE, setCopiedCli, 'Comando')}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            padding: '4px 10px',
            borderRadius: 5,
            border: '1px solid #333',
            background: '#1a1a1a',
            fontSize: 11,
            color: '#888',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Icon name={copiedCli ? 'check' : 'copy'} size={11} />
          {copiedCli ? 'Copiado' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
