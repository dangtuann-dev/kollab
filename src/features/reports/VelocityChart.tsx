import React from 'react'

interface VelocityDataPoint {
  name: string
  completedPoints: number
}

interface VelocityChartProps {
  data: VelocityDataPoint[]
}

export const VelocityChart: React.FC<VelocityChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center border border-dashed border-neutral-300 rounded-xl text-xs text-neutral-450">
        No completed sprints yet to calculate velocity.
      </div>
    )
  }

  // Tìm giá trị lớn nhất để chia tỷ lệ cột
  const maxVal = Math.max(...data.map((d) => d.completedPoints), 10)

  // Kích thước của biểu đồ
  const width = 500
  const height = 260
  const padding = 40

  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  // Cấu hình thanh cột
  const barWidth = Math.min(45, chartWidth / (data.length * 2 || 1))
  const spacing = (chartWidth - barWidth * data.length) / (data.length + 1 || 1)

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col gap-4 font-sans">
      <div>
        <h3 className="text-sm font-bold text-neutral-800">Team Velocity Chart</h3>
        <p className="text-[11px] text-neutral-450 mt-0.5">Track the sum of completed story points across recent sprints.</p>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[400px]">
          {/* Các đường lưới */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = padding + ratio * chartHeight
            const val = Math.round(maxVal * (1 - ratio))
            return (
              <g key={index}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  className="stroke-neutral-100"
                  strokeWidth="1"
                />
                <text
                  x={padding - 8}
                  y={y + 4}
                  className="text-[9px] fill-neutral-400 font-bold text-right"
                  textAnchor="end"
                >
                  {val}
                </text>
              </g>
            )
          })}

          {/* Các thanh cột */}
          {data.map((d, index) => {
            const x = padding + spacing + index * (barWidth + spacing)
            const barHeight = (d.completedPoints / maxVal) * chartHeight
            const y = padding + chartHeight - barHeight

            return (
              <g key={index} className="group">
                {/* Hình chữ nhật của cột */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="4"
                  className="fill-primary-500 hover:fill-primary-600 transition-colors"
                />
                
                {/* Nhãn giá trị hiển thị phía trên cột */}
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  className="text-[9px] font-bold fill-neutral-700 text-center"
                  textAnchor="middle"
                >
                  {d.completedPoints} SP
                </text>

                {/* Nhãn trục X */}
                <text
                  x={x + barWidth / 2}
                  y={height - padding + 16}
                  className="text-[9px] font-bold fill-neutral-450 text-center"
                  textAnchor="middle"
                >
                  {d.name}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-neutral-500 border-t border-neutral-100 pt-3">
        <div className="h-3 w-3 bg-primary-500 rounded" />
        <span>Completed Story Points</span>
      </div>
    </div>
  )
}
export default VelocityChart
