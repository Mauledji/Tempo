import { useId, type ReactNode, type Ref } from 'react'
import { Icon } from '../Icon'
import { PRIORITY_OPTS } from '../../constants/ui'
import type { Priority } from '../../data/mock'

interface MFieldProps {
  label?: string
  children: ReactNode | ((props: { id: string; describedBy?: string }) => ReactNode)
  error?: string
}

// Provides an id for the input + a describedBy id for the error message so
// screen readers announce validation feedback when the user focuses an
// invalid input. Children can be a render-prop to receive these ids; plain
// children still work for fields that don't need them (custom pickers).
export function MField({ label, children, error }: MFieldProps) {
  const inputId = useId()
  const errorId = `${inputId}-error`
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-2)',
            display: 'block',
            marginBottom: 5,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </label>
      )}
      {typeof children === 'function'
        ? children({ id: inputId, describedBy: error ? errorId : undefined })
        : children}
      {error && (
        <p
          id={errorId}
          role="alert"
          style={{
            fontSize: 11,
            color: '#c0392b',
            marginTop: 5,
            marginBottom: 0,
            lineHeight: 1.4,
          }}
        >
          {error}
        </p>
      )}
    </div>
  )
}

interface MInputProps {
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  placeholder?: string
  big?: boolean
  mono?: boolean
  type?: string
  invalid?: boolean
  id?: string
  name?: string
  describedBy?: string
  inputRef?: Ref<HTMLInputElement>
}

export function MInput({
  value,
  onChange,
  onBlur,
  placeholder,
  big,
  mono,
  type = 'text',
  invalid,
  id,
  name,
  describedBy,
  inputRef,
}: MInputProps) {
  return (
    <input
      ref={inputRef}
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      style={{
        width: '100%',
        padding: big ? '10px 12px' : '8px 10px',
        borderRadius: 8,
        border: `1px solid ${invalid ? '#c0392b' : 'var(--border)'}`,
        background: 'var(--surface-2)',
        fontSize: big ? 16 : 13,
        color: 'var(--text-1)',
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font)',
        outline: 'none',
        transition: 'border-color 0.15s',
      }}
      onFocus={(e) =>
        (e.target.style.borderColor = invalid ? '#c0392b' : 'var(--accent)')
      }
      onBlurCapture={(e) =>
        (e.target.style.borderColor = invalid ? '#c0392b' : 'var(--border)')
      }
    />
  )
}

interface MTextareaProps {
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  placeholder?: string
  rows?: number
  invalid?: boolean
  id?: string
  name?: string
  describedBy?: string
  textareaRef?: Ref<HTMLTextAreaElement>
}

export function MTextarea({
  value,
  onChange,
  onBlur,
  placeholder,
  rows = 3,
  invalid,
  id,
  name,
  describedBy,
  textareaRef,
}: MTextareaProps) {
  return (
    <textarea
      ref={textareaRef}
      id={id}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      rows={rows}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      style={{
        width: '100%',
        padding: '8px 10px',
        borderRadius: 8,
        border: `1px solid ${invalid ? '#c0392b' : 'var(--border)'}`,
        background: 'var(--surface-2)',
        fontSize: 13,
        color: 'var(--text-1)',
        fontFamily: 'var(--font)',
        outline: 'none',
        resize: 'vertical',
        transition: 'border-color 0.15s',
        lineHeight: 1.6,
      }}
      onFocus={(e) =>
        (e.target.style.borderColor = invalid ? '#c0392b' : 'var(--accent)')
      }
      onBlurCapture={(e) =>
        (e.target.style.borderColor = invalid ? '#c0392b' : 'var(--border)')
      }
    />
  )
}

interface MSelectProps<T extends string> {
  value: T
  onChange: (v: T) => void
  onBlur?: () => void
  options: { value: T; label: string }[]
  invalid?: boolean
  id?: string
  name?: string
  describedBy?: string
  selectRef?: Ref<HTMLSelectElement>
}

export function MSelect<T extends string>({
  value,
  onChange,
  onBlur,
  options,
  invalid,
  id,
  name,
  describedBy,
  selectRef,
}: MSelectProps<T>) {
  return (
    <select
      ref={selectRef}
      id={id}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      onBlur={onBlur}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      style={{
        width: '100%',
        padding: '8px 10px',
        borderRadius: 8,
        border: `1px solid ${invalid ? '#c0392b' : 'var(--border)'}`,
        background: 'var(--surface-2)',
        fontSize: 13,
        color: 'var(--text-1)',
        fontFamily: 'var(--font)',
        outline: 'none',
        cursor: 'pointer',
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

interface PriorityPickerProps {
  value: Priority
  onChange: (v: Priority) => void
}

export function PriorityPicker({ value, onChange }: PriorityPickerProps) {
  return (
    <div role="radiogroup" aria-label="Prioridad" style={{ display: 'flex', gap: 6 }}>
      {PRIORITY_OPTS.map((p) => (
        <button
          key={p.id}
          type="button"
          role="radio"
          aria-checked={value === p.id}
          onClick={() => onChange(p.id)}
          style={{
            flex: 1,
            padding: '8px 4px',
            borderRadius: 8,
            border: `1.5px solid ${value === p.id ? p.color : 'var(--border)'}`,
            background:
              value === p.id
                ? `color-mix(in srgb, ${p.color} 10%, transparent)`
                : 'var(--surface-2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <Icon
            name={p.icon}
            size={16}
            style={{ color: value === p.id ? p.color : 'var(--text-3)' }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 500,
              color: value === p.id ? p.color : 'var(--text-3)',
            }}
          >
            {p.label}
          </span>
        </button>
      ))}
    </div>
  )
}
