import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  Briefcase,
  Calendar,
  CalendarPlus,
  CalendarX,
  Check,
  CheckCircle,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUp,
  Clock,
  Cloud,
  Code2,
  Copy,
  Cpu,
  Database,
  Download,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Flag,
  Folder,
  FolderOpen,
  FolderPlus,
  GanttChart,
  GitBranch,
  Globe,
  GraduationCap,
  Hash,
  Heart,
  HelpCircle,
  History,
  Inbox,
  Info,
  Key,
  Keyboard,
  Layers,
  LayoutDashboard,
  List,
  Loader,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  Moon,
  MoreHorizontal,
  Palette,
  Paperclip,
  Pencil,
  Plus,
  PlusCircle,
  RefreshCw,
  Repeat,
  RotateCcw,
  Search,
  Server,
  Settings,
  Sparkles,
  Sun,
  Tag,
  Target,
  Terminal,
  TrendingUp,
  Trophy,
  Upload,
  User,
  WifiOff,
  X,
  XCircle,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { CSSProperties } from 'react'

// Static registry — explicit named imports above let the bundler tree-shake
// `lucide-react` so only the icons we actually render ship in the bundle.
// When adding a new `<Icon name="foo-bar" />` anywhere, add the kebab name
// here mapped to its PascalCase Lucide export.
const ICONS: Record<string, LucideIcon> = {
  'alert-triangle': AlertTriangle,
  archive: Archive,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'book-open': BookOpen,
  brain: Brain,
  briefcase: Briefcase,
  calendar: Calendar,
  'calendar-plus': CalendarPlus,
  'calendar-x': CalendarX,
  check: Check,
  'check-circle': CheckCircle,
  'check-square': CheckSquare,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'chevron-up': ChevronUp,
  'chevrons-up': ChevronsUp,
  clock: Clock,
  cloud: Cloud,
  'code-2': Code2,
  copy: Copy,
  cpu: Cpu,
  database: Database,
  download: Download,
  eye: Eye,
  'eye-off': EyeOff,
  'file-text': FileText,
  filter: Filter,
  flag: Flag,
  folder: Folder,
  'folder-open': FolderOpen,
  'folder-plus': FolderPlus,
  'gantt-chart': GanttChart,
  'git-branch': GitBranch,
  globe: Globe,
  'graduation-cap': GraduationCap,
  hash: Hash,
  heart: Heart,
  'help-circle': HelpCircle,
  history: History,
  inbox: Inbox,
  info: Info,
  key: Key,
  keyboard: Keyboard,
  layers: Layers,
  'layout-dashboard': LayoutDashboard,
  list: List,
  loader: Loader,
  'log-out': LogOut,
  'map-pin': MapPin,
  menu: Menu,
  'message-circle': MessageCircle,
  minus: Minus,
  moon: Moon,
  'more-horizontal': MoreHorizontal,
  palette: Palette,
  paperclip: Paperclip,
  pencil: Pencil,
  plus: Plus,
  'plus-circle': PlusCircle,
  'refresh-cw': RefreshCw,
  repeat: Repeat,
  'rotate-ccw': RotateCcw,
  search: Search,
  server: Server,
  settings: Settings,
  sparkles: Sparkles,
  sun: Sun,
  tag: Tag,
  target: Target,
  terminal: Terminal,
  'trending-up': TrendingUp,
  trophy: Trophy,
  upload: Upload,
  user: User,
  'wifi-off': WifiOff,
  x: X,
  'x-circle': XCircle,
  zap: Zap,
}

interface IconProps {
  name: string
  size?: number
  style?: CSSProperties
  className?: string
  strokeWidth?: number
}

export function Icon({
  name,
  size = 16,
  style,
  className,
  strokeWidth = 1.75,
}: IconProps) {
  const Component = ICONS[name]

  if (!Component) {
    if (import.meta.env.DEV) {
      console.warn(`[Icon] Unknown icon: "${name}". Add it to the registry in components/Icon.tsx`)
    }
    return (
      <span
        className={className}
        style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0, ...style }}
      />
    )
  }

  return (
    <Component
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0, ...style }}
    />
  )
}
