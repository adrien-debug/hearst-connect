'use client'

import Link from 'next/link'
import { useMemo, useEffect, useState } from 'react'
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { base } from 'wagmi/chains'
import { useVaultLines } from '@/hooks/useVaultLines'
import { fmtUsdCompact } from '@/components/connect/constants'
import { formatVaultName } from '@/components/connect/formatting'
import type { AvailableVault, VaultLine } from '@/components/connect/data'

const PILLARS = [
  'Industrial mining yield',
  'Monthly USDC distributions',
  'Institutional controls',
  'On-chain proof of reserves',
  'Audited smart contracts',
] as const

/** Prefer subscribe-able vaults; fallback to full list (e.g. all positions active in demo). */
function rowsForIntro(vaults: VaultLine[]): VaultLine[] {
  const available = vaults.filter((v): v is AvailableVault => v.type === 'available')
  return available.length > 0 ? available : vaults
}

function vaultSubtitle(line: VaultLine): string {
  if (line.type === 'available') {
    return `${line.apr}% APR · Target ${line.target} · Min ${fmtUsdCompact(line.minDeposit)} · ${line.lockPeriod}`
  }
  if (line.type === 'active') {
    return `${line.apr}% APR · Active position · +${fmtUsdCompact(line.claimable)} claimable`
  }
  return `${line.apr}% APR · ${line.maturity}`
}

function formatShortAddress(addr: string) {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`
}

function IntroHeaderWallet() {
  const [mounted, setMounted] = useState(false)
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { connect, connectors, isPending, error, reset } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain, isPending: isSwitching } = useSwitchChain()

  useEffect(() => {
    setMounted(true)
  }, [])

  const wrongChain = isConnected && chainId !== base.id

  if (!mounted) {
    return (
      <div className="intro-header-wallet" aria-busy="true">
        <span className="intro-wallet-address">…</span>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="intro-header-wallet">
        {connectors.map((connector) => (
            <button
              key={connector.uid}
              type="button"
              className="intro-btn-wallet intro-btn-wallet--primary"
              disabled={isPending || !connector.ready}
              onClick={() => {
                reset()
                connect({ connector })
              }}
            >
              {isPending ? 'Connexion…' : connector.name}
            </button>
          ))}
        {error ? (
          <p className="intro-connect-error" role="alert">
            {error.message.length > 120 ? `${error.message.slice(0, 120)}…` : error.message}
          </p>
        ) : null}
      </div>
    )
  }

  if (wrongChain) {
    return (
      <div className="intro-header-wallet">
        <span className="intro-wallet-address">Réseau actuel · {chainId}</span>
        <button
          type="button"
          className="intro-btn-wallet intro-btn-wallet--accent-outline"
          disabled={isSwitching}
          onClick={() => switchChain({ chainId: base.id })}
        >
          {isSwitching ? 'Changement…' : 'Passer sur Base'}
        </button>
      </div>
    )
  }

  return (
    <div className="intro-header-wallet">
      {address ? <span className="intro-wallet-address">{formatShortAddress(address)}</span> : null}
      <Link href="/app" className="intro-btn-wallet intro-btn-wallet--primary">
        Ouvrir la plateforme
      </Link>
      <button
        type="button"
        className="intro-btn-wallet intro-btn-wallet--ghost"
        onClick={() => disconnect()}
      >
        Déconnecter
      </button>
    </div>
  )
}

export function IntroClient() {
  const { vaults, hasVaults, isLoading } = useVaultLines()
  const displayRows = useMemo(() => rowsForIntro(vaults), [vaults])

  return (
    <div className="intro-shell" data-theme="dark">
      <header className="intro-header">
        <Link href="/" className="intro-back">
          ← Back to Home
        </Link>
        <IntroHeaderWallet />
      </header>

      <main className="intro-main">
        <div className="intro-left">
          <img
            src="/logos/hearst-connect-blackbg.svg"
            alt="Hearst Connect"
            className="intro-wordmark"
          />

          <ul className="intro-pillars">
            {PILLARS.map((label) => (
              <li key={label} className="intro-pillar">
                <span className="intro-pillar-dot" aria-hidden />
                <strong className="intro-pillar-label">{label}</strong>
              </li>
            ))}
          </ul>

          <section className="intro-programs" aria-labelledby="intro-programs-heading">
            <h2 id="intro-programs-heading" className="intro-programs-title">
              Programmes
            </h2>
            {isLoading ? (
              <p className="intro-programs-empty">Chargement des vaults…</p>
            ) : !hasVaults || displayRows.length === 0 ? (
              <p className="intro-programs-empty">
                Aucun vault n’est enregistré pour l’instant. Connectez un wallet puis ouvrez la plateforme, ou
                demandez à un admin d’ajouter des vaults (mode live).
              </p>
            ) : (
              <ul className="intro-programs-list">
                {displayRows.map((line) => (
                  <li key={line.id} className="intro-program-row">
                    <span className="intro-program-name">{formatVaultName(line.name)}</span>
                    <span className="intro-program-meta">{vaultSubtitle(line)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="intro-cta-group">
            <Link href="/app" className="intro-cta-primary">
              <span>Accéder à la plateforme</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <p className="intro-cta-hint">
              Connectez un wallet en haut à droite (injected, Coinbase…), puis ouvrez la plateforme sur Base.
            </p>
          </div>
        </div>

        <div className="intro-right">
          <div className="intro-video-card">
            <video className="intro-video" src="/intro-bg.mp4" autoPlay loop muted playsInline />
            <div className="intro-video-vignette" aria-hidden />
          </div>
        </div>
      </main>

      <footer className="intro-footer">
        <p>© 2026 Hearst · Audited smart contracts on Base</p>
      </footer>
    </div>
  )
}
