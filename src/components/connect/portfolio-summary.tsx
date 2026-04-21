'use client'

import { TOKENS, fmtUsd } from './constants'
import { MonthlyGauge } from './monthly-gauge'
import type { VaultLine, Aggregate, ActiveVault } from './data'

export function PortfolioSummary({ vaults, agg }: { vaults: VaultLine[]; agg: Aggregate }) {
  const activeVaults = vaults.filter((v): v is ActiveVault => v.type === 'active')

  return (
    <div
      className="flex-1 min-h-0"
      style={{
        display: 'grid',
        gridTemplateRows: 'auto auto 1fr',
        background: TOKENS.colors.gray100,
        overflow: 'hidden',
        fontFamily: TOKENS.fonts.sans,
      }}
    >
      {/* ══ ROW A — HERO STRIP ══ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 280px',
        gap: 0,
        borderBottom: `${TOKENS.borders.thin} solid ${TOKENS.colors.gray200}`,
        background: TOKENS.colors.white,
      }}>
        {/* HERO LEFT — yield + gauge */}
        <div style={{
          padding: `${TOKENS.spacing[6]} ${TOKENS.spacing[8]}`,
          borderRight: `${TOKENS.borders.thin} solid ${TOKENS.colors.gray200}`,
        }}>
          <Label>Yield Earned To Date</Label>
          <div style={{
            fontFamily: TOKENS.fonts.mono,
            fontSize: TOKENS.fontSizes.xxxl,
            fontWeight: TOKENS.fontWeights.black,
            letterSpacing: TOKENS.letterSpacing.tight,
            lineHeight: 1,
            color: TOKENS.colors.black,
            marginBottom: TOKENS.spacing[2],
          }}>
            {fmtUsd(agg.totalClaimable)}
          </div>

          {/* Decision signal */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: TOKENS.spacing[2],
            marginBottom: TOKENS.spacing[4],
          }}>
            <span style={{
              display: 'inline-block',
              width: TOKENS.spacing[2],
              height: TOKENS.spacing[2],
              background: agg.totalClaimable > 1000 ? TOKENS.colors.accent : TOKENS.colors.gray200,
              flexShrink: 0,
            }} />
            <span style={{
              fontFamily: TOKENS.fonts.mono,
              fontSize: TOKENS.fontSizes.xs,
              fontWeight: TOKENS.fontWeights.bold,
              letterSpacing: TOKENS.letterSpacing.wide,
              textTransform: 'uppercase' as const,
              color: agg.totalClaimable > 1000 ? TOKENS.colors.black : TOKENS.colors.textGhost,
            }}>
              {agg.totalClaimable > 1000
                ? 'Claim available — action recommended'
                : 'Yield accumulating — no action required'}
            </span>
          </div>

          {/* Monthly gauge */}
          <MonthlyGauge deposited={agg.totalDeposited} apr={agg.avgApr} />
        </div>

        {/* HERO RIGHT — next distribution + portfolio stats */}
        <div style={{
          padding: `${TOKENS.spacing[6]} ${TOKENS.spacing[6]}`,
          display: 'flex',
          flexDirection: 'column',
          gap: TOKENS.spacing[4],
        }}>
          <div>
            <Label>Next Distribution</Label>
            <div style={{
              fontFamily: TOKENS.fonts.mono,
              fontSize: TOKENS.fontSizes.md,
              fontWeight: TOKENS.fontWeights.bold,
              color: TOKENS.colors.black,
              letterSpacing: TOKENS.letterSpacing.wide,
              lineHeight: 1,
              marginBottom: TOKENS.spacing[2],
            }}>APR 23 2026</div>
            <div style={{
              fontFamily: TOKENS.fonts.mono,
              fontSize: TOKENS.fontSizes.xs,
              fontWeight: TOKENS.fontWeights.bold,
              color: TOKENS.colors.textGhost,
              letterSpacing: TOKENS.letterSpacing.wide,
            }}>
              00:00 UTC
            </div>
          </div>

          <div style={{ borderTop: `${TOKENS.borders.thin} solid ${TOKENS.colors.gray200}`, paddingTop: TOKENS.spacing[4] }}>
            <StatRow label="Total Deposited" value={fmtUsd(agg.totalDeposited)} />
            <StatRow label="Total Portfolio" value={fmtUsd(agg.totalDeposited + agg.totalClaimable)} accent />
            <StatRow label="Avg APR" value={`${agg.avgApr.toFixed(1)}%`} />
            <StatRow label="Active Positions" value={String(activeVaults.length)} />
          </div>
        </div>
      </div>

      {/* ══ ROW B — ANALYTICS: Yield Breakdown + Allocation ══ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.6fr 1fr',
        borderBottom: `${TOKENS.borders.thin} solid ${TOKENS.colors.gray200}`,
        background: TOKENS.colors.white,
      }}>
        {/* Yield by position — bar chart from actual vault data */}
        <div style={{
          padding: `${TOKENS.spacing[4]} ${TOKENS.spacing[8]}`,
          borderRight: `${TOKENS.borders.thin} solid ${TOKENS.colors.gray200}`,
        }}>
          <Label>Yield Breakdown — Active Positions</Label>
          <YieldBreakdown vaults={activeVaults} />
        </div>

        {/* Asset Allocation — based on vault weights */}
        <div style={{ padding: `${TOKENS.spacing[4]} ${TOKENS.spacing[6]}` }}>
          <Label>Capital Allocation</Label>
          <CapitalAllocation vaults={activeVaults} total={agg.totalDeposited} />
        </div>
      </div>

      {/* ══ ROW C — ACTIVE POSITIONS TABLE ══ */}
      <div style={{
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: TOKENS.colors.white,
        minHeight: 0,
      }}>
        <div style={{ padding: `${TOKENS.spacing[3]} ${TOKENS.spacing[8]} 0`, flexShrink: 0 }}>
          <Label>Active Positions</Label>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2.4fr 1.1fr 1.1fr 0.7fr 1.4fr 1.2fr',
            padding: `${TOKENS.spacing[2]} 0`,
            borderBottom: `${TOKENS.borders.heavy} solid ${TOKENS.colors.black}`,
          }}>
            {['Strategy', 'Deposited', 'Yield', 'APR', 'Maturity', 'Progress'].map(h => (
              <span key={h} style={{
                fontFamily: TOKENS.fonts.mono,
                fontSize: TOKENS.fontSizes.xs,
                fontWeight: TOKENS.fontWeights.bold,
                letterSpacing: TOKENS.letterSpacing.display,
                textTransform: 'uppercase' as const,
                color: TOKENS.colors.textPrimary,
              }}>{h}</span>
            ))}
          </div>
        </div>

        {/* Table rows */}
        <div style={{ flex: 1, overflowY: 'auto', padding: `0 ${TOKENS.spacing[8]}` }}>
          {activeVaults.map(v => <VaultRow key={v.id} vault={v} />)}
        </div>
      </div>
    </div>
  )
}

