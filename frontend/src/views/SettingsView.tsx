import { useState, type DragEvent } from 'react'
import { Icon } from '../components/Icon'
import { EmptyState } from '../components/shared/EmptyState'
import { JSONSchemaDocs } from '../components/shared/JSONSchemaDocs'
import { useThemeStore } from '../stores/theme'
import { useToastStore } from '../stores/toast'
import { useModalStore } from '../stores/modal'
import { useViewport } from '../lib/useViewport'
import { TEMPO_DATA } from '../data/mock'

type SettingsTab =
  | 'general'
  | 'tema'
  | 'sync'
  | 'atajos'
  | 'datos'
  | 'cuenta'
  | 'acerca'

type SyncMode = 'api' | 'file'

const API_KEY = 'tempo_live_sk_a1b2c3d4e5f6g7h8i9j0'
const APP_VERSION = '0.1.0'

const RECENT_IMPORTS = [
  { date: '2026-04-17', source: 'claude_plan_abril_w3.json', items: 8, type: 'api' },
  { date: '2026-04-14', source: 'tempo_import_roadmap.json', items: 15, type: 'file' },
  { date: '2026-04-10', source: 'claude_tasks_sprint4.json', items: 5, type: 'api' },
]

const SETTINGS_NAV: { id: SettingsTab; label: string; icon: string }[] = [
  { id: 'general',    label: 'General',         icon: 'settings' },
  { id: 'tema',       label: 'Tema',            icon: 'palette' },
  { id: 'sync',       label: 'Sync con Claude', icon: 'zap' },
  { id: 'atajos',     label: 'Atajos',          icon: 'keyboard' },
  { id: 'datos',      label: 'Datos',           icon: 'database' },
  { id: 'cuenta',     label: 'Cuenta',          icon: 'user' },
  { id: 'acerca',     label: 'Acerca de',       icon: 'info' },
]

const SHORTCUTS: { key: string; action: string; category: string }[] = [
  { category: 'Navegación', key: '⌘K',   action: 'Abrir paleta de comandos' },
  { category: 'Navegación', key: 'G D',  action: 'Ir a Dashboard' },
  { category: 'Navegación', key: 'G C',  action: 'Ir a Calendar' },
  { category: 'Navegación', key: 'G K',  action: 'Ir a Kanban' },
  { category: 'Navegación', key: 'G P',  action: 'Ir a Proyectos' },
  { category: 'Creación',   key: '⌘N',   action: 'Nueva tarea' },
  { category: 'Creación',   key: '⌘E',   action: 'Nuevo evento' },
  { category: 'Creación',   key: '⌘⇧P',  action: 'Nuevo proyecto' },
  { category: 'Generales',  key: '⌘/',   action: 'Mostrar atajos' },
  { category: 'Generales',  key: 'Esc',  action: 'Cerrar modal / panel' },
  { category: 'Generales',  key: '⌘,',   action: 'Abrir Ajustes' },
]

export function SettingsView() {
  const [tab, setTab] = useState<SettingsTab>('general')
  const vp = useViewport()
  const isMobile = vp === 'mobile'

  const tabsNav = (
    <div
      className={isMobile ? 'settings-tabs-mobile' : ''}
      style={
        isMobile
          ? undefined
          : { display: 'flex', flexDirection: 'column', gap: 2 }
      }
    >
      {SETTINGS_NAV.map((item) => (
        <button
          key={item.id}
          className={`nav-item ${tab === item.id ? 'active' : ''}`}
          onClick={() => setTab(item.id)}
          style={{ padding: '7px 10px' }}
        >
          <Icon name={item.icon} size={14} />
          <span style={{ fontSize: 13 }}>{item.label}</span>
        </button>
      ))}
    </div>
  )

  const panel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {tab === 'general' && <GeneralPanel />}
      {tab === 'tema' && <ThemePanel />}
      {tab === 'sync' && <SyncPanel />}
      {tab === 'atajos' && <ShortcutsPanel />}
      {tab === 'datos' && <DataPanel />}
      {tab === 'cuenta' && <AccountPanel />}
      {tab === 'acerca' && <AboutPanel />}
    </div>
  )

  return (
    <div className="view-container">
      <div className="view-header">
        <h1 className="view-title">Ajustes</h1>
      </div>

      {isMobile ? (
        <>
          {tabsNav}
          {panel}
        </>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>
          {tabsNav}
          {panel}
        </div>
      )}
    </div>
  )
}

// ── General ───────────────────────────────────────────────────────

