'use client'

import { useState } from 'react'
import { MONO, TOKENS } from './constants'
import { VAULTS, aggregate, type VaultLine, type Aggregate } from './data'
import { Sidebar } from './sidebar'
import { PortfolioSummary } from './portfolio-summary'
import { VaultDetailPanel } from './vault-detail-panel'
import { SubscribePanel } from './subscribe-panel'

const WALLET = '0x5F...AA57'

function KpiSep() {
  return (
    <span style={{
      display: 'inline-block',
      width: '1px',
      height: '18px',
      background: 'rgba(255,255,255,0.12)',
      margin: '0 20px',
      verticalAlign: 'middle',
    }} />
  )
}

function KpiBlock({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span style={{
        fontFamily: MONO,
        fontSize: '9px',
        fontWeight: 700,
        letterSpacing: '0.18em',
        textTransform: 'uppercase' as const,
        color: 'rgba(255,255,255,0.35)',
      }}>{label}</span>
      <span style={{
        fontFamily: MONO,
        fontSize: TOKENS.fontSizes.xs,
        fontWeight: TOKENS.fontWeights.bold,
        letterSpacing: '0.06em',
        color: accent ? TOKENS.colors.accent : TOKENS.colors.textOnDark,
      }}>{value}</span>
    </div>
  )
}

export function Canvas() {
  const agg = aggregate(VAULTS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const selected = selectedId ? VAULTS.find(v => v.id === selectedId) ?? null : null

  const totalValue = agg.totalDeposited + agg.totalClaimable
  const nextDist = new Date()
  nextDist.setDate(nextDist.getDate() + 1)
  const nextDistStr = nextDist.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()

  return (
    <div
      className="connect-scope fixed inset-0 flex flex-col"
      style={{
        background: TOKENS.colors.bgPage,
        color: TOKENS.colors.textPrimary,
        fontFamily: TOKENS.fonts.sans,
        WebkitFontSmoothing: 'antialiased',
        zIndex: 1,
        isolation: 'isolate',
        overflow: 'hidden',
      }}
    >
      {/* ══ HEADER NOIR 64px ══ */}
      <header
        className="shrink-0 flex items-center select-none"
        style={{
          height: '64px',
          background: TOKENS.colors.black,
          borderBottom: `${TOKENS.borders.thin} solid rgba(255,255,255,0.08)`,
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0',
        }}
      >
        {/* LEFT — MENU + HEARST */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setSidebarOpen(o => !o)}
            aria-expanded={sidebarOpen}
            aria-controls="connect-sidebar"
            style={{
              background: 'none',
              border: 'none',
              padding: '0 0 2px 0',
              cursor: 'pointer',
              fontFamily: MONO,
              fontSize: TOKENS.fontSizes.xs,
              fontWeight: TOKENS.fontWeights.bold,
              letterSpacing: TOKENS.letterSpacing.display,
              textTransform: 'uppercase' as const,
              color: sidebarOpen ? TOKENS.colors.accent : 'rgba(255,255,255,0.4)',
              borderBottom: `1px solid ${sidebarOpen ? TOKENS.colors.accent : 'transparent'}`,
              transition: '120ms ease-out',
            }}
          >
            MENU
          </button>
          <span style={{
            fontFamily: TOKENS.fonts.sans,
            fontSize: TOKENS.fontSizes.xs,
            fontWeight: TOKENS.fontWeights.black,
            letterSpacing: TOKENS.letterSpacing.display,
            textTransform: 'uppercase' as const,
            color: TOKENS.colors.textOnDark,
          }}>
            HEARST
          </span>
        </div>

        {/* CENTER — KPIs système */}
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          <KpiBlock label="SYS STATE" value="OPTIMAL" accent />
          <KpiSep />
          <KpiBlock label="AVG APR" value={`${agg.avgApr.toFixed(1)}%`} />
          <KpiSep />
          <KpiBlock label="NEXT DIST" value={nextDistStr} />
          <KpiSep />
          <KpiBlock label="TOTAL YIELD (YTD)" value={`$${agg.totalClaimable.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} accent />
          <KpiSep />
          <KpiBlock label="TOTAL VALUE" value={`$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} />
        </div>

        {/* RIGHT — WALLET */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <span style={{
            fontFamily: MONO,
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase' as const,
            color: 'rgba(255,255,255,0.35)',
          }}>CONNECTED</span>
          <span style={{
            fontFamily: MONO,
            fontSize: TOKENS.fontSizes.xs,
            fontWeight: TOKENS.fontWeights.bold,
            color: TOKENS.colors.textOnDark,
            letterSpacing: '0.04em',
          }}>{WALLET}</span>
        </div>
      </header>

      {/* ══ MAIN SHELL ══ */}
      <main className="flex-1 flex min-h-0 min-w-0" style={{ overflow: 'hidden' }}>
        {sidebarOpen && (
          <Sidebar
            vaults={VAULTS}
            selectedId={selectedId}
            onSelect={setSelectedId}
            agg={agg}
          />
        )}
        <MainPanel selected={selected} agg={agg} />
      </main>
    </div>
  )
}

function MainPanel({ selected, agg }: { selected: VaultLine | null; agg: Aggregate }) {
  if (selected) {
    if (selected.type === 'available') return <SubscribePanel vault={selected} />
    return <VaultDetailPanel vault={selected} />
  }
  return <PortfolioSummary vaults={VAULTS} agg={agg} />
}
