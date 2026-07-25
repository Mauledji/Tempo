import { Icon } from '../Icon'

export function ClaudeBadge() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        fontSize: 10,
        color: 'var(--accent)',
        background: 'var(--accent-subtle)',
        border: '1px solid var(--accent-subtle-border)',
        borderRadius: 4,
        padding: '1px 5px',
        fontWeight: 500,
        flexShrink: 0,
      }}
    >
      <Icon name="sparkles" size={10} />
    </span>
  )
}
