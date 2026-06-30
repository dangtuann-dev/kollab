import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useProject } from '../../hooks/useProjects'
import { useSprint } from '../../hooks/useSprint'
import { useToast } from '../../stores/toastStore'
import type { Story, StoryPriority, ProjectMember } from '../../types'

const storySchema = zod.object({
  title: zod.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự').max(100, 'Tiêu đề không được vượt quá 100 ký tự'),
  description: zod.string().optional(),
  acceptance_criteria: zod.string().optional(),
  story_points: zod.string().optional(),
  priority: zod.enum(['critical', 'high', 'medium', 'low']),
  assignee_id: zod.string().optional(),
  sprint_id: zod.string().optional(),
})

type StoryFormInputs = zod.infer<typeof storySchema>

interface UserStoryFormModalProps {
  projectId: string
  story?: Story | null
  isOpen: boolean
  onClose: () => void
}

interface LabelOption {
  name: string
  color: string
  hex: string
}

const PREDEFINED_LABELS: LabelOption[] = [
  { name: 'Feature', color: 'bg-blue-100 text-blue-800 border-blue-200', hex: '#3b82f6' },
  { name: 'Bug', color: 'bg-red-100 text-red-800 border-red-200', hex: '#ef4444' },
  { name: 'UI/UX', color: 'bg-pink-100 text-pink-800 border-pink-200', hex: '#ec4899' },
  { name: 'Refactor', color: 'bg-purple-100 text-purple-800 border-purple-200', hex: '#8b5cf6' },
  { name: 'Backend', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', hex: '#10b981' },
  { name: 'Testing', color: 'bg-amber-100 text-amber-800 border-amber-200', hex: '#f59e0b' }
]

export const UserStoryFormModal: React.FC<UserStoryFormModalProps> = ({
  projectId,
  story,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { data: project } = useProject(projectId)
  const { sprints } = useSprint(projectId)

  const [selectedLabels, setSelectedLabels] = useState<LabelOption[]>([])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<StoryFormInputs>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      title: '',
      description: '',
      acceptance_criteria: '',
      story_points: '',
      priority: 'medium',
      assignee_id: '',
      sprint_id: '',
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (story) {
        setValue('title', story.title)
        setValue('description', story.description || '')
        setValue('acceptance_criteria', story.acceptance_criteria || '')
        setValue('story_points', story.story_points ? story.story_points.toString() : '')
        setValue('priority', story.priority)
        setValue('assignee_id', story.assignee_id || '')
        setValue('sprint_id', story.sprint_id || '')

        if (story.labels) {
          try {
            const parsed = JSON.parse(story.labels)
            if (Array.isArray(parsed)) {
              setSelectedLabels(parsed)
            } else {
              setSelectedLabels([])
            }
          } catch {
            setSelectedLabels([])
          }
        } else {
          setSelectedLabels([])
        }
      } else {
        reset({
          title: '',
          description: '',
          acceptance_criteria: '',
          story_points: '',
          priority: 'medium',
          assignee_id: '',
          sprint_id: '',
        })
        setSelectedLabels([])
      }
    }
  }, [isOpen, story, setValue, reset])

  const saveMutation = useMutation({
    mutationFn: async (data: StoryFormInputs) => {
      const serializedLabels = selectedLabels.length > 0 ? JSON.stringify(selectedLabels) : null

      if (story) {
        const { error } = await (supabase
          .from('user_stories') as any)
          .update({
            title: data.title,
            description: data.description || '',
            acceptance_criteria: data.acceptance_criteria || '',
            story_points: data.story_points ? Number(data.story_points) : null,
            priority: data.priority as StoryPriority,
            assignee_id: data.assignee_id || null,
            sprint_id: data.sprint_id || null,
            labels: serializedLabels,
            status: data.sprint_id ? 'sprint' : 'backlog',
            updated_at: new Date().toISOString(),
          })
          .eq('id', story.id)

        if (error) throw error
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { data: existingStories } = await (supabase
          .from('user_stories') as any)
          .select('id')
          .eq('project_id', projectId)

        const orderIndex = existingStories ? existingStories.length : 0

        const { error } = await (supabase
          .from('user_stories') as any)
          .insert({
            project_id: projectId,
            title: data.title,
            description: data.description || '',
            acceptance_criteria: data.acceptance_criteria || '',
            story_points: data.story_points ? Number(data.story_points) : null,
            priority: data.priority as StoryPriority,
            assignee_id: data.assignee_id || null,
            sprint_id: data.sprint_id || null,
            reporter_id: user.id,
            labels: serializedLabels,
            status: data.sprint_id ? 'sprint' : 'backlog',
            order_index: orderIndex,
          })

        if (error) throw error
      }
    },
    onSuccess: () => {
      toast.success(story ? 'Cập nhật User Story thành công!' : 'Tạo User Story thành công!')
      queryClient.invalidateQueries({ queryKey: ['stories', projectId] })
      onClose()
    },
    onError: (error: any) => {
      toast.error(error.message || 'Lỗi khi lưu User Story')
    },
  })

  const onSubmit = (data: StoryFormInputs) => {
    saveMutation.mutate(data)
  }

  const handleToggleLabel = (label: LabelOption) => {
    setSelectedLabels((prev) => {
      const exists = prev.some((l) => l.name === label.name)
      if (exists) {
        return prev.filter((l) => l.name !== label.name)
      } else {
        return [...prev, label]
      }
    })
  }

  const fibonacciPoints = [0, 1, 2, 3, 5, 8, 13, 21]
  const members = project?.members || []
  const availableSprints = sprints.filter((s) => s.status !== 'completed')

  const descriptionPlaceholder = `As a... [Vai trò người dùng]\nI want... [Hành động mong muốn]\nSo that... [Giá trị mang lại]`

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={story ? 'Chỉnh sửa User Story' : 'Tạo mới User Story'}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={saveMutation.isPending}>
            Hủy
          </Button>
          <Button type="submit" form="user-story-form" isLoading={saveMutation.isPending}>
            {story ? 'Lưu thay đổi' : 'Tạo Story'}
          </Button>
        </div>
      }
    >
      <form id="user-story-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Tiêu đề Story"
          placeholder="Ví dụ: Đăng nhập bằng Google Account"
          error={errors.title?.message}
          required
          {...register('title')}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700">Mô tả chi tiết</label>
          <textarea
            rows={4}
            placeholder={descriptionPlaceholder}
            className="block w-full rounded-lg border border-neutral-300 py-2 px-3.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-neutral-450 text-neutral-800"
            {...register('description')}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700">Tiêu chí nghiệm thu (Acceptance Criteria)</label>
          <textarea
            rows={3}
            placeholder="Cho biết [ngữ cảnh] / Khi [hành động] / Thì [kết quả]..."
            className="block w-full rounded-lg border border-neutral-300 py-2 px-3.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-neutral-450 text-neutral-800"
            {...register('acceptance_criteria')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">Độ ưu tiên</label>
            <select
              className="block w-full rounded-lg border border-neutral-300 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              {...register('priority')}
            >
              <option value="critical">🔴 Khẩn cấp</option>
              <option value="high">🟠 Cao</option>
              <option value="medium">🟡 Trung bình</option>
              <option value="low">🟢 Thấp</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">Story point (Fibonacci)</label>
            <select
              className="block w-full rounded-lg border border-neutral-300 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              {...register('story_points')}
            >
              <option value="">Chưa ước lượng</option>
              {fibonacciPoints.map((pts) => (
                <option key={pts} value={pts.toString()}>
                  {pts} điểm
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">Người thực hiện</label>
            <select
              className="block w-full rounded-lg border border-neutral-300 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              {...register('assignee_id')}
            >
              <option value="">Chưa phân công</option>
              {members.map((member: ProjectMember) => (
                <option key={member.id} value={member.user_id}>
                  {member.profile?.full_name || member.user_id}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">Phân bổ Sprint</label>
            <select
              className="block w-full rounded-lg border border-neutral-300 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              {...register('sprint_id')}
            >
              <option value="">Backlog (Không có Sprint)</option>
              {availableSprints.map((sprint) => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.name} ({sprint.status === 'active' ? 'đang hoạt động' : 'đang lập kế hoạch'})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-neutral-700">Nhãn dán (Labels)</label>
          <div className="flex flex-wrap gap-2">
            {PREDEFINED_LABELS.map((label) => {
              const isSelected = selectedLabels.some((l) => l.name === label.name)
              return (
                <button
                  key={label.name}
                  type="button"
                  onClick={() => handleToggleLabel(label)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all duration-155 select-none ${
                    isSelected
                      ? `${label.color} shadow-sm ring-1 ring-offset-1 ring-neutral-300`
                      : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  {label.name}
                </button>
              )
            })}
          </div>
        </div>
      </form>
    </Modal>
  )
}
export default UserStoryFormModal
