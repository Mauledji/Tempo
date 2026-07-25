import { describe, expect, it } from 'vitest'
import { useViewStore } from './view'

describe('useViewStore', () => {
  it('starts with no tag filter', () => {
    useViewStore.setState({ tagFilter: null })
    expect(useViewStore.getState().tagFilter).toBeNull()
  })

  it('setTagFilter updates the filter', () => {
    useViewStore.setState({ tagFilter: null })
    useViewStore.getState().setTagFilter('estudio')
    expect(useViewStore.getState().tagFilter).toBe('estudio')
  })

  it('setTagFilter(null) clears the filter', () => {
    useViewStore.setState({ tagFilter: 'work' })
    useViewStore.getState().setTagFilter(null)
    expect(useViewStore.getState().tagFilter).toBeNull()
  })
})
