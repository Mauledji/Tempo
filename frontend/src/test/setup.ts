import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach } from 'vitest'

// Persist middleware writes to localStorage; wipe between tests so a write in
// one test never bleeds into another's "fresh load" assertion.
beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  window.localStorage.clear()
})
