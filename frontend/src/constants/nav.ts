export type ViewId =
  | 'dashboard'
  | 'calendar'
  | 'day'
  | 'agenda'
  | 'kanban'
  | 'projects'
  | 'timeline'
  | 'daily'
  | 'progress'
  | 'tags'
  | 'search'
  | 'archived'
  | 'settings'

export const NAV_LABEL: Record<ViewId, string> = {
  dashboard: 'Inicio',
  calendar: 'Calendario',
  day: 'Día',
  agenda: 'Agenda',
  kanban: 'Tareas',
  projects: 'Proyectos',
  timeline: 'Línea de tiempo',
  daily: 'Nota diaria',
  progress: 'Progreso',
  tags: 'Etiquetas',
  search: 'Buscar',
  archived: 'Archivo',
  settings: 'Ajustes',
}

export const NAV_ICON: Record<ViewId, string> = {
  dashboard: 'layout-dashboard',
  calendar: 'calendar',
  day: 'sun',
  agenda: 'list',
  kanban: 'check-square',
  projects: 'folder-open',
  timeline: 'gantt-chart',
  daily: 'book-open',
  progress: 'trending-up',
  tags: 'hash',
  search: 'search',
  archived: 'archive',
  settings: 'settings',
}

// `as const satisfies …` preserves literal types for each value (so TanStack
// Router can compute typed full-paths like `/tareas/$taskId`) while still
// enforcing the Record<ViewId, string> shape.
export const VIEW_PATH = {
  dashboard: '/',
  calendar: '/calendario',
  day: '/dia',
  agenda: '/agenda',
  kanban: '/tareas',
  projects: '/proyectos',
  timeline: '/timeline',
  daily: '/nota',
  progress: '/progreso',
  tags: '/etiquetas',
  search: '/buscar',
  archived: '/archivo',
  settings: '/ajustes',
} as const satisfies Record<ViewId, string>

export const PATH_TO_VIEW: Record<string, ViewId> = Object.fromEntries(
  (Object.entries(VIEW_PATH) as [ViewId, string][]).map(([id, path]) => [path, id]),
)

// Sorted longest-first so nested paths (e.g. "/calendario") match before "/".
const PREFIX_MATCHES: [string, ViewId][] = (Object.entries(VIEW_PATH) as [ViewId, string][])
  .filter(([, path]) => path !== '/')
  .sort((a, b) => b[1].length - a[1].length)
  .map(([id, path]) => [path, id])

export function pathToViewId(pathname: string): ViewId {
  const exact = PATH_TO_VIEW[pathname]
  if (exact) return exact
  for (const [path, id] of PREFIX_MATCHES) {
    if (pathname.startsWith(path + '/')) return id
  }
  return 'dashboard'
}
