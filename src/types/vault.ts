import type { Address, Chain } from 'viem'

/** Product family — Hearst Connect ships 2 products (Prime / Growth).
 * Prime = moderate risk, 12% APY, 36% cumulative target, 3-pocket strategy.
 * Growth = higher risk, 15% APY, 45% cumulative target, 2-pocket strategy. */
export type ProductFamily = 'prime' | 'growth'

/** Market regime drives dynamic allocation rebalance.
 * One regime is "currently active" at a given time across the platform. */
export type MarketRegime = 'bull' | 'sideways' | 'bear'

/** Sub-allocation slice for the vault Composition view. Sums should ≈ 100. */
export interface VaultCompositionSlice {
  label: string
  /** 0–100, percent of the vault notional allocated to this slice. */
  pct: number
  /** Optional hue override; falls back to CHART_PALETTE rotation. */
  color?: string
}

/** Geographic distribution slice (Frontier vault, etc). Sums should ≈ 100. */
export interface VaultGeoSlice {
  region: string
  pct: number
}

/** Underlying exposure breakdown (dashboard recap). The 3 canonical buckets are
 * BTC-correlated, Mining infrastructure, and Stablecoin yield. Sums ≈ 100. */
export interface UnderlyingExposureSlice {
  label: 'BTC-correlated' | 'Mining infrastructure' | 'Stablecoin yield'
  pct: number
}

/** Per-regime allocation override. The vault re-weights its pockets based on
 * the active market regime. Each regime maps pocket label → pct (sums ≈ 100). */
export type RebalanceWeights = Record<MarketRegime, Array<{ label: string; pct: number; pitch: string }>>

/** Monthly historical net yield (% APR equivalent for that month). */
export interface VaultMonthlyReturn {
  /** ISO yyyy-mm — month-end snapshot. */
  month: string
  /** Annualized yield observed for that month, in percent. */
  yieldPct: number
}

/** Optional enrichment fields surfaced in the vault detail page. All optional
 * so live DB-driven vaults remain compatible. */
export interface VaultMeta {
  /** Vault inception (epoch ms). */
  inception?: number
  /** Total value locked across all subscribers (USD). */
  tvl?: number
  /** Number of distinct investor wallets. */
  investorCount?: number
  /** 12–24 monthly snapshots, oldest first. */
  historicalReturns?: VaultMonthlyReturn[]
  /** Sub-strategy breakdown for the Composition card. */
  composition?: VaultCompositionSlice[]
  /** Region distribution for vaults with geo exposure. */
  geo?: VaultGeoSlice[]
  /** Maximum drawdown observed since inception (%). */
  maxDrawdown?: number
  /** Realized annualized volatility (%). */
  volatility?: number
  /** Realized Sharpe (annualized). */
  sharpe?: number
  /** Cumulative net yield since inception (USD distributed across all positions). */
  cumulativeYield?: number
  /** Penalty (basis points or % wording) for early withdrawal. */
  earlyWithdrawalPenalty?: string
  /** Custodian / counterparty disclosure. */
  custodian?: string
  /** Audit reports (label + URL). */
  auditReports?: Array<{ label: string; url: string }>
  /** Hearst Connect product family. Drives invest flow grouping. */
  productFamily?: ProductFamily
  /** Cumulative target as a number (e.g. 36 for 36%). The vault closes early
   * once this cumulative yield is reached. */
  cumulativeTarget?: number
  /** Underlying exposure breakdown shown on the dashboard "Allocation · recap"
   * section. Sums ≈ 100. */
  underlyingExposure?: UnderlyingExposureSlice[]
  /** Per-regime pocket weights. The vault re-weights dynamically. */
  rebalanceWeights?: RebalanceWeights
  /** Capital recovery safeguard config — if principal is below initial deposit
   * at maturity, mining infrastructure operates `recoveryYears` more. */
  capitalRecoveryYears?: number
  /** Short pitch line (used on Invest > Select cards). */
  productPitch?: string
}

export interface VaultConfig extends VaultMeta {
  id: string
  name: string
  description?: string
  vaultAddress: Address
  usdcAddress: Address
  chain: Chain
  apr: number
  target: string
  lockPeriodDays: number
  minDeposit: number
  strategy: string
  fees: string
  risk: string
  image?: string
  isTest: boolean
  isActive: boolean
  createdAt: number
}

export type VaultConfigInput = Omit<VaultConfig, 'id' | 'createdAt' | 'isActive'> & {
  id?: string
}
