import { describe, expect, it } from 'vitest'
import { evaluateRules, parseConfigToRules } from './rules'
import type { RulesConfig } from './rules'

const BASE_MARKET = {
  btcPrice: 100_000,
  btc24hChange: 2,
  btc7dChange: 8,
  usdcApy: 5,
  usdtApy: 3,
  btcApy: 0,
  fearGreed: 70,
  fearLabel: 'Greed',
  miningHashprice: null,
}

const BASE_CFG: RulesConfig = {
  btcEntry: 80_000,
  profitLevels: [{ mult: 1.25, pct: 20 }],
  maxBtcSellPct: 30,
  fearGreedLow: 20,
  fearGreedHigh: 65,
  yieldDriftThreshold: 1,
  allocationDriftThreshold: 3,
  cooldowns: {},
}

function parsedParams(signal: ReturnType<typeof evaluateRules>[number]) {
  return JSON.parse(signal.paramsJson ?? '{}') as Record<string, unknown>
}

describe('evaluateRules — weights + regime in every paramsJson', () => {
  it('TAKE_PROFIT carries weights summing to 100 and a valid regime', () => {
    const signals = evaluateRules(BASE_MARKET, new Set(), BASE_CFG)
    const tp = signals.find(s => s.type === 'TAKE_PROFIT')
    expect(tp).toBeDefined()
    const p = parsedParams(tp!)
    expect(Array.isArray(p.weights)).toBe(true)
    expect((p.weights as number[]).reduce((a, b) => a + b, 0)).toBe(100)
    expect(['BULL', 'SIDEWAYS', 'BEAR']).toContain(p.regime)
  })

  it('REDUCE_RISK carries weights summing to 100', () => {
    const signals = evaluateRules(
      { ...BASE_MARKET, fearGreed: 70, btc7dChange: 0 },
      new Set(),
      { ...BASE_CFG, fearGreedHigh: 65 }
    )
    const rr = signals.find(s => s.type === 'REDUCE_RISK')
    expect(rr).toBeDefined()
    const w = parsedParams(rr!).weights as number[]
    expect(w.reduce((a, b) => a + b, 0)).toBe(100)
  })

  it('INCREASE_BTC carries weights summing to 100', () => {
    const signals = evaluateRules(
      { ...BASE_MARKET, fearGreed: 10, btc7dChange: -8 },
      new Set(),
      { ...BASE_CFG, fearGreedLow: 20 }
    )
    const ib = signals.find(s => s.type === 'INCREASE_BTC')
    expect(ib).toBeDefined()
    const w = parsedParams(ib!).weights as number[]
    expect(w.reduce((a, b) => a + b, 0)).toBe(100)
  })

  it('YIELD_ROTATE carries weights summing to 100', () => {
    const signals = evaluateRules(
      { ...BASE_MARKET, usdcApy: 8, usdtApy: 3, fearGreed: 50, btc7dChange: 1 },
      new Set(),
      BASE_CFG
    )
    const yr = signals.find(s => s.type === 'YIELD_ROTATE')
    expect(yr).toBeDefined()
    const w = parsedParams(yr!).weights as number[]
    expect(w.reduce((a, b) => a + b, 0)).toBe(100)
  })

  it('REBALANCE uses regime-specific weights', () => {
    const bullMarket = { ...BASE_MARKET, fearGreed: 75, btc7dChange: 12 }
    const signals = evaluateRules(bullMarket, new Set(), { ...BASE_CFG, allocationDriftThreshold: 3 })
    const rb = signals.find(s => s.type === 'REBALANCE')
    expect(rb).toBeDefined()
    const p = parsedParams(rb!)
    expect(p.regime).toBe('BULL')
    expect(p.weights).toEqual([55, 25, 20])
  })

  it('REBALANCE in BEAR regime uses defensive weights', () => {
    const bearMarket = { ...BASE_MARKET, fearGreed: 20, btc7dChange: -15 }
    const signals = evaluateRules(bearMarket, new Set(), { ...BASE_CFG, allocationDriftThreshold: 3 })
    const rb = signals.find(s => s.type === 'REBALANCE')
    expect(rb).toBeDefined()
    const p = parsedParams(rb!)
    expect(p.regime).toBe('BEAR')
    expect(p.weights).toEqual([30, 45, 25])
  })

  it('parseConfigToRules applies correct defaults', () => {
    const cfg = parseConfigToRules({})
    expect(cfg.btcEntry).toBe(95000)
    expect(cfg.fearGreedLow).toBe(20)
    expect(cfg.fearGreedHigh).toBe(80)
  })
})
