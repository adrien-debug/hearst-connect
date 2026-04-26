'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { AgentsApi } from '@/lib/api-client'
import { ADMIN_TOKENS as T, MONO } from '../constants'

// ── Types ────────────────────────────────────────────────────────────────

type AgentName = 'watcher' | 'strategy' | 'audit'

interface AgentRunEvent {
  type: 'start' | 'tool_call' | 'tool_result' | 'thinking' | 'signal_created' | 'signal_updated' | 'done' | 'error'
  agent?: string
  tool?: string
  input?: unknown
  result?: unknown
  text?: string
  signalType?: string
  riskScore?: number
  signalId?: string
  status?: string
  report?: string
  durationMs?: number
  message?: string
}

interface LogLine {
  id: string
  ts: string
  tag: 'TOOL' | 'RESULT' | 'SIGNAL' | 'CLAUDE' | 'ERROR' | 'START' | 'DONE'
  text: string
  agent: AgentName
}

interface RunHistory {
  id: string
  agent: AgentName
  ts: string
  durationMs: number
  signalsCreated: string[]
  report: string
}

// ── Constants ────────────────────────────────────────────────────────────

const AGENT_META: Record<AgentName, { label: string; desc: string; icon: string; color: string }> = {
  watcher: {
    label: 'Market Watcher',
    desc: 'Surveille BTC, yields DeFi, Fear & Greed, hashprice en continu.',
    icon: '👁',
    color: '#3B82F6',
  },
  strategy: {
    label: 'Strategy Optimizer',
    desc: 'Analyse les conditions et génère des signaux de rebalance si justifiés.',
    icon: '⚡',
    color: '#F59E0B',
  },
  audit: {
    label: 'Audit & Risk',
    desc: 'Audite les signaux pending, vérifie les risques, peut bloquer.',
    icon: '🛡',
    color: '#10B981',
  },
}

const TAG_STYLES: Record<LogLine['tag'], { bg: string; color: string }> = {
  START: { bg: 'rgba(99,102,241,0.15)', color: '#818CF8' },
  TOOL: { bg: 'rgba(59,130,246,0.15)', color: '#60A5FA' },
  RESULT: { bg: 'rgba(16,185,129,0.12)', color: '#34D399' },
  SIGNAL: { bg: 'rgba(245,158,11,0.15)', color: '#FBBF24' },
  CLAUDE: { bg: 'rgba(139,92,246,0.12)', color: '#C4B5FD' },
  ERROR: { bg: 'rgba(239,68,68,0.15)', color: '#F87171' },
  DONE: { bg: 'rgba(16,185,129,0.15)', color: '#6EE7B7' },
}

function genId() { return Math.random().toString(36).slice(2, 9) }
function now() { return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }

function truncate(v: unknown, max = 120): string {
  const s = typeof v === 'string' ? v : JSON.stringify(v)
  return s.length > max ? s.slice(0, max) + '…' : s
}

// ── Component ─────────────────────────────────────────────────────────────

