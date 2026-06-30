import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ListTodo } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useBacklog } from '../../hooks/useBacklog'
import { useSprint } from '../../hooks/useSprint'
import { useProject } from '../../hooks/useProjects'
import { useAuthStore } from '../../stores'
import { SprintHeader } from './SprintHeader'
import { KanbanBoard } from './KanbanBoard'
import { StoryDetailPanel } from '../backlog/StoryDetailPanel'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/shared/EmptyState'
import type { Story, StoryStatus } from '../../types'

export const SprintBoardPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const projectIdStr = projectId || ''
  const queryClient = useQueryClient()

  const { role } = useAuthStore()

  useProject(projectIdStr)
  
  const { stories, isLoading: loadingStories, updateStory } = useBacklog(projectIdStr)
  const { activeSprint, completeSprint, isLoading: loadingSprints } = useSprint(projectIdStr)

  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const activeStories = stories.filter((s) => s.sprint_id === activeSprint?.id)

  useEffect(() => {
    if (!activeSprint?.id) return

    const channel = supabase
      .channel(`sprint-board-channel-${activeSprint.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stories',
          filter: `sprint_id=eq.${activeSprint.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['stories', projectIdStr] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeSprint?.id, projectIdStr, queryClient])

  const handleUpdateStatus = async (storyId: string, status: StoryStatus) => {
    
    queryClient.setQueryData(['stories', projectIdStr], (oldStories: Story[] | undefined) => {
      if (!oldStories) return oldStories
      return oldStories.map((story) => (story.id === storyId ? { ...story, status } : story))
    })

    try {
      await updateStory({ id: storyId, status })
    } catch (err) {
      
      queryClient.invalidateQueries({ queryKey: ['stories', projectIdStr] })
    }
  }

  const handleCompleteSprint = async () => {
    if (!activeSprint) return
    if (confirm('Bạn có chắc chắn muốn hoàn thành sprint này không? Những story chưa hoàn thành còn lại sẽ được chuyển về backlog.')) {
      try {
        
        const incompleteStories = activeStories.filter((s) => s.status !== 'done')
        for (const story of incompleteStories) {
          await updateStory({ id: story.id, sprint_id: null, status: 'backlog' })
        }

        await completeSprint(activeSprint.id)
      } catch (err) {
        console.error(err)
      }
    }
  }

  if (loadingStories || loadingSprints) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-2">
        <Spinner size="lg" />
        <p className="text-xs text-neutral-500 font-semibold">Đang tải Bảng Sprint...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      {activeSprint ? (
        <>
          <SprintHeader
            sprint={activeSprint}
            stories={activeStories}
            onCompleteSprint={handleCompleteSprint}
          />
          
          <KanbanBoard
            stories={activeStories}
            onUpdateStatus={handleUpdateStatus}
            onOpenDetails={(story) => {
              setSelectedStory(story)
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

      {}
      <StoryDetailPanel
        story={selectedStory}
        projectId={projectIdStr}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false)
          setSelectedStory(null)
        }}
      />
    </div>
  )
}
export default SprintBoardPage
