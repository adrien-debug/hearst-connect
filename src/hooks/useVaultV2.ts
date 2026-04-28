'use client'

/**
 * V2 vault hooks for the cohort-aware HearstVault contract (multi-cohort NFT positions,
 * on-chain rebalancing). Active on chains where `getContracts(chainId).contracts.HearstVault`
 * is non-null. Legacy single-position vault hooks live in `useVault.ts`.
 */

import { useReadContract, useReadContracts, useWriteContract, useAccount, useChainId } from 'wagmi'
import { formatUnits, type Address, type Hash } from 'viem'

import { HEARST_VAULT_ABI } from '@/config/abi/hearst-vault-v2'
import { getContracts } from '@/config/contracts'
import {
  USDC_DECIMALS,
  POLL_INTERVAL_BLOCK,
  POLL_INTERVAL_SLOW,
  MS_PER_SECOND,
} from '@/lib/constants'

export interface VaultCohort {
  tokenId: bigint
  principal: number
  rewardDebt: number
  depositTime: Date
  lockEnd: Date
  extendedUntil: Date | null
  cumulativePaid: number
  matured: boolean
  pendingRewards: number
}

export interface VaultGlobalV2 {
  totalDeposits: number
  currentEpoch: number
  currentRegime: 'BULL' | 'SIDEWAYS' | 'BEAR'
  pocketWeights: number[]
}

const REGIME_LABELS: Record<number, VaultGlobalV2['currentRegime']> = {
  0: 'BULL',
  1: 'SIDEWAYS',
  2: 'BEAR',
}

/** Resolves the V2 vault address for the connected chain, or null if not deployed there. */
export function useV2VaultAddress(): Address | null {
  const chainId = useChainId()
  return getContracts(chainId)?.contracts.HearstVault ?? null
}

export function useVaultGlobalV2(vaultAddress?: Address): {
  global: VaultGlobalV2 | null
  isLoading: boolean
  refetch: () => Promise<unknown>
} {
  const enabled = !!vaultAddress
  const baseRead = { address: vaultAddress, abi: HEARST_VAULT_ABI } as const

  const { data: totalDeposits, refetch: r1 } = useReadContract({
    ...baseRead,
    functionName: 'totalDeposits',
    query: { enabled, refetchInterval: POLL_INTERVAL_BLOCK },
  })
  const { data: currentEpoch, refetch: r2 } = useReadContract({
    ...baseRead,
    functionName: 'currentEpoch',
    query: { enabled, refetchInterval: POLL_INTERVAL_BLOCK },
  })
  const { data: regime, refetch: r3 } = useReadContract({
    ...baseRead,
    functionName: 'currentRegime',
    query: { enabled, refetchInterval: POLL_INTERVAL_SLOW },
  })
  const { data: weights, refetch: r4 } = useReadContract({
    ...baseRead,
    functionName: 'pocketWeights',
    query: { enabled, refetchInterval: POLL_INTERVAL_SLOW },
  })

  const ready =
    totalDeposits !== undefined &&
    currentEpoch !== undefined &&
    regime !== undefined &&
    weights !== undefined

  const global: VaultGlobalV2 | null = ready
    ? {
        totalDeposits: Number(formatUnits(totalDeposits as bigint, USDC_DECIMALS)),
        currentEpoch: Number(currentEpoch),
        currentRegime: REGIME_LABELS[Number(regime)] ?? 'SIDEWAYS',
        pocketWeights: (weights as readonly number[]).map((w) => Number(w)),
      }
    : null

  const refetch = () => Promise.all([r1(), r2(), r3(), r4()])

  return { global, isLoading: enabled && !ready, refetch }
}

