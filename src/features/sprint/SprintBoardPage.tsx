import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ListTodo, Radio } from 'lucide-react'
import { useBacklog } from '../../hooks/useBacklog'
import { useSprint } from '../../hooks/useSprint'
import { useCompleteSprint } from '../../hooks/useCompleteSprint'
import { useProject } from '../../hooks/useProjects'
import { useAuthStore } from '../../stores'
import { SprintHeader } from './SprintHeader'
import { KanbanBoard } from './KanbanBoard'
import { TaskDetailModal } from './TaskDetailModal'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/shared/EmptyState'
import { useRealtimeBoard } from '../../hooks/useRealtimeBoard'
import { usePresence } from '../../hooks/usePresence'
import { ProjectOnboardingChecklist } from '../../components/onboarding/ProjectOnboardingChecklist'
import type { Task, TaskStatus } from '../../types'

export const SprintBoardPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const projectIdStr = projectId || ''

  const { role, user } = useAuthStore()

  useProject(projectIdStr)
  
  const { stories, isLoading: loadingStories } = useBacklog(projectIdStr)
  const { activeSprint, isLoading: loadingSprints } = useSprint(projectIdStr)
  const { mutateAsync: completeSprint } = useCompleteSprint(projectIdStr)

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const activeStories = stories.filter((s) => s.sprint_id === activeSprint?.id)
  const activeStoryIds = activeStories.map((s) => s.id)

  // 1. Load tasks via realtime board hook
  const { tasks, isLoading: loadingTasks, updateTask, createTask } = useRealtimeBoard(
    activeSprint?.id || '',
    activeStoryIds
  )

  // 2. Load presence info
  const currentUserProfile = user ? {
    id: user.id,
    full_name: user.user_metadata?.full_name || user.email || 'Thành viên',
    avatar_url: user.user_metadata?.avatar_url || null
  } as any : null

  const onlineUsers = usePresence(
    activeSprint ? `presence-sprint-${activeSprint.id}` : '',
    currentUserProfile
  )

  const handleUpdateStatus = async (taskId: string, status: TaskStatus) => {
    try {
      await updateTask({ id: taskId, status })
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateTask = async (vars: { title: string; user_story_id: string; status: TaskStatus }) => {
    try {
      await createTask({
        title: vars.title,
        user_story_id: vars.user_story_id,
        status: vars.status,
      })
    } catch (err) {
      console.error(err)
    }
  }

  const handleCompleteSprint = async () => {
    if (!activeSprint) return
    if (
      confirm(
        'Bạn có chắc chắn muốn hoàn thành sprint này không? Những story chưa hoàn thành còn lại sẽ được chuyển về backlog.'
      )
    ) {
      try {
        await completeSprint(activeSprint.id)
      } catch (err) {
        console.error(err)
      }
    }
  }

  if (loadingStories || loadingSprints || loadingTasks) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-2">
        <Spinner size="lg" />
        <p className="text-xs text-neutral-500 font-semibold">Đang tải Bảng Sprint...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      <ProjectOnboardingChecklist
        projectId={projectIdStr}
        hasStories={stories.length > 0}
        hasActiveSprint={!!activeSprint}
      />
      {activeSprint ? (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
            <SprintHeader
              sprint={activeSprint}
              stories={activeStories}
              onCompleteSprint={handleCompleteSprint}
            />

            {/* Presence UI */}
            <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 rounded-full py-1.5 px-3 shadow-xs shrink-0 self-stretch sm:self-auto justify-between sm:justify-start">
              <div className="flex items-center gap-1.5 text-xs text-neutral-600 font-semibold">
                <Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                <span>Đang xem ({onlineUsers.length}):</span>
              </div>
              <div className="flex -space-x-1.5 overflow-hidden">
                {onlineUsers.map((u) => (
                  <div key={u.id} className="relative group">
                    {u.avatar_url ? (
                      <img
                        src={u.avatar_url}
                        alt={u.full_name || 'User'}
                        className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                      />
                    ) : (
                      <div className="inline-block h-6 w-6 rounded-full bg-indigo-50 ring-2 ring-white text-indigo-600 flex items-center justify-center text-[9px] font-bold">
                        {u.full_name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 block h-1.5 w-1.5 rounded-full bg-emerald-400 ring-1 ring-white animate-ping" />
                    <span className="absolute bottom-0 right-0 block h-1.5 w-1.5 rounded-full bg-emerald-500 ring-1 ring-white" />
                    
                    {/* Tooltip */}
                    <span className="absolute bottom-full right-1/2 translate-x-1/2 mb-1 px-1.5 py-0.5 bg-neutral-800 text-[8px] font-bold text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {u.full_name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <KanbanBoard
            tasks={tasks}
            stories={activeStories}
            onUpdateStatus={handleUpdateStatus}
            onCreateTask={handleQuickCreate => handleCreateTask(handleQuickCreate)}
            onOpenDetails={(task) => {
              setSelectedTask(task)
              setIsDetailOpen(true)
            }}
          />
        </>
      ) : (
        <EmptyState
          title="Không có Sprint đang hoạt động"
          description={
            role === 'scrum_master'
              ? "Hiện tại không có sprint nào đang hoạt động. Đi tới backlog của dự án để lập kế hoạch và bắt đầu một sprint mới."
              : "Hiện tại không có sprint nào đang hoạt động. Hãy yêu cầu Scrum Master của bạn kích hoạt một sprint."
          }
          action={
            <Link to={`/projects/${projectIdStr}/backlog`}>
              <Button leftIcon={<ListTodo className="h-4.5 w-4.5" />}>Đi tới Backlog</Button>
            </Link>
          }
        />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          projectId={projectIdStr}
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false)
            setSelectedTask(null)
          }}
        />
      )}
    </div>
  )
}

export default SprintBoardPage
