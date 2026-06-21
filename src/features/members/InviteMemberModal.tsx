import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useMembers } from '../../hooks/useMembers'
import type { UserRole } from '../../types'

const inviteSchema = zod.object({
  email: zod.string().min(1, 'Email là bắt buộc').email('Vui lòng nhập địa chỉ email hợp lệ'),
  role: zod.enum(['product_owner', 'scrum_master', 'developer']),
})

type InviteFormInputs = zod.infer<typeof inviteSchema>

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

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteFormInputs>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      role: 'developer',
    }
  })

  const onSubmit = async (data: InviteFormInputs) => {
    try {
      await inviteMember({
        email: data.email,
        role: data.role as UserRole,
      })
      reset()
      onClose()
    } catch (e) {
      console.error(e)
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
      <form id="invite-member-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Địa chỉ Email người dùng"
          placeholder="colleague@example.com"
          type="email"
          error={errors.email?.message}
          required
          disabled={isInviting}
          {...register('email')}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700">Vai trò trong dự án</label>
          <select
            disabled={isInviting}
            className="block w-full rounded-lg border border-neutral-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-50"
            {...register('role')}
          >
            <option value="developer">Developer (Cam kết nỗ lực, cập nhật trạng thái công việc)</option>
            <option value="scrum_master">Scrum Master (Quản lý sprint, biểu đồ, trở ngại)</option>
            <option value="product_owner">Product Owner (Quản lý các story trong backlog, độ ưu tiên)</option>
          </select>
        </div>
      </form>
    </Modal>
  )
}
export default InviteMemberModal
