/**
 * Deterministic rebalancing rules
 * Returns candidate signals based on market conditions
 */

import { DEFAULT_THRESHOLDS } from '../shared/types'
import { createSignal } from './signals'
import type { RebalanceSignal } from '../shared/types'

interface MarketState {
  btcPrice: number
  btc24hChange: number
  btc7dChange: number
  usdcApy: number
  usdtApy: number
  btcApy: number
  fearGreed: number
  fearLabel: string
  miningHashprice: number | null
}

// BTC entry price reference — configurable via env
const BTC_ENTRY = parseFloat(process.env.BTC_ENTRY_PRICE || '95000')

// Profit-taking thresholds (multipliers of entry)
const PROFIT_LEVELS = [
  { mult: 1.15, pct: 15 },
  { mult: 1.35, pct: 20 },
  { mult: 1.55, pct: 20 },
  { mult: 1.80, pct: 20 },
]

export function evaluateRules(
  market: MarketState,
  pendingTypes: Set<string>
): Omit<RebalanceSignal, 'createdBy'>[] {
  const signals: Omit<RebalanceSignal, 'createdBy'>[] = []
  const t = DEFAULT_THRESHOLDS

  // TAKE_PROFIT — BTC crossed a profit level
  if (!pendingTypes.has('TAKE_PROFIT')) {
    for (const level of PROFIT_LEVELS) {
      const target = BTC_ENTRY * level.mult
      if (market.btcPrice >= target) {
        signals.push(createSignal(
          'TAKE_PROFIT',
          `BTC at $${market.btcPrice.toFixed(0)} crossed ${(level.mult * 100 - 100).toFixed(0)}% above entry ($${BTC_ENTRY}). Sell ${level.pct}% of BTC pocket.`,
          30,
          { targetPrice: target, pctToSell: level.pct, currentPrice: market.btcPrice }
        ))
        break
      }
    }
  }

  // REDUCE_RISK — extreme greed
  if (!pendingTypes.has('REDUCE_RISK') && market.fearGreed >= t.fearGreedHigh) {
    signals.push(createSignal(
      'REDUCE_RISK',
      `Fear & Greed at ${market.fearGreed} (${market.fearLabel}). Market overheated — consider reducing BTC exposure.`,
      45,
      { fearGreed: market.fearGreed }
    ))
  }

  // INCREASE_BTC — extreme fear
  if (!pendingTypes.has('INCREASE_BTC') && market.fearGreed <= t.fearGreedLow) {
    signals.push(createSignal(
      'INCREASE_BTC',
      `Fear & Greed at ${market.fearGreed} (${market.fearLabel}). Historically good entry zone — consider increasing BTC allocation.`,
      55,
      { fearGreed: market.fearGreed }
    ))
  }

  // YIELD_ROTATE — significant yield difference between stablecoins
  if (!pendingTypes.has('YIELD_ROTATE')) {
    const yieldDiff = Math.abs(market.usdcApy - market.usdtApy)
    if (yieldDiff >= t.yieldDriftPercent) {
      const better = market.usdcApy > market.usdtApy ? 'USDC' : 'USDT'
      const worse = better === 'USDC' ? 'USDT' : 'USDC'
      signals.push(createSignal(
        'YIELD_ROTATE',
        `${better} APY (${Math.max(market.usdcApy, market.usdtApy).toFixed(2)}%) is ${yieldDiff.toFixed(2)}% higher than ${worse}. Consider rotating stablecoin allocation.`,
        20,
        { usdcApy: market.usdcApy, usdtApy: market.usdtApy, diff: yieldDiff }
      ))
    }
  }

  // REBALANCE — large BTC price move suggests allocation drift
  if (!pendingTypes.has('REBALANCE') && Math.abs(market.btc7dChange) >= t.allocationDriftPercent * 2) {
    signals.push(createSignal(
      'REBALANCE',
      `BTC moved ${market.btc7dChange.toFixed(1)}% in 7 days. Portfolio allocation likely drifted — review and rebalance to target.`,
      35,
      { btc7dChange: market.btc7dChange }
    ))
  }

  return signals
}
