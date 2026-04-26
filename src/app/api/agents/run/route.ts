/**
 * POST /api/agents/run
 * Trigger a managed agent run immediately. Returns full report + stats.
 */

import { NextResponse } from 'next/server'
import { requireAdminAccess } from '@/lib/auth/session'
import { runManagedAgent, AgentRunEvent } from '@/agents/shared/anthropic'
import { executeToolCall } from '@/agents/shared/tool-executor'
import { AgentConfigRepository } from '@/lib/db/repositories'
import { AgentLogRepository } from '@/lib/db/repositories'

export const maxDuration = 120

export async function POST(request: Request) {
  try {
    await requireAdminAccess(request)
  } catch {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  let agent: 'watcher' | 'strategy' | 'audit'
  try {
    const body = await request.json()
    if (!['watcher', 'strategy', 'audit'].includes(body.agent)) {
      return NextResponse.json({ error: 'Invalid agent. Must be: watcher, strategy, or audit' }, { status: 400 })
    }
    agent = body.agent
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const config = AgentConfigRepository.getAll()
  const promptKey = `${agent}_prompt_extra` as const
  const extraSystemPrompt = config[promptKey] ?? undefined

  const events: AgentRunEvent[] = []
  const signalsCreated: string[] = []
  const signalsUpdated: string[] = []

  try {
    const { report, durationMs } = await runManagedAgent(
      agent,
      executeToolCall,
      (event) => {
        events.push(event)
        if (event.type === 'signal_created') signalsCreated.push(event.signalType)
        if (event.type === 'signal_updated') signalsUpdated.push(event.signalId)
      },
      extraSystemPrompt
    )

    // Persist run log to DB
    AgentLogRepository.create({
      agent,
      level: 'info',
      message: `[managed] Run completed in ${Math.round(durationMs / 1000)}s — ${signalsCreated.length} signal(s) created`,
      dataJson: JSON.stringify({ report: report.slice(0, 500), signalsCreated, durationMs }),
    })

    return NextResponse.json({
      success: true,
      agent,
      report,
      signalsCreated,
      signalsUpdated,
      durationMs,
      eventCount: events.length,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error(`[/api/agents/run] ${agent} failed:`, e)
    AgentLogRepository.create({
      agent,
      level: 'error',
      message: `[managed] Run failed: ${msg}`,
    })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
