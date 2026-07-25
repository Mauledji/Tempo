export type KnownProjectId = 'clf' | 'aiml' | 'dbt' | 'aws' | 'cis' | 'pes'
export type ProjectId = KnownProjectId | (string & {})

export type Priority = 'urgent' | 'high' | 'medium' | 'low'
export type TaskCol = 'inbox' | 'today' | 'week' | 'upcoming' | 'done'

export type KnownEventCategory = 'work' | 'class' | 'study' | 'personal' | 'studyCLF' | 'studyAIML'
export type EventCategory = KnownEventCategory | (string & {})

export type MilestoneStatus = 'upcoming' | 'done' | 'missed'

export interface User {
  name: string
  initials: string
  email: string
}

export interface Project {
  id: ProjectId
  name: string
  fullName: string
  color: string
  icon: string
  progress: number
  phase: string
  deadline: string
  tasks: number
  done: number
  starred: boolean
  description?: string
}

export interface Task {
  id: string
  title: string
  col: TaskCol
  priority: Priority
  project: ProjectId
  tags: string[]
  due: string | null
  claude: boolean
  done: boolean
  description?: string
  subtasks?: string[]
}

export interface CalendarEvent {
  id: string
  title: string
  category: EventCategory
  start: string
  end: string
  recurrent: boolean
  location?: string
  notes?: string
}

export interface Milestone {
  id: string
  title: string
  project: ProjectId
  date: string
  status: MilestoneStatus
}

export interface TimelinePhase {
  name: string
  start: string
  end: string
  done: boolean
}

export interface TimelineRow {
  id: string
  project: ProjectId
  name: string
  phases: TimelinePhase[]
}

export interface WeeklyStat {
  week: string
  tasks: number
  hours: number
}

export interface CategoryHours {
  cat: string
  hours: number
  color: string
}

export interface TempoData {
  user: User
  projects: Project[]
  tasks: Task[]
  events: CalendarEvent[]
  milestones: Milestone[]
  timeline: TimelineRow[]
  weeklyStats: WeeklyStat[]
  categoryHours: CategoryHours[]
  streak: number
  totalTasksDone: number
}

