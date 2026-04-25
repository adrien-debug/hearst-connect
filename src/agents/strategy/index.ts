/**
 * Agent 2 — Strategy Optimizer
 * Analyzes market snapshots and generates rebalancing signals
 */

import { pushWebhook, getLatestMarket, getSignals } from '../shared/hearst-api'
import { analyzeWithClaude } from '../shared/anthropic'
import { sendSlackNotification, formatSignalAlert } from '../shared/slack'
import { evaluateRules } from './rules'
import type { RebalanceSignal } from '../shared/types'

const CHECK_INTERVAL = 5 * 60_000

async function log(level: 'info' | 'warn' | 'error', message: string) {
  console.log(`[Strategy][${level}] ${message}`)
  try {
    await pushWebhook({ action: 'log', data: { agent: 'strategy', level, message } })
  } catch {}
}

async function evaluate() {
  try {
    const marketRes = await getLatestMarket() as { snapshot: { btcPrice: number; btc24hChange: number; btc7dChange: number; usdcApy: number; usdtApy: number; btcApy: number; fearGreed: number; fearLabel: string; miningHashprice: number | null } | null }
    const snap = marketRes?.snapshot
    if (!snap) {
      await log('info', 'No market snapshot available yet')
      return
    }

    // Check for existing pending signals to avoid duplicates
    const pendingRes = await getSignals('pending') as { signals: Array<{ type: string }> }
    const pendingTypes = new Set((pendingRes?.signals ?? []).map(s => s.type))

    const candidateSignals = evaluateRules(snap, pendingTypes)

    for (const candidate of candidateSignals) {
      // Use Claude to refine the signal
      let description = candidate.description
      try {
        const refined = await analyzeWithClaude('strategy',
          `Market context:\n- BTC: $${snap.btcPrice.toFixed(0)} (24h: ${snap.btc24hChange.toFixed(2)}%)\n- USDC APY: ${snap.usdcApy.toFixed(2)}%\n- Fear & Greed: ${snap.fearGreed}\n\nProposed signal: ${candidate.type}\nReason: ${candidate.description}\n\nRefine this into a clear, actionable 1-2 sentence signal description. Include relevant numbers.`,
          200
        )
        if (refined) description = refined
      } catch {}

      const signal: RebalanceSignal = {
        ...candidate,
        description,
        createdBy: 'strategy',
      }

      await pushWebhook({ action: 'signal', data: signal })
      await sendSlackNotification(formatSignalAlert(signal))
      await log('info', `Signal created: ${signal.type} — ${signal.description}`)
    }

    if (candidateSignals.length === 0) {
      await log('info', `No signals warranted. BTC $${snap.btcPrice.toFixed(0)}, F&G ${snap.fearGreed}`)
    }
  } catch (e) {
    await log('error', `Strategy evaluation failed: ${e}`)
  }
}

async function main() {
  await log('info', 'Strategy Optimizer agent started')
  await evaluate()
  setInterval(evaluate, CHECK_INTERVAL)
}

main().catch(console.error)
