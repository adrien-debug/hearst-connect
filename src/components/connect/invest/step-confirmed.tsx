'use client'

import { TOKENS, fmtUsd, LINE_HEIGHT } from '../constants'
import type { AvailableVault } from '../data'

interface StepConfirmedProps {
  vault: AvailableVault
  depositedAmount: number
  txHash: string
  onBackToDashboard?: () => void
}

/** Step 4 — Confirmed. Success state with the deposit summary, tx hash, and a
 * single CTA to return to the dashboard. */
export function StepConfirmed({
  vault,
  depositedAmount,
  txHash,
  onBackToDashboard,
}: StepConfirmedProps) {
  return (
    <div style={{
      maxWidth: 560,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: TOKENS.spacing[5],
      padding: `${TOKENS.spacing[8]} ${TOKENS.spacing[6]}`,
      background: TOKENS.colors.black,
      border: `${TOKENS.borders.thin} solid ${TOKENS.colors.borderSubtle}`,
      borderRadius: TOKENS.radius.lg,
      textAlign: 'center',
    }}>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: TOKENS.spacing[16],
        height: TOKENS.spacing[16],
        borderRadius: TOKENS.radius.full,
        background: TOKENS.colors.accentSubtle,
        border: `${TOKENS.borders.thin} solid ${TOKENS.colors.accent}`,
        color: TOKENS.colors.accent,
        fontSize: TOKENS.fontSizes.xxl,
        fontWeight: TOKENS.fontWeights.black,
      }}>
        ✓
      </span>

      <div>
        <h2 style={{
          margin: 0,
          fontSize: TOKENS.fontSizes.xxl,
          fontWeight: TOKENS.fontWeights.black,
          color: TOKENS.colors.textPrimary,
          letterSpacing: TOKENS.letterSpacing.tight,
        }}>
          Deposit confirmed
        </h2>
        <p style={{
          margin: `${TOKENS.spacing[2]} 0 0 0`,
          fontSize: TOKENS.fontSizes.sm,
          color: TOKENS.colors.textSecondary,
          lineHeight: LINE_HEIGHT.body,
        }}>
          Your subscription to <span style={{ color: TOKENS.colors.textPrimary, fontWeight: TOKENS.fontWeights.bold }}>{vault.name}</span>{' '}
          is live. Yield distribution starts at the next 00:00 UTC settlement.
        </p>
      </div>

      <div style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: TOKENS.spacing[3],
        padding: TOKENS.spacing[4],
        background: TOKENS.colors.bgTertiary,
        border: `${TOKENS.borders.thin} solid ${TOKENS.colors.borderSubtle}`,
        borderRadius: TOKENS.radius.md,
      }}>
        <ConfirmCell label="Amount deposited" value={fmtUsd(depositedAmount)} accent />
        <ConfirmCell label="Product" value={vault.name} />
        <ConfirmCell label="APY" value={`${vault.apr}%`} />
        <ConfirmCell label="Transaction" value={txHash} mono />
      </div>

      {onBackToDashboard && (
        <button
          type="button"
          onClick={onBackToDashboard}
          style={{
            padding: `${TOKENS.spacing[3]} ${TOKENS.spacing[6]}`,
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
          Back to dashboard →
        </button>
      )}
    </div>
  )
}

function ConfirmCell({ label, value, accent, mono }: { label: string; value: string; accent?: boolean; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing.half, alignItems: 'flex-start', textAlign: 'left' }}>
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
        fontWeight: TOKENS.fontWeights.bold,
        color: accent ? TOKENS.colors.accent : TOKENS.colors.textPrimary,
        fontFamily: mono ? TOKENS.fonts.mono : TOKENS.fonts.sans,
        fontVariantNumeric: 'tabular-nums',
        wordBreak: 'break-all',
      }}>
        {value}
      </span>
    </div>
  )
}
