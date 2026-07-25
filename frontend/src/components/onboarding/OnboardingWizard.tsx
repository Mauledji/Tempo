import { useState } from 'react'
import { Icon } from '../Icon'
import { useOnboardingStore } from '../../stores/onboarding'
import { useToastStore } from '../../stores/toast'

const SUGGESTED_PROJECTS = [
  { name: 'AWS Academy', icon: 'cloud', color: '#2471a3' },
  { name: 'AI-ML Roadmap', icon: 'brain', color: '#7d3c98' },
  { name: 'Trabajo', icon: 'briefcase', color: '#3d6b4f' },
  { name: 'Personal', icon: 'heart', color: '#c4855a' },
  { name: 'Lecturas', icon: 'book-open', color: '#6b4c9e' },
  { name: 'Gym', icon: 'zap', color: '#c0392b' },
]

export function OnboardingWizard() {
  const startTour = useOnboardingStore((s) => s.startTour)
  const finish = useOnboardingStore((s) => s.finish)
  const addToast = useToastStore((s) => s.addToast)

  const [step, setStep] = useState(0)
  const [selectedProjects, setSelectedProjects] = useState<string[]>([
    'AWS Academy',
    'AI-ML Roadmap',
  ])
  const [apiKey, setApiKey] = useState('')

  const next = () => {
    if (step < 2) setStep(step + 1)
    else {
      addToast({ type: 'success', text: 'Setup listo', sub: 'Vamos al tour del sidebar' })
      startTour()
    }
  }
  const back = () => step > 0 && setStep(step - 1)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1500,
        background: 'rgba(0,0,0,0.55)',
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
          background: 'var(--surface)',
          borderRadius: 16,
          border: '1px solid var(--border)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.28)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: i <= step ? 'var(--accent)' : 'var(--surface-3)',
                transition: 'background 0.2s',
              }}
            />
          ))}
          <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>
            {step + 1} / 3
          </span>
        </div>

        <div style={{ padding: '24px 24px 18px', minHeight: 320 }}>
          {step === 0 && (
            <Step
              icon="folder-plus"
              title="Elegí tus proyectos iniciales"
              sub="Podés agregar más después o importar un plan desde Claude."
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 8,
                  marginTop: 14,
                }}
              >
                {SUGGESTED_PROJECTS.map((p) => {
                  const sel = selectedProjects.includes(p.name)
                  return (
                    <button
                      key={p.name}
                      onClick={() =>
                        setSelectedProjects((s) =>
                          s.includes(p.name) ? s.filter((x) => x !== p.name) : [...s, p.name],
                        )
                      }
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 9,
                        border: `1.5px solid ${sel ? p.color : 'var(--border)'}`,
                        background: sel ? p.color + '14' : 'var(--surface-2)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: p.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon name={p.icon} size={14} style={{ color: 'white' }} />
                      </span>
                      <span style={{ flex: 1, fontSize: 13, color: 'var(--text-1)', fontWeight: 500 }}>
                        {p.name}
                      </span>
                      <span
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 4,
                          border: `1.5px solid ${sel ? p.color : 'var(--border)'}`,
                          background: sel ? p.color : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {sel && <Icon name="check" size={10} style={{ color: 'white' }} />}
                      </span>
                    </button>
                  )
                })}
              </div>
              <div
                style={{
                  marginTop: 14,
                  padding: 12,
                  background: 'var(--surface-2)',
                  border: '1px dashed var(--border)',
                  borderRadius: 9,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <Icon name="upload" size={16} style={{ color: 'var(--text-3)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>
                    ¿Tenés un plan de Claude?
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                    Importá el JSON desde Ajustes → Datos
                  </div>
                </div>
              </div>
            </Step>
          )}

          {step === 1 && (
            <Step
              icon="key"
              title="Conectá tu API key de Anthropic"
              sub="Tu key se guarda local en el navegador. Podés agregarla después."
            >
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-…"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 9,
                  border: '1px solid var(--border)',
                  background: 'var(--surface-2)',
                  fontSize: 13,
                  color: 'var(--text-1)',
                  fontFamily: 'var(--font-mono, monospace)',
                  outline: 'none',
                  marginTop: 14,
                }}
              />
              <div
                style={{
                  marginTop: 12,
                  padding: '10px 12px',
                  background: '#e09050' + '15',
                  border: '1px solid #e09050' + '40',
                  borderRadius: 8,
                  display: 'flex',
                  gap: 9,
                  alignItems: 'flex-start',
                }}
              >
                <Icon name="info" size={14} style={{ color: '#e09050', flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.5 }}>
                  Conseguí tu key en <strong>console.anthropic.com</strong> → API Keys. Es BYOK
                  (bring your own key); Tempo nunca la envía a servidores propios.
                </div>
              </div>
              <button
                onClick={() => {
                  addToast({ type: 'info', text: 'Podés configurarla luego en Ajustes' })
                  next()
                }}
                style={{
                  marginTop: 12,
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-3)',
                  fontSize: 12,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Saltar este paso
              </button>
            </Step>
          )}

          {step === 2 && (
            <Step
              icon="map"
              title="Listo para empezar"
              sub="Te vamos a mostrar las partes principales del sidebar en un tour rápido."
            >
              <div
                style={{
                  marginTop: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {READY_LIST.map((r) => (
                  <div
                    key={r.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <Icon name={r.icon} size={14} style={{ color: 'var(--accent)' }} />
                    <span style={{ fontSize: 13, color: 'var(--text-1)', flex: 1 }}>{r.label}</span>
                    <Icon name="check" size={13} style={{ color: 'var(--accent)' }} />
                  </div>
                ))}
              </div>
            </Step>
          )}
        </div>

        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--surface-2)',
          }}
        >
          <button
            onClick={finish}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 12,
              color: 'var(--text-3)',
              cursor: 'pointer',
              padding: '6px 4px',
            }}
          >
            Saltar onboarding
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            {step > 0 && (
              <button
                onClick={back}
                style={{
                  padding: '8px 14px',
                  borderRadius: 7,
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  fontSize: 13,
                  color: 'var(--text-2)',
                  cursor: 'pointer',
                }}
              >
                Atrás
              </button>
            )}
            <button
              onClick={next}
              style={{
                padding: '8px 18px',
                borderRadius: 7,
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {step < 2 ? 'Siguiente' : 'Empezar tour'}
              <Icon name="arrow-right" size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StepProps {
  icon: string
  title: string
  sub: string
  children?: React.ReactNode
}

function Step({ icon, title, sub, children }: StepProps) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 11,
            background: 'var(--accent)20',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={icon} size={18} style={{ color: 'var(--accent)' }} />
        </div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-1)' }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{sub}</div>
        </div>
      </div>
      {children}
    </div>
  )
}

const READY_LIST = [
  { icon: 'folder', label: 'Proyectos creados' },
  { icon: 'key', label: 'API key configurada (o saltada)' },
  { icon: 'sparkles', label: 'Listo para crear tu primer plan' },
]
