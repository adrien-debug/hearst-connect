'use client'

import { FONT, MONO, COLORS, fmtUsd } from './constants'
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
      padding: '32px', 
      overflowY: 'auto',
      background: COLORS.sidebar,
      borderRight: 'none',
      height: '100vh'
    }}>

      {/* Big Number */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontFamily: MONO, fontSize: '10px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.textGhost, marginBottom: '16px' }}>
          {selected ? selected.name : 'Portfolio Value'}
        </div>
        {selected?.type === 'available' ? (
          <div style={{ fontFamily: FONT, fontWeight: 400, fontSize: 'clamp(2.5rem, 4vw, 3rem)', letterSpacing: '-0.03em', lineHeight: 1, color: COLORS.accent }}>
            <span>{selected.apr.toFixed(1)}</span>
            <span style={{ fontSize: '1.2rem', color: COLORS.textGhost, marginLeft: '4px' }}>% APY</span>
          </div>
        ) : (
          <BigNum value={portfolioValue} />
        )}
      </div>

      {/* Contextual Metrics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '32px', borderBottom: `1px solid ${COLORS.borderSubtle}` }}>
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
      <div style={{ marginTop: '32px' }}>
        <VaultGroup label="My Vaults" vaults={activeVaults} selectedId={selectedId} onSelect={onSelect} />
      </div>

      {/* AVAILABLE VAULTS */}
      <div style={{ marginTop: '48px', opacity: 0.4 }}>
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
      <div style={{ fontFamily: MONO, fontSize: '10px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.textGhost, marginBottom: '16px' }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                padding: '16px',
                background: isSelected ? COLORS.surfaceActive : 'transparent',
                border: 'none',
                borderRadius: '2px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'background 150ms ease-out',
                position: 'relative',
              }}
              onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = COLORS.surfaceHover }}
              onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
            >
              {isSelected && (
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '2px', background: COLORS.accent }} />
              )}
              <div>
                <div style={{ fontFamily: FONT, fontSize: '14px', fontWeight: 500, color: isSelected ? COLORS.accent : COLORS.textPrimary, letterSpacing: '-0.01em' }}>{v.name}</div>
                <div style={{ fontFamily: MONO, fontSize: '10px', color: COLORS.textGhost, marginTop: '4px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>{v.strategy}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '16px' }}>
                {available ? (<>
                  <div style={{ fontFamily: MONO, fontSize: '13px', color: COLORS.textPrimary, fontWeight: 400 }}>{v.apr}%</div>
                  <div style={{ fontFamily: MONO, fontSize: '10px', color: COLORS.textGhost, marginTop: '4px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>EST. APY</div>
                </>) : (<>
                  <div style={{ fontFamily: MONO, fontSize: '13px', color: COLORS.textPrimary, fontWeight: 400 }}>{fmtUsd(v.deposited || 0)}</div>
                  <div style={{ fontFamily: MONO, fontSize: '10px', color: COLORS.textGhost, marginTop: '4px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>{v.apr}% APR</div>
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
    <div style={{ fontFamily: FONT, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1, color: COLORS.accent }}>
      <span style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)' }}>${Number(whole).toLocaleString('en-US')}</span>
      <span style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', color: COLORS.textGhost }}>.{dec}</span>
    </div>
  )
}

function MetricRow({ label, value, accent = false, small = false }: { label: string; value: string; accent?: boolean; small?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
      <span style={{ fontFamily: MONO, fontSize: small ? '10px' : '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: COLORS.textGhost }}>{label}</span>
      <span style={{ fontFamily: MONO, fontSize: small ? '11px' : '13px', color: accent ? COLORS.textPrimary : COLORS.textPrimary, fontWeight: 400, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  )
}
