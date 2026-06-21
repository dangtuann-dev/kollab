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

  // Eagerly load project to populate store
  useProject(projectIdStr)
  
  const { stories, isLoading: loadingStories, updateStory } = useBacklog(projectIdStr)
  const { activeSprint, completeSprint, isLoading: loadingSprints } = useSprint(projectIdStr)

  // Drawer / details state
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Filter stories belonging to the active sprint
  const activeStories = stories.filter((s) => s.sprint_id === activeSprint?.id)

  // Realtime subscription for stories of this project/sprint
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
    // Optimistic cache update for buttery smooth drag-and-drop
    queryClient.setQueryData(['stories', projectIdStr], (oldStories: Story[] | undefined) => {
      if (!oldStories) return oldStories
      return oldStories.map((story) => (story.id === storyId ? { ...story, status } : story))
    })

    try {
      await updateStory({ id: storyId, status })
    } catch (err) {
      // Revert in case of failure (refetch)
      queryClient.invalidateQueries({ queryKey: ['stories', projectIdStr] })
    }
  }

  const handleCompleteSprint = async () => {
    if (!activeSprint) return
    if (confirm('Are you sure you want to complete this sprint? Remaining incomplete stories will be moved back to the backlog.')) {
      try {
        // Move incomplete stories back to backlog
        const incompleteStories = activeStories.filter((s) => s.status !== 'done')
        for (const story of incompleteStories) {
          await updateStory({ id: story.id, sprint_id: null, status: 'backlog' })
        }

        // Complete sprint
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
        <p className="text-xs text-neutral-500 font-semibold">Loading Sprint Board...</p>
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
          title="No Active Sprint"
          description={
            role === 'scrum_master'
              ? "There is no active sprint right now. Go to the project backlog to plan and start a new sprint."
              : "There is no active sprint right now. Ask your Scrum Master to activate a sprint."
          }
          action={
            <Link to={`/projects/${projectIdStr}/backlog`}>
              <Button leftIcon={<ListTodo className="h-4.5 w-4.5" />}>Go to Backlog</Button>
            </Link>
          }
        />
      )}

      {/* Details side drawer */}
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
