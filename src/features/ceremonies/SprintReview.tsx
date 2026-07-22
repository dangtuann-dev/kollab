import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckSquare, AlertTriangle, ArrowLeft, Award, HelpCircle, Save, Calendar, PlaySquare } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { useToast } from '../../stores/toastStore'
import { useSprint } from '../../hooks/useSprint'
import type { Story } from '../../types'

export const SprintReview: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const projectIdStr = projectId || ''

  const { sprints, completeSprint, isLoading: loadingSprints } = useSprint(projectIdStr)
  
  const [selectedSprintId, setSelectedSprintId] = useState<string>('')
  const [feedback, setFeedback] = useState('')
  const [checkedCriteria, setCheckedCriteria] = useState<Record<string, boolean>>({})
  const [isCompleting, setIsCompleting] = useState(false)

  // Fetch user stories
  const { data: stories, isLoading: loadingStories } = useQuery({
    queryKey: ['project-stories-review', projectIdStr],
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
  React.useEffect(() => {
    if (activeSprints.length > 0 && !selectedSprintId) {
      setSelectedSprintId(activeSprints[0].id)
    }
  }, [activeSprints, selectedSprintId])

  const selectedSprint = sprints.find(s => s.id === selectedSprintId) || activeSprints[0]

  const sprintStories = selectedSprint && stories
    ? stories.filter(s => s.sprint_id === selectedSprint.id)
    : []

  const completedStories = sprintStories.filter(s => s.status === 'done')
  const incompleteStories = sprintStories.filter(s => s.status !== 'done')

  const parseCriteria = (criteriaText: string | null) => {
    if (!criteriaText) return []
    return criteriaText
      .split('\n')
      .map(line => line.replace(/^[-*\s\d.)]+/, '').trim())
      .filter(Boolean)
  }

  const toggleCriteria = (storyId: string, idx: number) => {
    const key = `${storyId}-${idx}`
    setCheckedCriteria(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleCompleteSprint = async () => {
    if (!selectedSprint) return
    if (incompleteStories.length > 0) {
      const confirmClose = window.confirm(
        `Sprint này vẫn còn ${incompleteStories.length} user story chưa hoàn thành. Các story chưa hoàn thành sẽ được đưa trở lại Product Backlog. Bạn có chắc chắn muốn hoàn thành Sprint này?`
      )
      if (!confirmClose) return
    } else {
      const confirmClose = window.confirm('Bạn có chắc chắn muốn kết thúc và hoàn thành Sprint này?')
      if (!confirmClose) return
    }

    setIsCompleting(true)
    try {
      await completeSprint(selectedSprint.id)
      toast.success('Đã kết thúc và hoàn thành Sprint thành công!')
      navigate(`/projects/${projectIdStr}/ceremonies`)
    } catch (e: any) {
      toast.error(e.message || 'Lỗi khi kết thúc sprint')
    } finally {
      setIsCompleting(false)
    }
  }

  if (loadingSprints || loadingStories) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-2">
        <Spinner size="lg" />
        <p className="text-xs text-neutral-500 font-semibold">Đang tổng hợp dữ liệu Sprint Review...</p>
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
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Sprint Review & Sơ kết Sprint</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Sơ kết kết quả công việc cuối Sprint, kiểm duyệt Acceptance Criteria và phản hồi.</p>
          </div>
        </div>

        {selectedSprint && selectedSprint.status === 'active' && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleCompleteSprint}
            isLoading={isCompleting}
            leftIcon={<CheckSquare className="h-4 w-4" />}
          >
            Hoàn thành Sprint
          </Button>
        )}
      </div>

      {/* Select Sprint */}
      <div className="flex items-center p-4 bg-white border border-neutral-200 rounded-xl shadow-sm gap-2.5">
        <Calendar className="h-5 w-5 text-amber-500" />
        <span className="text-sm font-bold text-neutral-800">Chọn Sprint sơ kết:</span>
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

      {selectedSprint ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Cột Trái & Giữa: Kiểm duyệt Acceptance Criteria của completed stories */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <PlaySquare className="h-4.5 w-4.5 text-neutral-500" />
                  <h3 className="text-sm font-bold text-neutral-800">Kiểm duyệt User Stories đã hoàn thành</h3>
                </div>
                <span className="text-[10px] font-bold text-success-700 bg-success-50 border border-success-100 px-2 py-0.5 rounded">
                  {completedStories.length} đã xong
                </span>
              </div>

              {completedStories.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
                  <p className="text-xs text-neutral-400 font-medium">Sprint này chưa có User Story nào đạt trạng thái Done.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {completedStories.map((story) => {
                    const criteria = parseCriteria(story.acceptance_criteria)
                    return (
                      <div key={story.id} className="border border-neutral-150 rounded-xl p-4 bg-white hover:border-neutral-300 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="text-[9px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded uppercase">
                              {story.story_points || 0} SP
                            </span>
                            <h4 className="text-xs font-bold text-neutral-850 mt-1">{story.title}</h4>
                          </div>
                        </div>

                        {criteria.length > 0 ? (
                          <div className="bg-neutral-50/60 p-3 rounded-lg border border-neutral-100 flex flex-col gap-2">
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-neutral-400">
                              Acceptance Criteria (Tiêu chí nghiệm thu)
                            </span>
                            <div className="flex flex-col gap-2 mt-1">
                              {criteria.map((item, idx) => {
                                const key = `${story.id}-${idx}`
                                const isChecked = checkedCriteria[key] || false
                                return (
                                  <label key={idx} className="flex items-start gap-2.5 cursor-pointer text-xs">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleCriteria(story.id, idx)}
                                      className="mt-0.5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className={isChecked ? 'line-through text-neutral-400' : 'text-neutral-700'}>
                                      {item}
                                    </span>
                                  </label>
                                )
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 bg-neutral-50/50 p-2.5 rounded-lg border border-neutral-100">
                            <HelpCircle className="h-3.5 w-3.5" />
                            <span>Không có tiêu chí nghiệm thu nào được đặt.</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Incomplete Stories */}
            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
                  <h3 className="text-sm font-bold text-neutral-800">Các stories chưa hoàn thành</h3>
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">
                  {incompleteStories.length} dở dang
                </span>
              </div>

              {incompleteStories.length === 0 ? (
                <div className="text-center py-6 bg-success-50/30 border border-success-100 rounded-xl">
                  <p className="text-xs text-success-700 font-bold">Tuyệt vời! 100% công việc trong Sprint đã hoàn thành.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {incompleteStories.map((story) => (
                    <div key={story.id} className="flex justify-between items-center p-3 border border-neutral-100 rounded-lg bg-neutral-50/50">
                      <span className="text-xs font-semibold text-neutral-600 truncate max-w-[250px]">{story.title}</span>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
                        {story.status === 'sprint' ? 'Đang thực hiện' : story.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cột Phải: Notes/Feedback notebook */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
              <Award className="h-4.5 w-4.5 text-neutral-500" />
              <h3 className="text-sm font-bold text-neutral-800">Ghi chú Demo & Phản hồi</h3>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-neutral-500">Phản hồi của Stakeholders / Khách hàng</label>
              <textarea
                rows={8}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Ghi lại các ý kiến đóng góp, phản hồi trong buổi chạy thử demo sản phẩm và các hành động tiếp theo..."
                className="w-full text-xs border border-neutral-250 rounded-lg p-2.5 focus:ring-1 focus:ring-primary-500 focus:outline-none"
              />
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                toast.success('Đã lưu ghi chú sơ kết Sprint thành công!')
              }}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Lưu ghi chú
            </Button>
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

export default SprintReview
