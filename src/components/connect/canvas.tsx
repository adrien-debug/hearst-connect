'use client'

import { useState, useEffect, useRef, type RefObject } from 'react'
import { useEpoch } from '@/hooks/useEpoch'
import { FONT, MONO, VAULT_LINE_SPACING, MIN_VAULT_LINE_OPACITY, fmtUsd } from './constants'

// ─── Mock data ───────────────────────────────────────────────────────────

interface VaultLine {
  id: string
  name: string
  deposited: number
  claimable: number
  lockedUntil: number
  apr: number
  canWithdraw: boolean
}

function useVaults(): VaultLine[] {
  const now = Math.floor(Date.now() / 1000)
  return [
    { id: 'epoch-42', name: 'Epoch 42', deposited: 5250000, claimable: 14230.50, lockedUntil: now + 86400 * 14, apr: 12.4, canWithdraw: false },
    { id: 'epoch-41', name: 'Epoch 41', deposited: 2000000, claimable: 0,        lockedUntil: now + 86400 * 7,  apr: 11.2, canWithdraw: false },
    { id: 'epoch-40', name: 'Epoch 40', deposited: 1500000, claimable: 125000,   lockedUntil: 0,                 apr: 14.1, canWithdraw: true  },
    { id: 'epoch-39', name: 'Epoch 39', deposited: 850000,  claimable: 42000,    lockedUntil: 0,                 apr: 13.8, canWithdraw: true  },
  ]
}

function aggregateVaults(vaults: VaultLine[]) {
  const totalDeposited = vaults.reduce((s, v) => s + v.deposited, 0)
  return {
    totalDeposited,
    totalClaimable: vaults.reduce((s, v) => s + v.claimable, 0),
    avgApr: totalDeposited > 0
      ? vaults.reduce((s, v) => s + v.apr * v.deposited, 0) / totalDeposited
      : 0,
    anyLocked: vaults.some(v => !v.canWithdraw),
  }
}

// ─── Canvas ──────────────────────────────────────────────────────────────

export function Canvas() {
  const vaults = useVaults()
  const agg = aggregateVaults(vaults)
  const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null)

  const selectedVault = selectedVaultId ? vaults.find(v => v.id === selectedVaultId) ?? null : null
  const activeVault = selectedVault ?? null

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
      <Header />
      <main className="flex-1 flex min-h-0 min-w-0 flex-col sm:flex-row">
        <Ledger
          vaults={vaults}
          selectedVaultId={selectedVaultId}
          onSelectVault={setSelectedVaultId}
          selectedVault={selectedVault}
          aggregate={agg}
        />
        <div className="hidden sm:block" style={{ width: '1px', background: 'var(--dashboard-border)', flexShrink: 0 }} />
        <TemporalFlow
          vaults={vaults}
          selectedVaultId={selectedVaultId}
          onSelectVault={setSelectedVaultId}
          activeVault={activeVault}
          aggregate={agg}
        />
      </main>
    </div>
  )
}

// ─── Header ──────────────────────────────────────────────────────────────

function Header() {
  return (
    <header
      className="flex items-center justify-between shrink-0 select-none"
      style={{ height: '48px', padding: '0 clamp(1rem, 4vw, 2rem)', borderBottom: '1px solid var(--dashboard-border)' }}
    >
      <span style={{ fontFamily: FONT, fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dashboard-text-primary)' }}>
        Connect
      </span>
      <nav className="flex items-center" style={{ gap: '2rem' }}>
        {['SYS_STATE: OPTIMAL', 'BLK: 842,014', 'NET_DIFF: 83.1T'].map(label => (
          <span key={label} style={{ fontFamily: MONO, fontSize: '10px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--dashboard-text-ghost)', cursor: 'default' }}>
            {label}
          </span>
        ))}
      </nav>
      <span style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dashboard-text-ghost)', opacity: 0.4 }}>
        Institutional access
      </span>
    </header>
  )
}

// ─── Left Ledger ─────────────────────────────────────────────────────────

