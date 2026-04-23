'use client'

import { TOKENS, fmtUsdCompact, LINE_HEIGHT, VALUE_LETTER_SPACING } from './constants'
import type { ActiveVault } from './data'
import { fitValue, type SmartFitMode } from './smart-fit'

interface VaultCardProps {
  vault: ActiveVault
  index: number
  total: number
  mode: SmartFitMode
  onClick?: () => void
}

const palette = [TOKENS.colors.accent, TOKENS.colors.white, 'rgba(255,255,255,0.45)', 'rgba(255,255,255,0.35)', 'rgba(255,255,255,0.25)']

export function VaultCard({ vault, index, total, mode, onClick }: VaultCardProps) {
  const allocationPct = total > 0 ? (vault.deposited / total) * 100 : 0
  const color = palette[index % palette.length]

  // Derived metrics
  const yieldProgress = vault.deposited > 0 ? (vault.claimable / vault.deposited) * 100 : 0
  const daysToMaturity = Math.max(0, Math.ceil((new Date(vault.maturity).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
  const canWithdraw = vault.progress >= 100 && daysToMaturity <= 0

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
      style={{
        background: TOKENS.colors.black,
        borderRadius: TOKENS.radius.lg,
        padding: fitValue(mode, {
          normal: TOKENS.spacing[4],
          tight: TOKENS.spacing[3],
          limit: TOKENS.spacing[3],
        }),
        border: `1px solid ${TOKENS.colors.borderSubtle}`,
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 120ms ease-out',
        outline: 'none',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = TOKENS.colors.borderStrong
          e.currentTarget.style.background = TOKENS.colors.bgTertiary
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = TOKENS.colors.borderSubtle
        e.currentTarget.style.background = TOKENS.colors.black
      }}
    >
        {/* Top accent line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: color,
        borderRadius: `${TOKENS.radius.lg} ${TOKENS.radius.lg} 0 0`,
      }} />

      {/* Header: Name + Badges + Value */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: TOKENS.spacing[3],
        marginTop: TOKENS.spacing[2],
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[2] }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: TOKENS.spacing[2],
          }}>
            <div style={{
              fontSize: TOKENS.fontSizes.sm,
              fontWeight: TOKENS.fontWeights.black,
              color: TOKENS.colors.textPrimary,
              textTransform: 'uppercase',
              letterSpacing: VALUE_LETTER_SPACING,
            }}>
              {vault.name}
            </div>
            {/* Status badges */}
            {vault.progress >= 100 && (
              <span style={{
                padding: '2px 6px',
                background: TOKENS.colors.accentSubtle,
                borderRadius: '4px',
                fontSize: TOKENS.fontSizes.micro,
                fontWeight: TOKENS.fontWeights.bold,
                color: TOKENS.colors.accent,
                letterSpacing: TOKENS.letterSpacing.display,
                textTransform: 'uppercase',
              }}>
                Target Reached
              </span>
            )}
            {daysToMaturity < 30 && daysToMaturity > 0 && (
              <span style={{
                padding: '2px 6px',
                background: TOKENS.colors.accentSubtle,
                borderRadius: '4px',
                fontSize: TOKENS.fontSizes.micro,
                fontWeight: TOKENS.fontWeights.bold,
                color: TOKENS.colors.accent,
                letterSpacing: TOKENS.letterSpacing.display,
                textTransform: 'uppercase',
              }}>
                Expiring Soon
              </span>
            )}
          </div>
          <div style={{
            fontSize: TOKENS.fontSizes.xs,
            fontWeight: TOKENS.fontWeights.bold,
            color: TOKENS.colors.textSecondary,
          }}>
            {vault.target} target · {vault.apr}% APY
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: fitValue(mode, { normal: TOKENS.fontSizes.lg, tight: TOKENS.fontSizes.md, limit: TOKENS.fontSizes.md }),
            fontWeight: TOKENS.fontWeights.black,
            letterSpacing: VALUE_LETTER_SPACING,
            color: TOKENS.colors.textPrimary,
          }}>
            {fmtUsdCompact(vault.deposited)}
          </div>
          <div style={{
            fontSize: TOKENS.fontSizes.micro,
            fontWeight: TOKENS.fontWeights.bold,
            color: TOKENS.colors.textGhost,
            letterSpacing: TOKENS.letterSpacing.display,
          }}>
            {allocationPct.toFixed(1)}% ALLOC
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: TOKENS.spacing[3],
        padding: `${TOKENS.spacing[3]} 0`,
        borderTop: `1px solid ${TOKENS.colors.borderSubtle}`,
        borderBottom: `1px solid ${TOKENS.colors.borderSubtle}`,
        marginBottom: TOKENS.spacing[3],
      }}>
        {/* Accrued Yield */}
        <div>
          <div style={{
            fontSize: TOKENS.fontSizes.micro,
            fontWeight: TOKENS.fontWeights.bold,
            letterSpacing: TOKENS.letterSpacing.display,
            textTransform: 'uppercase',
            color: TOKENS.colors.textGhost,
            marginBottom: TOKENS.spacing[2],
          }}>
            Accrued Yield
          </div>
          <div style={{
            fontSize: TOKENS.fontSizes.md,
            fontWeight: TOKENS.fontWeights.black,
            color: TOKENS.colors.accent,
          }}>
            +{fmtUsdCompact(vault.claimable)}
          </div>
          <div style={{
            fontSize: TOKENS.fontSizes.micro,
            color: TOKENS.colors.textGhost,
            marginTop: TOKENS.spacing[2],
          }}>
            {yieldProgress.toFixed(1)}% of deposit
          </div>
        </div>

        {/* Progress to Target */}
        <div>
          <div style={{
            fontSize: TOKENS.fontSizes.micro,
            fontWeight: TOKENS.fontWeights.bold,
            letterSpacing: TOKENS.letterSpacing.display,
            textTransform: 'uppercase',
            color: TOKENS.colors.textGhost,
            marginBottom: TOKENS.spacing[2],
          }}>
            Progress
          </div>
          <div style={{
            fontSize: TOKENS.fontSizes.md,
            fontWeight: TOKENS.fontWeights.black,
            color: vault.progress >= 100 ? TOKENS.colors.accent : TOKENS.colors.textPrimary,
          }}>
            {vault.progress}%
          </div>
          <div style={{
            width: '100%',
            height: '3px',
            background: TOKENS.colors.black,
            marginTop: TOKENS.spacing[2],
            borderRadius: '2px',
          }}>
            <div style={{
              width: `${Math.min(100, vault.progress)}%`,
              height: '100%',
              background: vault.progress >= 100 ? TOKENS.colors.accent : color,
              borderRadius: '2px',
            }} />
          </div>
        </div>

        {/* Exit status / unlock timeline */}
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: TOKENS.fontSizes.micro,
            fontWeight: TOKENS.fontWeights.bold,
            letterSpacing: TOKENS.letterSpacing.display,
            textTransform: 'uppercase',
            color: TOKENS.colors.textGhost,
            marginBottom: TOKENS.spacing[2],
          }}>
            {canWithdraw ? 'Status' : 'Unlock Timeline'}
          </div>
          <div style={{
            fontSize: TOKENS.fontSizes.sm,
            fontWeight: TOKENS.fontWeights.black,
            color: canWithdraw ? TOKENS.colors.accent : TOKENS.colors.textPrimary,
          }}>
            {canWithdraw ? 'Ready' : `${daysToMaturity}d`}
          </div>
          <div style={{
            fontSize: TOKENS.fontSizes.micro,
            color: TOKENS.colors.textGhost,
            marginTop: TOKENS.spacing[2],
          }}>
            {canWithdraw ? 'Position ready for exit' : vault.maturity}
          </div>
        </div>
      </div>

      {/* Actions Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* Left: Strategy tag */}
        <div style={{
          fontSize: TOKENS.fontSizes.micro,
          fontWeight: TOKENS.fontWeights.bold,
          color: TOKENS.colors.textGhost,
          letterSpacing: TOKENS.letterSpacing.display,
          textTransform: 'uppercase',
        }}>
          {vault.strategy}
        </div>

        {/* Right: Actions */}
        <div style={{
          display: 'flex',
          gap: TOKENS.spacing[2],
        }}>
          {vault.claimable > 0 && (
            <button style={{
              padding: `${TOKENS.spacing[2]} ${TOKENS.spacing[3]}`,
              background: TOKENS.colors.accentSubtle,
              border: `1px solid ${TOKENS.colors.accent}`,
              borderRadius: TOKENS.radius.sm,
              color: TOKENS.colors.accent,
              fontSize: TOKENS.fontSizes.micro,
              fontWeight: TOKENS.fontWeights.bold,
              textTransform: 'uppercase',
              letterSpacing: TOKENS.letterSpacing.display,
              cursor: 'pointer',
            }}>
              Claim
            </button>
          )}
          <button style={{
            padding: `${TOKENS.spacing[2]} ${TOKENS.spacing[3]}`,
            background: 'transparent',
            border: `1px solid ${TOKENS.colors.borderSubtle}`,
            borderRadius: TOKENS.radius.sm,
            color: TOKENS.colors.textSecondary,
            fontSize: TOKENS.fontSizes.micro,
            fontWeight: TOKENS.fontWeights.bold,
            textTransform: 'uppercase',
            letterSpacing: TOKENS.letterSpacing.display,
            cursor: 'pointer',
          }}>
            Manage
          </button>
        </div>
      </div>
    </div>
  )
}
