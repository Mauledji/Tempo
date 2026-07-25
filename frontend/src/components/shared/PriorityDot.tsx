import { PRIORITY_COLOR } from '../../constants/ui'
import type { Priority } from '../../data/mock'

interface PriorityDotProps {
  level: Priority
  size?: number
}

export function PriorityDot({ level, size = 7 }: PriorityDotProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: PRIORITY_COLOR[level],
        flexShrink: 0,
        marginTop: 2,
      }}
    />
  )
}
