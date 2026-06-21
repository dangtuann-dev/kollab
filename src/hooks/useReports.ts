import { useQuery } from '@tanstack/react-query'
import type { Sprint, Story } from '../types'
import { eachDayOfInterval, format, parseISO, isBefore, isAfter, isSameDay } from 'date-fns'

export function useReports(projectId: string, sprintId?: string) {
  // 1. Lấy toàn bộ danh sách các sprint trong dự án
  const sprintsQuery = useQuery<Sprint[]>({
    queryKey: ['sprints', projectId],
    enabled: false, // sử dụng dữ liệu từ cache đã tải trước đó
  })

  // 2. Lấy toàn bộ danh sách các story trong dự án
  const storiesQuery = useQuery<Story[]>({
    queryKey: ['stories', projectId],
    enabled: false, // sử dụng dữ liệu từ cache đã tải trước đó
  })

  const sprints = sprintsQuery.data || []
  const stories = storiesQuery.data || []

  // 3. Tính toán dữ liệu Velocity (Biểu đồ năng suất dựa trên các Sprint đã hoàn thành)
  const getVelocityData = () => {
    const completedSprints = sprints
      .filter((s) => s.status === 'completed')
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    return completedSprints.map((sprint) => {
      // Tìm các story trong sprint này đã hoàn thành (Done)
      const sprintStories = stories.filter((s) => s.sprint_id === sprint.id)
      const completedPoints = sprintStories
        .filter((s) => s.status === 'done')
        .reduce((sum, s) => sum + (s.story_points || 0), 0)

      return {
        name: sprint.name,
        completedPoints,
      }
    })
  }

  // 4. Tính toán dữ liệu Burndown (Biểu đồ tiến độ) cho sprint được chọn
  const getBurndownData = () => {
    const activeSprint = sprints.find((s) => s.id === (sprintId || s.status === 'active'))
    if (!activeSprint || !activeSprint.start_date || !activeSprint.end_date) return []

    const start = parseISO(activeSprint.start_date)
    const end = parseISO(activeSprint.end_date)
    
    // Tạo danh sách toàn bộ các ngày trong khoảng thời gian sprint
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
      
      // Tính toán điểm số lý thuyết (ideal burndown line)
      const idealPoints = Math.max(0, totalPoints - index * idealDecrement)

      // Tính toán điểm số thực tế (actual burndown line): trừ đi điểm của các story đã xong vào hoặc trước ngày này
      const completedOnOrBefore = sprintStories.filter((story) => {
        if (story.status !== 'done') return false
        const doneDate = parseISO(story.updated_at)
        return isBefore(doneDate, day) || isSameDay(doneDate, day)
      })

      const completedPoints = completedOnOrBefore.reduce((sum, s) => sum + (s.story_points || 0), 0)
      actualRemaining = Math.max(0, totalPoints - completedPoints)

      // Không vẽ đường thực tế cho các ngày trong tương lai
      const isFutureDay = isAfter(day, new Date())

      return {
        day: dayStr,
        ideal: Math.round(idealPoints * 10) / 10,
        actual: isFutureDay ? null : actualRemaining,
      }
    })
  }

  // 5. Tính toán các chỉ số tóm tắt của Sprint (Sprint Summary Metrics)
  const getSprintSummary = () => {
    const activeSprint = sprints.find((s) => s.id === (sprintId || s.status === 'active'))
    if (!activeSprint) return null

    const sprintStories = stories.filter((s) => s.sprint_id === activeSprint.id)
    const totalStories = sprintStories.length
    const completedStories = sprintStories.filter((s) => s.status === 'done').length
    
    const totalPoints = sprintStories.reduce((sum, s) => sum + (s.story_points || 0), 0)
    const completedPoints = sprintStories
      .filter((s) => s.status === 'done')
      .reduce((sum, s) => sum + (s.story_points || 0), 0)

    // Tính toán thời gian hoàn thành trung bình (Cycle time - số ngày trung bình để xong các story đã Done)
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

    // Top các thành viên đóng góp nhiều nhất (tổng hợp điểm story points đã hoàn thành theo người được giao)
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

  return {
    velocityData: getVelocityData(),
    burndownData: getBurndownData(),
    sprintSummary: getSprintSummary(),
    activeSprintName: sprints.find((s) => s.id === (sprintId || s.status === 'active'))?.name || 'Sprint',
  }
}
export default useReports
