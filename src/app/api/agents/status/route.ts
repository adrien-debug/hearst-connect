import { NextResponse } from 'next/server'
import { requireAdminAccess, AuthError } from '@/lib/auth/session'
import { initDb } from '@/lib/db/connection'
import { AgentLogRepository } from '@/lib/db/repositories'

export async function GET(request: Request) {
  try {
    await requireAdminAccess(request)
    initDb()

    const latest = AgentLogRepository.latestByAgent()
    const now = Date.now()
    const STALE_MS = 5 * 60 * 1000

    const agents = Object.entries(latest).map(([name, log]) => ({
      name,
      status: log && (now - log.timestamp < STALE_MS) ? 'online' : 'offline',
      lastSeen: log?.timestamp ?? null,
      lastMessage: log?.message ?? null,
      lastLevel: log?.level ?? null,
    }))

    return NextResponse.json({ agents })
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.statusCode })
    console.error('[API] GET /agents/status error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
