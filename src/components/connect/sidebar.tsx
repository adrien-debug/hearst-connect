'use client'

import { TOKENS, fmtUsd } from './constants'
import type { Aggregate, VaultLine, ActiveVault, AvailableVault } from './data'

interface SidebarProps {
  vaults: VaultLine[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  agg: Aggregate
}

export function Sidebar({ vaults, selectedId, onSelect, agg }: SidebarProps) {
  const activeVaults = vaults
    .filter((v): v is ActiveVault => v.type === 'active')
    .sort((a, b) => (b.deposited + b.claimable) - (a.deposited + a.claimable))
  const availableVaults = vaults.filter((v): v is AvailableVault => v.type === 'available')
  const isOverview = selectedId === null

  return (
    <aside
      id="connect-sidebar"
      className="flex h-full min-h-0 flex-col shrink-0"
      style={{
        width: '360px',
        background: TOKENS.colors.bgSidebar,
        backgroundImage: 'url(/pattern-sidebar.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderRight: `${TOKENS.borders.thin} solid rgba(255,255,255,0.08)`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ── TOP FIXED: brand + total portfolio ── */}
      <div style={{ padding: '28px 32px 0', flexShrink: 0 }}>

        {/* Brand */}
        <div style={{ marginBottom: '24px', cursor: 'pointer' }} onClick={() => onSelect(null)}>
          <svg style={{ width: '160px', height: 'auto' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
            <g>
              <path style={{ fill: '#fff' }} d="M751.5,546.1v47.4h79.4l-7.4,16.3h-100.4v-142.3h119l-9.4,15.7h-81.2v47.4h43l-7.6,15.5h-35.4,0Z"/>
              <path style={{ fill: '#fff' }} d="M1227.2,473.1h135.1l-19.2,18.8h-34v117.9h-28.7v-117.9h-34.9l-18.3-18.8h0Z"/>
              <path style={{ fill: '#fff' }} d="M1040.6,531.6h19.2c11.9,0,21.6-9.4,21.6-20.9s-9.7-20.9-21.6-20.9h-41.8v120h-28.7v-142.3h70.6c24.7,0,44.7,19.4,44.7,43.2s-18,41.2-41,43.1l58.8,56.9h-30.6l-51.1-46.5v-32.6h0Z"/>
              <path style={{ fill: '#fff' }} d="M918.7,467.4h-21.3l-57.7,142.3h29l39.4-97.1,39.4,97.1h29l-57.7-142.3h-.1Z"/>
              <path style={{ fill: '#fff' }} d="M1226,549.1c-3.2-3.1-7.2-6.1-12-9s-9.3-5.2-13.3-6.9-8.5-3.4-13.5-5.2c-2.2-.8-4.8-1.6-7.8-2.7-5.7-2-10.1-3.6-13-4.7-2.9-1.1-5.9-2.5-8.9-4.1s-5.2-3.2-6.6-4.9c-1.4-1.7-2.3-3.8-2.8-6.1,0-1.1-.2-2.4-.2-3.9s.4-3.1,1.2-5.1c.8-2,1.8-3.8,3.1-5.4,4.9-5.9,13.1-8.9,24.4-8.9s20.3,3.6,28.2,10.8h26.2c-11.8-16.8-30-25.1-54.8-25.1s-13.8.8-19.8,2.5c-6.1,1.6-11.2,3.8-15.3,6.5-4.1,2.7-7.6,5.8-10.6,9.4s-5.1,7.1-6.4,10.6-1.9,6.9-1.9,10.2.3,6.3,1.1,9.2c.7,2.8,1.9,5.5,3.5,7.9s3.2,4.5,4.8,6.4c1.6,1.9,3.7,3.7,6.6,5.5,2.8,1.8,5.2,3.2,7.1,4.3,2,1.1,4.7,2.4,8.1,3.9s6.2,2.5,8.1,3.2,4.7,1.7,8.2,2.9l5.7,1.9c5.6,1.9,9.9,3.4,12.9,4.6,3,1.2,6.2,2.6,9.6,4.2,3.4,1.6,5.9,3.1,7.5,4.5s3,3,4,4.8c1.1,1.8,1.6,3.9,1.6,6.2,0,6.4-2.8,11.6-8.4,15.4-5.6,3.8-12,5.8-19.2,5.8-16.9,0-28.3-4.7-34.5-14.1h-23.1c3.3,8.6,9,15.4,17.1,20.4,9.7,6.1,22,9.2,36.9,9.2s13.8-.7,20.3-2.1c6.5-1.4,12.6-3.5,18.4-6.4,5.7-2.9,10.3-7,13.7-12.2,3.4-5.2,5.1-11.3,5.1-18.1s-1.1-9.6-3.2-14c-2.2-4.4-4.8-8.2-8-11.2h0v-.2h0Z"/>
              <polygon style={{ fill: TOKENS.colors.accent }} points="601.7 466.9 572.6 466.9 572.6 609.7 601.7 609.7 601.7 549.1 633.1 579.4 665.8 579.4 601.7 517.5 601.7 466.9"/>
              <polygon style={{ fill: TOKENS.colors.accent }} points="672.7 466.9 672.7 528.1 644.6 500.9 612 500.9 672.7 559.7 672.7 609.7 701.9 609.7 701.9 466.9 672.7 466.9"/>
            </g>
          </svg>
        </div>

        {/* Total Portfolio — bloc financier dense */}
        <button
          type="button"
          onClick={() => onSelect(null)}
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'left',
            background: 'transparent',
            border: 'none',
            borderLeft: `3px solid ${isOverview ? TOKENS.colors.accent : 'rgba(255,255,255,0.08)'}`,
            padding: '10px 0 10px 12px',
            marginBottom: '20px',
            cursor: 'pointer',
            transition: '120ms ease-out',
          }}
        >
          <div style={{
            fontFamily: TOKENS.fonts.mono,
            fontSize: TOKENS.fontSizes.xs,
            fontWeight: TOKENS.fontWeights.bold,
            letterSpacing: TOKENS.letterSpacing.display,
            textTransform: 'uppercase' as const,
            color: TOKENS.colors.gray500,
            marginBottom: '6px',
          }}>
            Total Portfolio
          </div>
          <div style={{
            fontFamily: TOKENS.fonts.mono,
            fontSize: TOKENS.fontSizes.xxl,
            fontWeight: TOKENS.fontWeights.semibold,
            letterSpacing: TOKENS.letterSpacing.tight,
            lineHeight: 1,
            color: TOKENS.colors.textOnDark,
            whiteSpace: 'nowrap' as const,
          }}>
            {fmtUsd(agg.totalDeposited + agg.totalClaimable)}
          </div>
          <div style={{
            fontFamily: TOKENS.fonts.mono,
            fontSize: TOKENS.fontSizes.xs,
            fontWeight: TOKENS.fontWeights.bold,
            color: TOKENS.colors.accent,
            marginTop: '4px',
            letterSpacing: TOKENS.letterSpacing.wide,
          }}>
            +{fmtUsd(agg.totalClaimable)} earned
          </div>
        </button>

        {/* Portfolio Overview nav item */}
        <NavItem
          label="Portfolio Overview"
          active={isOverview}
          onClick={() => onSelect(null)}
        />

        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', margin: '16px 0' }} />

        {/* Active positions label */}
        <SectionLabel>Active Positions</SectionLabel>
      </div>

      {/* ── MIDDLE SCROLLABLE: active vaults ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 32px', minHeight: 0 }}>
        {activeVaults.map(v => {
          const isSel = selectedId === v.id
          const currentValue = v.deposited + v.claimable
          const gainPct = ((v.claimable / v.deposited) * 100).toFixed(1)
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelect(v.id)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: isSel ? 'rgba(167,251,144,0.04)' : 'transparent',
                border: 'none',
                borderLeft: `3px solid ${isSel ? TOKENS.colors.accent : 'rgba(255,255,255,0.06)'}`,
                padding: '12px 0 12px 12px',
                marginBottom: '4px',
                cursor: 'pointer',
                transition: '120ms ease-out',
              }}
            >
              <div style={{
                fontFamily: TOKENS.fonts.sans,
                fontSize: TOKENS.fontSizes.sm,
                fontWeight: isSel ? TOKENS.fontWeights.bold : TOKENS.fontWeights.medium,
                color: isSel ? TOKENS.colors.textOnDark : TOKENS.colors.gray500,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.02em',
                marginBottom: '4px',
              }}>{v.name}</div>
              <div style={{
                fontFamily: TOKENS.fonts.mono,
                fontSize: TOKENS.fontSizes.md,
                fontWeight: TOKENS.fontWeights.semibold,
                color: isSel ? TOKENS.colors.textOnDark : 'rgba(255,255,255,0.5)',
                lineHeight: 1,
                marginBottom: '2px',
              }}>{fmtUsd(currentValue)}</div>
              <div style={{
                fontFamily: TOKENS.fonts.mono,
                fontSize: TOKENS.fontSizes.xs,
                fontWeight: TOKENS.fontWeights.bold,
                color: TOKENS.colors.accent,
              }}>+{fmtUsd(v.claimable)} · {gainPct}%</div>
            </button>
          )
        })}
      </div>

      {/* ── BOTTOM FIXED: available vaults ── */}
      <div style={{
        padding: '16px 32px 24px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        <SectionLabel>Available</SectionLabel>
        {availableVaults.map(v => {
          const isSel = selectedId === v.id
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelect(v.id)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderLeft: `3px solid ${isSel ? TOKENS.colors.accent : 'transparent'}`,
                padding: '7px 0 7px 12px',
                cursor: 'pointer',
                transition: '120ms ease-out',
              }}
            >
              <span style={{
                fontFamily: TOKENS.fonts.sans,
                fontSize: TOKENS.fontSizes.sm,
                fontWeight: isSel ? TOKENS.fontWeights.bold : TOKENS.fontWeights.medium,
                color: isSel ? TOKENS.colors.textOnDark : TOKENS.colors.gray500,
              }}>{v.name}</span>
              <span style={{
                fontFamily: TOKENS.fonts.mono,
                fontSize: TOKENS.fontSizes.xs,
                fontWeight: TOKENS.fontWeights.bold,
                color: TOKENS.colors.accent,
                flexShrink: 0,
              }}>{v.apr}% · {v.lockPeriod}</span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}

function NavItem({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        background: 'transparent',
        border: 'none',
        padding: '8px 0',
        cursor: 'pointer',
        fontFamily: TOKENS.fonts.sans,
        fontSize: TOKENS.fontSizes.sm,
        fontWeight: active ? TOKENS.fontWeights.bold : TOKENS.fontWeights.medium,
        color: active ? TOKENS.colors.textOnDark : TOKENS.colors.gray500,
        borderBottom: `1px solid ${active ? TOKENS.colors.textOnDark : 'transparent'}`,
        transition: '120ms ease-out',
        letterSpacing: '0.01em',
      }}
    >
      {label}
    </button>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: TOKENS.fonts.mono,
      fontSize: TOKENS.fontSizes.xs,
      fontWeight: TOKENS.fontWeights.bold,
      letterSpacing: TOKENS.letterSpacing.display,
      textTransform: 'uppercase' as const,
      color: TOKENS.colors.gray500,
      borderLeft: `3px solid ${TOKENS.colors.accent}`,
      paddingLeft: TOKENS.spacing[3],
      marginBottom: TOKENS.spacing[2],
    }}>
      {children}
    </div>
  )
}
