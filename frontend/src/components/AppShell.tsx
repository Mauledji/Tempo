import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { Outlet, useRouterState } from '@tanstack/react-router'
import { Sidebar } from './Sidebar'
import { ModalRoot } from './modals/ModalRoot'
import { ToastContainer } from './ToastContainer'
import { OfflineBanner } from './OfflineBanner'
import { BottomNav } from './mobile/BottomNav'

// Lazy: only loaded when the user opens the palette (Cmd+K).
const CmdPalette = lazy(() =>
  import('./CmdPalette').then((m) => ({ default: m.CmdPalette })),
)
// Lazy: returning users never see onboarding, no reason to ship it eagerly.
const WelcomeScreen = lazy(() =>
  import('./onboarding/WelcomeScreen').then((m) => ({ default: m.WelcomeScreen })),
)
const OnboardingWizard = lazy(() =>
  import('./onboarding/OnboardingWizard').then((m) => ({ default: m.OnboardingWizard })),
)
const GuidedTour = lazy(() =>
  import('./onboarding/GuidedTour').then((m) => ({ default: m.GuidedTour })),
)
import { useModalStore } from '../stores/modal'
import { useOnboardingStore } from '../stores/onboarding'
import { useIsMobile } from '../lib/useViewport'
import { NAV_LABEL, pathToViewId } from '../constants/nav'

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const onboardingStage = useOnboardingStore((s) => s.stage)
  const isMobile = useIsMobile()
  const [collapsed, setCollapsed] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (!isMobile && drawerOpen) setDrawerOpen(false)
  }, [isMobile, drawerOpen])

  useEffect(() => {
    if (isMobile) setDrawerOpen(false)
  }, [pathname, isMobile])

  useEffect(() => {
    const view = pathToViewId(pathname)
    document.title = `Tempo · ${NAV_LABEL[view]}`
  }, [pathname])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen(true)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        useModalStore.getState().open({ type: 'shortcuts-cheatsheet' })
      }
      if (e.key === 'Escape') setCmdOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const openCmd = useCallback(() => setCmdOpen(true), [])

  return (
    <div
      className={`app-shell ${isMobile ? 'is-mobile' : ''} ${drawerOpen ? 'drawer-open' : ''}`}
    >
      <OfflineBanner />
      <Sidebar
        onCmd={openCmd}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        hidden={isMobile && !drawerOpen}
      />
      {isMobile && drawerOpen && (
        <div className="sidebar-backdrop" onClick={() => setDrawerOpen(false)} />
      )}
      <main className="app-main">
        <Suspense fallback={<ViewLoadingFallback />}>
          <Outlet />
        </Suspense>
      </main>
      {isMobile && <BottomNav onOpenDrawer={() => setDrawerOpen(true)} />}
      <ModalRoot />
      <ToastContainer />
      <Suspense fallback={null}>
        {cmdOpen && <CmdPalette onClose={() => setCmdOpen(false)} />}
        {onboardingStage === 'welcome' && <WelcomeScreen />}
        {onboardingStage === 'wizard' && <OnboardingWizard />}
        {onboardingStage === 'tour' && <GuidedTour />}
      </Suspense>
    </div>
  )
}

// Lightweight fallback shown while a route's chunk loads. Uses tokenized
// surface colors so it never causes a flash of wrong-theme content.
function ViewLoadingFallback() {
  return (
    <div
      role="status"
      aria-label="Cargando vista"
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="skeleton"
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          opacity: 0.6,
        }}
      />
    </div>
  )
}
