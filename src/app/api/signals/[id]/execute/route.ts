import { NextResponse } from 'next/server'
import { requireAdminAccess, AuthError } from '@/lib/auth/session'
import { initDb } from '@/lib/db/connection'
import { SignalRepository } from '@/lib/db/repositories'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminAccess(request)
    initDb()

    const { id } = await params
    const existing = SignalRepository.findById(id)
    if (!existing) return NextResponse.json({ error: 'Signal not found' }, { status: 404 })
    if (existing.status !== 'approved') {
      return NextResponse.json({ error: 'Signal must be approved before execution' }, { status: 400 })
    }

    const signal = SignalRepository.updateStatus(id, 'executed')
    return NextResponse.json({ signal })
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.statusCode })
    console.error('[API] POST /signals/[id]/execute error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
