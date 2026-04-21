import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { base } from 'wagmi/chains'
import { http } from 'wagmi'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
const isPlaceholder = !projectId || projectId === 'placeholder_dev_only'

if (isPlaceholder) {
  console.warn('[hearst] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID not set — WalletConnect unavailable')
}

export const wagmiConfig = getDefaultConfig({
  appName: 'Hearst Connect',
  projectId: isPlaceholder ? '00000000000000000000000000000000' : projectId!,
  chains: [base],
  transports: {
    [base.id]: http('https://base.drpc.org'),
  },
  ssr: true,
})
