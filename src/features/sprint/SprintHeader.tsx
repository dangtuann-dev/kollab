import React from 'react'
import { Calendar, Goal, CheckCircle2 } from 'lucide-react'
import type { Sprint, Story } from '../../types'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useAuthStore } from '../../stores'

interface SprintHeaderProps {
  sprint: Sprint
  stories: Story[]
  onCompleteSprint: () => void
}

export const SprintHeader: React.FC<SprintHeaderProps> = ({
  sprint,
  stories,
  onCompleteSprint,
}) => {
  const { role } = useAuthStore()
  const isSM = role === 'scrum_master'

  // Tính toán các chỉ số đo lường
  const totalStories = stories.length
  const completedStories = stories.filter((s) => s.status === 'done').length
  const progressPercent = totalStories > 0 ? Math.round((completedStories / totalStories) * 100) : 0

  // Tính số ngày còn lại
  const getDaysRemaining = () => {
    if (!sprint.end_date) return null
    const end = new Date(sprint.end_date)
    const today = new Date()
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const daysRemaining = getDaysRemaining()

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col gap-4 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Tiêu đề & Trạng thái */}
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight">{sprint.name}</h2>
          <Badge variant="success" size="sm">
            Sprint đang hoạt động
          </Badge>
          
          {daysRemaining !== null && (
            <span className="text-xs text-neutral-500 font-semibold flex items-center gap-1 bg-neutral-100 px-2 py-0.5 rounded-full">
              <Calendar className="h-3.5 w-3.5 text-neutral-400" />
              {daysRemaining === 0 ? 'Kết thúc hôm nay' : `Còn lại ${daysRemaining} ngày`}
            </span>
          )}
        </div>

        {/* Nút hành động */}
        {isSM && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onCompleteSprint}
            leftIcon={<CheckCircle2 className="h-4 w-4 text-success-600" />}
            className="py-1 px-3 text-xs"
          >
            Hoàn thành Sprint
          </Button>
        )}
      </div>

      {/* Mục tiêu */}
      {sprint.goal && (
        <div className="flex items-start gap-2 text-xs text-neutral-600 bg-neutral-50 p-3 rounded-lg border border-neutral-100">
          <Goal className="h-4 w-4 text-primary-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-neutral-700">Mục tiêu Sprint:</span> {sprint.goal}
          </div>
        </div>
      )}

      {/* Thanh tiến độ */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-500">
          <span>Tiến độ hoàn thành Sprint</span>
          <span>
            {completedStories}/{totalStories} Story ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-neutral-100 rounded-full h-2">
          <div
            className="bg-success-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}
export default SprintHeader
