import React, { useState } from 'react'
import { Sparkles, CheckCircle2, Circle, ArrowRight, X, ChevronDown, ChevronUp, Users, Play, ListPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useOnboardingStore } from '../../stores/onboardingStore'

interface ProjectOnboardingChecklistProps {
  projectId: string
  hasStories?: boolean
  hasActiveSprint?: boolean
  memberCount?: number
  onOpenCreateStory?: () => void
  onOpenCreateSprint?: () => void
  onOpenInviteMember?: () => void
}

export const ProjectOnboardingChecklist: React.FC<ProjectOnboardingChecklistProps> = ({
  projectId,
  hasStories = false,
  hasActiveSprint = false,
  memberCount = 1,
  onOpenCreateStory,
  onOpenCreateSprint,
  onOpenInviteMember,
}) => {
  const navigate = useNavigate()
  const { dismissedProjectGuides, dismissProjectGuide } = useOnboardingStore()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const isDismissed = dismissedProjectGuides[projectId]
  if (isDismissed) return null

  // Calculate completed steps
  const steps = [
    {
      id: 'story',
      title: 'Tạo User Story đầu tiên',
      desc: 'Thêm yêu cầu công việc vào Backlog để quản lý',
      completed: hasStories,
      actionText: '+ Tạo Story',
      icon: <ListPlus className="h-3.5 w-3.5" />,
      onClick: () => {
        if (onOpenCreateStory) {
          onOpenCreateStory()
        } else {
          navigate(`/projects/${projectId}/backlog`)
        }
      },
    },
    {
      id: 'sprint',
      title: 'Lên kế hoạch Sprint',
      desc: 'Phân chia Story vào Sprint và đặt mục tiêu chu kỳ',
      completed: hasActiveSprint,
      actionText: 'Tạo Sprint',
      icon: <Play className="h-3.5 w-3.5" />,
      onClick: () => {
        if (onOpenCreateSprint) {
          onOpenCreateSprint()
        } else {
          navigate(`/projects/${projectId}/backlog`)
        }
      },
    },
    {
      id: 'member',
      title: 'Mời thành viên cùng tham gia',
      desc: 'Thêm đồng nghiệp vào dự án qua email',
      completed: memberCount > 1,
      actionText: '+ Mời người',
      icon: <Users className="h-3.5 w-3.5" />,
      onClick: () => {
        if (onOpenInviteMember) {
          onOpenInviteMember()
        } else {
          navigate(`/projects/${projectId}/members`)
        }
      },
    },
    {
      id: 'board',
      title: 'Quản lý bảng Sprint Board',
      desc: 'Kéo thả task và cập nhật tiến độ công việc',
      completed: hasActiveSprint,
      actionText: 'Xem Kanban',
      icon: <ArrowRight className="h-3.5 w-3.5" />,
      onClick: () => {
        navigate(`/projects/${projectId}/board`)
      },
    },
  ]

  const completedCount = steps.filter((s) => s.completed).length
  const progressPercent = Math.round((completedCount / steps.length) * 100)

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-800 to-indigo-950 text-white p-5 shadow-lg border border-neutral-700/60 transition-all duration-300">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-400/20 text-amber-300 rounded-xl border border-amber-400/30 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Hướng dẫn khởi tạo dự án
              </h3>
              <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {completedCount}/{steps.length} hoàn thành ({progressPercent}%)
              </span>
            </div>
            <p className="text-xs text-neutral-300 mt-0.5">
              Hoàn thành các bước dưới đây để vận hành dự án Agile của bạn hiệu quả nhất.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title={isCollapsed ? 'Mở rộng hướng dẫn' : 'Thu gọn hướng dẫn'}
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
          <button
            onClick={() => dismissProjectGuide(projectId)}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Đóng hướng dẫn"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-neutral-700/60 rounded-full h-1.5 mt-4 mb-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-amber-400 via-emerald-400 to-primary-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step Grid (when not collapsed) */}
      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-3 border-t border-neutral-700/50">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className={`p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between gap-3 ${
                step.completed
                  ? 'bg-emerald-950/30 border-emerald-500/30'
                  : 'bg-neutral-800/80 border-neutral-700 hover:border-neutral-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400">
                    Bước {idx + 1}
                  </span>
                  {step.completed ? (
                    <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>Xong</span>
                    </div>
                  ) : (
                    <Circle className="h-4 w-4 text-neutral-500 shrink-0" />
                  )}
                </div>
                <h4 className="text-xs font-bold text-white">{step.title}</h4>
                <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-2">{step.desc}</p>
              </div>

              <div>
                <button
                  onClick={step.onClick}
                  className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                    step.completed
                      ? 'bg-neutral-700/60 hover:bg-neutral-700 text-neutral-300'
                      : 'bg-primary-600 hover:bg-primary-500 text-white shadow-sm'
                  }`}
                >
                  {step.icon}
                  <span>{step.actionText}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProjectOnboardingChecklist
