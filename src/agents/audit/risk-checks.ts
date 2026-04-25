/**
 * Risk check functions for signal validation
 */

interface RiskResult {
  score: number
  notes: string
  block: boolean
}

interface Signal {
  id: string
  type: string
  description: string
  riskScore: number | null
  paramsJson: string | null
}

interface MarketContext {
  btcPrice: number
  fearGreed: number
  usdcApy: number
  usdtApy: number
}

export function runRiskChecks(signal: Signal, market: MarketContext | null): RiskResult {
  let score = signal.riskScore ?? 50
  const warnings: string[] = []
  let block = false

  // No market data = higher risk
  if (!market) {
    score = Math.min(100, score + 20)
    warnings.push('No market data available for validation')
    return { score, notes: warnings.join('; '), block: false }
  }

  // TAKE_PROFIT during extreme fear = risky (selling low)
  if (signal.type === 'TAKE_PROFIT' && market.fearGreed < 20) {
    score = Math.min(100, score + 30)
    warnings.push(`Taking profit during extreme fear (F&G: ${market.fearGreed}) — may be selling near bottom`)
    if (market.fearGreed < 10) block = true
  }

  // INCREASE_BTC during extreme greed = risky (buying high)
  if (signal.type === 'INCREASE_BTC' && market.fearGreed > 80) {
    score = Math.min(100, score + 25)
    warnings.push(`Increasing BTC during extreme greed (F&G: ${market.fearGreed}) — elevated reversal risk`)
    if (market.fearGreed > 90) block = true
  }

  // YIELD_ROTATE with very low yields = not worth the gas/risk
  if (signal.type === 'YIELD_ROTATE') {
    const maxYield = Math.max(market.usdcApy, market.usdtApy)
    if (maxYield < 2) {
      score = Math.min(100, score + 15)
      warnings.push(`Best yield is only ${maxYield.toFixed(2)}% — rotation may not be worth the risk`)
    }
  }

  // Stablecoin depeg check (crude: if yields spike abnormally)
  if (market.usdcApy > 30 || market.usdtApy > 30) {
    score = Math.min(100, score + 40)
    warnings.push(`Abnormally high stablecoin yield detected (USDC: ${market.usdcApy.toFixed(1)}%, USDT: ${market.usdtApy.toFixed(1)}%) — potential depeg/protocol issue`)
    block = true
  }

  // Cap score
  score = Math.max(0, Math.min(100, score))

  return {
    score,
    notes: warnings.length > 0 ? warnings.join('; ') : 'No additional risks identified',
    block,
  }
}
