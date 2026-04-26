'use client'

import { useState } from 'react'
import { useSignals, useSignalMutations } from '@/hooks/useSignals'
import { useAgentsStatus } from '@/hooks/useMarketData'
import type { DbRebalanceSignal } from '@/lib/db/schema'

const STATUS_CSS: Record<string, string> = {
  pending: 'admin-text-warning',
  approved: 'admin-text-success',
  rejected: 'admin-text-danger',
  executed: 'admin-text-accent',
  blocked: 'admin-text-danger',
}

const TYPE_ICONS: Record<string, string> = {
  TAKE_PROFIT: '💰',
  REBALANCE: '⚖️',
  YIELD_ROTATE: '🔄',
  INCREASE_BTC: '📈',
  REDUCE_RISK: '🛡️',
}

export function SignalsSection() {
  const [filter, setFilter] = useState<string>('')
  const { data, isLoading } = useSignals(filter || undefined)
  const { data: agentsData } = useAgentsStatus()
  const { approve, reject, execute } = useSignalMutations()

  const signals = data?.signals ?? []
  const agents = agentsData?.agents ?? []

  return (
    <div>
      {/* Agent status bar */}
      <div className="signals-agent-bar">
        {agents.map(a => (
          <div key={a.name} className="signals-agent-chip">
            <div className={`signals-dot ${a.status === 'online' ? 'signals-dot-success' : 'signals-dot-danger'}`} />
            <span className="signals-agent-name">{a.name}</span>
            <span className="signals-agent-status">{a.status}</span>
          </div>
        ))}
        {agents.length === 0 && <span className="signals-empty-text">No agent data</span>}
      </div>

      {/* Filter tabs */}
      <div className="signals-filter-row">
        {['', 'pending', 'approved', 'rejected', 'executed', 'blocked'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`signals-filter-btn ${filter === f ? 'signals-filter-btn-active' : ''}`}
          >
            {f || 'All'}
          </button>
        ))}
      </div>

      {/* Signals list */}
      {isLoading ? (
        <div className="loading-state">Loading signals...</div>
      ) : signals.length === 0 ? (
        <div className="empty-state">No signals{filter ? ` with status "${filter}"` : ''}</div>
      ) : (
        <div className="signals-list">
          {signals.map(sig => (
            <SignalCard
              key={sig.id}
              signal={sig}
              onApprove={() => approve.mutate(sig.id)}
              onReject={() => reject.mutate(sig.id)}
              onExecute={() => execute.mutate(sig.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SignalCard({
  signal: sig,
  onApprove,
  onReject,
  onExecute,
}: {
  signal: DbRebalanceSignal
  onApprove: () => void
  onReject: () => void
  onExecute: () => void
}) {
  const statusClass = STATUS_CSS[sig.status] ?? 'admin-text-secondary'
  const icon = TYPE_ICONS[sig.type] ?? '📋'

  const getRiskClass = (score: number | null) => {
    if (score == null) return ''
    if (score > 60) return 'admin-text-danger'
    if (score > 30) return 'admin-text-warning'
    return 'admin-text-success'
  }

  return (
    <div className="signals-card">
      <div className="signals-card-header">
        <span className="signals-type-icon">{icon}</span>
        <span className="signals-type-name">{sig.type.replace(/_/g, ' ')}</span>
        <span className={`signals-status-badge ${statusClass}`}>{sig.status}</span>
        <span className="signals-agent">by {sig.createdBy}</span>
      </div>

      <p className="signals-desc">{sig.description}</p>

      <div className="signals-meta">
        <span>{new Date(sig.timestamp).toLocaleString()}</span>
        {sig.riskScore != null && (
          <span className={getRiskClass(sig.riskScore)}>
            Risk: {sig.riskScore}/100
          </span>
        )}
        {sig.riskNotes && <span className="signals-risk-notes">{sig.riskNotes}</span>}
      </div>

      {sig.paramsJson && (
        <pre className="signals-params">{JSON.stringify(JSON.parse(sig.paramsJson), null, 2)}</pre>
      )}

      {sig.status === 'pending' && (
        <div className="signals-actions">
          <button onClick={onApprove} className="signals-action-btn signals-action-approve">Approve</button>
          <button onClick={onReject} className="signals-action-btn signals-action-reject">Reject</button>
        </div>
      )}
      {sig.status === 'approved' && (
        <div className="signals-actions">
          <button onClick={onExecute} className="signals-action-btn signals-action-execute">Execute</button>
        </div>
      )}
    </div>
  )
}
