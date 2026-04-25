import { NextResponse } from 'next/server'
import { requireAdminAccess, AuthError } from '@/lib/auth/session'
import { initDb } from '@/lib/db/connection'
import { SignalRepository } from '@/lib/db/repositories'
import type { SignalStatus } from '@/lib/db/schema'

export async function GET(request: Request) {
  try {
    await requireAdminAccess(request)
    initDb()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as SignalStatus | null
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    const signals = SignalRepository.findAll(status ?? undefined, limit)
    return NextResponse.json({ signals })
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.statusCode })
    console.error('[API] GET /signals error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
