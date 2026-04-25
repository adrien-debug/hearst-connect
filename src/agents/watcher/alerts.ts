/**
 * Alert thresholds and trigger logic for the Market Watcher
 */

import { pushWebhook } from '../shared/hearst-api'
import { sendSlackNotification, formatCriticalAlert } from '../shared/slack'
import type { MarketSnapshot } from '../shared/types'
import { DEFAULT_THRESHOLDS } from '../shared/types'

let previousSnapshot: MarketSnapshot | null = null

export async function checkAlerts(current: MarketSnapshot) {
  if (!previousSnapshot) {
    previousSnapshot = current
    return
  }

  const prev = previousSnapshot
  const t = DEFAULT_THRESHOLDS

  // BTC price crash/pump alert
  if (prev.btcPrice > 0) {
    const priceChange = ((current.btcPrice - prev.btcPrice) / prev.btcPrice) * 100
    if (Math.abs(priceChange) >= t.btcPriceChangePercent) {
      const direction = priceChange > 0 ? 'pumped' : 'crashed'
      await sendSlackNotification(formatCriticalAlert(
        `BTC ${direction} ${Math.abs(priceChange).toFixed(1)}% in last interval ($${prev.btcPrice.toFixed(0)} → $${current.btcPrice.toFixed(0)})`
      ))
    }
  }

  // Yield drift alert
  const usdcDrift = Math.abs(current.usdcApy - prev.usdcApy)
  if (usdcDrift >= t.yieldDriftPercent) {
    await pushWebhook({
      action: 'log',
      data: { agent: 'watcher', level: 'warn', message: `USDC APY shifted ${usdcDrift.toFixed(2)}%: ${prev.usdcApy.toFixed(2)}% → ${current.usdcApy.toFixed(2)}%` }
    })
  }

  // Fear & Greed extreme alert
  if (current.fearGreed <= t.fearGreedLow && prev.fearGreed > t.fearGreedLow) {
    await sendSlackNotification(formatCriticalAlert(
      `Fear & Greed entered EXTREME FEAR zone: ${current.fearGreed} (${current.fearLabel})`
    ))
  }
  if (current.fearGreed >= t.fearGreedHigh && prev.fearGreed < t.fearGreedHigh) {
    await sendSlackNotification(formatCriticalAlert(
      `Fear & Greed entered EXTREME GREED zone: ${current.fearGreed} (${current.fearLabel})`
    ))
  }

  previousSnapshot = current
}
