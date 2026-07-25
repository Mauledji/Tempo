import { useEffect, useState } from 'react'
import { Icon } from './Icon'

export function OfflineBanner() {
  const [offline, setOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false,
  )

  useEffect(() => {
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  if (!offline) return null

  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1400,
        padding: '8px 16px',
        background: '#c0392b',
        color: 'white',
        fontSize: 13,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
      }}
    >
      <Icon name="wifi-off" size={14} />
      <span>Sin conexión — los cambios se sincronizarán al reconectar</span>
    </div>
  )
}
