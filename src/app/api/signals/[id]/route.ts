import { NextResponse } from 'next/server'
import { requireAdminAccess, AuthError } from '@/lib/auth/session'
import { initDb } from '@/lib/db/connection'
import { SignalRepository } from '@/lib/db/repositories'
import type { SignalStatus } from '@/lib/db/schema'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminAccess(request)
    initDb()

    const { id } = await params
    const signal = SignalRepository.findById(id)
    if (!signal) return NextResponse.json({ error: 'Signal not found' }, { status: 404 })
    return NextResponse.json({ signal })
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.statusCode })
    console.error('[API] GET /signals/[id] error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminAccess(request)
    initDb()

    const { id } = await params
    const body = await request.json()
    const { status, riskScore, riskNotes } = body as { status: SignalStatus; riskScore?: number; riskNotes?: string }

    if (!status || !['approved', 'rejected', 'blocked'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be: approved, rejected, or blocked' }, { status: 400 })
    }

    const signal = SignalRepository.updateStatus(id, status, riskScore, riskNotes)
    if (!signal) return NextResponse.json({ error: 'Signal not found' }, { status: 404 })
    return NextResponse.json({ signal })
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.statusCode })
    console.error('[API] PATCH /signals/[id] error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
