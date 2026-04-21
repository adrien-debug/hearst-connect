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
        gridTemplateColumns: '1fr auto',
        gap: '0',
        borderBottom: `${TOKENS.borders.thin} solid ${TOKENS.colors.gray200}`,
        background: TOKENS.colors.white,
      }}>
        {/* HERO LEFT — yield + gauge */}
        <div style={{
          padding: '28px 40px 24px',
          borderRight: `${TOKENS.borders.thin} solid ${TOKENS.colors.gray200}`,
        }}>
          <Label>Yield Earned To Date</Label>
          <div style={{
            fontFamily: TOKENS.fonts.mono,
            fontSize: 'clamp(36px, 4vw, 52px)',
            fontWeight: TOKENS.fontWeights.black,
            letterSpacing: TOKENS.letterSpacing.tight,
            lineHeight: 1,
            color: TOKENS.colors.black,
          }}>
            {fmtUsd(agg.totalClaimable)}
          </div>

          {/* Decision signal */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '10px',
            marginBottom: '20px',
          }}>
            <span style={{
              display: 'inline-block',
              width: '6px',
              height: '6px',
              background: agg.totalClaimable > 1000 ? TOKENS.colors.accent : TOKENS.colors.gray200,
            }} />
            <span style={{
              fontFamily: TOKENS.fonts.mono,
              fontSize: TOKENS.fontSizes.xs,
              fontWeight: TOKENS.fontWeights.bold,
              letterSpacing: '0.08em',
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

        {/* HERO RIGHT — next distribution */}
        <div style={{
          padding: '28px 36px 24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          minWidth: '200px',
        }}>
          <Label>Next Distribution</Label>
          <div style={{
            fontFamily: TOKENS.fonts.mono,
            fontSize: TOKENS.fontSizes.xl,
            fontWeight: TOKENS.fontWeights.black,
            color: TOKENS.colors.black,
            letterSpacing: TOKENS.letterSpacing.tight,
            lineHeight: 1,
            marginBottom: '6px',
          }}>TOMORROW</div>
          <div style={{
            fontFamily: TOKENS.fonts.mono,
            fontSize: TOKENS.fontSizes.xs,
            fontWeight: TOKENS.fontWeights.bold,
            color: TOKENS.colors.textGhost,
            letterSpacing: TOKENS.letterSpacing.wide,
          }}>
            {nextDistStr()} · 00:00 UTC
          </div>
        </div>
      </div>

      {/* ══ ROW B — ANALYTICS CHARTS ══ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.6fr 1fr',
        borderBottom: `${TOKENS.borders.thin} solid ${TOKENS.colors.gray200}`,
        background: TOKENS.colors.white,
      }}>
        {/* Yield Curve 30D */}
        <div style={{
          padding: '20px 40px',
          borderRight: `${TOKENS.borders.thin} solid ${TOKENS.colors.gray200}`,
        }}>
          <Label>Portfolio Yield Performance (30D)</Label>
          <div style={{
            height: '72px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '2px',
          }}>
            {Array.from({ length: 30 }).map((_, i) => {
              const today = 21
              const h = 12 + (i * 2.8) + (Math.sin(i * 0.4) * 5)
              return (
                <div key={i} style={{
                  flex: 1,
                  height: `${h}%`,
                  background: i === today
                    ? TOKENS.colors.accent
                    : i < today
                      ? TOKENS.colors.black
                      : TOKENS.colors.gray200,
                  opacity: i > today ? 0.4 : 1,
                }} />
              )
            })}
          </div>
        </div>

        {/* Asset Allocation */}
        <div style={{ padding: '20px 32px' }}>
          <Label>Global Asset Allocation</Label>
          <div style={{ display: 'flex', gap: '1px', height: '36px', marginBottom: '10px' }}>
            {[
              { label: 'RWA', pct: 45, bg: TOKENS.colors.accent, fg: TOKENS.colors.black },
              { label: 'USDC', pct: 35, bg: TOKENS.colors.black, fg: TOKENS.colors.white },
              { label: 'BTC', pct: 20, bg: TOKENS.colors.gray200, fg: TOKENS.colors.black },
            ].map(s => (
              <div key={s.label} style={{
                width: `${s.pct}%`,
                background: s.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: TOKENS.fonts.mono,
                fontSize: '9px',
                fontWeight: 700,
                color: s.fg,
              }}>{s.pct}%</div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            {[
              { label: 'RWA', color: TOKENS.colors.accent },
              { label: 'USDC', color: TOKENS.colors.black },
              { label: 'BTC', color: TOKENS.colors.gray200 },
            ].map(a => (
              <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '6px', height: '6px', background: a.color }} />
                <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: '9px', fontWeight: 700, color: TOKENS.colors.textGhost }}>{a.label}</span>
              </div>
            ))}
          </div>
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
        <div style={{ padding: '16px 40px 0', flexShrink: 0 }}>
          <Label>Active Positions</Label>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2.4fr 1.1fr 1.1fr 0.7fr 1.4fr 1.2fr',
            padding: '10px 0',
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 40px' }}>
          {activeVaults.map(v => <VaultRow key={v.id} vault={v} />)}
        </div>
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
      padding: '20px 0',
      borderBottom: `${TOKENS.borders.thin} solid ${TOKENS.colors.gray200}`,
      alignItems: 'center',
    }}>
      <div>
        <div style={{
          fontSize: TOKENS.fontSizes.xl,
          fontWeight: TOKENS.fontWeights.black,
          textTransform: 'uppercase' as const,
          color: TOKENS.colors.black,
          letterSpacing: '-0.01em',
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
          gap: '6px',
          marginTop: '6px',
        }}>
          <span style={{ width: '6px', height: '6px', background: TOKENS.colors.accent, display: 'inline-block', flexShrink: 0 }} />
          {v.strategy}
        </div>
      </div>
      <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.lg, fontWeight: TOKENS.fontWeights.bold }}>{fmtUsd(v.deposited)}</span>
      <div>
        <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.lg, fontWeight: TOKENS.fontWeights.bold }}>{fmtUsd(currentValue)}</div>
        <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, fontWeight: TOKENS.fontWeights.bold, color: TOKENS.colors.accent, marginTop: '3px' }}>+{gainPct}%</div>
      </div>
      <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.lg, fontWeight: TOKENS.fontWeights.bold }}>{v.apr}%</span>
      <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.sm, fontWeight: TOKENS.fontWeights.bold, color: TOKENS.colors.textGhost }}>{v.maturity}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ flex: 1, height: '12px', background: TOKENS.colors.black, position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${v.progress}%`, background: TOKENS.colors.accent }} />
        </div>
        <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: '9px', fontWeight: 700, color: TOKENS.colors.textGhost, flexShrink: 0 }}>{v.progress}%</span>
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
      marginBottom: '12px',
      borderLeft: `3px solid ${TOKENS.colors.accent}`,
      paddingLeft: TOKENS.spacing[3],
    }}>
      {children}
    </div>
  )
}

function nextDistStr() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
}
