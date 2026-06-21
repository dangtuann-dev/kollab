import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, ListFilter, ArrowUpDown, Calendar, Play, ChevronDown, ChevronRight, Award } from 'lucide-react'
import { useBacklog } from '../../hooks/useBacklog'
import { useSprint } from '../../hooks/useSprint'
import { useProject } from '../../hooks/useProjects'
import { useAuthStore } from '../../stores'
import { StoryCard } from './StoryCard'
import { CreateStoryModal } from './CreateStoryModal'
import { StoryDetailPanel } from './StoryDetailPanel'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/shared/EmptyState'
import type { Story, ProjectMember } from '../../types'

export const BacklogPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const projectIdStr = projectId || ''
  
  const { role } = useAuthStore()
  const isPO = role === 'product_owner'
  const isSM = role === 'scrum_master'

  const { data: project, isLoading: loadingProject } = useProject(projectIdStr)
  const { stories, isLoading: loadingStories, moveStory, deleteStory } = useBacklog(projectIdStr)
  const { sprints, createSprint, startSprint, isLoading: loadingSprints } = useSprint(projectIdStr)

  // Modals & Panels State
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false)
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Filters State
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('order')

  // Collapsed sprints state
  const [collapsedSprints, setCollapsedSprints] = useState<Record<string, boolean>>({})

  // Create new sprint helper
  const handleCreateSprint = async () => {
    const name = `Sprint ${sprints.length + 1}`
    const goal = 'Sprint Goal definition'
    try {
      await createSprint({ name, goal })
    } catch (e) {
      console.error(e)
    }
  }

  // Start sprint helper
  const handleStartSprint = async (sprintId: string) => {
    const today = new Date().toISOString().split('T')[0]
    const twoWeeksLater = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    try {
      await startSprint({ sprintId, start_date: today, end_date: twoWeeksLater })
    } catch (e) {
      console.error(e)
    }
  }

  const toggleSprintCollapse = (id: string) => {
    setCollapsedSprints((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Filter & Sort stories
  const getFilteredAndSortedStories = (items: Story[]) => {
    return items
      .filter((story) => {
        if (priorityFilter !== 'all' && story.priority !== priorityFilter) return false
        if (assigneeFilter !== 'all' && story.assignee_id !== assigneeFilter) return false
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'points') return (b.story_points || 0) - (a.story_points || 0)
        if (sortBy === 'priority') {
          const priorities = { critical: 4, high: 3, medium: 2, low: 1 }
          return priorities[b.priority] - priorities[a.priority]
        }
        return a.order_index - b.order_index
      })
  }

  // Slices
  const backlogStories = getFilteredAndSortedStories(stories.filter((s) => s.sprint_id === null))
  const activeSprints = sprints.filter((s) => s.status !== 'completed')

  if (loadingProject || loadingStories || loadingSprints) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-2">
        <Spinner size="lg" />
        <p className="text-xs text-neutral-500 font-semibold">Loading backlog details...</p>
      </div>
    )
  }

  const projectMembers = project?.members || []

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Project Backlog</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Plan sprints, estimate stories, and prioritize deliverables.</p>
        </div>

        <div className="flex items-center gap-2.5">
          {isSM && (
            <Button variant="secondary" size="sm" onClick={handleCreateSprint} leftIcon={<Calendar className="h-4 w-4" />}>
              Create Sprint
            </Button>
          )}
          {isPO && (
            <Button size="sm" onClick={() => setIsCreateStoryOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
              Create Story
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Sorting bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 border border-neutral-200 rounded-xl shadow-sm text-xs font-semibold text-neutral-600">
        <div className="flex flex-wrap items-center gap-3">
          {/* Priority filter */}
          <div className="flex items-center gap-1.5 border-r border-neutral-200 pr-3 mr-1">
            <ListFilter className="h-3.5 w-3.5 text-neutral-400" />
            <span>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent border-none text-neutral-800 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Assignee filter */}
          <div className="flex items-center gap-1.5">
            <span>Assignee:</span>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="bg-transparent border-none text-neutral-800 font-bold focus:outline-none cursor-pointer max-w-[120px]"
            >
              <option value="all">All Members</option>
              {projectMembers.map((member: ProjectMember) => (
                <option key={member.id} value={member.user_id}>
                  {member.profile?.full_name || member.user_id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sorting selector */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="h-3.5 w-3.5 text-neutral-400" />
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent border-none text-neutral-800 font-bold focus:outline-none cursor-pointer"
          >
            <option value="order">Order Index</option>
            <option value="priority">Priority Level</option>
            <option value="points">Story Points</option>
          </select>
        </div>
      </div>

      {/* Sprints backlog section (Jira-style) */}
      <div className="flex flex-col gap-4">
        {activeSprints.map((sprint) => {
          const sprintStories = getFilteredAndSortedStories(stories.filter((s) => s.sprint_id === sprint.id))
          const sprintPoints = sprintStories.reduce((sum, s) => sum + (s.story_points || 0), 0)
          const isCollapsed = collapsedSprints[sprint.id] || false

          return (
            <div key={sprint.id} className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
              {/* Sprint Header */}
              <div className="flex items-center justify-between p-4 bg-neutral-50/50 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSprintCollapse(sprint.id)}
                    className="text-neutral-400 hover:text-neutral-600 rounded"
                  >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <h3 className="text-sm font-bold text-neutral-800">{sprint.name}</h3>
                  <Badge variant={sprint.status === 'active' ? 'info' : 'neutral'} size="sm">
                    {sprint.status === 'active' ? 'Active' : 'Planning'}
                  </Badge>
                  {sprintPoints > 0 && (
                    <span className="text-[10px] font-bold text-neutral-500 bg-neutral-200/80 px-2 py-0.5 rounded-full flex items-center">
                      <Award className="h-3 w-3 mr-0.5" />
                      {sprintPoints} SP
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  {sprint.status === 'planning' && isSM && sprintStories.length > 0 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleStartSprint(sprint.id)}
                      leftIcon={<Play className="h-3 w-3 text-success-600" />}
                      className="py-1 px-2.5 text-xs"
                    >
                      Start Sprint
                    </Button>
                  )}
                </div>
              </div>

              {/* Sprint Stories */}
              {!isCollapsed && (
                <div className="p-4 flex flex-col gap-2.5">
                  {sprintStories.length === 0 ? (
                    <p className="text-xs text-neutral-400 text-center py-6">
                      Drag stories here or use card actions to allocate to this sprint.
                    </p>
                  ) : (
                    sprintStories.map((story) => (
                      <StoryCard
                        key={story.id}
                        story={story}
                        sprints={sprints}
                        onOpenDetails={(s) => {
                          setSelectedStory(s)
                          setIsDetailOpen(true)
                        }}
                        onMoveToSprint={(id, sprintId) => moveStory({ storyId: id, sprintId })}
                        onDelete={(id) => deleteStory(id)}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Product Backlog Section */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <h3 className="text-sm font-bold text-neutral-800">Product Backlog</h3>
          <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2.5 py-0.5 rounded-full">
            {backlogStories.length} items
          </span>
        </div>

        {backlogStories.length === 0 ? (
          <EmptyState
            title="Backlog is empty"
            description="All stories are allocated to active sprints, or you haven't created any stories yet."
            action={
              isPO && (
                <Button onClick={() => setIsCreateStoryOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
                  Create User Story
                </Button>
              )
            }
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {backlogStories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                sprints={sprints}
                onOpenDetails={(s) => {
                  setSelectedStory(s)
                  setIsDetailOpen(true)
                }}
                onMoveToSprint={(id, sprintId) => moveStory({ storyId: id, sprintId })}
                onDelete={(id) => deleteStory(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals and Side panels */}
      <CreateStoryModal
        projectId={projectIdStr}
        isOpen={isCreateStoryOpen}
        onClose={() => setIsCreateStoryOpen(false)}
      />

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
export default BacklogPage
