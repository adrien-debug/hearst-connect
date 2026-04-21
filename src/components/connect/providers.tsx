'use client'

import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState, useEffect } from 'react'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '@/config/wagmi'
import { TOKENS } from './constants'
import '@rainbow-me/rainbowkit/styles.css'

export function ConnectProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  }))

  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      // Suppress Next.js error overlay for known harmless wallet errors
      if (
        reason?.code === 4001 || 
        (reason instanceof Error && reason.message.includes('Failed to connect to MetaMask')) ||
        (typeof reason === 'string' && reason.includes('Failed to connect to MetaMask'))
      ) {
        event.preventDefault()
      }
    }
    window.addEventListener('unhandledrejection', handler)
    return () => window.removeEventListener('unhandledrejection', handler)
  }, [])

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: TOKENS.colors.accent,
            accentColorForeground: TOKENS.colors.black,
            borderRadius: 'medium',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
