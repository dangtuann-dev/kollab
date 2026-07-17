import React from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'

interface WorkloadPoint {
  name: string
  tasksCount: number
  userId: string
}

interface MemberWorkloadChartProps {
  data: WorkloadPoint[]
  threshold: number
}

const CustomTooltip = ({ active, payload, threshold }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const isOverloaded = data.tasksCount > threshold
    return (
      <div className="bg-white/95 backdrop-blur-md border border-neutral-200 p-3 rounded-xl shadow-xl font-sans text-xs">
        <p className="font-bold text-neutral-850 mb-1">{data.name}</p>
        <p className="text-neutral-500 my-0.5">
          Số lượng Tasks: <span className={`font-bold ${isOverloaded ? 'text-red-500' : 'text-neutral-750'}`}>{data.tasksCount}</span>
        </p>
        {isOverloaded && (
          <p className="text-red-500 font-bold mt-1 text-[10px]">
            ⚠️ Cảnh báo: Vượt ngưỡng tải công việc!
          </p>
        )}
      </div>
    )
  }
  return null
}

export const MemberWorkloadChart: React.FC<MemberWorkloadChartProps> = ({ data, threshold }) => {
  const hasTasks = data.some((d) => d.tasksCount > 0)

  if (!hasTasks) {
    return (
      <div className="flex h-72 items-center justify-center border border-dashed border-neutral-350 rounded-2xl text-xs text-neutral-450 bg-neutral-50/50 font-sans">
        Chưa có thành viên nào được phân công Task trong Sprint này.
      </div>
    )
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4 font-sans h-full">
      <div>
        <h3 className="text-sm font-bold text-neutral-850 tracking-tight">Khối lượng công việc thành viên (Workload)</h3>
        <p className="text-[11px] text-neutral-450 mt-0.5">
          Số lượng công việc được phân bổ. Cột màu đỏ biểu thị số lượng vượt ngưỡng cân đối của Sprint.
        </p>
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
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip threshold={threshold} />} />
            <ReferenceLine
              y={threshold}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Ngưỡng: ${threshold.toFixed(1)} Tasks`,
                fill: '#ef4444',
                position: 'top',
                fontSize: 9,
                fontWeight: 'bold',
              }}
            />
            <Bar dataKey="tasksCount" radius={[4, 4, 0, 0]} maxBarSize={45}>
              {data.map((entry, index) => {
                const isOverloaded = entry.tasksCount > threshold
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isOverloaded ? '#ef4444' : '#3b82f6'}
                  />
                )
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default MemberWorkloadChart
