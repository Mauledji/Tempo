import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ModalChrome } from './ModalChrome'
import { MField, MInput, MTextarea, MSelect } from './fields'
import { ColorPicker } from '../shared/ColorPicker'
import { IconPicker } from '../shared/IconPicker'
import { DatePicker } from '../shared/DatePicker'
import { useProjectsStore } from '../../stores/projects'
import { useToastStore } from '../../stores/toast'
import { projectSchema, type ProjectFormValues } from '../../lib/schemas'

interface NewProjectModalProps {
  onClose: () => void
}

export function NewProjectModal({ onClose }: NewProjectModalProps) {
  const addProject = useProjectsStore((s) => s.addProject)
  const addToast = useToastStore((s) => s.addToast)

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      color: '#3d6b4f',
      icon: 'folder-open',
      deadline: '',
      description: '',
    },
    mode: 'onBlur',
  })

  const { control, handleSubmit, watch } = form
  const colorValue = watch('color')

  const onValid = (values: ProjectFormValues) => {
    addProject({
      name: values.name,
      color: values.color,
      icon: values.icon,
      deadline: values.deadline,
      description: values.description ?? '',
    })
    addToast({ type: 'success', text: 'Proyecto creado', sub: values.name })
    onClose()
  }

  return (
    <ModalChrome
      title="Nuevo proyecto"
      onClose={onClose}
      onSubmit={handleSubmit(onValid)}
      submitLabel="Crear proyecto"
      width={480}
    >
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <MField label="Nombre" error={fieldState.error?.message}>
            {({ id, describedBy }) => (
              <MInput
                id={id}
                describedBy={describedBy}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                invalid={!!fieldState.error}
                placeholder="Nombre del proyecto…"
                big
              />
            )}
          </MField>
        )}
      />
      <Controller
        control={control}
        name="color"
        render={({ field, fieldState }) => (
          <MField label="Color" error={fieldState.error?.message}>
            <ColorPicker value={field.value} onChange={field.onChange} />
          </MField>
        )}
      />
      <Controller
        control={control}
        name="icon"
        render={({ field, fieldState }) => (
          <MField label="Icono" error={fieldState.error?.message}>
            <IconPicker
              value={field.value}
              onChange={field.onChange}
              highlight={colorValue}
            />
          </MField>
        )}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Controller
          control={control}
          name="deadline"
          render={({ field, fieldState }) => (
            <MField label="Deadline" error={fieldState.error?.message}>
              <DatePicker value={field.value} onChange={field.onChange} />
            </MField>
          )}
        />
        <MField label="Estado">
          <MSelect<string>
            value="active"
            onChange={() => {}}
            options={[
              { value: 'active', label: 'Activo' },
              { value: 'paused', label: 'Pausado' },
            ]}
          />
        </MField>
      </div>
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
                placeholder="Descripción opcional…"
                rows={2}
              />
            )}
          </MField>
        )}
      />
    </ModalChrome>
  )
}
