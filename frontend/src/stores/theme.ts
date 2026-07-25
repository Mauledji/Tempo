import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeState {
  dark: boolean
  toggle: () => void
  setDark: (v: boolean) => void
}

function applyThemeAttr(dark: boolean) {
  const theme: Theme = dark ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
}

function prefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      dark: prefersDark(),
      toggle: () => {
        const next = !get().dark
        applyThemeAttr(next)
        set({ dark: next })
      },
      setDark: (v) => {
        applyThemeAttr(v)
        set({ dark: v })
      },
    }),
    {
      name: 'tempo-dark',
      onRehydrateStorage: () => (state) => {
        if (state) applyThemeAttr(state.dark)
        else applyThemeAttr(prefersDark())
      },
    },
  ),
)
