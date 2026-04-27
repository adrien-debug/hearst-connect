'use client'

import { useMemo } from 'react'
import { useAccount } from 'wagmi'
import { TOKENS, fmtUsdCompact, LINE_HEIGHT, VALUE_LETTER_SPACING, CHART_PALETTE } from './constants'
import { formatVaultName } from './formatting'
import type { ActiveVault, MaturedVault } from './data'
import type { VaultConfig, MarketRegime } from '@/types/vault'
import { DEMO_MARKET_REGIME } from '@/lib/demo/demo-data'
import { useSmartFit, useShellPadding, fitValue } from './smart-fit'
import type { SmartFitMode } from './smart-fit'
import { usePositionData } from '@/hooks/usePositionData'
import { useVaultById } from '@/hooks/useVaultRegistry'
import { Skeleton } from './skeleton'
import { WalletNotConnected, VaultNotConfigured, OnChainError } from './empty-states'
import { useUserData } from '@/hooks/useUserData'

export function VaultDetailPanel({
  vault,
  onBack,
}: {
  vault: ActiveVault | MaturedVault
  onBack?: () => void
}) {
  const { address: connectedAddress } = useAccount()
  const { mode } = useSmartFit({
    tightHeight: 880,
    limitHeight: 720,
    tightWidth: 1280,
    limitWidth: 1024,
    reserveHeight: 64,
    reserveWidth: 280,
  })
  const { padding: shellPadding, gap: shellGap } = useShellPadding(mode)

  // ActiveVault.id is the unique cohort/position id (e.g. 'demo-pos-prime-1')
  // while ActiveVault.productId points to the underlying vault config
  // (e.g. 'demo-prime'). Fall back to id for non-cohort vaults (Available).
  const productId = vault.productId ?? vault.id
  const vaultConfig = useVaultById(productId)

  const {
    data: positionData,
    isLoading,
    error,
    isVaultConfigured,
    isWalletConnected,
  } = usePositionData({
    vaultId: productId,
    positionId: vault.productId ? vault.id : undefined,
    walletAddress: connectedAddress,
  })

  // Hooks must run on every render — keep BEFORE the early returns below
  // (Rules of Hooks: order must be stable across renders).
  const { activity: allActivity } = useUserData()
  // Filter to events for the active product (cohort-agnostic in demo for now).
  const vaultActivity = useMemo(
    () => allActivity.filter((a) => a.vaultId === productId).slice(0, 6),
    [allActivity, productId],
  )

  if (!isVaultConfigured) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: `${shellPadding}px`,
          gap: `${shellGap}px`,
        }}
      >
        <div style={{ marginBottom: TOKENS.spacing[4] }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: TOKENS.spacing[2],
              background: 'none',
              border: 'none',
              color: TOKENS.colors.accent,
              fontSize: TOKENS.fontSizes.sm,
              fontWeight: TOKENS.fontWeights.bold,
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            ← Back
          </button>
        </div>
        <VaultNotConfigured />
      </div>
    )
  }

  if (!isWalletConnected) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: `${shellPadding}px`,
          gap: `${shellGap}px`,
        }}
      >
        <div style={{ marginBottom: TOKENS.spacing[4] }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: TOKENS.spacing[2],
              background: 'none',
              border: 'none',
              color: TOKENS.colors.accent,
              fontSize: TOKENS.fontSizes.sm,
              fontWeight: TOKENS.fontWeights.bold,
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            ← Back
          </button>
        </div>
        <WalletNotConnected />
      </div>
    )
  }

  const capitalDeployed = positionData?.capitalDeployed ?? 0
  const accruedYield = positionData?.accruedYield ?? 0
  const currentValue = positionData?.positionValue ?? 0
  const daysRemaining = positionData?.unlockTimeline.daysRemaining ?? vaultConfig?.lockPeriodDays ?? 0
  const progressToTarget = positionData?.unlockTimeline.progressPercent ?? 0
  const isMatured = vault.type === 'matured'
  const unlockDays = Math.max(0, daysRemaining)
  const isTargetReached = positionData?.isTargetReached ?? false

  const isPositionReadyForExit = positionData?.canWithdraw ?? false
  const statusLabel = isPositionReadyForExit ? 'Ready for exit' : 'Active'

  if (error && error.code !== 'WALLET_NOT_CONNECTED' && error.code !== 'VAULT_NOT_FOUND') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: `${shellPadding}px`,
          gap: `${shellGap}px`,
        }}
      >
        <div style={{ marginBottom: TOKENS.spacing[4] }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: TOKENS.spacing[2],
              background: 'none',
              border: 'none',
              color: TOKENS.colors.accent,
              fontSize: TOKENS.fontSizes.sm,
              fontWeight: TOKENS.fontWeights.bold,
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            ← Back
          </button>
        </div>
        <OnChainError error={error as unknown as Error} />
      </div>
    )
  }

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
      {/* HEADER — LIVE pill, name, APY */}
      <PositionHeader
        vault={vault}
        subtitle={vault.strategy}
        chainName={vaultConfig?.chain?.name}
        statusLabel={statusLabel}
        isReadyForExit={isPositionReadyForExit}
        onBack={onBack}
        mode={mode}
        shellPadding={shellPadding}
      />

      {/* Main content */}
      <div
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
        {/* KPI row — 4 cells: Deposited / Current value / Yield paid / Matures */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: fitValue(mode, {
            normal: 'repeat(4, 1fr)',
            tight: 'repeat(4, 1fr)',
            limit: 'repeat(2, 1fr)',
          }),
          gap: fitValue(mode, {
            normal: TOKENS.spacing[6],
            tight: TOKENS.spacing[4],
            limit: TOKENS.spacing[3],
          }),
          flexShrink: 0,
        }}>
          <KpiCell label="Deposited" value={fmtUsdCompact(capitalDeployed)} />
          <KpiCell
            label="Current value"
            value={fmtUsdCompact(currentValue)}
            subtext={
              currentValue - capitalDeployed > 0
                ? `+${fmtUsdCompact(currentValue - capitalDeployed)}`
                : currentValue - capitalDeployed < 0
                  ? `−${fmtUsdCompact(Math.abs(currentValue - capitalDeployed))}`
                  : '—'
            }
            subtextAccent={currentValue - capitalDeployed > 0}
          />
          <KpiCell
            label="Yield paid"
            value={fmtUsdCompact(accruedYield)}
            valueAccent={accruedYield > 0}
            subtext="USDC"
          />
          <KpiCell
            label="Matures"
            value={isMatured ? 'Matured' : formatMaturityDate(positionData?.unlockTimeline.maturityDate, unlockDays)}
            subtext={vault.maturity}
          />
        </div>

        {/* Loading state */}
        {isLoading && <Skeleton mode={mode} />}

        {/* Error state */}
        {error && (
          <span style={{
            fontSize: TOKENS.fontSizes.sm,
            color: TOKENS.colors.danger,
          }}>{error.message}</span>
        )}

        {/* Cumulative target progress */}
        <CumulativeTargetProgress
          progress={progressToTarget}
          targetLabel={vault.target}
          isTargetReached={isTargetReached}
          maturityLabel={vault.maturity}
          mode={mode}
        />

        {/* 2-column detail layout — 4 enriched cards (About+History, Strategy+Composition, Terms, Activity) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: fitValue(mode, {
              normal: '1.2fr 1fr',
              tight: '1fr 1fr',
              limit: '1fr',
            }),
            gap: shellGap,
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {/* LEFT: Yield paid 12mo → Strategy details */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: shellGap,
            minHeight: 0,
            overflow: 'auto',
          }}>
            <DetailCard title="Yield paid — last 12 months" accent>
              {vaultConfig?.historicalReturns && vaultConfig.historicalReturns.length > 1 ? (
                <YieldPaidBars
                  returns={vaultConfig.historicalReturns}
                  capitalDeployed={capitalDeployed}
                />
              ) : (
                <p style={{
                  margin: 0,
                  fontSize: TOKENS.fontSizes.sm,
                  color: TOKENS.colors.textGhost,
                }}>
                  No distribution history yet.
                </p>
              )}
            </DetailCard>

            <DetailCard title="Strategy details">
              <StrategyDetailsBody
                vaultConfig={vaultConfig}
                activeRegime={DEMO_MARKET_REGIME}
              />
            </DetailCard>
          </div>

          {/* RIGHT: Capital recovery → Transactions */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: shellGap,
            minHeight: 0,
            overflow: 'auto',
          }}>
            <DetailCard title="Capital recovery status">
              <CapitalRecoveryStatus />
            </DetailCard>
            <DetailCard title="Transactions">
              <VaultActivityTimeline activity={vaultActivity} />
            </DetailCard>
          </div>
        </div>
      </div>

    </div>
  )
}


