import { useMemo, useRef, useState } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { Icon } from '../components/Icon'
import { EmptyState } from '../components/shared/EmptyState'
import { useNotesStore } from '../stores/notes'
import { TODAY, toDateKey } from '../lib/date'

const TEMPLATE = `## 🏆 Wins del día
-

## 🎯 Focus principal
-

## 🚧 Blockers
-

## 💭 Reflexión
`

const SECTIONS = [
  { icon: 'trophy', label: 'Wins' },
  { icon: 'target', label: 'Focus' },
  { icon: 'alert-triangle', label: 'Blockers' },
  { icon: 'message-circle', label: 'Reflexión' },
]

type Mode = 'edit' | 'preview'

marked.setOptions({ breaks: true, gfm: true })

export function DailyNote() {
  const notes = useNotesStore((s) => s.notes)
  const setNote = useNotesStore((s) => s.setNote)

  const [dateOffset, setDateOffset] = useState(0)
  const [saved, setSaved] = useState(true)
  const [mode, setMode] = useState<Mode>('edit')
  const saveTimer = useRef<number | null>(null)

  const currentDate = new Date(TODAY)
  currentDate.setDate(currentDate.getDate() + dateOffset)
  const dateKey = toDateKey(currentDate)
  const dateLabel = currentDate.toLocaleDateString('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const currentNote = notes[dateKey] ?? TEMPLATE

  const previewHtml = useMemo(() => {
    const raw = marked.parse(currentNote, { async: false }) as string
    return DOMPurify.sanitize(raw)
  }, [currentNote])

  const handleChange = (val: string) => {
    setSaved(false)
    setNote(dateKey, val)
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => setSaved(true), 1200)
  }

  return (
    <div
      className="view-container fill"
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <div
        className="view-header"
        style={{ flexShrink: 0, padding: '24px 28px 0', margin: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              className="icon-btn"
              onClick={() => setDateOffset((d) => d - 1)}
            >
              <Icon name="chevron-left" size={16} />
            </button>
            <button className="icon-btn" onClick={() => setDateOffset(0)}>
              Hoy
            </button>
            <button
              className="icon-btn"
              onClick={() => setDateOffset((d) => d + 1)}
            >
              <Icon name="chevron-right" size={16} />
            </button>
          </div>
          <h1 className="view-title" style={{ textTransform: 'capitalize' }}>
            {dateLabel}
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="toggle-group">
            <button
              className={`toggle-btn ${mode === 'edit' ? 'active' : ''}`}
              onClick={() => setMode('edit')}
            >
              <Icon name="pencil" size={12} />
              <span>Editar</span>
            </button>
            <button
              className={`toggle-btn ${mode === 'preview' ? 'active' : ''}`}
              onClick={() => setMode('preview')}
            >
              <Icon name="eye" size={12} />
              <span>Vista</span>
            </button>
          </div>
          <span
            style={{
              fontSize: 12,
              color: saved ? 'var(--accent)' : 'var(--text-3)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Icon name={saved ? 'check-circle' : 'loader'} size={13} />
            {saved ? 'Guardado' : 'Guardando…'}
          </span>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          gap: 20,
          overflow: 'hidden',
          padding: '20px 28px 24px',
        }}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {mode === 'edit' ? (
            <textarea
              value={currentNote}
              onChange={(e) => handleChange(e.target.value)}
              style={{
                flex: 1,
                width: '100%',
                padding: '24px 28px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                resize: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: 14,
                lineHeight: 1.8,
                color: 'var(--text-1)',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              placeholder={TEMPLATE}
            />
          ) : (
            <div
              className="markdown-preview"
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px 28px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                fontSize: 14,
                lineHeight: 1.7,
                color: 'var(--text-1)',
              }}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          )}
        </div>

        <div
          style={{
            width: 200,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div className="card" style={{ padding: '14px 16px' }}>
            <div className="section-label" style={{ marginBottom: 10 }}>
              SECCIONES
            </div>
            {SECTIONS.map((s) => (
              <button
                key={s.label}
                className="nav-item"
                style={{ width: '100%', padding: '6px 8px' }}
              >
                <Icon name={s.icon} size={13} />
                <span style={{ fontSize: 12 }}>{s.label}</span>
              </button>
            ))}
          </div>

          <div className="card" style={{ padding: '14px 16px' }}>
            <div className="section-label" style={{ marginBottom: 10 }}>
              ANTERIORES
            </div>
            {Object.keys(notes).length === 0 ? (
              <EmptyState
                size="sm"
                icon="book-open"
                title="Aún sin entradas"
                description="Empezá a escribir y tus notas aparecerán acá."
              />
            ) : (
              [-1, -2, -3, -4, -5].map((offset) => {
                const d = new Date(TODAY)
                d.setDate(d.getDate() + offset)
                const k = toDateKey(d)
                const hasNote = !!notes[k]
                return (
                  <button
                    key={offset}
                    className="nav-item"
                    style={{ width: '100%', padding: '5px 8px' }}
                    onClick={() => setDateOffset(offset)}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: hasNote ? 'var(--accent)' : 'var(--surface-3)',
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 12, color: 'var(--text-2)' }}>
                      {d.toLocaleDateString('es', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </button>
                )
              })
            )}
          </div>

          <button
            className="btn-ghost"
            style={{ justifyContent: 'center' }}
            onClick={() => handleChange(TEMPLATE)}
          >
            <Icon name="rotate-ccw" size={13} />
            <span>Reset plantilla</span>
          </button>
        </div>
      </div>
    </div>
  )
}
