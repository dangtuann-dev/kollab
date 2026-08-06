import React from 'react'
import { Award, Zap, CheckCircle2, TrendingUp, TrendingDown, AlertCircle, PlusCircle } from 'lucide-react'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts'

interface Contributor {
  name: string
  avatar?: string | null
  points: number
}

interface StoryLeadTime {
  id: string
  title: string
  status: string
  points: number
  leadTime: number
}

interface SprintSummaryProps {
  summary: {
    totalStories: number
    completedStories: number
    incompletedStories: number
    totalPoints: number
    completedPoints: number
    completionRate: number
    averageLeadTime: number
    carryoverCount: number
    storyLeadTimes: StoryLeadTime[]
    completedStoriesList?: any[]
    incompletedStoriesList?: any[]
    prevSprintComparison?: {
      completionRateChange: number
      velocityChange: number
      leadTimeChange: number
      hasPrevious: boolean
    }
    suggestedCapacity?: number
    topContributors: Contributor[]
  } | null
  isActiveSprint: boolean
  onCompleteSprint?: () => void
  onStartNewSprint?: () => void
  canComplete: boolean
  isCompleting?: boolean
}

export const SprintSummary: React.FC<SprintSummaryProps> = ({
  summary,
  isActiveSprint,
  onCompleteSprint,
  onStartNewSprint,
  canComplete,
  isCompleting = false,
}) => {
  if (!summary) {
    return (
      <div className="flex h-64 items-center justify-center border border-dashed border-neutral-300 rounded-xl text-xs text-neutral-450">
        Không có dữ liệu tóm tắt sprint đang hoạt động.
      </div>
    )
  }

  const { prevSprintComparison } = summary

  return (
    <div className="flex flex-col gap-6 w-full font-sans">
      {}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-primary-50/60 dark:bg-neutral-800/60 border border-primary-200/60 dark:border-neutral-700 p-4 rounded-2xl no-print">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
              Gợi ý Năng suất Sprint mới: <span className="text-primary-600 dark:text-primary-400 font-extrabold">{summary.suggestedCapacity || 12} SP</span>
            </p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              Tính dựa trên tốc độ hoàn thành (Velocity) trung bình của các Sprint trước đó.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onStartNewSprint && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<PlusCircle className="h-4 w-4" />}
              onClick={onStartNewSprint}
              className="text-xs font-bold py-1.5 px-3 bg-white dark:bg-neutral-900 hover:bg-neutral-50 border-neutral-250 dark:border-neutral-700"
            >
              Lập kế hoạch Sprint mới
            </Button>
          )}

          {isActiveSprint && canComplete && (
            <Button
              variant="danger"
              onClick={onCompleteSprint}
              isLoading={isCompleting}
              size="sm"
              className="text-xs font-bold shrink-0"
            >
              Hoàn thành Sprint
            </Button>
          )}
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Tỉ lệ hoàn thành</span>
            <CheckCircle2 className="h-4.5 w-4.5 text-success-500" />
          </div>
          <div className="my-2">
            <p className="text-2xl font-black text-neutral-900 dark:text-neutral-100">
              {summary.completionRate}%
            </p>
            <p className="text-[11px] text-neutral-450 mt-0.5">
              {summary.completedStories} / {summary.totalStories} Stories completed
            </p>
          </div>
          {prevSprintComparison?.hasPrevious && (
            <div className="flex items-center gap-1 text-[10px] font-bold">
              {prevSprintComparison.completionRateChange >= 0 ? (
                <span className="text-success-600 flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" /> +{prevSprintComparison.completionRateChange}%
                </span>
              ) : (
                <span className="text-danger-600 flex items-center gap-0.5">
                  <TrendingDown className="h-3 w-3" /> {prevSprintComparison.completionRateChange}%
                </span>
              )}
              <span className="text-neutral-400 font-normal">so với sprint trước</span>
            </div>
          )}
        </div>

        {}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Velocity (Năng suất)</span>
            <Award className="h-4.5 w-4.5 text-primary-500" />
          </div>
          <div className="my-2">
            <p className="text-2xl font-black text-neutral-900 dark:text-neutral-100">
              {summary.completedPoints} <span className="text-xs font-bold text-neutral-400">/ {summary.totalPoints} SP</span>
            </p>
            <p className="text-[11px] text-neutral-450 mt-0.5">Story points completed</p>
          </div>
          {prevSprintComparison?.hasPrevious && (
            <div className="flex items-center gap-1 text-[10px] font-bold">
              {prevSprintComparison.velocityChange >= 0 ? (
                <span className="text-success-600 flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" /> +{prevSprintComparison.velocityChange} SP
                </span>
              ) : (
                <span className="text-danger-600 flex items-center gap-0.5">
                  <TrendingDown className="h-3 w-3" /> {prevSprintComparison.velocityChange} SP
                </span>
              )}
              <span className="text-neutral-400 font-normal">so với sprint trước</span>
            </div>
          )}
        </div>

        {}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Lead time trung bình</span>
            <Zap className="h-4.5 w-4.5 text-warning-500" />
          </div>
          <div className="my-2">
            <p className="text-2xl font-black text-neutral-900 dark:text-neutral-100">
              {summary.averageLeadTime} <span className="text-xs font-bold text-neutral-400">Ngày</span>
            </p>
            <p className="text-[11px] text-neutral-450 mt-0.5">Thời gian trung bình từ tạo → done</p>
          </div>
          {prevSprintComparison?.hasPrevious && (
            <div className="flex items-center gap-1 text-[10px] font-bold">
              {prevSprintComparison.leadTimeChange <= 0 ? (
                <span className="text-success-600 flex items-center gap-0.5">
                  <TrendingDown className="h-3 w-3" /> {prevSprintComparison.leadTimeChange}% (Nhanh hơn)
                </span>
              ) : (
                <span className="text-danger-600 flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" /> +{prevSprintComparison.leadTimeChange}% (Chậm hơn)
                </span>
              )}
            </div>
          )}
        </div>

        {}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Stories Carryover</span>
            <AlertCircle className="h-4.5 w-4.5 text-amber-500" />
          </div>
          <div className="my-2">
            <p className="text-2xl font-black text-neutral-900 dark:text-neutral-100">
              {summary.carryoverCount} <span className="text-xs font-bold text-neutral-400">Stories</span>
            </p>
            <p className="text-[11px] text-neutral-450 mt-0.5">Cần chuyển sang Sprint tiếp theo</p>
          </div>
          <div className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <span>Tự động về Backlog khi kết thúc Sprint</span>
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-850 dark:text-neutral-100">SparkLine Lead Time từng Story</h3>
              <p className="text-[11px] text-neutral-450 dark:text-neutral-400 mt-0.5">
                Thời gian hoàn thành (tính bằng ngày) của từng User Story trong Sprint.
              </p>
            </div>
          </div>

          <div className="h-28 w-full mt-2">
            {summary.storyLeadTimes.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summary.storyLeadTimes}>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white/95 dark:bg-neutral-800/95 backdrop-blur-md border border-neutral-200 dark:border-neutral-700 p-2.5 rounded-xl shadow-xl text-xs font-sans">
                            <p className="font-bold text-neutral-800 dark:text-neutral-100 max-w-[200px] truncate">{data.title}</p>
                            <p className="text-primary-600 font-semibold my-0.5">Lead time: {data.leadTime} ngày</p>
                            <p className="text-[10px] text-neutral-400">Story points: {data.points} SP</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="leadTime"
                    stroke="#e11d48"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#e11d48' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-neutral-400 border border-dashed border-neutral-200 rounded-xl">
                Chưa có dữ liệu câu chuyện trong sprint.
              </div>
            )}
          </div>
        </div>

        {}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-850 dark:text-neutral-100">Top Đóng góp</h3>
            <p className="text-[11px] text-neutral-450 dark:text-neutral-400 mt-0.5">Thành viên bàn giao nhiều SP nhất.</p>
          </div>

          {summary.topContributors.length === 0 ? (
            <p className="text-xs text-neutral-400 py-4">Chưa có story nào hoàn thành.</p>
          ) : (
            <div className="flex flex-col gap-3 my-2">
              {summary.topContributors.map((c, i) => (
                <div key={i} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar src={c.avatar} alt={c.name} fallback={c.name} size="xs" />
                    <span className="font-bold text-neutral-800 dark:text-neutral-200 truncate">{c.name}</span>
                  </div>
                  <span className="font-bold text-primary-600 dark:text-primary-400 shrink-0 bg-primary-50 dark:bg-primary-950/60 px-2 py-0.5 rounded-full text-[10px]">
                    {c.points} SP
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success-500" />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Stories đã hoàn thành ({summary.completedStoriesList?.length || summary.completedStories})
              </h3>
            </div>
            <span className="text-xs font-bold text-success-600 bg-success-50 dark:bg-success-950/60 px-2 py-0.5 rounded-full">
              {summary.completedPoints} SP
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {summary.completedStoriesList && summary.completedStoriesList.length > 0 ? (
              summary.completedStoriesList.map((story) => (
                <div
                  key={story.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-neutral-150 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 text-xs"
                >
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate flex-1">{story.title}</span>
                  <span className="font-bold text-neutral-500 shrink-0 bg-white dark:bg-neutral-900 px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-700 text-[10px]">
                    {story.story_points || 0} SP
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-400 py-3 text-center">Chưa có story hoàn thành.</p>
            )}
          </div>
        </div>

        {}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Stories chưa hoàn thành (Carryover: {summary.incompletedStoriesList?.length || summary.carryoverCount})
              </h3>
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
              {summary.totalPoints - summary.completedPoints} SP
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {summary.incompletedStoriesList && summary.incompletedStoriesList.length > 0 ? (
              summary.incompletedStoriesList.map((story) => (
                <div
                  key={story.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-neutral-150 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 text-xs"
                >
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate flex-1">{story.title}</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 shrink-0 bg-white dark:bg-neutral-900 px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-700 text-[10px]">
                    {story.status} | {story.story_points || 0} SP
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-400 py-3 text-center">Không có story dở dang.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SprintSummary
