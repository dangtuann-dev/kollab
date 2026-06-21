import React from 'react'
import { AlertCircle } from 'lucide-react'
import type { Story, StoryStatus } from '../../types'
import TaskCard from './TaskCard'

interface KanbanBoardProps {
  stories: Story[]
  onUpdateStatus: (storyId: string, status: StoryStatus) => void
  onOpenDetails: (story: Story) => void
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  stories,
  onUpdateStatus,
  onOpenDetails,
}) => {
  const columns: { id: StoryStatus; name: string; accentColor: string }[] = [
    { id: 'todo', name: 'To Do', accentColor: 'bg-primary-500' },
    { id: 'in_progress', name: 'In Progress', accentColor: 'bg-purple-500' },
    { id: 'review', name: 'In Review', accentColor: 'bg-warning-500' },
    { id: 'done', name: 'Done', accentColor: 'bg-success-500' },
  ]

  // Bộ xử lý kéo thả (Drag and Drop) thuần
  const handleDragStart = (e: React.DragEvent, storyId: string) => {
    e.dataTransfer.setData('text/plain', storyId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = (e: React.DragEvent, status: StoryStatus) => {
    e.preventDefault()
    const storyId = e.dataTransfer.getData('text/plain')
    if (storyId) {
      onUpdateStatus(storyId, status)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // Tính toán giới hạn số lượng công việc đang xử lý (WIP) cho cột In Progress
  // Cảnh báo giới hạn WIP: cảnh báo nếu bất kỳ thành viên nào có > 3 story trong cột 'in_progress'
  const getWIPWarnings = () => {
    const inProgressStories = stories.filter((s) => s.status === 'in_progress')
    const userStoryCounts: Record<string, { name: string; count: number }> = {}

    inProgressStories.forEach((s) => {
      if (s.assignee) {
        const id = s.assignee_id || ''
        if (!userStoryCounts[id]) {
          userStoryCounts[id] = { name: s.assignee.full_name, count: 0 }
        }
        userStoryCounts[id].count += 1
      }
    })

    return Object.values(userStoryCounts).filter((u) => u.count > 3)
  }

  const wipWarnings = getWIPWarnings()

  return (
    <div className="flex flex-col gap-4 font-sans">
      {/* Banner Cảnh báo Giới hạn WIP */}
      {wipWarnings.length > 0 && (
        <div className="flex flex-col gap-1.5 p-3.5 bg-warning-50 border border-warning-200 rounded-xl text-xs text-warning-800 font-semibold">
          {wipWarnings.map((warning, index) => (
            <div key={index} className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-warning-600 shrink-0" />
              <span>
                WIP Warning: <span className="underline">{warning.name}</span> has {warning.count} stories In Progress. (Scrum recommendation: max 3 stories).
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Lưới các cột Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start min-h-[500px]">
        {columns.map((col) => {
          const colStories = stories.filter((s) => s.status === col.id)

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="bg-neutral-100/70 border border-neutral-200/50 rounded-xl p-3 flex flex-col gap-3 min-h-[450px] transition-all"
            >
              {/* Tiêu đề cột */}
              <div className="flex items-center justify-between border-b border-neutral-200/50 pb-2.5 px-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${col.accentColor}`} />
                  <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">{col.name}</span>
                </div>
                <span className="text-[10px] font-bold text-neutral-500 bg-neutral-200/60 px-2 py-0.5 rounded-full">
                  {colStories.length}
                </span>
              </div>

              {/* Danh sách thẻ công việc */}
              <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[60vh] pr-0.5">
                {colStories.length === 0 ? (
                  <div className="border border-dashed border-neutral-300 rounded-lg py-10 text-center text-[11px] text-neutral-400">
                    Drag items here
                  </div>
                ) : (
                  colStories.map((story) => (
                    <div
                      key={story.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, story.id)}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <TaskCard story={story} onClick={() => onOpenDetails(story)} />
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default KanbanBoard
