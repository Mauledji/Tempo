import { lazy } from 'react'
import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { AppShell } from './components/AppShell'
import { VIEW_PATH } from './constants/nav'

// Each view is lazy-loaded so its bundle (and heavy deps like recharts,
// dnd-kit, framer-motion) only ships when the route is visited.
// Suspense fallback is wired in AppShell around <Outlet />.
const Dashboard = lazy(() => import('./views/Dashboard').then((m) => ({ default: m.Dashboard })))
const CalendarView = lazy(() =>
  import('./views/CalendarView').then((m) => ({ default: m.CalendarView })),
)
const DailyView = lazy(() => import('./views/DailyView').then((m) => ({ default: m.DailyView })))
const AgendaView = lazy(() => import('./views/AgendaView').then((m) => ({ default: m.AgendaView })))
const KanbanView = lazy(() => import('./views/KanbanView').then((m) => ({ default: m.KanbanView })))
const ProjectsView = lazy(() =>
  import('./views/ProjectsView').then((m) => ({ default: m.ProjectsView })),
)
const TimelineView = lazy(() =>
  import('./views/TimelineView').then((m) => ({ default: m.TimelineView })),
)
const DailyNote = lazy(() => import('./views/DailyNote').then((m) => ({ default: m.DailyNote })))
const ProgressView = lazy(() =>
  import('./views/ProgressView').then((m) => ({ default: m.ProgressView })),
)
const TagsView = lazy(() => import('./views/TagsView').then((m) => ({ default: m.TagsView })))
const GlobalSearchView = lazy(() =>
  import('./views/GlobalSearchView').then((m) => ({ default: m.GlobalSearchView })),
)
const ArchivedView = lazy(() =>
  import('./views/ArchivedView').then((m) => ({ default: m.ArchivedView })),
)
const SettingsView = lazy(() =>
  import('./views/SettingsView').then((m) => ({ default: m.SettingsView })),
)

const rootRoute = createRootRoute({ component: AppShell })

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: VIEW_PATH.dashboard,
  component: Dashboard,
})

const calendarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: VIEW_PATH.calendar,
  component: CalendarView,
})

const eventDetailRoute = createRoute({
  getParentRoute: () => calendarRoute,
  path: '$eventId',
  component: () => null,
})

const dayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: VIEW_PATH.day,
  component: DailyView,
})

const agendaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: VIEW_PATH.agenda,
  component: AgendaView,
})

const kanbanRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: VIEW_PATH.kanban,
  component: KanbanView,
})

const taskDetailRoute = createRoute({
  getParentRoute: () => kanbanRoute,
  path: '$taskId',
  component: () => null,
})

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: VIEW_PATH.projects,
  component: ProjectsView,
})

const projectDetailRoute = createRoute({
  getParentRoute: () => projectsRoute,
  path: '$projectId',
  component: () => null,
})

const timelineRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: VIEW_PATH.timeline,
  component: TimelineView,
})

const dailyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: VIEW_PATH.daily,
  component: DailyNote,
})

const progressRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: VIEW_PATH.progress,
  component: ProgressView,
})

const tagsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: VIEW_PATH.tags,
  component: TagsView,
})

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: VIEW_PATH.search,
  component: GlobalSearchView,
})

const archivedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: VIEW_PATH.archived,
  component: ArchivedView,
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: VIEW_PATH.settings,
  component: SettingsView,
})

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  calendarRoute.addChildren([eventDetailRoute]),
  dayRoute,
  agendaRoute,
  kanbanRoute.addChildren([taskDetailRoute]),
  projectsRoute.addChildren([projectDetailRoute]),
  timelineRoute,
  dailyRoute,
  progressRoute,
  tagsRoute,
  searchRoute,
  archivedRoute,
  settingsRoute,
])

export const router = createRouter({ routeTree, defaultPreload: 'intent' })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
