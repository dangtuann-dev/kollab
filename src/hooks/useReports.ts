import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Sprint, Story, Task } from '../types'
import { eachDayOfInterval, format, parseISO, isBefore, isAfter, isSameDay } from 'date-fns'

export function useReports(projectId: string, sprintId?: string) {
  // 1. Fetch project info
  const projectQuery = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single() as any)
      if (error) throw error
      return data
    },
    enabled: !!projectId,
  })

  // 2. Fetch project members
  const membersQuery = useQuery({
    queryKey: ['members', projectId],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('project_members')
        .select('*, profile:profiles(*)')
        .eq('project_id', projectId) as any)
      if (error) throw error
      return data
    },
    enabled: !!projectId,
  })

  // 3. Fetch sprints
  const sprintsQuery = useQuery<Sprint[]>({
    queryKey: ['sprints', projectId],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('sprints')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false }) as any)
      if (error) throw error
      return data as Sprint[]
    },
    enabled: !!projectId,
  })

  // 4. Fetch stories
  const storiesQuery = useQuery<Story[]>({
    queryKey: ['stories', projectId],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('user_stories')
        .select('*, assignee:profiles!assignee_id(*)')
        .eq('project_id', projectId) as any)
      if (error) throw error
      return data as Story[]
    },
    enabled: !!projectId,
  })

  const sprints = sprintsQuery.data || []
  const stories = storiesQuery.data || []
  const members = membersQuery.data || []

  // Resolve target sprint
  const activeSprint = sprints.find((s) => s.id === (sprintId || s.status === 'active'))
  const targetSprintId = activeSprint?.id

  // 5. Fetch sprint tasks
  const tasksQuery = useQuery<Task[]>({
    queryKey: ['tasks-sprint', projectId, targetSprintId],
    queryFn: async () => {
      if (!targetSprintId) return []
      
      const { data: storiesData, error: storyError } = await (supabase
        .from('user_stories')
        .select('id')
        .eq('sprint_id', targetSprintId) as any)
        
      if (storyError) throw storyError
      const storyIds = (storiesData || []).map((s: any) => s.id)
      if (storyIds.length === 0) return []

      const { data, error } = await (supabase
        .from('tasks')
        .select('*, assignee:profiles(*)')
        .in('user_story_id', storyIds) as any)

      if (error) throw error
      return data as Task[]
    },
    enabled: !!projectId && !!targetSprintId,
  })

  // 6. Fetch RPC Burndown Data
  const burndownRPCQuery = useQuery({
    queryKey: ['burndown-rpc', targetSprintId],
    queryFn: async () => {
      if (!targetSprintId) return []
      const { data, error } = await (supabase as any)
        .rpc('get_sprint_burndown', { p_sprint_id: targetSprintId })
      if (error) throw error
      return data as { day: string; ideal: number; actual: number | null }[]
    },
    enabled: !!targetSprintId,
  })

  const getVelocityData = () => {
    const completedSprints = sprints
      .filter((s) => s.status === 'completed')
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    return completedSprints.map((sprint) => {
      const sprintStories = stories.filter((s) => s.sprint_id === sprint.id)
      const committedPoints = sprintStories.reduce((sum, s) => sum + (s.story_points || 0), 0)
      const completedPoints = sprintStories
        .filter((s) => s.status === 'done')
        .reduce((sum, s) => sum + (s.story_points || 0), 0)

      return {
        id: sprint.id,
        name: sprint.name,
        start_date: sprint.start_date || '',
        end_date: sprint.end_date || '',
        committedPoints,
        completedPoints,
      }
    })
  }

  // Backup Client Burndown Generator if RPC fails/empty
  const getBurndownDataBackup = () => {
    if (!activeSprint || !activeSprint.start_date || !activeSprint.end_date) return []

    const start = parseISO(activeSprint.start_date)
    const end = parseISO(activeSprint.end_date)

    let days: Date[] = []
    try {
      days = eachDayOfInterval({ start, end })
    } catch (e) {
      return []
    }

    const sprintStories = stories.filter((s) => s.sprint_id === activeSprint.id)
    const totalPoints = sprintStories.reduce((sum, s) => sum + (s.story_points || 0), 0)

    let actualRemaining = totalPoints
    const idealDecrement = totalPoints / (days.length - 1 || 1)

    return days.map((day, index) => {
      const dayStr = format(day, 'MMM dd')
      const idealPoints = Math.max(0, totalPoints - index * idealDecrement)

      const completedOnOrBefore = sprintStories.filter((story) => {
        if (story.status !== 'done') return false
        const doneDate = parseISO(story.updated_at)
        return isBefore(doneDate, day) || isSameDay(doneDate, day)
      })

      const completedPoints = completedOnOrBefore.reduce((sum, s) => sum + (s.story_points || 0), 0)
      actualRemaining = Math.max(0, totalPoints - completedPoints)

      const isFutureDay = isAfter(day, new Date())

      return {
        day: dayStr,
        ideal: Math.round(idealPoints * 10) / 10,
        actual: isFutureDay ? null : actualRemaining,
      }
    })
  }

  const getSprintSummary = () => {
    if (!activeSprint) return null

    const sprintStories = stories.filter((s) => s.sprint_id === activeSprint.id)
    const totalStories = sprintStories.length
    const completedStories = sprintStories.filter((s) => s.status === 'done').length
    
    const totalPoints = sprintStories.reduce((sum, s) => sum + (s.story_points || 0), 0)
    const completedPoints = sprintStories
      .filter((s) => s.status === 'done')
      .reduce((sum, s) => sum + (s.story_points || 0), 0)

    let cycleTimes: number[] = []
    sprintStories
      .filter((s) => s.status === 'done')
      .forEach((s) => {
        const created = new Date(s.created_at).getTime()
        const completed = new Date(s.updated_at).getTime()
        const diffDays = Math.ceil((completed - created) / (1000 * 60 * 60 * 24))
        cycleTimes.push(diffDays > 0 ? diffDays : 1)
      })
    const averageCycleTime = cycleTimes.length > 0
      ? Math.round((cycleTimes.reduce((sum, t) => sum + t, 0) / cycleTimes.length) * 10) / 10
      : 0

    const contributorMap: Record<string, { name: string; avatar?: string | null; points: number }> = {}
    sprintStories
      .filter((s) => s.status === 'done' && s.assignee)
      .forEach((s) => {
        const assignee = s.assignee!
        if (!contributorMap[assignee.id]) {
          contributorMap[assignee.id] = { name: assignee.full_name, avatar: assignee.avatar_url, points: 0 }
        }
        contributorMap[assignee.id].points += s.story_points || 0
      })

    const topContributors = Object.values(contributorMap)
      .sort((a, b) => b.points - a.points)
      .slice(0, 3)

    return {
      totalStories,
      completedStories,
      totalPoints,
      completedPoints,
      averageCycleTime,
      topContributors,
    }
  }

  // Calculate task status distribution
  const tasks = tasksQuery.data || []
  const todoCount = tasks.filter((t) => t.status === 'todo').length
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length
  const doneCount = tasks.filter((t) => t.status === 'done').length
  
  const taskStatusData = [
    { name: 'To Do', value: todoCount, color: '#6366f1' },
    { name: 'In Progress', value: inProgressCount, color: '#f59e0b' },
    { name: 'Done', value: doneCount, color: '#10b981' },
  ]

  // Calculate workload distribution
  const workloadData = members.map((m: any) => {
    const memberName = m.profile?.full_name || 'Thành viên'
    const memberTasksCount = tasks.filter((t) => t.assignee_id === m.user_id).length
    return {
      name: memberName,
      tasksCount: memberTasksCount,
      userId: m.user_id,
    }
  })

  // Calculate threshold = total tasks / member count * 1.5
  const totalTasks = tasks.length
  const memberCount = members.length || 1
  const workloadThreshold = Math.max(3, (totalTasks / memberCount) * 1.5)

  const burndownData = burndownRPCQuery.data && burndownRPCQuery.data.length > 0
    ? burndownRPCQuery.data
    : getBurndownDataBackup()

  return {
    velocityData: getVelocityData(),
    burndownData,
    sprintSummary: getSprintSummary(),
    activeSprintName: activeSprint?.name || 'Sprint',
    taskStatusData,
    workloadData,
    workloadThreshold,
    projectName: projectQuery.data?.name || 'Dự án',
    isLoading:
      sprintsQuery.isLoading ||
      storiesQuery.isLoading ||
      tasksQuery.isLoading ||
      membersQuery.isLoading ||
      projectQuery.isLoading ||
      (targetSprintId ? burndownRPCQuery.isLoading : false),
  }
}

export default useReports
