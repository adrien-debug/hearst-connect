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
        marginBottom: TOKENS.spacing[2],             // 8px via token
        borderLeft: `3px solid ${TOKENS.colors.accent}`,
        paddingLeft: TOKENS.spacing[3],
      }}>
        {label ?? monthName} · {apr.toFixed(1)}% APR
      </div>

      {/* Bar structure — elapsed | now marker | remaining */}
      <div style={{ position: 'relative', marginBottom: TOKENS.spacing[2] }}>

        {/* DAY XX badge above marker */}
        <div style={{
          position: 'absolute',
          left: `${nowPct}%`,
          bottom: '100%',
          transform: 'translateX(-50%)',
          marginBottom: TOKENS.spacing[2],
          fontFamily: TOKENS.fonts.mono,
          fontSize: TOKENS.fontSizes.xs,              // 11px — interdit 9px
          fontWeight: TOKENS.fontWeights.bold,
          letterSpacing: TOKENS.letterSpacing.wide,   // 0.1em
          color: TOKENS.colors.textOnDark,
          background: TOKENS.colors.black,
          padding: `${TOKENS.borders.thin} ${TOKENS.spacing[2]}`, // 1px 8px
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

          {/* NOW tick — white vertical line, extends above/below track */}
          <div style={{
            position: 'absolute',
            left: `${nowPct}%`,
            top: '-3px',
            height: '18px',
            width: TOKENS.borders.thick,             // 2px via token
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
        marginTop: TOKENS.spacing[2],                // 8px
      }}>
        <div style={{ display: 'flex', gap: TOKENS.spacing[3], alignItems: 'baseline' }}>
          <span style={{
            fontFamily: TOKENS.fonts.mono,
            fontSize: TOKENS.fontSizes.xs,           // 11px
            fontWeight: TOKENS.fontWeights.medium,
            color: TOKENS.colors.textGhost,
          }}>01</span>
          <span style={{
            fontFamily: TOKENS.fonts.mono,
            fontSize: TOKENS.fontSizes.xs,           // 11px
            fontWeight: TOKENS.fontWeights.bold,
            color: TOKENS.colors.accent,
          }}>+{fmtUsd(produced)} produced</span>
        </div>
        <div style={{ display: 'flex', gap: TOKENS.spacing[3], alignItems: 'baseline' }}>
          {nowPct > 85 ? (
            <span style={{
              fontFamily: TOKENS.fonts.mono,
              fontSize: TOKENS.fontSizes.xs,
              fontWeight: TOKENS.fontWeights.bold,
              color: TOKENS.colors.black,
              letterSpacing: TOKENS.letterSpacing.wide, // 0.1em
            }}>
              DISTRIBUTION IMMINENT
            </span>
          ) : (
            <span style={{
              fontFamily: TOKENS.fonts.mono,
              fontSize: TOKENS.fontSizes.xs,           // 11px — interdit 9px
              fontWeight: TOKENS.fontWeights.bold,
              color: TOKENS.colors.textGhost,
            }}>
              {fmtUsd(remaining)} remaining
            </span>
          )}
          <span style={{
            fontFamily: TOKENS.fonts.mono,
            fontSize: TOKENS.fontSizes.xs,             // 11px — interdit 9px
            fontWeight: TOKENS.fontWeights.medium,
            color: TOKENS.colors.textGhost,
          }}>{daysInMonth}</span>
        </div>
      </div>
    </div>
  )
}