function Ledger({
  vaults, selectedVaultId, onSelectVault, selectedVault, aggregate,
}: {
  vaults: VaultLine[]
  selectedVaultId: string | null
  onSelectVault: (id: string | null) => void
  selectedVault: VaultLine | null
  aggregate: ReturnType<typeof aggregateVaults>
}) {
  const [vaultListOpen, setVaultListOpen] = useState(false)
  const multiVault = vaults.length > 1
  const activeVault = selectedVault ?? null

  const deposited = activeVault ? activeVault.deposited : aggregate.totalDeposited
  const claimableNum = activeVault ? activeVault.claimable : aggregate.totalClaimable
  const apr = activeVault ? activeVault.apr : aggregate.avgApr
  const currentValue = deposited + claimableNum
  const locked = activeVault ? !activeVault.canWithdraw : aggregate.anyLocked
  const lockTs = activeVault?.lockedUntil ?? 0
  const nextUnlock = lockTs > 0
    ? new Date(lockTs * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—'
  const vaultLabel = activeVault ? activeVault.name : 'All Vaults'

  if (vaultListOpen && multiVault) {
    return (
      <aside className="flex flex-col shrink-0" style={{ width: 'clamp(260px, 30vw, 380px)', maxWidth: '100%', padding: '36px clamp(1rem, 3vw, 2rem) 28px', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <span style={{ fontFamily: MONO, fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dashboard-text-ghost)' }}>Select Vault</span>
          <button onClick={() => setVaultListOpen(false)} style={{ fontFamily: MONO, fontSize: '9px', color: 'var(--dashboard-text-ghost)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>✕</button>
        </div>
        <button
          onClick={() => { onSelectVault(null); setVaultListOpen(false) }}
          style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--dashboard-border)', background: 'none', border: 'none', borderBottom: '1px solid var(--dashboard-border)', cursor: 'pointer', width: '100%', opacity: selectedVaultId === null ? 1 : 0.5 }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = selectedVaultId === null ? '1' : '0.5' }}
        >
          <span style={{ fontFamily: FONT, fontSize: '0.8rem', fontWeight: 600, color: 'var(--dashboard-text-primary)' }}>All Vaults</span>
          <span style={{ fontFamily: MONO, fontSize: '12px', color: 'var(--dashboard-text-secondary)' }}>{fmtUsd(aggregate.totalDeposited)}</span>
        </button>
        {vaults.map(v => (
          <button
            key={v.id}
            onClick={() => { onSelectVault(v.id); setVaultListOpen(false) }}
            style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '12px 0', background: 'none', border: 'none', borderBottom: '1px solid var(--dashboard-border)', cursor: 'pointer', width: '100%', opacity: selectedVaultId === v.id ? 1 : 0.5 }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = selectedVaultId === v.id ? '1' : '0.5' }}
          >
            <span style={{ fontFamily: FONT, fontSize: '0.8rem', fontWeight: 500, color: 'var(--dashboard-text-primary)' }}>{v.name}</span>
            <span style={{ fontFamily: MONO, fontSize: '12px', color: 'var(--dashboard-text-secondary)' }}>{fmtUsd(v.deposited)}</span>
          </button>
        ))}
      </aside>
    )
  }

  return (
    <aside className="flex flex-col shrink-0" style={{ width: 'clamp(260px, 30vw, 380px)', maxWidth: '100%', padding: '36px clamp(1rem, 3vw, 2rem) 28px', overflow: 'auto' }}>
      <div>
        {/* Vault selector */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div
            onClick={multiVault ? () => setVaultListOpen(true) : undefined}
            style={{ fontFamily: MONO, fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dashboard-text-ghost)', cursor: multiVault ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {vaultLabel}
            {multiVault && <span style={{ fontSize: '8px', opacity: 0.6 }}>▾</span>}
          </div>
          {multiVault && (
            <span style={{ fontFamily: MONO, fontSize: '8px', letterSpacing: '0.08em', color: 'var(--dashboard-text-ghost)', opacity: 0.5 }}>
              {vaults.length} vaults
            </span>
          )}
        </div>

        <BigNumber value={currentValue} />

        <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Row label="Deposited" value={fmtUsd(deposited)} />
          <Row label="Claimable" value={fmtUsd(claimableNum)} accent />
          <Row label="APR" value={`${apr.toFixed(1)}%`} />
          <Sep />
          <Row label="Status" value={locked ? 'Locked' : 'Unlocked'} />
          <Row label="Next Unlock" value={nextUnlock} />
        </div>
      </div>
    </aside>
  )
}

// ─── Right Temporal Flow ──────────────────────────────────────────────────

function TemporalFlow({ vaults, selectedVaultId, onSelectVault, activeVault, aggregate }: {
  vaults: VaultLine[]
  selectedVaultId: string | null
  onSelectVault: (id: string | null) => void
  activeVault: VaultLine | null
  aggregate: ReturnType<typeof aggregateVaults>
}) {
  const { epoch, progress, countdownFormatted } = useEpoch()

  const nowPct = Math.max(12, Math.min(88, progress * 100))
  const claimableNum = activeVault ? activeVault.claimable : aggregate.totalClaimable
  const depositedNum = activeVault ? activeVault.deposited : aggregate.totalDeposited
  const activeApr = activeVault ? activeVault.apr : aggregate.avgApr
  const locked = activeVault ? !activeVault.canWithdraw : aggregate.anyLocked
  const lockTs = activeVault?.lockedUntil ?? 0
  const lockDateStr = lockTs > 0 ? new Date(lockTs * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
  const projectedMonthly = depositedNum > 0 && activeApr > 0 ? (depositedNum * activeApr) / 100 / 12 : 0
  const selectedVaultName = activeVault?.name ?? 'All Vaults'

  const statusText = locked
    ? `Locked until ${lockDateStr} · Yield accumulating`
    : `Yielding at ${activeApr.toFixed(1)}% APR · ${fmtUsd(claimableNum)} available`

  const chartWidth = 960
  const chartHeight = 360
  const chartPadX = 40
  const chartPadY = 36
  const plotWidth = chartWidth - chartPadX * 2
  const plotHeight = chartHeight - chartPadY * 2
  const nowX = chartPadX + (plotWidth * nowPct) / 100
  const xAt = (pct: number) => chartPadX + (plotWidth * pct) / 100
  const chartVaults = selectedVaultId
    ? vaults.filter((vault) => vault.id === selectedVaultId)
    : vaults

  const buildSeries = (vault: VaultLine, index: number, count: number) => {
    const centerOffset = (index - (count - 1) / 2) * VAULT_LINE_SPACING * 1.8
    const baseY = chartPadY + plotHeight * 0.56 + centerOffset
    const claimRatio = Math.min(1, vault.claimable / 125000)
    const aprRatio = Math.min(1, Math.max(0, (vault.apr - 10) / 5))
    const lockLift = vault.canWithdraw ? 10 : -8
    const startY = baseY + 22 - claimRatio * 16
    const midY = baseY + 4
    const endY = baseY - 30 - aprRatio * 26 + lockLift
    const startX = xAt(0)
    const endX = xAt(100)
    const pastPath = `M ${startX} ${startY} C ${xAt(18)} ${startY - 2}, ${xAt(Math.max(28, nowPct - 12))} ${midY + 8}, ${nowX} ${midY}`
    const futurePath = `M ${nowX} ${midY} C ${xAt(Math.min(72, nowPct + 10))} ${midY - 8}, ${xAt(82)} ${endY + 8}, ${endX} ${endY}`
    const labelX = Math.min(endX - 110, nowX + 20)
    const labelY = endY - 10
    const opacity = selectedVaultId && selectedVaultId !== vault.id ? MIN_VAULT_LINE_OPACITY : index === 0 ? 0.88 : 0.58 + index * 0.08
    const strokeWidth = selectedVaultId === vault.id ? 2.8 : index === 0 ? 2.2 : 1.8
    return {
      vault,
      pastPath,
      futurePath,
      labelX,
      labelY,
      midY,
      opacity,
      strokeWidth,
      showLabel: !selectedVaultId || selectedVaultId === vault.id,
    }
  }

  const series = chartVaults.map((vault, index) => buildSeries(vault, index, chartVaults.length))

  return (
    <div className="flex-1 flex flex-col min-w-0" style={{ overflow: 'hidden' }}>
      <div
        className="flex-1"
        style={{
          padding: '32px clamp(1.25rem, 3vw, 2rem) 28px',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gap: '18px',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            marginBottom: '20px',
          }}
        >
          <MetricCard label="Selection" value={selectedVaultName} />
          <MetricCard label="Epoch" value={`#${String(epoch).padStart(2, '0')} · ${countdownFormatted}`} />
          <MetricCard label="Accumulated" value={fmtUsd(claimableNum)} accent />
          <MetricCard label="Projected / mo" value={fmtUsd(projectedMonthly)} />
        </div>

        <div
          style={{
            position: 'relative',
            minHeight: `${chartHeight}px`,
            border: '1px solid var(--dashboard-border)',
            background: 'linear-gradient(180deg, var(--dashboard-overlay-03), transparent)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              width: `${nowPct}%`,
              background: 'linear-gradient(180deg, var(--dashboard-overlay-06), transparent)',
              pointerEvents: 'none',
            }}
          />

          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            preserveAspectRatio="none"
            style={{ display: 'block', width: '100%', height: `${chartHeight}px` }}
            aria-hidden="true"
          >
            {[0.2, 0.4, 0.6, 0.8].map((step) => {
              const y = chartPadY + plotHeight * step
              return (
                <line
                  key={step}
                  x1={chartPadX}
                  x2={chartWidth - chartPadX}
                  y1={y}
                  y2={y}
                  stroke="var(--dashboard-border)"
                  strokeWidth="1"
                  opacity="0.6"
                />
              )
            })}

            <line
              x1={nowX}
              x2={nowX}
              y1={chartPadY - 8}
              y2={chartHeight - chartPadY + 12}
              stroke="var(--dashboard-accent)"
              strokeWidth="1"
              opacity="0.35"
            />

            {series.map((item) => (
              <g key={item.vault.id}>
                <path
                  d={item.pastPath}
                  fill="none"
                  stroke="var(--dashboard-text-primary)"
                  strokeWidth={item.strokeWidth}
                  strokeLinecap="round"
                  opacity={item.opacity}
                />
                <path
                  d={item.futurePath}
                  fill="none"
                  stroke="var(--dashboard-text-secondary)"
                  strokeWidth={Math.max(1.2, item.strokeWidth - 0.5)}
                  strokeLinecap="round"
                  strokeDasharray="7 10"
                  opacity={Math.max(0.34, item.opacity * 0.82)}
                />
                <circle
                  cx={nowX}
                  cy={item.midY}
                  r={selectedVaultId === item.vault.id ? 4 : 3}
                  fill="var(--dashboard-accent)"
                  opacity={item.opacity}
                />
                {item.showLabel && (
                  <text
                    x={item.labelX}
                    y={item.labelY}
                    fill="var(--dashboard-text-ghost)"
                    style={{
                      fontFamily: MONO,
                      fontSize: '10px',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.vault.name}
                  </text>
                )}
              </g>
            ))}

            <text
              x={nowX}
              y={chartPadY - 14}
              textAnchor="middle"
              fill="var(--dashboard-accent)"
              style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase' }}
            >
              NOW {Math.round(progress * 100)}%
            </text>
          </svg>

          <div
            style={{
              position: 'absolute',
              left: '20px',
              bottom: '14px',
              fontFamily: MONO,
              fontSize: '8px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--dashboard-text-ghost)',
            }}
          >
            Epoch start
          </div>
          <div
            style={{
              position: 'absolute',
              right: '20px',
              bottom: '14px',
              fontFamily: MONO,
              fontSize: '8px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--dashboard-text-ghost)',
            }}
          >
            Epoch {String(epoch + 1).padStart(2, '0')}
          </div>
        </div>

        <div
          style={{
            marginTop: '14px',
            padding: '12px 14px',
            border: '1px solid var(--dashboard-border)',
            color: 'var(--dashboard-text-muted)',
            fontFamily: MONO,
            fontSize: '10px',
            letterSpacing: '0.04em',
          }}
        >
          {statusText}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      style={{
        border: '1px solid var(--dashboard-border)',
        padding: '12px 14px',
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: '8px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--dashboard-text-ghost)',
          marginBottom: '8px',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: '13px',
          color: accent ? 'var(--dashboard-accent)' : 'var(--dashboard-text-primary)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {value}
      </div>
    </div>
  )
}

// ─── Primitives ───────────────────────────────────────────────────────────

function BigNumber({ value }: { value: number }) {
  const [whole, decimal] = value.toFixed(2).split('.')
  const formatted = Number(whole).toLocaleString('en-US')
  return (
    <div style={{ fontFamily: FONT, fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1 }}>
      <span style={{ fontSize: 'clamp(2rem, 4vw, 2.65rem)', color: 'var(--dashboard-text-primary)', display: 'inline-block' }}>
        ${formatted}
      </span>
      <span style={{ fontSize: 'clamp(1.2rem, 2.4vw, 1.5rem)', color: 'var(--dashboard-text-ghost)' }}>
        .{decimal}
      </span>
    </div>
  )
}

function Row({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <span style={{ fontFamily: FONT, fontSize: '0.8rem', fontWeight: 500, color: 'var(--dashboard-text-muted)' }}>{label}</span>
      <span style={{ fontFamily: MONO, fontSize: '13px', fontWeight: 500, color: accent ? 'var(--dashboard-accent)' : 'var(--dashboard-text-primary)', letterSpacing: '0.02em' }}>{value}</span>
    </div>
  )
}

function Sep() {
  return <div style={{ height: '1px', background: 'var(--dashboard-border)', margin: '2px 0' }} />
}
