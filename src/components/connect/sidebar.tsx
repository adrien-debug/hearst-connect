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
  const activeVaults = vaults.filter(v => v.type === 'active')
  const availableVaults = vaults.filter(v => v.type === 'available')

  const deposited = selected?.type === 'active' ? (selected.deposited || 0) : agg.totalDeposited
  const claimable = selected?.type === 'active' ? (selected.claimable || 0) : agg.totalClaimable
  const portfolioValue = deposited + claimable

  return (
    <aside className="flex flex-col shrink-0" style={{ 
      width: '280px', 
      padding: TOKENS.spacing[6], 
      overflowY: 'auto',
      background: TOKENS.colors.bgSidebar,
      borderRight: TOKENS.borders.none,
      height: '100vh'
    }}>

      {/* Big Number - The only global metric */}
      <div style={{ marginBottom: TOKENS.spacing[8], paddingBottom: TOKENS.spacing[8], borderBottom: `${TOKENS.borders.thin} solid ${TOKENS.colors.sidebarTextGhost}` }}>
        <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, fontWeight: TOKENS.fontWeights.bold, letterSpacing: TOKENS.letterSpacing.wide, textTransform: 'uppercase', color: TOKENS.colors.sidebarTextGhost, marginBottom: TOKENS.spacing[3] }}>
          Portfolio Value
        </div>
        <BigNum value={portfolioValue} />
      </div>

      {/* MY VAULTS - High density selector */}
      <div>
        <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, fontWeight: TOKENS.fontWeights.bold, letterSpacing: TOKENS.letterSpacing.wide, textTransform: 'uppercase', color: TOKENS.colors.sidebarTextGhost, marginBottom: TOKENS.spacing[3] }}>My Vaults</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[0] }}>
          {activeVaults.map(v => {
            const isSelected = selectedId === v.id
            return (
              <button
                key={v.id}
                onClick={() => onSelect(isSelected ? null : v.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  padding: `${TOKENS.spacing[2]} ${TOKENS.spacing[3]}`,
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
                
                {/* Row 1: Name & Capital */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', width: '100%' }}>
                  <span style={{ fontFamily: TOKENS.fonts.sans, fontSize: TOKENS.fontSizes.sm, fontWeight: TOKENS.fontWeights.medium, color: isSelected ? TOKENS.colors.accent : TOKENS.colors.sidebarTextPrimary, letterSpacing: TOKENS.letterSpacing.tight }}>
                    {v.name}
                  </span>
                  <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.sm, color: TOKENS.colors.sidebarTextPrimary, fontWeight: TOKENS.fontWeights.regular }}>
                    {fmtUsd(v.deposited || 0)}
                  </span>
                </div>

                {/* Row 2: APR Status & Maturity */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', width: '100%', marginTop: '2px' }}>
                  <div style={{ display: 'flex', gap: TOKENS.spacing[2] }}>
                    <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, color: TOKENS.colors.sidebarTextGhost, fontWeight: TOKENS.fontWeights.medium }}>{v.apr}%</span>
                    <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, color: TOKENS.colors.sidebarTextGhost, fontWeight: TOKENS.fontWeights.medium }}>Locked</span>
                  </div>
                  <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, color: TOKENS.colors.sidebarTextGhost, fontWeight: TOKENS.fontWeights.medium }}>
                    {v.maturity}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* AVAILABLE VAULTS - Ultra compact */}
      <div style={{ marginTop: TOKENS.spacing[8], opacity: 0.4 }}>
        <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, fontWeight: TOKENS.fontWeights.bold, letterSpacing: TOKENS.letterSpacing.wide, textTransform: 'uppercase', color: TOKENS.colors.sidebarTextGhost, marginBottom: TOKENS.spacing[3] }}>Institutional Opportunities</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[0] }}>
          {availableVaults.map(v => {
            const isSelected = selectedId === v.id
            return (
              <button
                key={v.id}
                onClick={() => onSelect(isSelected ? null : v.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  padding: `${TOKENS.spacing[2]} ${TOKENS.spacing[3]}`,
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
                <span style={{ fontFamily: TOKENS.fonts.sans, fontSize: TOKENS.fontSizes.sm, fontWeight: TOKENS.fontWeights.medium, color: isSelected ? TOKENS.colors.accent : TOKENS.colors.sidebarTextGhost, letterSpacing: TOKENS.letterSpacing.tight }}>
                  {v.name}
                </span>
                <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.sm, color: TOKENS.colors.sidebarTextGhost, fontWeight: TOKENS.fontWeights.regular }}>
                  {v.apr}%
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

function BigNum({ value }: { value: number }) {
  const [whole, dec] = value.toFixed(2).split('.')
  return (
    <div style={{ fontFamily: TOKENS.fonts.sans, fontWeight: TOKENS.fontWeights.regular, letterSpacing: TOKENS.letterSpacing.tight, lineHeight: 1, color: TOKENS.colors.accent }}>
      <span style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)' }}>${Number(whole).toLocaleString('en-US')}</span>
      <span style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', color: TOKENS.colors.sidebarTextGhost }}>.{dec}</span>
    </div>
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