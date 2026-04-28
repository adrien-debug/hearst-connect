'use client'

import { TOKENS, VALUE_LETTER_SPACING, LINE_HEIGHT } from './constants'
import { formatVaultName } from './formatting'
import type { AvailableVault } from './data'
import { useSmartFit, useShellPadding, fitValue } from './smart-fit'
import { StepProgress } from './invest/step-progress'

interface AvailableVaultsPanelProps {
  vaults: AvailableVault[]
  onVaultSelect: (vaultId: string) => void
}

/** Maps risk string → display color token (accent for low/very-low, grey ladder
 * for higher risk). Exported for legacy usages. */
export function riskColor(risk: string): string {
  const r = risk.toLowerCase()
  if (r.includes('very low') || r === 'low') return TOKENS.colors.accent
  if (r === 'medium' || r === 'moderate') return TOKENS.colors.textGhost
  if (r === 'high' || r === 'growth') return TOKENS.colors.textSecondary
  return TOKENS.colors.textGhost
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
      <h1 className="sr-only">Invest — Select a product</h1>

      {/* Wizard progress + intro */}
      <div
        style={{
          padding: fitValue(mode, {
            normal: 'var(--space-6)',
            tight: 'var(--space-4)',
            limit: 'var(--space-3)',
          }),
          borderBottom: `${TOKENS.borders.thin} solid ${TOKENS.colors.borderSubtle}`,
          background: TOKENS.colors.black,
          display: 'flex',
          flexDirection: 'column',
          gap: TOKENS.spacing[4],
          flexShrink: 0,
        }}
      >
        <StepProgress active="select" />
      </div>

      {/* Cards grid */}
      <div
        className="hide-scrollbar"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: shellPadding,
          gap: shellGap,
          minHeight: 0,
          overflow: 'auto',
        }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: isLimit ? '1fr' : 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: shellGap,
        }}>
          {vaults.length === 0 ? (
            <div
              style={{
                gridColumn: '1 / -1',
                padding: TOKENS.spacing[8],
                textAlign: 'center',
                color: TOKENS.colors.textGhost,
                fontSize: TOKENS.fontSizes.sm,
                fontFamily: TOKENS.fonts.mono,
                border: `${TOKENS.borders.thin} dashed ${TOKENS.colors.borderSubtle}`,
                borderRadius: TOKENS.radius.lg,
              }}
            >
              No products available right now.
            </div>
          ) : (
            vaults.map((vault) => (
              <ProductSelectCard
                key={vault.id}
                vault={vault}
                onClick={() => onVaultSelect(vault.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

/** ProductSelectCard — Step 1 card for picking a product (Prime or Growth).
 * Mirrors the Hearst Connect Invest mockups: LIVE pill, title, big APY,
 * description paragraph, key info row (lock / min deposit / risk) and a
 * single "Select →" CTA. */
function ProductSelectCard({
  vault,
  onClick,
}: {
  vault: AvailableVault
  onClick: () => void
}) {
  return (
    <div
      style={{
        background: TOKENS.colors.black,
        border: `${TOKENS.borders.thin} solid ${TOKENS.colors.borderSubtle}`,
        borderRadius: TOKENS.radius.lg,
        padding: TOKENS.spacing[6],
        display: 'flex',
        flexDirection: 'column',
        gap: TOKENS.spacing[4],
      }}
    >
      {/* LIVE pill */}
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: TOKENS.spacing[2],
        padding: `${TOKENS.spacing.half} ${TOKENS.spacing[3]}`,
        background: TOKENS.colors.accentSubtle,
        border: `${TOKENS.borders.thin} solid ${TOKENS.colors.accent}`,
        borderRadius: TOKENS.radius.full,
        fontFamily: TOKENS.fonts.mono,
        fontSize: TOKENS.fontSizes.micro,
        fontWeight: TOKENS.fontWeights.bold,
        letterSpacing: TOKENS.letterSpacing.display,
        textTransform: 'uppercase',
        color: TOKENS.colors.accent,
        width: 'fit-content',
      }}>
        <span style={{
          width: TOKENS.dot.sm,
          height: TOKENS.dot.sm,
          borderRadius: TOKENS.radius.full,
          background: TOKENS.colors.accent,
        }} />
        Live
      </span>

      {/* Title + APY headline */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: TOKENS.spacing[3], flexWrap: 'wrap' }}>
        <h2 style={{
          margin: 0,
          fontSize: TOKENS.fontSizes.xl,
          fontWeight: TOKENS.fontWeights.black,
          color: TOKENS.colors.textPrimary,
          letterSpacing: TOKENS.letterSpacing.tight,
        }}>
          {formatVaultName(vault.name)}
        </h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: TOKENS.spacing[2] }}>
        <span style={{
          fontSize: TOKENS.fontSizes.xxxl,
          fontWeight: TOKENS.fontWeights.black,
          color: TOKENS.colors.accent,
          letterSpacing: VALUE_LETTER_SPACING,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: LINE_HEIGHT.tight,
        }}>
          {vault.apr}
        </span>
        <span style={{
          fontFamily: TOKENS.fonts.mono,
          fontSize: TOKENS.fontSizes.micro,
          fontWeight: TOKENS.fontWeights.bold,
          letterSpacing: TOKENS.letterSpacing.display,
          textTransform: 'uppercase',
          color: TOKENS.colors.textGhost,
        }}>
          % APY
        </span>
      </div>

      {/* Description */}
      <p style={{
        margin: 0,
        fontSize: TOKENS.fontSizes.sm,
        color: TOKENS.colors.textSecondary,
        lineHeight: LINE_HEIGHT.body,
      }}>
        {vault.description ?? vault.strategy}
      </p>

      {/* Key info row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: TOKENS.spacing[4],
        marginTop: TOKENS.spacing[2],
        paddingTop: TOKENS.spacing[4],
        borderTop: `${TOKENS.borders.thin} solid ${TOKENS.colors.borderSubtle}`,
      }}>
        <KeyCell label="Lock"        value={vault.lockPeriod} />
        <KeyCell label="Min deposit" value={`$${formatCompactDollar(vault.minDeposit)}`} />
        <KeyCell label="Risk"        value={vault.risk} accent={riskColor(vault.risk)} />
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onClick}
        style={{
          marginTop: TOKENS.spacing[2],
          padding: `${TOKENS.spacing[3]} ${TOKENS.spacing[5]}`,
          background: TOKENS.colors.accentSubtle,
          color: TOKENS.colors.accent,
          border: `${TOKENS.borders.thin} solid ${TOKENS.colors.accent}`,
          borderRadius: TOKENS.radius.md,
          fontFamily: TOKENS.fonts.mono,
          fontSize: TOKENS.fontSizes.sm,
          fontWeight: TOKENS.fontWeights.black,
          letterSpacing: TOKENS.letterSpacing.display,
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'background var(--transition-fast)',
        }}
      >
        Select →
      </button>
    </div>
  )
}

function KeyCell({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing.half, minWidth: 0 }}>
      <span style={{
        fontFamily: TOKENS.fonts.mono,
        fontSize: TOKENS.fontSizes.micro,
        fontWeight: TOKENS.fontWeights.bold,
        letterSpacing: TOKENS.letterSpacing.display,
        textTransform: 'uppercase',
        color: TOKENS.colors.textGhost,
      }}>
        {label}
      </span>
      <span style={{
        fontSize: TOKENS.fontSizes.sm,
        fontWeight: TOKENS.fontWeights.black,
        color: accent ?? TOKENS.colors.textPrimary,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </span>
    </div>
  )
}

function formatCompactDollar(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return n.toLocaleString('en-US')
}