export function useVaultCohorts(vaultAddress?: Address): {
  cohorts: VaultCohort[]
  isLoading: boolean
  refetch: () => Promise<unknown>
} {
  const { address: user } = useAccount()
  const enabled = !!vaultAddress && !!user

  const { data: tokenIds, refetch: refetchIds } = useReadContract({
    address: vaultAddress,
    abi: HEARST_VAULT_ABI,
    functionName: 'userCohortIds',
    args: user ? [user] : undefined,
    query: { enabled, refetchInterval: POLL_INTERVAL_BLOCK },
  })

  const ids = (tokenIds as readonly bigint[] | undefined) ?? []

  const infoCalls = ids.flatMap((id) => [
    {
      address: vaultAddress!,
      abi: HEARST_VAULT_ABI,
      functionName: 'cohortInfo',
      args: [id],
    } as const,
    {
      address: vaultAddress!,
      abi: HEARST_VAULT_ABI,
      functionName: 'pendingRewards',
      args: [id],
    } as const,
  ])

  const { data: info, refetch: refetchInfo } = useReadContracts({
    contracts: infoCalls,
    query: { enabled: enabled && ids.length > 0, refetchInterval: POLL_INTERVAL_BLOCK },
  })

  const cohorts: VaultCohort[] = ids
    .map((tokenId, i) => {
      const cohort = info?.[i * 2]?.result as
        | {
            principal: bigint
            rewardDebt: bigint
            depositTime: bigint
            lockEnd: bigint
            extendedUntil: bigint
            cumulativePaid: bigint
            matured: boolean
          }
        | undefined
      const pending = info?.[i * 2 + 1]?.result as bigint | undefined
      if (!cohort || pending === undefined) return null
      return {
        tokenId,
        principal: Number(formatUnits(cohort.principal, USDC_DECIMALS)),
        rewardDebt: Number(formatUnits(cohort.rewardDebt, USDC_DECIMALS)),
        depositTime: new Date(Number(cohort.depositTime) * MS_PER_SECOND),
        lockEnd: new Date(Number(cohort.lockEnd) * MS_PER_SECOND),
        extendedUntil:
          cohort.extendedUntil > BigInt(0)
            ? new Date(Number(cohort.extendedUntil) * MS_PER_SECOND)
            : null,
        cumulativePaid: Number(formatUnits(cohort.cumulativePaid, USDC_DECIMALS)),
        matured: cohort.matured,
        pendingRewards: Number(formatUnits(pending, USDC_DECIMALS)),
      } satisfies VaultCohort
    })
    .filter((c): c is VaultCohort => c !== null)

  const refetch = () => Promise.all([refetchIds(), refetchInfo()])

  return {
    cohorts,
    isLoading: enabled && (tokenIds === undefined || (ids.length > 0 && info === undefined)),
    refetch,
  }
}

/** Write actions: cohort-aware deposit/claim/withdraw + operator rebalance. */
export function useVaultActionsV2(vaultAddress?: Address) {
  const { writeContractAsync, isPending, data: hash } = useWriteContract()

  const requireAddress = () => {
    if (!vaultAddress) throw new Error('Vault address not configured for this chain')
    return vaultAddress
  }

  const deposit = (amount: bigint): Promise<Hash> =>
    writeContractAsync({
      address: requireAddress(),
      abi: HEARST_VAULT_ABI,
      functionName: 'deposit',
      args: [amount],
    })

  const claim = (tokenId: bigint): Promise<Hash> =>
    writeContractAsync({
      address: requireAddress(),
      abi: HEARST_VAULT_ABI,
      functionName: 'claim',
      args: [tokenId],
    })

  const withdraw = (tokenId: bigint): Promise<Hash> =>
    writeContractAsync({
      address: requireAddress(),
      abi: HEARST_VAULT_ABI,
      functionName: 'withdraw',
      args: [tokenId],
    })

  const rebalance = (params: {
    weights: number[]
    regime: 0 | 1 | 2
    signalType: 0 | 1 | 2 | 3 | 4 | 5
    signalId: `0x${string}`
  }): Promise<Hash> =>
    writeContractAsync({
      address: requireAddress(),
      abi: HEARST_VAULT_ABI,
      functionName: 'rebalance',
      args: [params.weights, params.regime, params.signalType, params.signalId],
    })

  return { deposit, claim, withdraw, rebalance, isPending, hash }
}
