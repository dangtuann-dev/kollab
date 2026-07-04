import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useSprint } from '../../hooks/useSprint'
import type { Sprint } from '../../types'

const sprintSchema = zod
  .object({
    name: zod
      .string()
      .min(3, 'Tên sprint phải có ít nhất 3 ký tự')
      .max(100, 'Tên sprint không được vượt quá 100 ký tự'),
    goal: zod.string().optional(),
    start_date: zod.string().optional().or(zod.literal('')),
    end_date: zod.string().optional().or(zod.literal('')),
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        return new Date(data.end_date) >= new Date(data.start_date)
      }
      return true
    },
    {
      message: 'Ngày kết thúc phải bằng hoặc sau ngày bắt đầu',
      path: ['end_date'],
    }
  )

type SprintFormInputs = zod.infer<typeof sprintSchema>

interface SprintFormModalProps {
  projectId: string
  sprint?: Sprint | null
  isOpen: boolean
  onClose: () => void
}

export const SprintFormModal: React.FC<SprintFormModalProps> = ({
  projectId,
  sprint,
  isOpen,
  onClose,
}) => {
  const { createSprint, updateSprint } = useSprint(projectId)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SprintFormInputs>({
    resolver: zodResolver(sprintSchema),
    defaultValues: {
      name: '',
      goal: '',
      start_date: '',
      end_date: '',
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (sprint) {
        setValue('name', sprint.name)
        setValue('goal', sprint.goal || '')
        setValue(
          'start_date',
          sprint.start_date ? sprint.start_date.substring(0, 10) : ''
        )
        setValue(
          'end_date',
          sprint.end_date ? sprint.end_date.substring(0, 10) : ''
        )
      } else {
        reset({
          name: '',
          goal: '',
          start_date: '',
          end_date: '',
        })
      }
    }
  }, [isOpen, sprint, setValue, reset])

  const onSubmit = async (data: SprintFormInputs) => {
    try {
      if (sprint) {
        await updateSprint({
          sprintId: sprint.id,
          name: data.name,
          goal: data.goal || undefined,
          start_date: data.start_date || null,
          end_date: data.end_date || null,
        })
      } else {
        await createSprint({
          name: data.name,
          goal: data.goal || undefined,
          start_date: data.start_date || undefined,
          end_date: data.end_date || undefined,
        })
      }
      onClose()
    } catch (error) {
      console.error('Lỗi khi lưu sprint:', error)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={sprint ? 'Chỉnh sửa Sprint' : 'Tạo mới Sprint'}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" form="sprint-form" isLoading={isSubmitting}>
            {sprint ? 'Lưu thay đổi' : 'Tạo Sprint'}
          </Button>
        </div>
      }
    >
      <form
        id="sprint-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <Input
          label="Tên Sprint"
          placeholder="Ví dụ: Sprint 1 - Core features"
          error={errors.name?.message}
          required
          {...register('name')}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700">
            Mục tiêu Sprint (Goal)
          </label>
          <textarea
            rows={3}
            placeholder="Mô tả mục tiêu chính cần đạt được trong sprint này..."
            className="block w-full rounded-lg border border-neutral-300 py-2 px-3.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-neutral-450 text-neutral-800"
            {...register('goal')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            label="Ngày bắt đầu"
            error={errors.start_date?.message}
            {...register('start_date')}
          />

          <Input
            type="date"
            label="Ngày kết thúc"
            error={errors.end_date?.message}
            {...register('end_date')}
          />
        </div>
      </form>
    </Modal>
  )
}

export default SprintFormModal
