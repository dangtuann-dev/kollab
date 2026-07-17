import React from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

interface BurndownDataPoint {
  day: string
  ideal: number
  actual: number | null
}

interface BurndownChartProps {
  data: BurndownDataPoint[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-neutral-200 p-3 rounded-xl shadow-xl font-sans text-xs">
        <p className="font-bold text-neutral-800 mb-1.5">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 my-1">
            <span
              className="h-2 w-2 rounded-full inline-block"
              style={{ backgroundColor: entry.stroke }}
            />
            <span className="text-neutral-500 font-medium">{entry.name}:</span>
            <span className="font-bold text-neutral-800">
              {entry.value !== null ? `${entry.value} SP` : '--'}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return null
}

export const BurndownChart: React.FC<BurndownChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center border border-dashed border-neutral-350 rounded-2xl text-xs text-neutral-450 bg-neutral-50/50 font-sans">
        Không có dữ liệu Sprint cho biểu đồ Burndown.
      </div>
    )
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4 font-sans h-full">
      <div>
        <h3 className="text-sm font-bold text-neutral-850 tracking-tight">Biểu đồ Sprint Burndown</h3>
        <p className="text-[11px] text-neutral-450 mt-0.5">
          Theo dõi tiến độ hoàn thành công việc so với kế hoạch lý tưởng.
        </p>
      </div>

      <div className="w-full h-64 mt-2">
        <ResponsiveContainer width="105%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" vertical={false} />
            <XAxis
              dataKey="day"
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
            <Line
              name="Lý tưởng"
              type="monotone"
              dataKey="ideal"
              stroke="#9ca3af"
              strokeDasharray="4 4"
              strokeWidth={2}
              dot={false}
              activeDot={false}
            />
            <Line
              name="Thực tế"
              type="monotone"
              dataKey="actual"
              stroke="#3b82f6"
              strokeWidth={3}
              connectNulls={false}
              dot={{ r: 4, strokeWidth: 1 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default BurndownChart
