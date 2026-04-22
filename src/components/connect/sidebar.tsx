'use client'

import { Label } from '@/components/ui/label'
import { TOKENS, fmtUsdCompact, LINE_HEIGHT, VALUE_LETTER_SPACING } from './constants'
import type { VaultLine, ActiveVault, AvailableVault } from './data'
import { getSidebarWidthPx, useSmartFit, useShellPadding, fitValue } from './smart-fit'
import { SIMULATION_VIEW_ID } from './view-ids'

interface SidebarProps {
  vaults: VaultLine[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function Sidebar({ vaults, selectedId, onSelect }: SidebarProps) {
  const { mode } = useSmartFit({
    tightHeight: 760,
    limitHeight: 680,
    reserveHeight: 64,
  })
  const sidebarW = getSidebarWidthPx(mode)
  const activeVaults = vaults
    .filter((v): v is ActiveVault => v.type === 'active')
    .sort((a, b) => b.deposited - a.deposited)
  const availableVaults = vaults.filter((v): v is AvailableVault => v.type === 'available')
  const isOverview = selectedId === null
  const { padding: shellPadding, gap: shellGap } = useShellPadding(mode)

  return (
    <aside
      id="connect-sidebar"
      className="flex h-full min-h-0 shrink-0 flex-col"
      style={{
        width: sidebarW,
        maxWidth: '100%',
        background: TOKENS.colors.bgSidebar,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRight: `1px solid ${TOKENS.colors.borderSubtle}`,
      }}
    >
      {/* Logo Section — Centered */}
      <div
        style={{
          padding: `${shellPadding}px`,
          borderBottom: `1px solid ${TOKENS.colors.borderSubtle}`,
          flexShrink: 0,
          background: TOKENS.colors.bgApp,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <img
          src="/logos/hearst-connect-blackbg.svg"
          alt="Hearst Connect"
          style={{
            height: fitValue(mode, { normal: '40px', tight: '36px', limit: '32px' }),
            width: 'auto',
            maxWidth: '160px',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Header — Back button or Title */}
      <div
        style={{
          padding: `${shellPadding}px`,
          borderBottom: `1px solid ${TOKENS.colors.borderSubtle}`,
          flexShrink: 0,
          background: TOKENS.colors.bgApp,
        }}
      >
        {!isOverview ? (
          <button
            type="button"
            onClick={() => onSelect(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: TOKENS.spacing[2],
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontFamily: TOKENS.fonts.mono,
              fontSize: TOKENS.fontSizes.xs,
              fontWeight: TOKENS.fontWeights.bold,
              letterSpacing: TOKENS.letterSpacing.display,
              textTransform: 'uppercase' as const,
              color: TOKENS.colors.accent,
            }}
          >
            <span>←</span>
            <span>Overview</span>
          </button>
        ) : (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}>
              <div>
                <Label id="sidebar-title" tone="sidebar" variant="text">
                  Portfolio
                </Label>
                <div
                  style={{
                    fontSize: fitValue(mode, {
                      normal: TOKENS.fontSizes.lg,
                      tight: TOKENS.fontSizes.md,
                      limit: TOKENS.fontSizes.md,
                    }),
                    fontWeight: TOKENS.fontWeights.black,
                    textTransform: 'uppercase',
                    letterSpacing: VALUE_LETTER_SPACING,
                    lineHeight: LINE_HEIGHT.tight,
                    color: TOKENS.colors.textPrimary,
                    marginTop: TOKENS.spacing[2],
                  }}
                >
                  Positions
                </div>
              </div>
              {/* Bouton Simulation */}
              <button
                type="button"
                onClick={() => onSelect(SIMULATION_VIEW_ID)}
                style={{
                  background: selectedId === SIMULATION_VIEW_ID
                    ? 'rgba(167,251,144,0.15)'
                    : 'rgba(0,0,0,0.3)',
                  border: selectedId === SIMULATION_VIEW_ID
                    ? `1px solid ${TOKENS.colors.accent}`
                    : `1px solid ${TOKENS.colors.borderSubtle}`,
                  borderRadius: '6px',
                  padding: `${TOKENS.spacing[2]} ${TOKENS.spacing[3]}`,
                  cursor: 'pointer',
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: TOKENS.fontSizes.micro,
                  fontWeight: TOKENS.fontWeights.bold,
                  letterSpacing: TOKENS.letterSpacing.display,
                  textTransform: 'uppercase' as const,
                  color: selectedId === SIMULATION_VIEW_ID
                    ? TOKENS.colors.accent
                    : TOKENS.colors.textSecondary,
                  lineHeight: 1,
                }}
              >
                Sim
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active Vaults — Container noir surfacé */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: `${shellPadding}px`,
        }}
        className="hide-scrollbar"
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: `${shellGap}px`,
          }}
        >
          {activeVaults.map((v) => (
            <VaultRow
              key={v.id}
              vault={v}
              selected={selectedId === v.id}
              onClick={() => onSelect(v.id)}
              mode={mode}
            />
          ))}
        </div>
      </div>

      {/* Available Section — Container distinct */}
      {availableVaults.length > 0 && (
        <div
          style={{
            flexShrink: 0,
            borderTop: `1px solid ${TOKENS.colors.borderSubtle}`,
            background: 'rgba(0,0,0,0.2)',
            padding: `${shellPadding}px`,
          }}
        >
          <Label id="sidebar-available" tone="sidebar" variant="text">
            Available ({availableVaults.length})
          </Label>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: `${TOKENS.spacing[2]}px`,
              marginTop: TOKENS.spacing[3],
            }}
          >
            {availableVaults.map((vault) => (
              <button
                key={vault.id}
                type="button"
                onClick={() => onSelect(vault.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: selectedId === vault.id
                    ? 'rgba(167,251,144,0.08)'
                    : 'rgba(0,0,0,0.2)',
                  border: selectedId === vault.id
                    ? `1px solid ${TOKENS.colors.accent}`
                    : `1px solid ${TOKENS.colors.borderSubtle}`,
                  borderRadius: '6px',
                  padding: `${TOKENS.spacing[2]} ${TOKENS.spacing[3]}`,
                  cursor: 'pointer',
                  boxShadow: selectedId === vault.id
                    ? `inset 0 0 0 1px ${TOKENS.colors.accent}`
                    : 'none',
                }}
              >
                <span
                  style={{
                    fontSize: TOKENS.fontSizes.xs,
                    fontWeight: TOKENS.fontWeights.black,
                    textTransform: 'uppercase',
                    letterSpacing: VALUE_LETTER_SPACING,
                    color: selectedId === vault.id
                      ? TOKENS.colors.textPrimary
                      : 'rgba(255,255,255,0.6)',
                  }}
                >
                  {vault.name.replace('HashVault ', '')}
                </span>
                <span
                  style={{
                    fontFamily: TOKENS.fonts.mono,
                    fontSize: TOKENS.fontSizes.xs,
                    fontWeight: TOKENS.fontWeights.bold,
                    color: selectedId === vault.id
                      ? TOKENS.colors.accent
                      : 'rgba(167,251,144,0.5)',
                  }}
                >
                  {vault.apr}%
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}

function VaultRow({
  vault,
  selected,
  onClick,
  mode,
}: {
  vault: ActiveVault
  selected: boolean
  onClick: () => void
  mode: 'normal' | 'tight' | 'limit'
}) {
  const currentValue = vault.deposited + vault.claimable

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: selected
          ? 'rgba(167,251,144,0.08)'
          : 'rgba(0,0,0,0.2)',
        border: selected
          ? `1px solid ${TOKENS.colors.accent}`
          : `1px solid ${TOKENS.colors.borderSubtle}`,
        borderRadius: '8px',
        padding: `${fitValue(mode, {
          normal: TOKENS.spacing[3],
          tight: TOKENS.spacing[3],
          limit: TOKENS.spacing[2],
        })}`,
        cursor: 'pointer',
        width: '100%',
        boxShadow: selected
          ? `inset 0 0 0 1px ${TOKENS.colors.accent}`
          : 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: TOKENS.spacing[2],
          minWidth: 0,
          flex: 1,
        }}
      >
        <span
          style={{
            fontSize: fitValue(mode, {
              normal: TOKENS.fontSizes.sm,
              tight: TOKENS.fontSizes.xs,
              limit: TOKENS.fontSizes.xs,
            }),
            fontWeight: TOKENS.fontWeights.black,
            textTransform: 'uppercase',
            letterSpacing: VALUE_LETTER_SPACING,
            color: selected
              ? TOKENS.colors.textPrimary
              : 'rgba(255,255,255,0.85)',
            lineHeight: LINE_HEIGHT.tight,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {vault.name.replace('HashVault ', '')}
        </span>
        <span
          style={{
            fontSize: fitValue(mode, {
              normal: TOKENS.fontSizes.md,
              tight: TOKENS.fontSizes.md,
              limit: TOKENS.fontSizes.sm,
            }),
            fontWeight: TOKENS.fontWeights.black,
            letterSpacing: VALUE_LETTER_SPACING,
            color: TOKENS.colors.textPrimary,
            lineHeight: LINE_HEIGHT.tight,
          }}
        >
          {fmtUsdCompact(currentValue)}
        </span>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <span
          style={{
            fontFamily: TOKENS.fonts.mono,
            fontSize: fitValue(mode, {
              normal: TOKENS.fontSizes.md,
              tight: TOKENS.fontSizes.sm,
              limit: TOKENS.fontSizes.sm,
            }),
            fontWeight: TOKENS.fontWeights.black,
            color: selected
              ? TOKENS.colors.accent
              : 'rgba(167,251,144,0.7)',
            letterSpacing: VALUE_LETTER_SPACING,
            lineHeight: LINE_HEIGHT.tight,
          }}
        >
          {vault.apr}%
        </span>
        <span
          style={{
            display: 'block',
            fontSize: TOKENS.fontSizes.micro,
            color: TOKENS.colors.textGhost,
            marginTop: TOKENS.spacing[2],
            letterSpacing: TOKENS.letterSpacing.display,
            textTransform: 'uppercase',
          }}
        >
          APY
        </span>
      </div>
    </button>
  )
}
