import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Sprint, Story, Task } from '../types'
import { eachDayOfInterval, format, parseISO, isBefore, isAfter, isSameDay } from 'date-fns'

export function useReports(projectId: string, sprintId?: string) {
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

  const activeSprint = sprintId
    ? sprints.find((s) => s.id === sprintId)
    : sprints.find((s) => s.status === 'active') || sprints[0]
  const targetSprintId = activeSprint?.id

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

  const burndownRPCQuery = useQuery({
    queryKey: ['burndown-rpc', targetSprintId],
    queryFn: async () => {
      if (!targetSprintId) return []
      try {
        const { data, error } = await (supabase as any)
          .rpc('get_sprint_burndown', { p_sprint_id: targetSprintId })
        if (error) return []
        return data as { day: string; ideal: number; actual: number | null }[]
      } catch {
        return []
      }
    },
    enabled: !!targetSprintId,
    retry: false,
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

  const getBurndownDataBackup = () => {
    if (!activeSprint) return []

    const today = new Date()
    const startDateStr = activeSprint.start_date || format(new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
    const endDateStr = activeSprint.end_date || format(new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')

    const start = parseISO(startDateStr)
    const end = parseISO(endDateStr)

    const days: Date[] = (() => {
      try {
        return eachDayOfInterval({ start, end })
      } catch {
        return []
      }
    })()
    if (days.length === 0) return []

    const sprintStories = stories.filter((s) => s.sprint_id === activeSprint.id)
    const rawTotalPoints = sprintStories.reduce((sum, s) => sum + (s.story_points || 0), 0)
    const totalPoints = rawTotalPoints > 0 ? rawTotalPoints : 15

    let actualRemaining = totalPoints
    const idealDecrement = totalPoints / (days.length - 1 || 1)

    return days.map((day, index) => {
      const dayStr = format(day, 'MMM dd')
      const idealPoints = Math.max(0, totalPoints - index * idealDecrement)

      const completedOnOrBefore = sprintStories.filter((story) => {
        if (story.status !== 'done') return false
        const doneDate = story.updated_at ? parseISO(story.updated_at) : new Date()
        return isBefore(doneDate, day) || isSameDay(doneDate, day)
      })

      const completedPoints = completedOnOrBefore.reduce((sum, s) => sum + (s.story_points || 0), 0)
      actualRemaining = Math.max(0, totalPoints - completedPoints)

      const isFutureDay = isAfter(day, new Date())

      return {
        day: dayStr,
        ideal: Math.round(idealPoints * 10) / 10,
        actual: isFutureDay ? null : Math.round(actualRemaining * 10) / 10,
      }
    })
  }

  const getSprintSummary = () => {
    if (!activeSprint) return null

    const sprintStories = stories.filter((s) => s.sprint_id === activeSprint.id)
    const totalStories = sprintStories.length
    const completedStoriesList = sprintStories.filter((s) => s.status === 'done')
    const incompletedStoriesList = sprintStories.filter((s) => s.status !== 'done')
    const completedStories = completedStoriesList.length
    const carryoverCount = incompletedStoriesList.length

    const completionRate = totalStories > 0 ? Math.round((completedStories / totalStories) * 100) : 0

    const totalPoints = sprintStories.reduce((sum, s) => sum + (s.story_points || 0), 0)
    const completedPoints = completedStoriesList.reduce((sum, s) => sum + (s.story_points || 0), 0)

    const storyLeadTimes = sprintStories.map((s) => {
      const created = new Date(s.created_at).getTime()
      const updated = new Date(s.updated_at).getTime()
      const diffDays = Math.max(1, Math.ceil((updated - created) / (1000 * 60 * 60 * 24)))
      return {
        id: s.id,
        title: s.title,
        status: s.status,
        points: s.story_points || 0,
        leadTime: diffDays,
      }
    })

    const cycleTimes = completedStoriesList.map((s) => {
      const created = new Date(s.created_at).getTime()
      const completed = new Date(s.updated_at).getTime()
      return Math.max(1, Math.ceil((completed - created) / (1000 * 60 * 60 * 24)))
    })

    const averageLeadTime = cycleTimes.length > 0
      ? Math.round((cycleTimes.reduce((sum, t) => sum + t, 0) / cycleTimes.length) * 10) / 10
      : 0

    const completedSprints = sprints
      .filter((s) => s.status === 'completed' && s.id !== activeSprint.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const prevSprint = completedSprints[0]
    let prevSprintComparison = {
      completionRateChange: 0,
      velocityChange: 0,
      leadTimeChange: 0,
      hasPrevious: false,
    }

    if (prevSprint) {
      const prevStories = stories.filter((s) => s.sprint_id === prevSprint.id)
      const prevTotal = prevStories.length
      const prevCompleted = prevStories.filter((s) => s.status === 'done').length
      const prevCompletionRate = prevTotal > 0 ? (prevCompleted / prevTotal) * 100 : 0
      const prevVelocity = prevStories
        .filter((s) => s.status === 'done')
        .reduce((sum, s) => sum + (s.story_points || 0), 0)

      const prevCycleTimes = prevStories
        .filter((s) => s.status === 'done')
        .map((s) => {
          const created = new Date(s.created_at).getTime()
          const completed = new Date(s.updated_at).getTime()
          return Math.max(1, Math.ceil((completed - created) / (1000 * 60 * 60 * 24)))
        })
      const prevLeadTime = prevCycleTimes.length > 0
        ? prevCycleTimes.reduce((sum, t) => sum + t, 0) / prevCycleTimes.length
        : 0

      prevSprintComparison = {
        completionRateChange: Math.round(completionRate - prevCompletionRate),
        velocityChange: Math.round(completedPoints - prevVelocity),
        leadTimeChange: averageLeadTime > 0 && prevLeadTime > 0 ? Math.round(((averageLeadTime - prevLeadTime) / prevLeadTime) * 100) : 0,
        hasPrevious: true,
      }
    }

    const allCompletedSprints = sprints.filter((s) => s.status === 'completed')
    let totalPastVelocity = 0
    allCompletedSprints.forEach((s) => {
      totalPastVelocity += stories
        .filter((st) => st.sprint_id === s.id && st.status === 'done')
        .reduce((sum, st) => sum + (st.story_points || 0), 0)
    })
    const avgPastVelocity = allCompletedSprints.length > 0 ? totalPastVelocity / allCompletedSprints.length : completedPoints || 10
    const suggestedCapacity = Math.round(avgPastVelocity * 1.1)

    const contributorMap: Record<string, { name: string; avatar?: string | null; points: number }> = {}
    completedStoriesList
      .filter((s) => s.assignee)
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
      incompletedStories: carryoverCount,
      totalPoints,
      completedPoints,
      completionRate,
      averageLeadTime,
      carryoverCount,
      storyLeadTimes,
      completedStoriesList,
      incompletedStoriesList,
      prevSprintComparison,
      suggestedCapacity,
      topContributors,
    }
  }

  const tasks = tasksQuery.data || []
  const todoCount = tasks.filter((t) => t.status === 'todo').length
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length
  const doneCount = tasks.filter((t) => t.status === 'done').length
  
  const taskStatusData = [
    { name: 'To Do', value: todoCount, color: '#6366f1' },
    { name: 'In Progress', value: inProgressCount, color: '#f59e0b' },
    { name: 'Done', value: doneCount, color: '#10b981' },
  ]

  const workloadData = members.map((m: any) => {
    const memberName = m.profile?.full_name || 'Thành viên'
    const memberTasksCount = tasks.filter((t) => t.assignee_id === m.user_id).length
    return {
      name: memberName,
      tasksCount: memberTasksCount,
      userId: m.user_id,
    }
  })

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
