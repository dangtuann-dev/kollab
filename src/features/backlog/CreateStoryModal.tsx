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
  title: zod.string().min(5, 'Title must be at least 5 characters').max(100, 'Title cannot exceed 100 characters'),
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
  // Filter only planning/active sprints for assigning new stories
  const availableSprints = sprints.filter((s) => s.status !== 'completed')

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create User Story"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="create-story-form">
            Create Story
          </Button>
        </div>
      }
    >
      <form id="create-story-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Story Title"
          placeholder="e.g. As a user, I want to filter products by category"
          error={errors.title?.message}
          required
          {...register('title')}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700">Description</label>
          <textarea
            rows={3}
            placeholder="Describe the User Story in detail..."
            className="block w-full rounded-lg border border-neutral-300 py-2 px-3.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-neutral-400"
            {...register('description')}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700">Acceptance Criteria</label>
          <textarea
            rows={3}
            placeholder="Given [context] / When [action] / Then [outcome]..."
            className="block w-full rounded-lg border border-neutral-300 py-2 px-3.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-neutral-400"
            {...register('acceptance_criteria')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Priority select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">Priority</label>
            <select
              className="block w-full rounded-lg border border-neutral-300 py-2 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              {...register('priority')}
            >
              <option value="critical">🔴 Critical</option>
              <option value="high">🟠 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>

          {/* Story Points select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">Story Points (Fibonacci)</label>
            <select
              className="block w-full rounded-lg border border-neutral-300 py-2 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              {...register('story_points')}
            >
              <option value="">Unestimated</option>
              {fibonacciPoints.map((pts) => (
                <option key={pts} value={pts.toString()}>
                  {pts} Pt{pts !== 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Assignee select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">Assignee</label>
            <select
              className="block w-full rounded-lg border border-neutral-300 py-2 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              {...register('assignee_id')}
            >
              <option value="">Unassigned</option>
              {members.map((member: ProjectMember) => (
                <option key={member.id} value={member.user_id}>
                  {member.profile?.full_name || member.user_id}
                </option>
              ))}
            </select>
          </div>

          {/* Sprint select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">Sprint Allocation</label>
            <select
              className="block w-full rounded-lg border border-neutral-300 py-2 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              {...register('sprint_id')}
            >
              <option value="">Backlog (No Sprint)</option>
              {availableSprints.map((sprint) => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.name} ({sprint.status})
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
