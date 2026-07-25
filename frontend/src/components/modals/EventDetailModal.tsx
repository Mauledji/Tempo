import { Icon } from '../Icon'
import { CAT_OPTS } from '../../constants/ui'
import { useEventsStore } from '../../stores/events'
import { useToastStore } from '../../stores/toast'
import { useModalStore } from '../../stores/modal'
import type { CalendarEvent } from '../../data/mock'

interface EventDetailModalProps {
  onClose: () => void
  event: CalendarEvent
}

export function EventDetailModal({ onClose, event }: EventDetailModalProps) {
  const removeEvent = useEventsStore((s) => s.removeEvent)
  const addToast = useToastStore((s) => s.addToast)
  const openModal = useModalStore((s) => s.open)

  const catInfo = CAT_OPTS.find((c) => c.id === event.category) || CAT_OPTS[0]

  const actions: [string, string, () => void][] = [
    [
      'pencil',
      'Editar',
      () => {
        onClose()
        openModal({ type: 'new-event' })
      },
    ],
    ['copy', 'Duplicar', () => addToast({ type: 'info', text: 'Evento duplicado' })],
    [
      'trash-2',
      'Eliminar',
      () => {
        removeEvent(event.id)
        addToast({ type: 'undo', text: 'Evento eliminado', action: 'Deshacer' })
        onClose()
      },
    ],
  ]

  return (
    <div
      style={{
        width: 300,
        background: 'var(--surface)',
        borderRadius: 14,
        border: '1px solid var(--border)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          background: `color-mix(in srgb, ${catInfo.color} 10%, transparent)`,
          borderBottom: `3px solid ${catInfo.color}`,
          padding: '14px 16px',
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginBottom: 6 }}>
          {event.title}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            color: 'var(--text-2)',
          }}
        >
          <Icon name="clock" size={12} />
          <span>
            {event.start.split('T')[1].slice(0, 5)} – {event.end.split('T')[1].slice(0, 5)}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              padding: '1px 8px',
              borderRadius: 10,
              background: `color-mix(in srgb, ${catInfo.color} 12%, transparent)`,
              color: catInfo.color,
            }}
          >
            {catInfo.label}
          </span>
        </div>
        {event.recurrent && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11,
              color: 'var(--text-3)',
              marginTop: 6,
            }}
          >
            <Icon name="repeat" size={11} />
            Evento recurrente
          </div>
        )}
      </div>
      <div style={{ padding: '10px 12px', display: 'flex', gap: 6 }}>
        {actions.map(([ic, label, action]) => (
          <button
            key={label}
            onClick={action}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: '8px 4px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--surface-2)',
              cursor: 'pointer',
              fontSize: 11,
              color: label === 'Eliminar' ? '#c0392b' : 'var(--text-2)',
            }}
          >
            <Icon
              name={ic}
              size={14}
              style={{ color: label === 'Eliminar' ? '#c0392b' : 'var(--text-3)' }}
            />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
