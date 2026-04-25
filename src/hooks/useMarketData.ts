'use client'

import { useQuery } from '@tanstack/react-query'
import { MarketApi, AgentsApi } from '@/lib/api-client'

export function useMarketLatest() {
  return useQuery({
    queryKey: ['market', 'latest'],
    queryFn: () => MarketApi.latest(),
    refetchInterval: 30_000,
  })
}

export function useMarketHistory(limit = 100, from?: number) {
  return useQuery({
    queryKey: ['market', 'history', limit, from],
    queryFn: () => MarketApi.history(limit, from),
    refetchInterval: 60_000,
  })
}

export function useAgentsStatus() {
  return useQuery({
    queryKey: ['agents', 'status'],
    queryFn: () => AgentsApi.status(),
    refetchInterval: 30_000,
  })
}
