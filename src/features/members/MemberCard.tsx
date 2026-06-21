import React, { useState } from 'react'
import { MoreVertical, UserMinus } from 'lucide-react'
import type { ProjectMember, UserRole } from '../../types'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { useAuthStore } from '../../stores'

interface MemberCardProps {
  member: ProjectMember
  onUpdateRole: (memberId: string, role: UserRole) => void
  onRemove: (memberId: string) => void
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  onUpdateRole,
  onRemove,
}) => {
  const { user, role: currentUserRole } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  
  const isPO = currentUserRole === 'product_owner'
  const isOwnCard = member.user_id === user?.id

  const roleConfigs = {
    product_owner: { label: 'Product Owner', variant: 'danger' as const },
    scrum_master: { label: 'Scrum Master', variant: 'purple' as const },
    developer: { label: 'Developer', variant: 'success' as const },
  }

  const currentRoleInfo = roleConfigs[member.role] || roleConfigs.developer

  const handleRoleChange = (nextRole: UserRole) => {
    setMenuOpen(false)
    onUpdateRole(member.id, nextRole)
  }

  return (
    <div className="bg-white border border-neutral-200/80 rounded-xl p-4 shadow-sm flex items-center justify-between gap-4 font-sans hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3.5 min-w-0">
        <Avatar
          src={member.profile?.avatar_url}
          alt={member.profile?.full_name || 'Member'}
          fallback={member.profile?.full_name}
          size="md"
        />
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-neutral-800 truncate">
              {member.profile?.full_name}
            </span>
            {isOwnCard && (
              <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                You
              </span>
            )}
          </div>
          <span className="text-xs text-neutral-500 truncate">{member.profile?.email}</span>
          <div className="mt-1.5 flex">
            <Badge variant={currentRoleInfo.variant} size="sm">
              {currentRoleInfo.label}
            </Badge>
          </div>
        </div>
      </div>

      {/* Role Management Options (PO only, cannot edit own card) */}
      {isPO && !isOwnCard && (
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-neutral-400 hover:text-neutral-600 rounded p-1 hover:bg-neutral-50 focus:outline-none transition-colors"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-1 w-48 bg-white border border-neutral-150 rounded-lg shadow-lg z-20 py-1.5 origin-top-right animate-slide-up text-xs font-semibold text-neutral-700">
                <div className="px-3 py-1 text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                  Change Role
                </div>
                {member.role !== 'product_owner' && (
                  <button
                    onClick={() => handleRoleChange('product_owner')}
                    className="w-full text-left px-3 py-1.5 hover:bg-neutral-50"
                  >
                    Product Owner
                  </button>
                )}
                {member.role !== 'scrum_master' && (
                  <button
                    onClick={() => handleRoleChange('scrum_master')}
                    className="w-full text-left px-3 py-1.5 hover:bg-neutral-50"
                  >
                    Scrum Master
                  </button>
                )}
                {member.role !== 'developer' && (
                  <button
                    onClick={() => handleRoleChange('developer')}
                    className="w-full text-left px-3 py-1.5 hover:bg-neutral-50"
                  >
                    Developer
                  </button>
                )}

                <div className="border-t border-neutral-100 mt-1.5 pt-1.5">
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      if (confirm(`Remove ${member.profile?.full_name || 'user'} from this project?`)) {
                        onRemove(member.id)
                      }
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-danger-600 hover:bg-danger-50 transition-colors text-left"
                  >
                    <UserMinus className="h-3.5 w-3.5" />
                    <span>Remove Member</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
export default MemberCard
