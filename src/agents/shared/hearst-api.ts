/**
 * HTTP client for agents to communicate with the Hearst Connect backend
 */

import type { WebhookPayload } from './types'

const API_URL = process.env.HEARST_API_URL || 'http://localhost:8100'
const AGENT_KEY = process.env.AGENT_WEBHOOK_KEY || process.env.ADMIN_PANEL_KEY || 'hearst-admin-dev-key'

async function apiCall<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-agent-key': AGENT_KEY,
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => 'unknown')
    throw new Error(`API ${res.status}: ${body}`)
  }
  return res.json()
}

export async function pushWebhook(payload: WebhookPayload): Promise<unknown> {
  return apiCall('/agents/webhook', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getLatestMarket(): Promise<unknown> {
  return apiCall('/market')
}

export async function getMarketHistory(limit = 100): Promise<unknown> {
  return apiCall(`/market/history?limit=${limit}`)
}

export async function getSignals(status?: string): Promise<unknown> {
  const qs = status ? `?status=${status}` : ''
  return apiCall(`/signals${qs}`)
}

export async function getAgentsStatus(): Promise<unknown> {
  return apiCall('/agents/status')
}
