import React from 'react'
import { ChevronUp, ChevronRight, ChevronDown, AlertOctagon } from 'lucide-react'
import type { Story, Task } from '../../types'
import { Avatar } from '../../components/ui/Avatar'

interface TaskCardProps {
  story?: Story
  task?: Task
  onClick: () => void
}

export const TaskCard: React.FC<TaskCardProps> = React.memo(({ story, task, onClick }) => {
  const item = story || task
  if (!item) return null

  const priority = (item as any).priority || 'medium'
  const title = item.title
  const id = item.id
  const storyPoints = (item as any).story_points
  const assignee = (item as any).assignee

  const priorityColors = {
    critical: 'border-l-danger-500',
    high: 'border-l-warning-500',
    medium: 'border-l-primary-500',
    low: 'border-l-neutral-300 dark:border-l-neutral-700',
  }

  const priorityIcons = {
    critical: <AlertOctagon className="h-3 w-3 text-danger-500" />,
    high: <ChevronUp className="h-3 w-3 text-warning-500" />,
    medium: <ChevronRight className="h-3 w-3 text-primary-500" />,
    low: <ChevronDown className="h-3 w-3 text-neutral-400" />,
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 ${
        priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium
      } flex flex-col gap-2.5 group`}
    >
      {/* Title (compact on mobile) */}
      <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-100 line-clamp-2 leading-relaxed group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
        {title}
      </h4>

      {/* Details footer */}
      <div className="flex items-center justify-between gap-2 border-t border-neutral-100 dark:border-neutral-800/80 pt-2 font-sans">
        <div className="flex items-center gap-1.5 min-w-0">
          {priorityIcons[priority as keyof typeof priorityIcons]}
          <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 shrink-0">
            TS-{id.substring(0, 4).toUpperCase()}
          </span>
          {storyPoints !== undefined && storyPoints !== null && (
            <span className="hidden sm:inline-block text-[9px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-1.5 py-0.5 rounded">
              {storyPoints} SP
            </span>
          )}
        </div>

        {assignee && (
          <Avatar
            src={assignee.avatar_url}
            alt={assignee.full_name || 'Assignee'}
            fallback={assignee.full_name || 'A'}
            size="xs"
          />
        )}
      </div>
    </div>
  )
})

TaskCard.displayName = 'TaskCard'

export default TaskCard