function formatMaturityDate(iso: string | undefined, fallbackDays: number): string {
  if (iso) {
    const date = new Date(iso)
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    }
  }
  if (fallbackDays > 0) {
    const projected = new Date(Date.now() + fallbackDays * 86_400_000)
    return projected.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }
  return '—'
}

function PositionHeader({
  vault,
  subtitle,
  chainName,
  statusLabel,
  isReadyForExit,
  onBack,
  mode,
  shellPadding,
}: {
  vault: ActiveVault | MaturedVault
  subtitle?: string
  chainName?: string
  statusLabel: string
  isReadyForExit: boolean
  onBack?: () => void
  mode: SmartFitMode
  shellPadding: number
}) {
  return (
    <div style={{
      padding: fitValue(mode, {
        normal: `${shellPadding}px`,
        tight: `${shellPadding * 0.75}px`,
        limit: `${shellPadding * 0.5}px`,
      }),
      borderBottom: `${TOKENS.borders.thin} solid ${TOKENS.colors.borderSubtle}`,
      flexShrink: 0,
      background: TOKENS.colors.black,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: TOKENS.spacing[6],
      flexWrap: mode === 'limit' ? 'wrap' : 'nowrap',
    }}>
      {/* Left: LIVE pill + name + subtitle */}
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[2] }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: TOKENS.spacing[3],
          fontFamily: TOKENS.fonts.mono,
          fontSize: TOKENS.fontSizes.micro,
          fontWeight: TOKENS.fontWeights.bold,
          letterSpacing: TOKENS.letterSpacing.display,
          textTransform: 'uppercase',
        }}>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: TOKENS.spacing[2],
                background: 'transparent',
                border: `${TOKENS.borders.thin} solid ${TOKENS.colors.borderSubtle}`,
                borderRadius: TOKENS.radius.sm,
                padding: `${TOKENS.spacing[1]} ${TOKENS.spacing[2]}`,
                color: TOKENS.colors.textSecondary,
                fontFamily: 'inherit',
                fontSize: 'inherit',
                fontWeight: 'inherit',
                letterSpacing: 'inherit',
                textTransform: 'inherit',
                cursor: 'pointer',
                transition: TOKENS.transitions.fast,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = TOKENS.colors.accent
                e.currentTarget.style.borderColor = TOKENS.colors.accent
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = TOKENS.colors.textSecondary
                e.currentTarget.style.borderColor = TOKENS.colors.borderSubtle
              }}
              aria-label="Back to portfolio"
            >
              ← Portfolio
            </button>
          )}
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: TOKENS.spacing[2],
            color: TOKENS.colors.accent,
          }}>
            <span style={{
              width: TOKENS.dot.xs,
              height: TOKENS.dot.xs,
              borderRadius: TOKENS.radius.full,
              background: TOKENS.colors.accent,
            }} />
            {isReadyForExit ? statusLabel : 'Live'}
          </span>
          {chainName && (
            <span style={{ color: TOKENS.colors.textGhost }}>· {chainName}</span>
          )}
        </div>
        <h1 style={{
          margin: 0,
          fontSize: fitValue(mode, {
            normal: TOKENS.fontSizes.xl,
            tight: TOKENS.fontSizes.lg,
            limit: TOKENS.fontSizes.md,
          }),
          fontWeight: TOKENS.fontWeights.semibold,
          letterSpacing: TOKENS.letterSpacing.normal,
          color: TOKENS.colors.textPrimary,
          lineHeight: LINE_HEIGHT.tight,
        }}>
          {formatVaultName(vault.name)}
        </h1>
        {subtitle && (
          <div style={{
            fontSize: TOKENS.fontSizes.sm,
            color: TOKENS.colors.textSecondary,
            lineHeight: LINE_HEIGHT.tight,
          }}>
            {subtitle}
          </div>
        )}
      </div>

      {/* Right: APY card + actions */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: TOKENS.spacing[3],
        flexShrink: 0,
      }}>
        {/* APY — flat, cockpit gauge style + 'Daily distribution' caption */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: TOKENS.spacing[1],
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: TOKENS.spacing[2],
          }}>
            <span style={{
              fontSize: fitValue(mode, {
                normal: TOKENS.fontSizes.xxl,
                tight: TOKENS.fontSizes.xl,
                limit: TOKENS.fontSizes.lg,
              }),
              fontWeight: TOKENS.fontWeights.black,
              letterSpacing: VALUE_LETTER_SPACING,
              color: TOKENS.colors.accent,
              fontVariantNumeric: 'tabular-nums',
              lineHeight: LINE_HEIGHT.tight,
            }}>
              {vault.apr}%
            </span>
            <span style={{
              fontFamily: TOKENS.fonts.mono,
              fontSize: TOKENS.fontSizes.micro,
              fontWeight: TOKENS.fontWeights.bold,
              letterSpacing: TOKENS.letterSpacing.display,
              textTransform: 'uppercase',
              color: TOKENS.colors.textGhost,
            }}>
              APY
            </span>
          </div>
          <span style={{
            fontSize: TOKENS.fontSizes.xs,
            color: TOKENS.colors.textSecondary,
          }}>
            Daily distribution
          </span>
        </div>
      </div>
    </div>
  )
}

