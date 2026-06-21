import React from 'react'

interface BurndownDataPoint {
  day: string
  ideal: number
  actual: number | null
}

interface BurndownChartProps {
  data: BurndownDataPoint[]
}

export const BurndownChart: React.FC<BurndownChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center border border-dashed border-neutral-300 rounded-xl text-xs text-neutral-450">
        No active sprint data available for burndown.
      </div>
    )
  }

  // Tìm giá trị lớn nhất để chia tỷ lệ biểu đồ
  const maxVal = Math.max(...data.map((d) => Math.max(d.ideal, d.actual || 0)), 10)

  // Kích thước của biểu đồ
  const width = 500
  const height = 260
  const padding = 40

  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  // Chuyển đổi tọa độ
  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * chartWidth
    const idealY = padding + chartHeight - (d.ideal / maxVal) * chartHeight
    const actualY = d.actual !== null ? padding + chartHeight - (d.actual / maxVal) * chartHeight : null
    return { x, idealY, actualY, label: d.day }
  })

  // Đường vẽ lý thuyết (Ideal line)
  const idealPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.idealY}`).join(' ')

  // Đường vẽ thực tế (lọc bỏ các điểm null)
  const actualPoints = points.filter((p) => p.actualY !== null)
  const actualPath = actualPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.actualY}`).join(' ')

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col gap-4 font-sans">
      <div>
        <h3 className="text-sm font-bold text-neutral-800">Sprint Burndown Chart</h3>
        <p className="text-[11px] text-neutral-450 mt-0.5">Track remaining effort against the ideal completion rate.</p>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[400px]">
          {/* Các đường kẻ lưới */}
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

          {/* Nhãn trục X */}
          {points.map((p, index) => {
            // Chỉ vẽ các nhãn cách quãng đối với sprint dài để tránh chồng chéo
            if (data.length > 10 && index % 2 !== 0) return null
            return (
              <text
                key={index}
                x={p.x}
                y={height - padding + 16}
                className="text-[8px] fill-neutral-400 font-bold"
                textAnchor="middle"
              >
                {p.label}
              </text>
            )
          })}

          {/* Đường lý thuyết (đứt nét) */}
          <path
            d={idealPath}
            fill="none"
            className="stroke-neutral-300"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* Đường thực tế (màu chủ đạo primary) */}
          {actualPoints.length > 0 && (
            <path
              d={actualPath}
              fill="none"
              className="stroke-primary-500"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Các điểm nút trên đường thực tế */}
          {actualPoints.map((p, index) => (
            <circle
              key={index}
              cx={p.x}
              cy={p.actualY!}
              r="4.5"
              className="fill-white stroke-primary-600"
              strokeWidth="2.5"
            />
          ))}
        </svg>
      </div>

      {/* Chú thích biểu đồ */}
      <div className="flex items-center justify-center gap-5 text-[11px] font-semibold text-neutral-500 border-t border-neutral-100 pt-3">
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-6 border-t-2 border-dashed border-neutral-300" />
          <span>Ideal Burndown</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-6 border-t-[3.5px] border-primary-500 rounded-full" />
          <span>Actual Remaining</span>
        </div>
      </div>
    </div>
  )
}
export default BurndownChart
