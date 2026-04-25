'use client'

import Link from 'next/link'
import { useCallback, useState } from 'react'
import { useAccount, useConnect, useChainId, useSwitchChain } from 'wagmi'
import { base } from 'wagmi/chains'
import { useVaultRegistry } from '@/hooks/useVaultRegistry'
import { fmtUsdCompact } from '@/components/connect/constants'
import { formatVaultName } from '@/components/connect/formatting'
import type { AvailableVault } from '@/components/connect/data'
import { toAvailableVault } from '@/lib/default-vaults'
import { MainNav } from '@/components/navigation/main-nav'
import { SubscriptionPanel } from '@/components/subscription/subscription-panel'

const PILLARS = [
  'Industrial mining yield',
  'Monthly USDC distributions',
  'Institutional controls',
  'On-chain proof of reserves',
  'Audited smart contracts',
] as const

function useWalletConnect() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { connect, connectors, isPending, reset } = useConnect()

  const triggerConnect = useCallback(() => {
    const connector = connectors[0]
    if (connector) {
      reset()
      connect({ connector })
    }
  }, [connectors, connect, reset])

  const wrongChain = isConnected && chainId !== base.id

  return { isConnected, isPending, wrongChain, triggerConnect }
}

function VaultCard({ vault, onClick }: { vault: AvailableVault; onClick: () => void }) {
  return (
    <button type="button" className="vaults-card" onClick={onClick}>
      <div className="vaults-card-header">
        <div className="vaults-card-title-group">
          {vault.image && (
            <img
              src={vault.image}
              alt={vault.name}
              className="vaults-card-image"
              width="44"
              height="44"
            />
          )}
          <div>
            <h3 className="vaults-card-name">{formatVaultName(vault.name)}</h3>
            <p className="vaults-card-strategy">{vault.strategy}</p>
          </div>
        </div>
        <div className="vaults-card-apr">
          {vault.apr}%
          <span className="vaults-card-apr-label">APR</span>
        </div>
      </div>

      <div className="vaults-card-meta">
        <span className="vaults-card-meta-item">{vault.lockPeriod}</span>
        <span className="vaults-card-meta-sep" aria-hidden>·</span>
        <span className="vaults-card-meta-item">Min {fmtUsdCompact(vault.minDeposit)}</span>
        <span className="vaults-card-meta-sep" aria-hidden>·</span>
        <span className="vaults-card-meta-item">{vault.risk} risk</span>
      </div>

      <div className="vaults-card-footer">
        <span className="vaults-card-fees">{vault.fees}</span>
        <span className="vaults-card-view">View details →</span>
      </div>
    </button>
  )
}

export function ProductsClient() {
  const { activeVaults, isLoading } = useVaultRegistry()
  const [selectedVault, setSelectedVault] = useState<AvailableVault | null>(null)
  const { isConnected, isPending, wrongChain, triggerConnect } = useWalletConnect()

  const availableVaults = activeVaults.map(toAvailableVault)

  return (
    <div className="vaults-shell">
      <MainNav />

      <main className="vaults-main">
        {/* Left column - Info */}
        <div className="vaults-left">
          <div className="vaults-hero">
            <h1 className="vaults-title">Investment Vaults</h1>
            <p className="vaults-subtitle">
              Access institutional-grade yield from industrial Bitcoin mining operations.
              USDC-backed vaults with transparent reporting and audited smart contracts.
            </p>
          </div>

          <ul className="vaults-pillars">
            {PILLARS.map((label) => (
              <li key={label} className="vaults-pillar">
                <span className="vaults-pillar-dot" aria-hidden />
                <span className="vaults-pillar-label">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right column - Vault Cards */}
        <div className="vaults-right">
          <div className="vaults-section-header">
            <h2 className="vaults-section-title">
              Available Vaults
              {availableVaults.length > 0 && (
                <span className="vaults-count">{availableVaults.length}</span>
              )}
            </h2>
          </div>

          {isLoading ? (
            <div className="vaults-loading">
              <div className="vaults-spinner" />
              <p>Loading vaults…</p>
            </div>
          ) : availableVaults.length === 0 ? (
            <div className="vaults-empty">
              <p>No vaults available at the moment.</p>
              <p className="vaults-empty-hint">Check back soon or contact us for early access.</p>
            </div>
          ) : (
            <div className="vaults-grid">
              {availableVaults.map((vault) => (
                <VaultCard
                  key={vault.id}
                  vault={vault}
                  onClick={() => setSelectedVault(vault)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="vaults-footer">
        <p>© 2026 Hearst · Audited smart contracts on Base</p>
        <div className="vaults-footer-links">
          <Link href="/">Home</Link>
          <a href="mailto:hello@hearstvault.com">Contact</a>
        </div>
      </footer>

      {selectedVault && (
        <SubscriptionPanel
          vault={selectedVault}
          isConnected={isConnected}
          isPending={isPending}
          wrongChain={wrongChain}
          onConnect={triggerConnect}
          onClose={() => setSelectedVault(null)}
        />
      )}
    </div>
  )
}
