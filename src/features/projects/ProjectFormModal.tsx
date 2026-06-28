import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores'
import { useToast } from '../../stores/toastStore'
import type { Project } from '../../types'

const projectSchema = zod.object({
  name: zod.string().min(3, 'Tên dự án phải có ít nhất 3 ký tự'),
  description: zod.string().optional().or(zod.literal('')),
  color: zod.string().min(1, 'Vui lòng chọn màu sắc'),
})

type ProjectFormInputs = zod.infer<typeof projectSchema>

interface ProjectFormModalProps {
  isOpen: boolean
  onClose: () => void
  project?: Project
}

const COLOR_PALETTE = [
  { hex: '#3b82f6', name: 'Blue' },
  { hex: '#6366f1', name: 'Indigo' },
  { hex: '#8b5cf6', name: 'Purple' },
  { hex: '#ec4899', name: 'Pink' },
  { hex: '#f43f5e', name: 'Rose' },
  { hex: '#f97316', name: 'Orange' },
  { hex: '#10b981', name: 'Emerald' },
  { hex: '#06b6d4', name: 'Cyan' },
]

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({ isOpen, onClose, project }) => {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const toast = useToast()
  const isEditMode = !!project

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ProjectFormInputs>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#3b82f6',
    }
  })

  const selectedColor = watch('color')

  useEffect(() => {
    if (isOpen) {
      if (project) {
        reset({
          name: project.name,
          description: project.description || '',
          color: project.color || '#3b82f6',
        })
      } else {
        reset({
          name: '',
          description: '',
          color: '#3b82f6',
        })
      }
    }
  }, [isOpen, project, reset])

  const projectMutation = useMutation<void, Error, ProjectFormInputs>({
    mutationFn: async (data) => {
      if (!user) throw new Error('Người dùng chưa đăng nhập')

      const { data: existing, error: checkError } = await (supabase
        .from('projects') as any)
        .select('id')
        .eq('name', data.name)
        .eq('owner_id', user.id)

      if (checkError) throw checkError

      const isDuplicate = existing && existing.length > 0 && (!project || (existing[0] as any).id !== project.id)
      if (isDuplicate) {
        throw new Error('Tên dự án đã tồn tại trong không gian của bạn. Vui lòng chọn tên khác.')
      }

      if (isEditMode && project) {
        const { error } = await (supabase
          .from('projects') as any)
          .update({
            name: data.name,
            description: data.description || null,
            color: data.color,
            updated_at: new Date().toISOString(),
          })
          .eq('id', project.id)

        if (error) throw error
      } else {
        const { data: newProj, error: insertError } = await (supabase
          .from('projects') as any)
          .insert({
            name: data.name,
            description: data.description || null,
            color: data.color,
            owner_id: user.id,
            status: 'active',
          })
          .select()
          .single() as any

        if (insertError) throw insertError

        const { error: memberError } = await (supabase
          .from('project_members') as any)
          .insert({
            project_id: (newProj as any).id,
            user_id: user.id,
            role: 'product_owner',
          })

        if (memberError) throw memberError
      }
    },
    onSuccess: () => {
      toast.success(isEditMode ? 'Cập nhật dự án thành công!' : 'Tạo dự án mới thành công!')
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] })
      if (project) {
        queryClient.invalidateQueries({ queryKey: ['project', project.id] })
      }
      onClose()
    },
    onError: (err: any) => {
      toast.error(err.message || 'Lỗi thao tác trên dự án')
    },
  })

  const onSubmit = (data: ProjectFormInputs) => {
    projectMutation.mutate(data)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Chỉnh sửa dự án' : 'Tạo dự án mới'}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={projectMutation.isPending}>
            Hủy
          </Button>
          <Button type="submit" form="project-form" isLoading={projectMutation.isPending}>
            {isEditMode ? 'Cập nhật' : 'Tạo dự án'}
          </Button>
        </div>
      }
    >
      <form id="project-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Tên dự án"
          placeholder="Ví dụ: Ứng dụng Quản lý Scrum"
          error={errors.name?.message}
          required
          disabled={projectMutation.isPending}
          {...register('name')}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700">Mô tả</label>
          <textarea
            rows={3}
            placeholder="Tóm tắt phạm vi và mục tiêu của dự án này..."
            disabled={projectMutation.isPending}
            className="block w-full rounded-lg border border-neutral-300 py-2 px-3.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-neutral-400 disabled:bg-neutral-50 disabled:text-neutral-400"
            {...register('description')}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700">Màu sắc dự án</label>
          <div className="flex flex-wrap gap-2.5 mt-1">
            {COLOR_PALETTE.map((color) => {
              const isActive = selectedColor === color.hex
              return (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => setValue('color', color.hex)}
                  className={`h-7 w-7 rounded-full transition-all duration-150 border-2 relative ${
                    isActive ? 'border-neutral-800 scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                >
                  {isActive && (
                    <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold">
                      ✓
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          {errors.color?.message && (
            <p className="text-xs text-danger-600 mt-1">{errors.color.message}</p>
          )}
        </div>
      </form>
    </Modal>
  )
}

export default ProjectFormModal