function GeneralPanel() {
  const [language, setLanguage] = useState<'es' | 'en'>('es')
  const [firstDay, setFirstDay] = useState<'mon' | 'sun'>('mon')
  const [dateFmt, setDateFmt] = useState<'dmy' | 'mdy' | 'ymd'>('dmy')
  const [timeFmt, setTimeFmt] = useState<'24h' | '12h'>('24h')

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Preferencias generales</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <SettingRow
          label="Idioma"
          hint="Idioma de la interfaz"
          control={
            <select
              className="filter-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'es' | 'en')}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          }
        />
        <SettingRow
          label="Primer día de la semana"
          control={
            <div className="toggle-group">
              <button
                className={`toggle-btn ${firstDay === 'mon' ? 'active' : ''}`}
                onClick={() => setFirstDay('mon')}
              >
                Lunes
              </button>
              <button
                className={`toggle-btn ${firstDay === 'sun' ? 'active' : ''}`}
                onClick={() => setFirstDay('sun')}
              >
                Domingo
              </button>
            </div>
          }
        />
        <SettingRow
          label="Formato de fecha"
          control={
            <select
              className="filter-select"
              value={dateFmt}
              onChange={(e) => setDateFmt(e.target.value as typeof dateFmt)}
            >
              <option value="dmy">DD/MM/YYYY</option>
              <option value="mdy">MM/DD/YYYY</option>
              <option value="ymd">YYYY-MM-DD</option>
            </select>
          }
        />
        <SettingRow
          label="Formato de hora"
          control={
            <div className="toggle-group">
              <button
                className={`toggle-btn ${timeFmt === '24h' ? 'active' : ''}`}
                onClick={() => setTimeFmt('24h')}
              >
                24 h
              </button>
              <button
                className={`toggle-btn ${timeFmt === '12h' ? 'active' : ''}`}
                onClick={() => setTimeFmt('12h')}
              >
                12 h
              </button>
            </div>
          }
        />
      </div>
    </div>
  )
}

// ── Tema ──────────────────────────────────────────────────────────

function ThemePanel() {
  const dark = useThemeStore((s) => s.dark)
  const setDark = useThemeStore((s) => s.setDark)

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Apariencia</span>
      </div>
      <SettingRow
        label="Modo"
        hint="Elige entre claro y oscuro. El acento verde se mantiene en ambos."
        control={
          <div className="toggle-group">
            <button
              className={`toggle-btn ${!dark ? 'active' : ''}`}
              onClick={() => setDark(false)}
              aria-pressed={!dark}
            >
              <Icon name="sun" size={13} />
              <span>Claro</span>
            </button>
            <button
              className={`toggle-btn ${dark ? 'active' : ''}`}
              onClick={() => setDark(true)}
              aria-pressed={dark}
            >
              <Icon name="moon" size={13} />
              <span>Oscuro</span>
            </button>
          </div>
        }
      />
    </div>
  )
}

// ── Sync con Claude ───────────────────────────────────────────────

