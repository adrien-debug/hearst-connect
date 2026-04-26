/**
 * GET /api/agents/run/stream?agent=watcher
 * SSE stream — runs the managed agent and emits events in real-time.
 */

import { requireAdminAccess } from '@/lib/auth/session'
import { runManagedAgent, AgentRunEvent } from '@/agents/shared/anthropic'
import { executeToolCall } from '@/agents/shared/tool-executor'
import { AgentConfigRepository, AgentLogRepository } from '@/lib/db/repositories'

export const maxDuration = 120
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    await requireAdminAccess(request)
  } catch {
    return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const agentParam = searchParams.get('agent')

  if (!agentParam || !['watcher', 'strategy', 'audit'].includes(agentParam)) {
    return new Response('Invalid agent. Use ?agent=watcher|strategy|audit', { status: 400 })
  }

  const agent = agentParam as 'watcher' | 'strategy' | 'audit'
  const config = AgentConfigRepository.getAll()
  const promptKey = `${agent}_prompt_extra` as const
  const extraSystemPrompt = config[promptKey] ?? undefined

  const encoder = new TextEncoder()
  const signalsCreated: string[] = []

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: AgentRunEvent) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
        } catch {
          // Client disconnected
        }
      }

      try {
        const { report, durationMs } = await runManagedAgent(
          agent,
          executeToolCall,
          (event) => {
            send(event)
            if (event.type === 'signal_created') signalsCreated.push(event.signalType)
          },
          extraSystemPrompt
        )

        AgentLogRepository.create({
          agent,
          level: 'info',
          message: `[managed/stream] Run completed in ${Math.round(durationMs / 1000)}s — ${signalsCreated.length} signal(s)`,
          dataJson: JSON.stringify({ report: report.slice(0, 500), signalsCreated, durationMs }),
        })
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        console.error(`[/api/agents/run/stream] ${agent} failed:`, e)
        send({ type: 'error', message: msg })
        AgentLogRepository.create({ agent, level: 'error', message: `[managed/stream] ${msg}` })
      } finally {
        try { controller.close() } catch {}
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
