'use client'

import { useState } from 'react'
import { TOKENS, fmtUsd } from './constants'
import { MonthlyGauge } from './monthly-gauge'
import type { VaultLine, Aggregate } from './data'

interface PortfolioSummaryProps {
  vaults: VaultLine[]
  agg: Aggregate
}

export function PortfolioSummary({ vaults, agg }: PortfolioSummaryProps) {
  const [selectedVault, setSelectedVault] = useState<VaultLine | null>(null)
  
  const activeVaults = vaults.filter(v => v.type === 'active')
  const availableVaults = vaults.filter(v => v.type === 'available')

  return (
    <div className="flex-1 flex flex-col" style={{ 
      height: '100vh', 
      overflow: 'hidden', 
      padding: `${TOKENS.spacing[16]} ${TOKENS.spacing[20]}`, 
      background: TOKENS.colors.bgPage, 
      color: TOKENS.colors.textPrimary, 
      fontFamily: TOKENS.fonts.sans,
      position: 'relative'
    }}>

      {/* HEADER SECTION */}
      <div style={{ flexShrink: 0, marginBottom: TOKENS.spacing[12], display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <SectionLabel>Yield Earned To Date</SectionLabel>
          <h1 style={{ fontSize: TOKENS.fontSizes.display, fontWeight: TOKENS.fontWeights.black, letterSpacing: TOKENS.letterSpacing.tight, margin: TOKENS.spacing[0], lineHeight: 1, color: TOKENS.colors.textPrimary, textTransform: 'uppercase' }}>
            {fmtUsd(agg.totalClaimable)}
          </h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, color: TOKENS.colors.textGhost, marginBottom: TOKENS.spacing[2], letterSpacing: TOKENS.letterSpacing.display, textTransform: 'uppercase', fontWeight: TOKENS.fontWeights.bold }}>AVG PERFORMANCE</div>
          <div style={{ fontSize: TOKENS.fontSizes.xxl, fontWeight: TOKENS.fontWeights.black, color: TOKENS.colors.textPrimary, fontFamily: TOKENS.fonts.mono }}>{agg.avgApr.toFixed(2)}% <span style={{ color: TOKENS.colors.textGhost, fontSize: TOKENS.fontSizes.md }}>APR</span></div>
        </div>
      </div>

      {/* TOP KPIs */}
      <div style={{ flexShrink: 0, marginBottom: TOKENS.spacing[12], display: 'grid', gridTemplateColumns: '1fr 220px', gap: TOKENS.spacing[12] }}>
        <MonthlyGauge
          deposited={agg.totalDeposited}
          apr={agg.avgApr}
        />
        <NextDistribution />
      </div>

      {/* ANALYTICS GRID - Smart Flex to absorb remaining space */}
      <div style={{ flex: '1 1 0', minHeight: 0, display: 'flex', gap: TOKENS.spacing[12], marginBottom: TOKENS.spacing[12] }}>
        {/* Placeholder Line Chart */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', padding: TOKENS.spacing[8], background: TOKENS.colors.bgSurface, border: `${TOKENS.borders.thin} solid ${TOKENS.colors.borderSubtle}` }}>
          <SectionLabel>Portfolio Value (12 Months)</SectionLabel>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TOKENS.colors.textGhost, fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.sm, fontWeight: TOKENS.fontWeights.bold, textTransform: 'uppercase' }}>
            [ Line Chart Area ]
          </div>
        </div>
        {/* Placeholder Allocation */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: TOKENS.spacing[8], background: TOKENS.colors.bgSurface, border: `${TOKENS.borders.thin} solid ${TOKENS.colors.borderSubtle}` }}>
          <SectionLabel>Allocation</SectionLabel>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TOKENS.colors.textGhost, fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.sm, fontWeight: TOKENS.fontWeights.bold, textTransform: 'uppercase' }}>
            [ Donut & Exposure Bars ]
          </div>
        </div>
      </div>

      {/* BOTTOM TABLE - Smart Flex to fit screen */}
      <div style={{ flex: '1 1 0', minHeight: 0, display: 'flex', flexDirection: 'column', paddingBottom: TOKENS.spacing[0] }}>
        <SectionLabel>Active Positions</SectionLabel>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <VaultList vaults={activeVaults} />
        </div>
      </div>
    </div>
  )
}

// ─── VaultList (Active Positions Table) ──────────────────────────────────

function VaultList({ vaults }: { vaults: VaultLine[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        flex: '0 0 auto',
        display: 'grid',
        gridTemplateColumns: '2.5fr 1.2fr 1fr 1fr 1.5fr',
        padding: `${TOKENS.spacing[3]} ${TOKENS.spacing[0]}`,
        borderBottom: `${TOKENS.borders.heavy} solid ${TOKENS.colors.borderMain}`,
        background: TOKENS.colors.bgPage,
      }}>
        {['Vault Strategy', 'Deposited', 'Yield', 'APR', 'Maturity'].map(h => (
          <span key={h} style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, fontWeight: TOKENS.fontWeights.bold, letterSpacing: TOKENS.letterSpacing.display, textTransform: 'uppercase', color: TOKENS.colors.textGhost }}>{h}</span>
        ))}
      </div>

      <div style={{ flex: '1 1 auto', overflowY: 'auto' }}>
        {vaults.map((v) => (
          <VaultRow key={v.id} vault={v} />
        ))}
      </div>
    </div>
  )
}

