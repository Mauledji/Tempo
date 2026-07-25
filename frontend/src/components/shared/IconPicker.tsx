import { useMemo, useState } from 'react'
import { Icon } from '../Icon'
import { PROJECT_ICONS } from '../../constants/ui'

interface IconPickerProps {
  value: string
  onChange: (v: string) => void
  highlight?: string
  icons?: string[]
}

export function IconPicker({ value, onChange, highlight = 'var(--accent)', icons = PROJECT_ICONS }: IconPickerProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return icons
    const q = query.trim().toLowerCase()
    return icons.filter((i) => i.toLowerCase().includes(q))
  }, [icons, query])

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar icono…"
        style={{
          width: '100%',
          padding: '7px 10px',
          borderRadius: 7,
          border: '1px solid var(--border)',
          background: 'var(--surface-2)',
          fontSize: 12,
          color: 'var(--text-1)',
          fontFamily: 'var(--font)',
          outline: 'none',
          marginBottom: 8,
        }}
      />
      {filtered.length === 0 ? (
        <div style={{ fontSize: 11, color: 'var(--text-3)', padding: '8px 4px' }}>
          Sin resultados
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {filtered.map((ic) => {
            const sel = ic === value
            return (
              <div
                key={ic}
                onClick={() => onChange(ic)}
                title={ic}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  background: sel ? highlight : 'var(--surface-2)',
                  border: `1.5px solid ${sel ? highlight : 'var(--border)'}`,
                  transition: 'all 0.15s',
                }}
              >
                <Icon name={ic} size={16} style={{ color: sel ? 'white' : 'var(--text-3)' }} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