/** Horizontal bars — one per vault, sized by claimable yield. SSR-safe (no random). */
function YieldBreakdown({ vaults }: { vaults: ActiveVault[] }) {
  const maxYield = Math.max(...vaults.map(v => v.claimable), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[3] }}>
      {vaults.map(v => {
        const barPct = (v.claimable / maxYield) * 100
        const gainPct = v.deposited > 0 ? ((v.claimable / v.deposited) * 100).toFixed(2) : '0.00'
        return (
          <div key={v.id}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: TOKENS.spacing[2],
              alignItems: 'baseline',
            }}>
              <span style={{
                fontFamily: TOKENS.fonts.sans,
                fontSize: TOKENS.fontSizes.sm,
                fontWeight: TOKENS.fontWeights.bold,
                color: TOKENS.colors.black,
                textTransform: 'uppercase' as const,
                letterSpacing: TOKENS.letterSpacing.tight,
              }}>{v.name}</span>
              <span style={{
                fontFamily: TOKENS.fonts.mono,
                fontSize: TOKENS.fontSizes.xs,
                fontWeight: TOKENS.fontWeights.bold,
                color: TOKENS.colors.accent,
              }}>+{fmtUsd(v.claimable)} · {gainPct}%</span>
            </div>
            {/* Segmented bar: claimable (accent) over deposited (black) */}
            <div style={{ position: 'relative', height: '8px', background: TOKENS.colors.gray200 }}>
              {/* deposited reference */}
              <div style={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: '100%',
                background: TOKENS.colors.gray200,
              }} />
              {/* yield fill */}
              <div style={{
                position: 'absolute', top: 0, left: 0,
                width: `${barPct}%`, height: '100%',
                background: TOKENS.colors.accent,
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Capital allocation by vault — stacked horizontal bar + legend. SSR-safe. */
function CapitalAllocation({ vaults, total }: { vaults: ActiveVault[]; total: number }) {
  const palette = [TOKENS.colors.accent, TOKENS.colors.black, TOKENS.colors.gray500]

  return (
    <div>
      {/* Stacked bar */}
      <div style={{ display: 'flex', height: '32px', marginBottom: TOKENS.spacing[3] }}>
        {vaults.map((v, idx) => {
          const pct = total > 0 ? (v.deposited / total) * 100 : 0
          const showInlineLabel = pct >= 8
          return (
            <div key={v.id} style={{
              width: `${pct}%`,
              background: palette[idx % palette.length],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: TOKENS.fonts.mono,
              fontSize: TOKENS.fontSizes.xs,
              fontWeight: TOKENS.fontWeights.bold,
              color: idx === 0 ? TOKENS.colors.black : TOKENS.colors.textOnDark,
              marginLeft: idx > 0 ? TOKENS.borders.thin : 0,
              overflow: 'hidden',
            }}>{showInlineLabel ? `${pct.toFixed(0)}%` : null}</div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[2] }}>
        {vaults.map((v, idx) => {
          const pct = total > 0 ? (v.deposited / total) * 100 : 0
          return (
            <div key={v.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: TOKENS.spacing[2] }}>
                <div style={{ width: TOKENS.spacing[2], height: TOKENS.spacing[2], background: palette[idx % palette.length], flexShrink: 0 }} />
                <span style={{
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: TOKENS.fontSizes.xs,
                  fontWeight: TOKENS.fontWeights.bold,
                  color: TOKENS.colors.textGhost,
                  textTransform: 'uppercase' as const,
                }}>{v.name}</span>
              </div>
              <span style={{
                fontFamily: TOKENS.fonts.mono,
                fontSize: TOKENS.fontSizes.xs,
                fontWeight: TOKENS.fontWeights.bold,
                color: TOKENS.colors.textPrimary,
              }}>{pct.toFixed(0)}% · {fmtUsd(v.deposited)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function VaultRow({ vault: v }: { vault: ActiveVault }) {
  const currentValue = v.deposited + v.claimable
  const gainPct = v.deposited > 0 ? ((v.claimable / v.deposited) * 100).toFixed(1) : '0.0'

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '2.4fr 1.1fr 1.1fr 0.7fr 1.4fr 1.2fr',
      padding: `${TOKENS.spacing[4]} 0`,
      borderBottom: `${TOKENS.borders.thin} solid ${TOKENS.colors.gray200}`,
      alignItems: 'center',
    }}>
      <div>
        <div style={{
          fontSize: TOKENS.fontSizes.md,
          fontWeight: TOKENS.fontWeights.black,
          textTransform: 'uppercase' as const,
          color: TOKENS.colors.black,
          letterSpacing: TOKENS.letterSpacing.tight,
          lineHeight: 1,
        }}>{v.name}</div>
        <div style={{
          fontFamily: TOKENS.fonts.mono,
          fontSize: TOKENS.fontSizes.xs,
          fontWeight: TOKENS.fontWeights.bold,
          letterSpacing: TOKENS.letterSpacing.wide,
          textTransform: 'uppercase' as const,
          color: TOKENS.colors.textGhost,
          display: 'flex',
          alignItems: 'center',
          gap: TOKENS.spacing[2],
          marginTop: TOKENS.spacing[2],
        }}>
          <span style={{ width: TOKENS.spacing[2], height: TOKENS.spacing[2], background: TOKENS.colors.accent, display: 'inline-block', flexShrink: 0 }} />
          {v.strategy}
        </div>
      </div>
      <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.sm, fontWeight: TOKENS.fontWeights.bold }}>{fmtUsd(v.deposited)}</span>
      <div>
        <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.sm, fontWeight: TOKENS.fontWeights.bold }}>{fmtUsd(currentValue)}</div>
        <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, fontWeight: TOKENS.fontWeights.bold, color: TOKENS.colors.accent, marginTop: '2px' }}>+{gainPct}%</div>
      </div>
      <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.sm, fontWeight: TOKENS.fontWeights.bold }}>{v.apr}%</span>
      <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, fontWeight: TOKENS.fontWeights.bold, color: TOKENS.colors.textGhost }}>{v.maturity}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: TOKENS.spacing[2] }}>
        <div style={{ flex: 1, height: '8px', background: TOKENS.colors.gray200, position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${v.progress}%`, background: TOKENS.colors.accent }} />
        </div>
        <span style={{
          fontFamily: TOKENS.fonts.mono,
          fontSize: TOKENS.fontSizes.xs,
          fontWeight: TOKENS.fontWeights.bold,
          color: TOKENS.colors.textGhost,
          flexShrink: 0,
        }}>{v.progress}%</span>
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

function StatRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      padding: `${TOKENS.spacing[2]} 0`,
      borderBottom: `${TOKENS.borders.thin} solid ${TOKENS.colors.gray200}`,
    }}>
      <span style={{
        fontFamily: TOKENS.fonts.mono,
        fontSize: TOKENS.fontSizes.xs,
        fontWeight: TOKENS.fontWeights.bold,
        color: TOKENS.colors.textGhost,
        letterSpacing: TOKENS.letterSpacing.wide,
        textTransform: 'uppercase' as const,
      }}>{label}</span>
      <span style={{
        fontFamily: TOKENS.fonts.mono,
        fontSize: TOKENS.fontSizes.xs,
        fontWeight: TOKENS.fontWeights.bold,
        color: accent ? TOKENS.colors.accent : TOKENS.colors.textPrimary,
      }}>{value}</span>
    </div>
  )
}