function KpiCell({
  label,
  value,
  subtext,
  valueAccent = false,
  subtextAccent = false,
}: {
  label: string
  value: string
  subtext?: string
  valueAccent?: boolean
  subtextAccent?: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[2], minWidth: 0 }}>
      <div style={{
        fontSize: TOKENS.fontSizes.micro,
        fontWeight: TOKENS.fontWeights.bold,
        fontFamily: TOKENS.fonts.mono,
        letterSpacing: TOKENS.letterSpacing.display,
        textTransform: 'uppercase',
        color: TOKENS.colors.textSecondary,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: TOKENS.fontSizes.xl,
        fontWeight: TOKENS.fontWeights.black,
        letterSpacing: VALUE_LETTER_SPACING,
        color: valueAccent ? TOKENS.colors.accent : TOKENS.colors.textPrimary,
        fontVariantNumeric: 'tabular-nums',
        lineHeight: LINE_HEIGHT.tight,
      }}>
        {value}
      </div>
      {subtext && (
        <div style={{
          fontSize: TOKENS.fontSizes.xs,
          color: subtextAccent ? TOKENS.colors.accent : TOKENS.colors.textGhost,
          fontVariantNumeric: 'tabular-nums',
          fontFamily: TOKENS.fonts.mono,
        }}>
          {subtext}
        </div>
      )}
    </div>
  )
}

