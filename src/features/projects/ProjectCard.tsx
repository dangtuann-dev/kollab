import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import type { Project, UserRole } from '../../types'
import { Badge } from '../../components/ui/Badge'
import { Avatar, AvatarGroup } from '../../components/ui/Avatar'

interface ProjectCardProps {
  project: Project & {
    userRole?: UserRole
    members?: any[]
  }
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate()

  const roleConfigs = {
    product_owner: { label: 'PO', variant: 'danger' as const },
    scrum_master: { label: 'SM', variant: 'purple' as const },
    developer: { label: 'Dev', variant: 'success' as const },
  }

  const roleInfo = project.userRole ? roleConfigs[project.userRole] : null

  const handleCardClick = () => {
    navigate(`/projects/${project.id}/board`)
  }

  const memberProfiles = (project.members || [])
    .map((m) => m.profile)
    .filter(Boolean)

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between h-[210px] group border-l-4 border-l-primary-500 hover:border-l-primary-600"
    >
      <div className="flex flex-col gap-2">
        {/* Header Name & Role */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-bold text-neutral-900 truncate group-hover:text-primary-600 transition-colors">
            {project.name}
          </h3>
          {roleInfo && (
            <Badge variant={roleInfo.variant} size="sm">
              {roleInfo.label}
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-neutral-500 line-clamp-3 leading-relaxed">
          {project.description || 'No description provided.'}
        </p>
      </div>

      <div className="flex flex-col gap-3.5 border-t border-neutral-100/80 pt-3.5 mt-auto">
        {/* Footer date / status + Member avatars */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-400">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'TBD'}
            </span>
          </div>

          <AvatarGroup max={3}>
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
