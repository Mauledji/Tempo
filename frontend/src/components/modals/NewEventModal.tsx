import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ModalChrome } from './ModalChrome'
import { MField, MInput, MTextarea } from './fields'
import { DatePicker } from '../shared/DatePicker'
import { TimePicker } from '../shared/TimePicker'
import {
  RecurrenceBuilder,
  EMPTY_RECURRENCE,
  type RecurrenceValue,
} from '../shared/RecurrenceBuilder'
import { CAT_OPTS } from '../../constants/ui'
import { useEventsStore } from '../../stores/events'
import { useToastStore } from '../../stores/toast'
import { eventSchema, type EventFormValues } from '../../lib/schemas'

interface NewEventModalProps {
  onClose: () => void
}

export function NewEventModal({ onClose }: NewEventModalProps) {
  const addEvent = useEventsStore((s) => s.addEvent)
  const addToast = useToastStore((s) => s.addToast)

  // Recurrence has its own complex shape; keep it outside the form schema since
  // the store only needs a `recurrent: boolean` derived from it.
  const [recurrence, setRecurrence] = useState<RecurrenceValue>(EMPTY_RECURRENCE)

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      category: 'work',
      startDate: '2026-04-19',
      startTime: '09:00',
      endDate: '2026-04-19',
      endTime: '10:00',
      allDay: false,
      location: '',
      notes: '',
    },
    mode: 'onBlur',
  })

  const { control, handleSubmit, watch } = form
  const allDay = watch('allDay')

  const onValid = (values: EventFormValues) => {
    addEvent({
      title: values.title,
      category: values.category,
      start: `${values.startDate}T${values.allDay ? '00:00' : values.startTime}`,
      end: `${values.endDate}T${values.allDay ? '23:59' : values.endTime}`,
      recurrent: recurrence.freq !== 'none',
      location: values.location ?? '',
      notes: values.notes ?? '',
    })
    addToast({ type: 'success', text: 'Evento creado', sub: values.title })
    onClose()
  }

  return (
    <ModalChrome
      title="Nuevo evento"
      onClose={onClose}
      onSubmit={handleSubmit(onValid)}
      submitLabel="Crear evento"
      width={500}
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
                placeholder="Nombre del evento…"
                big
              />
            )}
          </MField>
        )}
      />
      <Controller
        control={control}
        name="category"
        render={({ field, fieldState }) => (
          <MField label="Categoría" error={fieldState.error?.message}>
            <div
              role="radiogroup"
              aria-label="Categoría"
              style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}
            >
              {CAT_OPTS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={field.value === c.id}
                  onClick={() => field.onChange(c.id)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    background:
                      field.value === c.id
                        ? `color-mix(in srgb, ${c.color} 12%, transparent)`
                        : 'var(--surface-2)',
                    border: `1.5px solid ${field.value === c.id ? c.color : 'var(--border)'}`,
                    color: field.value === c.id ? c.color : 'var(--text-2)',
                    transition: 'all 0.15s',
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </MField>
        )}
      />
      <Controller
        control={control}
        name="allDay"
        render={({ field }) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <button
              type="button"
              role="switch"
              aria-checked={field.value}
              aria-label="Todo el día"
              onClick={() => field.onChange(!field.value)}
              style={{
                width: 38,
                height: 21,
                borderRadius: 11,
                background: field.value ? 'var(--accent)' : 'var(--surface-3)',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.2s',
                border: 'none',
                padding: 0,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  left: field.value ? 18 : 2,
                  width: 17,
                  height: 17,
                  borderRadius: '50%',
                  background: 'white',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  display: 'block',
                }}
              />
            </button>
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Todo el día</span>
          </div>
        )}
      />
      {allDay ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Controller
            control={control}
            name="startDate"
            render={({ field, fieldState }) => (
              <MField label="Inicio" error={fieldState.error?.message}>
                <DatePicker value={field.value} onChange={field.onChange} />
              </MField>
            )}
          />
          <Controller
            control={control}
            name="endDate"
            render={({ field, fieldState }) => (
              <MField label="Fin" error={fieldState.error?.message}>
                <DatePicker value={field.value} onChange={field.onChange} />
              </MField>
            )}
          />
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 110px 1fr 110px',
            gap: 8,
            alignItems: 'end',
          }}
        >
          <Controller
            control={control}
            name="startDate"
            render={({ field, fieldState }) => (
              <MField label="Inicio" error={fieldState.error?.message}>
                <DatePicker value={field.value} onChange={field.onChange} />
              </MField>
            )}
          />
          <Controller
            control={control}
            name="startTime"
            render={({ field, fieldState }) => (
              <MField label="Hora" error={fieldState.error?.message}>
                <TimePicker value={field.value} onChange={field.onChange} />
              </MField>
            )}
          />
          <Controller
            control={control}
            name="endDate"
            render={({ field, fieldState }) => (
              <MField label="Fin" error={fieldState.error?.message}>
                <DatePicker value={field.value} onChange={field.onChange} />
              </MField>
            )}
          />
          <Controller
            control={control}
            name="endTime"
            render={({ field, fieldState }) => (
              <MField label="Hora" error={fieldState.error?.message}>
                <TimePicker value={field.value} onChange={field.onChange} />
              </MField>
            )}
          />
        </div>
      )}
      <MField label="Recurrencia">
        <RecurrenceBuilder value={recurrence} onChange={setRecurrence} />
      </MField>
      <Controller
        control={control}
        name="location"
        render={({ field, fieldState }) => (
          <MField label="Ubicación" error={fieldState.error?.message}>
            {({ id, describedBy }) => (
              <MInput
                id={id}
                describedBy={describedBy}
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                invalid={!!fieldState.error}
                placeholder="Agregar ubicación…"
              />
            )}
          </MField>
        )}
      />
      <Controller
        control={control}
        name="notes"
        render={({ field, fieldState }) => (
          <MField label="Notas" error={fieldState.error?.message}>
            {({ id, describedBy }) => (
              <MTextarea
                id={id}
                describedBy={describedBy}
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                invalid={!!fieldState.error}
                placeholder="Notas opcionales…"
                rows={2}
              />
            )}
          </MField>
        )}
      />
    </ModalChrome>
  )
}
