import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Search, Trash2, Users, Tag } from 'lucide-react'
import { useMembers } from '../../hooks/useMembers'
import { useProject } from '../../hooks/useProjects'
import { useAuthStore } from '../../stores'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/shared/EmptyState'
import type { UserRole } from '../../types'

export const MemberManagement: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const projectIdStr = projectId || ''

  const { user, role } = useAuthStore()
  const { data: project } = useProject(projectIdStr)
  const { members, isLoading, inviteMember, isInviting, updateMemberRole, removeMember } = useMembers(projectIdStr)

  const [inviteEmail, setInviteEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('developer')
  const [customRoleText, setCustomRoleText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const [changeRoleModalOpen, setChangeRoleModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<{ id: string; name: string; currentRole: string } | null>(null)
  const [editingSelectedRole, setEditingSelectedRole] = useState<string>('developer')
  const [editingCustomRoleText, setEditingCustomRoleText] = useState('')

  const isOwner = project?.owner_id === user?.id || role === 'product_owner'

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    const finalRole = selectedRole === 'custom' ? customRoleText.trim() : selectedRole
    if (!finalRole) return

    try {
      await inviteMember({
        email: inviteEmail.trim(),
        role: finalRole as UserRole,
      })
      setInviteEmail('')
      setSelectedRole('developer')
      setCustomRoleText('')
    } catch (e) {
      console.error(e)
    }
  }

  const openChangeRoleModal = (memberId: string, name: string, currentRole: string) => {
    setEditingMember({ id: memberId, name, currentRole })
    if (['product_owner', 'scrum_master', 'developer'].includes(currentRole)) {
      setEditingSelectedRole(currentRole)
      setEditingCustomRoleText('')
    } else {
      setEditingSelectedRole('custom')
      setEditingCustomRoleText(currentRole)
    }
    setChangeRoleModalOpen(true)
  }

  const handleSaveRoleChange = async () => {
    if (!editingMember) return
    const finalRole = editingSelectedRole === 'custom' ? editingCustomRoleText.trim() : editingSelectedRole
    if (!finalRole) return

    try {
      await updateMemberRole({ memberId: editingMember.id, role: finalRole as UserRole })
      setChangeRoleModalOpen(false)
      setEditingMember(null)
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

  const getRoleBadgeConfig = (r: string) => {
    switch (r) {
      case 'product_owner':
        return { label: 'Product Owner', variant: 'danger' as const }
      case 'scrum_master':
        return { label: 'Scrum Master', variant: 'purple' as const }
      case 'developer':
        return { label: 'Developer', variant: 'success' as const }
      default:
        return { label: r, variant: 'info' as const }
    }
  }

  const uniqueRoles = Array.from(new Set(members.map((m) => m.role)))

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

  return (
    <div className="flex flex-col gap-8 font-sans max-w-5xl mx-auto p-4 md:p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm mt-4">
      <div className="flex items-center gap-3 border-b border-neutral-150 dark:border-neutral-800 pb-5">
        <div className="p-2.5 bg-primary-50 dark:bg-primary-950/60 rounded-xl text-primary-600 dark:text-primary-400">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">Quản lý thành viên</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Mời thành viên mới, phân quyền và tạo vai trò tùy chỉnh cho dự án.</p>
        </div>
      </div>

      {isOwner && (
        <div className="bg-neutral-50/70 dark:bg-neutral-800/40 rounded-xl border border-neutral-200/80 dark:border-neutral-700/60 p-5">
          <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100 mb-4">Mời thành viên mới</h3>
          <form onSubmit={handleInviteSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-6">
                <Input
                  label="Email thành viên"
                  placeholder="developer@example.com"
                  type="email"
                  required
                  disabled={isInviting}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="md:col-span-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Vai trò</label>
                  <select
                    disabled={isInviting}
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="block w-full rounded-lg border border-neutral-300 dark:border-neutral-700 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-100"
                  >
                    <option value="developer">Developer</option>
                    <option value="scrum_master">Scrum Master</option>
                    <option value="product_owner">Product Owner</option>
                    <option value="custom">+ Tạo vai trò mới...</option>
                  </select>
                </div>
              </div>
              <div className="md:col-span-2">
                <Button type="submit" isLoading={isInviting} className="w-full py-2.5" leftIcon={<Plus className="h-4.5 w-4.5" />}>
                  Mời
                </Button>
              </div>
            </div>

            {selectedRole === 'custom' && (
              <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl flex flex-col gap-1.5 animate-slide-up">
                <label className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Tên vai trò mới (Ví dụ: QA / Tester, UI/UX Designer, DevOps, Tech Lead...):</span>
                </label>
                <Input
                  placeholder="Nhập tên vai trò tùy chỉnh..."
                  value={customRoleText}
                  onChange={(e) => setCustomRoleText(e.target.value)}
                  required
                />
              </div>
            )}
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
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Vai trò:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-lg border border-neutral-300 dark:border-neutral-700 py-1.5 px-3 text-xs focus:outline-none bg-white dark:bg-neutral-800 dark:text-neutral-100"
            >
              <option value="all">Tất cả ({members.length})</option>
              {uniqueRoles.map((r) => {
                const config = getRoleBadgeConfig(r)
                return (
                  <option key={r} value={r}>
                    {config.label}
                  </option>
                )
              })}
            </select>
          </div>
        </div>

        {filteredMembers.length === 0 ? (
          <EmptyState
            title="Không tìm thấy thành viên nào"
            description="Hãy điều chỉnh lại từ khóa hoặc bộ lọc của bạn."
          />
        ) : (
          <div className="border border-neutral-200/80 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    <th className="py-3.5 px-5">Thành viên</th>
                    <th className="py-3.5 px-5">Email</th>
                    <th className="py-3.5 px-5">Vai trò</th>
                    <th className="py-3.5 px-5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {filteredMembers.map((member) => {
                    const profile = member.profile
                    if (!profile) return null
                    const isSelf = member.user_id === user?.id
                    const currentConfig = getRoleBadgeConfig(member.role)

                    return (
                      <tr key={member.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <Avatar src={profile.avatar_url} alt={profile.full_name} fallback={profile.full_name} size="sm" />
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{profile.full_name}</span>
                              {isSelf && (
                                <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">Bạn</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-sm text-neutral-600 dark:text-neutral-400">{profile.email}</td>
                        <td className="py-4 px-5">
                          {isOwner && !isSelf ? (
                            <button
                              onClick={() => openChangeRoleModal(member.id, profile.full_name, member.role)}
                              className="group flex items-center gap-1.5 focus:outline-none"
                              title="Bấm để đổi vai trò"
                            >
                              <Badge variant={currentConfig.variant} size="sm" className="group-hover:opacity-80">
                                {currentConfig.label}
                              </Badge>
                              <span className="text-[10px] text-neutral-400 group-hover:text-primary-600 font-semibold underline">Đổi</span>
                            </button>
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
                              className="p-1.5 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-950/50 rounded-lg transition-colors inline-flex items-center"
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

      {changeRoleModalOpen && editingMember && (
        <Modal
          isOpen={changeRoleModalOpen}
          onClose={() => setChangeRoleModalOpen(false)}
          title={`Đổi vai trò cho ${editingMember.name}`}
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setChangeRoleModalOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSaveRoleChange}>
                Lưu vai trò
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-4 font-sans">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Chọn vai trò</label>
              <select
                value={editingSelectedRole}
                onChange={(e) => setEditingSelectedRole(e.target.value)}
                className="block w-full rounded-lg border border-neutral-300 dark:border-neutral-700 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-800 dark:text-neutral-100"
              >
                <option value="developer">Developer</option>
                <option value="scrum_master">Scrum Master</option>
                <option value="product_owner">Product Owner</option>
                <option value="custom">+ Tạo vai trò mới...</option>
              </select>
            </div>

            {editingSelectedRole === 'custom' && (
              <Input
                label="Tên vai trò tùy chỉnh mới:"
                placeholder="Ví dụ: QA / Tester, UI/UX Designer..."
                value={editingCustomRoleText}
                onChange={(e) => setEditingCustomRoleText(e.target.value)}
                required
              />
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}

export default MemberManagement
