import { useRef, useState } from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { Icon } from './Icon'
import { UserMenu } from './shared/UserMenu'
import { useThemeStore } from '../stores/theme'
import { NAV_LABEL, NAV_ICON, VIEW_PATH, pathToViewId, type ViewId } from '../constants/nav'
import { TEMPO_DATA } from '../data/mock'

const PRIMARY_VIEWS: ViewId[] = [
  'dashboard',
  'calendar',
  'day',
  'agenda',
  'kanban',
  'projects',
  'timeline',
  'daily',
  'progress',
  'tags',
]

const SECONDARY_VIEWS: ViewId[] = ['search', 'archived']

interface SidebarProps {
  onCmd: () => void
  collapsed: boolean
  setCollapsed: (fn: (c: boolean) => boolean) => void
  // When true, the sidebar is hidden off-screen on mobile and must be removed
  // from the a11y tree + tab order. Uses `inert` (W3C, supported in all
  // evergreen browsers since 2022) so screen readers and Tab navigation skip it.
  hidden?: boolean
}

export function Sidebar({ onCmd, collapsed, setCollapsed, hidden = false }: SidebarProps) {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const view = pathToViewId(pathname)
  const setView = (id: ViewId) => navigate({ to: VIEW_PATH[id] })
  const dark = useThemeStore((s) => s.dark)
  const toggleTheme = useThemeStore((s) => s.toggle)
  const userRowRef = useRef<HTMLDivElement | null>(null)
  const [menuAnchor, setMenuAnchor] = useState<DOMRect | null>(null)

  const pinnedProjects = TEMPO_DATA.projects.filter((p) => p.starred)

  const openUserMenu = () => {
    const el = userRowRef.current
    if (el) setMenuAnchor(el.getBoundingClientRect())
  }

  return (
    <aside
      className="sidebar"
      style={{ width: collapsed ? 56 : 220 }}
      aria-label="Navegación principal"
      aria-hidden={hidden || undefined}
      // React 18 does not yet ship `inert` in its prop types; passing it via
      // attributes is the documented escape hatch.
      {...(hidden ? { inert: '' } : {})}
    >
      {/* Logo */}
      <button
        type="button"
        className="sidebar-logo"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        aria-expanded={!collapsed}
      >
        <div className="logo-mark">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="var(--accent)" strokeWidth="1.5" />
            <line x1="12" y1="3" x2="12" y2="7" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="12" x2="16" y2="8" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="12" r="1.5" fill="var(--accent)" />
          </svg>
        </div>
        {!collapsed && <span className="logo-text">Tempo</span>}
      </button>

      {/* Quick add */}
      {!collapsed && (
        <button className="quick-add-btn" onClick={onCmd} data-tour="quick-add">
          <Icon name="plus" size={14} />
          <span>Nueva tarea</span>
          <kbd>⌘K</kbd>
        </button>
      )}

      {/* Nav */}
      <nav className="sidebar-nav" data-tour="nav">
        {PRIMARY_VIEWS.map((id) => {
          const label = NAV_LABEL[id]
          return (
            <button
              key={id}
              className={`nav-item ${view === id ? 'active' : ''}`}
              onClick={() => setView(id)}
              title={collapsed ? label : ''}
              aria-label={label}
              aria-current={view === id ? 'page' : undefined}
            >
              <Icon name={NAV_ICON[id]} size={16} />
              {!collapsed && <span>{label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Pinned projects */}
      {!collapsed && (
        <div className="sidebar-section" data-tour="projects">
          <div className="sidebar-section-label">Proyectos</div>
          {pinnedProjects.map((p) => (
            <button
              key={p.id}
              className={`nav-item proj-item ${view === 'projects' ? 'sub-active' : ''}`}
              onClick={() => setView('projects')}
            >
              <span className="proj-dot" style={{ background: p.color }} />
              <span className="proj-name">{p.name}</span>
              <span className="proj-pct">{p.progress}%</span>
            </button>
          ))}
          <button className="nav-item proj-item muted" onClick={() => setView('projects')}>
            <Icon name="plus" size={12} />
            <span>Ver todos</span>
          </button>
        </div>
      )}

      {/* Bottom controls */}
      <div className="sidebar-bottom">
        {!collapsed &&
          SECONDARY_VIEWS.map((id) => {
            const label = NAV_LABEL[id]
            return (
              <button
                key={id}
                className={`nav-item ${view === id ? 'active' : ''}`}
                onClick={() => setView(id)}
                title={collapsed ? label : ''}
              >
                <Icon name={NAV_ICON[id]} size={16} />
                <span>{label}</span>
              </button>
            )
          })}
        {!collapsed && (
          <button
            className={`nav-item ${view === 'settings' ? 'active' : ''}`}
            onClick={() => setView('settings')}
          >
            <Icon name={NAV_ICON.settings} size={16} />
            <span>{NAV_LABEL.settings}</span>
          </button>
        )}
        <button
          className="nav-item theme-toggle"
          onClick={toggleTheme}
          title={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          <Icon name={dark ? 'sun' : 'moon'} size={16} />
          {!collapsed && <span>{dark ? 'Modo claro' : 'Modo oscuro'}</span>}
        </button>
        {!collapsed && (
          <div
            ref={userRowRef}
            className="user-row"
            onClick={openUserMenu}
            style={{ cursor: 'pointer' }}
            data-tour="user"
          >
            <div className="user-avatar">{TEMPO_DATA.user.initials}</div>
            <div className="user-info">
              <div className="user-name">{TEMPO_DATA.user.name}</div>
              <div className="user-email">Racha {TEMPO_DATA.streak}d 🔥</div>
            </div>
          </div>
        )}
      </div>
      {menuAnchor && (
        <UserMenu anchor={menuAnchor} onClose={() => setMenuAnchor(null)} />
      )}
    </aside>
  )
}
