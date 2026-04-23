'use client'

import { TOKENS, fmtUsdCompact, VALUE_LETTER_SPACING } from './constants'
import type { ActiveVault } from './data'
import type { SmartFitMode } from './smart-fit'

interface VaultCardCompactProps {
  vault: ActiveVault
  index: number
  total: number
  mode: SmartFitMode
  onClick?: () => void
}

const palette = [TOKENS.colors.accent, TOKENS.colors.white, 'rgba(255,255,255,0.45)', 'rgba(255,255,255,0.35)']

export function VaultCardCompact({ vault, index, total, mode, onClick }: VaultCardCompactProps) {
  const color = palette[index % palette.length]
  const daysToMaturity = Math.max(0, Math.ceil((new Date(vault.maturity).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
      style={{
        background: TOKENS.colors.black,
        borderRadius: TOKENS.radius.md,
        padding: mode === 'limit' ? '10px 12px' : '12px 14px',
        border: `1px solid ${TOKENS.colors.borderSubtle}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 120ms ease-out',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
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
      {/* Color dot */}
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
      }} />

      {/* Main content */}
      <div style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{
            fontSize: mode === 'limit' ? '11px' : '12px',
            fontWeight: TOKENS.fontWeights.black,
            color: TOKENS.colors.textPrimary,
            textTransform: 'uppercase',
            letterSpacing: VALUE_LETTER_SPACING,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {vault.name.replace('HashVault ', '')}
          </span>
          <span style={{
            fontSize: '12px',
            fontWeight: TOKENS.fontWeights.black,
            color: TOKENS.colors.textPrimary,
            letterSpacing: VALUE_LETTER_SPACING,
            flexShrink: 0,
          }}>
            {fmtUsdCompact(vault.deposited + vault.claimable)}
          </span>
        </div>

        {/* Progress bar inline */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{
            flex: 1,
            height: '2px',
            background: TOKENS.colors.bgTertiary,
            borderRadius: '1px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${Math.min(100, vault.progress)}%`,
              height: '100%',
              background: vault.progress >= 100 ? TOKENS.colors.accent : color,
              borderRadius: '1px',
            }} />
          </div>
          <span style={{
            fontSize: '10px',
            fontWeight: TOKENS.fontWeights.bold,
            color: TOKENS.colors.textGhost,
            letterSpacing: '0.1em',
            flexShrink: 0,
          }}>
            {vault.progress}%
          </span>
          <span style={{
            fontSize: '10px',
            color: daysToMaturity < 30 ? TOKENS.colors.accent : TOKENS.colors.textGhost,
            flexShrink: 0,
          }}>
            · {daysToMaturity}d
          </span>
        </div>
      </div>

      {/* Mini yield indicator */}
      <div style={{
        textAlign: 'right',
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: '10px',
          fontWeight: TOKENS.fontWeights.bold,
          color: TOKENS.colors.accent,
        }}>
          +{fmtUsdCompact(vault.claimable)}
        </span>
      </div>
    </div>
  )
}
