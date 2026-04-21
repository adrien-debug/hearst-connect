'use client'

import { useState } from 'react'
import { MONO, TOKENS } from './constants'
import { VAULTS, aggregate, type VaultLine, type Aggregate } from './data'
import { Sidebar } from './sidebar'
import { PortfolioSummary } from './portfolio-summary'
import { VaultDetailPanel } from './vault-detail-panel'
import { SubscribePanel } from './subscribe-panel'

const WALLET = '0x5F...AA57'

// Couleurs on-dark non définies dans TOKENS — déclarées ici pour ne pas hardcoder
const ON_DARK_GHOST = 'rgba(255,255,255,0.35)' // ghost text sur fond noir
const ON_DARK_MUTED = 'rgba(255,255,255,0.4)'  // menu inactif

function KpiSep() {
  return (
    <span style={{
      display: 'inline-block',
      width: TOKENS.borders.thin,          // 1px
      height: TOKENS.spacing[6],           // 24px — grille 8px
      background: ON_DARK_GHOST,
      margin: `0 ${TOKENS.spacing[6]}`,    // 0 24px
      verticalAlign: 'middle',
    }} />
  )
}

function KpiBlock({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[0] }}>
      <span style={{
        fontFamily: MONO,
        fontSize: TOKENS.fontSizes.xs,          // 11px — interdit 9px
        fontWeight: TOKENS.fontWeights.bold,
        letterSpacing: TOKENS.letterSpacing.display, // 0.2em
        textTransform: 'uppercase' as const,
        color: ON_DARK_GHOST,
      }}>{label}</span>
      <span style={{
        fontFamily: MONO,
        fontSize: TOKENS.fontSizes.xs,
        fontWeight: TOKENS.fontWeights.bold,
        letterSpacing: TOKENS.letterSpacing.wide,    // 0.1em
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
  // Static label — avoids SSR/client mismatch (real date injected server-side if needed)
  const nextDistStr = 'TOMORROW'

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
          height: TOKENS.spacing[16],                              // 64px
          background: TOKENS.colors.black,
          borderBottom: `${TOKENS.borders.thin} solid ${ON_DARK_GHOST}`,
          padding: `0 ${TOKENS.spacing[8]}`,                       // 0 32px
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* LEFT — MENU + HEARST */}
        <div style={{ display: 'flex', alignItems: 'center', gap: TOKENS.spacing[6], flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setSidebarOpen(o => !o)}
            aria-expanded={sidebarOpen}
            aria-controls="connect-sidebar"
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontFamily: MONO,
              fontSize: TOKENS.fontSizes.xs,
              fontWeight: TOKENS.fontWeights.bold,
              letterSpacing: TOKENS.letterSpacing.display,
              textTransform: 'uppercase' as const,
              color: sidebarOpen ? TOKENS.colors.accent : ON_DARK_MUTED,
              borderBottom: `${TOKENS.borders.thin} solid ${sidebarOpen ? TOKENS.colors.accent : 'transparent'}`,
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
            HEARST CONNECT
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
        <div style={{ display: 'flex', alignItems: 'center', gap: TOKENS.spacing[2], flexShrink: 0 }}>
          <span style={{
            fontFamily: MONO,
            fontSize: TOKENS.fontSizes.xs,
            fontWeight: TOKENS.fontWeights.bold,
            letterSpacing: TOKENS.letterSpacing.display,
            textTransform: 'uppercase' as const,
            color: ON_DARK_GHOST,
          }}>CONNECTED</span>
          <span style={{
            fontFamily: MONO,
            fontSize: TOKENS.fontSizes.xs,
            fontWeight: TOKENS.fontWeights.bold,
            color: TOKENS.colors.textOnDark,
            letterSpacing: TOKENS.letterSpacing.wide,
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
