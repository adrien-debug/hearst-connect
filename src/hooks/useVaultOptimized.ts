'use client'

import { useReadContracts, useWriteContract, useAccount } from 'wagmi'
import { VAULT_ABI } from '@/config/abi/vault'
import { formatUnits, type Address } from 'viem'
import { useMemo, useCallback } from 'react'

// USDC has 6 decimals
const USDC_DECIMALS = 6

// Polling intervals stratifiés
const POLLING = {
  FAST: 12000,    // 12s - positions utilisateur (change souvent)
  MEDIUM: 30000,  // 30s - epochs, canWithdraw (change parfois)
  SLOW: 60000,    // 60s - APR, TVL (change rarement)
}

export interface VaultPosition {
  depositAmount: number
  rewardDebt: number
  lockEnd: Date
  pendingRewards: number
  canWithdraw: boolean
}

export interface VaultGlobal {
  totalDeposits: number
  monthlyAPR: number
  annualAPR: number
  currentEpoch: number
  shouldAdvanceEpoch: boolean
}

/**
 * Hook optimisé pour les positions utilisateur
 * Utilise multicall pour batcher userInfo + pendingRewards + canWithdraw en 1 requête RPC
 */
export function useVaultPosition(vaultAddress?: Address) {
  const { address: userAddress } = useAccount()

  const contracts = useMemo(() => {
    if (!vaultAddress || !userAddress) return []
    return [
      {
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: 'userInfo' as const,
        args: [userAddress],
      },
      {
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: 'pendingRewards' as const,
        args: [userAddress],
      },
      {
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: 'canWithdraw' as const,
        args: [userAddress],
      },
    ]
  }, [vaultAddress, userAddress])

  const { data, refetch, isLoading, error } = useReadContracts({
    contracts,
    query: {
      enabled: contracts.length > 0,
      refetchInterval: POLLING.FAST,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      staleTime: 5000, // 5s de cache avant considéré stale
    },
  })

  const position: VaultPosition | null = useMemo(() => {
    if (!data || data.length !== 3) return null
    
    const [userInfoResult, pendingRewardsResult, canWithdrawResult] = data
    
    // Vérifier que tous les calls ont réussi
    if (userInfoResult.status !== 'success' || pendingRewardsResult.status !== 'success') {
      return null
    }

    const userInfo = userInfoResult.result as [bigint, bigint, bigint]
    const pendingRewards = pendingRewardsResult.result as bigint
    const canWithdraw = canWithdrawResult.status === 'success' 
      ? (canWithdrawResult.result as boolean) 
      : false

    return {
      depositAmount: Number(formatUnits(userInfo[0], USDC_DECIMALS)),
      rewardDebt: Number(formatUnits(userInfo[1], USDC_DECIMALS)),
      lockEnd: new Date(Number(userInfo[2]) * 1000),
      pendingRewards: Number(formatUnits(pendingRewards, USDC_DECIMALS)),
      canWithdraw,
    }
  }, [data])

  // Refetch manuel
  const refetchPosition = useCallback(async () => {
    await refetch()
  }, [refetch])

  return {
    position,
    isLoading,
    error,
    refetch: refetchPosition,
  }
}

/**
 * Hook optimisé pour les données globales du vault
 * Multicall pour TVL + APR + epoch en 1 requête
 * Polling plus lent car ces données changent moins souvent
 */
export function useVaultGlobal(vaultAddress?: Address) {
  const contracts = useMemo(() => {
    if (!vaultAddress) return []
    return [
      {
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: 'totalDeposits' as const,
      },
      {
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: 'monthlyAPR' as const,
      },
      {
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: 'getAnnualAPR' as const,
      },
      {
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: 'currentEpoch' as const,
      },
      {
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: 'shouldAdvanceEpoch' as const,
      },
    ]
  }, [vaultAddress])

  const { data, refetch, isLoading, error } = useReadContracts({
    contracts,
    query: {
      enabled: contracts.length > 0,
      refetchInterval: POLLING.SLOW, // 60s pour les données globales
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      staleTime: 30000, // 30s de cache
    },
  })

  const global: VaultGlobal | null = useMemo(() => {
    if (!data || data.length !== 5) return null

    const [depositsResult, monthlyResult, annualResult, epochResult, shouldAdvanceResult] = data

    // Vérifier les résultats
    if (depositsResult.status !== 'success' || 
        monthlyResult.status !== 'success' || 
        annualResult.status !== 'success') {
      return null
    }

    const totalDeposits = depositsResult.result as bigint
    const monthlyAPR = monthlyResult.result as bigint
    const annualAPR = annualResult.result as bigint
    const currentEpoch = epochResult.status === 'success' 
      ? (epochResult.result as bigint) 
      : BigInt(0)
    const shouldAdvanceEpoch = shouldAdvanceResult.status === 'success'
      ? (shouldAdvanceResult.result as boolean)
      : false

    return {
      totalDeposits: Number(formatUnits(totalDeposits, USDC_DECIMALS)),
      monthlyAPR: Number(monthlyAPR) / 100,
      annualAPR: Number(annualAPR) / 100,
      currentEpoch: Number(currentEpoch),
      shouldAdvanceEpoch,
    }
  }, [data])

  const refetchGlobal = useCallback(async () => {
    await refetch()
  }, [refetch])

  return {
    global,
    isLoading,
    error,
    refetch: refetchGlobal,
  }
}

/**
 * Hook combiné pour position + global avec refetch synchronisé
 */
export function useVaultData(vaultAddress?: Address) {
  const position = useVaultPosition(vaultAddress)
  const global = useVaultGlobal(vaultAddress)

  const refetchAll = useCallback(async () => {
    await Promise.all([
      position.refetch(),
      global.refetch(),
    ])
  }, [position.refetch, global.refetch])

  return {
    position: position.position,
    global: global.global,
    isLoading: position.isLoading || global.isLoading,
    errors: [position.error, global.error].filter(Boolean),
    refetch: refetchAll,
  }
}

// Actions inchangées - pas d'optimisation possible ici
export function useVaultActions(vaultAddress?: Address) {
  const { writeContract, isPending, data: hash, error } = useWriteContract()

  const deposit = useCallback(async (amount: bigint) => {
    if (!vaultAddress) throw new Error('Vault address required')
    return writeContract({
      address: vaultAddress,
      abi: VAULT_ABI,
      functionName: 'deposit',
      args: [amount],
    })
  }, [vaultAddress, writeContract])

  const claim = useCallback(async () => {
    if (!vaultAddress) throw new Error('Vault address required')
    return writeContract({
      address: vaultAddress,
      abi: VAULT_ABI,
      functionName: 'claim',
    })
  }, [vaultAddress, writeContract])

  const withdraw = useCallback(async (amount: bigint) => {
    if (!vaultAddress) throw new Error('Vault address required')
    return writeContract({
      address: vaultAddress,
      abi: VAULT_ABI,
      functionName: 'withdraw',
      args: [amount],
    })
  }, [vaultAddress, writeContract])

  return {
    deposit,
    claim,
    withdraw,
    isPending,
    hash,
    error,
  }
}
