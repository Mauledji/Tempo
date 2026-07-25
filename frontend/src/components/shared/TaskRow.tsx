import { useState } from 'react'
import { Icon } from '../Icon'
import { ClaudeBadge } from './ClaudeBadge'
import { PriorityDot } from './PriorityDot'
import { useProjectsStore } from '../../stores/projects'
import { useTasksStore } from '../../stores/tasks'
import type { Task } from '../../data/mock'

interface TaskRowProps {
  task: Task
  onClick?: () => void
}

export function TaskRow({ task, onClick }: TaskRowProps) {
  const project = useProjectsStore((s) => s.projects.find((p) => p.id === task.project))
  const toggleDone = useTasksStore((s) => s.toggleDone)
  const [animating, setAnimating] = useState(false)
  const [optimisticDone, setOptimisticDone] = useState(task.done)

  if (optimisticDone && !task.done) return null

  const handleCheck = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (task.done) {
      toggleDone(task.id)
      return
    }
    setAnimating(true)
    setTimeout(() => {
      setOptimisticDone(true)
      toggleDone(task.id)
    }, 320)
  }

  return (
    <div
      className={`task-row ${animating ? 'task-completing' : ''}`}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      <button className={`task-check ${optimisticDone ? 'checked' : ''}`} onClick={handleCheck}>
        {optimisticDone && <Icon name="check" size={11} />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span className={`task-title ${optimisticDone ? 'done' : ''}`}>{task.title}</span>
        {project && (
          <span
            className="task-tag"
            style={{ background: project.color + '20', color: project.color, marginLeft: 8 }}
          >
            {project.name}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {task.claude && <ClaudeBadge />}
        <PriorityDot level={task.priority} />
      </div>
    </div>
  )
}
