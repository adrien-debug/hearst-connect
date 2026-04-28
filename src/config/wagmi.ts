import { createConfig, http } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { injected, coinbaseWallet } from 'wagmi/connectors'

const baseRpc = process.env.NEXT_PUBLIC_BASE_RPC_URL
const baseSepoliaRpc = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL

export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    injected({ target: 'metaMask' }),
    coinbaseWallet({ appName: 'Hearst Connect' }),
  ],
  transports: {
    [base.id]: http(baseRpc),
    [baseSepolia.id]: http(baseSepoliaRpc),
  },
})

export const SUPPORTED_CHAIN_IDS = [base.id, baseSepolia.id] as const
export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number]
