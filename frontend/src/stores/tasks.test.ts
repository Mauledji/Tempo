import { beforeEach, describe, expect, it } from 'vitest'
import { useTasksStore, type NewTaskInput } from './tasks'
import type { Priority, ProjectId, TaskCol } from '../data/mock'

const baseInput: NewTaskInput = {
  title: 'Write test',
  priority: 'medium' as Priority,
  project: 'clf' as ProjectId,
  tags: [],
  col: 'today' as TaskCol,
  due: null,
}

describe('useTasksStore', () => {
  beforeEach(() => {
    useTasksStore.setState({ tasks: [] })
  })

  describe('addTask', () => {
    it('returns the created task with a uuid id and done:false', () => {
      const task = useTasksStore.getState().addTask(baseInput)
      expect(task.id).toMatch(/^[0-9a-f-]{36}$/)
      expect(task.done).toBe(false)
      expect(task.title).toBe('Write test')
    })

    it('trims the title', () => {
      const task = useTasksStore.getState().addTask({ ...baseInput, title: '  spaced  ' })
      expect(task.title).toBe('spaced')
    })

    it('appends to the existing list without mutating it', () => {
      const before = useTasksStore.getState().tasks
      useTasksStore.getState().addTask(baseInput)
      const after = useTasksStore.getState().tasks
      expect(after).not.toBe(before)
      expect(after).toHaveLength(1)
    })

    it('drops empty subtasks', () => {
      const task = useTasksStore
        .getState()
        .addTask({ ...baseInput, subtasks: ['real', '   ', ''] })
      expect(task.subtasks).toEqual(['real'])
    })

    it('defaults claude to false when omitted', () => {
      const task = useTasksStore.getState().addTask(baseInput)
      expect(task.claude).toBe(false)
    })
  })

  describe('updateTask', () => {
    it('patches matching task only', () => {
      const a = useTasksStore.getState().addTask(baseInput)
      const b = useTasksStore.getState().addTask({ ...baseInput, title: 'Other' })
      useTasksStore.getState().updateTask(a.id, { title: 'Updated' })
      const all = useTasksStore.getState().tasks
      expect(all.find((t) => t.id === a.id)?.title).toBe('Updated')
      expect(all.find((t) => t.id === b.id)?.title).toBe('Other')
    })

    it('is a no-op for unknown ids', () => {
      useTasksStore.getState().addTask(baseInput)
      const before = useTasksStore.getState().tasks
      useTasksStore.getState().updateTask('non-existent', { title: 'X' })
      expect(useTasksStore.getState().tasks).toEqual(before)
    })
  })

  describe('removeTask', () => {
    it('drops the matching task', () => {
      const a = useTasksStore.getState().addTask(baseInput)
      useTasksStore.getState().addTask({ ...baseInput, title: 'Keep' })
      useTasksStore.getState().removeTask(a.id)
      const titles = useTasksStore.getState().tasks.map((t) => t.title)
      expect(titles).toEqual(['Keep'])
    })
  })

  describe('toggleDone', () => {
    it('flips done and forces col to "done" when toggling on', () => {
      const t = useTasksStore.getState().addTask({ ...baseInput, col: 'today' })
      useTasksStore.getState().toggleDone(t.id)
      const updated = useTasksStore.getState().tasks.find((x) => x.id === t.id)!
      expect(updated.done).toBe(true)
      expect(updated.col).toBe('done')
    })

    it('keeps the source col when toggling off', () => {
      const t = useTasksStore.getState().addTask({ ...baseInput, col: 'today' })
      useTasksStore.getState().toggleDone(t.id) // → done
      useTasksStore.getState().toggleDone(t.id) // → not done; col preserved as 'done' is the only history we have
      const updated = useTasksStore.getState().tasks.find((x) => x.id === t.id)!
      expect(updated.done).toBe(false)
      // toggleDone only re-routes to 'done' on the on-transition; off keeps current col
      expect(updated.col).toBe('done')
    })
  })

  describe('moveToColumn', () => {
    it('moves task between columns', () => {
      const t = useTasksStore.getState().addTask({ ...baseInput, col: 'inbox' })
      useTasksStore.getState().moveToColumn(t.id, 'week')
      const updated = useTasksStore.getState().tasks.find((x) => x.id === t.id)!
      expect(updated.col).toBe('week')
    })

    it('is a no-op for unknown ids', () => {
      useTasksStore.getState().addTask(baseInput)
      const before = useTasksStore.getState().tasks
      useTasksStore.getState().moveToColumn('nope', 'week')
      expect(useTasksStore.getState().tasks).toEqual(before)
    })
  })
})
