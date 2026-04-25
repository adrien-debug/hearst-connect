/**
 * Slack webhook notifications for agent alerts
 */

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL

interface SlackMessage {
  channel?: string
  text: string
  blocks?: Array<{
    type: string
    text?: { type: string; text: string }
    fields?: Array<{ type: string; text: string }>
    elements?: Array<{ type: string; text: string; url?: string; style?: string }>
  }>
}

export async function sendSlackNotification(message: SlackMessage): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    console.warn('[Slack] No webhook URL configured, skipping notification')
    return
  }

  try {
    const res = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })
    if (!res.ok) {
      console.error('[Slack] Webhook error:', res.status, await res.text())
    }
  } catch (e) {
    console.error('[Slack] Failed to send notification:', e)
  }
}

export function formatSignalAlert(signal: { type: string; description: string; riskScore?: number | null; createdBy: string }): SlackMessage {
  const emoji: Record<string, string> = {
    TAKE_PROFIT: ':moneybag:',
    REBALANCE: ':scales:',
    YIELD_ROTATE: ':arrows_counterclockwise:',
    INCREASE_BTC: ':chart_with_upwards_trend:',
    REDUCE_RISK: ':shield:',
  }

  return {
    text: `${emoji[signal.type] || ':bell:'} New Signal: ${signal.type}`,
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: `${emoji[signal.type] || ''} ${signal.type}` } },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Description:*\n${signal.description}` },
          { type: 'mrkdwn', text: `*Risk Score:*\n${signal.riskScore ?? 'N/A'}/100` },
          { type: 'mrkdwn', text: `*Created by:*\n${signal.createdBy}` },
        ],
      },
    ],
  }
}

export function formatDailyReport(report: string): SlackMessage {
  return {
    text: ':clipboard: Daily Risk Report',
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: ':clipboard: Daily Risk Report' } },
      { type: 'section', text: { type: 'mrkdwn', text: report } },
    ],
  }
}

export function formatCriticalAlert(message: string): SlackMessage {
  return {
    text: `:rotating_light: CRITICAL: ${message}`,
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: ':rotating_light: Critical Alert' } },
      { type: 'section', text: { type: 'mrkdwn', text: message } },
    ],
  }
}
