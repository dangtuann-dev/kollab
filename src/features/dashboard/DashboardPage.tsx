import React from 'react'
import { useQueries } from '@tanstack/react-query'
import { FolderKanban, ListTodo, Target, Calendar, Clock, CheckCircle2, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore()

  const results = useQueries({
    queries: [
      {
        queryKey: ['projects', user?.id],
        queryFn: async () => {
          if (!user?.id) return []
          const { data: memberProjects, error: mpError } = await (supabase
            .from('project_members')
            .select('project_id')
            .eq('user_id', user.id) as any)
          
          if (mpError) throw mpError
          const projectIds = memberProjects?.map((mp: any) => mp.project_id) || []
          if (projectIds.length === 0) return []

          const { data, error } = await (supabase
            .from('projects')
            .select('*, sprints(*)')
            .in('id', projectIds) as any)

          if (error) throw error
          return data || []
        },
        enabled: !!user?.id,
      },
      {
        queryKey: ['my-tasks', user?.id],
        queryFn: async () => {
          if (!user?.id) return []
          const { data, error } = await (supabase
            .from('tasks')
            .select(`
              *,
              user_story:user_stories(
                id,
                title,
                project:projects(id, name),
                sprint:sprints(id, name, status, end_date)
              )
            `)
            .eq('assignee_id', user.id) as any)

          if (error) throw error
          return data || []
        },
        enabled: !!user?.id,
      },
      {
        queryKey: ['active-sprints', user?.id],
        queryFn: async () => {
          if (!user?.id) return []
          const { data: memberProjects, error: mpError } = await (supabase
            .from('project_members')
            .select('project_id')
            .eq('user_id', user.id) as any)

          if (mpError) throw mpError
          const projectIds = memberProjects?.map((mp: any) => mp.project_id) || []
          if (projectIds.length === 0) return []

          const { data, error } = await (supabase
            .from('sprints')
            .select(`
              *,
              project:projects(id, name),
              user_stories(*)
            `)
            .in('project_id', projectIds)
            .eq('status', 'active') as any)

          if (error) throw error
          return data || []
        },
        enabled: !!user?.id,
      }
    ]
  })

  const [projectsResult, tasksResult, activeSprintsResult] = results
  const projects = projectsResult.data || []
  const tasks = tasksResult.data || []
  const activeSprints = activeSprintsResult.data || []
  const isLoading = projectsResult.isLoading || tasksResult.isLoading || activeSprintsResult.isLoading

  if (isLoading) {
    return (
      <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-2">
        <Spinner size="lg" />
        <p className="text-xs text-neutral-500 font-semibold">Đang tải thông tin tổng quan...</p>
      </div>
    )
  }

  const activeSprintTasks = tasks.filter((task: any) => {
    return task.user_story?.sprint?.status === 'active'
  })

  const tasksDoingCount = tasks.filter((task: any) => task.status !== 'done').length
  const activeSprintsCount = activeSprints.length
  const projectsCount = projects.length

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const getRemainingDays = (endDateStr?: string) => {
    if (!endDateStr) return 0
    const endDate = new Date(endDateStr)
    const today = new Date()
    const diff = endDate.getTime() - today.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  const getTaskStatusBadge = (status: string) => {
    switch (status) {
      case 'todo':
        return <Badge variant="neutral">Cần làm</Badge>
      case 'in_progress':
        return <Badge variant="warning">Đang làm</Badge>
      case 'done':
        return <Badge variant="success">Hoàn thành</Badge>
      default:
        return <Badge variant="neutral">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Chào mừng quay trở lại!</h1>
              <p className="text-sm text-neutral-500 mt-0.5">
                Bảng điều khiển tổng quan cho thành viên {user?.user_metadata?.full_name || user?.email}
              </p>
            </div>
          </div>
          <div className="text-xs text-neutral-500 font-medium">
            Hôm nay: {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="p-4 bg-primary-50 text-primary-600 rounded-xl">
              <FolderKanban className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Dự án tham gia</p>
              <h3 className="text-3xl font-extrabold text-neutral-950 mt-1">{projectsCount}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-xl">
              <ListTodo className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Công việc cần làm</p>
              <h3 className="text-3xl font-extrabold text-neutral-950 mt-1">{tasksDoingCount}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Sprint đang chạy</p>
              <h3 className="text-3xl font-extrabold text-neutral-950 mt-1">{activeSprintsCount}</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-neutral-500" />
                Công việc được giao trong Sprint hiện tại
              </h3>
              <span className="text-xs text-neutral-500 font-bold bg-neutral-100 px-2.5 py-0.5 rounded-full">
                {activeSprintTasks.length} tasks
              </span>
            </div>

            {activeSprintTasks.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                <CheckCircle2 className="h-10 w-10 text-neutral-300" />
                <p className="text-sm font-semibold text-neutral-600">Tuyệt vời! Bạn không có task nào dở dang trong các active Sprint.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-100 text-xs font-bold text-neutral-400 uppercase">
                      <th className="pb-3 pr-4">Task</th>
                      <th className="pb-3 px-4">Dự án</th>
                      <th className="pb-3 px-4">Trạng thái</th>
                      <th className="pb-3 pl-4 text-right">Hạn chót</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50 text-sm">
                    {activeSprintTasks.map((task: any) => (
                      <tr key={task.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="py-3.5 pr-4 font-semibold text-neutral-800 max-w-[200px] truncate">
                          {task.title}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-neutral-500 max-w-[120px] truncate">
                          {task.user_story?.project?.name}
                        </td>
                        <td className="py-3.5 px-4">{getTaskStatusBadge(task.status)}</td>
                        <td className="py-3.5 pl-4 text-right text-xs font-medium text-neutral-600">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-neutral-400" />
                            {formatDate(task.user_story?.sprint?.end_date)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex flex-col gap-5">
            <div className="border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Target className="h-4.5 w-4.5 text-neutral-500" />
                Tiến độ Sprint đang chạy
              </h3>
            </div>

            {activeSprints.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                <Target className="h-10 w-10 text-neutral-300" />
                <p className="text-sm font-semibold text-neutral-600">Không có Sprint nào đang chạy trong dự án của bạn.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {activeSprints.map((sprint: any) => {
                  const totalStories = sprint.user_stories?.length || 0
                  const doneStories = sprint.user_stories?.filter((s: any) => s.status === 'done').length || 0
                  const completionPercentage = totalStories > 0 ? Math.round((doneStories / totalStories) * 100) : 0
                  const remainingDays = getRemainingDays(sprint.end_date)

                  return (
                    <div key={sprint.id} className="p-4 rounded-xl bg-neutral-50 border border-neutral-150 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link to={`/projects/${sprint.project_id}/board`} className="text-xs font-bold text-primary-600 hover:underline">
                            {sprint.project?.name}
                          </Link>
                          <h4 className="text-sm font-bold text-neutral-800 mt-0.5">{sprint.name}</h4>
                        </div>
                        <Badge variant={remainingDays > 0 ? 'purple' : 'neutral'} size="sm">
                          {remainingDays > 0 ? `Còn ${remainingDays} ngày` : 'Quá hạn'}
                        </Badge>
                      </div>

                      <div className="flex flex-col gap-1 mt-1">
                        <div className="flex justify-between text-xs font-semibold text-neutral-600">
                          <span>Tiến độ hoàn thành</span>
                          <span>{completionPercentage}% ({doneStories}/{totalStories} story)</span>
                        </div>
                        <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-primary-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${completionPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  )
}

export default DashboardPage
