/**
 * Deterministic rebalancing rules — reads thresholds from agent_config
 */

import { createSignal } from './signals'
import type { RebalanceSignal, SignalType } from '../shared/types'

type Regime = 'BULL' | 'SIDEWAYS' | 'BEAR'

// Prime vault: [RWA Mining, USDC Yield, BTC Hedged] — must sum to 100
const REGIME_WEIGHTS: Record<Regime, number[]> = {
  BULL:     [55, 25, 20],
  SIDEWAYS: [40, 30, 30],
  BEAR:     [30, 45, 25],
}

const SIGNAL_WEIGHTS: Record<SignalType, (r: Regime) => number[]> = {
  TAKE_PROFIT:  ()  => [40, 45, 15], // lock-in gains: reduce BTC, park in yield
  REDUCE_RISK:  ()  => [30, 45, 25], // defensive shift regardless of regime
  INCREASE_BTC: ()  => [35, 25, 40], // accumulate BTC during fear
  YIELD_ROTATE: ()  => [30, 50, 20], // rotate mining → USDC yield
  REBALANCE:    (r) => REGIME_WEIGHTS[r], // back to regime target
}

function determineRegime(fearGreed: number, btc7dChange: number): Regime {
  if (fearGreed >= 60 && btc7dChange >= 3) return 'BULL'
  if (fearGreed <= 35 || btc7dChange <= -5) return 'BEAR'
  return 'SIDEWAYS'
}

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
  const regime = determineRegime(market.fearGreed, market.btc7dChange)

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
          { targetPrice: target, pctToSell, currentPrice: market.btcPrice, weights: SIGNAL_WEIGHTS.TAKE_PROFIT(regime), regime }
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
      { fearGreed: market.fearGreed, weights: SIGNAL_WEIGHTS.REDUCE_RISK(regime), regime }
    ))
  }

  // INCREASE_BTC — extreme fear
  if (!pendingTypes.has('INCREASE_BTC') && !onCooldown('INCREASE_BTC') && market.fearGreed <= cfg.fearGreedLow) {
    signals.push(createSignal(
      'INCREASE_BTC',
      `Fear & Greed à ${market.fearGreed} (${market.fearLabel}). Zone de peur historique — envisager d'augmenter l'allocation BTC.`,
      55,
      { fearGreed: market.fearGreed, weights: SIGNAL_WEIGHTS.INCREASE_BTC(regime), regime }
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
        { usdcApy: market.usdcApy, usdtApy: market.usdtApy, diff: yieldDiff, weights: SIGNAL_WEIGHTS.YIELD_ROTATE(regime), regime }
      ))
    }
  }

  // REBALANCE — large BTC move = allocation drift
  if (!pendingTypes.has('REBALANCE') && !onCooldown('REBALANCE') && Math.abs(market.btc7dChange) >= cfg.allocationDriftThreshold * 2) {
    signals.push(createSignal(
      'REBALANCE',
      `BTC a bougé de ${market.btc7dChange.toFixed(1)}% en 7 jours. L'allocation a probablement drifté — rebalance vers la cible.`,
      35,
      { btc7dChange: market.btc7dChange, weights: SIGNAL_WEIGHTS.REBALANCE(regime), regime }
    ))
  }

  return signals
}
