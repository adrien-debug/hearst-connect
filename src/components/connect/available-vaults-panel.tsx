'use client'

import { TOKENS, fmtUsdCompact, LINE_HEIGHT, VALUE_LETTER_SPACING, MONO, CHART_PALETTE } from './constants'
import { formatVaultName } from './formatting'
import type { AvailableVault } from './data'
import { useSmartFit, useShellPadding, fitValue } from './smart-fit'
import type { SmartFitMode } from './smart-fit'
import { CockpitGauge } from './cockpit-gauge'

interface AvailableVaultsPanelProps {
  vaults: AvailableVault[]
  onVaultSelect: (vaultId: string) => void
  onBack?: () => void
}

export function AvailableVaultsPanel({ vaults, onVaultSelect }: AvailableVaultsPanelProps) {
  const { mode, isLimit } = useSmartFit({
    tightHeight: 880,
    limitHeight: 720,
    tightWidth: 1280,
    limitWidth: 1024,
    reserveHeight: 64,
    reserveWidth: 280,
  })
  const { padding: shellPadding, gap: shellGap } = useShellPadding(mode)

  // Get top 3 vaults for cockpit gauges (sorted by APR)
  const topVaults = [...vaults].sort((a, b) => b.apr - a.apr).slice(0, 3)
  const displayVaults = topVaults.length >= 3 ? topVaults : [...topVaults, ...Array(3 - topVaults.length).fill(null)]

  return (
    <div
      className="flex-1"
      suppressHydrationWarning
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent',
        overflow: 'hidden',
        fontFamily: TOKENS.fonts.sans,
        height: '100%',
        color: TOKENS.colors.textPrimary,
      }}
    >
      {/* COCKPIT HEADER — Same structure as dashboard */}
      <div
        style={{
          padding: fitValue(mode, {
            normal: `${shellPadding}px`,
            tight: `${shellPadding * 0.75}px`,
            limit: `${shellPadding * 0.5}px`,
          }),
          borderBottom: `1px solid ${TOKENS.colors.borderSubtle}`,
          flexShrink: 0,
          background: TOKENS.colors.bgApp,
        }}
      >
        {/* Top row — Context */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: TOKENS.spacing[3],
        }}>
          <div style={{
            fontFamily: MONO,
            fontSize: TOKENS.fontSizes.micro,
            color: TOKENS.colors.textGhost,
            letterSpacing: TOKENS.letterSpacing.display,
            textTransform: 'uppercase',
          }}>
            {vaults.length} Available
          </div>
        </div>

        {/* Main cockpit gauges — Top 3 vaults */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: fitValue(mode, {
            normal: 'repeat(3, 1fr)',
            tight: 'repeat(3, 1fr)',
            limit: '1fr',
          }),
          gap: fitValue(mode, {
            normal: TOKENS.spacing[6],
            tight: TOKENS.spacing[4],
            limit: TOKENS.spacing[3],
          }),
        }}>
          {displayVaults.map((vault, index) => (
            <CockpitGauge
              key={vault?.id || `empty-${index}`}
              label={vault ? formatVaultName(vault.name) : '—'}
              value={vault ? `${vault.apr}%` : '—'}
              valueCompact={vault ? `${vault.apr}%` : '—'}
              subtext={vault ? `${vault.target} target · ${vault.lockPeriod}` : 'No vault'}
              mode={mode}
              primary={index === 0}
              accent={index === 0}
              onClick={vault ? () => onVaultSelect(vault.id) : undefined}
              align="center"
            />
          ))}
        </div>
      </div>

      {/* Vault Cards Grid */}
      <div
        className="hide-scrollbar"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: shellPadding,
          gap: shellGap,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: fitValue(mode, {
            normal: 'repeat(2, 1fr)',
            tight: 'repeat(2, 1fr)',
            limit: '1fr',
          }),
          gap: TOKENS.spacing[4],
        }}>
          {vaults.map((vault, index) => (
            <AvailableVaultCard
              key={vault.id}
              vault={vault}
              index={index}
              mode={mode}
              onClick={() => onVaultSelect(vault.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface AvailableVaultCardProps {
  vault: AvailableVault
  index: number
  mode: SmartFitMode
  onClick: () => void
}

/** Risk pill color drawn from CHART_PALETTE so the available-vaults grid
 * stays visually consistent with the donut and timeline palettes. Indexes
 * follow the palette spec in constants.ts: 0=accent, 1=sky, 3=amber, 2=fuchsia. */
function riskColor(risk: string): string {
  const r = risk.toLowerCase()
  if (r.includes('very low')) return CHART_PALETTE[1]
  if (r === 'low') return CHART_PALETTE[0]
  if (r === 'medium') return CHART_PALETTE[3]
  if (r === 'high') return CHART_PALETTE[2]
  return TOKENS.colors.textGhost
}

function AvailableVaultCard({ vault, index, mode, onClick }: AvailableVaultCardProps) {
  const accentColor = CHART_PALETTE[index % CHART_PALETTE.length]
  const riskAccent = riskColor(vault.risk)

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
      style={{
        background: TOKENS.colors.black,
        borderRadius: TOKENS.radius.lg,
        padding: fitValue(mode, {
          normal: TOKENS.spacing[5],
          tight: TOKENS.spacing[4],
          limit: TOKENS.spacing[3],
        }),
        border: `1px solid ${TOKENS.colors.borderSubtle}`,
        cursor: 'pointer',
        transition: TOKENS.transitions.base,
        display: 'flex',
        flexDirection: 'column',
        gap: TOKENS.spacing[4],
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = accentColor
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = `0 8px 24px ${accentColor}1a`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = TOKENS.colors.borderSubtle
        e.currentTarget.style.transform = 'none'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Top accent bar */}
      <span style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: `linear-gradient(90deg, ${accentColor}, transparent)`,
      }} />

      {/* Header — name + APY */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: TOKENS.spacing[3],
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontSize: TOKENS.fontSizes.md,
            fontWeight: TOKENS.fontWeights.black,
            textTransform: 'uppercase',
            letterSpacing: VALUE_LETTER_SPACING,
            color: TOKENS.colors.textPrimary,
          }}>
            {vault.name}
          </div>
          {/* Risk + Lock pills */}
          <div style={{
            display: 'flex',
            gap: TOKENS.spacing[2],
            marginTop: TOKENS.spacing[2],
            flexWrap: 'wrap',
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: TOKENS.spacing[1],
              padding: `${TOKENS.spacing.half} ${TOKENS.spacing[2]}`,
              borderRadius: TOKENS.radius.full,
              background: `${riskAccent}1f`,
              border: `1px solid ${riskAccent}66`,
              fontFamily: MONO,
              fontSize: TOKENS.fontSizes.micro,
              fontWeight: TOKENS.fontWeights.bold,
              letterSpacing: TOKENS.letterSpacing.display,
              textTransform: 'uppercase',
              color: riskAccent,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: riskAccent }} />
              {vault.risk} risk
            </span>
            <span style={{
              padding: `${TOKENS.spacing.half} ${TOKENS.spacing[2]}`,
              borderRadius: TOKENS.radius.full,
              background: TOKENS.colors.bgTertiary,
              fontFamily: MONO,
              fontSize: TOKENS.fontSizes.micro,
              fontWeight: TOKENS.fontWeights.bold,
              letterSpacing: TOKENS.letterSpacing.display,
              textTransform: 'uppercase',
              color: TOKENS.colors.textSecondary,
            }}>
              {vault.lockPeriod}
            </span>
          </div>
        </div>
        {/* APY badge */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 0,
          flexShrink: 0,
        }}>
          <span style={{
            fontSize: fitValue(mode, {
              normal: TOKENS.fontSizes.xxl,
              tight: TOKENS.fontSizes.xl,
              limit: TOKENS.fontSizes.lg,
            }),
            fontWeight: TOKENS.fontWeights.black,
            letterSpacing: VALUE_LETTER_SPACING,
            color: accentColor,
            lineHeight: 1,
          }}>
            {vault.apr}%
          </span>
          <span style={{
            fontFamily: MONO,
            fontSize: TOKENS.fontSizes.micro,
            fontWeight: TOKENS.fontWeights.bold,
            letterSpacing: TOKENS.letterSpacing.display,
            textTransform: 'uppercase',
            color: TOKENS.colors.textGhost,
            marginTop: '2px',
          }}>
            APY · target {vault.target}
          </span>
        </div>
      </div>

      {/* Description */}
      {vault.description && (
        <p style={{
          margin: 0,
          fontSize: TOKENS.fontSizes.xs,
          color: TOKENS.colors.textSecondary,
          lineHeight: LINE_HEIGHT.body,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {vault.description}
        </p>
      )}

      {/* Footer stats — Min deposit + Fees + CTA */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: TOKENS.spacing[3],
        paddingTop: TOKENS.spacing[3],
        borderTop: `1px solid ${TOKENS.colors.borderSubtle}`,
        marginTop: 'auto',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing.half, minWidth: 0 }}>
          <span style={{
            fontFamily: MONO,
            fontSize: TOKENS.fontSizes.micro,
            fontWeight: TOKENS.fontWeights.bold,
            letterSpacing: TOKENS.letterSpacing.display,
            textTransform: 'uppercase',
            color: TOKENS.colors.textGhost,
          }}>
            Min · {fmtUsdCompact(vault.minDeposit)}
          </span>
          <span style={{
            fontSize: TOKENS.fontSizes.micro,
            color: TOKENS.colors.textGhost,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {vault.fees}
          </span>
        </div>
        <button style={{
          padding: `${TOKENS.spacing[2]} ${TOKENS.spacing[4]}`,
          background: TOKENS.colors.accent,
          border: 'none',
          borderRadius: TOKENS.radius.md,
          color: TOKENS.colors.black,
          fontFamily: TOKENS.fonts.sans,
          fontSize: TOKENS.fontSizes.xs,
          fontWeight: TOKENS.fontWeights.black,
          letterSpacing: TOKENS.letterSpacing.display,
          textTransform: 'uppercase',
          cursor: 'pointer',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}>
          Subscribe →
        </button>
      </div>
    </div>
  )
}
