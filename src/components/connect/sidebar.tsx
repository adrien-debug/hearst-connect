'use client'

import { TOKENS, fmtUsdCompact } from './constants'
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
    .sort((a, b) => b.deposited - a.deposited)
  const primaryAvailableVault = vaults.find((v): v is AvailableVault => v.type === 'available') ?? null
  const isOverview = selectedId === null

  return (
    <aside
      id="connect-sidebar"
      className="flex h-full min-h-0 flex-col shrink-0"
      style={{
        width: '360px',
        background: TOKENS.colors.black,
        borderRight: `${TOKENS.borders.thin} solid rgba(255,255,255,0.12)`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{
        padding: `${TOKENS.spacing[6]} ${TOKENS.spacing[8]} ${TOKENS.spacing[4]}`,
        borderBottom: `1px solid rgba(255,255,255,0.12)`,
        flexShrink: 0,
      }}>
        <SectionLabel>Register</SectionLabel>
        <button
          type="button"
          onClick={() => onSelect(null)}
          style={{
            width: '100%',
            background: isOverview ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
            border: `${TOKENS.borders.thin} solid ${isOverview ? TOKENS.colors.accent : 'rgba(255,255,255,0.16)'}`,
            padding: `${TOKENS.spacing[4]} ${TOKENS.spacing[4]}`,
            cursor: 'pointer',
            textAlign: 'left',
            transition: '120ms ease-out',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: TOKENS.spacing[4] }}>
            <div>
              <div style={{
                fontFamily: TOKENS.fonts.sans,
                fontSize: TOKENS.fontSizes.sm,
                fontWeight: TOKENS.fontWeights.black,
                textTransform: 'uppercase',
                color: TOKENS.colors.textOnDark,
                marginBottom: '2px',
              }}>
                Portfolio Overview
              </div>
              <div style={{
                fontFamily: TOKENS.fonts.mono,
                fontSize: TOKENS.fontSizes.xs,
                fontWeight: TOKENS.fontWeights.bold,
                color: isOverview ? TOKENS.colors.accent : 'rgba(255,255,255,0.55)',
                letterSpacing: TOKENS.letterSpacing.wide,
              }}>
                {fmtUsdCompact(agg.totalDeposited + agg.totalClaimable)} value
              </div>
            </div>
            <div style={{
              fontFamily: TOKENS.fonts.mono,
              fontSize: TOKENS.fontSizes.xs,
              fontWeight: TOKENS.fontWeights.bold,
              letterSpacing: TOKENS.letterSpacing.display,
              textTransform: 'uppercase',
              color: isOverview ? TOKENS.colors.accent : TOKENS.colors.textOnDark,
              whiteSpace: 'nowrap',
            }}>
              {isOverview ? 'Current View' : 'Open'}
            </div>
          </div>
        </button>
      </div>

      <div style={{
        flex: 1,
        overflow: 'hidden',
        padding: `${TOKENS.spacing[6]} ${TOKENS.spacing[8]}`,
        minHeight: 0,
        borderBottom: `1px solid rgba(255,255,255,0.12)`,
      }}>
        <SectionLabel>Active Positions</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[6] }}>
          {activeVaults.map(v => {
            const isSel = selectedId === v.id
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => onSelect(v.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  background: isSel ? 'rgba(255,255,255,0.08)' : 'transparent',
                  border: `${TOKENS.borders.thin} solid ${isSel ? TOKENS.colors.accent : 'rgba(255,255,255,0.12)'}`,
                  padding: `${TOKENS.spacing[3]} ${TOKENS.spacing[4]}`,
                  cursor: 'pointer',
                  transition: '120ms ease-out',
                  boxShadow: isSel ? `inset 0 0 0 1px ${TOKENS.colors.accent}` : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: TOKENS.spacing[4] }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontFamily: TOKENS.fonts.sans,
                      fontSize: TOKENS.fontSizes.sm,
                      fontWeight: TOKENS.fontWeights.black,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: TOKENS.colors.textOnDark,
                      marginBottom: '4px',
                    }}>{v.name}</div>
                  </div>
                  <span style={{
                    fontFamily: TOKENS.fonts.mono,
                    fontSize: TOKENS.fontSizes.xs,
                    fontWeight: TOKENS.fontWeights.bold,
                    textTransform: 'uppercase',
                    letterSpacing: TOKENS.letterSpacing.wide,
                    color: isSel ? TOKENS.colors.accent : 'rgba(255,255,255,0.55)',
                    whiteSpace: 'nowrap',
                  }}>
                    {v.progress}%
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: TOKENS.spacing[3], marginTop: TOKENS.spacing[3] }}>
                  <RegisterMetric label="Current Value" value={fmtUsdCompact(v.deposited)} />
                  <RegisterMetric label="Available Yield" value={fmtUsdCompact(v.claimable)} accent />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {primaryAvailableVault && (
        <div style={{
          padding: `${TOKENS.spacing[6]} ${TOKENS.spacing[8]} ${TOKENS.spacing[6]}`,
          borderTop: `1px solid rgba(255,255,255,0.12)`,
          background: `linear-gradient(180deg, rgba(255,255,255,0) 0%, ${TOKENS.colors.accentDim} 100%)`,
          flexShrink: 0,
        }}>
          <SectionLabel>Available Vault</SectionLabel>
          <button
            type="button"
            onClick={() => onSelect(primaryAvailableVault.id)}
            style={{
              width: '100%',
              background: selectedId === primaryAvailableVault.id ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
              border: `${TOKENS.borders.thin} solid ${selectedId === primaryAvailableVault.id ? TOKENS.colors.accent : 'rgba(255,255,255,0.16)'}`,
              padding: TOKENS.spacing[4],
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{
              fontFamily: TOKENS.fonts.sans,
              fontSize: TOKENS.fontSizes.sm,
              fontWeight: TOKENS.fontWeights.black,
              textTransform: 'uppercase',
              color: TOKENS.colors.textOnDark,
              marginBottom: TOKENS.spacing[2],
            }}>
              {primaryAvailableVault.name}
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: TOKENS.spacing[3],
              fontFamily: TOKENS.fonts.mono,
              fontSize: TOKENS.fontSizes.xs,
              fontWeight: TOKENS.fontWeights.bold,
              color: TOKENS.colors.accent,
            }}>
              <span>{primaryAvailableVault.apr}% APY</span>
              <span>Min. {fmtUsdCompact(primaryAvailableVault.minDeposit)}</span>
            </div>
          </button>
        </div>
      )}
    </aside>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: TOKENS.fonts.mono,
      fontSize: TOKENS.fontSizes.xs,
      fontWeight: TOKENS.fontWeights.bold,
      letterSpacing: TOKENS.letterSpacing.display,
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.45)',
      marginBottom: TOKENS.spacing[4],
      display: 'flex',
      alignItems: 'center',
      gap: TOKENS.spacing[3],
    }}>
      {children}
      <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.12)' }} />
    </div>
  )
}

function RegisterMetric({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div>
      <div style={{
        fontFamily: TOKENS.fonts.mono,
        fontSize: TOKENS.fontSizes.xs,
        fontWeight: TOKENS.fontWeights.bold,
        letterSpacing: TOKENS.letterSpacing.display,
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.45)',
        marginBottom: TOKENS.spacing[2],
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: TOKENS.fonts.sans,
        fontSize: TOKENS.fontSizes.sm,
        fontWeight: TOKENS.fontWeights.black,
        color: accent ? TOKENS.colors.accent : TOKENS.colors.textOnDark,
      }}>
        {value}
      </div>
    </div>
  )
}
