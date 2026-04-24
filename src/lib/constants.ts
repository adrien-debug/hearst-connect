/**
 * Application constants - centralized to avoid magic numbers
 */

// ============================================
// Time constants (in milliseconds)
// ============================================
export const MS_PER_SECOND = 1000
export const MS_PER_MINUTE = 60 * MS_PER_SECOND
export const MS_PER_HOUR = 60 * MS_PER_MINUTE
export const MS_PER_DAY = 24 * MS_PER_HOUR

// ============================================
// Time constants (in days/months)
// ============================================
export const DAYS_PER_YEAR = 365
export const MONTHS_PER_YEAR = 12

// ============================================
// Polling intervals (blockchain)
// ============================================
export const POLL_INTERVAL_BLOCK = 12_000      // 12s - block time on Base
export const POLL_INTERVAL_SLOW = 60_000       // 60s - for less volatile data (APR)
export const POLL_INTERVAL_APPROVE = 3_000     // 3s - for approval flow

// ============================================
// Session durations
// ============================================
export const SESSION_DURATION_MS = 24 * MS_PER_HOUR  // 24 hours

// ============================================
// Thresholds
// ============================================
export const MIN_CLAIMABLE_THRESHOLD = 0.01

// ============================================
// Simulation limits
// ============================================
export const PROJECTION_SIM_MAX_MONTHS = 120
export const PROJECTION_SIM_MAX_PRICE = 1_000_000

// ============================================
// APR bounds
// ============================================
export const MIN_APR_CAP = 0.05
export const MAX_APR_CAP = 0.42

// ============================================
// Calculation constants
// ============================================
export const PRICE_FACTOR_EXPONENT = 0.85
export const HORIZON_DIVISOR = 24

// ============================================
// Token constants
// ============================================
export const USDC_DECIMALS = 6

// ============================================
// Epoch progress constants
// ============================================
export const EPOCH_PROGRESS_NEAR_END = 95
export const EPOCH_PROGRESS_DEFAULT = 50

// ============================================
// Basis points divisor
// ============================================
export const BASIS_POINTS_DIVISOR = 100
