import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { Plus, Search, Trash2, Users } from 'lucide-react'
import { useMembers } from '../../hooks/useMembers'
import { useProject } from '../../hooks/useProjects'
import { useAuthStore } from '../../stores'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { EmptyState } from '../../components/shared/EmptyState'
import type { UserRole } from '../../types'

const inviteSchema = zod.object({
  email: zod.string().min(1, 'Email là bắt buộc').email('Vui lòng nhập địa chỉ email hợp lệ'),
  role: zod.enum(['product_owner', 'scrum_master', 'developer']),
})

type InviteFormInputs = zod.infer<typeof inviteSchema>

export const MemberManagement: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const projectIdStr = projectId || ''

  const { user, role } = useAuthStore()
  const { data: project } = useProject(projectIdStr)
  const { members, isLoading, inviteMember, isInviting, updateMemberRole, removeMember } = useMembers(projectIdStr)

  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteFormInputs>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      role: 'developer',
    }
  })

  const isOwner = project?.owner_id === user?.id || role === 'product_owner'

  const handleInviteSubmit = async (data: InviteFormInputs) => {
    try {
      await inviteMember({
        email: data.email,
        role: data.role as UserRole,
      })
      reset()
    } catch (e) {
      console.error(e)
    }
  }

  const handleRoleChange = async (memberId: string, nextRole: UserRole) => {
    try {
      await updateMemberRole({ memberId, role: nextRole })
    } catch (e) {
      console.error(e)
    }
  }

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa thành viên "${memberName}" khỏi dự án không?`)
    if (confirmed) {
      try {
        await removeMember(memberId)
      } catch (e) {
        console.error(e)
      }
    }
  }

  const filteredMembers = members.filter((member) => {
    const profile = member.profile
    if (!profile) return false

    const matchesSearch =
      profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (profile.email || '').toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter === 'all' || member.role === roleFilter

    return matchesSearch && matchesRole
  })

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-2">
        <Spinner size="lg" />
        <p className="text-xs text-neutral-500 font-semibold">Đang tải danh sách thành viên...</p>
      </div>
    )
  }

  const roleConfigs = {
    product_owner: { label: 'Product Owner', variant: 'danger' as const },
    scrum_master: { label: 'Scrum Master', variant: 'purple' as const },
    developer: { label: 'Developer', variant: 'success' as const },
  }

  return (
    <div className="flex flex-col gap-8 font-sans max-w-5xl mx-auto p-4 md:p-6 bg-white rounded-2xl border border-neutral-100 shadow-sm mt-4">
      <div className="flex items-center gap-3 border-b border-neutral-150 pb-5">
        <div className="p-2.5 bg-primary-50 rounded-xl text-primary-600">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Quản lý thành viên</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Mời thành viên mới và quản lý phân quyền trong dự án.</p>
        </div>
      </div>

      {isOwner && (
        <div className="bg-neutral-50/50 rounded-xl border border-neutral-200/60 p-5">
          <h3 className="text-sm font-bold text-neutral-800 mb-4">Mời thành viên mới</h3>
          <form onSubmit={handleSubmit(handleInviteSubmit)} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-6">
              <Input
                label="Email thành viên"
                placeholder="developer@example.com"
                type="email"
                error={errors.email?.message}
                required
                disabled={isInviting}
                {...register('email')}
              />
            </div>
            <div className="md:col-span-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Vai trò</label>
                <select
                  disabled={isInviting}
                  className="block w-full rounded-lg border border-neutral-300 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-50 bg-white"
                  {...register('role')}
                >
                  <option value="developer">Developer</option>
                  <option value="scrum_master">Scrum Master</option>
                  <option value="product_owner">Product Owner</option>
                </select>
              </div>
            </div>
            <div className="md:col-span-2">
              <Button type="submit" isLoading={isInviting} className="w-full py-2.5" leftIcon={<Plus className="h-4.5 w-4.5" />}>
                Mời
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Input
              placeholder="Tìm theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4.5 w-4.5 text-neutral-400" />}
              className="py-1.5"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500">Vai trò:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-lg border border-neutral-300 py-1.5 px-3 text-xs focus:outline-none bg-white"
            >
              <option value="all">Tất cả</option>
              <option value="product_owner">Product Owner</option>
              <option value="scrum_master">Scrum Master</option>
              <option value="developer">Developer</option>
            </select>
          </div>
        </div>

        {filteredMembers.length === 0 ? (
          <EmptyState
            title="Không tìm thấy thành viên nào"
            description="Hãy điều chỉnh lại từ khóa hoặc bộ lọc của bạn."
          />
        ) : (
          <div className="border border-neutral-200/80 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    <th className="py-3.5 px-5">Thành viên</th>
                    <th className="py-3.5 px-5">Email</th>
                    <th className="py-3.5 px-5">Vai trò</th>
                    <th className="py-3.5 px-5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredMembers.map((member) => {
                    const profile = member.profile
                    if (!profile) return null
                    const isSelf = member.user_id === user?.id
                    const currentConfig = roleConfigs[member.role] || roleConfigs.developer

                    return (
                      <tr key={member.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <Avatar src={profile.avatar_url} alt={profile.full_name} fallback={profile.full_name} size="sm" />
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-neutral-800">{profile.full_name}</span>
                              {isSelf && (
                                <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">Bạn</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-sm text-neutral-600">{profile.email}</td>
                        <td className="py-4 px-5">
                          {isOwner && !isSelf ? (
                            <select
                              value={member.role}
                              onChange={(e) => handleRoleChange(member.id, e.target.value as UserRole)}
                              className="rounded border border-neutral-300 py-1 px-2 text-xs focus:outline-none bg-white font-medium text-neutral-700"
                            >
                              <option value="developer">Developer</option>
                              <option value="scrum_master">Scrum Master</option>
                              <option value="product_owner">Product Owner</option>
                            </select>
                          ) : (
                            <Badge variant={currentConfig.variant} size="sm">
                              {currentConfig.label}
                            </Badge>
                          )}
                        </td>
                        <td className="py-4 px-5 text-right">
                          {isOwner && !isSelf ? (
                            <button
                              onClick={() => handleRemoveMember(member.id, profile.full_name)}
                              className="p-1.5 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors inline-flex items-center"
                              title="Xóa thành viên"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <span className="text-xs text-neutral-400">-</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MemberManagement
