'use client'

import { TOKENS, fmtUsd } from './constants'
import { MonthlyGauge } from './monthly-gauge'
import type { ActiveVault, MaturedVault } from './data'

export function VaultDetailPanel({ vault }: { vault: ActiveVault | MaturedVault }) {
  const currentValue = vault.deposited + vault.claimable
  const status = vault.type === 'matured' ? 'Matured' : 'Active'

  return (
    <div
      className="flex-1"
      style={{
        overflowY: 'auto',
        padding: `${TOKENS.spacing[6]} ${TOKENS.spacing[6]}`,
        background: TOKENS.colors.bgPage,
        display: 'flex',
        flexDirection: 'column',
        gap: TOKENS.spacing[6],
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: TOKENS.spacing[6],
        paddingBottom: TOKENS.spacing[4],
        borderBottom: `${TOKENS.borders.thin} solid ${TOKENS.colors.gray200}`,
      }}>
        <div>
          <Label>Position Detail</Label>
          <div style={{
            fontSize: TOKENS.fontSizes.xxxl,
            fontWeight: TOKENS.fontWeights.black,
            letterSpacing: TOKENS.letterSpacing.tight,
            lineHeight: 0.95,
            marginBottom: TOKENS.spacing[2],
          }}>
            {vault.name}
          </div>
          <div style={{
            fontSize: TOKENS.fontSizes.sm,
            fontWeight: TOKENS.fontWeights.medium,
            color: TOKENS.colors.textSecondary,
            maxWidth: '700px',
            lineHeight: 1.5,
          }}>
            {vault.strategy}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Label>Current Value</Label>
          <div style={{
            fontSize: TOKENS.fontSizes.xxl,
            fontWeight: TOKENS.fontWeights.black,
            letterSpacing: TOKENS.letterSpacing.tight,
            color: TOKENS.colors.black,
          }}>
            {fmtUsd(currentValue)}
          </div>
          <div style={{
            marginTop: TOKENS.spacing[2],
            display: 'inline-flex',
            alignItems: 'center',
            padding: `4px ${TOKENS.spacing[3]}`,
            background: TOKENS.colors.black,
            color: TOKENS.colors.accent,
            fontSize: TOKENS.fontSizes.xs,
            fontWeight: TOKENS.fontWeights.bold,
            letterSpacing: TOKENS.letterSpacing.display,
            textTransform: 'uppercase',
          }}>
            {status}
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: TOKENS.spacing[4],
      }}>
        <MetricCard label="Principal" value={fmtUsd(vault.deposited)} />
        <MetricCard label="Available Yield" value={fmtUsd(vault.claimable)} accent />
        <MetricCard label="Target" value={vault.target} />
        <MetricCard label="Maturity" value={vault.maturity} />
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: TOKENS.spacing[2], alignItems: 'baseline' }}>
          <Label>Target Progress</Label>
          <span style={{
            fontFamily: TOKENS.fonts.mono,
            fontSize: TOKENS.fontSizes.xs,
            fontWeight: TOKENS.fontWeights.bold,
            color: TOKENS.colors.textSecondary,
          }}>{vault.progress}% of {vault.target}</span>
        </div>
        <div style={{ height: '12px', background: TOKENS.colors.black, overflow: 'hidden', marginBottom: TOKENS.spacing[3] }}>
          <div style={{ height: '100%', width: `${vault.progress}%`, background: TOKENS.colors.accent, transition: 'width 1s ease' }} />
        </div>
        <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, fontWeight: TOKENS.fontWeights.bold, color: TOKENS.colors.textSecondary }}>
          Capital unlocks when {vault.target} cumulative target is reached or at maturity.
        </div>
      </div>

      <div style={{ borderTop: `${TOKENS.borders.thin} solid ${TOKENS.colors.gray200}`, paddingTop: TOKENS.spacing[4] }}>
        <MonthlyGauge deposited={vault.deposited} apr={vault.apr} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: TOKENS.spacing[4] }}>
        <div style={{ borderTop: `${TOKENS.borders.thin} solid ${TOKENS.colors.gray200}`, paddingTop: TOKENS.spacing[4] }}>
          <Label>Capital Protection</Label>
          <div style={{
            fontFamily: TOKENS.fonts.sans,
            fontSize: TOKENS.fontSizes.sm,
            fontWeight: TOKENS.fontWeights.medium,
            color: TOKENS.colors.textSecondary,
            lineHeight: 1.6,
          }}>
            Safeguard active — not triggered. If principal falls below initial deposit at maturity, mining infrastructure operates for up to 2 additional years to restore capital.
          </div>
        </div>

        <div style={{ borderTop: `${TOKENS.borders.thin} solid ${TOKENS.colors.gray200}`, paddingTop: TOKENS.spacing[4] }}>
          <Label>Strategy</Label>
          <div style={{
            fontFamily: TOKENS.fonts.sans,
            fontSize: TOKENS.fontSizes.sm,
            marginBottom: TOKENS.spacing[3],
            color: TOKENS.colors.black,
            fontWeight: TOKENS.fontWeights.medium,
          }}>{vault.strategy}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: TOKENS.spacing[4] }}>
            <MetricCard label="Yield Rate" value={`${vault.apr}% APY`} compact accent />
            <MetricCard label="Progress" value={`${vault.progress}%`} compact />
          </div>
        </div>
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

function MetricCard({
  label,
  value,
  accent = false,
  compact = false,
}: {
  label: string
  value: string
  accent?: boolean
  compact?: boolean
}) {
  return (
    <div style={{
      padding: compact ? TOKENS.spacing[3] : TOKENS.spacing[4],
      border: `${TOKENS.borders.thin} solid ${TOKENS.colors.gray200}`,
      background: TOKENS.colors.bgPage,
    }}>
      <Label>{label}</Label>
      <div style={{
        fontFamily: TOKENS.fonts.sans,
        fontSize: compact ? TOKENS.fontSizes.md : TOKENS.fontSizes.xl,
        fontWeight: TOKENS.fontWeights.black,
        letterSpacing: '-0.03em',
        color: accent ? TOKENS.colors.accent : TOKENS.colors.black,
        lineHeight: 1.1,
      }}>
        {value}
      </div>
    </div>
  )
}
