import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useBacklog } from '../../hooks/useBacklog'
import { useProject } from '../../hooks/useProjects'
import { useSprint } from '../../hooks/useSprint'
import type { StoryPriority, ProjectMember } from '../../types'

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

interface CreateStoryModalProps {
  projectId: string
  isOpen: boolean
  onClose: () => void
}

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({ projectId, isOpen, onClose }) => {
  const { createStory } = useBacklog(projectId)
  const { data: project } = useProject(projectId)
  const { sprints } = useSprint(projectId)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<StoryFormInputs>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      title: '',
      description: '',
      acceptance_criteria: '',
      story_points: '',
      priority: 'medium',
      assignee_id: '',
      sprint_id: '',
    }
  })

  const onSubmit = async (data: StoryFormInputs) => {
    try {
      await createStory({
        title: data.title,
        description: data.description || '',
        acceptance_criteria: data.acceptance_criteria || '',
        story_points: data.story_points ? Number(data.story_points) : undefined,
        priority: data.priority as StoryPriority,
        assignee_id: data.assignee_id || null,
        sprint_id: data.sprint_id || null,
      })
      reset()
      onClose()
    } catch (err) {
      console.error(err)
    }
  }

  const fibonacciPoints = [0, 1, 2, 3, 5, 8, 13, 21]
  const members = project?.members || []
  
  const availableSprints = sprints.filter((s) => s.status !== 'completed')

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo User Story"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" form="create-story-form">
            Tạo Story
          </Button>
        </div>
      }
    >
      <form id="create-story-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Tiêu đề Story"
          placeholder="Ví dụ: Là người dùng, tôi muốn lọc sản phẩm theo danh mục"
          error={errors.title?.message}
          required
          {...register('title')}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700">Mô tả</label>
          <textarea
            rows={3}
            placeholder="Mô tả chi tiết về User Story..."
            className="block w-full rounded-lg border border-neutral-300 py-2 px-3.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-neutral-400"
            {...register('description')}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700">Tiêu chí nghiệm thu</label>
          <textarea
            rows={3}
            placeholder="Cho biết [ngữ cảnh] / Khi [hành động] / Thì [kết quả]..."
            className="block w-full rounded-lg border border-neutral-300 py-2 px-3.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-neutral-400"
            {...register('acceptance_criteria')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">Độ ưu tiên</label>
            <select
              className="block w-full rounded-lg border border-neutral-300 py-2 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              {...register('priority')}
            >
              <option value="critical">🔴 Khẩn cấp</option>
              <option value="high">🟠 Cao</option>
              <option value="medium">🟡 Trung bình</option>
              <option value="low">🟢 Thấp</option>
            </select>
          </div>

          {}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">Story point (Fibonacci)</label>
            <select
              className="block w-full rounded-lg border border-neutral-300 py-2 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
          {}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">Người thực hiện</label>
            <select
              className="block w-full rounded-lg border border-neutral-300 py-2 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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

          {}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">Phân bổ Sprint</label>
            <select
              className="block w-full rounded-lg border border-neutral-300 py-2 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
      </form>
    </Modal>
  )
}
export default CreateStoryModal
