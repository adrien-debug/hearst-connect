'use client'

import { useMemo, useState } from 'react'
import '@/styles/ui/tokens.css'
import { Label } from '@/components/ui/label'
import { EmptyState } from './empty-state'
import { VaultCardCompact } from './vault-card-compact'
import { TOKENS, fmtUsdCompact, fmtUsd, LINE_HEIGHT, VALUE_LETTER_SPACING } from './constants'
import type { VaultLine, Aggregate, ActiveVault, AvailableVault } from './data'
import { fitValue, type SmartFitMode, useSmartFit, useShellPadding } from './smart-fit'
import { CockpitGauge } from './cockpit-gauge'

import { AVAILABLE_VAULTS_VIEW_ID } from './view-ids'

export function PortfolioSummary({
  vaults,
  agg,
  onVaultSelect,
  onAvailableVaultsClick,
}: {
  vaults: VaultLine[]
  agg: Aggregate
  onVaultSelect?: (vaultId: string) => void
  onAvailableVaultsClick?: () => void
}) {
  const { mode } = useSmartFit({
    tightHeight: 740,
    limitHeight: 660,
    tightWidth: 940,
    limitWidth: 820,
    reserveHeight: 64,
    reserveWidth: 280,
  })
  const activeVaults = vaults.filter((v): v is ActiveVault => v.type === 'active')
  const availableVaults = vaults.filter((v): v is AvailableVault => v.type === 'available')
  const maturedByDate = activeVaults
    .map(v => ({ ...v, maturityDate: new Date(v.maturity) }))
    .filter(v => !Number.isNaN(v.maturityDate.getTime()))
    .sort((a, b) => a.maturityDate.getTime() - b.maturityDate.getTime())
  const nextMaturity = maturedByDate[0]?.maturity ?? null
  const daysToNextMaturity = maturedByDate[0]
    ? Math.max(0, Math.ceil((maturedByDate[0].maturityDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0
  const portfolioValue = agg.totalDeposited + agg.totalClaimable
  const { padding: shellPadding, gap: shellGap } = useShellPadding(mode)

  // Memoized derived data — prevents recalculation on every render
  const valueHistory = useMemo(() => generateValueHistory(portfolioValue), [portfolioValue])
  const donutData = useMemo(() => {
    const palette = [TOKENS.colors.accent, TOKENS.colors.white, 'rgba(255,255,255,0.45)', 'rgba(255,255,255,0.35)', 'rgba(255,255,255,0.25)']
    return activeVaults.map((vault, index) => ({
      id: vault.id,
      name: vault.name,
      color: palette[index % palette.length],
      pct: agg.totalDeposited > 0 ? (vault.deposited / agg.totalDeposited) * 100 : 0,
      value: vault.deposited + vault.claimable,
      claimable: vault.claimable,
    }))
  }, [activeVaults, agg.totalDeposited])

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
      {/* COCKPIT HEADER — Command center feel */}
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
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: TOKENS.spacing[3],
        }}>
          <Label id="port-overview" tone="scene" variant="text">
            Dashboard
          </Label>
          <div style={{
            fontFamily: TOKENS.fonts.mono,
            fontSize: TOKENS.fontSizes.micro,
            color: TOKENS.colors.textGhost,
            letterSpacing: TOKENS.letterSpacing.display,
            textTransform: 'uppercase',
          }}>
            {activeVaults.length} Active Position{activeVaults.length !== 1 ? 's' : ''}
            {nextMaturity && ` · Next: ${daysToNextMaturity}d`}
          </div>
        </div>

        {/* Main cockpit gauges — Large figures */}
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
          {/* Position Value — Primary */}
          <CockpitGauge
            label="Position Value"
            value={fmtUsd(portfolioValue)}
            valueCompact={fmtUsdCompact(portfolioValue)}
            subtext={`${activeVaults.length} position${activeVaults.length !== 1 ? 's' : ''}`}
            mode={mode}
            primary
          />

          {/* Accrued Yield — Accent */}
          <CockpitGauge
            label="Accrued Yield"
            value={`+${fmtUsd(agg.totalClaimable)}`}
            valueCompact={`+${fmtUsdCompact(agg.totalClaimable)}`}
            subtext={`${agg.avgApr.toFixed(1)}% avg APY`}
            mode={mode}
            accent
          />
          
          {/* Performance / Maturity */}
          <CockpitGauge
            label="Performance"
            value={`${((agg.totalClaimable / (agg.totalDeposited || 1)) * 100).toFixed(1)}%`}
            valueCompact={`${((agg.totalClaimable / (agg.totalDeposited || 1)) * 100).toFixed(1)}%`}
            subtext={nextMaturity ? `Next maturity: ${nextMaturity}` : 'All positions active'}
            mode={mode}
          />
        </div>
      </div>

      {/* Main content — Charts left, compact vaults right */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: `${shellPadding}px`,
        gap: `${shellGap}px`,
        minHeight: 0,
        overflow: 'hidden',
      }}>
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: fitValue(mode, {
            normal: '1fr 380px',
            tight: '1fr 320px',
            limit: '1fr',
          }),
          gap: `${shellGap}px`,
          minHeight: 0,
        }}>
          {/* Left — Analytics Charts */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: `${shellGap}px`,
            minHeight: 0,
          }}>
            {/* Top: Donut + Line Chart side by side on desktop */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: fitValue(mode, {
                normal: '200px 1fr',
                tight: '180px 1fr',
                limit: '1fr',
              }),
              gap: TOKENS.spacing[3],
              background: TOKENS.colors.bgSecondary,
              borderRadius: TOKENS.radius.lg,
              padding: TOKENS.spacing[3],
              flexShrink: 0,
            }}>
              {/* Donut - Compact */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <AllocationDonut 
                  data={donutData} 
                  total={agg.totalDeposited} 
                  mode={mode} 
                  compact
                  onSegmentClick={(vaultId) => onVaultSelect?.(vaultId)}
                />
                <div style={{
                  display: 'flex',
                  gap: TOKENS.spacing[3],
                  marginTop: TOKENS.spacing[2],
                }}>
                  <MiniStat label="Progress" value={`${Math.round(activeVaults.reduce((sum, v) => sum + v.progress, 0) / (activeVaults.length || 1))}%`} />
                  <MiniStat label="Yield" value={`+${fmtUsdCompact(agg.totalClaimable)}`} accent />
                </div>
              </div>

              {/* Line Chart - Full area */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
              }}>
                <LineChartArea data={valueHistory} portfolioValue={portfolioValue} mode={mode} />
              </div>
            </div>

            {/* Bottom: Maturity Timeline compact */}
            <div style={{
              background: TOKENS.colors.bgSecondary,
              borderRadius: TOKENS.radius.lg,
              padding: `${TOKENS.spacing[3]} ${TOKENS.spacing[4]}`,
              flexShrink: 0,
            }}>
              <MaturityTimelineCompact vaults={activeVaults} mode={mode} />
            </div>
          </div>

          {/* Right — Compact Vault List */}
          <div style={{
            background: TOKENS.colors.bgSecondary,
            borderRadius: TOKENS.radius.lg,
            padding: fitValue(mode, {
              normal: `${TOKENS.spacing[3]}`,
              tight: `${TOKENS.spacing[2]}`,
              limit: `${TOKENS.spacing[2]}`,
            }),
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'hidden',
          }}>
            {/* Header compact */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: TOKENS.spacing[2],
              padding: `0 ${TOKENS.spacing[2]}`,
            }}>
              <span style={{
                fontFamily: TOKENS.fonts.mono,
                fontSize: TOKENS.fontSizes.micro,
                fontWeight: TOKENS.fontWeights.bold,
                letterSpacing: TOKENS.letterSpacing.display,
                textTransform: 'uppercase',
                color: TOKENS.colors.textSecondary,
              }}>
                Positions ({activeVaults.length})
              </span>
              <button style={{
                padding: '4px 10px',
                background: TOKENS.colors.accentSubtle,
                border: `1px solid ${TOKENS.colors.accent}`,
                borderRadius: TOKENS.radius.sm,
                color: TOKENS.colors.accent,
                fontSize: TOKENS.fontSizes.micro,
                fontWeight: TOKENS.fontWeights.bold,
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}>
                Claim All
              </button>
            </div>

            {/* Vault list — compact cards */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
            }} className="hide-scrollbar">
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: TOKENS.spacing[2],
              }}>
                {activeVaults.length === 0 ? (
                  <EmptyState
                    title="No open positions"
                    description="When you deploy capital, your positions will appear here."
                  />
                ) : (
                  activeVaults.map((vault, index) => (
                    <VaultCardCompact
                      key={vault.id}
                      vault={vault}
                      index={index}
                      total={agg.totalDeposited}
                      mode={mode}
                      onClick={() => onVaultSelect?.(vault.id)}
                      onClaim={() => {
                        // TODO: Connect to claim functionality
                        console.log('Claim clicked for vault:', vault.id)
                      }}
                      onExit={() => {
                        // TODO: Connect to exit functionality
                        console.log('Exit clicked for vault:', vault.id)
                      }}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Available Vaults Teaser */}
            {availableVaults.length > 0 && (
              <div style={{
                marginTop: TOKENS.spacing[3],
                paddingTop: TOKENS.spacing[3],
                borderTop: `1px solid ${TOKENS.colors.borderSubtle}`,
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: TOKENS.spacing[2],
                  padding: `0 ${TOKENS.spacing[2]}`,
                }}>
                  <span style={{
                    fontFamily: TOKENS.fonts.mono,
                    fontSize: TOKENS.fontSizes.micro,
                    fontWeight: TOKENS.fontWeights.bold,
                    letterSpacing: TOKENS.letterSpacing.display,
                    textTransform: 'uppercase',
                    color: TOKENS.colors.textSecondary,
                  }}>
                    Available ({availableVaults.length})
                  </span>
                  <button
                    onClick={onAvailableVaultsClick}
                    style={{
                      padding: '4px 10px',
                      background: 'transparent',
                      border: `1px solid ${TOKENS.colors.borderSubtle}`,
                      borderRadius: '6px',
                      color: TOKENS.colors.textGhost,
                      fontSize: TOKENS.fontSizes.micro,
                      fontWeight: TOKENS.fontWeights.bold,
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = TOKENS.colors.accent
                      e.currentTarget.style.color = TOKENS.colors.accent
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = TOKENS.colors.borderSubtle
                      e.currentTarget.style.color = TOKENS.colors.textGhost
                    }}
                  >
                    View All
                  </button>
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: TOKENS.spacing[2],
                }}>
                  {availableVaults.slice(0, 2).map((vault, index) => (
                    <AvailableVaultTeaser
                      key={vault.id}
                      vault={vault}
                      index={index}
                      mode={mode}
                      onClick={() => onVaultSelect?.(vault.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


type DonutVaultItem = {
  id: string
  name: string
  color: string
  pct: number
  value: number
  claimable: number
}

/** AllocationDonut — Circular portfolio allocation chart with interactive tooltips */
function AllocationDonut({ 
  data, 
  total, 
  mode, 
  compact = false,
  onSegmentClick,
}: { 
  data: DonutVaultItem[]; 
  total: number; 
  mode: SmartFitMode; 
  compact?: boolean
  onSegmentClick?: (vaultId: string) => void
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  
  const size = compact
    ? fitValue(mode, { normal: 140, tight: 120, limit: 100 })
    : fitValue(mode, { normal: 200, tight: 160, limit: 140 })
  const strokeWidth = compact
    ? fitValue(mode, { normal: 18, tight: 16, limit: 14 })
    : fitValue(mode, { normal: 24, tight: 20, limit: 16 })
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  // Pre-calculate all segment geometry to avoid math in render
  const segments = useMemo(() => {
    let offsetCursor = 0
    return data.map((vault) => {
      const rawPct = total > 0 ? vault.pct / 100 : 0
      const dash = circumference * rawPct
      const segment = {
        dash,
        gap: circumference - dash,
        offset: -offsetCursor,
        color: vault.color,
        id: vault.id,
        name: vault.name,
        value: vault.value,
        claimable: vault.claimable,
        pct: vault.pct,
      }
      offsetCursor += dash
      return segment
    })
  }, [data, circumference, total])

  const hoveredSegment = segments.find(s => s.id === hoveredId)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: TOKENS.spacing[4],
      position: 'relative',
    }}>
      {/* Donut Chart */}
      <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}
          role="img"
          aria-label={`Portfolio allocation: ${data.length} vaults, total ${fmtUsdCompact(total)}`}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={TOKENS.colors.bgTertiary}
            strokeWidth={strokeWidth}
          />

          {/* Segments — interactive with hover effects */}
          {segments.map((seg) => {
            const isHovered = hoveredId === seg.id
            return (
              <circle
                key={seg.id}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={`${seg.dash} ${seg.gap}`}
                strokeDashoffset={seg.offset}
                strokeLinecap="round"
                style={{
                  cursor: onSegmentClick ? 'pointer' : 'default',
                  transition: 'all 150ms ease-out',
                  filter: isHovered ? `drop-shadow(0 0 8px ${seg.color})` : 'none',
                }}
                onMouseEnter={() => setHoveredId(seg.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onSegmentClick?.(seg.id)}
              />
            )
          })}
        </svg>

        {/* Center text */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}>
          {hoveredSegment ? (
            <>
              <div style={{
                fontSize: TOKENS.fontSizes.micro,
                fontWeight: TOKENS.fontWeights.bold,
                letterSpacing: TOKENS.letterSpacing.display,
                textTransform: 'uppercase',
                color: hoveredSegment.color,
                maxWidth: '80%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {hoveredSegment.name.replace('HashVault ', '')}
              </div>
              <div style={{
                fontSize: fitValue(mode, {
                  normal: TOKENS.fontSizes.md,
                  tight: TOKENS.fontSizes.sm,
                  limit: TOKENS.fontSizes.sm,
                }),
                fontWeight: TOKENS.fontWeights.black,
                letterSpacing: VALUE_LETTER_SPACING,
                color: TOKENS.colors.textPrimary,
                marginTop: TOKENS.spacing[2],
              }}>
                {fmtUsdCompact(hoveredSegment.value)}
              </div>
              <div style={{
                fontSize: TOKENS.fontSizes.micro,
                color: TOKENS.colors.accent,
                marginTop: TOKENS.spacing[2],
              }}>
                +{fmtUsdCompact(hoveredSegment.claimable)}
              </div>
            </>
          ) : (
            <>
              <div style={{
                fontSize: TOKENS.fontSizes.micro,
                fontWeight: TOKENS.fontWeights.bold,
                letterSpacing: TOKENS.letterSpacing.display,
                textTransform: 'uppercase',
                color: TOKENS.colors.textGhost,
              }}>
                Total
              </div>
              <div style={{
                fontSize: fitValue(mode, {
                  normal: TOKENS.fontSizes.md,
                  tight: TOKENS.fontSizes.sm,
                  limit: TOKENS.fontSizes.sm,
                }),
                fontWeight: TOKENS.fontWeights.black,
                letterSpacing: VALUE_LETTER_SPACING,
                color: TOKENS.colors.textPrimary,
                marginTop: TOKENS.spacing[2],
              }}>
                {fmtUsdCompact(total)}
              </div>
            </>
          )}
        </div>

        {/* Tooltip overlay */}
        {hoveredSegment && (
          <div
            style={{
              position: 'absolute',
              top: '-60px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: TOKENS.colors.bgTertiary,
              border: `1px solid ${TOKENS.colors.borderSubtle}`,
              borderRadius: TOKENS.radius.md,
              padding: `${TOKENS.spacing[3]}px ${TOKENS.spacing[4]}px`,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              zIndex: 10,
              pointerEvents: 'none',
              animation: 'fadeIn 150ms ease-out',
              minWidth: '140px',
            }}
          >
            <div style={{
              fontSize: TOKENS.fontSizes.micro,
              fontWeight: TOKENS.fontWeights.bold,
              textTransform: 'uppercase',
              color: hoveredSegment.color,
              marginBottom: TOKENS.spacing[2],
            }}>
              {hoveredSegment.name}
            </div>
            <div style={{
              fontSize: TOKENS.fontSizes.md,
              fontWeight: TOKENS.fontWeights.black,
              color: TOKENS.colors.textPrimary,
            }}>
              {fmtUsdCompact(hoveredSegment.value)}
            </div>
            <div style={{
              fontSize: TOKENS.fontSizes.micro,
              color: TOKENS.colors.textSecondary,
              marginTop: TOKENS.spacing[2],
            }}>
              {hoveredSegment.pct.toFixed(1)}% of portfolio
            </div>
            <div style={{
              fontSize: TOKENS.fontSizes.micro,
              color: TOKENS.colors.accent,
              marginTop: TOKENS.spacing[2],
            }}>
              +{fmtUsdCompact(hoveredSegment.claimable)} claimable
            </div>
          </div>
        )}
      </div>

      {/* Legend — clickable */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: TOKENS.spacing[2],
        width: '100%',
      }}>
        {data.map((vault) => (
          <div
            key={vault.id}
            onClick={() => onSegmentClick?.(vault.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: TOKENS.spacing[3],
              cursor: onSegmentClick ? 'pointer' : 'default',
              padding: `${TOKENS.spacing[2]}px`,
              borderRadius: TOKENS.radius.sm,
              transition: 'all 120ms ease-out',
              background: hoveredId === vault.id ? TOKENS.colors.bgTertiary : 'transparent',
            }}
            onMouseEnter={() => setHoveredId(vault.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: TOKENS.spacing[2],
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: vault.color,
              }} />
              <span style={{
                fontSize: TOKENS.fontSizes.xs,
                fontWeight: TOKENS.fontWeights.bold,
                color: hoveredId === vault.id ? TOKENS.colors.textPrimary : TOKENS.colors.textSecondary,
                transition: 'color 120ms ease-out',
              }}>
                {vault.name.replace('HashVault ', '')}
              </span>
            </div>
            <span style={{
              fontSize: TOKENS.fontSizes.xs,
              fontWeight: TOKENS.fontWeights.black,
              color: TOKENS.colors.textPrimary,
            }}>
              {vault.pct.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Generate deterministic historical data for sparkline (seeded for SSR/client consistency) */
function generateValueHistory(currentValue: number): number[] {
  const points = 30
  const data: number[] = []
  let value = currentValue * 0.92
  // Seeded pseudo-random for SSR/client consistency
  let seed = 12345
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
  for (let i = 0; i < points; i++) {
    value = value + (currentValue - value) * (0.08 + seededRandom() * 0.04)
    data.push(value)
  }
  data[data.length - 1] = currentValue
  return data
}

/** SparklineLabels — Dynamic labels with calculated change */
function SparklineLabels({ portfolioValue, data }: { portfolioValue: number; data: number[] }) {
  const startValue = data[0]
  const change = ((portfolioValue - startValue) / startValue) * 100
  const isPositive = change >= 0
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: TOKENS.spacing[2],
      fontFamily: TOKENS.fonts.mono,
      fontSize: TOKENS.fontSizes.micro,
      color: TOKENS.colors.textGhost,
    }}>
      <span>30d ago</span>
      <span style={{ color: isPositive ? TOKENS.colors.accent : TOKENS.colors.white }}>
        {isPositive ? '+' : ''}{change.toFixed(1)}%
      </span>
      <span>Today</span>
    </div>
  )
}

/** Mini stat for donut panel */
function MiniStat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
    }}>
      <div style={{
        fontSize: TOKENS.fontSizes.micro,
        fontWeight: TOKENS.fontWeights.bold,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: TOKENS.colors.textSecondary,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: TOKENS.fontSizes.sm,
        fontWeight: TOKENS.fontWeights.black,
        color: accent ? TOKENS.colors.accent : TOKENS.colors.textPrimary,
        letterSpacing: VALUE_LETTER_SPACING,
      }}>
        {value}
      </div>
    </div>
  )
}

/** SparklineChart — Pixel-perfect trend visualization */

/** SparklineChart — Clean minimal trend */
function SparklineChart({ data, mode, accent = false }: { data: number[]; mode: SmartFitMode; accent?: boolean }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  
  const width = 200
  const height = 40
  
  const points = data.map((value, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((value - min) / range) * height
  }))
  
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%' }}>
      <path d={line} fill="none" stroke={accent ? TOKENS.colors.accent : TOKENS.colors.white} strokeWidth="1.5" />
    </svg>
  )
}

/** MaturityTimeline — Clean minimal timeline */
function MaturityTimeline({ vaults, mode }: { vaults: ActiveVault[]; mode: SmartFitMode }) {
  const palette = [TOKENS.colors.accent, TOKENS.colors.white, 'rgba(255,255,255,0.45)', 'rgba(255,255,255,0.35)']
  const today = Date.now()
  
  const items = vaults
    .map(v => ({ ...v, days: Math.ceil((new Date(v.maturity).getTime() - today) / (1000 * 60 * 60 * 24)) }))
    .sort((a, b) => a.days - b.days)
    .slice(0, 4)
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[3] }}>
      {/* Timeline bar */}
      <div style={{ position: 'relative', height: '2px', background: TOKENS.colors.bgTertiary, margin: '16px 0' }}>
        {items.map((v, i) => {
          const pos = Math.min(100, (v.days / 365) * 100)
          return (
            <div key={v.id} style={{ position: 'absolute', left: `${pos}%`, top: '-5px', transform: 'translateX(-50%)' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: palette[i % 4], border: `2px solid ${TOKENS.colors.black}` }} />
            </div>
          )
        })}
      </div>
      
      {/* Vault list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((v, i) => (
          <div key={v.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: TOKENS.colors.bgTertiary, borderRadius: TOKENS.radius.sm }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: palette[i % 4] }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: TOKENS.colors.textPrimary }}>{v.name.replace('HashVault ', '')}</span>
            </div>
            <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: '11px', color: v.days < 30 ? TOKENS.colors.accent : TOKENS.colors.textSecondary }}>{v.days}d</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** LineChartArea — Full area chart with gradient fill */
function LineChartArea({ data, portfolioValue, mode }: { data: number[]; portfolioValue: number; mode: SmartFitMode }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const startValue = data[0]
  const change = ((portfolioValue - startValue) / startValue) * 100
  const isPositive = change >= 0

  // Chart dimensions
  const width = 400
  const height = 120
  const padding = { top: 10, right: 10, bottom: 20, left: 50 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Generate points
  const points = data.map((value, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartWidth,
    y: padding.top + chartHeight - ((value - min) / range) * chartHeight,
  }))

  // Create area path
  const areaPath = [
    `M ${points[0].x} ${padding.top + chartHeight}`,
    ...points.map((p) => `L ${p.x} ${p.y}`),
    `L ${points[points.length - 1].x} ${padding.top + chartHeight}`,
    'Z',
  ].join(' ')

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  // Y-axis labels
  const yLabels = [min, (min + max) / 2, max].map((v) => fmtUsdCompact(v))

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: TOKENS.spacing[2],
      }}>
        <span style={{
          fontFamily: TOKENS.fonts.mono,
          fontSize: TOKENS.fontSizes.micro,
          fontWeight: TOKENS.fontWeights.bold,
          letterSpacing: TOKENS.letterSpacing.display,
          textTransform: 'uppercase',
          color: TOKENS.colors.textSecondary,
        }}>
          Value Evolution (30D)
        </span>
        <span style={{
          fontSize: TOKENS.fontSizes.xs,
          fontWeight: TOKENS.fontWeights.bold,
          color: isPositive ? TOKENS.colors.accent : TOKENS.colors.white,
        }}>
          {isPositive ? '+' : ''}{change.toFixed(1)}%
        </span>
      </div>

      {/* Chart */}
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={TOKENS.colors.accent} stopOpacity="0.3" />
            <stop offset="100%" stopColor={TOKENS.colors.accent} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map((ratio, i) => (
          <line
            key={i}
            x1={padding.left}
            y1={padding.top + chartHeight * ratio}
            x2={width - padding.right}
            y2={padding.top + chartHeight * ratio}
            stroke={TOKENS.colors.borderSubtle}
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        ))}

        {/* Y-axis labels */}
        {[0, 0.5, 1].map((ratio, i) => (
          <text
            key={i}
            x={padding.left - 5}
            y={padding.top + chartHeight * (1 - ratio) + 3}
            textAnchor="end"
            fill={TOKENS.colors.textGhost}
            fontSize="9"
            fontFamily={TOKENS.fonts.mono}
          >
            {yLabels[i]}
          </text>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGradient)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={TOKENS.colors.accent}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Current value dot */}
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="4"
          fill={TOKENS.colors.accent}
          stroke={TOKENS.colors.black}
          strokeWidth="2"
        />

        {/* X-axis labels */}
        <text x={padding.left} y={height - 5} fill={TOKENS.colors.textGhost} fontSize="9" fontFamily={TOKENS.fonts.mono}>
          30d ago
        </text>
        <text x={width - padding.right} y={height - 5} textAnchor="end" fill={TOKENS.colors.textGhost} fontSize="9" fontFamily={TOKENS.fonts.mono}>
          Today
        </text>
      </svg>
    </div>
  )
}

/** MaturityTimelineCompact — Horizontal mini timeline */ 
function MaturityTimelineCompact({ vaults, mode }: { vaults: ActiveVault[]; mode: SmartFitMode }) {
  const palette = [TOKENS.colors.accent, TOKENS.colors.white, 'rgba(255,255,255,0.45)', 'rgba(255,255,255,0.35)']
  const today = Date.now()

  const items = vaults
    .map(v => ({ ...v, days: Math.ceil((new Date(v.maturity).getTime() - today) / (1000 * 60 * 60 * 24)) }))
    .sort((a, b) => a.days - b.days)
    .slice(0, 4)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[2] }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontFamily: TOKENS.fonts.mono,
          fontSize: TOKENS.fontSizes.micro,
          fontWeight: TOKENS.fontWeights.bold,
          letterSpacing: TOKENS.letterSpacing.display,
          textTransform: 'uppercase',
          color: TOKENS.colors.textSecondary,
        }}>
          Maturity Timeline
        </span>
        <span style={{
          fontSize: TOKENS.fontSizes.micro,
          color: TOKENS.colors.textGhost,
        }}>
          Next: {items[0]?.days ?? 0} days
        </span>
      </div>

      {/* Timeline track */}
      <div style={{
        position: 'relative',
        height: '24px',
        background: TOKENS.colors.bgTertiary,
        borderRadius: TOKENS.radius.sm,
        overflow: 'hidden',
      }}>
        {items.map((v, i) => {
          const pos = Math.min(95, (v.days / 365) * 100)
          return (
            <div
              key={v.id}
              style={{
                position: 'absolute',
                left: `${pos}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: palette[i % 4],
                border: `2px solid ${TOKENS.colors.black}`,
              }} />
            </div>
          )
        })}
      </div>

      {/* Labels */}
      <div style={{
        display: 'flex',
        gap: TOKENS.spacing[3],
        flexWrap: 'wrap',
      }}>
        {items.map((v, i) => (
          <div key={v.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: palette[i % 4],
            }} />
            <span style={{
              fontSize: '10px',
              color: TOKENS.colors.textSecondary,
            }}>
              {v.name.replace('HashVault ', '')}: {v.days}d
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** AvailableVaultTeaser — Compact teaser for available vault opportunities */
function AvailableVaultTeaser({
  vault,
  index,
  mode,
  onClick,
}: {
  vault: AvailableVault
  index: number
  mode: SmartFitMode
  onClick?: () => void
}) {
  const accentColor = index === 0 ? TOKENS.colors.accent : TOKENS.colors.white

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
      style={{
        background: TOKENS.colors.black,
        borderRadius: '8px',
        padding: mode === 'limit' ? '8px 10px' : '10px 12px',
        border: `1px solid ${TOKENS.colors.borderSubtle}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 120ms ease-out',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: TOKENS.spacing[2],
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = TOKENS.colors.accent
          e.currentTarget.style.background = TOKENS.colors.bgTertiary
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = TOKENS.colors.borderSubtle
        e.currentTarget.style.background = TOKENS.colors.black
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: TOKENS.spacing[2],
        minWidth: 0,
      }}>
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: accentColor,
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: mode === 'limit' ? '11px' : '12px',
          fontWeight: TOKENS.fontWeights.bold,
          color: TOKENS.colors.textPrimary,
          textTransform: 'uppercase',
          letterSpacing: VALUE_LETTER_SPACING,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {vault.name.replace('HashVault ', '')}
        </span>
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: TOKENS.spacing[2],
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: '12px',
          fontWeight: TOKENS.fontWeights.black,
          color: accentColor,
          letterSpacing: VALUE_LETTER_SPACING,
        }}>
          {vault.apr}%
        </span>
        <span style={{
          fontSize: '10px',
          color: TOKENS.colors.textGhost,
        }}>
          APY
        </span>
      </div>
    </div>
  )
}

