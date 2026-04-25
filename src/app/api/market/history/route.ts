import { NextResponse } from 'next/server'
import { requireAdminAccess, AuthError } from '@/lib/auth/session'
import { initDb } from '@/lib/db/connection'
import { MarketRepository } from '@/lib/db/repositories'

export async function GET(request: Request) {
  try {
    await requireAdminAccess(request)
    initDb()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100', 10)
    const from = searchParams.get('from') ? parseInt(searchParams.get('from')!, 10) : undefined

    const snapshots = MarketRepository.history(limit, from)
    return NextResponse.json({ snapshots })
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.statusCode })
    console.error('[API] GET /market/history error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
