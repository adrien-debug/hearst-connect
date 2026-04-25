'use client'

import { useMemo } from 'react'

interface TimeToTargetChartProps {
  amount: number
  apr: number
  target: number
  selectedScenario: 'bull' | 'sideways' | 'bear'
}

export function TimeToTargetChart({ amount, apr, target, selectedScenario }: TimeToTargetChartProps) {
  // Generate chart data for 36 months
  const chartData = useMemo(() => {
    if (!amount) return null

    const monthlyApr = apr / 100 / 12
    const data = []
    let accumulated = 0
    const targetValue = amount * (target / 100)

    for (let month = 1; month <= 36; month++) {
      // Different yield multipliers based on scenario
      let multiplier = 1
      if (selectedScenario === 'bull') multiplier = 1.3
      if (selectedScenario === 'bear') multiplier = 0.7

      const monthlyYield = amount * monthlyApr * multiplier
      accumulated += monthlyYield

      data.push({
        month,
        accumulated,
        target: targetValue,
        isClosed: accumulated >= targetValue,
      })
    }

    return data
  }, [amount, apr, target, selectedScenario])

  if (!chartData) {
    return (
      <div className="time-chart-placeholder">
        <p>Enter an amount to see time-to-target simulation</p>
      </div>
    )
  }

  // Find when target is hit
  const targetHitMonth = chartData.find((d) => d.isClosed)?.month || 36

  // Scale for SVG
  const width = 400
  const height = 120
  const padding = { top: 10, right: 10, bottom: 30, left: 50 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const maxValue = Math.max(...chartData.map((d) => d.accumulated), chartData[0].target)
  const xScale = (month: number) => padding.left + (month / 36) * chartWidth
  const yScale = (value: number) => padding.top + chartHeight - (value / maxValue) * chartHeight

  // Generate path
  const pathD = chartData
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.month)} ${yScale(d.accumulated)}`)
    .join(' ')

  // Target line
  const targetY = yScale(chartData[0].target)

  return (
    <div className="time-chart">
      <svg viewBox={`0 0 ${width} ${height}`} className="time-chart-svg">
        {/* Grid lines */}
        {[0, 12, 24, 36].map((month) => (
          <line
            key={month}
            x1={xScale(month)}
            y1={padding.top}
            x2={xScale(month)}
            y2={height - padding.bottom}
            stroke="var(--color-border-subtle)"
            strokeDasharray="2,2"
          />
        ))}

        {/* Target line */}
        <line
          x1={padding.left}
          y1={targetY}
          x2={width - padding.right}
          y2={targetY}
          stroke="var(--color-accent)"
          strokeDasharray="4,4"
        />
        <text x={width - padding.right + 5} y={targetY + 3} className="time-chart-label">
          Target
        </text>

        {/* Accumulated line */}
        <path d={pathD} fill="none" stroke="var(--color-accent)" strokeWidth="2" />

        {/* Area fill */}
        <path
          d={`${pathD} L ${xScale(36)} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`}
          fill="var(--color-accent-dim)"
          opacity="0.3"
        />

        {/* X axis labels */}
        <text x={xScale(12)} y={height - 10} textAnchor="middle" className="time-chart-axis">
          M12
        </text>
        <text x={xScale(24)} y={height - 10} textAnchor="middle" className="time-chart-axis">
          M24
        </text>
        <text x={xScale(36)} y={height - 10} textAnchor="middle" className="time-chart-axis">
          M36
        </text>

        {/* Target hit marker */}
        {targetHitMonth < 36 && (
          <>
            <line
              x1={xScale(targetHitMonth)}
              y1={padding.top}
              x2={xScale(targetHitMonth)}
              y2={height - padding.bottom}
              stroke="var(--color-success)"
              strokeWidth="2"
            />
            <text
              x={xScale(targetHitMonth)}
              y={padding.top - 2}
              textAnchor="middle"
              className="time-chart-marker"
            >
              Vault closes M{targetHitMonth}
            </text>
          </>
        )}
      </svg>
    </div>
  )
}
