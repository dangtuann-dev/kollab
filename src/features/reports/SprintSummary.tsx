import React from 'react'
import { Award, Zap, CheckCircle2 } from 'lucide-react'
import { Avatar } from '../../components/ui/Avatar'

interface Contributor {
  name: string
  avatar?: string | null
  points: number
}

interface SprintSummaryProps {
  summary: {
    totalStories: number
    completedStories: number
    totalPoints: number
    completedPoints: number
    averageCycleTime: number
    topContributors: Contributor[]
  } | null
}

export const SprintSummary: React.FC<SprintSummaryProps> = ({ summary }) => {
  if (!summary) {
    return (
      <div className="flex h-64 items-center justify-center border border-dashed border-neutral-300 rounded-xl text-xs text-neutral-450">
        Không có dữ liệu tóm tắt sprint đang hoạt động.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
      
      {/* Cột 1: Chỉ số hoàn thành */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-bold text-neutral-800">Kết quả Sprint</h3>
          <p className="text-[11px] text-neutral-450 mt-0.5">Tóm tắt các story và điểm số của sprint.</p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-success-500" />
              Story đã hoàn thành
            </span>
            <span className="font-bold text-neutral-850">
              {summary.completedStories} / {summary.totalStories}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500 font-semibold flex items-center gap-1.5">
              <Award className="h-4 w-4 text-primary-500" />
              Điểm đã hoàn thành
            </span>
            <span className="font-bold text-neutral-850">
              {summary.completedPoints} / {summary.totalPoints} SP
            </span>
          </div>
        </div>
      </div>

      {/* Cột 2: Thời gian chu kỳ */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-neutral-800">Hiệu suất chu kỳ</h3>
          <p className="text-[11px] text-neutral-450 mt-0.5">Chỉ số hiệu suất và tốc độ thực thi.</p>
        </div>

        <div className="flex items-center gap-3 my-2">
          <div className="h-11 w-11 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
            <Zap className="h-5.5 w-5.5" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-neutral-850">
              {summary.averageCycleTime} <span className="text-xs font-semibold text-neutral-455 text-neutral-400">Ngày</span>
            </p>
            <p className="text-[10px] text-neutral-400 font-medium mt-0.5">Thời gian giải quyết trung bình mỗi story</p>
          </div>
        </div>
      </div>

      {/* Cột 3: Đóng góp hàng đầu */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-bold text-neutral-800">Thành viên đóng góp hàng đầu</h3>
          <p className="text-[11px] text-neutral-450 mt-0.5">Các thành viên có số điểm bàn giao cao nhất.</p>
        </div>

        {summary.topContributors.length === 0 ? (
          <p className="text-xs text-neutral-400 py-4">Chưa có story nào hoàn thành.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {summary.topContributors.map((c, i) => (
              <div key={i} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar src={c.avatar} alt={c.name} fallback={c.name} size="xs" />
                  <span className="font-bold text-neutral-750 truncate">{c.name}</span>
                </div>
                <span className="font-bold text-primary-600 shrink-0 bg-primary-50 px-2 py-0.5 rounded-full text-[10px]">
                  {c.points} SP
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
export default SprintSummary
