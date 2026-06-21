import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ListFilter } from 'lucide-react'
import { useSprint } from '../../hooks/useSprint'
import { useReports } from '../../hooks/useReports'
import { BurndownChart } from './BurndownChart'
import { VelocityChart } from './VelocityChart'
import { SprintSummary } from './SprintSummary'
import { Spinner } from '../../components/ui/Spinner'

export const ReportsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const projectIdStr = projectId || ''

  const { sprints, isLoading: loadingSprints } = useSprint(projectIdStr)
  
  // Theo dõi sprint được chọn để xem chi tiết
  const [selectedSprintId, setSelectedSprintId] = useState<string>('')

  // Lấy dữ liệu báo cáo
  const { burndownData, velocityData, sprintSummary, activeSprintName } = useReports(
    projectIdStr,
    selectedSprintId || undefined
  )

  const activeSprint = sprints.find((s) => s.status === 'active')

  if (loadingSprints) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-2">
        <Spinner size="lg" />
        <p className="text-xs text-neutral-500 font-semibold">Loading project metrics...</p>
      </div>
    )
  }

  // Lọc các sprint có ngày hoạt động để làm báo cáo (đang hoạt động hoặc đã hoàn thành)
  const reportableSprints = sprints.filter((s) => s.status !== 'planning')

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Các thao tác ở tiêu đề */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Analytics & Reports</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Analyze team performance, delivery speed, and burndown rates.</p>
        </div>

        {/* Bộ chọn Sprint */}
        {reportableSprints.length > 0 && (
          <div className="flex items-center gap-2 border border-neutral-200 bg-white rounded-lg px-3.5 py-2 text-xs font-semibold text-neutral-600 shadow-sm self-start">
            <ListFilter className="h-4 w-4 text-neutral-400" />
            <span>Select Sprint:</span>
            <select
              value={selectedSprintId}
              onChange={(e) => setSelectedSprintId(e.target.value)}
              className="bg-transparent border-none text-neutral-800 font-bold focus:outline-none cursor-pointer"
            >
              <option value="">Active Sprint ({activeSprintName})</option>
              {reportableSprints
                .filter((s) => s.id !== activeSprint?.id)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.status})
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* Các chỉ số tóm tắt của Sprint */}
      <SprintSummary summary={sprintSummary} />

      {/* Phần các Biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BurndownChart data={burndownData} />
        <VelocityChart data={velocityData} />
      </div>
    </div>
  )
}
export default ReportsPage
