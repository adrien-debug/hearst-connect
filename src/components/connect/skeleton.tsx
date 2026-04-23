'use client'

import { TOKENS } from './constants'
import { fitValue, type SmartFitMode } from './smart-fit'

interface SkeletonProps {
  mode: SmartFitMode
  variant?: 'card' | 'gauge' | 'chart' | 'list'
}

export function Skeleton({ mode, variant = 'card' }: SkeletonProps) {
  const basePulse = {
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    background: TOKENS.colors.bgTertiary,
    borderRadius: TOKENS.radius.sm,
  }

  const variants = {
    card: <CardSkeleton basePulse={basePulse} mode={mode} />,
    gauge: <GaugeSkeleton basePulse={basePulse} mode={mode} />,
    chart: <ChartSkeleton basePulse={basePulse} />,
    list: <ListSkeleton basePulse={basePulse} mode={mode} />,
  }

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.3; }
        }
      `}</style>
      {variants[variant]}
    </>
  )
}

function CardSkeleton({ basePulse, mode }: { basePulse: React.CSSProperties; mode: SmartFitMode }) {
  return (
    <div style={{
      background: TOKENS.colors.bgSecondary,
      borderRadius: TOKENS.radius.lg,
      padding: fitValue(mode, {
        normal: TOKENS.spacing[4],
        tight: TOKENS.spacing[3],
        limit: TOKENS.spacing[3],
      }),
      border: `1px solid ${TOKENS.colors.borderSubtle}`,
    }}>
      {/* Header */}
      <div style={{ marginBottom: TOKENS.spacing[4], display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ ...basePulse, width: '120px', height: '20px' }} />
        <div style={{ ...basePulse, width: '60px', height: '20px' }} />
      </div>

      {/* Value */}
      <div style={{ ...basePulse, width: '70%', height: '40px', marginBottom: TOKENS.spacing[4] }} />

      {/* Progress bar */}
      <div style={{
        height: '4px',
        background: TOKENS.colors.black,
        borderRadius: TOKENS.radius.sm,
        marginBottom: TOKENS.spacing[2],
      }}>
        <div style={{ ...basePulse, width: '60%', height: '100%' }} />
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: TOKENS.spacing[3] }}>
        <div style={{ ...basePulse, width: '80px', height: '12px' }} />
        <div style={{ ...basePulse, width: '80px', height: '12px' }} />
      </div>
    </div>
  )
}

function GaugeSkeleton({ basePulse, mode }: { basePulse: React.CSSProperties; mode: SmartFitMode }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: TOKENS.spacing[2],
    }}>
      <div style={{ ...basePulse, width: '80px', height: '11px' }} />
      <div style={{
        ...basePulse,
        width: '100%',
        height: fitValue(mode, { normal: '40px', tight: '32px', limit: '28px' }),
      }} />
      <div style={{ ...basePulse, width: '120px', height: '12px' }} />
    </div>
  )
}

function ChartSkeleton({ basePulse }: { basePulse: React.CSSProperties }) {
  return (
    <div style={{
      background: TOKENS.colors.black,
      borderRadius: TOKENS.radius.sm,
      height: '120px',
      padding: TOKENS.spacing[4],
    }}>
      <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none">
        <path
          d="M0,80 Q50,60 100,70 T200,50"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
          style={{ ...basePulse, animationDelay: '0.1s' }}
        />
      </svg>
    </div>
  )
}

function ListSkeleton({ basePulse, mode }: { basePulse: React.CSSProperties; mode: SmartFitMode }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: fitValue(mode, { normal: TOKENS.spacing[3], tight: TOKENS.spacing[2], limit: TOKENS.spacing[2] }),
    }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: TOKENS.colors.bgSecondary,
            borderRadius: TOKENS.radius.lg,
            padding: fitValue(mode, {
              normal: TOKENS.spacing[4],
              tight: TOKENS.spacing[3],
              limit: TOKENS.spacing[3],
            }),
            border: `1px solid ${TOKENS.colors.borderSubtle}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: TOKENS.spacing[3] }}>
            <div style={{ ...basePulse, width: '40px', height: '40px', borderRadius: 'var(--radius-sm)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[2] }}>
              <div style={{ ...basePulse, width: '120px', height: '14px' }} />
              <div style={{ ...basePulse, width: '80px', height: '11px' }} />
            </div>
          </div>
          <div style={{ ...basePulse, width: '60px', height: '24px' }} />
        </div>
      ))}
    </div>
  )
}
