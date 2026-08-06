import React, { useEffect } from 'react'
import { useUiStore } from '../../stores/uiStore'

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useUiStore()

  useEffect(() => {
    let currentTheme = theme

    if (!currentTheme) {
      const storedStorage = localStorage.getItem('kollab-ui-storage')
      if (storedStorage) {
        try {
          const parsed = JSON.parse(storedStorage)
          if (parsed.state?.theme) {
            currentTheme = parsed.state.theme
          }
        } catch {
          
        }
      }
      if (!currentTheme) {
        currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
    }

    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return <>{children}</>
}

export default ThemeProvider
