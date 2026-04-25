/**
 * Signal generation helpers
 */

import type { RebalanceSignal, SignalType } from '../shared/types'

export function createSignal(
  type: SignalType,
  description: string,
  riskScore: number,
  params?: Record<string, unknown>
): Omit<RebalanceSignal, 'createdBy'> {
  return {
    type,
    description,
    riskScore: Math.max(0, Math.min(100, riskScore)),
    paramsJson: params ? JSON.stringify(params) : undefined,
  }
}
