import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ModalChrome } from './ModalChrome'
import { MField, MInput, MTextarea, MSelect, PriorityPicker } from './fields'
import { DatePicker } from '../shared/DatePicker'
import { ProjectSelector } from '../shared/ProjectSelector'
import { TagSelector } from '../shared/TagSelector'
import { Icon } from '../Icon'
import { COL_OPTS, COL_LABELS } from '../../constants/ui'
import { useTasksStore } from '../../stores/tasks'
import { useToastStore } from '../../stores/toast'
import { taskSchema, type TaskFormValues } from '../../lib/schemas'
import type { TaskCol, ProjectId } from '../../data/mock'

interface NewTaskModalProps {
  onClose: () => void
  initialCol?: TaskCol
  initialProject?: ProjectId
}

export function NewTaskModal({
  onClose,
  initialCol = 'today',
  initialProject,
}: NewTaskModalProps) {
  const addTask = useTasksStore((s) => s.addTask)
  const addToast = useToastStore((s) => s.addToast)

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'high',
      project: initialProject ?? '',
      due: '',
      tags: [],
      col: initialCol,
      subtasks: [''],
    },
    mode: 'onBlur',
  })

  const { control, handleSubmit, formState } = form
  const subtasks = useFieldArray({ control, name: 'subtasks' as never })

  const onValid = (values: TaskFormValues) => {
    addTask({
      title: values.title,
      description: values.description || undefined,
      priority: values.priority,
      project: values.project,
      tags: values.tags,
      col: values.col,
      due: values.due || null,
      subtasks: values.subtasks,
    })
    addToast({ type: 'success', text: 'Tarea creada', sub: values.title })
    onClose()
  }

  return (
    <ModalChrome
      title="Nueva tarea"
      onClose={onClose}
      onSubmit={handleSubmit(onValid)}
      submitLabel="Crear tarea"
    >
      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <MField error={fieldState.error?.message}>
            {({ id, describedBy }) => (
              <MInput
                id={id}
                describedBy={describedBy}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                invalid={!!fieldState.error}
                placeholder="Nombre de la tarea…"
                big
              />
            )}
          </MField>
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <MField label="Descripción" error={fieldState.error?.message}>
            {({ id, describedBy }) => (
              <MTextarea
                id={id}
                describedBy={describedBy}
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                invalid={!!fieldState.error}
                placeholder="Detalles opcionales…"
              />
            )}
          </MField>
        )}
      />
      <Controller
        control={control}
        name="priority"
        render={({ field, fieldState }) => (
          <MField label="Prioridad" error={fieldState.error?.message}>
            <PriorityPicker value={field.value} onChange={field.onChange} />
          </MField>
        )}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Controller
          control={control}
          name="project"
          render={({ field, fieldState }) => (
            <MField label="Proyecto" error={fieldState.error?.message}>
              <ProjectSelector
                value={field.value as ProjectId | ''}
                onChange={field.onChange}
              />
            </MField>
          )}
        />
        <Controller
          control={control}
          name="col"
          render={({ field, fieldState }) => (
            <MField label="Columna" error={fieldState.error?.message}>
              {({ id, describedBy }) => (
                <MSelect
                  id={id}
                  describedBy={describedBy}
                  value={field.value}
                  onChange={field.onChange}
                  invalid={!!fieldState.error}
                  options={COL_OPTS.map((c) => ({ value: c, label: COL_LABELS[c] }))}
                />
              )}
            </MField>
          )}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Controller
          control={control}
          name="due"
          render={({ field, fieldState }) => (
            <MField label="Fecha" error={fieldState.error?.message}>
              <DatePicker value={field.value ?? ''} onChange={field.onChange} />
            </MField>
          )}
        />
        <Controller
          control={control}
          name="tags"
          render={({ field, fieldState }) => (
            <MField label="Tags" error={fieldState.error?.message}>
              <TagSelector tags={field.value} onChange={field.onChange} />
            </MField>
          )}
        />
      </div>
      <MField
        label="Subtareas"
        error={formState.errors.subtasks?.message as string | undefined}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {subtasks.fields.map((f, i) => (
            <div key={f.id} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  border: '1.5px solid var(--border-2)',
                  flexShrink: 0,
                }}
              />
              <Controller
                control={control}
                name={`subtasks.${i}` as const}
                render={({ field }) => (
                  <input
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder={`Subtarea ${i + 1}…`}
                    style={{
                      flex: 1,
                      padding: '5px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--border)',
                      background: 'var(--surface-2)',
                      fontSize: 12,
                      color: 'var(--text-1)',
                      outline: 'none',
                      fontFamily: 'var(--font)',
                    }}
                  />
                )}
              />
              {subtasks.fields.length > 1 && (
                <button
                  type="button"
                  aria-label={`Eliminar subtarea ${i + 1}`}
                  onClick={() => subtasks.remove(i)}
                  style={{
                    cursor: 'pointer',
                    color: 'var(--text-3)',
                    fontSize: 14,
                    lineHeight: 1,
                    background: 'none',
                    border: 'none',
                    padding: '2px 6px',
                    borderRadius: 4,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => subtasks.append('')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11,
              color: 'var(--text-3)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 0',
            }}
          >
            <Icon name="plus" size={12} />
            Agregar subtarea
          </button>
        </div>
      </MField>
    </ModalChrome>
  )
}
