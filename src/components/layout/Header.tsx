import React, { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Bell, Menu, LogOut, Settings, FolderKanban, ChevronRight } from 'lucide-react'
import { useAuthStore, useProjectStore } from '../../stores'
import { Avatar } from '../ui/Avatar'
import { supabase } from '../../lib/supabase'

interface HeaderProps {
  onOpenMobileMenu: () => void
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
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
      {/* Left side: Hamburger menu + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden text-neutral-500 hover:text-neutral-700 p-1 rounded-lg hover:bg-neutral-100 focus:outline-none"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 select-none">
          <Link
            to="/projects"
            className="flex items-center gap-1 hover:text-neutral-800 transition-colors"
          >
            <FolderKanban className="h-4 w-4" />
            <span className="hidden sm:inline">Projects</span>
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

      {/* Right side: Online Status + Notification Bell + User Profile */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative text-neutral-500 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors focus:outline-none">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-danger-500" />
        </button>

        {/* User Profile Dropdown */}
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
              {/* Dropdown Backdrop to close on click outside */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setProfileDropdownOpen(false)}
              />
              
              <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-150 rounded-xl shadow-lg z-20 py-2 animate-slide-up origin-top-right">
                <div className="px-4 py-2.5 border-b border-neutral-100">
                  <p className="text-sm font-semibold text-neutral-800 truncate">
                    {user?.user_metadata?.full_name || 'Guest User'}
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
                    <span>Workspace Settings</span>
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
                    <span>Log Out</span>
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
