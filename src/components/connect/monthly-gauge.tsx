'use client'

import { useMonthProgress } from '@/hooks/useMonthProgress'
import { MONO, COLORS, FONT, fmtUsd } from './constants'
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
        fontFamily: MONO,
        fontSize: '11px',
        fontWeight: 500,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: COLORS.textGhost,
        marginBottom: '24px',
      }}>
        {label ?? monthName} · {apr.toFixed(2)}% APR
      </div>

      {/* Gauge bar — Ultra-minimalist */}
      <div style={{
        position: 'relative',
        height: '80px',
        marginBottom: '24px',
        borderBottom: `1px solid ${COLORS.borderSubtle}`,
      }}>
        {/* Fill - Minimalist line instead of box */}
        <div style={{
          position: 'absolute',
          bottom: '-1px',
          left: 0,
          width: `${nowPct}%`,
          height: '2px',
          background: COLORS.accent,
          zIndex: 4,
          transition: 'width 1s ease',
        }} />

        {/* Produced (left) - Large, clean typography */}
        <div style={{
          position: 'absolute',
          left: 0,
          bottom: '16px',
          fontFamily: FONT,
          fontSize: 'clamp(3rem, 7vw, 4.5rem)',
          fontWeight: 400,
          color: COLORS.accent,
          zIndex: 3,
          whiteSpace: 'nowrap',
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}>
          {fmtUsd(produced)}
        </div>

        {/* ~Remaining (right, discret) */}
        {remaining > 0 && nowPct < 85 && (
          <div style={{
            position: 'absolute',
            right: 0,
            bottom: '16px',
            fontFamily: MONO,
            fontSize: '12px',
            color: COLORS.textGhost,
            zIndex: 3,
            whiteSpace: 'nowrap',
            letterSpacing: '0.1em',
          }}>
            EST. {fmtUsd(remaining)} REMAINING
          </div>
        )}
      </div>

      {/* Day markers */}
      <div style={{ position: 'relative', height: '14px' }}>
        <span style={{ position: 'absolute', left: 0, fontFamily: MONO, fontSize: '10px', letterSpacing: '0.1em', color: COLORS.textGhost }}>
          DAY 01
        </span>
        <span style={{
          position: 'absolute',
          left: `${nowPct}%`,
          transform: 'translateX(-50%)',
          fontFamily: MONO,
          fontSize: '10px',
          fontWeight: 500,
          letterSpacing: '0.1em',
          color: COLORS.textPrimary,
        }}>
          DAY {dayOfMonth < 10 ? `0${dayOfMonth}` : dayOfMonth}
        </span>
        <span style={{ position: 'absolute', right: 0, fontFamily: MONO, fontSize: '10px', letterSpacing: '0.1em', color: COLORS.textGhost }}>
          DAY {daysInMonth}
        </span>
      </div>
    </div>
  )
}
