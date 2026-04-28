'use client'

import { TOKENS, VALUE_LETTER_SPACING, LINE_HEIGHT, CHART_PALETTE } from '../constants'
import { formatVaultName } from '../formatting'
import type { AvailableVault } from '../data'
import type { VaultConfig } from '@/types/vault'
import { fmtUsdCompact } from '../constants'

interface StepProductProps {
  vault: AvailableVault
  vaultConfig: VaultConfig | null
  onContinue: () => void
}

/** Step 2 — Product overview. Mirrors the Hearst Connect Invest mockup:
 * Title + APY hero, KEY TERMS table left, STRATEGY POCKETS donut + legend
 * right, capital recovery mechanism box, Continue button. */
export function StepProduct({ vault, vaultConfig, onContinue }: StepProductProps) {
  const lockMonths = Math.round((vaultConfig?.lockPeriodDays ?? 365) / 30)
  const cumulativeTarget = vaultConfig?.cumulativeTarget ?? (parseFloat(vault.target.replace('%', '')) || 0)
  const composition = vaultConfig?.composition ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[4] }}>
      <ProductCard vault={vault} vaultConfig={vaultConfig} cumulativeTarget={cumulativeTarget} composition={composition} lockMonths={lockMonths} />

      {/* Capital recovery mechanism box */}
      <div
        style={{
          padding: TOKENS.spacing[4],
          background: TOKENS.colors.accentSubtle,
          border: `${TOKENS.borders.thin} solid ${TOKENS.colors.accent}`,
          borderRadius: TOKENS.radius.md,
          display: 'flex',
          flexDirection: 'column',
          gap: TOKENS.spacing[2],
        }}
      >
        <h3 style={{
          margin: 0,
          fontSize: TOKENS.fontSizes.sm,
          fontWeight: TOKENS.fontWeights.black,
          color: TOKENS.colors.accent,
        }}>
          Capital recovery mechanism
        </h3>
        <p style={{
          margin: 0,
          fontSize: TOKENS.fontSizes.xs,
          color: TOKENS.colors.textSecondary,
          lineHeight: LINE_HEIGHT.body,
        }}>
          If the vault&rsquo;s principal is below the initial deposit at maturity,
          Hearst Connect mining infrastructure continues to operate on behalf of the
          vault for up to {vaultConfig?.capitalRecoveryYears ?? 2} additional years,
          with output directed exclusively toward restoring the original capital base.
        </p>
      </div>

      {/* Continue button */}
      <button
        type="button"
        onClick={onContinue}
        style={{
          alignSelf: 'flex-end',
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
        }}
      >
        Continue to deposit →
      </button>
    </div>
  )
}

