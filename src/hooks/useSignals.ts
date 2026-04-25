'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SignalsApi } from '@/lib/api-client'

export function useSignals(status?: string) {
  return useQuery({
    queryKey: ['signals', status],
    queryFn: () => SignalsApi.list(status),
    refetchInterval: 10_000,
  })
}

export function useSignalById(id: string) {
  return useQuery({
    queryKey: ['signal', id],
    queryFn: () => SignalsApi.getById(id),
    enabled: !!id,
  })
}

export function useSignalMutations() {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['signals'] })
  }

  const approve = useMutation({
    mutationFn: (id: string) => SignalsApi.approve(id),
    onSuccess: invalidate,
  })

  const reject = useMutation({
    mutationFn: (id: string) => SignalsApi.reject(id),
    onSuccess: invalidate,
  })

  const execute = useMutation({
    mutationFn: (id: string) => SignalsApi.execute(id),
    onSuccess: invalidate,
  })

  return { approve, reject, execute }
}
