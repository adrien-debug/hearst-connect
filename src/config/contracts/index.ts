import type { Address } from 'viem'
import { base, baseSepolia } from 'wagmi/chains'

import baseSepoliaContracts from './base-sepolia.json'
import baseContracts from './base.json'

export interface ContractAddresses {
  HearstVault: Address | null
  HearstVaultImpl: Address | null
  HearstPosition: Address | null
  HearstPositionImpl: Address | null
}

export interface ChainContracts {
  chainId: number
  chainName: string
  deployedAt: string | null
  txHash: string | null
  usdc: Address
  contracts: ContractAddresses
}

const USDC_BY_CHAIN: Record<number, Address> = {
  [base.id]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  [baseSepolia.id]: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
}

const REGISTRY: Record<number, ChainContracts> = {
  [base.id]: {
    ...baseContracts,
    usdc: USDC_BY_CHAIN[base.id],
  } as ChainContracts,
  [baseSepolia.id]: {
    ...baseSepoliaContracts,
    usdc: USDC_BY_CHAIN[baseSepolia.id],
  } as ChainContracts,
}

export function getContracts(chainId: number | undefined): ChainContracts | null {
  if (chainId === undefined) return null
  return REGISTRY[chainId] ?? null
}

export function isV2Chain(chainId: number | undefined): boolean {
  // Whether this chain runs the V2 cohort-aware vault. Sepolia first; mainnet flips when the
  // V2 contract is deployed and its address landed in `base.json`.
  if (chainId === undefined) return false
  const c = REGISTRY[chainId]
  return Boolean(c?.contracts?.HearstVault)
}
