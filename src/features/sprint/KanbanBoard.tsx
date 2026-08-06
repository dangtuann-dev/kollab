import React, { useState } from 'react'
import { DndContext, closestCenter, useDroppable, useDraggable } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { AlertCircle, Calendar, Plus, Tag } from 'lucide-react'
import type { Task, TaskStatus, Story } from '../../types'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'

interface KanbanBoardProps {
  tasks: Task[]
  stories: Story[]
  onUpdateStatus: (taskId: string, status: TaskStatus) => void
  onOpenDetails: (task: Task) => void
  onCreateTask: (vars: { title: string; user_story_id: string; status: TaskStatus }) => void
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  stories,
  onUpdateStatus,
  onOpenDetails,
  onCreateTask,
}) => {
  const [quickTaskTitle, setQuickTaskTitle] = useState('')
  const [selectedStoryId, setSelectedStoryId] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const columns: { id: TaskStatus; name: string; accentColor: string; bgClass: string; borderClass: string }[] = [
    { id: 'todo', name: 'Cần làm (To Do)', accentColor: 'bg-indigo-500', bgClass: 'bg-indigo-50/20', borderClass: 'border-indigo-150' },
    { id: 'in_progress', name: 'Đang làm (In Progress)', accentColor: 'bg-amber-500', bgClass: 'bg-amber-50/20', borderClass: 'border-amber-150' },
    { id: 'done', name: 'Hoàn thành (Done)', accentColor: 'bg-success-500', bgClass: 'bg-success-50/20', borderClass: 'border-success-150' },
  ]

  
  React.useEffect(() => {
    if (stories.length > 0 && !selectedStoryId) {
      setSelectedStoryId(stories[0].id)
    }
  }, [stories, selectedStoryId])

  const handleDragEnd = React.useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as TaskStatus

    const task = tasks.find((t) => t.id === taskId)
    if (task && task.status !== newStatus) {
      onUpdateStatus(taskId, newStatus)
    }
  }, [tasks, onUpdateStatus])

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickTaskTitle.trim() || !selectedStoryId) return

    onCreateTask({
      title: quickTaskTitle.trim(),
      user_story_id: selectedStoryId,
      status: 'todo',
    })
    setQuickTaskTitle('')
    setIsAdding(false)
  }

  
  const getWIPWarnings = () => {
    const inProgressTasks = tasks.filter((t) => t.status === 'in_progress')
    const userTaskCounts: Record<string, { name: string; count: number }> = {}

    inProgressTasks.forEach((t) => {
      if (t.assignee) {
        const id = t.assignee_id || ''
        if (!userTaskCounts[id]) {
          userTaskCounts[id] = { name: t.assignee.full_name || 'Thành viên', count: 0 }
        }
        userTaskCounts[id].count += 1
      }
    })

    return Object.values(userTaskCounts).filter((u) => u.count > 3)
  }

  const wipWarnings = getWIPWarnings()

  
  const DroppableColumn: React.FC<{
    col: typeof columns[0]
    children: React.ReactNode
    count: number
  }> = ({ col, children, count }) => {
    const { setNodeRef } = useDroppable({ id: col.id })
    return (
      <div
        ref={setNodeRef}
        className={`flex-1 min-w-[280px] ${col.bgClass} border ${col.borderClass} rounded-2xl p-4 flex flex-col gap-4 min-h-[500px] shadow-sm`}
      >
        <div className="flex items-center justify-between border-b border-neutral-150 pb-3">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${col.accentColor} animate-pulse`} />
            <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">{col.name}</span>
          </div>
          <span className="text-[10px] font-bold text-neutral-500 bg-white/80 border border-neutral-200/50 px-2 py-0.5 rounded-full">
            {count}
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[65vh] pr-1">
          {children}
        </div>
      </div>
    )
  }

  const DraggableTaskCard: React.FC<{ task: Task }> = ({ task }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: task.id,
    })

    const style = {
      transform: CSS.Transform.toString(transform),
      opacity: isDragging ? 0.4 : 1,
    }

    const priorityColors = {
      critical: 'bg-rose-50 text-rose-700 border-rose-100',
      high: 'bg-orange-50 text-orange-700 border-orange-100',
      medium: 'bg-amber-50 text-amber-700 border-amber-100',
      low: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    }[task.priority || 'medium']

    const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done'

    return (
      <div
        ref={setNodeRef}
        style={style}
        onClick={() => onOpenDetails(task)}
        {...attributes}
        {...listeners}
        className={`p-3.5 bg-white border border-neutral-200 rounded-xl shadow-xs hover:shadow-md hover:border-neutral-300 transition-all duration-200 flex flex-col gap-3 group relative cursor-grab active:cursor-grabbing ${
          isDragging ? 'rotate-1 shadow-lg border-primary-400 z-55' : ''
        }`}
      >
        <div className="flex flex-col gap-1">
          {task.user_story && (
            <span className="text-[9px] font-bold text-neutral-400 tracking-wider">
              {task.user_story.title.substring(0, 30)}...
            </span>
          )}
          <h4 className="text-xs font-bold text-neutral-850 group-hover:text-primary-600 transition-colors leading-snug">
            {task.title}
          </h4>
        </div>

        {/* Labels & Tags */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {task.priority && (
            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${priorityColors}`}>
              {task.priority === 'critical' ? 'Khẩn cấp' : task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
            </span>
          )}
          {task.labels && (
            <span className="text-[9px] font-bold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Tag className="h-2 w-2 text-neutral-400" />
              {task.labels}
            </span>
          )}
          {task.story_points !== undefined && task.story_points !== null && (
            <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
              {task.story_points} SP
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-1 pt-2.5 border-t border-neutral-100 text-[10px] font-semibold text-neutral-500">
          <div className="flex items-center gap-2">
            {task.deadline && (
              <span className={`flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-bold' : ''}`}>
                <Calendar className="h-3 w-3" />
                {new Date(task.deadline).toLocaleDateString([], { month: '2-digit', day: '2-digit' })}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {task.assignee ? (
              <div className="relative group/avatar">
                <Avatar
                  src={task.assignee.avatar_url}
                  alt={task.assignee.full_name || 'Assignee'}
                  size="xs"
                />
                <span className="absolute bottom-full right-1/2 translate-x-1/2 mb-1 px-1.5 py-0.5 bg-neutral-800 text-[9px] text-white rounded opacity-0 group-hover/avatar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {task.assignee.full_name}
                </span>
              </div>
            ) : (
              <div className="h-5 w-5 rounded-full border border-dashed border-neutral-300 flex items-center justify-center text-[10px] text-neutral-400 bg-neutral-50">
                +
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 font-sans">
      {/* WIP Warnings Banner */}
      {wipWarnings.length > 0 && (
        <div className="flex flex-col gap-1.5 p-3.5 bg-warning-50 border border-warning-200 rounded-xl text-xs text-warning-800 font-semibold shadow-xs">
          {wipWarnings.map((warning, index) => (
            <div key={index} className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-warning-600 shrink-0" />
              <span>
                Cảnh báo WIP: <span className="underline">{warning.name}</span> đang làm {warning.count} công việc song song. (Khuyến nghị Scrum: tối đa 3).
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Kanban Drag and Drop Context */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex flex-col lg:flex-row gap-5 items-stretch min-h-[500px]">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id)

            return (
              <DroppableColumn key={col.id} col={col} count={colTasks.length}>
                {colTasks.length === 0 ? (
                  <div className="border border-dashed border-neutral-300 rounded-xl py-12 text-center text-[11px] text-neutral-450 bg-white/40 flex-1 flex flex-col items-center justify-center">
                    Kéo thả công việc vào đây
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <DraggableTaskCard key={task.id} task={task} />
                  ))
                )}

                {/* Quick Add at bottom of To Do Column */}
                {col.id === 'todo' && stories.length > 0 && (
                  <div className="mt-auto pt-3 border-t border-neutral-200">
                    {isAdding ? (
                      <form onSubmit={handleQuickAdd} className="flex flex-col gap-2 bg-white p-3 border border-neutral-200 rounded-xl shadow-sm">
                        <input
                          type="text"
                          placeholder="Tiêu đề công việc mới..."
                          value={quickTaskTitle}
                          onChange={(e) => setQuickTaskTitle(e.target.value)}
                          className="w-full text-xs border border-neutral-250 rounded-lg p-2 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                          required
                          autoFocus
                        />
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-neutral-400">Chọn User Story:</label>
                          <select
                            value={selectedStoryId}
                            onChange={(e) => setSelectedStoryId(e.target.value)}
                            className="w-full text-[10px] bg-neutral-50 border border-neutral-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          >
                            {stories.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.title.substring(0, 30)}...
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center justify-end gap-1.5 mt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="py-1 px-2 text-[10px]"
                          >
                            Hủy
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            type="submit"
                            className="py-1 px-2.5 text-[10px]"
                          >
                            Thêm
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setIsAdding(true)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-neutral-300 hover:border-neutral-450 hover:bg-neutral-50 text-[11px] font-bold text-neutral-500 rounded-xl transition-all"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Thêm công việc nhanh
                      </button>
                    )}
                  </div>
                )}
              </DroppableColumn>
            )
          })}
        </div>
      </DndContext>
    </div>
  )
}

export default KanbanBoard
