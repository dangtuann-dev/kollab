import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface AppNotification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
}

interface UiState {
  sidebarCollapsed: boolean
  activeModal: string | null
  notifications: AppNotification[]
  theme: 'light' | 'dark'
  toggleSidebar: () => void
  openModal: (modalId: string) => void
  closeModal: () => void
  addNotification: (notification: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void
  removeNotification: (id: string) => void
  markAllNotificationsAsRead: () => void
  toggleTheme: () => void
}

export const useUiStore = create<UiState>()(
  devtools(
    persist(
      (set) => ({
        sidebarCollapsed: false,
        activeModal: null,
        notifications: [],
        theme: 'light',
        toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        openModal: (modalId) => set({ activeModal: modalId }),
        closeModal: () => set({ activeModal: null }),
        addNotification: (notification) => set((state) => ({
          notifications: [
            {
              ...notification,
              id: Math.random().toString(36).substring(7),
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...state.notifications,
          ],
        })),
        removeNotification: (id) => set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
        markAllNotificationsAsRead: () => set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
        toggleTheme: () => set((state) => {
          const nextTheme = state.theme === 'light' ? 'dark' : 'light'
          if (nextTheme === 'dark') {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
          return { theme: nextTheme }
        }),
      }),
      {
        name: 'agileflow-ui-storage',
        partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed, theme: state.theme }),
      }
    )
  )
)
