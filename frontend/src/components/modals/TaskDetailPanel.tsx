import { useState } from 'react'
import { Icon } from '../Icon'
import { useProjectsStore } from '../../stores/projects'
import { useModalStore } from '../../stores/modal'
import { COL_LABELS, PRIORITY_OPTS } from '../../constants/ui'
import type { Task } from '../../data/mock'

interface TaskDetailPanelProps {
  onClose: () => void
  task: Task
}

type Tab = 'detalle' | 'subtareas' | 'comentarios' | 'archivos' | 'historial'

export function TaskDetailPanel({ onClose, task }: TaskDetailPanelProps) {
  const project = useProjectsStore((s) => s.projects.find((p) => p.id === task.project))
  const openModal = useModalStore((s) => s.open)
  const priority = PRIORITY_OPTS.find((p) => p.id === task.priority) || PRIORITY_OPTS[1]

  const [tab, setTab] = useState<Tab>('detalle')
  const [subtasks, setSubtasks] = useState(
    (task.subtasks || ['Estudiar conceptos base', 'Revisar preguntas de práctica']).map(
      (s, i) => ({ text: s, done: i === 0 }),
    ),
  )
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([
    { text: 'Empecé con la sección principal. Voy bien.', time: 'hace 2h' },
  ])
  const tabs: Tab[] = ['detalle', 'subtareas', 'comentarios', 'archivos', 'historial']

  const addComment = () => {
    if (!comment.trim()) return
    setComments((cs) => [...cs, { text: comment.trim(), time: 'ahora' }])
    setComment('')
  }

  const openEdit = () => openModal({ type: 'edit-task', task })

  return (
    <div
      style={{
        width: 480,
        height: '100%',
        background: 'var(--surface)',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
      }}
    >
      <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 10,
          }}
        >
          <div style={{ flex: 1, marginRight: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.4 }}>
              {task.title}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button
              onClick={openEdit}
              style={{
                width: 30,
                height: 30,
                borderRadius: 7,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Icon name="pencil" size={13} style={{ color: 'var(--text-2)' }} />
            </button>
            <button
              onClick={onClose}
              style={{
                width: 30,
                height: 30,
                borderRadius: 7,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Icon name="x" size={13} style={{ color: 'var(--text-2)' }} />
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {project && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                padding: '2px 8px',
                borderRadius: 20,
                background: project.color + '20',
                color: project.color,
              }}
            >
              {project.name}
            </span>
          )}
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: 20,
              background: `color-mix(in srgb, ${priority.color} 12%, transparent)`,
              color: priority.color,
            }}
          >
            {priority.label}
          </span>
          {task.tags?.map((tg) => (
            <span
              key={tg}
              style={{
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 20,
                background: 'var(--surface-3)',
                color: 'var(--text-3)',
              }}
            >
              {tg}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
          overflowX: 'auto',
        }}
      >
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '9px 14px',
              fontSize: 12,
              fontWeight: 500,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              textTransform: 'capitalize',
              color: tab === t ? 'var(--accent)' : 'var(--text-3)',
              borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
              whiteSpace: 'nowrap',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {tab === 'detalle' && (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 14,
                marginBottom: 16,
              }}
            >
              {(
                [
                  [
                    'Fecha',
                    task.due
                      ? new Date(task.due).toLocaleDateString('es', {
                          day: 'numeric',
                          month: 'long',
                        })
                      : 'Sin fecha',
                  ],
                  ['Columna', COL_LABELS[task.col] || task.col],
                  ['Creado', 'hace 3 días'],
                  ['Proyecto', project?.name || 'Sin proyecto'],
                ] as const
              ).map(([l, v]) => (
                <div key={l}>
                  <div
                    style={{
                      fontSize: 10,
                      color: 'var(--text-3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: 3,
                    }}
                  >
                    {l}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
            {task.description && (
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--text-2)',
                  lineHeight: 1.7,
                  padding: '12px',
                  background: 'var(--surface-2)',
                  borderRadius: 8,
                }}
              >
                {task.description}
              </div>
            )}
          </>
        )}

        {tab === 'subtareas' && (
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 12 }}>
              {subtasks.filter((s) => s.done).length} / {subtasks.length} completadas
            </div>
            {subtasks.map((s, i) => (
              <div
                key={i}
                onClick={() =>
                  setSubtasks((ts) => ts.map((x, j) => (j === i ? { ...x, done: !x.done } : x)))
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 0',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 17,
                    height: 17,
                    borderRadius: 4,
                    border: `1.5px solid ${s.done ? 'var(--accent)' : 'var(--border-2)'}`,
                    background: s.done ? 'var(--accent)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {s.done && <Icon name="check" size={10} style={{ color: 'white' }} />}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    color: s.done ? 'var(--text-3)' : 'var(--text-1)',
                    textDecoration: s.done ? 'line-through' : 'none',
                  }}
                >
                  {s.text}
                </span>
              </div>
            ))}
            <button
              onClick={() =>
                setSubtasks((ts) => [...ts, { text: `Subtarea ${ts.length + 1}`, done: false }])
              }
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 12,
                color: 'var(--text-3)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                marginTop: 8,
              }}
            >
              <Icon name="plus" size={13} />
              Agregar subtarea
            </button>
          </div>
        )}

        {tab === 'comentarios' && (
          <div>
            {comments.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'white',
                    flexShrink: 0,
                  }}
                >
                  MV
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.5 }}>
                    {c.text}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>
                    {c.time}
                  </div>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addComment()}
                placeholder="Agregar comentario…"
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--surface-2)',
                  fontSize: 12,
                  color: 'var(--text-1)',
                  outline: 'none',
                  fontFamily: 'var(--font)',
                }}
              />
              <button
                onClick={addComment}
                style={{
                  padding: '7px 12px',
                  borderRadius: 8,
                  background: 'var(--accent)',
                  border: 'none',
                  color: 'white',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                →
              </button>
            </div>
          </div>
        )}

        {tab === 'archivos' && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-3)' }}>
            <Icon name="paperclip" size={28} style={{ marginBottom: 10, opacity: 0.4 }} />
            <div style={{ fontSize: 13 }}>Sin archivos adjuntos</div>
            <button
              style={{
                marginTop: 12,
                fontSize: 12,
                color: 'var(--accent)',
                background: 'var(--accent-subtle)',
                border: '1px solid var(--accent-subtle-border)',
                borderRadius: 6,
                padding: '5px 14px',
                cursor: 'pointer',
              }}
            >
              Adjuntar archivo
            </button>
          </div>
        )}

        {tab === 'historial' && (
          <div>
            {([
              ['Creado', 'hace 3 días'],
              ['Prioridad → Alta', 'hace 2 días'],
              ['Movido a Hoy', 'hace 1 día'],
            ] as const).map(([ev, t]) => (
              <div
                key={ev}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '7px 0',
                  borderBottom: '1px solid var(--border)',
                  fontSize: 12,
                  color: 'var(--text-2)',
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--border-2)',
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1 }}>{ev}</span>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{t}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
