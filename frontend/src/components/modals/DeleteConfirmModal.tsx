import { ModalChrome } from './ModalChrome'
import { Icon } from '../Icon'
import { useToastStore } from '../../stores/toast'

interface DeleteConfirmModalProps {
  onClose: () => void
  itemName: string
  onConfirm: () => void
}

export function DeleteConfirmModal({ onClose, itemName, onConfirm }: DeleteConfirmModalProps) {
  const addToast = useToastStore((s) => s.addToast)
  const del = () => {
    onConfirm()
    addToast({ type: 'undo', text: `"${itemName}" eliminado`, action: 'Deshacer' })
    onClose()
  }
  return (
    <ModalChrome
      title=""
      onClose={onClose}
      onSubmit={del}
      submitLabel="Eliminar"
      danger
      width={400}
    >
      <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: '#c0392b18',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
          }}
        >
          <Icon name="alert-triangle" size={26} style={{ color: '#c0392b' }} />
        </div>
        <div
          style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)', marginBottom: 8 }}
        >
          ¿Eliminar "{itemName}"?
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>
          Esta acción no se puede deshacer. El elemento será eliminado permanentemente.
        </div>
      </div>
    </ModalChrome>
  )
}
