import { z } from 'zod'

// Re-derive type-safe enums from the domain types so adding a new priority/col
// in `data/mock.ts` triggers a TS error here until the schema is updated.
export const PRIORITIES = ['urgent', 'high', 'medium', 'low'] as const
export const TASK_COLS = ['inbox', 'today', 'week', 'upcoming', 'done'] as const

export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'El título es obligatorio')
    .max(120, 'Máximo 120 caracteres'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
  priority: z.enum(PRIORITIES),
  // ProjectId is `KnownProjectId | (string & {})`, so a free string is valid;
  // empty string means "no project assigned".
  project: z.string(),
  due: z.string().nullable(),
  tags: z.array(z.string()),
  col: z.enum(TASK_COLS),
  subtasks: z.array(z.string()),
})
export type TaskFormValues = z.infer<typeof taskSchema>

export const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(60, 'Máximo 60 caracteres'),
  // 6-digit hex; matches the values produced by ColorPicker.
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color inválido'),
  icon: z.string().min(1, 'Selecciona un icono'),
  deadline: z.string().or(z.literal('')),
  description: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
})
export type ProjectFormValues = z.infer<typeof projectSchema>

// EventCategory is `KnownEventCategory | (string & {})`, so a free string is valid.
export const eventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'El título es obligatorio')
      .max(120, 'Máximo 120 caracteres'),
    category: z.string().min(1, 'Categoría requerida'),
    startDate: z.string().min(1, 'Fecha de inicio requerida'),
    startTime: z.string(),
    endDate: z.string().min(1, 'Fecha de fin requerida'),
    endTime: z.string(),
    allDay: z.boolean(),
    location: z.string().max(200).optional().or(z.literal('')),
    notes: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      const start = new Date(
        `${data.startDate}T${data.allDay ? '00:00' : data.startTime || '00:00'}`,
      )
      const end = new Date(
        `${data.endDate}T${data.allDay ? '23:59' : data.endTime || '00:00'}`,
      )
      return end.getTime() >= start.getTime()
    },
    { message: 'La fecha de fin debe ser posterior al inicio', path: ['endDate'] },
  )
export type EventFormValues = z.infer<typeof eventSchema>
