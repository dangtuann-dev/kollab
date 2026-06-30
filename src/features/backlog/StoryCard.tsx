import React, { useState } from 'react'
import { MoreVertical, Edit2, Trash2, ArrowUpRight, ArrowDownRight, GripVertical } from 'lucide-react'
import type { Story, Sprint } from '../../types'
import { PriorityBadge } from '../../components/shared/PriorityBadge'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { Avatar } from '../../components/ui/Avatar'
import { useAuthStore } from '../../stores'

interface StoryCardProps {
  story: Story
  sprints: Sprint[]
  onOpenDetails: (story: Story) => void
  onEdit?: (story: Story) => void
  onMoveToSprint: (storyId: string, sprintId: string | null) => void
  onDelete: (storyId: string) => void
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  sprints,
  onOpenDetails,
  onEdit,
  onMoveToSprint,
  onDelete,
}) => {
  const { role } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const isPO = role === 'product_owner'

  const activeSprints = sprints.filter((s) => s.status !== 'completed')

  let parsedLabels: Array<{ name: string; color: string; hex: string }> = []
  if (story.labels) {
    try {
      const parsed = JSON.parse(story.labels)
      if (Array.isArray(parsed)) {
        parsedLabels = parsed
      }
    } catch {
      parsedLabels = []
    }
  }

  return (
    <div className="bg-white border border-neutral-200/80 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-205 flex items-center justify-between gap-3 group">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="text-neutral-350 cursor-grab active:cursor-grabbing hover:text-neutral-500">
          <GripVertical className="h-4.5 w-4.5" />
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-1.5" onClick={() => onOpenDetails(story)}>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 rounded px-1.5 py-0.5">
              STORY-{story.id.substring(0, 4).toUpperCase()}
            </span>
            <PriorityBadge priority={story.priority} />
            {story.story_points !== null && (
              <span className="inline-flex items-center text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                {story.story_points} SP
              </span>
            )}
            {parsedLabels.map((lbl) => (
              <span
                key={lbl.name}
                className="text-[9px] font-bold px-1.5 py-0.25 rounded-full border"
                style={{
                  backgroundColor: `${lbl.hex}15`,
                  color: lbl.hex,
                  borderColor: `${lbl.hex}30`,
                }}
              >
                {lbl.name}
              </span>
            ))}
          </div>
          
          <h4 className="text-sm font-semibold text-neutral-800 truncate cursor-pointer hover:text-primary-600 transition-colors">
            {story.title}
          </h4>
          
          <div className="flex items-center gap-3 mt-1">
            <StatusBadge status={story.status} />
            {story.assignee && (
              <div className="flex items-center gap-1.5">
                <Avatar
                  src={story.assignee.avatar_url}
                  alt={story.assignee.full_name}
                  fallback={story.assignee.full_name}
                  size="xs"
                />
                <span className="text-[11px] text-neutral-500 font-medium truncate max-w-[100px]">
                  {story.assignee.full_name.split(' ')[0]}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-neutral-400 hover:text-neutral-600 rounded p-1 hover:bg-neutral-50 focus:outline-none transition-colors"
        >
          <MoreVertical className="h-5 w-5" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 mt-1 w-48 bg-white border border-neutral-150 rounded-lg shadow-lg z-20 py-1.5 origin-top-right animate-slide-up">
              <button
                onClick={() => {
                  setMenuOpen(false)
                  if (onEdit) {
                    onEdit(story)
                  } else {
                    onOpenDetails(story)
                  }
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 transition-colors text-left font-semibold"
              >
                <Edit2 className="h-3.5 w-3.5 text-neutral-400" />
                <span>Xem / Sửa chi tiết</span>
              </button>

              {isPO && activeSprints.length > 0 && (
                <div className="border-t border-neutral-100 my-1 pt-1">
                  <div className="px-3 py-1 text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                    Di chuyển sang Sprint
                  </div>
                  {story.sprint_id && (
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        onMoveToSprint(story.id, null)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 transition-colors text-left"
                    >
                      <ArrowDownRight className="h-3.5 w-3.5 text-neutral-400" />
                      <span>Backlog</span>
                    </button>
                  )}
                  {activeSprints
                    .filter((s) => s.id !== story.sprint_id)
                    .map((sprint) => (
                      <button
                        key={sprint.id}
                        onClick={() => {
                          setMenuOpen(false)
                          onMoveToSprint(story.id, sprint.id)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 transition-colors text-left truncate"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5 text-primary-500" />
                        <span>{sprint.name}</span>
                      </button>
                    ))}
                </div>
              )}

              {isPO && (
                <div className="border-t border-neutral-100 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      if (confirm('Bạn có chắc chắn muốn xóa story này?')) {
                        onDelete(story.id)
                      }
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-danger-600 hover:bg-danger-50 transition-colors text-left font-semibold"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Xóa Story</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
export default StoryCard