export default function AgentsSection() {
  const [runningAgent, setRunningAgent] = useState<AgentName | null>(null)
  const [logs, setLogs] = useState<LogLine[]>([])
  const [history, setHistory] = useState<RunHistory[]>([])
  const [activeFilter, setActiveFilter] = useState<AgentName | 'all'>('all')
  const logEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const addLog = useCallback((tag: LogLine['tag'], text: string, agent: AgentName) => {
    setLogs(prev => [...prev, { id: genId(), ts: now(), tag, text, agent }])
  }, [])

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const handleRun = useCallback((agent: AgentName) => {
    if (runningAgent) return
    setRunningAgent(agent)
    setLogs(prev => [
      ...prev,
      { id: genId(), ts: now(), tag: 'START', text: `▶ Lancement de l'agent ${AGENT_META[agent].label}…`, agent },
    ])

    const runStart = Date.now()
    const signalsThisRun: string[] = []

    const ctrl = AgentsApi.streamRun(
      agent,
      (raw) => {
        try {
          const event: AgentRunEvent = JSON.parse(raw)
          switch (event.type) {
            case 'tool_call':
              addLog('TOOL', `[${event.tool}] ← ${truncate(event.input)}`, agent)
              break
            case 'tool_result':
              addLog('RESULT', `[${event.tool}] → ${truncate(event.result)}`, agent)
              break
            case 'thinking':
              if (event.text) addLog('CLAUDE', event.text.trim(), agent)
              break
            case 'signal_created':
              signalsThisRun.push(event.signalType ?? '')
              addLog('SIGNAL', `Signal créé: ${event.signalType} (risk ${event.riskScore})`, agent)
              break
            case 'signal_updated':
              addLog('SIGNAL', `Signal mis à jour: ${event.signalId} → ${event.status}`, agent)
              break
            case 'done':
              addLog('DONE', `✓ Terminé en ${((event.durationMs ?? 0) / 1000).toFixed(1)}s`, agent)
              if (event.report) addLog('CLAUDE', `Rapport: ${event.report}`, agent)
              setHistory(prev => [
                {
                  id: genId(),
                  agent,
                  ts: new Date().toLocaleTimeString('fr-FR'),
                  durationMs: event.durationMs ?? Date.now() - runStart,
                  signalsCreated: [...signalsThisRun],
                  report: event.report ?? '',
                },
                ...prev.slice(0, 4),
              ])
              setRunningAgent(null)
              break
            case 'error':
              addLog('ERROR', `Erreur: ${event.message}`, agent)
              setRunningAgent(null)
              break
          }
        } catch {
          // ignore parse error
        }
      },
      () => {
        setRunningAgent(null)
      },
      (err) => {
        addLog('ERROR', `Stream error: ${err.message}`, agent)
        setRunningAgent(null)
      }
    )

    abortRef.current = ctrl
  }, [runningAgent, addLog])

  const handleStop = () => {
    abortRef.current?.abort()
    abortRef.current = null
    if (runningAgent) {
      addLog('ERROR', '⏹ Run interrompu par l\'admin', runningAgent)
      setRunningAgent(null)
    }
  }

  const clearLogs = () => setLogs([])

  const filteredLogs = activeFilter === 'all' ? logs : logs.filter(l => l.agent === activeFilter)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '40px' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: T.fontSizes.xl, fontWeight: T.fontWeights.bold, color: T.colors.textPrimary, margin: 0 }}>
          Managed Agents
        </h1>
        <p style={{ fontSize: T.fontSizes.sm, color: T.colors.textSecondary, margin: '6px 0 0' }}>
          Déclenchez un agent manuellement avec tool use natif Anthropic. Les logs s'affichent en temps réel.
        </p>
      </div>

      {/* Agent cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {(Object.entries(AGENT_META) as [AgentName, typeof AGENT_META[AgentName]][]).map(([key, meta]) => {
          const isRunning = runningAgent === key
          const isOtherRunning = runningAgent !== null && runningAgent !== key
          return (
            <div
              key={key}
              style={{
                background: T.colors.bgSurface,
                border: `1px solid ${isRunning ? meta.color : T.colors.borderSubtle}`,
                borderRadius: T.radius.lg,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: T.transitions.base,
                boxShadow: isRunning ? `0 0 0 1px ${meta.color}40` : 'none',
              }}
            >
              {/* Card header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>{meta.icon}</span>
                    <span style={{ fontSize: T.fontSizes.md, fontWeight: T.fontWeights.semibold, color: T.colors.textPrimary }}>
                      {meta.label}
                    </span>
                  </div>
                  <p style={{ fontSize: T.fontSizes.xs, color: T.colors.textSecondary, margin: '6px 0 0', lineHeight: '1.5' }}>
                    {meta.desc}
                  </p>
                </div>
                {/* Status dot */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  {isRunning ? (
                    <PulsingDot color={meta.color} />
                  ) : (
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.colors.borderDefault, display: 'inline-block' }} />
                  )}
                  <span style={{ fontSize: T.fontSizes.xs, color: isRunning ? meta.color : T.colors.textGhost }}>
                    {isRunning ? 'En cours' : 'Idle'}
                  </span>
                </div>
              </div>

              {/* Run button */}
              <button
                onClick={() => isRunning ? handleStop() : handleRun(key)}
                disabled={isOtherRunning}
                style={{
                  padding: '10px 16px',
                  borderRadius: T.radius.md,
                  border: `1px solid ${isRunning ? '#F87171' : meta.color}`,
                  background: isRunning ? 'rgba(239,68,68,0.1)' : `${meta.color}18`,
                  color: isRunning ? '#F87171' : meta.color,
                  fontSize: T.fontSizes.sm,
                  fontWeight: T.fontWeights.semibold,
                  cursor: isOtherRunning ? 'not-allowed' : 'pointer',
                  opacity: isOtherRunning ? 0.4 : 1,
                  transition: T.transitions.base,
                  width: '100%',
                  fontFamily: T.fonts.sans,
                }}
              >
                {isRunning ? '⏹ Arrêter' : '▶ Run now'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Log terminal */}
      <div style={{
        background: '#0A0A0A',
        border: `1px solid ${T.colors.borderSubtle}`,
        borderRadius: T.radius.lg,
        overflow: 'hidden',
      }}>
        {/* Terminal toolbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderBottom: `1px solid ${T.colors.borderSubtle}`,
          background: '#111',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* macOS dots */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {['#FF5F57', '#FEBC2E', '#28C840'].map(c => (
                <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
              ))}
            </div>
            <span style={{ fontSize: T.fontSizes.xs, color: T.colors.textGhost, fontFamily: MONO }}>
              agents/log-stream
            </span>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['all', 'watcher', 'strategy', 'audit'] as const).map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  padding: '3px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  background: activeFilter === f ? T.colors.accent : 'transparent',
                  color: activeFilter === f ? '#000' : T.colors.textGhost,
                  fontSize: T.fontSizes.xs,
                  cursor: 'pointer',
                  fontFamily: T.fonts.sans,
                  fontWeight: activeFilter === f ? T.fontWeights.semibold : T.fontWeights.regular,
                  transition: T.transitions.fast,
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={clearLogs}
            style={{
              background: 'transparent',
              border: 'none',
              color: T.colors.textGhost,
              fontSize: T.fontSizes.xs,
              cursor: 'pointer',
              padding: '3px 8px',
              fontFamily: T.fonts.sans,
            }}
          >
            clear
          </button>
        </div>

        {/* Log lines */}
        <div style={{
          height: '380px',
          overflowY: 'auto',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          {filteredLogs.length === 0 ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: T.colors.textGhost,
              fontSize: T.fontSizes.xs,
              fontFamily: MONO,
              flexDirection: 'column',
              gap: '8px',
            }}>
              <span>$</span>
              <span>Cliquez sur "Run now" pour déclencher un agent</span>
            </div>
          ) : (
            filteredLogs.map(line => {
              const style = TAG_STYLES[line.tag]
              return (
                <div key={line.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#4B5563', fontSize: '11px', fontFamily: MONO, flexShrink: 0, paddingTop: '1px' }}>
                    {line.ts}
                  </span>
                  <span style={{
                    fontSize: '10px',
                    fontFamily: MONO,
                    fontWeight: '600',
                    padding: '1px 6px',
                    borderRadius: '3px',
                    background: style.bg,
                    color: style.color,
                    flexShrink: 0,
                    letterSpacing: '0.05em',
                  }}>
                    {line.tag}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    fontFamily: MONO,
                    color: line.tag === 'ERROR' ? '#F87171' : '#D1D5DB',
                    lineHeight: '1.5',
                    wordBreak: 'break-word',
                  }}>
                    {line.text}
                  </span>
                </div>
              )
            })
          )}
          <div ref={logEndRef} />
        </div>
      </div>

      {/* Run history */}
      {history.length > 0 && (
        <div>
          <h2 style={{ fontSize: T.fontSizes.md, fontWeight: T.fontWeights.semibold, color: T.colors.textPrimary, margin: '0 0 12px' }}>
            Historique des runs
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {history.map(run => (
              <div
                key={run.id}
                style={{
                  background: T.colors.bgSurface,
                  border: `1px solid ${T.colors.borderSubtle}`,
                  borderRadius: T.radius.md,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                }}
              >
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  minWidth: '120px',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: T.fontSizes.xs, fontWeight: T.fontWeights.semibold, color: AGENT_META[run.agent].color }}>
                    {AGENT_META[run.agent].icon} {AGENT_META[run.agent].label}
                  </span>
                  <span style={{ fontSize: '11px', color: T.colors.textGhost, fontFamily: MONO }}>{run.ts}</span>
                  <span style={{ fontSize: '11px', color: T.colors.textSecondary }}>
                    {(run.durationMs / 1000).toFixed(1)}s
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {run.signalsCreated.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      {run.signalsCreated.map((s, i) => (
                        <span key={i} style={{
                          fontSize: '10px',
                          padding: '2px 8px',
                          borderRadius: '3px',
                          background: 'rgba(245,158,11,0.15)',
                          color: '#FBBF24',
                          fontFamily: MONO,
                          fontWeight: '600',
                        }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {run.report && (
                    <p style={{
                      fontSize: T.fontSizes.xs,
                      color: T.colors.textSecondary,
                      margin: 0,
                      lineHeight: '1.5',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {run.report}
                    </p>
                  )}
                  {run.signalsCreated.length === 0 && !run.report && (
                    <span style={{ fontSize: T.fontSizes.xs, color: T.colors.textGhost }}>Aucun signal créé — conditions non remplies</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Pulsing dot ──────────────────────────────────────────────────────────

function PulsingDot({ color }: { color: string }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
      <style>{`
        @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
        .ping-dot { animation: ping 1s cubic-bezier(0,0,0.2,1) infinite; }
      `}</style>
      <span className="ping-dot" style={{
        position: 'absolute', inset: 0, borderRadius: '50%', background: color, opacity: 0.75,
      }} />
      <span style={{ borderRadius: '50%', background: color, width: 8, height: 8, display: 'inline-block' }} />
    </span>
  )
}
