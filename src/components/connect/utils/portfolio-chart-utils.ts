/**
 * Helpers for portfolio summary charts (maturity + sparkline history).
 */

/** Days remaining until a target date (floored at 0). */
export function getDaysToMaturity(maturityDate: string | Date): number {
  const today = Date.now()
  const target = new Date(maturityDate).getTime()
  return Math.max(0, Math.ceil((target - today) / (1000 * 60 * 60 * 24)))
}

/**
 * Mock value history for portfolio evolution chart.
 * Seeded pseudo-random for SSR/client consistency.
 */
export function generateValueHistory(currentValue: number): number[] {
  const points = 30
  const data: number[] = []
  let value = currentValue * 0.92

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
