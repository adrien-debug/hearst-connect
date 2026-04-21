'use client'

import { TOKENS, fmtUsd } from './constants'
import { MonthlyGauge } from './monthly-gauge'
import type { ActiveVault, MaturedVault } from './data'

export function VaultDetailPanel({ vault }: { vault: ActiveVault | MaturedVault }) {
  const currentValue = vault.deposited + vault.claimable
  const gainPct = vault.deposited > 0
    ? ((vault.claimable / vault.deposited) * 100).toFixed(2)
    : '0.00'

  return (
    <div
      className="flex-1"
      style={{
        overflowY: 'auto',
        padding: `${TOKENS.spacing[8]} ${TOKENS.spacing[8]}`,
        background: TOKENS.colors.bgPage,
        display: 'flex',
        flexDirection: 'column',
        gap: TOKENS.spacing[6],
      }}
    >
      {/* ── KPI ROW ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gap: TOKENS.borders.thin,
        background: TOKENS.colors.borderMain,
      }}>
        {([
          { k: 'Deposited',     v: fmtUsd(vault.deposited) },
          { k: 'Current Value', v: fmtUsd(currentValue),       accent: true },
          { k: 'Yield Earned',  v: fmtUsd(vault.claimable),    accent: true },
          { k: 'Matures',       v: vault.maturity },
        ] as const).map(item => (
          <div key={item.k} style={{ background: TOKENS.colors.bgPage, padding: `${TOKENS.spacing[4]} ${TOKENS.spacing[4]}` }}>
            <div style={{
              fontFamily: TOKENS.fonts.mono,
              fontSize: TOKENS.fontSizes.xs,
              fontWeight: TOKENS.fontWeights.bold,
              textTransform: 'uppercase' as const,
              letterSpacing: TOKENS.letterSpacing.display,
              color: TOKENS.colors.textPrimary,
              marginBottom: TOKENS.spacing[2],
            }}>{item.k}</div>
            <div style={{
              fontFamily: TOKENS.fonts.mono,
              fontSize: TOKENS.fontSizes.md,
              fontWeight: TOKENS.fontWeights.bold,
              color: 'accent' in item && item.accent ? TOKENS.colors.accent : TOKENS.colors.textPrimary,
            }}>{item.v}</div>
          </div>
        ))}
      </div>

      {/* ── CUMULATIVE PROGRESS ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: TOKENS.spacing[2], alignItems: 'baseline' }}>
          <Label>Cumulative Target Progress</Label>
          <span style={{
            fontFamily: TOKENS.fonts.mono,
            fontSize: TOKENS.fontSizes.xs,
            fontWeight: TOKENS.fontWeights.bold,
            color: TOKENS.colors.textGhost,
          }}>{vault.progress}% of {vault.target}</span>
        </div>
        <div style={{ height: '12px', background: TOKENS.colors.black, overflow: 'hidden', marginBottom: TOKENS.spacing[3] }}>
          <div style={{ height: '100%', width: `${vault.progress}%`, background: TOKENS.colors.accent, transition: 'width 1s ease' }} />
        </div>
        <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, fontWeight: TOKENS.fontWeights.bold, color: TOKENS.colors.textGhost }}>
          Capital unlocks when {vault.target} cumulative target is reached or at maturity.
        </div>
      </div>

      {/* ── MONTHLY GAUGE ── */}
      <div style={{ borderTop: `${TOKENS.borders.thin} solid ${TOKENS.colors.gray200}`, paddingTop: TOKENS.spacing[4] }}>
        <MonthlyGauge deposited={vault.deposited} apr={vault.apr} />
      </div>

      {/* ── YIELD ACCUMULATION CHART ── */}
      <div>
        <Label>Yield Accumulation — Milestone View</Label>
        <YieldMilestoneChart
          deposited={vault.deposited}
          claimable={vault.claimable}
          target={vault.target}
          progress={vault.progress}
        />
      </div>

      {/* ── CAPITAL RECOVERY + STRATEGY ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: TOKENS.spacing[6] }}>
        {/* Capital Recovery */}
        <div style={{ borderTop: `${TOKENS.borders.thin} solid ${TOKENS.colors.gray200}`, paddingTop: TOKENS.spacing[4] }}>
          <div style={{
            fontFamily: TOKENS.fonts.mono,
            fontSize: TOKENS.fontSizes.xs,
            fontWeight: TOKENS.fontWeights.bold,
            textTransform: 'uppercase' as const,
            letterSpacing: TOKENS.letterSpacing.display,
            color: TOKENS.colors.accent,
            marginBottom: TOKENS.spacing[2],
          }}>✓ Capital Recovery</div>
          <div style={{
            fontFamily: TOKENS.fonts.mono,
            fontSize: TOKENS.fontSizes.xs,
            fontWeight: TOKENS.fontWeights.bold,
            color: TOKENS.colors.textGhost,
            lineHeight: 1.6,
          }}>
            Safeguard active — not triggered. If principal falls below initial deposit at maturity, mining infrastructure operates for up to 2 additional years to restore capital.
          </div>
        </div>

        {/* Strategy */}
        <div style={{ borderTop: `${TOKENS.borders.thin} solid ${TOKENS.colors.gray200}`, paddingTop: TOKENS.spacing[4] }}>
          <Label>Strategy · Allocation</Label>
          <div style={{
            fontFamily: TOKENS.fonts.sans,
            fontSize: TOKENS.fontSizes.sm,
            marginBottom: TOKENS.spacing[3],
            color: TOKENS.colors.black,
            fontWeight: TOKENS.fontWeights.medium,
          }}>{vault.strategy}</div>

          {/* Stacked allocation bar */}
          <div style={{ display: 'flex', height: '24px', marginBottom: TOKENS.spacing[3] }}>
            {[
              { w: '40%', bg: TOKENS.colors.accent,  fg: TOKENS.colors.black,      label: 'RWA 40%' },
              { w: '30%', bg: TOKENS.colors.black,   fg: TOKENS.colors.textOnDark, label: 'USDC 30%' },
              { w: '30%', bg: TOKENS.colors.gray500, fg: TOKENS.colors.black,      label: 'BTC 30%' },
            ].map((s, idx) => (
              <div key={idx} style={{
                width: s.w,
                background: s.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: TOKENS.fontSizes.xs,
                fontWeight: TOKENS.fontWeights.bold,
                fontFamily: TOKENS.fonts.mono,
                color: s.fg,
                marginLeft: idx > 0 ? TOKENS.borders.thin : 0,
              }}>{s.label}</div>
            ))}
          </div>

          {/* APR badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: TOKENS.spacing[2],
            background: TOKENS.colors.black,
            padding: `4px ${TOKENS.spacing[3]}`,
          }}>
            <span style={{
              fontFamily: TOKENS.fonts.mono,
              fontSize: TOKENS.fontSizes.xs,
              fontWeight: TOKENS.fontWeights.bold,
              color: TOKENS.colors.textGhost,
              letterSpacing: TOKENS.letterSpacing.display,
              textTransform: 'uppercase' as const,
            }}>APR</span>
            <span style={{
              fontFamily: TOKENS.fonts.mono,
              fontSize: TOKENS.fontSizes.sm,
              fontWeight: TOKENS.fontWeights.black,
              color: TOKENS.colors.accent,
            }}>{vault.apr}%</span>
            <span style={{
              fontFamily: TOKENS.fonts.mono,
              fontSize: TOKENS.fontSizes.xs,
              fontWeight: TOKENS.fontWeights.bold,
              color: TOKENS.colors.accent,
            }}>+{gainPct}% earned</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Milestone chart: horizontal progress bars showing yield checkpoints.
 * Pure CSS/inline — no Math.random, SSR-safe.
 * Shows: principal, earned yield at key intervals, target.
 */
function YieldMilestoneChart({
  deposited,
  claimable,
  target,
  progress,
}: {
  deposited: number
  claimable: number
  target: string
  progress: number
}) {
  const targetPct = parseFloat(target.replace('%', '')) || 36
  const targetYield = deposited * (targetPct / 100)
  const earnedPct = targetYield > 0 ? Math.min((claimable / targetYield) * 100, 100) : 0

  // Milestones: 25%, 50%, 75%, 100% of target
  const milestones = [25, 50, 75, 100].map(m => ({
    label: `${m}% target`,
    value: deposited * (targetPct / 100) * (m / 100),
    reached: earnedPct >= m,
    isCurrent: earnedPct < m && earnedPct >= m - 25,
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[2] }}>
      {/* Progress overview */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: TOKENS.spacing[2] }}>
        <span style={{
          fontFamily: TOKENS.fonts.mono,
          fontSize: TOKENS.fontSizes.xs,
          fontWeight: TOKENS.fontWeights.bold,
          color: TOKENS.colors.textGhost,
        }}>Principal: {fmtUsd(deposited)}</span>
        <span style={{
          fontFamily: TOKENS.fonts.mono,
          fontSize: TOKENS.fontSizes.xs,
          fontWeight: TOKENS.fontWeights.bold,
          color: TOKENS.colors.accent,
        }}>Target: {fmtUsd(targetYield)} ({target})</span>
      </div>

      {/* Milestone rows */}
      {milestones.map((m) => (
        <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: TOKENS.spacing[3] }}>
          {/* Status dot */}
          <div style={{
            width: '8px',
            height: '8px',
            background: m.reached ? TOKENS.colors.accent : TOKENS.colors.gray200,
            flexShrink: 0,
          }} />
          {/* Bar */}
          <div style={{ flex: 1, height: '6px', background: TOKENS.colors.gray200, position: 'relative' }}>
            {m.reached && (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: TOKENS.colors.accent }} />
            )}
            {m.isCurrent && (
              <div style={{ position: 'absolute', top: 0, left: 0, width: `${earnedPct % 25 / 25 * 100}%`, height: '100%', background: TOKENS.colors.accent, opacity: 0.6 }} />
            )}
          </div>
          {/* Label + value */}
          <div style={{ display: 'flex', justifyContent: 'space-between', minWidth: '200px' }}>
            <span style={{
              fontFamily: TOKENS.fonts.mono,
              fontSize: TOKENS.fontSizes.xs,
              fontWeight: TOKENS.fontWeights.bold,
              color: m.reached ? TOKENS.colors.black : TOKENS.colors.textGhost,
              textTransform: 'uppercase' as const,
              letterSpacing: TOKENS.letterSpacing.wide,
            }}>{m.label}</span>
            <span style={{
              fontFamily: TOKENS.fonts.mono,
              fontSize: TOKENS.fontSizes.xs,
              fontWeight: TOKENS.fontWeights.bold,
              color: m.reached ? TOKENS.colors.accent : TOKENS.colors.textGhost,
            }}>{fmtUsd(m.value)}</span>
          </div>
        </div>
      ))}

      {/* Current yield indicator */}
      <div style={{
        marginTop: TOKENS.spacing[3],
        display: 'flex',
        alignItems: 'center',
        gap: TOKENS.spacing[3],
        borderTop: `${TOKENS.borders.thin} solid ${TOKENS.colors.gray200}`,
        paddingTop: TOKENS.spacing[3],
      }}>
        <span style={{
          fontFamily: TOKENS.fonts.mono,
          fontSize: TOKENS.fontSizes.xs,
          fontWeight: TOKENS.fontWeights.bold,
          color: TOKENS.colors.textGhost,
          letterSpacing: TOKENS.letterSpacing.display,
          textTransform: 'uppercase' as const,
        }}>Earned so far</span>
        <span style={{
          fontFamily: TOKENS.fonts.mono,
          fontSize: TOKENS.fontSizes.sm,
          fontWeight: TOKENS.fontWeights.black,
          color: TOKENS.colors.accent,
        }}>{fmtUsd(claimable)}</span>
        <span style={{
          fontFamily: TOKENS.fonts.mono,
          fontSize: TOKENS.fontSizes.xs,
          fontWeight: TOKENS.fontWeights.bold,
          color: TOKENS.colors.textGhost,
        }}>/ {progress}% cumulative progress</span>
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: TOKENS.fonts.mono,
      fontSize: TOKENS.fontSizes.xs,
      fontWeight: TOKENS.fontWeights.bold,
      letterSpacing: TOKENS.letterSpacing.display,
      textTransform: 'uppercase' as const,
      color: TOKENS.colors.textPrimary,
      marginBottom: TOKENS.spacing[3],
    }}>
      {children}
    </div>
  )
}
