import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { base } from 'wagmi/chains'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  console.error('[hearst] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID missing — WalletConnect disabled')
}

export const wagmiConfig = getDefaultConfig({
  appName: 'Hearst Connect',
  projectId: projectId || 'hearst-fallback-dev-only',
  chains: [base],
  ssr: true,
})
