import { useState } from 'react'
import { Icon } from '../Icon'
import { ErrorState } from '../shared/ErrorState'
import { useToastStore } from '../../stores/toast'

interface ImportPreviewModalProps {
  onClose: () => void
}

interface ImportItem {
  type: 'task' | 'event'
  title: string
  meta: string
  selected: boolean
}

const MOCK_ITEMS: ImportItem[] = [
  { type: 'task', title: 'Completar Lab VPC en AWS Academy', meta: 'AWS Academy', selected: true },
  { type: 'task', title: 'Estudiar Cap. 5 — Redes Neuronales', meta: 'AI-ML Roadmap', selected: true },
  { type: 'event', title: 'Bloque de estudio CLF-C02', meta: '26 abr 15:00-17:00', selected: true },
  { type: 'task', title: 'Setup VPC Flow Logs', meta: 'AWS Academy', selected: false },
  { type: 'task', title: 'Revisar paper sobre transformers', meta: 'AI-ML Roadmap', selected: true },
]

export function ImportPreviewModal({ onClose }: ImportPreviewModalProps) {
  const [items, setItems] = useState<ImportItem[]>(MOCK_ITEMS)
  const [invalidJson, setInvalidJson] = useState(false)
  const addToast = useToastStore((s) => s.addToast)
  const selected = items.filter((i) => i.selected).length

  const toggle = (i: number) =>
    setItems((prev) =>
      prev.map((it, idx) => (idx === i ? { ...it, selected: !it.selected } : it)),
    )

  const apply = () => {
    // TODO: integración — crear tareas/eventos desde el JSON parseado
    addToast({
      type: 'success',
      text: `${selected} elementos importados`,
      sub: 'Visual solamente — sin persistencia',
    })
    onClose()
  }

  return (
    <div
      style={{
        width: 520,
        background: 'var(--surface)',
        borderRadius: 14,
        border: '1px solid var(--border)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '88vh',
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <Icon name="sparkles" size={16} style={{ color: 'var(--accent)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>
            Preview de import desde Claude
          </div>
          <div
            onClick={() => setInvalidJson((v) => !v)}
            title="Click para alternar estado de error"
            style={{ fontSize: 11, color: 'var(--text-3)', cursor: 'pointer' }}
          >
            {invalidJson ? 'claude_plan_corrupto.json' : 'claude_plan_abril_w4.json'}
          </div>
        </div>
        {!invalidJson && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--accent)',
              background: 'var(--accent-subtle)',
              padding: '3px 10px',
              borderRadius: 20,
            }}
          >
            {selected} / {items.length}
          </span>
        )}
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
            marginLeft: 4,
          }}
        >
          <Icon name="x" size={14} style={{ color: 'var(--text-3)' }} />
        </button>
      </div>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {invalidJson ? (
          <ErrorState
            size="md"
            title="JSON inválido"
            description="El archivo no tiene el formato esperado. Verificá que el schema coincida con el ejemplo en Ajustes → Datos."
            retryLabel="Probar otro archivo"
            onRetry={() => setInvalidJson(false)}
          />
        ) : (
          items.map((item, i) => (
          <div
            key={i}
            onClick={() => toggle(i)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 20px',
              borderBottom: '1px solid var(--border)',
              background: item.selected ? 'var(--surface)' : 'var(--surface-2)',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 5,
                border: `1.5px solid ${
                  item.selected ? 'var(--accent)' : 'var(--border)'
                }`,
                background: item.selected ? 'var(--accent)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {item.selected && <Icon name="check" size={11} style={{ color: 'white' }} />}
            </div>
            <Icon
              name={item.type === 'task' ? 'check-square' : 'calendar'}
              size={14}
              style={{ color: 'var(--text-3)', flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: 'var(--text-1)' }}>{item.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{item.meta}</div>
            </div>
          </div>
          ))
        )}
      </div>
      <div
        style={{
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
          {invalidJson ? (
            <span style={{ color: '#c0392b' }}>No se puede importar — archivo inválido</span>
          ) : (
            <>
              Importar <strong>{selected}</strong> de {items.length} seleccionados
            </>
          )}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              padding: '7px 14px',
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'var(--surface-2)',
              fontSize: 13,
              color: 'var(--text-2)',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={apply}
            disabled={selected === 0 || invalidJson}
            style={{
              padding: '7px 16px',
              borderRadius: 6,
              border: 'none',
              background:
                selected === 0 || invalidJson ? 'var(--surface-3)' : 'var(--accent)',
              color: 'white',
              fontSize: 13,
              fontWeight: 500,
              cursor: selected === 0 || invalidJson ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              opacity: selected === 0 || invalidJson ? 0.6 : 1,
            }}
          >
            <Icon name="download" size={13} />
            Importar {invalidJson ? 0 : selected}
          </button>
        </div>
      </div>
    </div>
  )
}