function SyncPanel() {
  const [syncMode, setSyncMode] = useState<SyncMode>('api')
  const [apiKeyVisible, setApiKeyVisible] = useState(false)
  const addToast = useToastStore((s) => s.addToast)
  const openModal = useModalStore((s) => s.open)

  const regenerate = () => {
    openModal({
      type: 'regen-key',
      onConfirm: () => {
        const fresh =
          'tempo_live_sk_' +
          Array.from({ length: 20 }, () =>
            'abcdefghijklmnopqrstuvwxyz0123456789'.charAt(
              Math.floor(Math.random() * 36),
            ),
          ).join('')
        openModal({ type: 'api-key-generated', apiKey: fresh })
      },
    })
  }

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(API_KEY)
      addToast({ type: 'success', text: 'API key copiada al portapapeles' })
    } catch {
      addToast({ type: 'error', text: 'No se pudo copiar la API key' })
    }
  }

  return (
    <>
      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 4,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--accent-subtle)',
              border: '1px solid var(--accent-subtle-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="sparkles" size={16} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)' }}>
              Sync con Claude Code
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Crea tareas y eventos desde la CLI de Anthropic
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }} />

        <div className="toggle-group" style={{ marginBottom: 20 }}>
          <button
            className={`toggle-btn ${syncMode === 'api' ? 'active' : ''}`}
            onClick={() => setSyncMode('api')}
          >
            <Icon name="zap" size={13} /> Modo API (conectado)
          </button>
          <button
            className={`toggle-btn ${syncMode === 'file' ? 'active' : ''}`}
            onClick={() => setSyncMode('file')}
          >
            <Icon name="upload" size={13} /> Modo archivo
          </button>
        </div>

        {syncMode === 'api' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--text-2)',
                  marginBottom: 8,
                }}
              >
                API Key
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 13,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-2)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {apiKeyVisible ? API_KEY : '•'.repeat(36)}
                </div>
                <button
                  className="icon-btn"
                  onClick={() => setApiKeyVisible((v) => !v)}
                >
                  <Icon name={apiKeyVisible ? 'eye-off' : 'eye'} size={15} />
                </button>
                <button className="icon-btn" title="Copiar" onClick={copyKey}>
                  <Icon name="copy" size={15} />
                </button>
                <button className="icon-btn" title="Regenerar" onClick={regenerate}>
                  <Icon name="refresh-cw" size={15} />
                </button>
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--text-2)',
                  marginBottom: 8,
                }}
              >
                Instrucciones de setup
              </div>
              <div
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '12px 14px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--text-2)',
                  lineHeight: 1.7,
                }}
              >
                <div style={{ color: 'var(--text-3)', marginBottom: 6 }}>
                  # 1. Instalar el MCP de Tempo
                </div>
                <div>npx tempo-mcp install</div>
                <div
                  style={{
                    color: 'var(--text-3)',
                    marginTop: 8,
                    marginBottom: 6,
                  }}
                >
                  # 2. Configurar API key
                </div>
                <div>export TEMPO_API_KEY="{apiKeyVisible ? API_KEY : '...'}"</div>
                <div
                  style={{
                    color: 'var(--text-3)',
                    marginTop: 8,
                    marginBottom: 6,
                  }}
                >
                  # 3. Usar en Claude Code
                </div>
                <div>
                  <span style={{ color: 'var(--accent)' }}>claude</span>{' '}
                  "Agenda para esta semana: bloque de estudio CLF-C02 martes y
                  jueves 4-6pm, con tareas de práctica"
                </div>
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--text-2)',
                  marginBottom: 8,
                }}
              >
                Ejemplos de comandos
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  'claude "Crea las tareas para terminar la Fase 2 del roadmap AI-ML esta semana"',
                  'claude "Agenda mock exams CLF-C02: sábado y domingo 3pm-5pm los próximos 3 fines de semana"',
                  'claude "Planea el sprint 5 de CIS con 10 tareas distribuidas de lunes a viernes"',
                ].map((cmd, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '8px 12px',
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      fontSize: 11,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-2)',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = 'var(--accent)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = 'var(--border)')
                    }
                  >
                    {cmd}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {syncMode === 'file' && (
          <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
            Ve a la pestaña <strong>Datos</strong> para importar archivos JSON o
            Markdown.
          </div>
        )}
      </div>
    </>
  )
}

// ── Atajos ────────────────────────────────────────────────────────

