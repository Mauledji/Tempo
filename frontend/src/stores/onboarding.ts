import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type OnboardingStage = 'welcome' | 'wizard' | 'tour' | 'done'

interface OnboardingState {
  stage: OnboardingStage
  start: () => void
  startWizard: () => void
  startTour: () => void
  finish: () => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      stage: 'welcome',
      start: () => set({ stage: 'welcome' }),
      startWizard: () => set({ stage: 'wizard' }),
      startTour: () => set({ stage: 'tour' }),
      finish: () => set({ stage: 'done' }),
      reset: () => set({ stage: 'welcome' }),
    }),
    { name: 'tempo-onboarding-complete' },
  ),
)
