import React from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts'
import { Download } from 'lucide-react'
import { Button } from '../../components/ui/Button'

interface VelocityDataPoint {
  id: string
  name: string
  start_date: string
  end_date: string
  committedPoints: number
  completedPoints: number
}

interface VelocityChartProps {
  data: VelocityDataPoint[]
  projectName?: string
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white/95 backdrop-blur-md border border-neutral-200 p-3 rounded-xl shadow-xl font-sans text-xs">
        <p className="font-bold text-neutral-850 mb-1">{data.name}</p>
        <p className="text-neutral-500 my-0.5">
          Thời gian: <span className="font-semibold text-neutral-700">
            {data.start_date ? new Date(data.start_date).toLocaleDateString() : 'N/A'} - {data.end_date ? new Date(data.end_date).toLocaleDateString() : 'N/A'}
          </span>
        </p>
        <p className="text-neutral-500 my-0.5">
          Committed SP: <span className="font-bold text-neutral-700">{data.committedPoints} SP</span>
        </p>
        <p className="text-primary-600 my-0.5 font-semibold">
          Completed SP: <span className="font-bold">{data.completedPoints} SP</span>
        </p>
      </div>
    )
  }
  return null
}

export const VelocityChart: React.FC<VelocityChartProps> = ({ data, projectName = 'project' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center border border-dashed border-neutral-350 rounded-2xl text-xs text-neutral-450 bg-neutral-50/50 font-sans">
        Chưa có Sprint nào hoàn thành để tính toán Velocity.
      </div>
    )
  }

  // Calculate average completed points
  const totalCompleted = data.reduce((sum, d) => sum + d.completedPoints, 0)
  const avgVelocity = data.length > 0 ? totalCompleted / data.length : 0

  const handleExportCSV = () => {
    // Generate CSV content
    const headers = ['Sprint', 'Start Date', 'End Date', 'Committed Points', 'Completed Points']
    const rows = data.map((d) => [
      d.name,
      d.start_date || 'N/A',
      d.end_date || 'N/A',
      d.committedPoints,
      d.completedPoints,
    ])

    const csvContent =
      '\uFEFF' + // UTF-8 BOM for Vietnamese character encoding in Excel
      [headers.join(','), ...rows.map((row) => row.map((val) => `"${val}"`).join(','))].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    
    // Clean project name for filename
    const safeProjName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')
    link.setAttribute('href', url)
    link.setAttribute('download', `velocity_${safeProjName}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4 font-sans h-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-neutral-850 tracking-tight">Biểu đồ Tốc độ nhóm (Velocity)</h3>
          <p className="text-[11px] text-neutral-450 mt-0.5">
            Hiển thị năng suất hoàn thành công việc của nhóm qua các Sprint đã qua.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Download className="h-3 w-3" />}
          onClick={handleExportCSV}
          className="text-[10px] font-bold py-1 px-2 shadow-xs border-neutral-250 bg-neutral-50 hover:bg-neutral-100 shrink-0"
        >
          Xuất CSV
        </Button>
      </div>

      <div className="w-full h-64 mt-2">
        <ResponsiveContainer width="105%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 15, right: 30, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#9ca3af"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={8}
              className="font-semibold"
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dx={-8}
              className="font-semibold"
              label={{
                value: 'Story Points',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                style: { fontSize: '10px', fill: '#9ca3af', fontWeight: 'bold' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              className="text-[11px] font-semibold"
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px', fontWeight: 600 }}
            />
            <ReferenceLine
              y={avgVelocity}
              stroke="#10b981"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Trung bình: ${avgVelocity.toFixed(1)} SP`,
                fill: '#10b981',
                position: 'top',
                fontSize: 9,
                fontWeight: 'bold',
              }}
            />
            <Bar
              name="Hoàn thành"
              dataKey="completedPoints"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              maxBarSize={45}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default VelocityChart
