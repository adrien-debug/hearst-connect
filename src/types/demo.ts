export type DemoPositionState = 'active' | 'matured' | 'withdrawn'

export interface DemoPosition {
  id: string
  vaultId: string
  createdAt: number
  state: DemoPositionState
  deposited: number
  accumulatedYield: number
  claimedYield: number
  maturityDate: number
}

export interface HydratedDemoPosition extends DemoPosition {
  canWithdraw: boolean
  canClaim: boolean
  daysRemaining: number
  progressPercent: number
  currentYield: number
  isMatured: boolean
  vaultName: string
}

export interface DemoPortfolioStats {
  totalDeployed: number
  totalUnclaimedYield: number
  totalClaimedYield: number
  activeVaults: number
}
