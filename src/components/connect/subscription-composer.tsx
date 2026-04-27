'use client'

import { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { PreFlightCheck } from './pre-flight-check'
import { TOKENS, fmtUsd, fmtUsdCompact, VALUE_LETTER_SPACING } from './constants'
import type { AvailableVault } from './data'
import type { VaultConfig } from '@/types/vault'
import { fitValue, type SmartFitMode } from './smart-fit'

/** Layout constants — single source of truth for component-local magic values. */
const LAYOUT = {
  /** Order Summary panel min-width inside the 2-column grid. */
  rightColMinWidth: '320px',
  /** Order Summary panel preferred width as % of available row. */
  rightColPreferred: '38%',
} as const

/** Amount preset multipliers (relative to vault min deposit). */
const AMOUNT_PRESET_MULTIPLIERS = [1, 2, 10, 20] as const

/** Vault detail tabs — progressive disclosure of secondary content. */
type VaultTab = 'strategy' | 'terms'
const VAULT_TABS: ReadonlyArray<{ id: VaultTab; label: string }> = [
  { id: 'strategy', label: 'Strategy' },
  { id: 'terms', label: 'Terms' },
]

type Props = {
  vault: AvailableVault
  vaultConfig: VaultConfig | null
  mode: SmartFitMode
  isLimit: boolean
  amount: string
  onAmountChange: (v: string) => void
  agreed: boolean
  onAgreedChange: (v: boolean) => void
  isValid: boolean
  isReady: boolean
  num: number
  yearlyYield: number
  totalYield: number
  onApprove: () => void
  isApproving: boolean
  onDeposit: () => void
  isDepositing: boolean
  onPreFlightReady?: (ready: boolean) => void
  onBack?: () => void
}

export function SubscriptionComposer({
  vault,
  vaultConfig,
  mode,
  isLimit,
  amount,
  onAmountChange,
  agreed,
  onAgreedChange,
  isValid,
  isReady,
  num,
  yearlyYield,
  totalYield,
  onApprove,
  isApproving,
  onDeposit,
  isDepositing,
  onPreFlightReady,
  onBack,
}: Props) {
  const idAmount = 'subscribe-amount'
  const idAgree = 'subscribe-term-confirm'
  const idAmountHint = 'subscribe-amount-hint'
  const idAmountStatus = 'subscribe-amount-status'
  const idFieldsetTerms = 'subscribe-fieldset-terms'

  const showError = num > 0 && !isValid
  const showValidHint = isValid && num > 0

  return (
    <div
      className="flex flex-col flex-1 min-h-0"
      style={{
        gap: fitValue(mode, { normal: TOKENS.spacing[4], tight: TOKENS.spacing[3], limit: TOKENS.spacing[2] }),
        overflow: 'hidden',
      }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: isLimit ? '1fr' : `1fr minmax(${LAYOUT.rightColMinWidth}, ${LAYOUT.rightColPreferred})`,
        gap: fitValue(mode, { normal: TOKENS.spacing[4], tight: TOKENS.spacing[3], limit: TOKENS.spacing[2] }),
        flex: 1,
        minHeight: 0,
      }}>
        {/* LEFT COLUMN: hero + tabs */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: fitValue(mode, { normal: TOKENS.spacing[5], tight: TOKENS.spacing[4], limit: TOKENS.spacing[3] }),
          minHeight: 0,
        }}>
          <VaultHero vault={vault} mode={mode} onBack={onBack} />

          <VaultTabs
            vault={vault}
            vaultConfig={vaultConfig}
            mode={mode}
          />
        </div>

        {/* RIGHT COLUMN: Order Summary — flat, separated by hairline */}
        <div style={{
          paddingLeft: isLimit ? 0 : TOKENS.spacing[5],
          borderLeft: isLimit ? 'none' : `1px solid ${TOKENS.colors.borderSubtle}`,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'auto',
        }}>
          <span style={{
            fontFamily: TOKENS.fonts.mono,
            fontSize: TOKENS.fontSizes.micro,
            fontWeight: TOKENS.fontWeights.bold,
            letterSpacing: TOKENS.letterSpacing.display,
            textTransform: 'uppercase',
            color: TOKENS.colors.textSecondary,
            marginBottom: TOKENS.spacing[4],
          }}>
            Order Summary
          </span>

          {/* Amount Input - Pixel Perfect */}
          <div style={{ marginBottom: TOKENS.spacing[4] }}>
            <label
              htmlFor={idAmount}
              id={idAmountHint}
              style={{
                display: 'block',
                fontFamily: TOKENS.fonts.mono,
                fontSize: TOKENS.fontSizes.xs,
                fontWeight: TOKENS.fontWeights.bold,
                textTransform: 'uppercase',
                letterSpacing: TOKENS.letterSpacing.display,
                color: TOKENS.colors.textSecondary,
                marginBottom: TOKENS.spacing[2],
              }}
            >
              Amount to deploy
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                border: `${TOKENS.borders.thin} solid ${isValid && num > 0 ? TOKENS.colors.accent : TOKENS.colors.borderSubtle}`,
                borderRadius: TOKENS.radius.md,
                padding: `0 ${TOKENS.spacing[3]}`,
                background: TOKENS.colors.bgTertiary,
                transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
                height: TOKENS.control.heightLg,
                boxShadow: isValid && num > 0 ? `0 0 0 1px var(--hc-accent-glow)` : 'none',
              }}
            >
              <span
                style={{
                  fontSize: TOKENS.fontSizes.xl,
                  fontWeight: TOKENS.fontWeights.black,
                  color: num > 0 ? TOKENS.colors.textPrimary : TOKENS.colors.textGhost,
                  marginRight: TOKENS.spacing[2],
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                $
              </span>
              <input
                id={idAmount}
                name="amount"
                type="number"
                inputMode="decimal"
                min={0}
                placeholder="0.00"
                value={amount}
                onChange={(e) => onAmountChange(e.target.value)}
                autoComplete="off"
                aria-invalid={showError}
                aria-describedby={[idAmountHint, num > 0 ? idAmountStatus : ''].filter(Boolean).join(' ') || undefined}
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: 0,
                  background: 'transparent',
                  fontWeight: TOKENS.fontWeights.black,
                  color: TOKENS.colors.textPrimary,
                  outline: 'none',
                  fontSize: TOKENS.fontSizes.xl,
                  fontFamily: TOKENS.fonts.sans,
                  letterSpacing: VALUE_LETTER_SPACING,
                  lineHeight: 1,
                  padding: 0,
                  height: '100%',
                }}
              />
              <span
                style={{
                  fontWeight: TOKENS.fontWeights.bold,
                  color: TOKENS.colors.textGhost,
                  fontSize: TOKENS.fontSizes.xs,
                  marginLeft: TOKENS.spacing[2],
                  flexShrink: 0,
                  lineHeight: 1,
                }}
                aria-hidden
              >
                USDC
              </span>
            </div>
            <div
              id={idAmountStatus}
              role="status"
              aria-live="polite"
              style={{
                marginTop: TOKENS.spacing[2],
                minHeight: `${TOKENS.spacing[4]}`,
                fontSize: TOKENS.fontSizes.xs,
                fontWeight: TOKENS.fontWeights.bold,
                color: showError ? TOKENS.colors.danger : showValidHint ? TOKENS.colors.accent : 'transparent',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {showError && <span>Minimum: {fmtUsd(vault.minDeposit)}</span>}
              {showValidHint && !showError && <span style={{ display: 'flex', alignItems: 'center', gap: TOKENS.spacing[1] }}><span>✓</span> Valid amount</span>}
            </div>

            {/* Amount presets — quick allocation choices */}
            <AmountPresets
              minDeposit={vault.minDeposit}
              currentAmount={num}
              onSelect={(v) => onAmountChange(String(v))}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[3], flex: 1 }}>
            {vault.risk && /medium|high/i.test(vault.risk) && (
              <RiskWarning risk={vault.risk} />
            )}

            {num > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <ProjectionLine label="Yield at 1 month" value={`+${fmtUsd(yearlyYield / 12)}`} />
                <ProjectionLine label="Yield at 6 months" value={`+${fmtUsd(yearlyYield / 2)}`} />
                <ProjectionLine label={`Yield at maturity (${vault.lockPeriod})`} value={`+${fmtUsd(totalYield)}`} highlight />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  paddingTop: TOKENS.spacing[3],
                  marginTop: TOKENS.spacing[1],
                  borderTop: `1px solid ${TOKENS.colors.borderSubtle}`,
                }}>
                  <span style={{
                    fontFamily: TOKENS.fonts.mono,
                    fontSize: TOKENS.fontSizes.micro,
                    fontWeight: TOKENS.fontWeights.bold,
                    letterSpacing: TOKENS.letterSpacing.display,
                    textTransform: 'uppercase',
                    color: TOKENS.colors.textSecondary,
                  }}>
                    Total at maturity
                  </span>
                  <span style={{
                    fontSize: TOKENS.fontSizes.xl,
                    fontWeight: TOKENS.fontWeights.black,
                    color: TOKENS.colors.accent,
                    letterSpacing: VALUE_LETTER_SPACING,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {fmtUsd(num + totalYield)}
                  </span>
                </div>
              </div>
            )}

            {/* Pre-flight Check — collapsible */}
            <CollapsiblePreFlight
              vault={vault}
              depositAmount={amount}
              onApprove={onApprove}
              isApproving={isApproving}
              onPreFlightReady={onPreFlightReady}
            />

            {/* Checkbox & CTA */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: TOKENS.spacing[3],
              marginTop: TOKENS.spacing[3],
              paddingTop: TOKENS.spacing[3],
              borderTop: `1px solid ${TOKENS.colors.borderSubtle}`,
            }}>
              <fieldset id={idFieldsetTerms} className="m-0 border-0 p-0">
                <legend className="sr-only">Terms confirmation</legend>
                <label
                  htmlFor={idAgree}
                  style={{ display: 'flex', alignItems: 'center', gap: TOKENS.spacing[2], cursor: 'pointer' }}
                >
                  <input
                    id={idAgree}
                    name="terms"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => onAgreedChange(e.target.checked)}
                    style={{
                      width: TOKENS.spacing[5],
                      height: TOKENS.spacing[5],
                      accentColor: TOKENS.colors.accent,
                      cursor: 'pointer',
                    }}
                    aria-describedby={`${idAgree}-desc`}
                  />
                  <span
                    id={`${idAgree}-desc`}
                    style={{
                      fontSize: TOKENS.fontSizes.xs,
                      fontWeight: TOKENS.fontWeights.bold,
                      color: TOKENS.colors.textSecondary,
                    }}
                  >
                    I confirm the term sheet and minimum deposit.
                  </span>
                </label>
              </fieldset>
              
              <button
                type="button"
                disabled={!isReady || isDepositing}
                onClick={onDeposit}
                style={{
                  width: '100%',
                  height: TOKENS.control.heightXl,
                  padding: `0 ${TOKENS.spacing[5]}`,
                  background: isReady ? TOKENS.colors.accent : TOKENS.colors.bgTertiary,
                  color: isReady ? TOKENS.colors.black : TOKENS.colors.textGhost,
                  border: 'none',
                  borderRadius: TOKENS.radius.md,
                  fontSize: TOKENS.fontSizes.sm,
                  fontWeight: TOKENS.fontWeights.black,
                  letterSpacing: TOKENS.letterSpacing.display,
                  textTransform: 'uppercase',
                  cursor: isReady && !isDepositing ? 'pointer' : 'not-allowed',
                  transition: 'all var(--transition-fast)',
                  opacity: isDepositing ? 0.7 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: TOKENS.spacing[2],
                }}
                aria-label={isReady ? `Deploy ${fmtUsd(num)}` : 'Complete form to deploy'}
                aria-disabled={!isReady || isDepositing}
              >
                {isDepositing
                  ? 'Confirming…'
                  : isReady
                    ? <>Deploy capital · <span style={{ letterSpacing: VALUE_LETTER_SPACING }}>{fmtUsd(num)}</span></>
                    : num > 0
                      ? 'Complete Review'
                      : 'Enter amount to continue'}
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

