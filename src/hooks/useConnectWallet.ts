'use client'

import { useCallback } from 'react'
import { useConnect } from 'wagmi'

/** useConnectWallet — Centralizes MetaMask-first connect logic. Empty-state CTAs
 * (WalletNotConnected) and any other "connect now" entry point share this hook
 * so the connector preference stays consistent app-wide. */
export function useConnectWallet() {
  const { connect, connectors, isPending } = useConnect()

  const connectWallet = useCallback(() => {
    const connector =
      connectors.find((c) => c.id === 'metaMask' || c.name === 'MetaMask') ?? connectors[0]
    if (connector) connect({ connector })
  }, [connect, connectors])

  return { connectWallet, isConnecting: isPending }
}
