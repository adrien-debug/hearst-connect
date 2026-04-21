'use client'

import { useMonthProgress } from '@/hooks/useMonthProgress'
import { TOKENS, fmtUsd } from './constants'
import { computeMonthlyYield } from './data'

interface MonthlyGaugeProps {
  deposited: number
  apr: number
  label?: string
}

export function MonthlyGauge({ deposited, apr, label }: MonthlyGaugeProps) {
  const { dayOfMonth, daysInMonth, progress } = useMonthProgress()
  const { produced, remaining } = computeMonthlyYield(deposited, apr, dayOfMonth, daysInMonth)
  const nowPct = Math.max(2, Math.min(97, progress * 100))
  const monthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()

  return (
    <div>
      {/* Label DS */}
      <div style={{
        fontFamily: TOKENS.fonts.mono,
        fontSize: TOKENS.fontSizes.xs,
        fontWeight: TOKENS.fontWeights.bold,
        letterSpacing: TOKENS.letterSpacing.display,
        textTransform: 'uppercase' as const,
        color: TOKENS.colors.textPrimary,
        marginBottom: '10px',
        borderLeft: `3px solid ${TOKENS.colors.accent}`,
        paddingLeft: TOKENS.spacing[3],
      }}>
        {label ?? monthName} · {apr.toFixed(1)}% APR
      </div>

      {/* Bar structure — elapsed | now marker | remaining */}
      <div style={{ position: 'relative', marginBottom: '6px' }}>

        {/* NOW label above marker */}
        <div style={{
          position: 'absolute',
          left: `${nowPct}%`,
          bottom: '100%',
          transform: 'translateX(-50%)',
          marginBottom: '4px',
          fontFamily: TOKENS.fonts.mono,
          fontSize: '9px',
          fontWeight: 700,
          letterSpacing: '0.06em',
          color: TOKENS.colors.white,
          background: TOKENS.colors.black,
          padding: '1px 5px',
          whiteSpace: 'nowrap' as const,
          zIndex: 3,
        }}>
          DAY {String(dayOfMonth).padStart(2, '0')}
        </div>

        {/* Track */}
        <div style={{
          position: 'relative',
          height: '12px',
          background: TOKENS.colors.black,
          overflow: 'visible',
        }}>
          {/* Elapsed — accent fill */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${nowPct}%`,
            height: '100%',
            background: TOKENS.colors.accent,
            zIndex: 1,
          }} />

          {/* NOW tick — white vertical line */}
          <div style={{
            position: 'absolute',
            left: `${nowPct}%`,
            top: '-3px',
            height: '18px',
            width: '2px',
            background: TOKENS.colors.white,
            zIndex: 4,
            transform: 'translateX(-1px)',
          }} />
        </div>
      </div>

      {/* Day markers + produced / remaining */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginTop: '4px',
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'baseline' }}>
          <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: '9px', fontWeight: 500, color: TOKENS.colors.textGhost }}>
            01
          </span>
          <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: '9px', fontWeight: 700, color: TOKENS.colors.accent }}>
            +{fmtUsd(produced)} produced
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'baseline' }}>
          {nowPct > 85 ? (
            <span style={{
              fontFamily: TOKENS.fonts.mono,
              fontSize: TOKENS.fontSizes.xs,
              fontWeight: TOKENS.fontWeights.bold,
              color: TOKENS.colors.black,
              letterSpacing: '0.06em',
            }}>
              DISTRIBUTION IMMINENT
            </span>
          ) : (
            <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: '9px', fontWeight: 700, color: TOKENS.colors.textGhost }}>
              {fmtUsd(remaining)} remaining
            </span>
          )}
          <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: '9px', fontWeight: 500, color: TOKENS.colors.textGhost }}>
            {daysInMonth}
          </span>
        </div>
      </div>
    </div>
  )
}
