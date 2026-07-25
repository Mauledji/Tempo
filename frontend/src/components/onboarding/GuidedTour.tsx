import { useEffect, useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '../Icon'
import { useOnboardingStore } from '../../stores/onboarding'

interface TourStep {
  target: string
  title: string
  body: string
  placement?: 'right' | 'top' | 'bottom'
}

const STEPS: TourStep[] = [
  {
    target: '[data-tour="quick-add"]',
    title: 'Crear rápido',
    body: 'Abre el command palette con ⌘K para crear tareas, eventos o saltar a cualquier vista.',
    placement: 'right',
  },
  {
    target: '[data-tour="nav"]',
    title: 'Tus vistas',
    body: 'Dashboard, calendario, kanban, proyectos, timeline. Todo a un click desde el sidebar.',
    placement: 'right',
  },
  {
    target: '[data-tour="projects"]',
    title: 'Proyectos pinneados',
    body: 'Los proyectos favoritos viven acá con su progreso al lado. Click para entrar a la vista.',
    placement: 'right',
  },
  {
    target: '[data-tour="user"]',
    title: 'Tu menú',
    body: 'Ajustes, perfil, atajos (⌘/) y dark mode. ¡Listo, ya estás familiar con Tempo!',
    placement: 'right',
  },
]

const PADDING = 8

export function GuidedTour() {
  const finish = useOnboardingStore((s) => s.finish)
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [tick, setTick] = useState(0)

  const current = STEPS[step]

  useLayoutEffect(() => {
    const el = document.querySelector(current.target) as HTMLElement | null
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' })
      setRect(el.getBoundingClientRect())
    } else {
      setRect(null)
    }
  }, [step, tick, current.target])

  useEffect(() => {
    const onResize = () => setTick((t) => t + 1)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish()
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (step < STEPS.length - 1) setStep(step + 1)
        else finish()
      }
      if (e.key === 'ArrowLeft' && step > 0) setStep(step - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step, finish])

  const next = () => (step < STEPS.length - 1 ? setStep(step + 1) : finish())
  const back = () => step > 0 && setStep(step - 1)

  if (!rect) {
    return createPortal(
      <div style={overlayStyle}>
        <div style={cardWrap}>
          <TourCard
            step={step}
            total={STEPS.length}
            title={current.title}
            body={current.body}
            onNext={next}
            onBack={back}
            onSkip={finish}
          />
        </div>
      </div>,
      document.body,
    )
  }

  const hole = {
    x: Math.max(rect.left - PADDING, 0),
    y: Math.max(rect.top - PADDING, 0),
    w: rect.width + PADDING * 2,
    h: rect.height + PADDING * 2,
  }

  let cardLeft = hole.x + hole.w + 16
  let cardTop = hole.y
  if (cardLeft + 320 > window.innerWidth - 16) {
    cardLeft = Math.max(16, hole.x - 320 - 16)
  }
  if (cardTop + 200 > window.innerHeight - 16) {
    cardTop = Math.max(16, window.innerHeight - 200 - 16)
  }

  return createPortal(
    <>
      <svg
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1500,
          pointerEvents: 'auto',
        }}
        onClick={finish}
      >
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect x={hole.x} y={hole.y} width={hole.w} height={hole.h} rx={10} fill="black" />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.62)"
          mask="url(#tour-mask)"
        />
        <rect
          x={hole.x}
          y={hole.y}
          width={hole.w}
          height={hole.h}
          rx={10}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={2}
          style={{ pointerEvents: 'none' }}
        />
      </svg>
      <div
        style={{
          position: 'fixed',
          top: cardTop,
          left: cardLeft,
          zIndex: 1501,
        }}
      >
        <TourCard
          step={step}
          total={STEPS.length}
          title={current.title}
          body={current.body}
          onNext={next}
          onBack={back}
          onSkip={finish}
        />
      </div>
    </>,
    document.body,
  )
}

interface TourCardProps {
  step: number
  total: number
  title: string
  body: string
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

function TourCard({ step, total, title, body, onNext, onBack, onSkip }: TourCardProps) {
  const isLast = step === total - 1
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: 320,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        boxShadow: '0 16px 48px rgba(0,0,0,0.32)',
        padding: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'var(--accent)20',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="sparkles" size={14} style={{ color: 'var(--accent)' }} />
        </div>
        <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>
          {title}
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
          {step + 1} / {total}
        </span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.55, marginBottom: 12 }}>
        {body}
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: i <= step ? 'var(--accent)' : 'var(--surface-3)',
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={onSkip}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: 11,
            color: 'var(--text-3)',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          Saltar
        </button>
        <div style={{ display: 'flex', gap: 6 }}>
          {step > 0 && (
            <button
              onClick={onBack}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--surface-2)',
                fontSize: 12,
                color: 'var(--text-2)',
                cursor: 'pointer',
              }}
            >
              Atrás
            </button>
          )}
          <button
            onClick={onNext}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: 'none',
              background: 'var(--accent)',
              color: 'white',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            {isLast ? 'Listo' : 'Siguiente'}
            <Icon name={isLast ? 'check' : 'arrow-right'} size={11} />
          </button>
        </div>
      </div>
    </div>
  )
}

const overlayStyle = {
  position: 'fixed' as const,
  inset: 0,
  zIndex: 1500,
  background: 'rgba(0,0,0,0.55)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
}

const cardWrap = {
  width: '100%',
  maxWidth: 360,
}
