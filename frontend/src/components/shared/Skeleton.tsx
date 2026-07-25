import type { CSSProperties } from 'react'

interface SkeletonProps {
  width?: number | string
  height?: number | string
  radius?: number
  style?: CSSProperties
}

export function Skeleton({
  width = '100%',
  height = 12,
  radius = 6,
  style,
}: SkeletonProps) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  )
}

export function KanbanSkeleton() {
  return (
    <div
      className="kanban-board"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 12,
        padding: '0 28px 20px',
      }}
    >
      {Array.from({ length: 5 }).map((_, col) => (
        <div
          key={col}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 6px 10px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <Skeleton width={70} height={12} />
            <Skeleton width={22} height={16} radius={8} />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Skeleton width={16} height={16} radius={4} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Skeleton height={11} width={`${60 + i * 10}%`} />
                  <Skeleton height={9} width="45%" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                <Skeleton width={50} height={14} radius={10} />
                <Skeleton width={40} height={14} radius={10} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export function CalendarSkeleton() {
  return (
    <div
      style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '48px repeat(7, 1fr)',
        gridAutoRows: 56,
        overflow: 'hidden',
      }}
    >
      <div />
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          style={{
            padding: '10px 8px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Skeleton width={26} height={9} />
          <Skeleton width={28} height={28} radius={14} />
        </div>
      ))}
      {Array.from({ length: 7 * 6 }).map((_, i) => (
        <div
          key={i}
          style={{
            borderRight: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            padding: 6,
          }}
        >
          {i % 5 === 0 && <Skeleton height={30} />}
        </div>
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div
      style={{
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skeleton width={180} height={22} />
        <Skeleton width={260} height={12} />
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <Skeleton width={80} height={10} />
            <Skeleton width={60} height={24} />
            <Skeleton width="100%" height={8} />
          </div>
        ))}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 16,
        }}
      >
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <Skeleton width={120} height={12} />
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} height={14} width={`${70 + ((j * 5) % 20)}%`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
