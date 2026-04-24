/**
 * Calculate days remaining until a target date
 */
export function getDaysToMaturity(maturityDate: string | Date): number {
  const today = Date.now()
  const target = new Date(maturityDate).getTime()
  return Math.max(0, Math.ceil((target - today) / (1000 * 60 * 60 * 24)))
}
