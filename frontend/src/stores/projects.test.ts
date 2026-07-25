import { beforeEach, describe, expect, it } from 'vitest'
import { useProjectsStore, type NewProjectInput } from './projects'

const baseInput: NewProjectInput = {
  name: 'Test project',
  color: '#3d6b4f',
  icon: 'folder-open',
  deadline: '2026-12-31',
}

describe('useProjectsStore', () => {
  beforeEach(() => {
    useProjectsStore.setState({ projects: [] })
  })

  describe('addProject', () => {
    it('creates a project with sensible defaults', () => {
      const proj = useProjectsStore.getState().addProject(baseInput)
      expect(proj.id).toMatch(/^[0-9a-f-]{36}$/)
      expect(proj.name).toBe('Test project')
      expect(proj.fullName).toBe('Test project')
      expect(proj.progress).toBe(0)
      expect(proj.tasks).toBe(0)
      expect(proj.done).toBe(0)
      expect(proj.starred).toBe(false)
      expect(proj.phase).toBe('Inicio')
    })

    it('trims the name', () => {
      const proj = useProjectsStore.getState().addProject({ ...baseInput, name: '  Spaced  ' })
      expect(proj.name).toBe('Spaced')
      expect(proj.fullName).toBe('Spaced')
    })

    it('falls back to a far deadline when missing', () => {
      const proj = useProjectsStore.getState().addProject({ ...baseInput, deadline: '' })
      expect(proj.deadline).toBe('2026-12-31')
    })

    it('preserves the user-supplied deadline', () => {
      const proj = useProjectsStore.getState().addProject({ ...baseInput, deadline: '2027-06-01' })
      expect(proj.deadline).toBe('2027-06-01')
    })
  })

  describe('updateProject', () => {
    it('patches matching project', () => {
      const a = useProjectsStore.getState().addProject(baseInput)
      useProjectsStore.getState().updateProject(a.id, { progress: 50, starred: true })
      const updated = useProjectsStore.getState().projects.find((p) => p.id === a.id)!
      expect(updated.progress).toBe(50)
      expect(updated.starred).toBe(true)
    })
  })

  describe('removeProject', () => {
    it('drops the matching project', () => {
      const a = useProjectsStore.getState().addProject(baseInput)
      useProjectsStore.getState().addProject({ ...baseInput, name: 'Keep' })
      useProjectsStore.getState().removeProject(a.id)
      const names = useProjectsStore.getState().projects.map((p) => p.name)
      expect(names).toEqual(['Keep'])
    })
  })
})
