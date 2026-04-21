import { type Address } from 'viem'
import { base } from 'wagmi/chains'

const VAULT_ADDRESS_RAW = process.env.NEXT_PUBLIC_VAULT_ADDRESS
const USDC_ADDRESS_RAW = process.env.NEXT_PUBLIC_USDC_ADDRESS

if (!VAULT_ADDRESS_RAW) {
  console.error('[hearst] NEXT_PUBLIC_VAULT_ADDRESS missing — vault operations disabled')
}
if (!USDC_ADDRESS_RAW) {
  console.error('[hearst] NEXT_PUBLIC_USDC_ADDRESS missing — USDC operations disabled')
}

export const VAULT_ADDRESS = (VAULT_ADDRESS_RAW ?? '0x0000000000000000000000000000000000000000') as Address
export const USDC_ADDRESS = (USDC_ADDRESS_RAW ?? '0x0000000000000000000000000000000000000000') as Address

export const TARGET_CHAIN = base

export const USDC_DECIMALS = 6

export const CONTRACT_CONFIG = {
  EPOCH_DURATION: 30 * 24 * 60 * 60,
  WITHDRAWAL_LOCK_PERIOD: 4 * 365 * 24 * 60 * 60,
  BASIS_POINTS: 10_000,
} as const