function CumulativeTargetProgress({
  progress,
  targetLabel,
  isTargetReached,
  maturityLabel,
  mode: _mode,
}: {
  progress: number
  targetLabel: string
  isTargetReached: boolean
  maturityLabel: string
  mode: SmartFitMode
}) {
  const targetPct = parseFloat(targetLabel) || 36
  const fillPct = Math.min(100, (progress / targetPct) * 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[3], flexShrink: 0 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
      }}>
        <span style={{
          fontSize: TOKENS.fontSizes.sm,
          fontWeight: TOKENS.fontWeights.black,
          color: TOKENS.colors.textPrimary,
          letterSpacing: TOKENS.letterSpacing.normal,
        }}>
          Cumulative target progress
        </span>
        <span style={{
          fontFamily: TOKENS.fonts.mono,
          fontSize: TOKENS.fontSizes.xs,
          fontWeight: TOKENS.fontWeights.bold,
          letterSpacing: TOKENS.letterSpacing.display,
          color: isTargetReached ? TOKENS.colors.accent : TOKENS.colors.textSecondary,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {progress}% of {targetLabel}{isTargetReached ? ' · reached' : ''}
        </span>
      </div>

      <div style={{
        height: TOKENS.bar.thin,
        background: TOKENS.colors.bgTertiary,
        borderRadius: TOKENS.radius.full,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${fillPct}%`,
          background: TOKENS.colors.accent,
          borderRadius: TOKENS.radius.full,
          transition: `width ${TOKENS.transitions.durSlow} ease`,
        }} />
      </div>

      <p style={{
        margin: 0,
        fontSize: TOKENS.fontSizes.xs,
        color: TOKENS.colors.textSecondary,
        lineHeight: LINE_HEIGHT.body,
      }}>
        Capital unlocks when the {targetLabel} target is reached or at {maturityLabel}, whichever comes first.
      </p>
    </div>
  )
}


/** DetailCard — Container for the 2-col grid sections of vault detail page. */
function DetailCard({
  title,
  accent = false,
  headerRight,
  children,
}: {
  title: string
  accent?: boolean
  headerRight?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        background: TOKENS.colors.black,
        border: `${TOKENS.borders.thin} solid ${TOKENS.colors.borderSubtle}`,
        borderRadius: TOKENS.radius.lg,
        padding: TOKENS.spacing[5],
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
        flex: 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: TOKENS.spacing[2],
          marginBottom: TOKENS.spacing[3],
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: TOKENS.spacing[2], minWidth: 0 }}>
          <span
            style={{
              width: 3,
              height: 14,
              background: accent ? TOKENS.colors.accent : TOKENS.colors.borderStrong,
              borderRadius: TOKENS.radius.full,
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <h3
            style={{
              margin: 0,
              fontFamily: TOKENS.fonts.mono,
              fontSize: TOKENS.fontSizes.xs,
              fontWeight: TOKENS.fontWeights.bold,
              letterSpacing: TOKENS.letterSpacing.display,
              textTransform: 'uppercase',
              color: TOKENS.colors.textSecondary,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </h3>
        </div>
        {headerRight && <div style={{ flexShrink: 0 }}>{headerRight}</div>}
      </div>
      <div style={{ minHeight: 0, overflow: 'auto', flex: 1 }} className="hide-scrollbar">
        {children}
      </div>
    </div>
  )
}

/** YieldPaidBars — compact vertical bar sparkline of monthly yield distributions
 * in USD, derived from historical yield % × current capital deployed. */
function YieldPaidBars({
  returns,
  capitalDeployed,
}: {
  returns: Array<{ month: string; yieldPct: number }>
  capitalDeployed: number
}) {
  const monthly = returns.map((r) => (r.yieldPct / 100 / 12) * capitalDeployed)
  const max = Math.max(1, ...monthly)
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: TOKENS.spacing[2],
      width: '100%',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: TOKENS.spacing.half,
        height: 72,
      }}>
        {monthly.map((v, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${(v / max) * 100}%`,
              minHeight: 2,
              background: TOKENS.colors.accentDim,
              borderTop: `${TOKENS.borders.thin} solid ${TOKENS.colors.accent}`,
              borderTopLeftRadius: TOKENS.radius.xs,
              borderTopRightRadius: TOKENS.radius.xs,
            }}
            title={`M${i + 1} · ${fmtUsdCompact(v)}`}
          />
        ))}
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: TOKENS.spacing.half,
        fontFamily: TOKENS.fonts.mono,
        fontSize: TOKENS.fontSizes.nano,
        fontWeight: TOKENS.fontWeights.bold,
        letterSpacing: TOKENS.letterSpacing.display,
        textTransform: 'uppercase',
        color: TOKENS.colors.textGhost,
      }}>
        {monthly.map((_, i) => (
          <span key={i} style={{ flex: 1, textAlign: 'center' }}>M{i + 1}</span>
        ))}
      </div>
    </div>
  )
}

