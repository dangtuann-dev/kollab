import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Search, ListFilter } from 'lucide-react'
import { useMembers } from '../../hooks/useMembers'
import { useAuthStore } from '../../stores'
import { MemberCard } from './MemberCard'
import { InviteMemberModal } from './InviteMemberModal'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/shared/EmptyState'

export const MembersPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const projectIdStr = projectId || ''

  const { role } = useAuthStore()
  const isPO = role === 'product_owner'

  const { members, isLoading, updateMemberRole, removeMember } = useMembers(projectIdStr)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  // Filter members
  const filteredMembers = members.filter((member) => {
    const profile = member.profile
    if (!profile) return false
    
    // Search filter
    const matchesSearch =
      profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (profile.email || '').toLowerCase().includes(searchQuery.toLowerCase())
      
    // Role filter
    const matchesRole = roleFilter === 'all' || member.role === roleFilter

    return matchesSearch && matchesRole
  })

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-2">
        <Spinner size="lg" />
        <p className="text-xs text-neutral-500 font-semibold">Loading members directory...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Team Members</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Manage project collaborators, invite new developers, and allocate roles.</p>
        </div>

        {isPO && (
          <Button size="sm" onClick={() => setIsInviteOpen(true)} leftIcon={<Plus className="h-4.5 w-4.5" />}>
            Invite Member
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4.5 w-4.5 text-neutral-400" />}
            className="py-1.5"
          />
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2 border border-neutral-200 bg-white rounded-lg px-3.5 py-2 text-xs font-semibold text-neutral-600 shadow-sm self-start">
          <ListFilter className="h-4 w-4 text-neutral-400" />
          <span>Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-transparent border-none text-neutral-800 font-bold focus:outline-none cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="product_owner">Product Owner</option>
            <option value="scrum_master">Scrum Master</option>
            <option value="developer">Developer</option>
          </select>
        </div>
      </div>

      {/* Member Cards Grid */}
      {filteredMembers.length === 0 ? (
        <EmptyState
          title={searchQuery || roleFilter !== 'all' ? 'No members found' : 'No team members'}
          description={
            searchQuery || roleFilter !== 'all'
              ? 'Try modifying your search queries or filtering criteria.'
              : 'Invite colleagues to collaborate on this sprint workspace.'
          }
          action={
            isPO && !searchQuery && roleFilter === 'all' ? (
              <Button onClick={() => setIsInviteOpen(true)} leftIcon={<Plus className="h-4.5 w-4.5" />}>
                Invite First Colleague
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onUpdateRole={(id, roleVal) => updateMemberRole({ memberId: id, role: roleVal })}
              onRemove={(id) => removeMember(id)}
            />
          ))}
        </div>
      )}

      {/* Invite Modal */}
      <InviteMemberModal
        projectId={projectIdStr}
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </div>
  )
}
export default MembersPage
