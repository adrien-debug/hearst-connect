'use client'

import { useEffect, useRef, useState } from 'react'
import { TOKENS } from '../constants'

/** TimeToTargetChart — Renders 3 yield-curve scenarios (Bull / Sideways / Bear)
 * starting from `principal` and ending at `principal × (1 + target)`. Each
 * scenario reaches the target at a different month — Bull early, Sideways mid,
 * Bear at lock end. The end-of-curve dot marks "vault closes (capital unlocks)".
 *
 * The total yield at close is fixed (= principal × target); only the time-to-target
 * varies, so all 3 curves end at the same value but at different x-positions. */
export function TimeToTargetChart({
  principal,
  cumulativeTargetPct,
  lockMonths,
}: {
  principal: number
  cumulativeTargetPct: number
  lockMonths: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setDims({ width: Math.round(width), height: Math.round(height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const closeValue = principal * (1 + cumulativeTargetPct / 100)
  // Close-month per regime — Bull reaches target fastest, Bear at lock end.
  const scenarios = [
    { label: 'Bull',     closeMonth: Math.round(lockMonths * 0.33), color: TOKENS.colors.accent,         lineDash: undefined },
    { label: 'Sideways', closeMonth: Math.round(lockMonths * 0.72), color: TOKENS.colors.textSecondary,  lineDash: '6 4' },
    { label: 'Bear',     closeMonth: lockMonths,                    color: TOKENS.colors.danger,         lineDash: '2 4' },
  ]

  const padding = { top: 20, right: 16, bottom: 32, left: 72 }
  const width = dims.width
  const height = dims.height
  const chartWidth = Math.max(0, width - padding.left - padding.right)
  const chartHeight = Math.max(0, height - padding.top - padding.bottom)

  // Y axis bounds — leave 5% headroom above closeValue.
  const yMin = principal * 0.97
  const yMax = closeValue * 1.03
  const yToPx = (v: number) => padding.top + chartHeight - ((v - yMin) / (yMax - yMin)) * chartHeight
  const xToPx = (m: number) => padding.left + (m / lockMonths) * chartWidth

  // Y ticks — 5 evenly spaced.
  const yTicks = Array.from({ length: 5 }, (_, i) => yMin + ((yMax - yMin) * i) / 4)

  // X ticks — every quarter (3 months) up to lockMonths.
  const xTicks = Array.from({ length: Math.floor(lockMonths / 3) + 1 }, (_, i) => i * 3)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[3] }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: TOKENS.spacing[3],
      }}>
        <div>
          <div style={{
            fontFamily: TOKENS.fonts.mono,
            fontSize: TOKENS.fontSizes.micro,
            fontWeight: TOKENS.fontWeights.bold,
            letterSpacing: TOKENS.letterSpacing.display,
            textTransform: 'uppercase',
            color: TOKENS.colors.textGhost,
          }}>
            Time to target — scenario simulation
          </div>
          <p style={{
            margin: `${TOKENS.spacing[1]} 0 0 0`,
            fontSize: TOKENS.fontSizes.xs,
            color: TOKENS.colors.textSecondary,
          }}>
            Deposit of <span style={{ color: TOKENS.colors.textPrimary, fontWeight: TOKENS.fontWeights.bold }}>{formatUsd(principal)}</span>.
            The vault closes and your capital unlocks as soon as the cumulative target{' '}
            <span style={{ color: TOKENS.colors.accent, fontWeight: TOKENS.fontWeights.bold }}>{cumulativeTargetPct}%</span>{' '}
            is reached — same end value, only the time to get there changes.
          </p>
        </div>
      </div>

      {/* Chart container — measured by ResizeObserver */}
      <div ref={containerRef} style={{ width: '100%', height: 280 }}>
        {width > 0 && height > 0 && (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
            {/* Y grid + labels */}
            {yTicks.map((tick, i) => {
              const y = yToPx(tick)
              return (
                <g key={`y-${i}`}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke={TOKENS.colors.borderSubtle}
                    strokeWidth={0.5}
                    strokeDasharray="3 3"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    fill={TOKENS.colors.textGhost}
                    fontSize={TOKENS.fontSizes.nano}
                    fontFamily={TOKENS.fonts.mono}
                  >
                    {formatUsd(tick)}
                  </text>
                </g>
              )
            })}

            {/* X labels (every quarter) */}
            {xTicks.map((m, i) => (
              <text
                key={`x-${i}`}
                x={xToPx(m)}
                y={height - 8}
                textAnchor={i === 0 ? 'start' : i === xTicks.length - 1 ? 'end' : 'middle'}
                fill={TOKENS.colors.textGhost}
                fontSize={TOKENS.fontSizes.nano}
                fontFamily={TOKENS.fonts.mono}
              >
                M{m}
              </text>
            ))}

            {/* Scenarios — straight line from (0, principal) to (closeMonth, closeValue),
                then horizontal at closeValue until lockMonths (post-close). */}
            {scenarios.map((s) => {
              const x0 = xToPx(0)
              const y0 = yToPx(principal)
              const xClose = xToPx(s.closeMonth)
              const yClose = yToPx(closeValue)
              const xEnd = xToPx(lockMonths)
              return (
                <g key={s.label}>
                  {/* Climb to close */}
                  <line
                    x1={x0} y1={y0} x2={xClose} y2={yClose}
                    stroke={s.color}
                    strokeWidth={2}
                    strokeDasharray={s.lineDash}
                    strokeLinecap="round"
                  />
                  {/* Plateau after close (capital unlocked) */}
                  {s.closeMonth < lockMonths && (
                    <line
                      x1={xClose} y1={yClose} x2={xEnd} y2={yClose}
                      stroke={s.color}
                      strokeWidth={1}
                      strokeDasharray="2 4"
                      strokeOpacity={0.5}
                    />
                  )}
                  {/* Close dot */}
                  <circle
                    cx={xClose}
                    cy={yClose}
                    r={5}
                    fill={s.color}
                    stroke={TOKENS.colors.black}
                    strokeWidth={2}
                  />
                </g>
              )
            })}
          </svg>
        )}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: TOKENS.spacing[5],
        fontSize: TOKENS.fontSizes.xs,
      }}>
        {scenarios.map((s) => (
          <span key={s.label} style={{ display: 'inline-flex', alignItems: 'center', gap: TOKENS.spacing[2] }}>
            <span style={{
              width: TOKENS.spacing[5],
              height: 2,
              background: s.color,
              flexShrink: 0,
            }} />
            <span style={{ color: TOKENS.colors.textSecondary }}>
              {s.label}
              <span style={{ color: TOKENS.colors.textGhost, marginLeft: TOKENS.spacing[2] }}>
                · closes M{s.closeMonth}
              </span>
            </span>
          </span>
        ))}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: TOKENS.spacing[2], color: TOKENS.colors.textGhost }}>
          <span style={{
            width: TOKENS.dot.sm,
            height: TOKENS.dot.sm,
            borderRadius: TOKENS.radius.full,
            background: TOKENS.colors.accent,
            flexShrink: 0,
          }} />
          = vault closes (capital unlocks)
        </span>
      </div>
    </div>
  )
}

function formatUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}k`
  return `$${Math.round(n).toLocaleString('en-US')}`
}
