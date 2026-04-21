'use client'

import { TOKENS, fmtUsd } from './constants'
import { MonthlyGauge } from './monthly-gauge'
import type { ActiveVault, MaturedVault } from './data'

export function VaultDetailPanel({ vault }: { vault: ActiveVault | MaturedVault }) {
  const currentValue = vault.deposited + vault.claimable

  return (
    <div className="flex-1" style={{ overflowY: 'auto', padding: `${TOKENS.spacing[20]} ${TOKENS.spacing[12]}`, background: TOKENS.colors.bgPage }}>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: TOKENS.spacing[6], marginBottom: TOKENS.spacing[6] }}>
        {([
          { k: 'Deposited', v: fmtUsd(vault.deposited) },
          { k: 'Current Value', v: fmtUsd(currentValue), accent: true },
          { k: 'Yield Paid', v: fmtUsd(vault.claimable), accent: true },
          { k: 'Matures', v: vault.maturity },
        ] as const).map(item => (
          <div key={item.k}>
            {/* DS label — mono, xs, display spacing, accent left-border */}
            <div style={{
              fontFamily: TOKENS.fonts.mono,
              fontSize: TOKENS.fontSizes.xs,
              fontWeight: TOKENS.fontWeights.bold,
              textTransform: 'uppercase' as const,
              letterSpacing: TOKENS.letterSpacing.display,
              color: TOKENS.colors.textPrimary,
              marginBottom: TOKENS.spacing[2],
              borderLeft: `3px solid ${TOKENS.colors.accent}`,
              paddingLeft: TOKENS.spacing[3],
            }}>{item.k}</div>
            <div style={{
              fontFamily: TOKENS.fonts.mono,
              fontSize: TOKENS.fontSizes.lg,
              fontWeight: TOKENS.fontWeights.bold,
              color: 'accent' in item && item.accent ? TOKENS.colors.accent : TOKENS.colors.textPrimary,
            }}>{item.v}</div>
          </div>
        ))}
      </div>

      {/* Cumulative target progress */}
      <div style={{ marginBottom: TOKENS.spacing[6] }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: TOKENS.spacing[2] }}>
          <span style={{
            fontFamily: TOKENS.fonts.mono,
            fontSize: TOKENS.fontSizes.xs,
            fontWeight: TOKENS.fontWeights.bold,
            textTransform: 'uppercase' as const,
            letterSpacing: TOKENS.letterSpacing.display,
            color: TOKENS.colors.textPrimary,
            borderLeft: `3px solid ${TOKENS.colors.accent}`,
            paddingLeft: TOKENS.spacing[3],
          }}>Cumulative Target Progress</span>
          <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, fontWeight: TOKENS.fontWeights.bold, color: TOKENS.colors.textGhost }}>{vault.progress}% of {vault.target}</span>
        </div>
        {/* Progress bar DS — h:12px, track:black, fill:accent */}
        <div style={{ height: '12px', background: TOKENS.colors.black, overflow: 'hidden', marginBottom: TOKENS.spacing[2] }}>
          <div style={{ height: '100%', width: `${vault.progress}%`, background: TOKENS.colors.accent, transition: 'width 1s ease' }} />
        </div>
        <div style={{ fontFamily: TOKENS.fonts.sans, fontSize: TOKENS.fontSizes.xs, color: TOKENS.colors.textGhost, lineHeight: 1.5 }}>
          Capital unlocks when {vault.target} cumulative target is reached or at maturity — whichever comes first.
        </div>
      </div>

      {/* Monthly gauge */}
      <div style={{ marginBottom: TOKENS.spacing[8] }}>
        <MonthlyGauge deposited={vault.deposited} apr={vault.apr} />
      </div>

      {/* PERFORMANCE CHART - Yield Curve */}
      <div style={{ marginBottom: TOKENS.spacing[8] }}>
        {/* DS label */}
        <div style={{
          fontFamily: TOKENS.fonts.mono,
          fontSize: TOKENS.fontSizes.xs,
          fontWeight: TOKENS.fontWeights.bold,
          textTransform: 'uppercase' as const,
          letterSpacing: TOKENS.letterSpacing.display,
          color: TOKENS.colors.textPrimary,
          marginBottom: TOKENS.spacing[3],
          borderLeft: `3px solid ${TOKENS.colors.accent}`,
          paddingLeft: TOKENS.spacing[3],
        }}>
          Yield Performance (30D)
        </div>
        <div style={{ 
          height: '120px', 
          width: '100%', 
          background: TOKENS.colors.gray50, 
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '2px',
          padding: '0 4px'
        }}>
          {/* Simulation d'une courbe de yield ascendante */}
          {Array.from({ length: 30 }).map((_, i) => {
            const height = 20 + (i * 2.5) + (Math.sin(i * 0.5) * 5)
            const isToday = i === 21 // Simulation jour 21
            return (
              <div key={i} style={{
                flex: 1,
                height: `${height}%`,
                background: isToday ? TOKENS.colors.accent : i < 21 ? TOKENS.colors.black : TOKENS.colors.gray200,
                opacity: i < 21 ? 1 : 0.3,
                transition: 'height 0.3s ease'
              }} />
            )
          })}
          <div style={{
            position: 'absolute',
            left: '70%', // Jour 21 sur 30
            top: '20%',
            fontFamily: TOKENS.fonts.mono,
            fontSize: '9px',
            fontWeight: 700,
            background: TOKENS.colors.black,
            color: TOKENS.colors.white,
            padding: '2px 6px',
            transform: 'translateX(-50%)'
          }}>
            NOW
          </div>
        </div>
      </div>

      {/* Capital recovery + Strategy */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: TOKENS.spacing[6] }}>
        <div>
          <div style={{
            fontFamily: TOKENS.fonts.mono,
            fontSize: TOKENS.fontSizes.xs,
            fontWeight: TOKENS.fontWeights.bold,
            textTransform: 'uppercase' as const,
            letterSpacing: TOKENS.letterSpacing.display,
            color: TOKENS.colors.accent,
            marginBottom: TOKENS.spacing[2],
            borderLeft: `3px solid ${TOKENS.colors.accent}`,
            paddingLeft: TOKENS.spacing[3],
          }}>✓ Capital Recovery</div>
          <div style={{ fontFamily: TOKENS.fonts.sans, fontSize: TOKENS.fontSizes.xs, color: TOKENS.colors.textGhost, lineHeight: 1.5 }}>
            Safeguard active — not triggered. If principal is below initial deposit at maturity, mining infrastructure operates for up to 2 additional years to restore capital.
          </div>
        </div>
        <div>
          <div style={{
            fontFamily: TOKENS.fonts.mono,
            fontSize: TOKENS.fontSizes.xs,
            fontWeight: TOKENS.fontWeights.bold,
            textTransform: 'uppercase' as const,
            letterSpacing: TOKENS.letterSpacing.display,
            color: TOKENS.colors.textPrimary,
            marginBottom: TOKENS.spacing[3],
            borderLeft: `3px solid ${TOKENS.colors.accent}`,
            paddingLeft: TOKENS.spacing[3],
          }}>Strategy · Asset Allocation</div>
          <div style={{ fontFamily: TOKENS.fonts.sans, fontSize: TOKENS.fontSizes.sm, marginBottom: TOKENS.spacing[3], color: TOKENS.colors.black, fontWeight: TOKENS.fontWeights.medium }}>{vault.strategy}</div>
          
          <div style={{ display: 'flex', gap: '1px', height: '40px', marginBottom: '12px' }}>
            <div style={{ width: '40%', background: TOKENS.colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, fontFamily: TOKENS.fonts.mono }}>40%</div>
            <div style={{ width: '30%', background: TOKENS.colors.black, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, fontFamily: TOKENS.fonts.mono }}>30%</div>
            <div style={{ width: '30%', background: TOKENS.colors.gray200, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, fontFamily: TOKENS.fonts.mono }}>30%</div>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {[
              { label: 'RWA', color: TOKENS.colors.accent },
              { label: 'USDC', color: TOKENS.colors.black },
              { label: 'BTC', color: TOKENS.colors.gray200 },
            ].map(asset => (
              <div key={asset.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '6px', height: '6px', background: asset.color }} />
                <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: '9px', fontWeight: 700, color: TOKENS.colors.textGhost }}>{asset.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
