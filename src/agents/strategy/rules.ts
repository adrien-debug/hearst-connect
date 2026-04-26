/**
 * Deterministic rebalancing rules — reads thresholds from agent_config
 */

import { createSignal } from './signals'
import type { RebalanceSignal, SignalType } from '../shared/types'

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

export interface RulesConfig {
  btcEntry: number
  profitLevels: Array<{ mult: number; pct: number }>
  maxBtcSellPct: number
  fearGreedLow: number
  fearGreedHigh: number
  yieldDriftThreshold: number
  allocationDriftThreshold: number
  cooldowns: Partial<Record<SignalType, number>>
}

export function parseConfigToRules(raw: Record<string, string>): RulesConfig {
  let profitLevels: Array<{ mult: number; pct: number }> = []
  try { profitLevels = JSON.parse(raw.profit_levels || '[]') } catch { profitLevels = [] }
  let cooldowns: Partial<Record<SignalType, number>> = {}
  try { cooldowns = JSON.parse(raw.signal_cooldown_hours || '{}') } catch { cooldowns = {} }

  return {
    btcEntry: parseFloat(raw.btc_entry_price || '95000'),
    profitLevels,
    maxBtcSellPct: parseFloat(raw.max_btc_sell_pct || '20'),
    fearGreedLow: parseFloat(raw.fear_greed_low || '20'),
    fearGreedHigh: parseFloat(raw.fear_greed_high || '80'),
    yieldDriftThreshold: parseFloat(raw.yield_drift_threshold || '2'),
    allocationDriftThreshold: parseFloat(raw.allocation_drift_threshold || '5'),
    cooldowns,
  }
}

export function evaluateRules(
  market: MarketState,
  pendingTypes: Set<string>,
  cfg: RulesConfig,
  recentSignalTimestamps?: Partial<Record<SignalType, number>>
): Omit<RebalanceSignal, 'createdBy'>[] {
  const signals: Omit<RebalanceSignal, 'createdBy'>[] = []
  const now = Date.now()

  const onCooldown = (type: SignalType): boolean => {
    const hours = cfg.cooldowns[type]
    const lastTs = recentSignalTimestamps?.[type]
    if (!hours || !lastTs) return false
    return (now - lastTs) < hours * 3600_000
  }

  // TAKE_PROFIT — BTC crossed a profit level
  if (!pendingTypes.has('TAKE_PROFIT') && !onCooldown('TAKE_PROFIT')) {
    for (const level of cfg.profitLevels) {
      const pctToSell = Math.min(level.pct, cfg.maxBtcSellPct)
      const target = cfg.btcEntry * level.mult
      if (market.btcPrice >= target && market.fearGreed >= 40) {
        signals.push(createSignal(
          'TAKE_PROFIT',
          `BTC à $${market.btcPrice.toFixed(0)} a franchi +${((level.mult - 1) * 100).toFixed(0)}% vs entrée ($${cfg.btcEntry}). Vendre ${pctToSell}% de la poche BTC.`,
          30,
          { targetPrice: target, pctToSell, currentPrice: market.btcPrice }
        ))
        break
      }
    }
  }

  // REDUCE_RISK — extreme greed
  if (!pendingTypes.has('REDUCE_RISK') && !onCooldown('REDUCE_RISK') && market.fearGreed >= cfg.fearGreedHigh) {
    signals.push(createSignal(
      'REDUCE_RISK',
      `Fear & Greed à ${market.fearGreed} (${market.fearLabel}). Marché surchauffé — réduire l'exposition BTC.`,
      45,
      { fearGreed: market.fearGreed }
    ))
  }

  // INCREASE_BTC — extreme fear
  if (!pendingTypes.has('INCREASE_BTC') && !onCooldown('INCREASE_BTC') && market.fearGreed <= cfg.fearGreedLow) {
    signals.push(createSignal(
      'INCREASE_BTC',
      `Fear & Greed à ${market.fearGreed} (${market.fearLabel}). Zone de peur historique — envisager d'augmenter l'allocation BTC.`,
      55,
      { fearGreed: market.fearGreed }
    ))
  }

  // YIELD_ROTATE — significant yield difference
  if (!pendingTypes.has('YIELD_ROTATE') && !onCooldown('YIELD_ROTATE')) {
    const yieldDiff = Math.abs(market.usdcApy - market.usdtApy)
    if (yieldDiff >= cfg.yieldDriftThreshold) {
      const better = market.usdcApy > market.usdtApy ? 'USDC' : 'USDT'
      const worse = better === 'USDC' ? 'USDT' : 'USDC'
      signals.push(createSignal(
        'YIELD_ROTATE',
        `${better} APY (${Math.max(market.usdcApy, market.usdtApy).toFixed(2)}%) est +${yieldDiff.toFixed(2)}% vs ${worse}. Rotation stablecoin recommandée.`,
        20,
        { usdcApy: market.usdcApy, usdtApy: market.usdtApy, diff: yieldDiff }
      ))
    }
  }

  // REBALANCE — large BTC move = allocation drift
  if (!pendingTypes.has('REBALANCE') && !onCooldown('REBALANCE') && Math.abs(market.btc7dChange) >= cfg.allocationDriftThreshold * 2) {
    signals.push(createSignal(
      'REBALANCE',
      `BTC a bougé de ${market.btc7dChange.toFixed(1)}% en 7 jours. L'allocation a probablement drifté — rebalance vers la cible.`,
      35,
      { btc7dChange: market.btc7dChange }
    ))
  }

  return signals
}
