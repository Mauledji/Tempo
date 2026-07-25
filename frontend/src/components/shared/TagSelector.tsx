import { useEffect, useRef, useState } from 'react'
import { TAG_SUGGESTIONS } from '../../constants/ui'

interface TagSelectorProps {
  tags: string[]
  onChange: (v: string[]) => void
  suggestions?: string[]
  placeholder?: string
}

export function TagSelector({
  tags,
  onChange,
  suggestions = TAG_SUGGESTIONS,
  placeholder = 'Agregar tag…',
}: TagSelectorProps) {
  const [input, setInput] = useState('')
  const [focused, setFocused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = suggestions.filter(
    (t) => !tags.includes(t) && (input === '' || t.toLowerCase().includes(input.toLowerCase())),
  )
  const showDropdown = focused && filtered.length > 0

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false)
      }
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [])

  const add = (tag: string) => {
    const t = tag.trim()
    if (!t || tags.includes(t)) return
    onChange([...tags, t])
    setInput('')
    inputRef.current?.focus()
  }
  const remove = (tag: string) => onChange(tags.filter((t) => t !== tag))

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 5,
          padding: '6px 8px',
          borderRadius: 8,
          border: `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
          background: 'var(--surface-2)',
          minHeight: 38,
          alignItems: 'center',
          cursor: 'text',
          transition: 'border-color 0.15s',
        }}
      >
        {tags.map((t) => (
          <span
            key={t}
            style={{
              fontSize: 11,
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: 20,
              background: 'var(--accent)22',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {t}
            <span
              style={{ cursor: 'pointer', opacity: 0.6 }}
              onClick={(e) => {
                e.stopPropagation()
                remove(t)
              }}
            >
              ×
            </span>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && input.trim()) {
              e.preventDefault()
              add(input)
            } else if (e.key === 'Backspace' && !input && tags.length > 0) {
              remove(tags[tags.length - 1])
            } else if (e.key === 'Escape') {
              setFocused(false)
            }
          }}
          placeholder={tags.length === 0 ? placeholder : ''}
          style={{
            border: 'none',
            background: 'transparent',
            fontSize: 12,
            color: 'var(--text-1)',
            outline: 'none',
            fontFamily: 'var(--font)',
            minWidth: 80,
            flex: 1,
          }}
        />
      </div>
      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            zIndex: 50,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            maxHeight: 180,
            overflowY: 'auto',
            padding: 4,
          }}
        >
          {filtered.slice(0, 8).map((t) => (
            <div
              key={t}
              onMouseDown={(e) => {
                e.preventDefault()
                add(t)
              }}
              style={{
                padding: '6px 10px',
                fontSize: 12,
                color: 'var(--text-1)',
                cursor: 'pointer',
                borderRadius: 5,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {t}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