function VaultRow({ vault: v }: { vault: VaultLine }) {
  const currentValue = (v.deposited || 0) + (v.claimable || 0)
  const gainPct = (((v.claimable || 0) / (v.deposited || 1)) * 100).toFixed(1)

  return (
    <div 
      style={{
        display: 'grid',
        gridTemplateColumns: '2.5fr 1.2fr 1fr 1fr 1.5fr',
        padding: `${TOKENS.spacing[6]} ${TOKENS.spacing[0]}`,
        borderBottom: `${TOKENS.borders.thin} solid ${TOKENS.colors.borderSubtle}`,
        alignItems: 'center',
        transition: 'background 120ms ease-out',
      }} 
      onMouseEnter={(e) => e.currentTarget.style.background = TOKENS.colors.surfaceHover}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ paddingLeft: TOKENS.spacing[3] }}>
        <h3 style={{ fontSize: TOKENS.fontSizes.lg, fontWeight: TOKENS.fontWeights.black, margin: TOKENS.spacing[0], color: TOKENS.colors.textPrimary, textTransform: 'uppercase' }}>{v.name}</h3>
        <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, color: TOKENS.colors.textPrimary, marginTop: TOKENS.spacing[2], textTransform: 'uppercase', letterSpacing: TOKENS.letterSpacing.wide, fontWeight: TOKENS.fontWeights.bold }}>{v.strategy}</div>
      </div>
      <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.md, color: TOKENS.colors.textPrimary, fontWeight: TOKENS.fontWeights.bold }}>{fmtUsd(v.deposited || 0)}</span>
      <div>
        <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.md, color: TOKENS.colors.textPrimary, fontWeight: TOKENS.fontWeights.bold }}>{fmtUsd(currentValue)}</div>
        <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, color: TOKENS.colors.textGhost, marginTop: TOKENS.spacing[0], fontWeight: TOKENS.fontWeights.bold }}>+{gainPct}% TOTAL</div>
      </div>
      <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.md, color: TOKENS.colors.textPrimary, fontWeight: TOKENS.fontWeights.bold }}>{v.apr}%</span>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: TOKENS.spacing[3] }}>
        <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.sm, color: TOKENS.colors.textGhost, fontWeight: TOKENS.fontWeights.bold }}>{v.maturity}</span>
        <div style={{ width: '60px', height: '8px', background: TOKENS.colors.borderMain, position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${v.progress || 0}%`, background: TOKENS.colors.accent }} />
        </div>
      </div>
    </div>
  )
}

// ─── Next Distribution ───────────────────────────────────────────────────

function NextDistribution() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dateStr = tomorrow.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })

  return (
    <div style={{ padding: TOKENS.spacing[6], background: TOKENS.colors.bgSurface, border: `${TOKENS.borders.thin} solid ${TOKENS.colors.borderSubtle}`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, letterSpacing: TOKENS.letterSpacing.display, textTransform: 'uppercase', color: TOKENS.colors.textGhost, marginBottom: TOKENS.spacing[3], fontWeight: TOKENS.fontWeights.bold }}>Next Distribution</div>
      <div style={{ fontSize: TOKENS.fontSizes.xxxl, fontWeight: TOKENS.fontWeights.black, letterSpacing: TOKENS.letterSpacing.tight, color: TOKENS.colors.textPrimary, textTransform: 'uppercase' }}>Tomorrow</div>
      <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.sm, color: TOKENS.colors.textGhost, marginTop: TOKENS.spacing[4], borderTop: `${TOKENS.borders.thin} solid ${TOKENS.colors.borderSubtle}`, paddingTop: TOKENS.spacing[4], fontWeight: TOKENS.fontWeights.bold, textTransform: 'uppercase', letterSpacing: TOKENS.letterSpacing.wide }}>
        {dateStr} · 00:00 UTC
      </div>
    </div>
  )
}

// ─── Shared ──────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ 
      fontFamily: TOKENS.fonts.mono, 
      fontSize: TOKENS.fontSizes.xs, 
      fontWeight: TOKENS.fontWeights.bold, 
      letterSpacing: TOKENS.letterSpacing.display, 
      textTransform: 'uppercase', 
      color: TOKENS.colors.textPrimary, 
      margin: `0 0 ${TOKENS.spacing[4]} 0`,
      borderLeft: `3px solid ${TOKENS.colors.accent}`,
      paddingLeft: TOKENS.spacing[2]
    }}>
      {children}
    </h2>
  )
}