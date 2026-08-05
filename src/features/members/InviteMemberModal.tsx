import React, { useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useMembers } from '../../hooks/useMembers'
import type { UserRole } from '../../types'
import { Tag } from 'lucide-react'

interface InviteMemberModalProps {
  projectId: string
  isOpen: boolean
  onClose: () => void
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  projectId,
  isOpen,
  onClose,
}) => {
  const { inviteMember, isInviting } = useMembers(projectId)

  const [email, setEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState('developer')
  const [customRoleText, setCustomRoleText] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    const finalRole = selectedRole === 'custom' ? customRoleText.trim() : selectedRole
    if (!finalRole) return

    try {
      await inviteMember({
        email: email.trim(),
        role: finalRole as UserRole,
      })
      setEmail('')
      setSelectedRole('developer')
      setCustomRoleText('')
      onClose()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mời thành viên nhóm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isInviting}>
            Hủy
          </Button>
          <Button type="submit" form="invite-member-form" isLoading={isInviting}>
            Gửi lời mời
          </Button>
        </div>
      }
    >
      <form id="invite-member-form" onSubmit={handleSubmit} className="flex flex-col gap-4 font-sans">
        <Input
          label="Địa chỉ Email người dùng"
          placeholder="colleague@example.com"
          type="email"
          required
          disabled={isInviting}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Vai trò trong dự án</label>
          <select
            disabled={isInviting}
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="block w-full rounded-lg border border-neutral-300 dark:border-neutral-700 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-100"
          >
            <option value="developer">Developer (Cam kết nỗ lực, cập nhật trạng thái công việc)</option>
            <option value="scrum_master">Scrum Master (Quản lý sprint, biểu đồ, trở ngại)</option>
            <option value="product_owner">Product Owner (Quản lý các story trong backlog, độ ưu tiên)</option>
            <option value="custom">+ Tạo vai trò mới...</option>
          </select>
        </div>

        {selectedRole === 'custom' && (
          <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl flex flex-col gap-1.5 animate-slide-up">
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
    </Modal>
  )
}
export default InviteMemberModal
