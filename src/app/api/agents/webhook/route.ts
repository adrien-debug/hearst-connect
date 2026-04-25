import { NextResponse } from 'next/server'
import { initDb } from '@/lib/db/connection'
import { MarketRepository, SignalRepository, AgentLogRepository } from '@/lib/db/repositories'
import type { DbMarketSnapshotInput, DbRebalanceSignalInput, DbAgentLogInput } from '@/lib/db/schema'

const AGENT_WEBHOOK_KEY = process.env.AGENT_WEBHOOK_KEY || process.env.ADMIN_PANEL_KEY || 'hearst-admin-dev-key'

export async function POST(request: Request) {
  try {
    const key = request.headers.get('x-admin-key') || request.headers.get('x-agent-key')
    if (key !== AGENT_WEBHOOK_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    initDb()
    const body = await request.json()
    const { action } = body as { action: string }

    switch (action) {
      case 'snapshot': {
        const snapshot = MarketRepository.create(body.data as DbMarketSnapshotInput)
        console.log('[Webhook] Snapshot created:', snapshot.id, 'BTC:', snapshot.btcPrice)
        return NextResponse.json({ snapshot })
      }
      case 'signal': {
        const signal = SignalRepository.create(body.data as DbRebalanceSignalInput)
        console.log('[Webhook] Signal created:', signal.id, signal.type, signal.description)
        return NextResponse.json({ signal })
      }
      case 'log': {
        const log = AgentLogRepository.create(body.data as DbAgentLogInput)
        return NextResponse.json({ log })
      }
      case 'signal_update': {
        const { signalId, status, riskScore, riskNotes } = body.data
        const signal = SignalRepository.updateStatus(signalId, status, riskScore, riskNotes)
        if (!signal) return NextResponse.json({ error: 'Signal not found' }, { status: 404 })
        return NextResponse.json({ signal })
      }
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (e) {
    console.error('[Webhook] Error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
