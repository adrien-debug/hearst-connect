import { NextResponse } from 'next/server'
import { requireAdminAccess, AuthError } from '@/lib/auth/session'
import { initDb } from '@/lib/db/connection'
import { MarketRepository } from '@/lib/db/repositories'

export async function GET(request: Request) {
  try {
    await requireAdminAccess(request)
    initDb()

    const snapshot = MarketRepository.latest()
    return NextResponse.json({ snapshot })
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.statusCode })
    console.error('[API] GET /market error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
