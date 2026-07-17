import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ListFilter, FileText } from 'lucide-react'
import { useSprint } from '../../hooks/useSprint'
import { useReports } from '../../hooks/useReports'
import { useExportPDF } from '../../hooks/useExportPDF'
import { useAuthStore } from '../../stores'
import { BurndownChart } from './BurndownChart'
import { VelocityChart } from './VelocityChart'
import { SprintSummary } from './SprintSummary'
import { TaskStatusChart } from './TaskStatusChart'
import { MemberWorkloadChart } from './MemberWorkloadChart'
import { Spinner } from '../../components/ui/Spinner'
import { Button } from '../../components/ui/Button'

export const ReportsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const projectIdStr = projectId || ''

  const { role } = useAuthStore()
  const { sprints, isLoading: loadingSprints, completeSprint } = useSprint(projectIdStr)
  const [selectedSprintId, setSelectedSprintId] = useState<string>('')
  const [isCompleting, setIsCompleting] = useState(false)

  const {
    burndownData,
    velocityData,
    sprintSummary,
    activeSprintName,
    taskStatusData,
    workloadData,
    workloadThreshold,
    projectName,
    isLoading: loadingReports,
  } = useReports(projectIdStr, selectedSprintId || undefined)

  const { exportPDF, isExporting } = useExportPDF()

  const activeSprint = sprints.find((s) => s.status === 'active')
  const targetSprintId = selectedSprintId || activeSprint?.id

  if (loadingSprints || (loadingReports && sprints.length === 0)) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-2">
        <Spinner size="lg" />
        <p className="text-xs text-neutral-500 font-semibold">Đang tải chỉ số đo lường dự án...</p>
      </div>
    )
  }

  const reportableSprints = sprints.filter((s) => s.status !== 'planning')

  const handleExportPDF = () => {
    const filename = `reports_${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_sprint_${selectedSprintId ? 'filtered' : 'active'}`
    exportPDF('reports-container', filename)
  }

  const handleCompleteSprint = async () => {
    if (!targetSprintId) return
    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn hoàn thành Sprint này? Các User Story chưa hoàn thành sẽ tự động quay lại Backlog.'
    )
    if (!confirmed) return

    setIsCompleting(true)
    try {
      await completeSprint(targetSprintId)
    } catch (err) {
      console.error(err)
    } finally {
      setIsCompleting(false)
    }
  }

  const isTargetActiveSprint = !selectedSprintId || selectedSprintId === activeSprint?.id
  const canComplete = role === 'product_owner' || role === 'scrum_master'

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Control bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5 no-print">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Phân tích & Báo cáo</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Phân tích hiệu suất nhóm, tốc độ bàn giao và tỷ lệ hoàn thành công việc.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {reportableSprints.length > 0 && (
            <div className="flex items-center gap-2 border border-neutral-200 bg-white rounded-lg px-3.5 py-2 text-xs font-semibold text-neutral-600 shadow-sm">
              <ListFilter className="h-4 w-4 text-neutral-400" />
              <span>Sprint:</span>
              <select
                value={selectedSprintId}
                onChange={(e) => setSelectedSprintId(e.target.value)}
                className="bg-transparent border-none text-neutral-800 font-bold focus:outline-none cursor-pointer"
              >
                <option value="">Sprint đang hoạt động ({activeSprintName})</option>
                {reportableSprints
                  .filter((s) => s.id !== activeSprint?.id)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.status === 'active' ? 'đang hoạt động' : 'đã hoàn thành'})
                    </option>
                  ))}
              </select>
            </div>
          )}

          <Button
            variant="secondary"
            leftIcon={<FileText className="h-4 w-4" />}
            onClick={handleExportPDF}
            isLoading={isExporting}
            className="text-xs font-bold py-2 px-3 bg-white hover:bg-neutral-50 border-neutral-250 shadow-sm shrink-0"
          >
            Xuất PDF
          </Button>
        </div>
      </div>

      {/* Reports Printable Container */}
      <div id="reports-container" className="flex flex-col gap-6 p-4 -m-4 bg-white rounded-2xl">
        <div className="print-only hidden">
          <div className="border-b border-neutral-250 pb-4 mb-6">
            <h1 className="text-xl font-bold text-neutral-900">{projectName} - Báo cáo Sprint</h1>
            <p className="text-xs text-neutral-500">
              Xuất ngày: {new Date().toLocaleDateString()} | Sprint: {selectedSprintId ? 'Đã lọc' : activeSprintName}
            </p>
          </div>
        </div>

        {/* 1. Sprint Summary cards */}
        <SprintSummary
          summary={sprintSummary}
          isActiveSprint={isTargetActiveSprint}
          canComplete={canComplete}
          onCompleteSprint={handleCompleteSprint}
          isCompleting={isCompleting}
        />

        {/* 2. Burndown & Velocity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BurndownChart data={burndownData} />
          <VelocityChart data={velocityData} projectName={projectName} />
        </div>

        {/* 3. Task Status & Workload */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TaskStatusChart data={taskStatusData} />
          <MemberWorkloadChart data={workloadData} threshold={workloadThreshold} />
        </div>
      </div>
    </div>
  )
}

export default ReportsPage
