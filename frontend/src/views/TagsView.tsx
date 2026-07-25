import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Icon } from '../components/Icon'
import { useTasksStore } from '../stores/tasks'
import { useViewStore } from '../stores/view'
import { useToastStore } from '../stores/toast'
import { VIEW_PATH } from '../constants/nav'

interface TagInfo {
  name: string
  count: number
  doneCount: number
}

export function TagsView() {
  const tasks = useTasksStore((s) => s.tasks)
  const navigate = useNavigate()
  const setTagFilter = useViewStore((s) => s.setTagFilter)
  const addToast = useToastStore((s) => s.addToast)

  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'count' | 'name'>('count')

  const tags = useMemo<TagInfo[]>(() => {
    const map = new Map<string, TagInfo>()
    for (const t of tasks) {
      for (const tag of t.tags) {
        const current = map.get(tag) ?? { name: tag, count: 0, doneCount: 0 }
        current.count++
        if (t.done) current.doneCount++
        map.set(tag, current)
      }
    }
    const list = Array.from(map.values())
    return list.sort((a, b) =>
      sort === 'count' ? b.count - a.count : a.name.localeCompare(b.name),
    )
  }, [tasks, sort])

  const filtered = query
    ? tags.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()))
    : tags

  const handleOpen = (name: string) => {
    setTagFilter(name)
    navigate({ to: VIEW_PATH.kanban })
    addToast({ type: 'info', text: `Filtrando por #${name}`, sub: 'En la vista de Tareas' })
  }

  const handleRename = (name: string) => {
    // TODO: integración — modal real de renombrar tag con update masivo
    addToast({
      type: 'info',
      text: `Renombrar tag "${name}"`,
      sub: 'Pendiente integración',
    })
  }

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h1 className="view-title">Tags</h1>
          <p className="view-subtitle">
            {tags.length} tags · {tasks.reduce((s, t) => s + t.tags.length, 0)} usos totales
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Icon
              name="search"
              size={13}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-3)',
              }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar tag…"
              style={{
                padding: '6px 12px 6px 30px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-2)',
                color: 'var(--text-1)',
                fontSize: 12,
                outline: 'none',
                width: 160,
              }}
            />
          </div>
          <div className="toggle-group">
            <button
              className={`toggle-btn ${sort === 'count' ? 'active' : ''}`}
              onClick={() => setSort('count')}
            >
              Más usados
            </button>
            <button
              className={`toggle-btn ${sort === 'name' ? 'active' : ''}`}
              onClick={() => setSort('name')}
            >
              A–Z
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--text-3)',
          }}
        >
          <Icon name="tag" size={32} style={{ opacity: 0.5, marginBottom: 10 }} />
          <div style={{ fontSize: 14, fontWeight: 500 }}>
            {query ? 'Sin coincidencias' : 'Aún no tienes tags'}
          </div>
          <div style={{ fontSize: 12, marginTop: 4 }}>
            {query
              ? `Intenta con otro término`
              : 'Añade tags a tus tareas para organizarlas mejor'}
          </div>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 10,
        }}
      >
        {filtered.map((t) => {
          const percent = t.count > 0 ? Math.round((t.doneCount / t.count) * 100) : 0
          return (
            <div
              key={t.name}
              className="card"
              style={{
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <button
                  onClick={() => handleOpen(t.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: 'var(--text-1)',
                  }}
                >
                  <Icon name="hash" size={14} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</span>
                </button>
                <button
                  className="icon-btn"
                  onClick={() => handleRename(t.name)}
                  title="Renombrar"
                  style={{ padding: '4px 6px' }}
                >
                  <Icon name="pencil" size={12} />
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  color: 'var(--text-3)',
                  fontSize: 11,
                }}
              >
                <span>{t.count} tareas</span>
                <span>
                  {t.doneCount}/{t.count} completadas
                </span>
              </div>

              <div
                style={{
                  height: 4,
                  background: 'var(--surface-3)',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${percent}%`,
                    height: '100%',
                    background: 'var(--accent)',
                    transition: 'width 0.3s',
                  }}
                />
              </div>

              <button
                className="btn-ghost"
                onClick={() => handleOpen(t.name)}
                style={{ justifyContent: 'center', fontSize: 12, padding: '6px 10px' }}
              >
                <Icon name="arrow-right" size={12} />
                <span>Ver tareas</span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
