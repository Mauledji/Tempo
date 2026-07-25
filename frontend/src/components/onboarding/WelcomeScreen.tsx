import { Icon } from '../Icon'
import { useOnboardingStore } from '../../stores/onboarding'

export function WelcomeScreen() {
  const startWizard = useOnboardingStore((s) => s.startWizard)
  const finish = useOnboardingStore((s) => s.finish)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1500,
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 560,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 22,
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
          }}
        >
          <Icon name="sparkles" size={38} style={{ color: 'white' }} />
        </div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: 'var(--text-1)',
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          Bienvenido a Tempo
        </h1>
        <p
          style={{
            fontSize: 15,
            color: 'var(--text-2)',
            maxWidth: 440,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Tu planner personal con IA. Organizá tareas, eventos y proyectos —
          y dejá que Claude te ayude a planificar.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            margin: '12px 0 4px',
            width: '100%',
            maxWidth: 480,
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              style={{
                padding: '14px 10px',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Icon name={f.icon} size={20} style={{ color: 'var(--accent)' }} />
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{f.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.4 }}>
                {f.sub}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button
            onClick={startWizard}
            style={{
              padding: '11px 22px',
              borderRadius: 8,
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            Empezar
            <Icon name="arrow-right" size={14} />
          </button>
          <button
            onClick={finish}
            style={{
              padding: '11px 18px',
              borderRadius: 8,
              background: 'transparent',
              color: 'var(--text-2)',
              border: '1px solid var(--border)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Saltar
          </button>
        </div>
      </div>
    </div>
  )
}

const FEATURES = [
  { icon: 'check-square', title: 'Tareas', sub: 'Kanban y prioridades' },
  { icon: 'calendar', title: 'Calendario', sub: 'Eventos y bloques' },
  { icon: 'zap', title: 'IA', sub: 'Planes con Claude' },
]
