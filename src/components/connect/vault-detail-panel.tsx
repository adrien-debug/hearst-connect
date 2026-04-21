'use client'

import { TOKENS, fmtUsd } from './constants'
import { MonthlyGauge } from './monthly-gauge'
import type { VaultLine } from './data'

interface VaultDetailPanelProps {
  vault: VaultLine
}

export function VaultDetailPanel({ vault }: VaultDetailPanelProps) {
  const currentValue = (vault.deposited || 0) + (vault.claimable || 0)

  return (
    <div className="flex-1 flex flex-col min-h-0" style={{ overflowY: 'auto', padding: `${TOKENS.spacing[16]} ${TOKENS.spacing[20]}`, background: TOKENS.colors.bgPage }}>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: TOKENS.spacing[8], marginBottom: TOKENS.spacing[12] }}>
        {([
          { k: 'Deposited', v: fmtUsd(vault.deposited || 0) },
          { k: 'Current Value', v: fmtUsd(currentValue), accent: true },
          { k: 'Yield Paid', v: fmtUsd(vault.claimable || 0), accent: true },
          { k: 'Matures', v: vault.maturity || '—' },
        ] as const).map(item => (
          <div key={item.k}>
            <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, textTransform: 'uppercase', letterSpacing: TOKENS.letterSpacing.display, color: TOKENS.colors.textGhost, marginBottom: TOKENS.spacing[3], fontWeight: TOKENS.fontWeights.bold }}>{item.k}</div>
            <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xxl, fontWeight: TOKENS.fontWeights.bold, color: 'accent' in item && item.accent ? TOKENS.colors.accent : TOKENS.colors.textPrimary }}>{item.v}</div>
          </div>
        ))}
      </div>

      {/* Cumulative target progress */}
      <div style={{ marginBottom: TOKENS.spacing[12] }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: TOKENS.spacing[4] }}>
          <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, textTransform: 'uppercase', letterSpacing: TOKENS.letterSpacing.display, color: TOKENS.colors.textGhost, fontWeight: TOKENS.fontWeights.bold }}>Cumulative Target Progress</span>
          <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, color: TOKENS.colors.textGhost, fontWeight: TOKENS.fontWeights.bold }}>{vault.progress}% of {vault.target}</span>
        </div>
        <div style={{ height: '4px', background: TOKENS.colors.surfaceActive, overflow: 'hidden', marginBottom: TOKENS.spacing[3] }}>
          <div style={{ height: '100%', width: `${vault.progress || 0}%`, background: TOKENS.colors.accent, transition: 'width 1s ease' }} />
        </div>
        <div style={{ fontFamily: TOKENS.fonts.sans, fontSize: TOKENS.fontSizes.sm, color: TOKENS.colors.textGhost }}>
          Capital unlocks when {vault.target} cumulative target is reached or at maturity — whichever comes first. Yield distributed daily.
        </div>
      </div>

      {/* Monthly gauge */}
      <div style={{ marginBottom: TOKENS.spacing[12] }}>
        <MonthlyGauge deposited={vault.deposited || 0} apr={vault.apr} />
      </div>

      {/* Capital recovery + Strategy */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: TOKENS.spacing[16] }}>
        <div>
          <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, textTransform: 'uppercase', letterSpacing: TOKENS.letterSpacing.display, color: TOKENS.colors.accent, marginBottom: TOKENS.spacing[4], fontWeight: TOKENS.fontWeights.bold }}>✓ Capital Recovery</div>
          <div style={{ fontFamily: TOKENS.fonts.sans, fontSize: TOKENS.fontSizes.sm, color: TOKENS.colors.textGhost, lineHeight: 1.6 }}>
            Safeguard active — not triggered. If principal is below initial deposit at maturity, mining infrastructure operates for up to 2 additional years to restore capital.
          </div>
        </div>
        <div>
          <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, textTransform: 'uppercase', letterSpacing: TOKENS.letterSpacing.display, color: TOKENS.colors.textGhost, marginBottom: TOKENS.spacing[4], fontWeight: TOKENS.fontWeights.bold }}>Strategy · Sideways Regime</div>
          <div style={{ fontFamily: TOKENS.fonts.sans, fontSize: TOKENS.fontSizes.sm, color: TOKENS.colors.textPrimary, marginBottom: TOKENS.spacing[4] }}>{vault.strategy}</div>
          <div style={{ display: 'flex', height: '4px', overflow: 'hidden', marginBottom: TOKENS.spacing[3], background: TOKENS.colors.surfaceActive }}>
            <div style={{ width: '40%', background: TOKENS.colors.accent }} />
            <div style={{ width: '30%', background: TOKENS.colors.textPrimary }} />
            <div style={{ width: '30%', background: TOKENS.colors.textGhost }} />
          </div>
          <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, color: TOKENS.colors.textGhost }}>40% RWA · 30% USDC · 30% BTC</div>
        </div>
      </div>

    </div>
  )
}
