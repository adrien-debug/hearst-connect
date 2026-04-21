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
  const apr = selected ? selected.apr : agg.avgApr
  const portfolioValue = deposited + claimable

  return (
    <aside className="flex flex-col shrink-0" style={{ 
      width: '320px', 
      padding: TOKENS.spacing[8], 
      overflowY: 'auto',
      background: TOKENS.colors.bgSidebar,
      borderRight: TOKENS.borders.none,
      height: '100vh'
    }}>

      {/* Big Number */}
      <div style={{ marginBottom: TOKENS.spacing[12] }}>
        <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, fontWeight: TOKENS.fontWeights.bold, letterSpacing: TOKENS.letterSpacing.wide, textTransform: 'uppercase', color: TOKENS.colors.sidebarTextGhost, marginBottom: TOKENS.spacing[4] }}>
          {selected ? selected.name : 'Portfolio Value'}
        </div>
        {selected?.type === 'available' ? (
          <div style={{ fontFamily: TOKENS.fonts.sans, fontWeight: TOKENS.fontWeights.regular, fontSize: 'clamp(2.5rem, 4vw, 3rem)', letterSpacing: TOKENS.letterSpacing.tight, lineHeight: 1, color: TOKENS.colors.accent }}>
            <span>{selected.apr.toFixed(1)}</span>
            <span style={{ fontSize: '1.2rem', color: TOKENS.colors.sidebarTextGhost, marginLeft: TOKENS.spacing[2] }}>% APY</span>
          </div>
        ) : (
          <BigNum value={portfolioValue} />
        )}
      </div>

      {/* Contextual Metrics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[4], paddingBottom: TOKENS.spacing[8], borderBottom: `${TOKENS.borders.thin} solid ${TOKENS.colors.sidebarTextGhost}` }}>
        {selected?.type === 'available' ? (<>
          <MetricRow label="Min Deposit" value={fmtUsd(selected.minDeposit || 0)} />
          <MetricRow label="Lock Period" value={selected.lockPeriod || ''} />
          <MetricRow label="Target" value={(selected.target || '') + ' Cumul.'} />
          <MetricRow label="Risk" value={selected.risk || ''} />
          <MetricRow label="Fees" value={selected.fees || ''} />
          <MetricRow label="Strategy" value={selected.strategy || ''} small />
        </>) : (<>
          <MetricRow label="Deposited" value={fmtUsd(deposited)} />
          <MetricRow label="Claimable" value={fmtUsd(claimable)} accent />
          <MetricRow label="APR" value={`${apr.toFixed(2)}%`} />
          <MetricRow label="Status" value={selected ? (selected.canWithdraw ? 'Unlocked' : 'Locked') : 'Locked'} />
          {selected?.maturity && <MetricRow label="Matures" value={selected.maturity} />}
          {selected?.target && <MetricRow label="Target" value={selected.target + ' Cumul.'} />}
        </>)}
      </div>

      {/* MY VAULTS */}
      <div style={{ marginTop: TOKENS.spacing[8] }}>
        <VaultGroup label="My Vaults" vaults={activeVaults} selectedId={selectedId} onSelect={onSelect} />
      </div>

      {/* AVAILABLE VAULTS */}
      <div style={{ marginTop: TOKENS.spacing[12], opacity: 0.5 }}>
        <VaultGroup label="Institutional Opportunities" vaults={availableVaults} selectedId={selectedId} onSelect={onSelect} available />
      </div>
    </aside>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────

function VaultGroup({ label, vaults, selectedId, onSelect, available = false }: {
  label: string
  vaults: VaultLine[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  available?: boolean
}) {
  return (
    <div>
      <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, fontWeight: TOKENS.fontWeights.bold, letterSpacing: TOKENS.letterSpacing.wide, textTransform: 'uppercase', color: TOKENS.colors.sidebarTextGhost, marginBottom: TOKENS.spacing[4] }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[2] }}>
        {vaults.map(v => {
          const isSelected = selectedId === v.id
          return (
            <button
              key={v.id}
              onClick={() => onSelect(isSelected ? null : v.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: TOKENS.spacing[4],
                background: isSelected ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: TOKENS.borders.none,
                borderRadius: '2px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'background 150ms ease-out',
                position: 'relative',
              }}
              onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
            >
              {isSelected && (
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '2px', background: TOKENS.colors.accent }} />
              )}
              <div>
                <div style={{ fontFamily: TOKENS.fonts.sans, fontSize: TOKENS.fontSizes.md, fontWeight: TOKENS.fontWeights.medium, color: isSelected ? TOKENS.colors.accent : TOKENS.colors.sidebarTextPrimary, letterSpacing: TOKENS.letterSpacing.tight }}>{v.name}</div>
                <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, color: TOKENS.colors.sidebarTextGhost, marginTop: TOKENS.spacing[2], letterSpacing: TOKENS.letterSpacing.wide, textTransform: 'uppercase', fontWeight: TOKENS.fontWeights.medium }}>{v.strategy}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: TOKENS.spacing[4] }}>
                {available ? (<>
                  <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.sm, color: TOKENS.colors.sidebarTextPrimary, fontWeight: TOKENS.fontWeights.regular }}>{v.apr}%</div>
                  <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, color: TOKENS.colors.sidebarTextGhost, marginTop: TOKENS.spacing[2], letterSpacing: TOKENS.letterSpacing.wide, textTransform: 'uppercase', fontWeight: TOKENS.fontWeights.medium }}>EST. APY</div>
                </>) : (<>
                  <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.sm, color: TOKENS.colors.sidebarTextPrimary, fontWeight: TOKENS.fontWeights.regular }}>{fmtUsd(v.deposited || 0)}</div>
                  <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, color: TOKENS.colors.sidebarTextGhost, marginTop: TOKENS.spacing[2], letterSpacing: TOKENS.letterSpacing.wide, textTransform: 'uppercase', fontWeight: TOKENS.fontWeights.medium }}>{v.apr}% APR</div>
                </>)}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function BigNum({ value }: { value: number }) {
  const [whole, dec] = value.toFixed(2).split('.')
  return (
    <div style={{ fontFamily: TOKENS.fonts.sans, fontWeight: TOKENS.fontWeights.regular, letterSpacing: TOKENS.letterSpacing.tight, lineHeight: 1, color: TOKENS.colors.accent }}>
      <span style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)' }}>${Number(whole).toLocaleString('en-US')}</span>
      <span style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', color: TOKENS.colors.sidebarTextGhost }}>.{dec}</span>
    </div>
  )
}

function MetricRow({ label, value, accent = false, small = false }: { label: string; value: string; accent?: boolean; small?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
      <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: small ? TOKENS.fontSizes.xs : TOKENS.fontSizes.xs, fontWeight: TOKENS.fontWeights.medium, textTransform: 'uppercase', letterSpacing: TOKENS.letterSpacing.wide, color: TOKENS.colors.sidebarTextGhost }}>{label}</span>
      <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: small ? TOKENS.fontSizes.xs : TOKENS.fontSizes.sm, color: accent ? TOKENS.colors.accent : TOKENS.colors.sidebarTextPrimary, fontWeight: TOKENS.fontWeights.regular, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  )
}