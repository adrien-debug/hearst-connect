'use client'

import { useMarketLatest, useMarketHistory, useAgentsStatus } from '@/hooks/useMarketData'
import { fmtUsd } from '../constants'

export function MarketSection() {
  const { data: latestData, isLoading: loadingLatest } = useMarketLatest()
  const { data: historyData } = useMarketHistory(48)
  const { data: agentsData } = useAgentsStatus()

  const snap = latestData?.snapshot
  const snapshots = historyData?.snapshots ?? []
  const agents = agentsData?.agents ?? []

  if (loadingLatest) {
    return <div className="loading-state admin-text-secondary">Loading market data...</div>
  }

  return (
    <div className="admin-flex-col admin-gap-4">
      {snap ? (
        <>
          <div className="admin-kpi-grid">
            <KpiCard label="BTC / USD" value={fmtUsd(snap.btcPrice)} />
            <KpiCard label="24h Change" value={`${snap.btc24hChange >= 0 ? '+' : ''}${snap.btc24hChange.toFixed(2)}%`} colorClass={snap.btc24hChange >= 0 ? 'admin-text-success' : 'admin-text-danger'} />
            <KpiCard label="7d Change" value={`${snap.btc7dChange >= 0 ? '+' : ''}${snap.btc7dChange.toFixed(2)}%`} colorClass={snap.btc7dChange >= 0 ? 'admin-text-success' : 'admin-text-danger'} />
            <KpiCard label="Fear & Greed" value={`${snap.fearGreed} — ${snap.fearLabel}`} colorClass={snap.fearGreed < 30 ? 'admin-text-danger' : snap.fearGreed > 70 ? 'admin-text-success' : 'admin-text-warning'} />
          </div>

          <div className="admin-kpi-grid">
            <KpiCard label="USDC APY (Aave)" value={`${snap.usdcApy.toFixed(2)}%`} colorClass="admin-text-success" />
            <KpiCard label="USDT APY (Aave)" value={`${snap.usdtApy.toFixed(2)}%`} colorClass="admin-text-success" />
            <KpiCard label="BTC APY (Aave)" value={`${snap.btcApy.toFixed(2)}%`} colorClass="admin-text-success" />
            <KpiCard label="Mining Hashprice" value={snap.miningHashprice ? `$${snap.miningHashprice.toFixed(0)}/PH/day` : 'N/A'} />
          </div>

          {snap.notes && (
            <div className="market-insight-card">
              <h3 className="market-insight-title">Agent Insight</h3>
              <p className="market-insight-text">{snap.notes}</p>
              <span className="market-insight-time">{new Date(snap.timestamp).toLocaleString()}</span>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <p>No market data yet. Agents will populate this when running.</p>
        </div>
      )}

      {snapshots.length > 0 && (
        <div className="admin-card">
          <h3 className="market-table-title">Recent Snapshots ({snapshots.length})</h3>
          <div className="market-table-wrap">
            <table className="market-table">
              <thead>
                <tr>
                  <th className="market-th">Time</th>
                  <th className="market-th">BTC</th>
                  <th className="market-th">24h</th>
                  <th className="market-th">USDC</th>
                  <th className="market-th">USDT</th>
                  <th className="market-th">F&G</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.slice(0, 20).map(s => (
                  <tr key={s.id}>
                    <td className="market-td">{new Date(s.timestamp).toLocaleTimeString()}</td>
                    <td className="market-td">{fmtUsd(s.btcPrice)}</td>
                    <td className={`market-td ${s.btc24hChange >= 0 ? 'admin-text-success' : 'admin-text-danger'}`}>
                      {s.btc24hChange >= 0 ? '+' : ''}{s.btc24hChange.toFixed(2)}%
                    </td>
                    <td className="market-td">{s.usdcApy.toFixed(2)}%</td>
                    <td className="market-td">{s.usdtApy.toFixed(2)}%</td>
                    <td className="market-td">{s.fearGreed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="admin-card">
        <h3 className="market-table-title">Agent Status</h3>
        {agents.map(a => (
          <div key={a.name} className="market-agent-row">
            <div className={`market-status-dot ${a.status === 'online' ? 'market-status-online' : 'market-status-offline'}`} />
            <span className="market-agent-name">{a.name}</span>
            <span className="market-agent-meta">{a.status}</span>
            {a.lastSeen && <span className="market-agent-meta">{new Date(a.lastSeen).toLocaleString()}</span>}
            {a.lastMessage && <span className="market-agent-msg">{a.lastMessage}</span>}
          </div>
        ))}
        {agents.length === 0 && <p className="admin-text-secondary market-empty-text">No agents connected</p>}
      </div>
    </div>
  )
}

function KpiCard({ label, value, colorClass }: { label: string; value: string; colorClass?: string }) {
  return (
    <div className="market-kpi">
      <span className="market-kpi-label">{label}</span>
      <span className={`market-kpi-value ${colorClass || ''}`}>{value}</span>
    </div>
  )
}