function ShortcutsPanel() {
  const categories = Array.from(new Set(SHORTCUTS.map((s) => s.category)))
  const openModal = useModalStore((s) => s.open)
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Atajos de teclado</span>
        <button
          className="btn-ghost"
          onClick={() => openModal({ type: 'shortcuts-cheatsheet' })}
          style={{ fontSize: 12 }}
        >
          <Icon name="keyboard" size={12} />
          <span>Ver cheatsheet</span>
        </button>
      </div>
      {categories.map((cat) => (
        <div key={cat} style={{ marginBottom: 16 }}>
          <div className="section-label" style={{ marginBottom: 8 }}>
            {cat.toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {SHORTCUTS.filter((s) => s.category === cat).map((s) => (
              <div
                key={s.key + s.action}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: 13, color: 'var(--text-1)' }}>
                  {s.action}
                </span>
                <kbd
                  style={{
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 4,
                    padding: '3px 8px',
                    color: 'var(--text-2)',
                  }}
                >
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Datos ─────────────────────────────────────────────────────────

function DataPanel() {
  const [dragging, setDragging] = useState(false)
  const addToast = useToastStore((s) => s.addToast)
  const openModal = useModalStore((s) => s.open)

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) {
      openModal({ type: 'import-preview' })
    }
  }

  const download = (name: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportJSON = () => {
    download(
      'tempo-export.json',
      JSON.stringify(
        {
          tasks: TEMPO_DATA.tasks,
          events: TEMPO_DATA.events,
          projects: TEMPO_DATA.projects,
        },
        null,
        2,
      ),
      'application/json',
    )
    addToast({ type: 'success', text: 'Exportado como JSON' })
  }

  const exportMD = () => {
    const md = [
      '# Tempo Export',
      '',
      '## Tareas',
      ...TEMPO_DATA.tasks.map((t) => `- [${t.done ? 'x' : ' '}] ${t.title} _(${t.project})_`),
      '',
      '## Eventos',
      ...TEMPO_DATA.events.map((e) => `- ${e.title} — ${e.start} → ${e.end}`),
    ].join('\n')
    download('tempo-export.md', md, 'text/markdown')
    addToast({ type: 'success', text: 'Exportado como Markdown' })
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Importar datos</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => openModal({ type: 'import-preview' })}
            style={{
              border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 12,
              padding: '28px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragging ? 'var(--accent-subtle)' : 'transparent',
              transition: 'all 0.2s',
            }}
          >
            <Icon
              name="upload-cloud"
              size={28}
              style={{
                color: dragging ? 'var(--accent)' : 'var(--text-3)',
                marginBottom: 10,
              }}
            />
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--text-1)',
                marginBottom: 4,
              }}
            >
              Arrastra tu archivo JSON o Markdown
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Exportado desde Claude Code · .json o .md
            </div>
          </div>

        </div>
      </div>

      <JSONSchemaDocs />

      <div className="card">
        <div className="card-header">
          <span className="card-title">Exportar datos</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" onClick={exportJSON}>
            <Icon name="download" size={13} />
            <span>Exportar JSON</span>
          </button>
          <button className="btn-ghost" onClick={exportMD}>
            <Icon name="file-text" size={13} />
            <span>Exportar Markdown</span>
          </button>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 10 }}>
          Se descarga un archivo con todas tus tareas, eventos y proyectos.
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Log de imports recientes</span>
        </div>
        {RECENT_IMPORTS.length === 0 ? (
          <EmptyState
            size="sm"
            icon="file"
            title="Sin imports aún"
            description="Cuando importes archivos o uses la API, aparecerán acá."
          />
        ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {RECENT_IMPORTS.map((imp, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '8px 0',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <Icon
                name={imp.type === 'api' ? 'zap' : 'file'}
                size={14}
                style={{ color: 'var(--accent)' }}
              />
              <span
                style={{
                  flex: 1,
                  fontSize: 12,
                  color: 'var(--text-2)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {imp.source}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                {imp.items} items
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                {imp.date}
              </span>
            </div>
          ))}
        </div>
        )}
      </div>
    </>
  )
}

// ── Cuenta ────────────────────────────────────────────────────────

function AccountPanel() {
  const addToast = useToastStore((s) => s.addToast)
  const user = TEMPO_DATA.user

  return (
    <>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Perfil</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--accent)',
              color: 'var(--accent-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            {user.initials}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)' }}>
              {user.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{user.email}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SettingRow
            label="Nombre"
            control={
              <input
                type="text"
                defaultValue={user.name}
                className="filter-select"
                style={{ width: 240 }}
              />
            }
          />
          <SettingRow
            label="Email"
            control={
              <input
                type="email"
                defaultValue={user.email}
                className="filter-select"
                style={{ width: 240 }}
              />
            }
          />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Sesión</span>
        </div>
        <button
          className="btn-ghost"
          onClick={() =>
            addToast({
              type: 'info',
              text: 'Cerrar sesión',
              sub: 'Pendiente integración con Supabase Auth.',
            })
          }
        >
          <Icon name="log-out" size={13} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </>
  )
}

// ── Acerca de ─────────────────────────────────────────────────────

function AboutPanel() {
  return (
    <>
      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'var(--accent-subtle)',
              border: '1px solid var(--accent-subtle-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="clock" size={22} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)' }}>
              Tempo
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
              versión {APP_VERSION} · build dev
            </div>
          </div>
        </div>

        <div
          style={{
            fontSize: 13,
            color: 'var(--text-2)',
            lineHeight: 1.6,
            marginBottom: 16,
          }}
        >
          Planner personal integrado con Claude Code vía MCP. Gestión de tareas,
          eventos, proyectos y notas en un solo lugar.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <AboutLink label="Documentación"   hint="docs.tempo.app" />
          <AboutLink label="Reportar un bug" hint="github.com/tempo/issues" />
          <AboutLink label="Changelog"       hint="Qué hay de nuevo" />
          <AboutLink label="Licencia"        hint="MIT" />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Créditos</span>
        </div>
        <div
          style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.7 }}
        >
          Diseño: Claude Design · Fuentes: Plus Jakarta Sans, JetBrains Mono ·
          Iconos: Lucide · Stack: React 18 + Vite + TypeScript + Tailwind 4
        </div>
      </div>
    </>
  )
}

// ── Helpers ───────────────────────────────────────────────────────

interface SettingRowProps {
  label: string
  hint?: string
  control: React.ReactNode
}

function SettingRow({ label, hint, control }: SettingRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>
          {label}
        </div>
        {hint && (
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{hint}</div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{control}</div>
    </div>
  )
}

interface AboutLinkProps {
  label: string
  hint: string
}

function AboutLink({ label, hint }: AboutLinkProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 0',
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
      }}
    >
      <span style={{ fontSize: 13, color: 'var(--text-1)' }}>{label}</span>
      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{hint}</span>
    </div>
  )
}
