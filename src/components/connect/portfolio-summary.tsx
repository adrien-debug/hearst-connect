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
      height: '100%', 
      overflowY: 'auto', 
      padding: `${TOKENS.spacing[16]} 120px`, 
      background: TOKENS.colors.bgPage, 
      color: TOKENS.colors.textPrimary, 
      fontFamily: TOKENS.fonts.sans,
      position: 'relative'
    }}>

      {/* HEADER SECTION */}
      <div style={{ flexShrink: 0, marginBottom: TOKENS.spacing[12], display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <SectionLabel>Portfolio Overview</SectionLabel>
          <h1 style={{ fontSize: TOKENS.fontSizes.display, fontWeight: TOKENS.fontWeights.black, letterSpacing: TOKENS.letterSpacing.tight, margin: TOKENS.spacing[0], lineHeight: 1, color: TOKENS.colors.textPrimary, textTransform: 'uppercase' }}>
            {fmtUsd(agg.totalDeposited)}
          </h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, color: TOKENS.colors.textGhost, marginBottom: TOKENS.spacing[2], letterSpacing: TOKENS.letterSpacing.display, textTransform: 'uppercase', fontWeight: TOKENS.fontWeights.bold }}>AVG PERFORMANCE</div>
          <div style={{ fontSize: TOKENS.fontSizes.xxl, fontWeight: TOKENS.fontWeights.black, color: TOKENS.colors.textPrimary, fontFamily: TOKENS.fonts.mono }}>{agg.avgApr.toFixed(2)}% <span style={{ color: TOKENS.colors.textGhost, fontSize: TOKENS.fontSizes.md }}>APR</span></div>
        </div>
      </div>

      {/* TOP KPIs */}
      <div style={{ flexShrink: 0, marginBottom: TOKENS.spacing[12], display: 'grid', gridTemplateColumns: '1fr 280px', gap: TOKENS.spacing[12] }}>
        <MonthlyGauge
          deposited={agg.totalDeposited}
          apr={agg.avgApr}
        />
        <NextDistribution />
      </div>

      {/* ANALYTICS GRID */}
      <div style={{ flexShrink: 0, minHeight: '260px', display: 'flex', gap: TOKENS.spacing[12], marginBottom: TOKENS.spacing[12] }}>
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

      {/* BOTTOM TABLE */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', paddingBottom: TOKENS.spacing[16] }}>
        <SectionLabel>Active Positions</SectionLabel>
        <div>
          <VaultList vaults={activeVaults} onSelect={setSelectedVault} />
        </div>
      </div>

      {/* SLIDE-OVER PANEL */}
      <VaultDetailPanel vault={selectedVault} onClose={() => setSelectedVault(null)} />
    </div>
  )
}

// ─── VaultList (Active Positions Table) ──────────────────────────────────

function VaultList({ vaults, onSelect }: { vaults: VaultLine[], onSelect: (v: VaultLine) => void }) {
  return (
    <div style={{ marginTop: TOKENS.spacing[4] }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2.5fr 1.2fr 1fr 1fr 1.5fr',
        padding: `${TOKENS.spacing[4]} ${TOKENS.spacing[0]}`,
        borderBottom: `${TOKENS.borders.heavy} solid ${TOKENS.colors.borderMain}`,
        background: TOKENS.colors.bgPage,
      }}>
        {['Vault Strategy', 'Deposited', 'Yield', 'APR', 'Maturity'].map(h => (
          <span key={h} style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, fontWeight: TOKENS.fontWeights.bold, letterSpacing: TOKENS.letterSpacing.display, textTransform: 'uppercase', color: TOKENS.colors.textGhost }}>{h}</span>
        ))}
      </div>

      {vaults.map((v) => (
        <VaultRow key={v.id} vault={v} onClick={() => onSelect(v)} />
      ))}
    </div>
  )
}