/** CapitalRecoveryStatus — static safeguard message + auto badge. */
function CapitalRecoveryStatus() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: TOKENS.spacing[3],
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: TOKENS.spacing[3],
      }}>
        <span style={{
          fontSize: TOKENS.fontSizes.sm,
          fontWeight: TOKENS.fontWeights.black,
          color: TOKENS.colors.accent,
          display: 'inline-flex',
          alignItems: 'center',
          gap: TOKENS.spacing[2],
        }}>
          <span aria-hidden>✓</span>
          Safeguard active — not triggered
        </span>
        <span style={{
          fontFamily: TOKENS.fonts.mono,
          fontSize: TOKENS.fontSizes.nano,
          fontWeight: TOKENS.fontWeights.bold,
          letterSpacing: TOKENS.letterSpacing.display,
          textTransform: 'uppercase',
          color: TOKENS.colors.textGhost,
          padding: `${TOKENS.spacing.half} ${TOKENS.spacing[2]}`,
          background: TOKENS.colors.bgTertiary,
          border: `${TOKENS.borders.thin} solid ${TOKENS.colors.borderSubtle}`,
          borderRadius: TOKENS.radius.full,
        }}>
          auto
        </span>
      </div>
      <p style={{
        margin: 0,
        fontSize: TOKENS.fontSizes.xs,
        color: TOKENS.colors.textSecondary,
        lineHeight: LINE_HEIGHT.body,
      }}>
        If principal is below initial deposit at maturity, mining infrastructure
        continues operating up to 2 additional years, output directed exclusively
        to capital recovery.
      </p>
    </div>
  )
}

