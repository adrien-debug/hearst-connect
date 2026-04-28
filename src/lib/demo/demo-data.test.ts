import { describe, it, expect } from 'vitest'
import {
  DEMO_POSITIONS,
  DEMO_ACTIVITY,
  getDemoPositionData,
} from './demo-data'

describe('DEMO_POSITIONS', () => {
  it('has at least one position per product', () => {
    const productIds = new Set(DEMO_POSITIONS.map((p) => p.vaultId))
    expect(productIds.has('demo-prime')).toBe(true)
    expect(productIds.has('demo-growth')).toBe(true)
  })

  it('uses unique cohort ids', () => {
    const ids = DEMO_POSITIONS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keeps cohorts of the same product distinguishable by vaultName', () => {
    const primeNames = DEMO_POSITIONS
      .filter((p) => p.vaultId === 'demo-prime')
      .map((p) => p.vaultName)
    expect(new Set(primeNames).size).toBe(primeNames.length)
  })
})

describe('DEMO_ACTIVITY', () => {
  it('attributes events to a specific cohort vaultName (not just productId)', () => {
    // Regression guard for the cohort-bleed fix: if events were tagged only
    // with vaultId, Prime #1 detail page would show Prime #2 deposit events.
    const primeOneEvents = DEMO_ACTIVITY.filter((a) => a.vaultName === 'Hearst Prime #1')
    const primeTwoEvents = DEMO_ACTIVITY.filter((a) => a.vaultName === 'Hearst Prime #2')
    expect(primeOneEvents.length).toBeGreaterThan(0)
    expect(primeTwoEvents.length).toBeGreaterThan(0)
    // No event should match both cohort names.
    for (const a of DEMO_ACTIVITY) {
      expect(a.vaultName).toBeTruthy()
    }
  })

  it('returns events sorted descending by timestamp', () => {
    for (let i = 1; i < DEMO_ACTIVITY.length; i++) {
      expect(DEMO_ACTIVITY[i - 1].timestamp).toBeGreaterThanOrEqual(DEMO_ACTIVITY[i].timestamp)
    }
  })
})

describe('getDemoPositionData', () => {
  it('returns cumulativeYieldPaid that mirrors the cohort currentYield (not zero)', () => {
    // Regression guard for the live-fallback fix: the demo path must always
    // expose cumulative yield, otherwise the polished "Yield paid" KPI lies.
    const primeOne = DEMO_POSITIONS.find((p) => p.id === 'demo-pos-prime-1')!
    const data = getDemoPositionData('demo-prime', 'demo-pos-prime-1')
    expect(data).not.toBeNull()
    expect(data!.cumulativeYieldPaid).toBe(primeOne.currentYield)
    expect(data!.cumulativeYieldPaid).toBeGreaterThan(0)
  })

  it('falls back to first position when positionId is omitted', () => {
    const data = getDemoPositionData('demo-prime')
    expect(data).not.toBeNull()
    // When called without positionId, picks the first position for the vault.
    const firstForVault = DEMO_POSITIONS.find((p) => p.vaultId === 'demo-prime')!
    expect(data!.capitalDeployed).toBe(firstForVault.deposited)
  })

  it('returns null when no position matches', () => {
    expect(getDemoPositionData('does-not-exist')).toBeNull()
    expect(getDemoPositionData('demo-prime', 'does-not-exist')).toBeNull()
  })
})