function VaultRow({ vault: v, onClick }: { vault: VaultLine, onClick: () => void }) {
  const currentValue = (v.deposited || 0) + (v.claimable || 0)
  const gainPct = (((v.claimable || 0) / (v.deposited || 1)) * 100).toFixed(1)

  return (
    <div 
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: '2.5fr 1.2fr 1fr 1fr 1.5fr',
        padding: `${TOKENS.spacing[8]} ${TOKENS.spacing[0]}`,
        borderBottom: `${TOKENS.borders.thin} solid ${TOKENS.colors.borderSubtle}`,
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'background 120ms ease-out',
      }} 
      onMouseEnter={(e) => e.currentTarget.style.background = TOKENS.colors.accent}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ paddingLeft: TOKENS.spacing[4] }}>
        <h3 style={{ fontSize: TOKENS.fontSizes.xl, fontWeight: TOKENS.fontWeights.black, margin: TOKENS.spacing[0], color: TOKENS.colors.textPrimary, textTransform: 'uppercase' }}>{v.name}</h3>
        <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, color: TOKENS.colors.textPrimary, marginTop: TOKENS.spacing[2], textTransform: 'uppercase', letterSpacing: TOKENS.letterSpacing.wide, fontWeight: TOKENS.fontWeights.bold }}>{v.strategy}</div>
      </div>
      <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.lg, color: TOKENS.colors.textPrimary, fontWeight: TOKENS.fontWeights.bold }}>{fmtUsd(v.deposited || 0)}</span>
      <div>
        <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.lg, color: TOKENS.colors.textPrimary, fontWeight: TOKENS.fontWeights.bold }}>{fmtUsd(currentValue)}</div>
        <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, color: TOKENS.colors.textGhost, marginTop: TOKENS.spacing[0], fontWeight: TOKENS.fontWeights.bold }}>+{gainPct}% TOTAL</div>
      </div>
      <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.lg, color: TOKENS.colors.textPrimary, fontWeight: TOKENS.fontWeights.bold }}>{v.apr}%</span>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: TOKENS.spacing[4] }}>
        <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.sm, color: TOKENS.colors.textGhost, fontWeight: TOKENS.fontWeights.bold }}>{v.maturity}</span>
        <div style={{ width: '80px', height: '12px', background: TOKENS.colors.borderMain, position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${v.progress || 0}%`, background: TOKENS.colors.accent }} />
        </div>
      </div>
    </div>
  )
}

// ─── Slide-Over Panel ────────────────────────────────────────────────────

function VaultDetailPanel({ vault, onClose }: { vault: VaultLine | null, onClose: () => void }) {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      width: '600px',
      maxWidth: '100%',
      background: TOKENS.colors.white,
      borderLeft: `${TOKENS.borders.thin} solid ${TOKENS.colors.borderMain}`,
      zIndex: 50,
      transform: vault ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 150ms ease-out',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-20px 0 40px rgba(0,0,0,0.1)',
    }}>
      {vault && (
        <>
          {/* Header */}
          <div style={{ flex: '0 0 auto', padding: TOKENS.spacing[12], borderBottom: `${TOKENS.borders.thin} solid ${TOKENS.colors.borderSubtle}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: TOKENS.colors.bgSurface }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', padding: `${TOKENS.spacing[0]} ${TOKENS.spacing[3]}`, background: TOKENS.colors.borderMain, color: TOKENS.colors.white, fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, fontWeight: TOKENS.fontWeights.bold, letterSpacing: TOKENS.letterSpacing.wide, textTransform: 'uppercase', marginBottom: TOKENS.spacing[4] }}>
                <div style={{ width: '8px', height: '8px', background: TOKENS.colors.accent, marginRight: TOKENS.spacing[2] }} /> LIVE
              </div>
              <h2 style={{ fontSize: TOKENS.fontSizes.xxxl, fontWeight: TOKENS.fontWeights.black, margin: `0 0 ${TOKENS.spacing[2]} 0`, color: TOKENS.colors.textPrimary, textTransform: 'uppercase' }}>{vault.name}</h2>
              <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, color: TOKENS.colors.textGhost, letterSpacing: TOKENS.letterSpacing.wide, textTransform: 'uppercase', fontWeight: TOKENS.fontWeights.bold }}>{vault.strategy}</div>
            </div>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: TOKENS.colors.textGhost, cursor: 'pointer', fontSize: TOKENS.fontSizes.xxxl, lineHeight: 1, padding: TOKENS.spacing[0], fontWeight: TOKENS.fontWeights.regular }} onMouseEnter={e => e.currentTarget.style.color = TOKENS.colors.textPrimary} onMouseLeave={e => e.currentTarget.style.color = TOKENS.colors.textGhost}>
              ×
            </button>
          </div>

          {/* Scrollable Content */}
          <div style={{ flex: '1 1 auto', overflowY: 'auto', padding: TOKENS.spacing[12] }}>
            
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: TOKENS.spacing[8], marginBottom: TOKENS.spacing[12] }}>
              <div>
                <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, textTransform: 'uppercase', letterSpacing: TOKENS.letterSpacing.display, color: TOKENS.colors.textGhost, marginBottom: TOKENS.spacing[3], fontWeight: TOKENS.fontWeights.bold }}>Deposited</div>
                <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xxl, fontWeight: TOKENS.fontWeights.bold, color: TOKENS.colors.textPrimary }}>{fmtUsd(vault.deposited || 0)}</div>
              </div>
              <div>
                <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, textTransform: 'uppercase', letterSpacing: TOKENS.letterSpacing.display, color: TOKENS.colors.textGhost, marginBottom: TOKENS.spacing[3], fontWeight: TOKENS.fontWeights.bold }}>Current Value</div>
                <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xxl, fontWeight: TOKENS.fontWeights.bold, color: TOKENS.colors.textPrimary }}>{fmtUsd((vault.deposited || 0) + (vault.claimable || 0))}</div>
              </div>
              <div>
                <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, textTransform: 'uppercase', letterSpacing: TOKENS.letterSpacing.display, color: TOKENS.colors.textGhost, marginBottom: TOKENS.spacing[3], fontWeight: TOKENS.fontWeights.bold }}>APR</div>
                <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xxl, fontWeight: TOKENS.fontWeights.bold, color: TOKENS.colors.textPrimary }}>{vault.apr}%</div>
              </div>
              <div>
                <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, textTransform: 'uppercase', letterSpacing: TOKENS.letterSpacing.display, color: TOKENS.colors.textGhost, marginBottom: TOKENS.spacing[3], fontWeight: TOKENS.fontWeights.bold }}>Matures</div>
                <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xl, fontWeight: TOKENS.fontWeights.bold, color: TOKENS.colors.textPrimary }}>{vault.maturity}</div>
              </div>
            </div>

            {/* Progress */}
            <div style={{ marginBottom: TOKENS.spacing[12] }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: TOKENS.spacing[4] }}>
                <strong style={{ fontSize: TOKENS.fontSizes.md, fontWeight: TOKENS.fontWeights.black, color: TOKENS.colors.textPrimary, textTransform: 'uppercase' }}>Cumulative target progress</strong>
                <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.sm, color: TOKENS.colors.textGhost, fontWeight: TOKENS.fontWeights.bold }}>{vault.progress}% of {vault.target}</span>
              </div>
              <div style={{ height: '12px', background: TOKENS.colors.borderMain, position: 'relative', marginBottom: TOKENS.spacing[4] }}>
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${vault.progress || 0}%`, background: TOKENS.colors.accent }} />
              </div>
              <p style={{ fontSize: TOKENS.fontSizes.md, color: TOKENS.colors.textGhost, lineHeight: 1.6, margin: TOKENS.spacing[0] }}>
                Your invested capital unlocks for withdrawal when the cumulative target is reached or at maturity, whichever comes first. Yield is distributed daily.
              </p>
            </div>

            {/* Placeholders for Strategy & Transactions */}
            <div style={{ padding: TOKENS.spacing[6], marginBottom: TOKENS.spacing[4], cursor: 'pointer', background: TOKENS.colors.bgSurface, border: `${TOKENS.borders.thin} solid ${TOKENS.colors.borderSubtle}`, transition: 'background 120ms ease-out' }} onMouseEnter={e => e.currentTarget.style.background = TOKENS.colors.accent} onMouseLeave={e => e.currentTarget.style.background = TOKENS.colors.bgSurface}>
              <strong style={{ fontSize: TOKENS.fontSizes.md, fontWeight: TOKENS.fontWeights.black, color: TOKENS.colors.textPrimary, textTransform: 'uppercase' }}>Strategy details ↓</strong>
            </div>
            <div style={{ padding: TOKENS.spacing[6], cursor: 'pointer', background: TOKENS.colors.bgSurface, border: `${TOKENS.borders.thin} solid ${TOKENS.colors.borderSubtle}`, transition: 'background 120ms ease-out' }} onMouseEnter={e => e.currentTarget.style.background = TOKENS.colors.accent} onMouseLeave={e => e.currentTarget.style.background = TOKENS.colors.bgSurface}>
              <strong style={{ fontSize: TOKENS.fontSizes.md, fontWeight: TOKENS.fontWeights.black, color: TOKENS.colors.textPrimary, textTransform: 'uppercase' }}>Transactions ↓</strong>
            </div>

          </div>
        </>
      )}
    </div>
  )
}

// ─── Next Distribution ───────────────────────────────────────────────────

function NextDistribution() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dateStr = tomorrow.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })

  return (
    <div style={{ padding: TOKENS.spacing[8], background: TOKENS.colors.bgSurface, border: `${TOKENS.borders.thin} solid ${TOKENS.colors.borderSubtle}`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, letterSpacing: TOKENS.letterSpacing.display, textTransform: 'uppercase', color: TOKENS.colors.textGhost, marginBottom: TOKENS.spacing[4], fontWeight: TOKENS.fontWeights.bold }}>Next Distribution</div>
      <div style={{ fontSize: TOKENS.fontSizes.xxxl, fontWeight: TOKENS.fontWeights.black, letterSpacing: TOKENS.letterSpacing.tight, color: TOKENS.colors.textPrimary, textTransform: 'uppercase' }}>Tomorrow</div>
      <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.sm, color: TOKENS.colors.textGhost, marginTop: TOKENS.spacing[6], borderTop: `${TOKENS.borders.thin} solid ${TOKENS.colors.borderSubtle}`, paddingTop: TOKENS.spacing[6], fontWeight: TOKENS.fontWeights.bold, textTransform: 'uppercase', letterSpacing: TOKENS.letterSpacing.wide }}>
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
      margin: `0 0 ${TOKENS.spacing[6]} 0`,
      borderLeft: `3px solid ${TOKENS.colors.accent}`,
      paddingLeft: TOKENS.spacing[3]
    }}>
      {children}
    </h2>
  )
}