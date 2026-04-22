'use client'

import { Label } from '@/components/ui/label'
import { TOKENS, fmtUsd, fmtUsdCompact, LINE_HEIGHT, VALUE_LETTER_SPACING } from './constants'
import { MonthlyGauge } from './monthly-gauge'
import { CompressedMetricsStrip } from './compressed-metrics-strip'
import { PositionCard } from './position-card'
import type { ActiveVault, MaturedVault } from './data'
import { useSmartFit, useShellPadding, fitValue } from './smart-fit'
import type { SmartFitMode } from './smart-fit'
import { usePositionData } from '@/hooks/usePositionData'
import { Skeleton } from './skeleton'

const MOCK_WALLET = '0x5F...AA57'

export function VaultDetailPanel({
  vault,
  onBack,
}: {
  vault: ActiveVault | MaturedVault
  onBack?: () => void
}) {
  const { mode, isLimit } = useSmartFit({
    tightHeight: 760,
    limitHeight: 680,
    tightWidth: 1100,
    limitWidth: 1200,
    reserveHeight: 64,
    reserveWidth: 280,
  })
  const { padding: shellPadding, gap: shellGap } = useShellPadding(mode)

  const { data: positionData, isLoading, error } = usePositionData({
    vaultId: vault.id,
    walletAddress: MOCK_WALLET,
    refreshInterval: 30000,
  })

  const capitalDeployed = positionData?.capitalDeployed ?? vault.deposited
  const accruedYield = positionData?.accruedYield ?? vault.claimable
  const currentValue = positionData?.positionValue ?? (vault.deposited + vault.claimable)
  const daysRemaining = positionData?.unlockTimeline.daysRemaining ??
    Math.ceil((new Date(vault.maturity).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const progressToTarget = positionData?.unlockTimeline.progressPercent ?? vault.progress
  const isMatured = vault.type === 'matured'
  const unlockDays = Math.max(0, daysRemaining)
  const isTargetReached = positionData?.isTargetReached ?? (vault.progress >= 100)
  const isPositionReadyForExit =
    positionData?.canWithdraw ?? (isMatured || (vault.type === 'active' && vault.canWithdraw))
  const statusLabel = isPositionReadyForExit ? 'Position ready for exit' : 'Active'

  const totalTargetYield = capitalDeployed * (parseFloat(vault.target) / 100)
  const remainingToTarget = Math.max(0, totalTargetYield - accruedYield)

  return (
    <div
      className="flex-1"
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
      {/* Header */}
      <div
        style={{
          padding: `${shellPadding}px`,
          borderBottom: `1px solid ${TOKENS.colors.borderSubtle}`,
          flexShrink: 0,
          background: TOKENS.colors.bgApp,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Label id="pos-detail" tone="scene" variant="text">
              Position
            </Label>
            <div style={{
              fontSize: fitValue(mode, {
                normal: TOKENS.fontSizes.xxxl,
                tight: TOKENS.fontSizes.xxl,
                limit: TOKENS.fontSizes.xl,
              }),
              fontWeight: TOKENS.fontWeights.black,
              textTransform: 'uppercase',
              marginTop: TOKENS.spacing[2],
              lineHeight: LINE_HEIGHT.tight,
              letterSpacing: VALUE_LETTER_SPACING,
            }}>
              {vault.name}
            </div>
            <div style={{
              fontSize: TOKENS.fontSizes.xs,
              color: TOKENS.colors.textSecondary,
              marginTop: TOKENS.spacing[2],
              lineHeight: LINE_HEIGHT.body,
            }}>
              {vault.strategy}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: fitValue(mode, {
                normal: TOKENS.fontSizes.xxxl,
                tight: TOKENS.fontSizes.xxl,
                limit: TOKENS.fontSizes.xl,
              }),
              fontWeight: TOKENS.fontWeights.black,
              letterSpacing: VALUE_LETTER_SPACING,
              color: TOKENS.colors.textPrimary,
            }}>
              {fmtUsd(currentValue)}
            </div>
            <div style={{
              fontSize: TOKENS.fontSizes.xs,
              fontWeight: TOKENS.fontWeights.bold,
              textTransform: 'uppercase',
              letterSpacing: TOKENS.letterSpacing.display,
              color: TOKENS.colors.accent,
              marginTop: TOKENS.spacing[2],
            }}>
              {statusLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: shellPadding,
        gap: shellGap,
        minHeight: 0,
        overflow: 'hidden',
      }}>
        {/* Primary metrics strip */}
        <CompressedMetricsStrip
          mode={mode}
          items={[
            { id: 'p', label: 'Capital Deployed', value: fmtUsdCompact(capitalDeployed) },
            { id: 'y', label: 'Accrued Yield', value: fmtUsdCompact(accruedYield), accent: true },
            { id: 't', label: 'Target', value: vault.target },
            { id: 'm', label: 'Maturity', value: vault.maturity },
          ]}
        />

        {/* Secondary metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: fitValue(mode, {
            normal: 'repeat(4, 1fr)',
            tight: 'repeat(2, 1fr)',
            limit: '1fr',
          }),
          gap: TOKENS.spacing[2],
          flexShrink: 0,
        }}>
          <StatCard
            label="Target Yield"
            value={fmtUsdCompact(totalTargetYield)}
            subtext={`${vault.target} of deployed capital`}
            mode={mode}
          />
          <StatCard
            label="Remaining to Target"
            value={fmtUsdCompact(remainingToTarget)}
            subtext={`${progressToTarget}% progress`}
            mode={mode}
            accent
          />
          <StatCard
            label="APY"
            value={`${vault.apr}%`}
            subtext="Annual yield"
            mode={mode}
          />
          <StatCard
            label={isMatured ? 'Status' : 'Unlock Timeline'}
            value={isMatured ? 'Matured' : `${unlockDays} days`}
            subtext={isMatured ? 'Position ready for exit' : 'Until capital unlock'}
            mode={mode}
          />
        </div>

        {/* Position Card */}
        {positionData && !isLoading && (
          <PositionCard data={positionData} mode={mode} />
        )}

        {/* Loading state */}
        {isLoading && <Skeleton mode={mode} variant="card" />}

        {/* Error state */}
        {error && (
          <div style={{
            background: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            padding: TOKENS.spacing[4],
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}>
            <span style={{
              fontSize: TOKENS.fontSizes.sm,
              color: TOKENS.colors.danger,
            }}>{error.message}</span>
          </div>
        )}

        {/* Target progress */}
        <div style={{
          background: 'var(--color-bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          padding: fitValue(mode, {
            normal: TOKENS.spacing[4],
            tight: TOKENS.spacing[3],
            limit: TOKENS.spacing[3],
          }),
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: TOKENS.spacing[2],
            alignItems: 'baseline',
          }}>
            <Label id="tp-label" tone="scene" variant="text">
              Target progress
            </Label>
            <span
              style={{
                fontFamily: TOKENS.fonts.mono,
                fontSize: TOKENS.fontSizes.xs,
                fontWeight: TOKENS.fontWeights.bold,
                letterSpacing: TOKENS.letterSpacing.display,
                color: TOKENS.colors.textSecondary,
              }}
              aria-label={`${progressToTarget} percent of ${vault.target} target`}
            >
              {progressToTarget}% of {vault.target}
            </span>
          </div>
          <div
            style={{
              height: 12,
              background: TOKENS.colors.black,
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              marginBottom: TOKENS.spacing[2],
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, progressToTarget)}%`,
                background: isTargetReached ? TOKENS.colors.accent : 'rgba(255,255,255,0.6)',
                borderRadius: 'var(--radius-sm)',
                transition: 'width 1s ease',
              }}
            />
          </div>
          <div
            style={{
              fontFamily: TOKENS.fonts.mono,
              fontSize: TOKENS.fontSizes.xs,
              color: TOKENS.colors.textSecondary,
              lineHeight: LINE_HEIGHT.body,
            }}
          >
            Capital unlocks when {vault.target} cumulative target is reached or at maturity.
            {remainingToTarget > 0 && (
              <span> {fmtUsdCompact(remainingToTarget)} remaining to reach target.</span>
            )}
          </div>
        </div>

        {/* Month distribution */}
        <div style={{
          background: 'var(--color-bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          padding: fitValue(mode, {
            normal: TOKENS.spacing[4],
            tight: TOKENS.spacing[3],
            limit: TOKENS.spacing[3],
          }),
          flexShrink: 0,
        }}>
          <Label id="mo-label" tone="scene" variant="text">
            Month distribution
          </Label>
          <div style={{ marginTop: TOKENS.spacing[3] }}>
            <MonthlyGauge deposited={capitalDeployed} apr={vault.apr} mode={mode} />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, subtext, mode, accent = false }: {
  label: string
  value: string
  subtext: string
  mode: SmartFitMode
  accent?: boolean
}) {
  return (
    <div style={{
      background: 'var(--color-bg-secondary)',
      borderRadius: 'var(--radius-lg)',
      padding: fitValue(mode, {
        normal: TOKENS.spacing[3],
        tight: TOKENS.spacing[2],
        limit: TOKENS.spacing[2],
      }),
    }}>
      <div style={{
        fontSize: TOKENS.fontSizes.xs,
        fontWeight: TOKENS.fontWeights.bold,
        letterSpacing: TOKENS.letterSpacing.display,
        textTransform: 'uppercase',
        color: TOKENS.colors.textSecondary,
        marginBottom: TOKENS.spacing[2],
      }}>
        {label}
      </div>
      <div style={{
        fontSize: fitValue(mode, {
          normal: TOKENS.fontSizes.lg,
          tight: TOKENS.fontSizes.md,
          limit: TOKENS.fontSizes.md,
        }),
        fontWeight: TOKENS.fontWeights.black,
        letterSpacing: VALUE_LETTER_SPACING,
        color: accent ? TOKENS.colors.accent : TOKENS.colors.textPrimary,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: TOKENS.fontSizes.xs,
        color: TOKENS.colors.textGhost,
        marginTop: TOKENS.spacing[2],
      }}>
        {subtext}
      </div>
    </div>
  )
}