function CompactMetric({ label, value, accent, mode }: { label: string; value: string; accent?: boolean; mode: SmartFitMode }) {
  return (
    <div>
      <div
        style={{
          fontFamily: TOKENS.fonts.mono,
          fontSize: TOKENS.fontSizes.micro,
          fontWeight: TOKENS.fontWeights.bold,
          letterSpacing: TOKENS.letterSpacing.display,
          color: TOKENS.colors.textGhost,
          textTransform: 'uppercase',
          marginBottom: TOKENS.spacing[2],
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: fitValue(mode, { normal: TOKENS.fontSizes.xl, tight: TOKENS.fontSizes.lg, limit: TOKENS.fontSizes.md }),
          fontWeight: TOKENS.fontWeights.black,
          color: accent ? TOKENS.colors.accent : TOKENS.colors.textPrimary,
          letterSpacing: VALUE_LETTER_SPACING,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  )
}

function ProjectionLine({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: `${TOKENS.spacing[1]} 0`,
        borderBottom: `1px solid ${TOKENS.colors.borderSubtle}`,
      }}
    >
      <span
        style={{
          fontSize: TOKENS.fontSizes.xs,
          color: TOKENS.colors.textSecondary,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: TOKENS.fontSizes.md,
          fontWeight: TOKENS.fontWeights.black,
          color: highlight ? TOKENS.colors.accent : TOKENS.colors.textPrimary,
          letterSpacing: VALUE_LETTER_SPACING,
        }}
      >
        {value}
      </span>
    </div>
  )
}


