'use client'

import { useState } from 'react'
import { FONT, MONO } from './constants'
import { VAULTS, aggregate } from './data'
import { Sidebar } from './sidebar'
import { PortfolioSummary } from './portfolio-summary'
import { VaultDetailPanel } from './vault-detail-panel'
import { SubscribePanel } from './subscribe-panel'

// ─── Canvas (orchestrator) ───────────────────────────────────────────────

export function Canvas() {
  const vaults = VAULTS
  const agg = aggregate(vaults)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const selected = selectedId ? vaults.find(v => v.id === selectedId) ?? null : null

  return (
    <div
      className="hub-font-scope fixed inset-0 flex flex-col"
      style={{
        background: 'var(--dashboard-page)',
        color: 'var(--dashboard-text-primary)',
        fontFamily: FONT,
        WebkitFontSmoothing: 'antialiased',
        zIndex: 1,
        isolation: 'isolate',
        overflow: 'hidden',
      }}
    >
      <Header
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarId="connect-sidebar"
      />
      <main className="flex-1 flex min-h-0 min-w-0">
        {sidebarOpen && (
          <>
            <Sidebar
              vaults={vaults}
              selectedId={selectedId}
              onSelect={setSelectedId}
              agg={agg}
              selected={selected}
            />
            <div style={{ width: '1px', background: 'var(--dashboard-border)', flexShrink: 0 }} />
          </>
        )}
        <MainPanel vaults={vaults} selected={selected} agg={agg} />
      </main>
    </div>
  )
}

// ─── Header ──────────────────────────────────────────────────────────────

function Header({
  sidebarOpen,
  onToggleSidebar,
  sidebarId,
}: {
  sidebarOpen: boolean
  onToggleSidebar: () => void
  sidebarId: string
}) {
  return (
    <header
      className="flex items-center justify-between shrink-0 select-none"
      style={{ 
        height: '48px', 
        padding: '0 clamp(1rem, 4vw, 2rem)', 
        borderBottom: '1px solid var(--dashboard-border)',
        background: 'var(--dashboard-page)',
      }}
    >
      <div className="flex items-baseline" style={{ gap: '12px' }}>
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-expanded={sidebarOpen}
          aria-controls={sidebarId}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px',
            margin: '-8px',
            boxShadow: 'none',
            cursor: 'pointer',
            fontFamily: MONO,
            fontSize: '10px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: sidebarOpen ? 'var(--dashboard-accent)' : 'var(--dashboard-text-ghost)',
            transition: 'color 150ms ease',
          }}
          onMouseEnter={(e) => {
            if (!sidebarOpen) e.currentTarget.style.color = 'var(--dashboard-text-primary)'
          }}
          onMouseLeave={(e) => {
            if (!sidebarOpen) e.currentTarget.style.color = 'var(--dashboard-text-ghost)'
          }}
        >
          MENU
        </button>
        <span style={{ fontFamily: FONT, fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          HEARST
        </span>
      </div>
      <nav className="flex items-center" style={{ gap: '2rem' }}>
        {['SYS_STATE: OPTIMAL', 'BLK: 842,014', 'NET_DIFF: 83.1T'].map(l => (
          <span key={l} style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--dashboard-text-ghost)' }}>
            {l}
          </span>
        ))}
      </nav>
      <span style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dashboard-text-ghost)', opacity: 0.4 }}>
        Institutional Access
      </span>
    </header>
  )
}

// ─── MainPanel (router) ──────────────────────────────────────────────────

function MainPanel({ vaults, selected, agg }: {
  vaults: typeof VAULTS
  selected: (typeof VAULTS)[number] | null
  agg: ReturnType<typeof aggregate>
}) {
  if (selected?.type === 'available') return <SubscribePanel vault={selected} />
  if (selected?.type === 'active' || selected?.type === 'matured') {
    return <VaultDetailPanel vault={selected} />
  }
  return <PortfolioSummary vaults={vaults} agg={agg} />
}
