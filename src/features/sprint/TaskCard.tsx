import React from 'react'
import { ChevronUp, ChevronRight, ChevronDown, AlertOctagon } from 'lucide-react'
import type { Story } from '../../types'
import { Avatar } from '../../components/ui/Avatar'

interface TaskCardProps {
  story: Story
  onClick: () => void
}

export const TaskCard: React.FC<TaskCardProps> = ({ story, onClick }) => {
  const priorityColors = {
    critical: 'border-l-danger-500',
    high: 'border-l-warning-500',
    medium: 'border-l-primary-500',
    low: 'border-l-neutral-300',
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
      className={`bg-white border border-neutral-200 rounded-lg p-3.5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 ${
        priorityColors[story.priority] || priorityColors.medium
      } flex flex-col gap-3 group`}
    >
      {/* Title */}
      <h4 className="text-xs font-bold text-neutral-800 line-clamp-2 leading-relaxed group-hover:text-primary-600 transition-colors">
        {story.title}
      </h4>

      {/* Footer info */}
      <div className="flex items-center justify-between gap-2 border-t border-neutral-100 pt-2.5">
        <div className="flex items-center gap-1.5">
          {priorityIcons[story.priority]}
          <span className="text-[9px] font-bold text-neutral-400">
            ST-{story.id.substring(0, 4).toUpperCase()}
          </span>
          {story.story_points !== null && (
            <span className="text-[9px] font-bold bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
              {story.story_points} SP
            </span>
          )}
        </div>

        {story.assignee && (
          <Avatar
            src={story.assignee.avatar_url}
            alt={story.assignee.full_name}
            fallback={story.assignee.full_name}
            size="xs"
          />
        )}
      </div>
    </div>
  )
}
export default TaskCard
