import { Icon } from '../Icon'

interface ShortcutsCheatsheetProps {
  onClose: () => void
}

interface Group {
  label: string
  items: Array<[string, string]>
}

const GROUPS: Group[] = [
  {
    label: 'Global',
    items: [
      ['⌘K', 'Abrir paleta de comandos'],
      ['⌘/', 'Ver atajos'],
      ['⌘N', 'Nueva tarea'],
      ['⌘E', 'Nuevo evento'],
      ['⌘P', 'Nuevo proyecto'],
    ],
  },
  {
    label: 'Navegación',
    items: [
      ['1', 'Dashboard'],
      ['2', 'Calendario'],
      ['3', 'Tareas'],
      ['4', 'Proyectos'],
      ['5', 'Progreso'],
      ['6', 'Daily Note'],
    ],
  },
  {
    label: 'Tareas',
    items: [
      ['Space', 'Completar'],
      ['E', 'Editar'],
      ['Del', 'Eliminar'],
      ['P', 'Prioridad'],
      ['D', 'Fecha'],
      ['T', 'Tag'],
    ],
  },
  {
    label: 'Calendario',
    items: [
      ['W', 'Vista semana'],
      ['M', 'Vista mes'],
      ['A', 'Agenda'],
      ['←→', 'Semana anterior/siguiente'],
      ['T', 'Hoy'],
    ],
  },
]

export function ShortcutsCheatsheet({ onClose }: ShortcutsCheatsheetProps) {
  return (
    <div
      style={{
        width: 580,
        background: 'var(--surface)',
        borderRadius: 14,
        border: '1px solid var(--border)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '16px 22px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--text-1)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Icon name="keyboard" size={16} style={{ color: 'var(--accent)' }} />
          Atajos de teclado
        </div>
        <button
          onClick={onClose}
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'var(--surface-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Icon name="x" size={14} style={{ color: 'var(--text-3)' }} />
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        {GROUPS.map((g, gi) => (
          <div
            key={g.label}
            style={{
              padding: '14px 20px',
              borderRight: gi % 2 === 0 ? '1px solid var(--border)' : 'none',
              borderBottom: gi < 2 ? '1px solid var(--border)' : 'none',
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--text-3)',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                marginBottom: 10,
              }}
            >
              {g.label}
            </div>
            {g.items.map(([k, l]) => (
              <div
                key={k}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 7,
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{l}</span>
                <kbd
                  style={{
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 5,
                    padding: '2px 6px',
                    color: 'var(--text-1)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {k}
                </kbd>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div
        style={{
          padding: '12px 22px',
          borderTop: '1px solid var(--border)',
          textAlign: 'center',
        }}
      >
        <button
          onClick={onClose}
          style={{
            padding: '7px 24px',
            borderRadius: 7,
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            fontSize: 12,
            color: 'var(--text-2)',
            cursor: 'pointer',
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}
