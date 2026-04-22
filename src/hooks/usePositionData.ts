'use client'

import { useState, useEffect, useCallback } from 'react'
import type { PositionData, PositionError } from '@/types/position'

interface UsePositionDataOptions {
  vaultId: string
  walletAddress?: string
  refreshInterval?: number
}

interface UsePositionDataReturn {
  data: PositionData | null
  isLoading: boolean
  error: PositionError | null
  refresh: () => void
}

const MOCK_DATA: PositionData = {
  capitalDeployed: 542100,
  accruedYield: 42100,
  positionValue: 584200,
  unlockTimeline: {
    daysRemaining: 539,
    maturityDate: '15 Oct 2027',
    progressPercent: 61,
  },
  epoch: {
    currentEpoch: 147,
    epochProgress: 42,
    epochEndsAt: '2025-02-15T00:00:00Z',
  },
  canWithdraw: false,
  isTargetReached: false,
  apr: 12.0,
  target: '36%',
}

export function usePositionData({
  vaultId,
  walletAddress,
  refreshInterval = 30000,
}: UsePositionDataOptions): UsePositionDataReturn {
  const [data, setData] = useState<PositionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<PositionError | null>(null)

  const fetchPosition = useCallback(async () => {
    if (!walletAddress) {
      setError({ code: 'WALLET_NOT_CONNECTED', message: 'Wallet not connected' })
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/vaults/${vaultId}/position?wallet=${walletAddress}`)
      // if (!response.ok) throw new Error('Failed to fetch')
      // const result = await response.json()

      // Mock for now — simulates network delay
      await new Promise((r) => setTimeout(r, 400))
      setData(MOCK_DATA)
    } catch {
      setError({ code: 'FETCH_ERROR', message: 'Failed to load position data' })
    } finally {
      setIsLoading(false)
    }
  }, [vaultId, walletAddress])

  useEffect(() => {
    fetchPosition()
  }, [fetchPosition])

  useEffect(() => {
    if (!refreshInterval || !walletAddress) return

    const interval = setInterval(fetchPosition, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchPosition, refreshInterval, walletAddress])

  return {
    data,
    isLoading,
    error,
    refresh: fetchPosition,
  }
}
