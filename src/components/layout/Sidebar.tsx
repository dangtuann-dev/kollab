import React from 'react'
import { NavLink, useParams, useNavigate, Link } from 'react-router-dom'
import {
  ListTodo,
  Target,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Activity,
  FolderKanban,
} from 'lucide-react'
import { useUiStore, useAuthStore, useProjectStore } from '../../stores'
import { Avatar } from '../ui/Avatar'
import { cn } from '../../lib/utils'
import { supabase } from '../../lib/supabase'

interface SidebarProps {
  isMobile?: boolean
  onClose?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobile, onClose }) => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { sidebarCollapsed, toggleSidebar } = useUiStore()
  const { user, role } = useAuthStore()
  const { projects, setCurrentProject } = useProjectStore()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextProjId = e.target.value
    if (nextProjId === 'all') {
      navigate('/projects')
    } else {
      const selected = projects.find((p) => p.id === nextProjId)
      if (selected) {
        setCurrentProject(selected)
        navigate(`/projects/${selected.id}/board`)
      }
    }
    if (onClose) onClose()
  }

  const mainNavItems = [
    {
      name: 'Projects Overview',
      to: '/projects',
      icon: <FolderKanban className="h-5 w-5 shrink-0" />,
      requireProject: false,
    },
    {
      name: 'Sprint Board',
      to: projectId ? `/projects/${projectId}/board` : '/projects',
      icon: <Target className="h-5 w-5 shrink-0" />,
      requireProject: true,
    },
    {
      name: 'Backlog',
      to: projectId ? `/projects/${projectId}/backlog` : '/projects',
      icon: <ListTodo className="h-5 w-5 shrink-0" />,
      requireProject: true,
    },
    {
      name: 'Members',
      to: projectId ? `/projects/${projectId}/members` : '/projects',
      icon: <Users className="h-5 w-5 shrink-0" />,
      requireProject: true,
    },
    {
      name: 'Reports',
      to: projectId ? `/projects/${projectId}/reports` : '/projects',
      icon: <BarChart3 className="h-5 w-5 shrink-0" />,
      requireProject: true,
    },
    {
      name: 'Settings',
      to: projectId ? `/projects/${projectId}/settings` : '/projects',
      icon: <Settings className="h-5 w-5 shrink-0" />,
      requireProject: true,
    },
  ]

  const isCollapsed = !isMobile && sidebarCollapsed

  const roleLabels = {
    product_owner: 'Product Owner',
    scrum_master: 'Scrum Master',
    developer: 'Developer',
  }

  return (
    <aside
      className={cn(
        'h-full flex flex-col bg-white border-r border-neutral-200 transition-all duration-300 z-20',
        isCollapsed ? 'w-20' : 'w-72',
        isMobile && 'w-full h-full'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-neutral-200">
        <Link
          to="/projects"
          className="flex items-center gap-2.5 font-bold text-neutral-900 focus:outline-none"
          onClick={onClose}
        >
          <div className="h-9 w-9 rounded-lg bg-primary-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <Activity className="h-5 w-5" />
          </div>
          {!isCollapsed && <span className="text-lg tracking-tight font-sans">AgileFlow</span>}
        </Link>
        
        {/* Toggle Collapse Button (Desktop Only) */}
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            className="text-neutral-400 hover:text-neutral-600 rounded-lg p-1 hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-300"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Project Selector (Only show if project route active) */}
      {projectId && !isCollapsed && projects.length > 0 && (
        <div className="px-4 py-3 border-b border-neutral-100">
          <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 px-1">
            Current Workspace
          </label>
          <select
            value={projectId}
            onChange={handleProjectChange}
            className="w-full text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-lg py-2 px-2.5 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.name}
              </option>
            ))}
            <option value="all">Change project...</option>
          </select>
        </div>
      )}

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => {
          // Disable project-specific routes if no active project
          if (item.requireProject && !projectId) return null

          return (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.to === '/projects'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 group focus:outline-none',
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-bold'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
                  isCollapsed && 'justify-center px-2'
                )
              }
              title={isCollapsed ? item.name : undefined}
            >
              {({ isActive }) => (
                <>
                  <span className={cn(isActive ? 'text-primary-600' : 'text-neutral-400 group-hover:text-neutral-600')}>
                    {item.icon}
                  </span>
                  {!isCollapsed && <span>{item.name}</span>}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer Profile */}
      <div className="p-4 border-t border-neutral-200 bg-neutral-50/50">
        <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
          <Avatar
            src={user?.user_metadata?.avatar_url}
            alt={user?.user_metadata?.full_name || user?.email || 'User'}
            size="sm"
          />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-800 truncate">
                {user?.user_metadata?.full_name || 'Guest User'}
              </p>
              {projectId && role && (
                <p className="text-xs text-primary-600 font-medium truncate mt-0.5">
                  {roleLabels[role] || 'Developer'}
                </p>
              )}
              {!projectId && (
                <p className="text-[10px] text-neutral-400 truncate mt-0.5">Not inside project</p>
              )}
            </div>
          )}
          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="text-neutral-400 hover:text-danger-600 rounded p-1 hover:bg-neutral-100 transition-colors focus:outline-none"
              title="Logout"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
export default Sidebar
