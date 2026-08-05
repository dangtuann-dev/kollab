import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface OnboardingState {
  hasSeenWelcomeModal: boolean
  isWelcomeModalOpen: boolean
  dismissedProjectGuides: Record<string, boolean>
  setHasSeenWelcomeModal: (seen: boolean) => void
  openWelcomeModal: () => void
  closeWelcomeModal: () => void
  dismissProjectGuide: (projectId: string) => void
  showProjectGuide: (projectId: string) => void
  resetOnboarding: () => void
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasSeenWelcomeModal: false,
      isWelcomeModalOpen: false,
      dismissedProjectGuides: {},

      setHasSeenWelcomeModal: (seen) => set({ hasSeenWelcomeModal: seen }),
      openWelcomeModal: () => set({ isWelcomeModalOpen: true }),
      closeWelcomeModal: () => set({ isWelcomeModalOpen: false, hasSeenWelcomeModal: true }),

      dismissProjectGuide: (projectId) =>
        set((state) => ({
          dismissedProjectGuides: { ...state.dismissedProjectGuides, [projectId]: true },
        })),

      showProjectGuide: (projectId) =>
        set((state) => ({
          dismissedProjectGuides: { ...state.dismissedProjectGuides, [projectId]: false },
        })),

      resetOnboarding: () =>
        set({
          hasSeenWelcomeModal: false,
          isWelcomeModalOpen: true,
          dismissedProjectGuides: {},
        }),
    }),
    {
      name: 'kollab_onboarding_storage',
      partialize: (state) => ({
        hasSeenWelcomeModal: state.hasSeenWelcomeModal,
        dismissedProjectGuides: state.dismissedProjectGuides,
      }),
    }
  )
)
