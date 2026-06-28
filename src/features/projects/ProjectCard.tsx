import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Edit2, Trash2 } from 'lucide-react'
import type { Project, UserRole } from '../../types'
import { Badge } from '../../components/ui/Badge'
import { Avatar, AvatarGroup } from '../../components/ui/Avatar'
import { useAuthStore } from '../../stores'

interface ProjectCardProps {
  project: Project & {
    userRole?: UserRole
    members?: any[]
    activeSprintsCount?: number
  }
  onEdit?: (project: Project) => void
  onDelete?: (id: string, name: string) => void
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const roleConfigs = {
    product_owner: { label: 'PO', variant: 'danger' as const },
    scrum_master: { label: 'SM', variant: 'purple' as const },
    developer: { label: 'Dev', variant: 'success' as const },
  }

  const roleInfo = project.userRole ? roleConfigs[project.userRole] : null
  const isOwner = project.owner_id === user?.id || project.userRole === 'product_owner'

  const handleCardClick = () => {
    navigate(`/projects/${project.id}/board`)
  }

  const memberProfiles = (project.members || [])
    .map((m) => m.profile)
    .filter(Boolean)

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[220px] group border-l-4 border-l-primary-500 hover:border-l-primary-600"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-bold text-neutral-900 truncate group-hover:text-primary-600 transition-colors">
            {project.name}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            {roleInfo && (
              <Badge variant={roleInfo.variant} size="sm">
                {roleInfo.label}
              </Badge>
            )}
            {isOwner && (
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit?.(project)
                  }}
                  className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
                  title="Chỉnh sửa dự án"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete?.(project.id, project.name)
                  }}
                  className="p-1 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 rounded-md transition-colors"
                  title="Xóa dự án"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-neutral-500 line-clamp-3 leading-relaxed">
          {project.description || 'Chưa có mô tả.'}
        </p>
      </div>
      <div className="flex flex-col gap-3.5 border-t border-neutral-100/80 pt-3.5 mt-auto">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-400">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                Tạo ngày: {project.created_at ? new Date(project.created_at).toLocaleDateString('vi-VN') : 'Chưa xác định'}
              </span>
            </div>
            <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md w-fit">
              {project.activeSprintsCount || 0} sprint active
            </span>
          </div>

          <AvatarGroup max={4}>
            {memberProfiles.map((profile) => (
              <Avatar
                key={profile.id}
                src={profile.avatar_url}
                alt={profile.full_name}
                fallback={profile.full_name}
              />
            ))}
          </AvatarGroup>
        </div>
      </div>
    </div>
  )
}
export default ProjectCard
