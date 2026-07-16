import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Users, BarChart3, AlertTriangle, ArrowLeft, Save, ShieldAlert } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { useToast } from '../../stores/toastStore'
import { useSprint } from '../../hooks/useSprint'
import type { Story } from '../../types'

interface MemberAvailability {
  userId: string
  name: string
  avatarUrl: string | null
  dailyHours: number
  sprintDays: number
  focusFactor: number // percentage
}

export const SprintPlanning: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const projectIdStr = projectId || ''

  const { sprints, updateSprint, isLoading: loadingSprints } = useSprint(projectIdStr)
  
  const [selectedSprintId, setSelectedSprintId] = useState<string>('')
  const [hoursPerSP, setHoursPerSP] = useState<number>(8)
  const [membersAvailability, setMembersAvailability] = useState<MemberAvailability[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // Fetch project details & members
  const { data: projectData, isLoading: loadingProject } = useQuery({
    queryKey: ['project-planning', projectIdStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          project_members (
            id,
            user_id,
            role,
            profile:profiles (
              id,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('id', projectIdStr)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!projectIdStr,
  })

  // Fetch user stories
  const { data: storiesData, isLoading: loadingStories } = useQuery({
    queryKey: ['project-stories-planning', projectIdStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_stories')
        .select('*')
        .eq('project_id', projectIdStr)
      if (error) throw error
      return data as Story[]
    },
    enabled: !!projectIdStr,
  })

  const activeSprints = sprints.filter(s => s.status !== 'completed')

  // Auto-select sprint
  useEffect(() => {
    if (activeSprints.length > 0 && !selectedSprintId) {
      setSelectedSprintId(activeSprints[0].id)
    }
  }, [activeSprints, selectedSprintId])

  const apiSprints = sprints as any[]
  const selectedSprint = apiSprints.find(s => s.id === selectedSprintId) || activeSprints[0]

  // Setup team member list
  useEffect(() => {
    const project = projectData as any
    if (project?.project_members) {
      const initialAvailability = project.project_members.map((m: any) => ({
        userId: m.user_id,
        name: m.profile?.full_name || 'Thành viên',
        avatarUrl: m.profile?.avatar_url,
        dailyHours: 8,
        sprintDays: 10,
        focusFactor: 80,
      }))
      setMembersAvailability(initialAvailability)
    }
  }, [projectData])

  const handleMemberChange = (userId: string, field: keyof MemberAvailability, value: number) => {
    setMembersAvailability(prev =>
      prev.map(m => (m.userId === userId ? { ...m, [field]: value } : m))
    )
  }

  const handleAllMembersChange = (field: 'sprintDays' | 'dailyHours' | 'focusFactor', value: number) => {
    setMembersAvailability(prev =>
      prev.map(m => ({ ...m, [field]: value }))
    )
  }

  // Calculations
  const calculateMemberCapacityHours = (m: MemberAvailability) => {
    return (m.dailyHours * m.sprintDays * m.focusFactor) / 100
  }

  const calculateMemberCapacitySP = (m: MemberAvailability) => {
    return parseFloat((calculateMemberCapacityHours(m) / hoursPerSP).toFixed(1))
  }

  const totalTeamHours = membersAvailability.reduce((sum, m) => sum + calculateMemberCapacityHours(m), 0)
  const totalTeamSPCapacity = parseFloat((totalTeamHours / hoursPerSP).toFixed(1))

  const sprintStories = selectedSprint && storiesData
    ? storiesData.filter(s => s.sprint_id === selectedSprint.id)
    : []

  const totalSprintStoryPoints = sprintStories.reduce((sum, s) => sum + (s.story_points || 0), 0)
  
  const progressPercent = totalTeamSPCapacity > 0
    ? Math.min((totalSprintStoryPoints / totalTeamSPCapacity) * 100, 100)
    : 0

  const handleSaveCapacity = async () => {
    if (!selectedSprint) return
    setIsSaving(true)
    try {
      await updateSprint({
        sprintId: selectedSprint.id,
        name: selectedSprint.name,
        velocity: Math.round(totalTeamSPCapacity),
      })
      toast.success('Đã lưu dung lượng (Capacity) cho Sprint thành công!')
    } catch (e: any) {
      toast.error(e.message || 'Lỗi khi cập nhật dung lượng sprint')
    } finally {
      setIsSaving(false)
    }
  }

  if (loadingProject || loadingSprints || loadingStories) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-2">
        <Spinner size="lg" />
        <p className="text-xs text-neutral-500 font-semibold">Đang tính toán dữ liệu Sprint Planning...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/projects/${projectIdStr}/ceremonies`)}
            className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Sprint Planning & Dung lượng</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Xác định dung lượng khả dụng của nhóm và giám sát phạm vi cam kết.</p>
          </div>
        </div>

        {selectedSprint && (
          <Button
            size="sm"
            onClick={handleSaveCapacity}
            isLoading={isSaving}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Lưu Capacity {Math.round(totalTeamSPCapacity)} SP
          </Button>
        )}
      </div>

      {/* Select Sprint */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-white border border-neutral-200 rounded-xl shadow-sm gap-4">
        <div className="flex items-center gap-2.5">
          <Calendar className="h-5 w-5 text-indigo-500" />
          <span className="text-sm font-bold text-neutral-800">Chọn Sprint:</span>
          {activeSprints.length > 0 ? (
            <select
              value={selectedSprintId}
              onChange={(e) => setSelectedSprintId(e.target.value)}
              className="text-xs font-bold bg-neutral-50 border border-neutral-250 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            >
              {activeSprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.status === 'active' ? 'Đang chạy' : 'Lập kế hoạch'})
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-neutral-400 font-semibold">Chưa có sprint nào đang hoạt động</span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-neutral-500">1 Story Point =</span>
          <input
            type="number"
            min="1"
            value={hoursPerSP}
            onChange={(e) => setHoursPerSP(Math.max(1, parseInt(e.target.value) || 8))}
            className="w-12 border border-neutral-250 rounded px-1.5 py-1 text-center font-bold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <span className="font-semibold text-neutral-500">giờ làm việc</span>
        </div>
      </div>

      {selectedSprint ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Cột Trái & Giữa: Danh sách thành viên và phân bổ giờ */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4.5 w-4.5 text-neutral-500" />
                  <h3 className="text-sm font-bold text-neutral-800">Dung lượng từng thành viên</h3>
                </div>
                <div className="flex gap-2 text-[10px] font-bold">
                  <button
                    onClick={() => handleAllMembersChange('sprintDays', 10)}
                    className="bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded text-neutral-600 transition-colors"
                  >
                    Set 10 ngày
                  </button>
                  <button
                    onClick={() => handleAllMembersChange('focusFactor', 80)}
                    className="bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded text-neutral-600 transition-colors"
                  >
                    Set 80% Focus
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {membersAvailability.map((m) => (
                  <div
                    key={m.userId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-neutral-100 rounded-lg hover:bg-neutral-50/50 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3">
                      {m.avatarUrl ? (
                        <img src={m.avatarUrl} alt={m.name} className="h-8 w-8 rounded-full object-cover border border-neutral-200" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-neutral-800">{m.name}</p>
                        <p className="text-[10px] text-neutral-450 font-medium">
                          {calculateMemberCapacityHours(m)}h khả dụng (~{calculateMemberCapacitySP(m)} SP)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-semibold text-neutral-600">
                      <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] text-neutral-400">Giờ/Ngày</label>
                        <input
                          type="number"
                          min="0"
                          max="24"
                          value={m.dailyHours}
                          onChange={(e) => handleMemberChange(m.userId, 'dailyHours', parseFloat(e.target.value) || 0)}
                          className="w-14 border border-neutral-200 rounded px-1.5 py-0.5 text-center font-bold text-neutral-800 focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] text-neutral-400">Số Ngày</label>
                        <input
                          type="number"
                          min="0"
                          max="365"
                          value={m.sprintDays}
                          onChange={(e) => handleMemberChange(m.userId, 'sprintDays', parseInt(e.target.value) || 0)}
                          className="w-14 border border-neutral-200 rounded px-1.5 py-0.5 text-center font-bold text-neutral-800 focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] text-neutral-400">Tập trung (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={m.focusFactor}
                          onChange={(e) => handleMemberChange(m.userId, 'focusFactor', parseInt(e.target.value) || 0)}
                          className="w-14 border border-neutral-200 rounded px-1.5 py-0.5 text-center font-bold text-neutral-800 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cột Phải: Giám sát dung lượng và Story Points */}
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                <BarChart3 className="h-4.5 w-4.5 text-neutral-500" />
                <h3 className="text-sm font-bold text-neutral-800">Giám sát Story Point</h3>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-semibold text-neutral-500">
                  <span>Tổng dung lượng đội:</span>
                  <span className="text-neutral-800 font-bold">{totalTeamSPCapacity} SP</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-neutral-500">
                  <span>Giờ khả dụng:</span>
                  <span className="text-neutral-800 font-bold">{totalTeamHours}h</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-neutral-500">
                  <span>Cam kết hiện tại:</span>
                  <span className="text-neutral-800 font-bold">{totalSprintStoryPoints} SP</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex flex-col gap-1.5 mt-2">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className={totalSprintStoryPoints > totalTeamSPCapacity ? 'text-danger-600' : 'text-primary-600'}>
                    Tỷ lệ lấp đầy
                  </span>
                  <span>
                    {totalTeamSPCapacity > 0 ? Math.round((totalSprintStoryPoints / totalTeamSPCapacity) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${progressPercent}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      totalSprintStoryPoints > totalTeamSPCapacity ? 'bg-danger-500' : 'bg-primary-500'
                    }`}
                  />
                </div>
              </div>

              {/* Cảnh báo nếu vượt */}
              {totalSprintStoryPoints > totalTeamSPCapacity ? (
                <div className="flex gap-2.5 p-3.5 bg-danger-50 border border-danger-200 rounded-lg text-xs text-danger-700 font-medium">
                  <AlertTriangle className="h-4.5 w-4.5 text-danger-500 shrink-0" />
                  <div>
                    <span className="font-bold">Quá tải dung lượng!</span>
                    <p className="mt-0.5 text-danger-600 leading-relaxed">
                      Tổng số story point cam kết ({totalSprintStoryPoints} SP) đang vượt quá dung lượng tối đa khả dụng ({totalTeamSPCapacity} SP) của toàn đội. Hãy xem xét chuyển bớt story về Product Backlog.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2.5 p-3.5 bg-success-50 border border-success-200 rounded-lg text-xs text-success-700 font-medium">
                  <ShieldAlert className="h-4.5 w-4.5 text-success-500 shrink-0" />
                  <div>
                    <span className="font-bold">Dung lượng an toàn!</span>
                    <p className="mt-0.5 text-success-600 leading-relaxed">
                      Phạm vi công việc cam kết nằm trong giới hạn khả dụng của toàn đội. Kế hoạch khả thi!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Danh sách story trong Sprint */}
            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col gap-3 max-h-[350px] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <span className="text-xs font-bold text-neutral-800">Stories trong Sprint ({sprintStories.length})</span>
                <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                  {totalSprintStoryPoints} SP
                </span>
              </div>
              {sprintStories.length === 0 ? (
                <p className="text-[11px] text-neutral-400 py-4 text-center">Chưa có story nào được đưa vào sprint này.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {sprintStories.map((story) => (
                    <div key={story.id} className="flex justify-between items-center p-2 border border-neutral-50 rounded bg-neutral-50/50">
                      <span className="text-xs font-semibold text-neutral-800 truncate max-w-[170px]" title={story.title}>
                        {story.title}
                      </span>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded shrink-0">
                        {story.story_points || 0} SP
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border border-dashed border-neutral-200 rounded-xl py-20 text-center bg-white shadow-sm">
          <p className="text-xs text-neutral-400 font-semibold mb-3">Chưa có sprint nào được lập kế hoạch cho dự án này.</p>
        </div>
      )}
    </div>
  )
}

export default SprintPlanning
