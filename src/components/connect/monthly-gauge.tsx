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
  const nowPct = Math.max(2, Math.min(98, progress * 100))
  const monthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div>
      <div style={{
        fontFamily: TOKENS.fonts.mono,
        fontSize: TOKENS.fontSizes.xs,
        fontWeight: TOKENS.fontWeights.bold,
        letterSpacing: TOKENS.letterSpacing.display,
        textTransform: 'uppercase',
        color: TOKENS.colors.textGhost,
        marginBottom: TOKENS.spacing[4],
      }}>
        {label ?? monthName} · {apr.toFixed(2)}% APR
      </div>

      {/* Gauge bar — Ultra-minimalist */}
      <div style={{
        position: 'relative',
        height: '48px',
        marginBottom: TOKENS.spacing[4],
        borderBottom: `${TOKENS.borders.heavy} solid ${TOKENS.colors.borderMain}`,
      }}>
        {/* Fill - Minimalist line instead of box */}
        <div style={{
          position: 'absolute',
          bottom: '-4px',
          left: 0,
          width: `${nowPct}%`,
          height: '4px',
          background: TOKENS.colors.accent,
          zIndex: 4,
          transition: 'width 1s ease',
        }} />

        {/* Produced (left) - Large, clean typography */}
        <div style={{
          position: 'absolute',
          left: 0,
          bottom: TOKENS.spacing[3],
          fontFamily: TOKENS.fonts.sans,
          fontSize: 'clamp(24px, 3vw, 32px)',
          fontWeight: TOKENS.fontWeights.black,
          color: TOKENS.colors.textPrimary,
          zIndex: 3,
          whiteSpace: 'nowrap',
          letterSpacing: TOKENS.letterSpacing.tight,
          lineHeight: 1,
        }}>
          {fmtUsd(produced)}
        </div>

        {/* ~Remaining (right, discret) */}
        {remaining > 0 && nowPct < 85 && (
          <div style={{
            position: 'absolute',
            right: 0,
            bottom: TOKENS.spacing[3],
            fontFamily: TOKENS.fonts.mono,
            fontSize: TOKENS.fontSizes.sm,
            color: TOKENS.colors.textGhost,
            zIndex: 3,
            whiteSpace: 'nowrap',
            letterSpacing: TOKENS.letterSpacing.wide,
            fontWeight: TOKENS.fontWeights.bold,
          }}>
            EST. {fmtUsd(remaining)} REMAINING
          </div>
        )}
      </div>

      {/* Day markers */}
      <div style={{ position: 'relative', height: '14px' }}>
        <span style={{ position: 'absolute', left: 0, fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, letterSpacing: TOKENS.letterSpacing.wide, color: TOKENS.colors.textGhost, fontWeight: TOKENS.fontWeights.bold }}>
          DAY 01
        </span>
        <span style={{
          position: 'absolute',
          left: `${nowPct}%`,
          transform: 'translateX(-50%)',
          fontFamily: TOKENS.fonts.mono,
          fontSize: TOKENS.fontSizes.xs,
          fontWeight: TOKENS.fontWeights.bold,
          letterSpacing: TOKENS.letterSpacing.wide,
          color: TOKENS.colors.textPrimary,
        }}>
          DAY {dayOfMonth < 10 ? `0${dayOfMonth}` : dayOfMonth}
        </span>
        <span style={{ position: 'absolute', right: 0, fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, letterSpacing: TOKENS.letterSpacing.wide, color: TOKENS.colors.textGhost, fontWeight: TOKENS.fontWeights.bold }}>
          DAY {daysInMonth}
        </span>
      </div>
    </div>
  )
}