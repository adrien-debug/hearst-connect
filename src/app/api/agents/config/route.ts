import { NextResponse } from 'next/server'
import { requireAdminAccess, AuthError } from '@/lib/auth/session'
import { initDb } from '@/lib/db/connection'
import { AgentConfigRepository } from '@/lib/db/repositories'

export async function GET(request: Request) {
  try {
    await requireAdminAccess(request)
    initDb()
    const config = AgentConfigRepository.getAll()
    const defaults = AgentConfigRepository.getDefaults()
    return NextResponse.json({ config, defaults })
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.statusCode })
    console.error('[API] GET /agents/config error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdminAccess(request)
    initDb()
    const body = await request.json() as Record<string, string>

    const allowed = new Set(Object.keys(AgentConfigRepository.getDefaults()))
    const filtered: Record<string, string> = {}
    for (const [key, value] of Object.entries(body)) {
      if (allowed.has(key) && typeof value === 'string') {
        filtered[key] = value
      }
    }

    if (Object.keys(filtered).length === 0) {
      return NextResponse.json({ error: 'No valid config keys provided' }, { status: 400 })
    }

    AgentConfigRepository.setMany(filtered)
    console.log('[API] Agent config updated:', Object.keys(filtered).join(', '))
    const config = AgentConfigRepository.getAll()
    return NextResponse.json({ config })
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.statusCode })
    console.error('[API] PUT /agents/config error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
