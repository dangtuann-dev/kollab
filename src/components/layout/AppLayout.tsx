import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import SearchModal from './SearchModal'

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Register Ctrl+K shortcut globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-200">
      {/* Sidebar for desktop */}
      <div className="hidden md:block shrink-0">
        <Sidebar />
      </div>

      {/* Sidebar drawer for mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Overlay backdrop */}
          <div
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-50 w-72 h-full flex flex-col animate-slide-right">
            <Sidebar isMobile onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content body */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Header */}
        <Header 
          onOpenMobileMenu={() => setMobileMenuOpen(true)} 
          onOpenSearch={() => setSearchOpen(true)}
        />

        {/* Scrollable page view */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 bg-neutral-50/50 dark:bg-neutral-950/50">
          <Outlet />
        </main>
      </div>

      {/* Global Search Overlay */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}

export default AppLayout
