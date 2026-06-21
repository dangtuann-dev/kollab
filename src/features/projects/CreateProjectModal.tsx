import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useProjects } from '../../hooks/useProjects'

const projectSchema = zod.object({
  name: zod.string().min(3, 'Tên dự án phải có ít nhất 3 ký tự'),
  description: zod.string().optional(),
  start_date: zod.string().optional(),
  end_date: zod.string().optional(),
})

type ProjectFormInputs = zod.infer<typeof projectSchema>

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose }) => {
  const { createProject, isCreating } = useProjects()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProjectFormInputs>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      start_date: '',
      end_date: '',
    }
  })

  const onSubmit = async (data: ProjectFormInputs) => {
    try {
      await createProject({
        name: data.name,
        description: data.description || '',
        start_date: data.start_date || undefined,
        end_date: data.end_date || undefined,
      })
      reset()
      onClose()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo dự án mới"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isCreating}>
            Hủy
          </Button>
          <Button type="submit" form="create-project-form" isLoading={isCreating}>
            Tạo dự án
          </Button>
        </div>
      }
    >
      <form id="create-project-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Tên dự án"
          placeholder="Ví dụ: Ứng dụng Thương mại Điện tử"
          error={errors.name?.message}
          required
          disabled={isCreating}
          {...register('name')}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700">Mô tả</label>
          <textarea
            rows={3}
            placeholder="Tóm tắt phạm vi và mục tiêu của dự án này..."
            disabled={isCreating}
            className="block w-full rounded-lg border border-neutral-300 py-2 px-3.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-neutral-400 disabled:bg-neutral-50 disabled:text-neutral-400"
            {...register('description')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Ngày bắt đầu"
            type="date"
            error={errors.start_date?.message}
            disabled={isCreating}
            {...register('start_date')}
          />

          <Input
            label="Ngày kết thúc"
            type="date"
            error={errors.end_date?.message}
            disabled={isCreating}
            {...register('end_date')}
          />
        </div>
      </form>
    </Modal>
  )
}
export default CreateProjectModal