/** StrategyDetailsBody — Renders the active market regime, the segmented
 * allocation bar with legend, and the 3 scenario cards (Bull / Sideways / Bear).
 * The currently-active scenario is highlighted with the accent border. */
function StrategyDetailsBody({
  vaultConfig,
  activeRegime,
}: {
  vaultConfig: VaultConfig | null
  activeRegime: MarketRegime
}) {
  const weights = vaultConfig?.rebalanceWeights
  if (!weights) {
    return (
      <p style={{ margin: 0, fontSize: TOKENS.fontSizes.sm, color: TOKENS.colors.textGhost }}>
        Strategy data not available.
      </p>
    )
  }

  const regimeLabel: Record<MarketRegime, string> = {
    bull: 'Bull — accelerate growth',
    sideways: 'Sideways — baseline mix',
    bear: 'Bear — protect capital',
  }
  const scenarioTitle: Record<MarketRegime, string> = {
    bull: 'Accelerate growth',
    sideways: 'Baseline mix',
    bear: 'Protect capital',
  }
  const activeWeights = weights[activeRegime]
  const total = activeWeights.reduce((s, w) => s + w.pct, 0) || 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[4] }}>
      {/* Active regime header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: TOKENS.spacing[2],
        flexWrap: 'wrap',
        fontSize: TOKENS.fontSizes.sm,
        color: TOKENS.colors.textSecondary,
      }}>
        <span>Current market regime:</span>
        <span style={{ color: TOKENS.colors.textPrimary, fontWeight: TOKENS.fontWeights.black }}>
          {regimeLabel[activeRegime]}
        </span>
      </div>

      {/* Segmented allocation bar */}
      <div style={{
        display: 'flex',
        height: TOKENS.bar.thin,
        borderRadius: TOKENS.radius.full,
        overflow: 'hidden',
        background: TOKENS.colors.bgTertiary,
      }}>
        {activeWeights.map((slice, i) => (
          <div
            key={slice.label}
            style={{
              flex: slice.pct / total,
              background: CHART_PALETTE[i % CHART_PALETTE.length],
            }}
          />
        ))}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: TOKENS.spacing[4],
        fontSize: TOKENS.fontSizes.xs,
      }}>
        {activeWeights.map((slice, i) => (
          <span key={slice.label} style={{ display: 'inline-flex', alignItems: 'center', gap: TOKENS.spacing[2] }}>
            <span style={{
              width: TOKENS.dot.sm,
              height: TOKENS.dot.sm,
              borderRadius: TOKENS.radius.full,
              background: CHART_PALETTE[i % CHART_PALETTE.length],
              flexShrink: 0,
            }} />
            <span style={{ color: TOKENS.colors.textSecondary }}>{slice.label}</span>
            <span style={{
              fontFamily: TOKENS.fonts.mono,
              fontWeight: TOKENS.fontWeights.bold,
              color: TOKENS.colors.textPrimary,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {slice.pct}%
            </span>
          </span>
        ))}
      </div>

      {/* Section header + dynamic allocation explanation */}
      <div style={{
        marginTop: TOKENS.spacing[2],
        paddingTop: TOKENS.spacing[3],
        borderTop: `${TOKENS.borders.thin} solid ${TOKENS.colors.borderSubtle}`,
      }}>
        <div style={{
          fontFamily: TOKENS.fonts.mono,
          fontSize: TOKENS.fontSizes.micro,
          fontWeight: TOKENS.fontWeights.bold,
          letterSpacing: TOKENS.letterSpacing.display,
          textTransform: 'uppercase',
          color: TOKENS.colors.textGhost,
          marginBottom: TOKENS.spacing[2],
        }}>
          Dynamic allocation · how the vault rebalances
        </div>
        <p style={{
          margin: 0,
          fontSize: TOKENS.fontSizes.xs,
          color: TOKENS.colors.textSecondary,
          lineHeight: LINE_HEIGHT.body,
        }}>
          Automated controls continuously rebalance exposures across the vault pockets,
          tighten volatility thresholds, and shift reward distribution toward more defensive
          strategies in downturns.
        </p>
      </div>

      {/* 3 scenario cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: TOKENS.spacing[3],
      }}>
        {(['bull', 'sideways', 'bear'] as const).map((regime) => {
          const isActive = regime === activeRegime
          const sliceWeights = weights[regime]
          const sliceTotal = sliceWeights.reduce((s, w) => s + w.pct, 0) || 1
          const dotColor: Record<MarketRegime, string> = {
            bull: TOKENS.colors.accent,
            sideways: TOKENS.colors.textGhost,
            bear: TOKENS.colors.danger,
          }
          const pitch = sliceWeights[0]?.pitch ?? ''

          return (
            <div
              key={regime}
              style={{
                background: isActive ? TOKENS.colors.accentSubtle : TOKENS.colors.bgTertiary,
                border: `${TOKENS.borders.thin} solid ${isActive ? TOKENS.colors.accent : TOKENS.colors.borderSubtle}`,
                borderRadius: TOKENS.radius.md,
                padding: TOKENS.spacing[3],
                display: 'flex',
                flexDirection: 'column',
                gap: TOKENS.spacing[2],
              }}
            >
              {/* Scenario label */}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: TOKENS.spacing[2],
                fontFamily: TOKENS.fonts.mono,
                fontSize: TOKENS.fontSizes.micro,
                fontWeight: TOKENS.fontWeights.bold,
                letterSpacing: TOKENS.letterSpacing.display,
                textTransform: 'uppercase',
                color: TOKENS.colors.textSecondary,
                width: 'fit-content',
                padding: `${TOKENS.spacing.half} ${TOKENS.spacing[2]}`,
                background: TOKENS.colors.black,
                border: `${TOKENS.borders.thin} solid ${TOKENS.colors.borderSubtle}`,
                borderRadius: TOKENS.radius.full,
              }}>
                <span style={{
                  width: TOKENS.dot.sm,
                  height: TOKENS.dot.sm,
                  borderRadius: TOKENS.radius.full,
                  background: dotColor[regime],
                  flexShrink: 0,
                }} />
                {regime}
              </span>
              <div style={{
                fontSize: TOKENS.fontSizes.sm,
                fontWeight: TOKENS.fontWeights.black,
                color: TOKENS.colors.textPrimary,
              }}>
                {scenarioTitle[regime]}
              </div>
              <p style={{
                margin: 0,
                fontSize: TOKENS.fontSizes.xs,
                color: TOKENS.colors.textSecondary,
                lineHeight: LINE_HEIGHT.body,
              }}>
                {pitch}
              </p>
              {/* Mini allocation bar for this scenario */}
              <div style={{
                marginTop: TOKENS.spacing[2],
                display: 'flex',
                height: TOKENS.bar.thin,
                borderRadius: TOKENS.radius.full,
                overflow: 'hidden',
                background: TOKENS.colors.bgTertiary,
              }}>
                {sliceWeights.map((slice, i) => (
                  <div
                    key={slice.label}
                    style={{
                      flex: slice.pct / sliceTotal,
                      background: CHART_PALETTE[i % CHART_PALETTE.length],
                    }}
                  />
                ))}
              </div>
              {isActive && (
                <span style={{
                  marginTop: TOKENS.spacing[1],
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: TOKENS.fontSizes.micro,
                  fontWeight: TOKENS.fontWeights.bold,
                  letterSpacing: TOKENS.letterSpacing.display,
                  textTransform: 'uppercase',
                  color: TOKENS.colors.accent,
                }}>
                  ✓ Currently active
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** VaultActivityTimeline — Compact list of recent events for this vault.
 * Mirrors the mockup: bold title, "DD MMM YYYY · tx 0x…" sub-line, amount and
 * cadence label aligned right. Three event flavours: yield distribution (claim),
 * performance fee (fee), initial deposit. */
function VaultActivityTimeline({
  activity,
}: {
  activity: Array<{
    id: string
    type: 'deposit' | 'claim' | 'withdraw' | 'fee'
    amount: number
    timestamp: number
    txHash?: string
  }>
}) {
  if (activity.length === 0) {
    return (
      <div style={{
        padding: `${TOKENS.spacing[4]} 0`,
        textAlign: 'center',
        fontSize: TOKENS.fontSizes.xs,
        color: TOKENS.colors.textGhost,
      }}>
        No activity recorded yet
      </div>
    )
  }

  const eventStyle = (type: typeof activity[number]['type']): {
    label: string
    cadence: string
    amountColor: string
    sign: '+' | '−'
    glyph: string
    glyphColor: string
  } => {
    switch (type) {
      case 'claim':
        return { label: 'Yield distribution', cadence: 'daily',   amountColor: TOKENS.colors.accent,         sign: '+', glyph: '↓', glyphColor: TOKENS.colors.accent }
      case 'fee':
        return { label: 'Performance fee',     cadence: 'monthly', amountColor: TOKENS.colors.danger,         sign: '−', glyph: '−', glyphColor: TOKENS.colors.danger }
      case 'deposit':
        return { label: 'Initial deposit',     cadence: 'deposit', amountColor: TOKENS.colors.textPrimary,    sign: '+', glyph: '+', glyphColor: TOKENS.colors.textSecondary }
      case 'withdraw':
        return { label: 'Position withdrawn',  cadence: 'exit',    amountColor: TOKENS.colors.danger,         sign: '−', glyph: '↑', glyphColor: TOKENS.colors.danger }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {activity.map((event, i) => {
        const cfg = eventStyle(event.type)
        const dateStr = new Date(event.timestamp).toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric',
        })
        return (
          <div
            key={event.id}
            style={{
              display: 'grid',
              gridTemplateColumns: `${TOKENS.spacing[6]} 1fr auto`,
              alignItems: 'center',
              gap: TOKENS.spacing[3],
              padding: `${TOKENS.spacing[3]} 0`,
              borderBottom: i < activity.length - 1
                ? `${TOKENS.borders.thin} solid ${TOKENS.colors.borderSubtle}`
                : 'none',
            }}
          >
            <span style={{
              width: TOKENS.spacing[6],
              height: TOKENS.spacing[6],
              borderRadius: TOKENS.radius.full,
              background: TOKENS.colors.bgTertiary,
              border: `${TOKENS.borders.thin} solid ${TOKENS.colors.borderSubtle}`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: cfg.glyphColor,
              fontSize: TOKENS.fontSizes.xs,
              fontWeight: TOKENS.fontWeights.black,
            }}>
              {cfg.glyph}
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: TOKENS.fontSizes.xs,
                fontWeight: TOKENS.fontWeights.bold,
                color: TOKENS.colors.textPrimary,
              }}>
                {cfg.label}
              </div>
              <div style={{
                fontSize: TOKENS.fontSizes.micro,
                color: TOKENS.colors.textGhost,
                fontFamily: TOKENS.fonts.mono,
              }}>
                {dateStr}{event.txHash ? ` · tx ${event.txHash}` : ''}
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: TOKENS.spacing[2],
            }}>
              <span style={{
                fontFamily: TOKENS.fonts.mono,
                fontSize: TOKENS.fontSizes.xs,
                fontWeight: TOKENS.fontWeights.black,
                color: cfg.amountColor,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {cfg.sign}{fmtUsdCompact(event.amount)} USDC
              </span>
              <span style={{
                fontFamily: TOKENS.fonts.mono,
                fontSize: TOKENS.fontSizes.micro,
                color: TOKENS.colors.textGhost,
                letterSpacing: TOKENS.letterSpacing.display,
                textTransform: 'uppercase',
              }}>
                {cfg.cadence}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}