function ProductCard({
  vault,
  vaultConfig,
  cumulativeTarget,
  composition,
  lockMonths,
}: {
  vault: AvailableVault
  vaultConfig: VaultConfig | null
  cumulativeTarget: number
  composition: Array<{ label: string; pct: number }>
  lockMonths: number
}) {
  return (
    <div style={{
      background: TOKENS.colors.black,
      border: `${TOKENS.borders.thin} solid ${TOKENS.colors.borderSubtle}`,
      borderRadius: TOKENS.radius.lg,
      padding: TOKENS.spacing[6],
      display: 'flex',
      flexDirection: 'column',
      gap: TOKENS.spacing[4],
    }}>
      {/* Header — LIVE pill + Title + APY */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: TOKENS.spacing[4], flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[2], minWidth: 0 }}>
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
              width: TOKENS.dot.sm, height: TOKENS.dot.sm, borderRadius: TOKENS.radius.full, background: TOKENS.colors.accent,
            }} />
            Live
          </span>
          <h2 style={{
            margin: 0,
            fontSize: TOKENS.fontSizes.xl,
            fontWeight: TOKENS.fontWeights.black,
            color: TOKENS.colors.textPrimary,
            letterSpacing: TOKENS.letterSpacing.tight,
          }}>
            {formatVaultName(vault.name)}
          </h2>
          {(vault.description ?? vault.strategy) && (
            <p style={{
              margin: 0,
              fontSize: TOKENS.fontSizes.sm,
              color: TOKENS.colors.textSecondary,
              lineHeight: LINE_HEIGHT.body,
            }}>
              {vault.description ?? vault.strategy}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: TOKENS.spacing[2], flexShrink: 0 }}>
          <span style={{
            fontSize: TOKENS.fontSizes.xxxl,
            fontWeight: TOKENS.fontWeights.black,
            color: TOKENS.colors.accent,
            letterSpacing: VALUE_LETTER_SPACING,
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
      </div>

      {/* Body — KEY TERMS left, STRATEGY POCKETS right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: TOKENS.spacing[6],
        marginTop: TOKENS.spacing[2],
        paddingTop: TOKENS.spacing[4],
        borderTop: `${TOKENS.borders.thin} solid ${TOKENS.colors.borderSubtle}`,
      }}>
        {/* KEY TERMS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[3] }}>
          <SectionLabel>Key terms</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[2] }}>
            <TermRow label="Target APY"        value={`${vault.apr}%`} />
            <TermRow label="Cumulative target" value={`${cumulativeTarget}%`} accent />
            <TermRow label="Lock period"       value={`${lockMonths} months (${(lockMonths / 12).toFixed(0)} years)`} />
            <TermRow label="Minimum deposit"   value={`$${formatPlainDollar(vault.minDeposit)}`} />
            <TermRow label="Deposit token"     value={vault.token ?? 'USDC'} mono />
            <TermRow label="Network"           value={vaultConfig?.chain?.name ?? 'Base'} />
            <TermRow label="Yield distribution" value="Daily" />
            <TermRow label="Withdraw condition" value={`${cumulativeTarget}% target or ${(lockMonths / 12).toFixed(0)}-year maturity`} />
            <TermRow label="Custody"           value={vaultConfig?.custodian ?? 'Audited — institutional'} />
            <TermRow label="Fees"              value={vault.fees ?? '—'} />
          </div>
        </div>

        {/* STRATEGY POCKETS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[3] }}>
          <SectionLabel>Strategy pockets</SectionLabel>
          {composition.length > 0 ? (
            <CompositionDonut composition={composition} />
          ) : (
            <p style={{ margin: 0, fontSize: TOKENS.fontSizes.sm, color: TOKENS.colors.textGhost }}>
              No composition data.
            </p>
          )}
          <p style={{
            margin: 0,
            fontSize: TOKENS.fontSizes.xs,
            color: TOKENS.colors.textSecondary,
            lineHeight: LINE_HEIGHT.body,
          }}>
            These are the <span style={{ color: TOKENS.colors.textPrimary, fontWeight: TOKENS.fontWeights.bold }}>baseline weights</span>.
            Automated controls continuously rebalance exposures and tilt weights toward defensive
            strategies during downturns.
          </p>
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-block',
      fontFamily: TOKENS.fonts.mono,
      fontSize: TOKENS.fontSizes.micro,
      fontWeight: TOKENS.fontWeights.bold,
      letterSpacing: TOKENS.letterSpacing.display,
      textTransform: 'uppercase',
      color: TOKENS.colors.textGhost,
      borderLeft: `var(--dashboard-card-border-accent-width) solid ${TOKENS.colors.borderStrong}`,
      paddingLeft: TOKENS.spacing[3],
    }}>
      {children}
    </span>
  )
}

function TermRow({ label, value, mono, accent }: { label: string; value: string; mono?: boolean; accent?: boolean }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: TOKENS.spacing[3],
      paddingBlock: TOKENS.spacing[1],
      borderBottom: `${TOKENS.borders.thin} solid ${TOKENS.colors.borderSubtle}`,
    }}>
      <span style={{
        fontSize: TOKENS.fontSizes.xs,
        color: TOKENS.colors.textGhost,
        fontFamily: TOKENS.fonts.mono,
        textTransform: 'uppercase',
        letterSpacing: TOKENS.letterSpacing.display,
      }}>
        {label}
      </span>
      <span style={{
        fontSize: TOKENS.fontSizes.sm,
        fontWeight: TOKENS.fontWeights.bold,
        color: accent ? TOKENS.colors.accent : TOKENS.colors.textPrimary,
        fontFamily: mono ? TOKENS.fonts.mono : TOKENS.fonts.sans,
        textAlign: 'right',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </span>
    </div>
  )
}

/** CompositionDonut — Inline SVG donut + legend for the strategy pockets card. */
function CompositionDonut({ composition }: { composition: Array<{ label: string; pct: number; color?: string }> }) {
  const size = 140
  const strokeWidth = 22
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const total = composition.reduce((s, c) => s + c.pct, 0) || 1

  let offset = 0
  return (
    <div style={{
      display: 'flex',
      gap: TOKENS.spacing[4],
      alignItems: 'center',
      flexWrap: 'wrap',
    }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        style={{ width: size, height: size, transform: 'rotate(-90deg)', flexShrink: 0 }}
        aria-label="Strategy pockets"
      >
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={TOKENS.colors.bgTertiary} strokeWidth={strokeWidth} />
        {composition.map((slice, i) => {
          const dash = (slice.pct / total) * circumference
          const c = slice.color ?? CHART_PALETTE[i % CHART_PALETTE.length]
          const segment = (
            <circle
              key={slice.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={c}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          )
          offset += dash
          return segment
        })}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[2], flex: 1, minWidth: 0 }}>
        {composition.map((slice, i) => (
          <div key={slice.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: TOKENS.spacing[2] }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: TOKENS.spacing[2], minWidth: 0 }}>
              <span style={{
                width: TOKENS.dot.sm,
                height: TOKENS.dot.sm,
                borderRadius: TOKENS.radius.full,
                background: slice.color ?? CHART_PALETTE[i % CHART_PALETTE.length],
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: TOKENS.fontSizes.xs,
                color: TOKENS.colors.textSecondary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {slice.label}
              </span>
            </span>
            <span style={{
              fontFamily: TOKENS.fonts.mono,
              fontSize: TOKENS.fontSizes.xs,
              fontWeight: TOKENS.fontWeights.black,
              color: TOKENS.colors.textPrimary,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {slice.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatPlainDollar(n: number): string {
  return n.toLocaleString('en-US')
}

// fmtUsdCompact import retained for parity with other invest helpers (TS-friendly noop).
void fmtUsdCompact
