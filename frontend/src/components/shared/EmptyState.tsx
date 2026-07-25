import type { ReactNode } from 'react'
import { Icon } from '../Icon'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  secondary?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  actionLabel,
  onAction,
  secondary,
  size = 'md',
}: EmptyStateProps) {
  const padding = size === 'sm' ? '24px 16px' : size === 'lg' ? '56px 24px' : '40px 20px'
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 44 : 32
  const iconBox = size === 'sm' ? 44 : size === 'lg' ? 72 : 56
  const titleSize = size === 'sm' ? 13 : size === 'lg' ? 16 : 14

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding,
        color: 'var(--text-2)',
      }}
    >
      <div
        style={{
          width: iconBox,
          height: iconBox,
          borderRadius: '50%',
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 14,
        }}
      >
        <Icon name={icon} size={iconSize} style={{ color: 'var(--text-3)' }} />
      </div>
      <div
        style={{
          fontSize: titleSize,
          fontWeight: 600,
          color: 'var(--text-1)',
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      {description && (
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-3)',
            maxWidth: 320,
            lineHeight: 1.5,
            marginBottom: actionLabel || secondary ? 16 : 0,
          }}
        >
          {description}
        </div>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            padding: '7px 16px',
            borderRadius: 7,
            border: 'none',
            background: 'var(--accent)',
            color: 'white',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Icon name="plus" size={12} />
          <span>{actionLabel}</span>
        </button>
      )}
      {secondary && <div style={{ marginTop: 10 }}>{secondary}</div>}
    </div>
  )
}
