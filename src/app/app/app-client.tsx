'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useAccount, useConnect } from 'wagmi'
import { Canvas } from '@/components/connect/canvas'
import { NavigationProvider } from '@/components/connect/use-connect-routing'
import { useAppMode } from '@/hooks/useAppMode'

function AccessGate({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const { isConnected } = useAccount()
  const { isDemo } = useAppMode()
  const { connect, connectors, isPending, reset } = useConnect()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleConnect = useCallback(() => {
    const connector = connectors[0]
    if (connector) {
      reset()
      connect({ connector })
    }
  }, [connectors, connect, reset])

  // Don't flash content during hydration
  if (!mounted) {
    return (
      <div className="app-loading">
        <div className="app-spinner" />
      </div>
    )
  }

  // Access rules:
  // - Live mode: wallet connection required
  // - Demo mode: allowed only if valid admin session exists (enforced by useAppMode.isDemo)
  const hasAccess = isDemo || isConnected

  if (!hasAccess) {
    return (
      <div className="app-access-denied">
        <div className="app-access-card">
          <div className="app-access-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h1 className="app-access-title">Wallet Required</h1>
          <p className="app-access-desc">
            Connect your wallet to access the platform and view your portfolio.
          </p>
          <div className="app-access-actions">
            <button
              type="button"
              className="app-access-btn app-access-btn--primary"
              onClick={handleConnect}
              disabled={isPending}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 7H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2z" />
                <path d="M16 11h0" />
              </svg>
              {isPending ? 'Connecting…' : 'Connect Wallet'}
            </button>
            <Link href="/products" className="app-access-btn app-access-btn--ghost">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export function AppClient() {
  return (
    <NavigationProvider>
      <AccessGate>
        <Canvas />
      </AccessGate>
    </NavigationProvider>
  )
}
