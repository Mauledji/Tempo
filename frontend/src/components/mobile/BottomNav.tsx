import { useNavigate, useRouterState } from '@tanstack/react-router'
import { Icon } from '../Icon'
import { NAV_LABEL, NAV_ICON, VIEW_PATH, pathToViewId, type ViewId } from '../../constants/nav'

interface BottomNavItem {
  id: ViewId | 'menu'
  label: string
  icon: string
}

const TABS: BottomNavItem[] = [
  { id: 'dashboard', label: NAV_LABEL.dashboard, icon: NAV_ICON.dashboard },
  { id: 'kanban', label: NAV_LABEL.kanban, icon: NAV_ICON.kanban },
  { id: 'calendar', label: NAV_LABEL.calendar, icon: NAV_ICON.calendar },
  { id: 'projects', label: NAV_LABEL.projects, icon: NAV_ICON.projects },
  { id: 'menu', label: 'Más', icon: 'menu' },
]

interface BottomNavProps {
  onOpenDrawer: () => void
}

export function BottomNav({ onOpenDrawer }: BottomNavProps) {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const view = pathToViewId(pathname)

  const handle = (id: ViewId | 'menu') => {
    if (id === 'menu') onOpenDrawer()
    else navigate({ to: VIEW_PATH[id] })
  }

  return (
    <nav className="bottom-nav" aria-label="Navegación inferior">
      {TABS.map((t) => {
        const active = t.id !== 'menu' && view === t.id
        return (
          <button
            key={t.id}
            className={`bottom-nav-item ${active ? 'active' : ''}`}
            onClick={() => handle(t.id)}
            aria-label={t.label}
            aria-current={active ? 'page' : undefined}
          >
            <Icon name={t.icon} size={20} />
            <span>{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
