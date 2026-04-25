export type SignalType = 'TAKE_PROFIT' | 'REBALANCE' | 'YIELD_ROTATE' | 'INCREASE_BTC' | 'REDUCE_RISK'
export type SignalStatus = 'pending' | 'approved' | 'rejected' | 'executed' | 'blocked'
export type AgentName = 'watcher' | 'strategy' | 'audit'
export type LogLevel = 'info' | 'warn' | 'error'

export interface MarketSnapshot {
  btcPrice: number
  btc24hChange: number
  btc7dChange: number
  usdcApy: number
  usdtApy: number
  btcApy: number
  miningHashprice: number | null
  fearGreed: number
  fearLabel: string
  notes: string | null
}

export interface RebalanceSignal {
  type: SignalType
  vaultId?: string
  description: string
  paramsJson?: string
  riskScore?: number
  riskNotes?: string
  createdBy: AgentName
}

export interface AgentLog {
  agent: AgentName
  level: LogLevel
  message: string
  dataJson?: string
}

export interface WebhookPayload {
  action: 'snapshot' | 'signal' | 'log' | 'signal_update'
  data: MarketSnapshot | RebalanceSignal | AgentLog | { signalId: string; status: SignalStatus; riskScore?: number; riskNotes?: string }
}

export interface AlertThresholds {
  btcPriceChangePercent: number
  yieldDriftPercent: number
  fearGreedLow: number
  fearGreedHigh: number
  allocationDriftPercent: number
}

export const DEFAULT_THRESHOLDS: AlertThresholds = {
  btcPriceChangePercent: 5,
  yieldDriftPercent: 1,
  fearGreedLow: 25,
  fearGreedHigh: 75,
  allocationDriftPercent: 5,
}
