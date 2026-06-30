import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-50 font-sans">
      {}
      <div className="hidden md:block shrink-0">
        <Sidebar />
      </div>

      {}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          {}
          <div
            className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-50 w-72 h-full flex flex-col">
            <Sidebar onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {}
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 bg-neutral-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
export default AppLayout
