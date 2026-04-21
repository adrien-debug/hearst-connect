'use client'

import { TOKENS, fmtUsd } from './constants'
import type { VaultLine, Aggregate } from './data'

interface SidebarProps {
  vaults: VaultLine[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  agg: Aggregate
  selected: VaultLine | null
}

export function Sidebar({ vaults, selectedId, onSelect, agg, selected }: SidebarProps) {
  const activeVaults = vaults.filter(v => v.type === 'active').sort((a, b) => {
    const valA = (a.deposited || 0) + (a.claimable || 0)
    const valB = (b.deposited || 0) + (b.claimable || 0)
    return valB - valA
  })
  
  const maturedVaults = vaults.filter(v => v.type === 'matured').sort((a, b) => {
    const valA = (a.deposited || 0) + (a.claimable || 0)
    const valB = (b.deposited || 0) + (b.claimable || 0)
    return valB - valA
  })

  // Le "Portfolio Overview" est sélectionné si selectedId est null
  const isOverviewSelected = selectedId === null

  return (
    <aside className="flex flex-col shrink-0" style={{ 
      width: '280px', 
      padding: `${TOKENS.spacing[8]} ${TOKENS.spacing[6]}`, 
      overflowY: 'auto',
      background: '#000000',
      borderRight: TOKENS.borders.none,
      height: '100vh'
    }}>

      {/* PORTFOLIO OVERVIEW - Traité comme le premier élément du registre */}
      <div style={{ marginBottom: TOKENS.spacing[6] }}>
        <button
          onClick={() => onSelect(null)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            padding: `${TOKENS.spacing[3]} ${TOKENS.spacing[4]}`,
            background: isOverviewSelected ? 'rgba(255,255,255,0.1)' : 'transparent',
            border: TOKENS.borders.none,
            borderRadius: '2px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'background 150ms ease-out',
            position: 'relative',
          }}
          onMouseEnter={(e) => { if (!isOverviewSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
          onMouseLeave={(e) => { if (!isOverviewSelected) e.currentTarget.style.background = 'transparent' }}
        >
          {isOverviewSelected && (
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '2px', background: TOKENS.colors.accent }} />
          )}
          
          <div style={{ fontFamily: TOKENS.fonts.sans, fontSize: TOKENS.fontSizes.md, fontWeight: TOKENS.fontWeights.medium, color: isOverviewSelected ? TOKENS.colors.accent : '#FFFFFF', letterSpacing: TOKENS.letterSpacing.tight, marginBottom: TOKENS.spacing[2] }}>
            Portfolio Overview
          </div>
          
          <div style={{ fontFamily: TOKENS.fonts.sans, fontWeight: TOKENS.fontWeights.regular, letterSpacing: TOKENS.letterSpacing.tight, lineHeight: 1, color: isOverviewSelected ? TOKENS.colors.accent : '#FFFFFF', marginBottom: TOKENS.spacing[2] }}>
            <span style={{ fontSize: 'clamp(1.5rem, 2vw, 2rem)' }}>${Number(agg.totalDeposited.toFixed(2).split('.')[0]).toLocaleString('en-US')}</span>
            <span style={{ fontSize: 'clamp(1rem, 1.2vw, 1.25rem)', color: '#ADB5BD' }}>.{agg.totalDeposited.toFixed(2).split('.')[1]}</span>
          </div>
          
          <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.sm, color: '#ADB5BD', fontWeight: TOKENS.fontWeights.regular }}>
            +{fmtUsd(agg.totalClaimable)}
          </div>
        </button>
      </div>

      {/* ACTIVE POSITIONS */}
      {activeVaults.length > 0 && (
        <div style={{ marginBottom: TOKENS.spacing[6] }}>
          <div style={{ padding: `0 ${TOKENS.spacing[4]}`, fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, fontWeight: TOKENS.fontWeights.bold, letterSpacing: TOKENS.letterSpacing.wide, textTransform: 'uppercase', color: '#ADB5BD', marginBottom: TOKENS.spacing[3] }}>
            Active Positions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[0] }}>
            {activeVaults.map(v => (
              <VaultLedgerRow 
                key={v.id} 
                vault={v} 
                isSelected={selectedId === v.id} 
                onSelect={() => onSelect(v.id)} 
              />
            ))}
          </div>
        </div>
      )}

      {/* MATURED POSITIONS */}
      {maturedVaults.length > 0 && (
        <div>
          <div style={{ padding: `0 ${TOKENS.spacing[4]}`, fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, fontWeight: TOKENS.fontWeights.bold, letterSpacing: TOKENS.letterSpacing.wide, textTransform: 'uppercase', color: '#ADB5BD', marginBottom: TOKENS.spacing[3] }}>
            Matured Positions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[0] }}>
            {maturedVaults.map(v => (
              <VaultLedgerRow 
                key={v.id} 
                vault={v} 
                isSelected={selectedId === v.id} 
                onSelect={() => onSelect(v.id)} 
                isMatured 
              />
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────

function VaultLedgerRow({ vault, isSelected, onSelect, isMatured = false }: {
  vault: VaultLine
  isSelected: boolean
  onSelect: () => void
  isMatured?: boolean
}) {
  const currentValue = (vault.deposited || 0) + (vault.claimable || 0)
  const pnl = vault.claimable || 0

  return (
    <button
      onClick={onSelect}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        padding: `${TOKENS.spacing[3]} ${TOKENS.spacing[4]}`,
        background: isSelected ? 'rgba(255,255,255,0.1)' : 'transparent',
        border: TOKENS.borders.none,
        borderRadius: '2px',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'background 150ms ease-out',
        position: 'relative',
        marginBottom: '2px'
      }}
      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
    >
      {isSelected && (
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '2px', background: TOKENS.colors.accent }} />
      )}
      
      <div style={{ fontFamily: TOKENS.fonts.sans, fontSize: TOKENS.fontSizes.sm, fontWeight: TOKENS.fontWeights.medium, color: isSelected ? TOKENS.colors.accent : '#FFFFFF', letterSpacing: TOKENS.letterSpacing.tight, marginBottom: TOKENS.spacing[2] }}>
        {vault.name}
      </div>
      
      <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.sm, color: '#FFFFFF', fontWeight: TOKENS.fontWeights.regular, marginBottom: TOKENS.spacing[2] }}>
        {fmtUsd(currentValue)}
      </div>

      <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, color: '#ADB5BD', fontWeight: TOKENS.fontWeights.regular }}>
        {isMatured ? '(Closed)' : `(+${fmtUsd(pnl).replace('$', '')} · ${vault.apr}%)`}
      </div>
    </button>
  )
}

function MetricRow({ label, value, accent = false, small = false }: { label: string; value: string; accent?: boolean; small?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
      <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, fontWeight: TOKENS.fontWeights.medium, textTransform: 'uppercase', letterSpacing: TOKENS.letterSpacing.wide, color: TOKENS.colors.sidebarTextGhost }}>{label}</span>
      <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, color: accent ? TOKENS.colors.sidebarTextPrimary : TOKENS.colors.sidebarTextPrimary, fontWeight: TOKENS.fontWeights.regular, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  )
}