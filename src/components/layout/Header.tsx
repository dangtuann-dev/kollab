import React, { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Menu, LogOut, Settings, FolderKanban, ChevronRight, Search, User } from 'lucide-react'
import { useAuthStore, useProjectStore } from '../../stores'
import { Avatar } from '../ui/Avatar'
import { ThemeToggle } from '../ui/ThemeToggle'
import { supabase } from '../../lib/supabase'
import { NotificationBell } from './NotificationBell'
import { HelpGuideButton } from '../onboarding/HelpGuideButton'

interface HeaderProps {
  onOpenMobileMenu: () => void
  onOpenSearch: () => void
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, onOpenSearch }) => {
  const { user } = useAuthStore()
  const { currentProject } = useProjectStore()
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200/60 dark:border-neutral-800 px-4 md:px-6 flex items-center justify-between font-sans">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 dark:text-neutral-400 select-none">
          <Link
            to="/projects"
            className="flex items-center gap-1 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
          >
            <FolderKanban className="h-4 w-4" />
            <span className="hidden sm:inline">Dự án</span>
          </Link>

          {currentProject && projectId && (
            <>
              <ChevronRight className="h-4 w-4 text-neutral-400 dark:text-neutral-600" />
              <span className="text-neutral-900 dark:text-neutral-100 font-semibold truncate max-w-[150px] md:max-w-[240px]">
                {currentProject.name}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Search trigger button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 border border-neutral-200/60 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all rounded-xl px-3 py-1.5 text-xs text-neutral-450 dark:text-neutral-400 font-medium focus:outline-none select-none hover:shadow-xs group no-print"
        >
          <Search className="h-4 w-4 text-neutral-450 dark:text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-200 transition-colors" />
          <span className="hidden sm:inline text-neutral-400 dark:text-neutral-400 group-hover:text-neutral-500 dark:group-hover:text-neutral-200 transition-colors">
            Tìm kiếm...
          </span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-bold text-neutral-400 dark:text-neutral-400 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded">
            Ctrl K
          </kbd>
        </button>

        {/* Help Guide Button */}
        <HelpGuideButton />

        {/* Dark Mode Theme Toggle */}
        <ThemeToggle />

        {/* Notification Bell */}
        <NotificationBell />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-0.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none"
          >
            <Avatar
              src={user?.user_metadata?.avatar_url}
              alt={user?.user_metadata?.full_name || user?.email || 'User'}
              size="sm"
            />
          </button>

          {profileDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setProfileDropdownOpen(false)}
              />
              
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl z-20 py-2 animate-slide-up origin-top-right">
                <div className="px-4 py-2.5 border-b border-neutral-100 dark:border-neutral-800">
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 truncate">
                    {user?.user_metadata?.full_name || 'Khách'}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">{user?.email}</p>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <User className="h-4 w-4 text-neutral-400" />
                    <span>Hồ sơ & Cài đặt</span>
                  </Link>

                  <Link
                    to={projectId ? `/projects/${projectId}/settings` : '/projects'}
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <Settings className="h-4 w-4 text-neutral-400" />
                    <span>Cài đặt Không gian</span>
                  </Link>
                </div>

                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-1 mt-1">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false)
                      handleLogout()
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger-600 dark:text-danger-400 hover:bg-danger-50/50 dark:hover:bg-danger-950/40 transition-colors text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
