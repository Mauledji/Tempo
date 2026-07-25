interface ProgressBarProps {
  value: number
  color?: string
  height?: number
}

export function ProgressBar({ value, color, height = 4 }: ProgressBarProps) {
  return (
    <div style={{ height, background: 'var(--surface-3)', borderRadius: 2, overflow: 'hidden' }}>
      <div
        style={{
          height: '100%',
          width: `${value}%`,
          background: color || 'var(--accent)',
          borderRadius: 2,
          transition: 'width 0.8s ease',
        }}
      />
    </div>
  )
}
