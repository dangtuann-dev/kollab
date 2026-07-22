import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useUiStore } from '../../stores/uiStore'
import { cn } from '../../lib/utils'

interface ThemeToggleProps {
  className?: string
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, toggleTheme } = useUiStore()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={cn(
        'relative inline-flex items-center justify-center h-9 w-9 rounded-xl border transition-all duration-300 focus:outline-none select-none',
        isDark
          ? 'bg-neutral-800 border-neutral-700 text-amber-400 hover:bg-neutral-700 hover:border-neutral-600'
          : 'bg-neutral-50 border-neutral-200/80 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
        className
      )}
      title={isDark ? 'Chuyển sang Chế độ Sáng' : 'Chuyển sang Chế độ Tối'}
      aria-label="Toggle theme"
    >
      <Sun
        className={cn(
          'h-4.5 w-4.5 transition-all duration-300 absolute',
          isDark ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0'
        )}
      />
      <Moon
        className={cn(
          'h-4.5 w-4.5 transition-all duration-300 absolute',
          isDark ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'
        )}
      />
    </button>
  )
}

export default ThemeToggle
