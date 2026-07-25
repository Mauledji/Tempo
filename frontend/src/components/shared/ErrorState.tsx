import { Icon } from '../Icon'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  retryLabel?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ErrorState({
  title = 'Algo salió mal',
  description = 'Intentá de nuevo o recargá la página.',
  onRetry,
  retryLabel = 'Reintentar',
  size = 'md',
}: ErrorStateProps) {
  const padding = size === 'sm' ? '20px 16px' : size === 'lg' ? '56px 24px' : '36px 20px'
  const iconSize = size === 'sm' ? 22 : size === 'lg' ? 40 : 30

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding,
      }}
    >
      <div
        style={{
          width: size === 'sm' ? 40 : 56,
          height: size === 'sm' ? 40 : 56,
          borderRadius: '50%',
          background: '#c0392b18',
          border: '1px solid #c0392b40',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        <Icon
          name="alert-triangle"
          size={iconSize}
          style={{ color: '#c0392b' }}
        />
      </div>
      <div
        style={{
          fontSize: size === 'sm' ? 13 : 14,
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
            maxWidth: 340,
            lineHeight: 1.5,
            marginBottom: onRetry ? 14 : 0,
          }}
        >
          {description}
        </div>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '7px 16px',
            borderRadius: 7,
            border: '1px solid var(--border)',
            background: 'var(--surface-2)',
            color: 'var(--text-1)',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Icon name="refresh-cw" size={12} />
          <span>{retryLabel}</span>
        </button>
      )}
    </div>
  )
}
