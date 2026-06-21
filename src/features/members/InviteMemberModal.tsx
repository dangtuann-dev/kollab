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
  email: zod.string().min(1, 'Email is required').email('Please enter a valid email address'),
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
      title="Invite Team Member"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isInviting}>
            Cancel
          </Button>
          <Button type="submit" form="invite-member-form" isLoading={isInviting}>
            Send Invite
          </Button>
        </div>
      }
    >
      <form id="invite-member-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="User Email Address"
          placeholder="colleague@example.com"
          type="email"
          error={errors.email?.message}
          required
          disabled={isInviting}
          {...register('email')}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700">Project Role</label>
          <select
            disabled={isInviting}
            className="block w-full rounded-lg border border-neutral-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-50"
            {...register('role')}
          >
            <option value="developer">Developer (Commit effort, update task statuses)</option>
            <option value="scrum_master">Scrum Master (Manage sprints, charts, obstacles)</option>
            <option value="product_owner">Product Owner (Manage backlog stories, priority)</option>
          </select>
        </div>
      </form>
    </Modal>
  )
}
export default InviteMemberModal
