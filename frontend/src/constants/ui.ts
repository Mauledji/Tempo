import type { Priority, TaskCol, EventCategory } from '../data/mock'

// Reference CSS variables defined in src/index.css so a theme override picks
// up automatically — JS-side hardcoded hexes used to drift from the CSS tokens.
export const PRIORITY_COLOR: Record<Priority, string> = {
  urgent: 'var(--color-priority-urgent)',
  high: 'var(--color-priority-high)',
  medium: 'var(--color-priority-medium)',
  low: 'var(--color-priority-low)',
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  urgent: 'Urgente',
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
}

export interface PriorityOpt {
  id: Priority
  label: string
  icon: string
  color: string
}

export const PRIORITY_OPTS: PriorityOpt[] = [
  { id: 'urgent', label: 'Urgente', icon: 'chevrons-up', color: 'var(--color-priority-urgent)' },
  { id: 'high', label: 'Alta', icon: 'chevron-up', color: 'var(--color-priority-high)' },
  { id: 'medium', label: 'Media', icon: 'minus', color: 'var(--color-priority-medium)' },
  { id: 'low', label: 'Baja', icon: 'chevron-down', color: 'var(--color-priority-low)' },
]

export const CAT_COLOR: Record<string, string> = {
  work: 'var(--color-cat-work)',
  class: 'var(--color-cat-class)',
  study: 'var(--color-cat-study)',
  personal: 'var(--color-cat-personal)',
  studyCLF: 'var(--color-cat-study-clf)',
  studyAIML: 'var(--color-cat-study-aiml)',
}

export const CAT_LABELS: Record<string, string> = {
  work: 'Trabajo',
  class: 'Clases',
  study: 'Estudio',
  personal: 'Personal',
}

export interface CatOpt {
  id: EventCategory
  label: string
  color: string
}

export const CAT_OPTS: CatOpt[] = [
  { id: 'work', label: 'Trabajo', color: 'var(--color-cat-work)' },
  { id: 'class', label: 'Clases', color: 'var(--color-cat-class)' },
  { id: 'studyCLF', label: 'Estudio CLF', color: 'var(--color-cat-study-clf)' },
  { id: 'studyAIML', label: 'Estudio AI-ML', color: 'var(--color-cat-study-aiml)' },
  { id: 'personal', label: 'Personal', color: 'var(--color-cat-personal)' },
]

export const COL_OPTS: TaskCol[] = ['inbox', 'today', 'week', 'upcoming']

export const COL_LABELS: Record<TaskCol, string> = {
  inbox: 'Inbox',
  today: 'Hoy',
  week: 'Esta semana',
  upcoming: 'Próximas',
  done: 'Listo',
}

export const TAG_SUGGESTIONS = [
  'estudio',
  'trabajo',
  'clase',
  'setup',
  'código',
  'reunión',
  'examen',
  'hito',
  'admin',
  'entrega',
  'lectura',
]

export const PROJECT_COLORS = [
  '#3d6b4f',
  '#7d3c98',
  '#2471a3',
  '#c0392b',
  '#ca6f1e',
  '#1a7a4a',
  '#2c7bb6',
  '#6b4c9e',
  '#7a6060',
  '#2e7d52',
]

export const PROJECT_ICONS = [
  'cloud',
  'brain',
  'zap',
  'layers',
  'briefcase',
  'graduation-cap',
  'book-open',
  'cpu',
  'database',
  'globe',
  'terminal',
  'git-branch',
  'code-2',
  'server',
  'target',
  'flag',
]