/* ─── VAULT HERO ────────────────────────────────────────────────────────── */
function VaultHero({
  vault,
  mode,
  onBack,
}: {
  vault: AvailableVault
  mode: SmartFitMode
  onBack?: () => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[5] }}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: TOKENS.spacing[2],
            background: 'none',
            border: 'none',
            padding: 0,
            color: TOKENS.colors.accent,
            fontFamily: TOKENS.fonts.mono,
            fontSize: TOKENS.fontSizes.xs,
            fontWeight: TOKENS.fontWeights.bold,
            letterSpacing: TOKENS.letterSpacing.display,
            textTransform: 'uppercase',
            cursor: 'pointer',
            alignSelf: 'flex-start',
          }}
        >
          ← Back to vaults
        </button>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[3] }}>
        <h1
          style={{
            margin: 0,
            fontSize: fitValue(mode, { normal: 'var(--dashboard-text-display)', tight: TOKENS.fontSizes.xxl, limit: TOKENS.fontSizes.xl }),
            fontWeight: TOKENS.fontWeights.black,
            letterSpacing: TOKENS.letterSpacing.tight,
            color: TOKENS.colors.textPrimary,
            lineHeight: 1.05,
          }}
        >
          {vault.name}
        </h1>
        {vault.strategy && (
          <p style={{
            margin: 0,
            fontSize: TOKENS.fontSizes.md,
            color: TOKENS.colors.textSecondary,
            fontWeight: TOKENS.fontWeights.medium,
            lineHeight: 1.5,
            maxWidth: '52ch',
          }}>
            {vault.strategy}
          </p>
        )}
      </div>

      {/* KPI strip — Target (accent) · APY · Lock · Min · Risk */}
      <div style={{
        display: 'flex',
        gap: TOKENS.spacing[8],
        rowGap: TOKENS.spacing[4],
        flexWrap: 'wrap',
        alignItems: 'baseline',
      }}>
        <CompactMetric label="Target" value={vault.target} mode={mode} accent />
        <CompactMetric label="APY" value={`${vault.apr}%`} mode={mode} />
        <CompactMetric label="Lock" value={vault.lockPeriod} mode={mode} />
        <CompactMetric label="Min Entry" value={fmtUsd(vault.minDeposit)} mode={mode} />
        <CompactMetric label="Risk" value={vault.risk} mode={mode} />
      </div>
    </div>
  )
}

