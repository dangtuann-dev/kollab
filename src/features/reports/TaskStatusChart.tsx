import React from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

interface StatusPoint {
  name: string
  value: number
  color: string
}

interface TaskStatusChartProps {
  data: StatusPoint[]
}

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }: any) => {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  if (value === 0) return null

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-[10px] font-bold"
    >
      {`${value} (${(percent * 100).toFixed(0)}%)`}
    </text>
  )
}

export const TaskStatusChart: React.FC<TaskStatusChartProps> = ({ data }) => {
  const totalTasks = data.reduce((sum, d) => sum + d.value, 0)

  if (totalTasks === 0) {
    return (
      <div className="flex h-72 items-center justify-center border border-dashed border-neutral-350 rounded-2xl text-xs text-neutral-450 bg-neutral-50/50 font-sans">
        Không có công việc nào trong Sprint này để hiển thị phân bố.
      </div>
    )
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4 font-sans h-full">
      <div>
        <h3 className="text-sm font-bold text-neutral-850 tracking-tight">Phân bố trạng thái công việc</h3>
        <p className="text-[11px] text-neutral-450 mt-0.5">
          Tỷ lệ và số lượng công việc ở các trạng thái khác nhau trong Sprint.
        </p>
      </div>

      <div className="w-full h-64 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="45%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={85}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(4px)',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                fontSize: '11px',
                fontFamily: 'sans-serif',
              }}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingLeft: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default TaskStatusChart
