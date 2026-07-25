import { PROJECT_COLORS } from '../../constants/ui'

interface ColorPickerProps {
  value: string
  onChange: (v: string) => void
  colors?: string[]
  size?: number
}

export function ColorPicker({ value, onChange, colors = PROJECT_COLORS, size = 30 }: ColorPickerProps) {
  return (
    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
      {colors.map((c) => (
        <div
          key={c}
          onClick={() => onChange(c)}
          style={{
            width: size,
            height: size,
            borderRadius: 9,
            background: c,
            cursor: 'pointer',
            border: `3px solid ${c === value ? 'var(--text-1)' : 'transparent'}`,
            transition: 'border 0.1s',
          }}
        />
      ))}
    </div>
  )
}
