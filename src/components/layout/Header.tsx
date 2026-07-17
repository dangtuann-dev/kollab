import React, { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Menu, LogOut, Settings, FolderKanban, ChevronRight, Search } from 'lucide-react'
import { useAuthStore, useProjectStore } from '../../stores'
import { Avatar } from '../ui/Avatar'
import { supabase } from '../../lib/supabase'
import { NotificationBell } from './NotificationBell'

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
    <header className="sticky top-0 z-30 h-16 w-full bg-white/80 backdrop-blur-md border-b border-neutral-200/60 px-4 md:px-6 flex items-center justify-between">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden text-neutral-500 hover:text-neutral-700 p-1 rounded-lg hover:bg-neutral-100 focus:outline-none"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 select-none">
          <Link
            to="/projects"
            className="flex items-center gap-1 hover:text-neutral-800 transition-colors"
          >
            <FolderKanban className="h-4 w-4" />
            <span className="hidden sm:inline">Dự án</span>
          </Link>

          {currentProject && projectId && (
            <>
              <ChevronRight className="h-4 w-4 text-neutral-400" />
              <span className="text-neutral-900 font-semibold truncate max-w-[150px] md:max-w-[240px]">
                {currentProject.name}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Search trigger button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 border border-neutral-200/60 bg-neutral-50 hover:bg-neutral-100/80 transition-all rounded-lg px-2.5 py-1.5 text-xs text-neutral-450 font-medium focus:outline-none select-none hover:shadow-xs group no-print"
        >
          <Search className="h-4 w-4 text-neutral-450 group-hover:text-neutral-600 transition-colors" />
          <span className="hidden sm:inline text-neutral-400 group-hover:text-neutral-500 transition-colors">Tìm kiếm...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-bold text-neutral-400 bg-white border border-neutral-200 rounded">
            Ctrl K
          </kbd>
        </button>

        {/* Notification Bell */}
        <NotificationBell />

        {}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-0.5 rounded-full hover:bg-neutral-100 transition-colors focus:outline-none"
          >
            <Avatar
              src={user?.user_metadata?.avatar_url}
              alt={user?.user_metadata?.full_name || user?.email || 'User'}
              size="sm"
            />
          </button>

          {profileDropdownOpen && (
            <>
              {}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setProfileDropdownOpen(false)}
              />
              
              <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-150 rounded-xl shadow-lg z-20 py-2 animate-slide-up origin-top-right">
                <div className="px-4 py-2.5 border-b border-neutral-100">
                  <p className="text-sm font-semibold text-neutral-800 truncate">
                    {user?.user_metadata?.full_name || 'Khách'}
                  </p>
                  <p className="text-xs text-neutral-500 truncate mt-0.5">{user?.email}</p>
                </div>

                <div className="py-1">
                  <Link
                    to={projectId ? `/projects/${projectId}/settings` : '/projects'}
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    <Settings className="h-4 w-4 text-neutral-400" />
                    <span>Cài đặt Không gian làm việc</span>
                  </Link>
                </div>

                <div className="border-t border-neutral-100 pt-1 mt-1">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false)
                      handleLogout()
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger-600 hover:bg-danger-50/50 transition-colors text-left"
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
