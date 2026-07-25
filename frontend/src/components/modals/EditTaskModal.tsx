import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ModalChrome } from './ModalChrome'
import { MField, MInput, MTextarea, MSelect, PriorityPicker } from './fields'
import { DatePicker } from '../shared/DatePicker'
import { ProjectSelector } from '../shared/ProjectSelector'
import { TagSelector } from '../shared/TagSelector'
import { COL_OPTS, COL_LABELS } from '../../constants/ui'
import { useTasksStore } from '../../stores/tasks'
import { useToastStore } from '../../stores/toast'
import { taskSchema, type TaskFormValues } from '../../lib/schemas'
import type { Task, ProjectId } from '../../data/mock'

interface EditTaskModalProps {
  onClose: () => void
  task: Task
}

export function EditTaskModal({ onClose, task }: EditTaskModalProps) {
  const updateTask = useTasksStore((s) => s.updateTask)
  const removeTask = useTasksStore((s) => s.removeTask)
  const addToast = useToastStore((s) => s.addToast)

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task.title,
      description: task.description ?? '',
      priority: task.priority,
      project: task.project ?? '',
      due: task.due ?? '',
      tags: [...(task.tags ?? [])],
      col: task.col,
      subtasks: task.subtasks ?? [],
    },
    mode: 'onBlur',
  })

  const { control, handleSubmit } = form

  const onValid = (values: TaskFormValues) => {
    updateTask(task.id, {
      title: values.title,
      description: values.description || undefined,
      priority: values.priority,
      project: values.project,
      tags: values.tags,
      col: values.col,
      due: values.due || null,
    })
    addToast({ type: 'success', text: 'Tarea actualizada', sub: values.title })
    onClose()
  }

  const del = () => {
    removeTask(task.id)
    addToast({ type: 'undo', text: 'Tarea eliminada', action: 'Deshacer' })
    onClose()
  }

  return (
    <ModalChrome
      title="Editar tarea"
      onClose={onClose}
      onSubmit={handleSubmit(onValid)}
      submitLabel="Guardar cambios"
      showDelete
      onDelete={del}
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
                placeholder="Nombre…"
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
                placeholder="Detalles…"
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
    </ModalChrome>
  )
}