export const TEMPO_DATA: TempoData = {
  user: { name: 'Mauricio', initials: 'MV', email: 'mauricio@tempo.app' },

  projects: [
    { id: 'clf', name: 'CLF-C02', fullName: 'AWS Cloud Practitioner', color: '#4a7759', icon: '☁️', progress: 68, phase: 'Práctica', deadline: '2026-05-15', tasks: 24, done: 16, starred: true },
    { id: 'aiml', name: 'AI-ML Roadmap', fullName: 'AI/ML Roadmap — 6 Fases', color: '#2d5a3d', icon: '🧠', progress: 33, phase: 'Fase 2', deadline: '2026-12-01', tasks: 48, done: 16, starred: true },
    { id: 'dbt', name: 'Databricks', fullName: 'Databricks Lakehouse Fundamentals', color: '#5c8a6e', icon: '⚡', progress: 20, phase: 'Módulo 3', deadline: '2026-06-30', tasks: 18, done: 4, starred: false },
    { id: 'aws', name: 'AWS Academy', fullName: 'AWS Academy Cloud Architecting', color: '#3d6648', icon: '🏗️', progress: 55, phase: 'Lab 7', deadline: '2026-07-15', tasks: 30, done: 17, starred: false },
    { id: 'cis', name: 'CIS Trabajo', fullName: 'Practicante — CIS', color: '#7aaa8a', icon: '💼', progress: 72, phase: 'Sprint 4', deadline: '2026-08-01', tasks: 20, done: 14, starred: true },
    { id: 'pes', name: 'PES', fullName: 'Proyecto de Software (Universidad)', color: '#8fbf9f', icon: '🎓', progress: 45, phase: 'Entrega 2', deadline: '2026-06-10', tasks: 16, done: 7, starred: false },
  ],

  tasks: [
    { id: 't1', title: 'Revisar política de IAM en AWS', col: 'inbox', priority: 'high', project: 'clf', tags: ['estudio'], due: null, claude: false, done: false },
    { id: 't2', title: 'Leer paper: Attention Is All You Need', col: 'inbox', priority: 'medium', project: 'aiml', tags: ['lectura'], due: null, claude: false, done: false },
    { id: 't3', title: 'Setup entorno Databricks local', col: 'inbox', priority: 'low', project: 'dbt', tags: ['setup'], due: null, claude: true, done: false },

    { id: 't4', title: 'Daily standup + sprint review', col: 'today', priority: 'high', project: 'cis', tags: ['trabajo'], due: '2026-04-19', claude: false, done: false },
    { id: 't5', title: 'Completar módulo EC2 en CLF-C02', col: 'today', priority: 'high', project: 'clf', tags: ['estudio'], due: '2026-04-19', claude: false, done: false },
    { id: 't6', title: 'Entregar avance PES — diagrama UML', col: 'today', priority: 'high', project: 'pes', tags: ['universidad'], due: '2026-04-19', claude: false, done: false },
    { id: 't7', title: 'Clase Bases de Datos II — 6pm', col: 'today', priority: 'medium', project: 'pes', tags: ['clase'], due: '2026-04-19', claude: false, done: false },
    { id: 't8', title: 'Leer resumen Fase 2 AI-ML', col: 'today', priority: 'medium', project: 'aiml', tags: ['estudio'], due: '2026-04-19', claude: true, done: false },

    { id: 't9', title: 'Mock exam CLF-C02 — Practice Test 1', col: 'week', priority: 'high', project: 'clf', tags: ['examen'], due: '2026-04-22', claude: false, done: false },
    { id: 't10', title: 'Implementar endpoint REST — CIS', col: 'week', priority: 'high', project: 'cis', tags: ['código'], due: '2026-04-21', claude: false, done: false },
    { id: 't11', title: 'Revisar Lab 7 AWS Academy', col: 'week', priority: 'medium', project: 'aws', tags: ['lab'], due: '2026-04-23', claude: false, done: false },
    { id: 't12', title: 'Setup notebook Databricks Lakehouse', col: 'week', priority: 'medium', project: 'dbt', tags: ['setup'], due: '2026-04-24', claude: true, done: false },
    { id: 't13', title: 'Reunión proyecto PES — definir APIs', col: 'week', priority: 'high', project: 'pes', tags: ['reunión'], due: '2026-04-23', claude: false, done: false },

    { id: 't14', title: 'Terminar Fase 2 AI-ML Roadmap', col: 'upcoming', priority: 'high', project: 'aiml', tags: ['hito'], due: '2026-05-01', claude: true, done: false },
    { id: 't15', title: 'Registrar examen CLF-C02 en Pearson VUE', col: 'upcoming', priority: 'high', project: 'clf', tags: ['admin'], due: '2026-04-30', claude: false, done: false },
    { id: 't16', title: 'Entrega final Módulo 3 Databricks', col: 'upcoming', priority: 'medium', project: 'dbt', tags: ['entrega'], due: '2026-05-05', claude: false, done: false },
    { id: 't17', title: 'Revisión de código CIS Sprint 4', col: 'upcoming', priority: 'medium', project: 'cis', tags: ['trabajo'], due: '2026-05-03', claude: false, done: false },

    { id: 't18', title: 'Completar módulo S3 + Glacier', col: 'done', priority: 'medium', project: 'clf', tags: ['estudio'], due: '2026-04-15', claude: false, done: true },
    { id: 't19', title: 'Fase 1 AI-ML: Fundamentos Python', col: 'done', priority: 'high', project: 'aiml', tags: ['hito'], due: '2026-04-10', claude: false, done: true },
    { id: 't20', title: 'Setup AWS Free Tier + billing alerts', col: 'done', priority: 'medium', project: 'aws', tags: ['setup'], due: '2026-04-08', claude: true, done: true },
    { id: 't21', title: 'Entrega 1 PES — Requerimientos', col: 'done', priority: 'high', project: 'pes', tags: ['entrega'], due: '2026-04-05', claude: false, done: true },
  ],

  events: [
    { id: 'e1', title: 'Trabajo CIS', category: 'work', start: '2026-04-19T08:00', end: '2026-04-19T15:00', recurrent: true },
    { id: 'e2', title: 'Trabajo CIS', category: 'work', start: '2026-04-21T08:00', end: '2026-04-21T15:00', recurrent: true },
    { id: 'e3', title: 'Trabajo CIS', category: 'work', start: '2026-04-22T08:00', end: '2026-04-22T15:00', recurrent: true },
    { id: 'e4', title: 'Trabajo CIS', category: 'work', start: '2026-04-23T08:00', end: '2026-04-23T15:00', recurrent: true },
    { id: 'e5', title: 'Bases de Datos II', category: 'class', start: '2026-04-21T18:00', end: '2026-04-21T21:00', recurrent: true },
    { id: 'e6', title: 'Ingeniería de Software', category: 'class', start: '2026-04-22T18:00', end: '2026-04-22T21:00', recurrent: true },
    { id: 'e7', title: 'Arquitectura de Computadores', category: 'class', start: '2026-04-23T18:00', end: '2026-04-23T21:00', recurrent: true },
    { id: 'e8', title: 'CLF-C02 Study Block', category: 'study', start: '2026-04-19T16:00', end: '2026-04-19T18:00', recurrent: false },
    { id: 'e9', title: 'AI-ML Fase 2', category: 'study', start: '2026-04-20T10:00', end: '2026-04-20T12:00', recurrent: false },
    { id: 'e10', title: 'Mock Exam CLF-C02', category: 'study', start: '2026-04-22T15:30', end: '2026-04-22T17:30', recurrent: false },
    { id: 'e11', title: 'Databricks Lakehouse', category: 'study', start: '2026-04-24T16:00', end: '2026-04-24T18:00', recurrent: false },
    { id: 'e12', title: 'Gym', category: 'personal', start: '2026-04-19T06:30', end: '2026-04-19T07:45', recurrent: true },
    { id: 'e13', title: 'Gym', category: 'personal', start: '2026-04-21T06:30', end: '2026-04-21T07:45', recurrent: true },
    { id: 'e14', title: 'Gym', category: 'personal', start: '2026-04-23T06:30', end: '2026-04-23T07:45', recurrent: true },
    { id: 'e15', title: 'Daily Standup', category: 'work', start: '2026-04-21T08:30', end: '2026-04-21T09:00', recurrent: true },
    { id: 'e16', title: 'Reunión PES', category: 'study', start: '2026-04-23T16:00', end: '2026-04-23T17:00', recurrent: false },
  ],

  milestones: [
    { id: 'm1', title: 'CLF-C02 Exam', project: 'clf', date: '2026-05-15', status: 'upcoming' },
    { id: 'm2', title: 'Fase 2 AI-ML Completa', project: 'aiml', date: '2026-05-01', status: 'upcoming' },
    { id: 'm3', title: 'Entrega 2 PES', project: 'pes', date: '2026-06-10', status: 'upcoming' },
    { id: 'm4', title: 'Databricks Cert', project: 'dbt', date: '2026-06-30', status: 'upcoming' },
    { id: 'm5', title: 'AWS Academy Done', project: 'aws', date: '2026-07-15', status: 'upcoming' },
    { id: 'm6', title: 'Fase 1 AI-ML ✓', project: 'aiml', date: '2026-04-10', status: 'done' },
  ],

  timeline: [
    { id: 'tl1', project: 'clf', name: 'CLF-C02', phases: [
      { name: 'Fundamentos', start: '2026-03-01', end: '2026-03-31', done: true },
      { name: 'Servicios Core', start: '2026-04-01', end: '2026-04-30', done: false },
      { name: 'Mock + Repaso', start: '2026-05-01', end: '2026-05-14', done: false },
      { name: 'Examen', start: '2026-05-15', end: '2026-05-15', done: false },
    ]},
    { id: 'tl2', project: 'aiml', name: 'AI-ML Roadmap', phases: [
      { name: 'Fase 1: Python/Math', start: '2026-02-01', end: '2026-04-10', done: true },
      { name: 'Fase 2: ML Clásico', start: '2026-04-11', end: '2026-05-31', done: false },
      { name: 'Fase 3: Deep Learning', start: '2026-06-01', end: '2026-08-31', done: false },
      { name: 'Fase 4-6', start: '2026-09-01', end: '2026-12-01', done: false },
    ]},
    { id: 'tl3', project: 'dbt', name: 'Databricks', phases: [
      { name: 'Módulos 1-2', start: '2026-03-15', end: '2026-04-15', done: true },
      { name: 'Módulos 3-5', start: '2026-04-16', end: '2026-06-15', done: false },
      { name: 'Examen', start: '2026-06-20', end: '2026-06-30', done: false },
    ]},
    { id: 'tl4', project: 'aws', name: 'AWS Academy', phases: [
      { name: 'Labs 1-5', start: '2026-03-01', end: '2026-04-15', done: true },
      { name: 'Labs 6-12', start: '2026-04-16', end: '2026-06-30', done: false },
      { name: 'Proyecto Final', start: '2026-07-01', end: '2026-07-15', done: false },
    ]},
    { id: 'tl5', project: 'pes', name: 'PES', phases: [
      { name: 'Requerimientos', start: '2026-02-15', end: '2026-04-05', done: true },
      { name: 'Diseño + APIs', start: '2026-04-06', end: '2026-06-10', done: false },
      { name: 'Implementación', start: '2026-06-11', end: '2026-07-30', done: false },
    ]},
    { id: 'tl6', project: 'cis', name: 'CIS Trabajo', phases: [
      { name: 'Sprint 1-3', start: '2026-02-01', end: '2026-04-01', done: true },
      { name: 'Sprint 4-6', start: '2026-04-02', end: '2026-06-30', done: false },
      { name: 'Cierre', start: '2026-07-01', end: '2026-08-01', done: false },
    ]},
  ],

  weeklyStats: [
    { week: 'Mar 24', tasks: 12, hours: 18 },
    { week: 'Mar 31', tasks: 9, hours: 15 },
    { week: 'Abr 7', tasks: 15, hours: 22 },
    { week: 'Abr 14', tasks: 11, hours: 19 },
    { week: 'Abr 19', tasks: 5, hours: 8 },
  ],

  categoryHours: [
    { cat: 'Trabajo', hours: 35, color: '#4a7759' },
    { cat: 'Clases', hours: 18, color: '#5b7fa6' },
    { cat: 'Estudio', hours: 22, color: '#7a6ba0' },
    { cat: 'Personal', hours: 8, color: '#a07a6b' },
  ],

  streak: 12,
  totalTasksDone: 47,
}
