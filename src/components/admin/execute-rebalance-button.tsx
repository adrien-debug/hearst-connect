'use client'

import { useEffect, useState } from 'react'
import { useAccount, useChainId, useWaitForTransactionReceipt } from 'wagmi'
import { keccak256, toBytes, type Hash } from 'viem'

import { useVaultActionsV2, useV2VaultAddress } from '@/hooks/useVaultV2'
import { isV2Chain } from '@/config/contracts'

import type { DbRebalanceSignal } from '@/lib/db/schema'

const SIGNAL_TYPE_TO_ENUM: Record<DbRebalanceSignal['type'], 0 | 1 | 2 | 3 | 4 | 5> = {
  TAKE_PROFIT: 1,
  REBALANCE: 2,
  YIELD_ROTATE: 3,
  INCREASE_BTC: 4,
  REDUCE_RISK: 5,
}

const REGIME_TO_ENUM: Record<string, 0 | 1 | 2> = {
  BULL: 0,
  SIDEWAYS: 1,
  BEAR: 2,
}

interface ParsedParams {
  weights: number[] | null
  regime: 'BULL' | 'SIDEWAYS' | 'BEAR' | null
  parseError?: string
}

function parseParams(paramsJson: string | null): ParsedParams {
  if (!paramsJson) return { weights: null, regime: null }
  try {
    const parsed = JSON.parse(paramsJson) as Record<string, unknown>
    const weights = Array.isArray(parsed.weights)
      ? (parsed.weights as unknown[]).map((w) => Number(w))
      : null
    const regimeRaw = typeof parsed.regime === 'string' ? parsed.regime.toUpperCase() : null
    const regime =
      regimeRaw === 'BULL' || regimeRaw === 'SIDEWAYS' || regimeRaw === 'BEAR' ? regimeRaw : null
    return { weights, regime }
  } catch (e) {
    return { weights: null, regime: null, parseError: e instanceof Error ? e.message : String(e) }
  }
}

interface Props {
  signal: DbRebalanceSignal
  onExecutedOffChain: () => void
  onExecutedOnChain: () => void
}

export function ExecuteRebalanceButton({ signal, onExecutedOffChain, onExecutedOnChain }: Props) {
  const chainId = useChainId()
  const { address } = useAccount()
  const vaultAddress = useV2VaultAddress()
  const { rebalance, isPending } = useVaultActionsV2(vaultAddress ?? undefined)
  const [pendingHash, setPendingHash] = useState<Hash | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [postingMeta, setPostingMeta] = useState(false)

  const onChainAvailable = isV2Chain(chainId) && Boolean(vaultAddress)
  const parsed = parseParams(signal.paramsJson)
  const canSignNow =
    onChainAvailable && parsed.weights !== null && parsed.regime !== null && !!address

  const { data: receipt } = useWaitForTransactionReceipt({
    hash: pendingHash,
    query: { enabled: !!pendingHash },
  })

  useEffect(() => {
    if (!receipt || !pendingHash || postingMeta) return
    setPostingMeta(true)
    void fetch(`/api/signals/${signal.id}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txHash: pendingHash, chainId, executor: address }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.signal) onExecutedOnChain()
        else setError(data.error ?? 'Failed to record execution')
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
  }, [receipt, pendingHash, postingMeta, signal.id, chainId, address, onExecutedOnChain])

  async function handleOnChain() {
    setError(null)
    if (!parsed.weights || !parsed.regime) {
      setError('Cannot parse weights/regime from signal params. Use off-chain mark instead.')
      return
    }
    try {
      const txHash = await rebalance({
        weights: parsed.weights,
        regime: REGIME_TO_ENUM[parsed.regime],
        signalType: SIGNAL_TYPE_TO_ENUM[signal.type],
        signalId: keccak256(toBytes(signal.id)),
      })
      setPendingHash(txHash)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  async function handleOffChain() {
    setError(null)
    try {
      const res = await fetch(`/api/signals/${signal.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Execute failed')
      onExecutedOffChain()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  if (!onChainAvailable) {
    return (
      <button
        onClick={handleOffChain}
        className="signals-action-btn signals-action-execute"
        disabled={postingMeta}
      >
        Mark executed
      </button>
    )
  }

  return (
    <div className="signals-execute-controls">
      <button
        onClick={handleOnChain}
        className="signals-action-btn signals-action-execute"
        disabled={!canSignNow || isPending || !!pendingHash}
      >
        {pendingHash ? (receipt ? 'Confirmed ✓' : 'Confirming…') : isPending ? 'Sign in wallet…' : 'Execute on-chain'}
      </button>
      {!canSignNow && (
        <span className="signals-execute-hint">
          {!address
            ? 'Connect wallet'
            : !parsed.weights || !parsed.regime
              ? 'Signal params missing weights/regime'
              : ''}
        </span>
      )}
      {error && <span className="signals-execute-error">{error}</span>}
    </div>
  )
}
