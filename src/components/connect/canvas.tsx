'use client'

import { useState } from 'react'
import { MONO, TOKENS, fmtUsd } from './constants'
import { VAULTS, aggregate, type VaultLine, type Aggregate } from './data'
import { Sidebar } from './sidebar'
import { PortfolioSummary } from './portfolio-summary'
import { VaultDetailPanel } from './vault-detail-panel'
import { SubscribePanel } from './subscribe-panel'

const WALLET = '0x5F...AA57'
const ON_DARK_GHOST = 'rgba(255,255,255,0.35)' // ghost text sur fond noir
const ON_DARK_MUTED = 'rgba(255,255,255,0.4)'  // menu inactif

export function Canvas() {
  const agg = aggregate(VAULTS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const selected = selectedId ? VAULTS.find(v => v.id === selectedId) ?? null : null
  const activePositions = VAULTS.filter(v => v.type === 'active').length
  const currentView = selected
    ? selected.type === 'available'
      ? 'Subscription'
      : 'Position Detail'
    : 'Portfolio'

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
          height: TOKENS.spacing[16],
          background: TOKENS.colors.black,
          borderBottom: `${TOKENS.borders.thin} solid rgba(255,255,255,0.12)`,
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
              color: sidebarOpen ? TOKENS.colors.textOnDark : ON_DARK_MUTED,
              borderBottom: `${TOKENS.borders.thin} solid ${sidebarOpen ? TOKENS.colors.textOnDark : 'transparent'}`,
              transition: '120ms ease-out',
            }}
          >
            Register
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

        <div style={{
          fontFamily: MONO,
          fontSize: TOKENS.fontSizes.xs,
          fontWeight: TOKENS.fontWeights.bold,
          letterSpacing: TOKENS.letterSpacing.display,
          textTransform: 'uppercase',
          color: TOKENS.colors.textOnDark,
        }}>
          {currentView}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: TOKENS.spacing[6], flexShrink: 0 }}>
          <HeaderMetric label="Available Yield" value={fmtUsd(agg.totalClaimable)} accent />
          <HeaderMetric label="Active Positions" value={String(activePositions)} />
          <span style={{
            fontFamily: MONO,
            fontSize: TOKENS.fontSizes.xs,
            fontWeight: TOKENS.fontWeights.bold,
            letterSpacing: TOKENS.letterSpacing.display,
            textTransform: 'uppercase' as const,
            color: ON_DARK_GHOST,
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

function HeaderMetric({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
      <span style={{
        fontFamily: MONO,
        fontSize: TOKENS.fontSizes.xs,
        fontWeight: TOKENS.fontWeights.bold,
        letterSpacing: TOKENS.letterSpacing.display,
        textTransform: 'uppercase',
        color: ON_DARK_GHOST,
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: MONO,
        fontSize: TOKENS.fontSizes.xs,
        fontWeight: TOKENS.fontWeights.bold,
        letterSpacing: TOKENS.letterSpacing.wide,
        color: accent ? TOKENS.colors.accent : TOKENS.colors.textOnDark,
      }}>
        {value}
      </span>
    </div>
  )
}
