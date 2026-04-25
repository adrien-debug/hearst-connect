'use client'

import { useMarketLatest, useMarketHistory, useAgentsStatus } from '@/hooks/useMarketData'
import { ADMIN_TOKENS as T, MONO, fmtUsd } from '../constants'

export function MarketSection() {
  const { data: latestData, isLoading: loadingLatest } = useMarketLatest()
  const { data: historyData } = useMarketHistory(48)
  const { data: agentsData } = useAgentsStatus()

  const snap = latestData?.snapshot
  const snapshots = historyData?.snapshots ?? []
  const agents = agentsData?.agents ?? []

  if (loadingLatest) {
    return <div style={{ color: T.colors.textSecondary, padding: T.spacing[6] }}>Loading market data...</div>
  }

  return (
    <div>
      {/* Live market data */}
      {snap ? (
        <>
          <div style={s.kpiGrid}>
            <KpiCard label="BTC / USD" value={fmtUsd(snap.btcPrice)} />
            <KpiCard label="24h Change" value={`${snap.btc24hChange >= 0 ? '+' : ''}${snap.btc24hChange.toFixed(2)}%`} color={snap.btc24hChange >= 0 ? T.colors.success : T.colors.danger} />
            <KpiCard label="7d Change" value={`${snap.btc7dChange >= 0 ? '+' : ''}${snap.btc7dChange.toFixed(2)}%`} color={snap.btc7dChange >= 0 ? T.colors.success : T.colors.danger} />
            <KpiCard label="Fear & Greed" value={`${snap.fearGreed} — ${snap.fearLabel}`} color={snap.fearGreed < 30 ? T.colors.danger : snap.fearGreed > 70 ? T.colors.success : T.colors.warning} />
          </div>

          <div style={s.kpiGrid}>
            <KpiCard label="USDC APY (Aave)" value={`${snap.usdcApy.toFixed(2)}%`} color={T.colors.success} />
            <KpiCard label="USDT APY (Aave)" value={`${snap.usdtApy.toFixed(2)}%`} color={T.colors.success} />
            <KpiCard label="BTC APY (Aave)" value={`${snap.btcApy.toFixed(2)}%`} color={T.colors.success} />
            <KpiCard label="Mining Hashprice" value={snap.miningHashprice ? `$${snap.miningHashprice.toFixed(0)}/PH/day` : 'N/A'} />
          </div>

          {snap.notes && (
            <div style={s.insightCard}>
              <h3 style={s.insightTitle}>Agent Insight</h3>
              <p style={s.insightText}>{snap.notes}</p>
              <span style={s.insightTime}>{new Date(snap.timestamp).toLocaleString()}</span>
            </div>
          )}
        </>
      ) : (
        <div style={s.empty}>
          <p>No market data yet. Agents will populate this when running.</p>
        </div>
      )}

      {/* History table */}
      {snapshots.length > 0 && (
        <div style={s.tableCard}>
          <h3 style={s.tableTitle}>Recent Snapshots ({snapshots.length})</h3>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Time</th>
                  <th style={s.th}>BTC</th>
                  <th style={s.th}>24h</th>
                  <th style={s.th}>USDC</th>
                  <th style={s.th}>USDT</th>
                  <th style={s.th}>F&G</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.slice(0, 20).map(s => (
                  <tr key={s.id}>
                    <td style={st.td}>{new Date(s.timestamp).toLocaleTimeString()}</td>
                    <td style={st.td}>{fmtUsd(s.btcPrice)}</td>
                    <td style={{ ...st.td, color: s.btc24hChange >= 0 ? T.colors.success : T.colors.danger }}>
                      {s.btc24hChange >= 0 ? '+' : ''}{s.btc24hChange.toFixed(2)}%
                    </td>
                    <td style={st.td}>{s.usdcApy.toFixed(2)}%</td>
                    <td style={st.td}>{s.usdtApy.toFixed(2)}%</td>
                    <td style={st.td}>{s.fearGreed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Agents health */}
      <div style={s.tableCard}>
        <h3 style={s.tableTitle}>Agent Status</h3>
        {agents.map(a => (
          <div key={a.name} style={s.agentRow}>
            <div style={{ ...s.statusDot, background: a.status === 'online' ? T.colors.success : T.colors.danger }} />
            <span style={s.agentName}>{a.name}</span>
            <span style={s.agentMeta}>{a.status}</span>
            {a.lastSeen && <span style={s.agentMeta}>{new Date(a.lastSeen).toLocaleString()}</span>}
            {a.lastMessage && <span style={s.agentMsg}>{a.lastMessage}</span>}
          </div>
        ))}
        {agents.length === 0 && <p style={{ color: T.colors.textSecondary, fontSize: T.fontSizes.sm }}>No agents connected</p>}
      </div>
    </div>
  )
}

function KpiCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={s.kpi}>
      <span style={s.kpiLabel}>{label}</span>
      <span style={{ ...s.kpiValue, color: color || T.colors.textPrimary }}>{value}</span>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  kpiGrid: { display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${T.spacing[50]}, 1fr))`, gap: T.spacing[3], marginBottom: T.spacing[4] },
  kpi: {
    background: T.colors.bgSurface, border: `1px solid ${T.colors.borderSubtle}`,
    borderRadius: T.radius.lg, padding: T.spacing[4],
  },
  kpiLabel: { display: 'block', fontSize: T.fontSizes.xs, color: T.colors.textSecondary, textTransform: 'uppercase', letterSpacing: T.letterSpacing.loose, marginBottom: T.spacing[1] },
  kpiValue: { fontSize: T.fontSizes.xl, fontWeight: T.fontWeights.black, fontFamily: MONO },
  insightCard: {
    background: T.colors.bgSurface, border: `1px solid ${T.colors.borderSubtle}`,
    borderRadius: T.radius.lg, padding: T.spacing[4], marginBottom: T.spacing[4],
  },
  insightTitle: { fontSize: T.fontSizes.sm, fontWeight: T.fontWeights.bold, color: T.colors.accent, margin: `0 0 ${T.spacing[2]}` },
  insightText: { fontSize: T.fontSizes.sm, color: T.colors.textPrimary, lineHeight: T.lineHeight.relaxed, margin: `0 0 ${T.spacing[2]}` },
  insightTime: { fontSize: T.fontSizes.xs, color: T.colors.textSecondary },
  empty: {
    background: T.colors.bgSurface, border: `1px solid ${T.colors.borderSubtle}`,
    borderRadius: T.radius.lg, padding: T.spacing[8], textAlign: 'center',
    color: T.colors.textSecondary, fontSize: T.fontSizes.sm, marginBottom: T.spacing[4],
  },
  tableCard: {
    background: T.colors.bgSurface, border: `1px solid ${T.colors.borderSubtle}`,
    borderRadius: T.radius.lg, padding: T.spacing[4], marginBottom: T.spacing[4],
  },
  tableTitle: { fontSize: T.fontSizes.sm, fontWeight: T.fontWeights.bold, margin: `0 0 ${T.spacing[3]}`, color: T.colors.textPrimary },
  tableWrap: { overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontFamily: MONO, fontSize: T.fontSizes.xs },
  th: { textAlign: 'left', padding: T.spacing[2], color: T.colors.textSecondary, borderBottom: `1px solid ${T.colors.borderSubtle}`, fontWeight: T.fontWeights.bold },
  agentRow: { display: 'flex', alignItems: 'center', gap: T.spacing[3], padding: `${T.spacing[2]} 0`, borderBottom: `1px solid ${T.colors.borderSubtle}` },
  statusDot: { width: T.spacing[2], height: T.spacing[2], borderRadius: T.radius.full, flexShrink: 0 },
  agentName: { fontWeight: T.fontWeights.bold, fontSize: T.fontSizes.sm, textTransform: 'capitalize', minWidth: T.spacing[20] },
  agentMeta: { fontSize: T.fontSizes.xs, color: T.colors.textSecondary },
  agentMsg: { fontSize: T.fontSizes.xs, color: T.colors.textSecondary, fontStyle: 'italic', flex: 1, textAlign: 'right' },
}

const st: Record<string, React.CSSProperties> = {
  td: { padding: T.spacing[2], borderBottom: `1px solid ${T.colors.borderSubtle}`, color: T.colors.textPrimary, fontSize: T.fontSizes.xs },
}
