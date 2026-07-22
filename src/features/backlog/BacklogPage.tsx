import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, ListFilter, ArrowUpDown, Calendar, Play, Search } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
  useDroppable,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { useBacklog } from '../../hooks/useBacklog'
import { useSprint } from '../../hooks/useSprint'
import { useStartSprint } from '../../hooks/useStartSprint'
import { useProject } from '../../hooks/useProjects'
import { useAuthStore } from '../../stores'
import { StoryCard } from './StoryCard'
import { UserStoryFormModal } from './UserStoryFormModal'
import { StoryDetailPanel } from './StoryDetailPanel'
import { SprintFormModal } from '../sprint/SprintFormModal'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import type { Story, ProjectMember, Sprint } from '../../types'

// Droppable container wrapper
const DroppableColumn: React.FC<{ id: string; children: React.ReactNode; className?: string }> = ({ id, children, className }) => {
  const { setNodeRef } = useDroppable({ id })
  return (
    <div ref={setNodeRef} className={className}>
      {children}
    </div>
  )
}

export const BacklogPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const projectIdStr = projectId || ''
  
  const { role } = useAuthStore()
  const isPO = role === 'product_owner'
  const isSM = role === 'scrum_master'

  const { data: project, isLoading: loadingProject } = useProject(projectIdStr)
  const { sprints, updateSprint, isLoading: loadingSprints } = useSprint(projectIdStr)
  const { mutateAsync: runStartSprint } = useStartSprint(projectIdStr)

  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false)
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [sprintToEdit, setSprintToEdit] = useState<Sprint | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [labelFilter, setLabelFilter] = useState<string>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('order')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const {
    stories,
    isLoading: loadingStories,
    moveStory,
    deleteStory,
    reorderStories,
  } = useBacklog(projectIdStr, {
    priority: priorityFilter,
    label: labelFilter,
    assigneeId: assigneeFilter,
    search: debouncedSearchQuery,
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  const handleOpenCreateSprint = () => {
    setSprintToEdit(null)
    setIsSprintModalOpen(true)
  }

  const handleOpenEditSprint = (sprint: Sprint) => {
    setSprintToEdit(sprint)
    setIsSprintModalOpen(true)
  }

  const handleStartSprint = async (sprint: Sprint) => {
    const today = new Date().toISOString().split('T')[0]
    const twoWeeksLater = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    try {
      await runStartSprint({
        sprintId: sprint.id,
        startDate: sprint.start_date || today,
        endDate: sprint.end_date || twoWeeksLater,
      })
    } catch (e) {
      console.error(e)
    }
  }

  const getSortedStories = (items: Story[]) => {
    return [...items].sort((a, b) => {
      if (sortBy === 'points') return (b.story_points || 0) - (a.story_points || 0)
      if (sortBy === 'priority') {
        const priorities = { critical: 4, high: 3, medium: 2, low: 1 }
        return priorities[b.priority] - priorities[a.priority]
      }
      return a.order_index - b.order_index
    })
  }

  const [selectedSprintId, setSelectedSprintId] = useState<string>('')
  const [capacity, setCapacity] = useState<number>(10)

  const activeSprints = sprints.filter((s) => s.status !== 'completed')

  // Auto-select first active sprint if none selected
  useEffect(() => {
    if (activeSprints.length > 0 && !selectedSprintId) {
      setSelectedSprintId(activeSprints[0].id)
    }
  }, [activeSprints, selectedSprintId])

  const selectedSprint = sprints.find((s) => s.id === selectedSprintId) || activeSprints[0]

  useEffect(() => {
    if (selectedSprint) {
      setCapacity(selectedSprint.velocity || 10)
    }
  }, [selectedSprint?.id])

  const handleCapacityChange = async (val: number) => {
    setCapacity(val)
    if (selectedSprint) {
      try {
        await updateSprint({
          sprintId: selectedSprint.id,
          name: selectedSprint.name,
          velocity: val,
        })
      } catch (e) {
        console.error(e)
      }
    }
  }

  const backlogStories = getSortedStories(stories.filter((s) => s.sprint_id === null))
  const sprintStories = selectedSprint 
    ? getSortedStories(stories.filter((s) => s.sprint_id === selectedSprint.id))
    : []

  const sprintPoints = sprintStories.reduce((sum, s) => sum + (s.story_points || 0), 0)

  const isDragDisabled =
    sortBy !== 'order' ||
    priorityFilter !== 'all' ||
    labelFilter !== 'all' ||
    assigneeFilter !== 'all' ||
    debouncedSearchQuery.trim() !== ''

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find the story being dragged
    const activeStory = stories.find((s) => s.id === activeId)
    if (!activeStory) return

    const activeContainer = activeStory.sprint_id ? 'sprint' : 'backlog'

    // Determine target container
    let targetContainer: 'backlog' | 'sprint' | null = null
    if (overId === 'backlog' || overId === 'sprint') {
      targetContainer = overId
    } else {
      // dropped over a card, find its container
      const overStory = stories.find((s) => s.id === overId)
      if (overStory) {
        targetContainer = overStory.sprint_id ? 'sprint' : 'backlog'
      }
    }

    if (!targetContainer) return

    // If container changed
    if (activeContainer !== targetContainer) {
      const targetSprintId = targetContainer === 'sprint' ? selectedSprint?.id || null : null
      try {
        await moveStory({ storyId: activeId, sprintId: targetSprintId })
      } catch (err) {
        console.error('Lỗi khi di chuyển story:', err)
      }
    } else if (targetContainer === 'backlog' && !isDragDisabled) {
      // Reordering inside backlog
      const oldIndex = backlogStories.findIndex((s) => s.id === activeId)
      const newIndex = backlogStories.findIndex((s) => s.id === overId)

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reorderedList = arrayMove(backlogStories, oldIndex, newIndex)
        const updatedStories = reorderedList.map((story, index) => ({
          ...story,
          order_index: index,
        }))
        try {
          await reorderStories(updatedStories)
        } catch (err) {
          console.error('Lỗi khi sắp xếp lại backlog:', err)
        }
      }
    }
  }

  if (loadingProject || loadingStories || loadingSprints) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-2">
        <Spinner size="lg" />
        <p className="text-xs text-neutral-500 font-semibold">Đang tải chi tiết backlog...</p>
      </div>
    )
  }

  const projectMembers = project?.members || []
  const labelOptions = ['Feature', 'Bug', 'UI/UX', 'Refactor', 'Backend', 'Testing']

  const isStartSprintActive = selectedSprint && selectedSprint.status === 'planning' && sprintStories.length > 0

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Kế hoạch Sprint & Backlog</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Kéo thả các User Story để lập kế hoạch Sprint, điều chỉnh dung lượng của đội nhóm.</p>
        </div>

        <div className="flex items-center gap-2.5">
          {isSM && (
            <Button variant="secondary" size="sm" onClick={handleOpenCreateSprint} leftIcon={<Calendar className="h-4 w-4" />}>
              Tạo Sprint
            </Button>
          )}
          {isPO && (
            <Button
              size="sm"
              onClick={() => {
                setSelectedStory(null)
                setIsFormModalOpen(true)
              }}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Tạo Story
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 bg-white p-4 border border-neutral-200 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 border border-neutral-200 rounded-lg px-3 py-2 bg-neutral-50 focus-within:ring-2 focus-within:ring-primary-500 focus-within:bg-white transition-all">
          <Search className="h-4 w-4 text-neutral-400 shrink-0" />
          <input
            type="text"
            placeholder="Tìm kiếm tiêu đề User Story..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none text-sm outline-none placeholder-neutral-400 text-neutral-800"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-neutral-600 pt-1">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 border-r border-neutral-200 pr-4">
              <ListFilter className="h-3.5 w-3.5 text-neutral-400" />
              <span>Độ ưu tiên:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-transparent border-none text-neutral-800 font-bold focus:outline-none cursor-pointer"
              >
                <option value="all">Tất cả</option>
                <option value="critical">Khẩn cấp</option>
                <option value="high">Cao</option>
                <option value="medium">Trung bình</option>
                <option value="low">Thấp</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 border-r border-neutral-200 pr-4">
              <span>Nhãn dán:</span>
              <select
                value={labelFilter}
                onChange={(e) => setLabelFilter(e.target.value)}
                className="bg-transparent border-none text-neutral-800 font-bold focus:outline-none cursor-pointer"
              >
                <option value="all">Tất cả nhãn</option>
                {labelOptions.map((lbl) => (
                  <option key={lbl} value={lbl}>
                    {lbl}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span>Người thực hiện:</span>
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="bg-transparent border-none text-neutral-800 font-bold focus:outline-none cursor-pointer max-w-[120px]"
              >
                <option value="all">Tất cả</option>
                {projectMembers.map((member: ProjectMember) => (
                  <option key={member.id} value={member.user_id}>
                    {member.profile?.full_name || member.user_id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5 text-neutral-400" />
            <span>Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none text-neutral-800 font-bold focus:outline-none cursor-pointer"
            >
              <option value="order">Thứ tự</option>
              <option value="priority">Độ ưu tiên</option>
              <option value="points">Story point</option>
            </select>
          </div>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Cột Trái - Product Backlog */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col gap-4 min-h-[500px]">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-bold text-neutral-800">Yêu cầu sản phẩm (Product Backlog)</h3>
              <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2.5 py-0.5 rounded-full">
                {backlogStories.length} Story
              </span>
            </div>

            <SortableContext items={backlogStories.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <DroppableColumn id="backlog" className="flex flex-col gap-2.5 flex-1 min-h-[400px]">
                {backlogStories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center border border-dashed border-neutral-200 rounded-xl py-16 text-center">
                    <p className="text-xs text-neutral-450 font-medium">Kéo story về đây hoặc tạo story mới</p>
                  </div>
                ) : (
                  backlogStories.map((story) => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      sprints={sprints}
                      dragDisabled={isDragDisabled}
                      onOpenDetails={(s) => {
                        setSelectedStory(s)
                        setIsDetailOpen(true)
                      }}
                      onEdit={(s) => {
                        setSelectedStory(s)
                        setIsFormModalOpen(true)
                      }}
                      onMoveToSprint={(id, sprintId) => moveStory({ storyId: id, sprintId })}
                      onDelete={(id) => deleteStory(id)}
                    />
                  ))
                )}
              </DroppableColumn>
            </SortableContext>
          </div>

          {/* Cột Phải - Sprint Backlog */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col gap-4 min-h-[500px]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-neutral-100 pb-3 gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-neutral-800">Kế hoạch Sprint:</span>
                {activeSprints.length > 0 ? (
                  <select
                    value={selectedSprintId}
                    onChange={(e) => setSelectedSprintId(e.target.value)}
                    className="text-xs font-bold bg-neutral-50 border border-neutral-250 rounded px-2 py-1 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                  >
                    {activeSprints.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.status === 'active' ? 'Đang chạy' : 'Lập kế hoạch'})
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-xs text-neutral-400 font-semibold">Chưa có sprint nào</span>
                )}
              </div>

              {selectedSprint && (
                <div className="flex items-center gap-1.5 shrink-0">
                  {isSM && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEditSprint(selectedSprint)}
                      className="py-1 px-2 text-xs text-neutral-500 hover:text-neutral-700 font-semibold"
                    >
                      Sửa
                    </Button>
                  )}
                  {selectedSprint.status === 'planning' && isSM && (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={!isStartSprintActive}
                      onClick={() => handleStartSprint(selectedSprint)}
                      leftIcon={<Play className="h-3 w-3" />}
                      className="py-1.5 px-3 text-xs"
                    >
                      Bắt đầu Sprint
                    </Button>
                  )}
                </div>
              )}
            </div>

            {selectedSprint ? (
              <div className="flex flex-col flex-1 gap-4">
                <SortableContext items={sprintStories.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <DroppableColumn id="sprint" className="flex flex-col gap-2.5 flex-1 min-h-[300px]">
                    {sprintStories.length === 0 ? (
                      <div className="flex flex-col items-center justify-center border border-dashed border-neutral-200 rounded-xl py-16 text-center">
                        <p className="text-xs text-neutral-450 font-medium">Kéo User Story từ Backlog vào đây để lập kế hoạch</p>
                      </div>
                    ) : (
                      sprintStories.map((story) => (
                        <StoryCard
                          key={story.id}
                          story={story}
                          sprints={sprints}
                          dragDisabled={isDragDisabled}
                          onOpenDetails={(s) => {
                            setSelectedStory(s)
                            setIsDetailOpen(true)
                          }}
                          onEdit={(s) => {
                            setSelectedStory(s)
                            setIsFormModalOpen(true)
                          }}
                          onMoveToSprint={(id, sprintId) => moveStory({ storyId: id, sprintId })}
                          onDelete={(id) => deleteStory(id)}
                        />
                      ))
                    )}
                  </DroppableColumn>
                </SortableContext>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-500">Dung lượng (Capacity):</span>
                    <input
                      type="number"
                      min="0"
                      value={capacity}
                      onChange={(e) => handleCapacityChange(parseInt(e.target.value) || 0)}
                      className="w-16 border border-neutral-250 rounded px-1.5 py-0.5 font-bold text-neutral-800 text-center focus:ring-1 focus:ring-primary-500 focus:outline-none"
                    />
                    <span className="font-semibold text-neutral-400">SP</span>
                  </div>
                  <div className={`font-bold px-3 py-1 rounded-full border transition-all duration-300 ${
                    sprintPoints > capacity
                      ? "bg-danger-50 text-danger-700 border-danger-200 animate-pulse"
                      : "bg-primary-50 text-primary-700 border-primary-100"
                  }`}>
                    Tổng số SP: {sprintPoints} / {capacity} SP
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border border-dashed border-neutral-200 rounded-xl py-20 text-center">
                <p className="text-xs text-neutral-400 font-medium mb-3">Chưa có sprint nào được lập kế hoạch cho dự án này.</p>
                {isSM && (
                  <Button variant="secondary" size="sm" onClick={handleOpenCreateSprint} leftIcon={<Calendar className="h-4 w-4" />}>
                    Tạo Sprint Đầu Tiên
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </DndContext>

      <UserStoryFormModal
        projectId={projectIdStr}
        story={selectedStory}
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setSelectedStory(null)
        }}
      />

      <SprintFormModal
        projectId={projectIdStr}
        sprint={sprintToEdit}
        isOpen={isSprintModalOpen}
        onClose={() => {
          setIsSprintModalOpen(false)
          setSprintToEdit(null)
        }}
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


