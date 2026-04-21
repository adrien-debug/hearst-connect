'use client'

import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState, useEffect } from 'react'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '@/config/wagmi'
import '@rainbow-me/rainbowkit/styles.css'

export function ConnectProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  }))

  useEffect(() => {
    const NOISE = [
      'Allowlist', 'cloud.reown.com', 'Reown Config', 'Reown',
      'WalletConnect Core is already', 'WalletConnect',
      'Lit is in dev mode', 'lit.dev',
      'wallet must has', 'projectId',
      'MetaMask encountered an error', 'lockdown-install',
      'SES Removing', 'Cannot set property ethereum',
      'React DevTools', 'react-devtools',
      'preloaded using link preload but not used',
      'mainnet.base.org', 'web3modal.org', 'walletconnect.org',
      'NEXT_PUBLIC_WALLETCONNECT',
    ]

    const suppress = (args: unknown[]) =>
      args.some((a) => typeof a === 'string' && NOISE.some((n) => a.includes(n)))

    const origLog = console.log.bind(console)
    const origWarn = console.warn.bind(console)
    const origError = console.error.bind(console)

    console.log = (...args: unknown[]) => { if (!suppress(args)) origLog(...args) }
    console.warn = (...args: unknown[]) => { if (!suppress(args)) origWarn(...args) }
    console.error = (...args: unknown[]) => { if (!suppress(args)) origError(...args) }

    const handler = (event: PromiseRejectionEvent) => {
      const r = event.reason
      if (r?.code === 4001 || NOISE.some((n) => r?.message?.includes(n))) {
        event.preventDefault()
      }
    }
    window.addEventListener('unhandledrejection', handler)

    return () => {
      console.log = origLog
      console.warn = origWarn
      console.error = origError
      window.removeEventListener('unhandledrejection', handler)
    }
  }, [])

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#A7FB90',
            accentColorForeground: '#0A0A0A',
            borderRadius: 'medium',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
