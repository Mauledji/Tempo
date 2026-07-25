import { useState } from 'react'
import { ModalChrome } from './ModalChrome'
import { useToastStore } from '../../stores/toast'
import type { CalendarEvent } from '../../data/mock'

interface RecurringEditModalProps {
  onClose: () => void
  event: CalendarEvent
  onConfirm: (choice: string) => void
}

type Choice = 'solo_este' | 'desde_este' | 'todos'

const CHOICE_LABELS: Record<Choice, string> = {
  solo_este: 'solo este evento',
  desde_este: 'este y siguientes',
  todos: 'toda la serie',
}

export function RecurringEditModal({ onClose, event, onConfirm }: RecurringEditModalProps) {
  const [choice, setChoice] = useState<Choice>('solo_este')
  const addToast = useToastStore((s) => s.addToast)

  const opts: { id: Choice; label: string; desc: string }[] = [
    { id: 'solo_este', label: 'Solo este evento', desc: 'Solo modifica la ocurrencia de hoy.' },
    { id: 'desde_este', label: 'Este y los siguientes', desc: 'Modifica este y los futuros.' },
    { id: 'todos', label: 'Todos los eventos', desc: 'Modifica toda la serie.' },
  ]

  const confirm = () => {
    onConfirm(choice)
    addToast({ type: 'info', text: `Editando ${CHOICE_LABELS[choice]}` })
    onClose()
  }

  return (
    <ModalChrome
      title="Editar evento recurrente"
      onClose={onClose}
      onSubmit={confirm}
      submitLabel="Continuar"
      width={420}
    >
      <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16 }}>
        Estás editando <strong>{event.title}</strong>, un evento recurrente.
      </div>
      {opts.map((o) => (
        <div
          key={o.id}
          onClick={() => setChoice(o.id)}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            padding: '12px',
            borderRadius: 10,
            border: `1.5px solid ${choice === o.id ? 'var(--accent)' : 'var(--border)'}`,
            background: choice === o.id ? 'var(--accent-subtle)' : 'var(--surface-2)',
            marginBottom: 8,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              border: `2px solid ${choice === o.id ? 'var(--accent)' : 'var(--border-2)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: 1,
            }}
          >
            {choice === o.id && (
              <div
                style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }}
              />
            )}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{o.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{o.desc}</div>
          </div>
        </div>
      ))}
    </ModalChrome>
  )
}
