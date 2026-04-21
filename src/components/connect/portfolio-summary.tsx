'use client'

import { FONT, MONO, COLORS, fmtUsd } from './constants'
import { MonthlyGauge } from './monthly-gauge'
import type { VaultLine, Aggregate } from './data'

interface PortfolioSummaryProps {
  vaults: VaultLine[]
  agg: Aggregate
}

import { useState } from 'react'
import { MONO, COLORS, FONT, fmtUsd } from './constants'
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
      overflow: 'hidden', 
      padding: '32px', 
      background: COLORS.bg, 
      color: COLORS.textPrimary, 
      fontFamily: FONT,
      position: 'relative'
    }}>

      {/* HEADER SECTION (Fixed height) */}
      <div style={{ flex: '0 0 auto', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.2em', color: COLORS.textGhost, marginBottom: '8px', textTransform: 'uppercase' }}>
            Portfolio Overview
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 500, letterSpacing: '-0.04em', margin: 0, lineHeight: 1 }}>
            {fmtUsd(agg.totalDeposited)}
          </h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: MONO, fontSize: '10px', color: COLORS.textGhost, marginBottom: '4px', letterSpacing: '0.1em' }}>AVG PERFORMANCE</div>
          <div style={{ fontSize: '20px', fontWeight: 500 }}>{agg.avgApr.toFixed(2)}% <span style={{ color: COLORS.textGhost, fontSize: '12px' }}>APR</span></div>
        </div>
      </div>

      {/* TOP KPIs (Fixed height) */}
      <div style={{ flex: '0 0 auto', marginBottom: '32px', display: 'grid', gridTemplateColumns: '1fr 240px', gap: '32px' }}>
        <MonthlyGauge
          deposited={agg.totalDeposited}
          apr={agg.avgApr}
        />
        <NextDistribution />
      </div>

      {/* ANALYTICS GRID (Flex 1 - Absorbs remaining space) */}
      <div style={{ flex: '1 1 auto', minHeight: 0, display: 'flex', gap: '32px', marginBottom: '32px' }}>
        {/* Placeholder Line Chart */}
        <div style={{ flex: 2, border: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column', padding: '24px' }}>
          <SectionLabel>Portfolio Value (12 Months)</SectionLabel>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textGhost, fontFamily: MONO, fontSize: '12px' }}>
            [ Line Chart Area ]
          </div>
        </div>
        {/* Placeholder Allocation */}
        <div style={{ flex: 1, border: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column', padding: '24px' }}>
          <SectionLabel>Allocation</SectionLabel>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textGhost, fontFamily: MONO, fontSize: '12px' }}>
            [ Donut & Exposure Bars ]
          </div>
        </div>
      </div>

      {/* BOTTOM TABLE (Fixed height, internal scroll) */}
      <div style={{ flex: '0 0 30%', minHeight: '200px', display: 'flex', flexDirection: 'column' }}>
        <SectionLabel>Active Positions</SectionLabel>
        <div style={{ flex: 1, overflowY: 'auto', borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}` }}>
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
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr',
        padding: '12px 0',
        borderBottom: `1px solid ${COLORS.border}`,
        position: 'sticky',
        top: 0,
        background: COLORS.bg,
        zIndex: 10,
      }}>
        {['Vault Strategy', 'Deposited', 'Yield', 'APR', 'Maturity'].map(h => (
          <span key={h} style={{ fontFamily: MONO, fontSize: '9px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.textGhost }}>{h}</span>
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
        gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr',
        padding: '20px 0',
        borderBottom: `1px solid ${COLORS.border}`,
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'background 0.2s ease',
      }} 
      className="hover:bg-white/[0.04]"
    >
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 500, margin: 0, color: COLORS.textPrimary }}>{v.name}</h3>
        <div style={{ fontFamily: MONO, fontSize: '10px', color: COLORS.textGhost, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{v.strategy}</div>
      </div>
      <span style={{ fontFamily: MONO, fontSize: '13px' }}>{fmtUsd(v.deposited || 0)}</span>
      <div>
        <div style={{ fontFamily: MONO, fontSize: '13px' }}>{fmtUsd(currentValue)}</div>
        <div style={{ fontFamily: MONO, fontSize: '10px', color: COLORS.textGhost, marginTop: '2px' }}>+{gainPct}% TOTAL</div>
      </div>
      <span style={{ fontFamily: MONO, fontSize: '13px' }}>{v.apr}%</span>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '16px' }}>
        <span style={{ fontFamily: MONO, fontSize: '11px', color: COLORS.textGhost }}>{v.maturity}</span>
        <div style={{ width: '60px', height: '1px', background: COLORS.border, position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${v.progress || 0}%`, background: COLORS.textPrimary }} />
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
      width: '500px',
      maxWidth: '100%',
      background: COLORS.bg,
      borderLeft: `1px solid ${COLORS.border}`,
      zIndex: 50,
      transform: vault ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-20px 0 40px rgba(0,0,0,0.5)',
    }}>
      {vault && (
        <>
          {/* Header */}
          <div style={{ flex: '0 0 auto', padding: '32px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '2px 8px', borderRadius: '999px', background: 'rgba(255,255,255,0.1)', fontSize: '9px', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '12px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: COLORS.textPrimary }} /> LIVE
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 500, margin: '0 0 4px 0' }}>{vault.name}</h2>
              <div style={{ fontFamily: MONO, fontSize: '11px', color: COLORS.textGhost, letterSpacing: '0.05em' }}>{vault.strategy}</div>
            </div>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: COLORS.textGhost, cursor: 'pointer', fontSize: '24px', lineHeight: 1, padding: '4px' }} className="hover:text-white">
              ×
            </button>
          </div>

          {/* Scrollable Content */}
          <div style={{ flex: '1 1 auto', overflowY: 'auto', padding: '32px' }}>
            
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
              <div>
                <div style={{ fontFamily: MONO, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.textGhost, marginBottom: '8px' }}>Deposited</div>
                <div style={{ fontSize: '20px', fontWeight: 500 }}>{fmtUsd(vault.deposited || 0)}</div>
              </div>
              <div>
                <div style={{ fontFamily: MONO, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.textGhost, marginBottom: '8px' }}>Current Value</div>
                <div style={{ fontSize: '20px', fontWeight: 500 }}>{fmtUsd((vault.deposited || 0) + (vault.claimable || 0))}</div>
              </div>
              <div>
                <div style={{ fontFamily: MONO, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.textGhost, marginBottom: '8px' }}>APY</div>
                <div style={{ fontSize: '20px', fontWeight: 500 }}>{vault.apr}%</div>
              </div>
              <div>
                <div style={{ fontFamily: MONO, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.textGhost, marginBottom: '8px' }}>Matures</div>
                <div style={{ fontSize: '16px', fontWeight: 500 }}>{vault.maturity}</div>
              </div>
            </div>

            {/* Progress */}
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <strong style={{ fontSize: '13px', fontWeight: 500 }}>Cumulative target progress</strong>
                <span style={{ fontFamily: MONO, fontSize: '11px', color: COLORS.textGhost }}>{vault.progress}% of {vault.target}</span>
              </div>
              <div style={{ height: '2px', background: COLORS.border, position: 'relative', marginBottom: '12px' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${vault.progress || 0}%`, background: COLORS.textPrimary }} />
              </div>
              <p style={{ fontSize: '12px', color: COLORS.textGhost, lineHeight: 1.5, margin: 0 }}>
                Your invested capital unlocks for withdrawal when the cumulative target is reached or at maturity, whichever comes first. Yield is distributed daily.
              </p>
            </div>

            {/* Placeholders for Strategy & Transactions */}
            <div style={{ border: `1px solid ${COLORS.border}`, padding: '20px', marginBottom: '16px', cursor: 'pointer' }} className="hover:bg-white/[0.02]">
              <strong style={{ fontSize: '13px', fontWeight: 500 }}>Strategy details ↓</strong>
            </div>
            <div style={{ border: `1px solid ${COLORS.border}`, padding: '20px', cursor: 'pointer' }} className="hover:bg-white/[0.02]">
              <strong style={{ fontSize: '13px', fontWeight: 500 }}>Transactions ↓</strong>
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
    <div style={{ padding: '24px', border: `1px solid ${COLORS.border}`, background: 'transparent', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: COLORS.textGhost, marginBottom: '16px' }}>Next Distribution</div>
      <div style={{ fontSize: '24px', fontWeight: 500, letterSpacing: '-0.02em' }}>Tomorrow</div>
      <div style={{ fontFamily: MONO, fontSize: '11px', color: COLORS.textGhost, marginTop: '16px', borderTop: `1px solid ${COLORS.border}`, paddingTop: '16px' }}>
        {dateStr.toUpperCase()} · 00:00 UTC
      </div>
    </div>
  )
}

// ─── Shared ──────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: MONO, fontSize: '11px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: COLORS.textGhost, margin: '0 0 16px 0' }}>
      {children}
    </h2>
  )
}
