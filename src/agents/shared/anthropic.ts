/**
 * Anthropic Claude SDK client for agent intelligence
 */

import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPTS: Record<string, string> = {
  watcher: `You are a crypto market analyst agent for Hearst Connect, a structured vault product.
Your role is to analyze market snapshots and generate concise insights.
Focus on: BTC price trends, DeFi yield changes, mining profitability, and market sentiment.
Be factual, concise (2-3 sentences max), and highlight actionable observations.
Never give financial advice. State observations only.`,

  strategy: `You are a portfolio strategy optimizer agent for Hearst Connect vaults.
You analyze market conditions and portfolio state to generate rebalancing signals.
Your signals must be one of: TAKE_PROFIT, REBALANCE, YIELD_ROTATE, INCREASE_BTC, REDUCE_RISK.
Each signal needs a clear description and risk score (0-100).
Be conservative — only suggest actions when conditions strongly warrant them.
Consider: BTC price vs entry, yield differentials, Fear & Greed extremes, allocation drift.`,

  audit: `You are a risk auditor agent for Hearst Connect vaults.
You review pending signals and market conditions for risks.
Check for: stablecoin depeg, protocol TVL drops, concentration risk, correlation risk, smart contract incidents.
You can BLOCK signals that are too risky or add warnings.
Generate a daily risk summary covering all active exposures.
Be thorough but concise.`,
}

export async function analyzeWithClaude(
  agent: 'watcher' | 'strategy' | 'audit',
  prompt: string,
  maxTokens = 500
): Promise<string> {
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: SYSTEM_PROMPTS[agent],
      messages: [{ role: 'user', content: prompt }],
    })

    const textBlock = response.content.find(b => b.type === 'text')
    return textBlock?.text ?? ''
  } catch (e) {
    console.error(`[${agent}] Claude analysis error:`, e)
    return ''
  }
}
