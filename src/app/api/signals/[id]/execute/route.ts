import { NextResponse } from 'next/server'
import { createPublicClient, http, type Address, type Hash } from 'viem'
import { base, baseSepolia } from 'viem/chains'

import { requireAdminAccess, AuthError } from '@/lib/auth/session'
import { initDb } from '@/lib/db/connection'
import { SignalRepository } from '@/lib/db/repositories'
import { getContracts } from '@/config/contracts'

interface ExecuteBody {
  txHash?: string
  chainId?: number
  executor?: string
}

const RPC_BY_CHAIN: Record<number, string | undefined> = {
  [base.id]: process.env.BASE_RPC_URL ?? process.env.NEXT_PUBLIC_BASE_RPC_URL,
  [baseSepolia.id]:
    process.env.BASE_SEPOLIA_RPC_URL ?? process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL,
}

const CHAIN_BY_ID: Record<number, typeof base | typeof baseSepolia> = {
  [base.id]: base,
  [baseSepolia.id]: baseSepolia,
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminAccess(request)
    initDb()

    const { id } = await params
    const existing = SignalRepository.findById(id)
    if (!existing) return NextResponse.json({ error: 'Signal not found' }, { status: 404 })
    if (existing.status !== 'approved') {
      return NextResponse.json(
        { error: 'Signal must be approved before execution' },
        { status: 400 }
      )
    }

    // Optional body. If absent, treat as a legacy off-chain mark-as-executed (compat).
    const body = (await request.json().catch(() => ({}))) as ExecuteBody
    const { txHash, chainId, executor } = body

    if (!txHash) {
      const signal = SignalRepository.updateStatus(id, 'executed')
      return NextResponse.json({ signal, mode: 'off-chain' })
    }

    if (!chainId || !CHAIN_BY_ID[chainId]) {
      return NextResponse.json({ error: 'Invalid or unsupported chainId' }, { status: 400 })
    }
    if (!executor || !/^0x[0-9a-fA-F]{40}$/.test(executor)) {
      return NextResponse.json({ error: 'Invalid executor address' }, { status: 400 })
    }
    if (!/^0x[0-9a-fA-F]{64}$/.test(txHash)) {
      return NextResponse.json({ error: 'Invalid txHash' }, { status: 400 })
    }

    const rpcUrl = RPC_BY_CHAIN[chainId]
    const client = createPublicClient({ chain: CHAIN_BY_ID[chainId], transport: http(rpcUrl) })

    const receipt = await client.getTransactionReceipt({ hash: txHash as Hash })
    if (receipt.status !== 'success') {
      return NextResponse.json(
        { error: 'On-chain tx reverted; not recording as executed' },
        { status: 400 }
      )
    }

    // Sanity-check the tx targets our configured vault for this chain.
    const contracts = getContracts(chainId)
    const expectedVault = contracts?.contracts.HearstVault
    if (expectedVault && receipt.to && receipt.to.toLowerCase() !== expectedVault.toLowerCase()) {
      return NextResponse.json(
        { error: 'Tx target does not match configured vault for this chain' },
        { status: 400 }
      )
    }

    const signal = SignalRepository.markExecutedOnChain(id, txHash, chainId, executor as Address)
    return NextResponse.json({ signal, mode: 'on-chain' })
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.statusCode })
    console.error('[API] POST /signals/[id]/execute error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
