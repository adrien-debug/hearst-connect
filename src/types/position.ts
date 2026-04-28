/** Position data types — aligned with backend API nomenclature */

export interface UnlockTimeline {
  daysRemaining: number
  maturityDate: string
  progressPercent: number
}

export interface EpochData {
  currentEpoch: number
  epochProgress: number
  /** ISO lock / maturity anchor from on-chain `userInfo` when available */
  epochEndsAt?: string
}

export interface PositionData {
  capitalDeployed: number
  /** Yield currently pending claim (on-chain pendingRewards). */
  accruedYield: number
  /** Cumulative yield distributed to this position since inception. On-chain
   * positions need event indexing to compute this; falls back to accruedYield
   * until the indexer ships. */
  cumulativeYieldPaid: number
  positionValue: number
  unlockTimeline: UnlockTimeline
  epoch: EpochData
  canWithdraw: boolean
  isTargetReached: boolean
  apr: number
  target: string
}

export interface PositionError {
  code: 'WALLET_NOT_CONNECTED' | 'VAULT_NOT_FOUND' | 'FETCH_ERROR'
  message: string
}