/* ─── VAULT TABS — Strategy / Terms (real data only) ────────────────────── */
function VaultTabs({
  vault,
  vaultConfig,
  mode,
}: {
  vault: AvailableVault
  vaultConfig: VaultConfig | null
  mode: SmartFitMode
}) {
  const [activeTab, setActiveTab] = useState<VaultTab>('strategy')

  const panelTopGap = fitValue(mode, {
    normal: TOKENS.spacing[5],
    tight: TOKENS.spacing[4],
    limit: TOKENS.spacing[3],
  })

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      overflow: 'hidden',
    }}>
      <div
        role="tablist"
        aria-label="Vault details"
        style={{
          display: 'flex',
          gap: TOKENS.spacing[5],
          borderBottom: `1px solid ${TOKENS.colors.borderSubtle}`,
        }}
      >
        {VAULT_TABS.map((tab) => {
          const active = tab.id === activeTab
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`vault-tab-panel-${tab.id}`}
              id={`vault-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: `${TOKENS.spacing[3]} 0`,
                margin: 0,
                cursor: 'pointer',
                fontFamily: TOKENS.fonts.mono,
                fontSize: TOKENS.fontSizes.xs,
                fontWeight: TOKENS.fontWeights.bold,
                letterSpacing: TOKENS.letterSpacing.display,
                textTransform: 'uppercase',
                color: active ? TOKENS.colors.textPrimary : TOKENS.colors.textGhost,
                position: 'relative',
                transition: 'color var(--transition-fast)',
              }}
            >
              {tab.label}
              {active && (
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: -1,
                    height: TOKENS.spacing.half,
                    background: TOKENS.colors.accent,
                  }}
                />
              )}
            </button>
          )
        })}
      </div>

      <div
        role="tabpanel"
        id={`vault-tab-panel-${activeTab}`}
        aria-labelledby={`vault-tab-${activeTab}`}
        style={{
          marginTop: panelTopGap,
          overflow: 'auto',
          flex: 1,
          minHeight: 0,
        }}
      >
        {activeTab === 'strategy' && <StrategyTabBody vault={vault} risk={vaultConfig?.risk} />}
        {activeTab === 'terms' && <TermsTabBody vault={vault} vaultConfig={vaultConfig} />}
      </div>
    </div>
  )
}

function StrategyTabBody({ vault, risk }: { vault: AvailableVault; risk?: string }) {
  const resolvedRisk = risk ?? vault.risk
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[4] }}>
      {vault.strategy && (
        <p style={{
          margin: 0,
          fontSize: TOKENS.fontSizes.sm,
          color: TOKENS.colors.textSecondary,
          lineHeight: 1.6,
        }}>
          {vault.strategy}
        </p>
      )}
      {resolvedRisk && <MetaRow label="Risk" value={resolvedRisk} />}
    </div>
  )
}

function TermsTabBody({
  vault,
  vaultConfig,
}: {
  vault: AvailableVault
  vaultConfig: VaultConfig | null
}) {
  const lockPeriod = vaultConfig?.lockPeriodDays
    ? `${vaultConfig.lockPeriodDays} days`
    : vault.lockPeriod
  const truncatedVault = vaultConfig?.vaultAddress
    ? `${vaultConfig.vaultAddress.slice(0, 6)}…${vaultConfig.vaultAddress.slice(-4)}`
    : undefined
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      columnGap: TOKENS.spacing[6],
      rowGap: TOKENS.spacing[3],
    }}>
      <MetaRow label="Lock period" value={lockPeriod} />
      <MetaRow label="Target unlock" value={vault.target} />
      <MetaRow label="Min deposit" value={fmtUsdCompact(vault.minDeposit)} />
      {vault.fees && <MetaRow label="Fees" value={vault.fees} />}
      {vault.token && <MetaRow label="Token" value={vault.token} />}
      {vaultConfig?.chain?.name && <MetaRow label="Network" value={vaultConfig.chain.name} />}
      {truncatedVault && <MetaRow label="Vault" value={truncatedVault} mono />}
    </div>
  )
}

function MetaRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: TOKENS.spacing[3],
      fontSize: TOKENS.fontSizes.xs,
    }}>
      <span style={{
        fontFamily: TOKENS.fonts.mono,
        color: TOKENS.colors.textGhost,
        letterSpacing: TOKENS.letterSpacing.display,
        textTransform: 'uppercase',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: mono ? TOKENS.fonts.mono : TOKENS.fonts.sans,
        color: TOKENS.colors.textPrimary,
        textAlign: 'right',
      }}>
        {value}
      </span>
    </div>
  )
}

/* ─── AMOUNT PRESETS ────────────────────────────────────────────────────── */
function AmountPresets({
  minDeposit,
  currentAmount,
  onSelect,
}: {
  minDeposit: number
  currentAmount: number
  onSelect: (v: number) => void
}) {
  // Presets: minDeposit × multipliers — adapts to vault tier.
  const raw = AMOUNT_PRESET_MULTIPLIERS.map((m) => minDeposit * m)
  const presets = Array.from(new Set(raw)).filter((n) => n >= minDeposit).slice(0, AMOUNT_PRESET_MULTIPLIERS.length)
  return (
    <div style={{
      display: 'flex',
      gap: TOKENS.spacing[2],
      marginTop: TOKENS.spacing[3],
      flexWrap: 'wrap',
    }}>
      {presets.map((value) => {
        const active = Math.round(currentAmount) === value
        return (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            style={{
              flex: '1 1 auto',
              minWidth: 0,
              padding: `${TOKENS.spacing[2]} ${TOKENS.spacing[3]}`,
              background: active ? 'var(--hc-accent-dim)' : TOKENS.colors.bgTertiary,
              border: `1px solid ${active ? TOKENS.colors.accent : TOKENS.colors.borderSubtle}`,
              borderRadius: TOKENS.radius.full,
              color: active ? TOKENS.colors.accent : TOKENS.colors.textSecondary,
              fontFamily: TOKENS.fonts.mono,
              fontSize: TOKENS.fontSizes.xs,
              fontWeight: TOKENS.fontWeights.bold,
              letterSpacing: TOKENS.letterSpacing.display,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            aria-pressed={active}
          >
            {fmtUsdAxis(value)}
          </button>
        )
      })}
    </div>
  )
}

/* ─── COLLAPSIBLE PRE-FLIGHT ────────────────────────────────────────────── */
function CollapsiblePreFlight({
  vault,
  depositAmount,
  onApprove,
  isApproving,
  onPreFlightReady,
}: {
  vault: AvailableVault
  depositAmount: string
  onApprove: () => void
  isApproving: boolean
  onPreFlightReady?: (ready: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const [ready, setReady] = useState(false)

  const handleReadyChange = (r: boolean) => {
    setReady(r)
    onPreFlightReady?.(r)
  }

  // Auto-open when there's an issue (so user sees what to fix).
  useEffect(() => {
    if (!ready) setOpen(true)
  }, [ready])

  return (
    <div style={{
      marginTop: TOKENS.spacing[3],
      paddingTop: TOKENS.spacing[3],
      borderTop: `1px solid ${TOKENS.colors.borderSubtle}`,
    }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: TOKENS.spacing[3],
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          color: TOKENS.colors.textSecondary,
        }}
        aria-expanded={open}
      >
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: TOKENS.spacing[2],
          fontFamily: TOKENS.fonts.mono,
          fontSize: TOKENS.fontSizes.xs,
          fontWeight: TOKENS.fontWeights.bold,
          letterSpacing: TOKENS.letterSpacing.display,
          textTransform: 'uppercase',
          color: ready ? TOKENS.colors.accent : TOKENS.colors.warning,
        }}>
          <span style={{
            width: TOKENS.spacing[2],
            height: TOKENS.spacing[2],
            borderRadius: TOKENS.radius.full,
            background: 'currentColor',
          }} aria-hidden />
          Pre-flight · {ready ? 'all checks passed' : 'review required'}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform var(--transition-base)',
        }}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div style={{ marginTop: TOKENS.spacing[3] }}>
          <PreFlightCheck
            vault={vault}
            depositAmount={depositAmount}
            onApprove={onApprove}
            isApproving={isApproving}
            onReadyChange={handleReadyChange}
          />
        </div>
      )}
    </div>
  )
}


function RiskWarning({ risk }: { risk: string }) {
  const isHigh = /high/i.test(risk)
  const color = isHigh ? TOKENS.colors.danger : TOKENS.colors.warning
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: TOKENS.spacing[2],
        padding: `${TOKENS.spacing[3]} ${TOKENS.spacing[3]}`,
        background: `color-mix(in srgb, ${color} 10%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
        borderRadius: TOKENS.radius.md,
        fontSize: TOKENS.fontSizes.xs,
        color,
        lineHeight: 1.5,
      }}
    >
      <span aria-hidden style={{ flexShrink: 0 }}>{isHigh ? '⚠' : 'ℹ'}</span>
      <span>
        <strong>Risk: {risk}.</strong>{' '}
        {isHigh
          ? 'This vault carries elevated risk. Capital may be subject to drawdown. Only invest what you can afford to lose.'
          : 'This vault carries moderate risk. Review strategy and terms carefully before deploying capital.'}
      </span>
    </div>
  )
}

/** Compact axis label: $1.2M / $680K / $500. Avoids label clipping at any amount. */
function fmtUsdAxis(n: number): string {
  if (!isFinite(n)) return '—'
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`
  if (abs >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${Math.round(n)}`
}
