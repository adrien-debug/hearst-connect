import { describe, it, expect } from 'vitest'
import { resolveCumulativeYieldPaid } from './usePositionData'

describe('resolveCumulativeYieldPaid', () => {
  it('returns the backend cohort lifetime yield when a matching position exists', () => {
    const matchingPosition = { currentYield: 28_120 }
    const accruedYield = 0
    expect(resolveCumulativeYieldPaid(matchingPosition, accruedYield)).toBe(28_120)
  })

  it('falls back to on-chain accruedYield when no matching position is found', () => {
    expect(resolveCumulativeYieldPaid(undefined, 164.38)).toBe(164.38)
    expect(resolveCumulativeYieldPaid(null, 0)).toBe(0)
  })

  it('prefers the cohort yield even when accruedYield is non-zero (regression guard)', () => {
    // Pre-fix bug: live mode dropped cumulative to pendingRewards (= accruedYield)
    // immediately after a claim, hiding the user's lifetime distribution total.
    const matchingPosition = { currentYield: 28_120 }
    const accruedYieldAfterClaim = 0
    expect(resolveCumulativeYieldPaid(matchingPosition, accruedYieldAfterClaim)).toBe(28_120)
  })
})
