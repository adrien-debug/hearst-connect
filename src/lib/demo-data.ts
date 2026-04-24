import type { DemoPosition, DemoPortfolioStats, HydratedDemoPosition } from '@/types/demo'

export const SYSTEM_DEMO_VAULTS = [
  {
    id: 'sys-prime',
    meta: {
      name: 'HashVault Prime',
      apr: 12,
      target: '36%',
      lockPeriodDays: 1095,
      minDeposit: 500_000,
      risk: 'Moderate',
      strategy: 'RWA Mining',
      fees: '1.5% Mgmt',
    },
  },
  {
    id: 'sys-growth',
    meta: {
      name: 'HashVault Growth',
      apr: 16,
      target: '48%',
      lockPeriodDays: 1095,
      minDeposit: 250_000,
      risk: 'High',
      strategy: 'Growth Mining',
      fees: '2.0% Mgmt',
    },
  },
  {
    id: 'sys-yield',
    meta: {
      name: 'HashVault Yield',
      apr: 9,
      target: '18%',
      lockPeriodDays: 365,
      minDeposit: 100_000,
      risk: 'Low',
      strategy: 'Short Mining',
      fees: '1.0% Mgmt',
    },
  },
  {
    id: 'sys-ultra',
    meta: {
      name: 'HashVault Ultra',
      apr: 24,
      target: '120%',
      lockPeriodDays: 1825,
      minDeposit: 1_000_000,
      risk: 'Very High',
      strategy: 'Alpha Mining',
      fees: '3.0% Mgmt · 20% Perf',
    },
  },
] as const

export function getSystemDemoVaultById(id: string) {
  return SYSTEM_DEMO_VAULTS.find((v) => v.id === id)
}

export function calculateDemoYield(position: DemoPosition): number {
  const vault = getSystemDemoVaultById(position.vaultId)
  if (!vault) return 0
  const elapsedDays = (Date.now() - position.createdAt) / (1000 * 60 * 60 * 24)
  const dailyRate = vault.meta.apr / 100 / 365
  return position.deposited * dailyRate * elapsedDays
}

export function hydrateDemoPosition(position: DemoPosition): HydratedDemoPosition {
  const vault = getSystemDemoVaultById(position.vaultId)!
  const totalYield = calculateDemoYield(position)
  const now = Date.now()
  const isMatured = now >= position.maturityDate
  const daysRemaining = Math.max(0, Math.ceil((position.maturityDate - now) / (1000 * 60 * 60 * 24)))
  const progressPercent = Math.min(100, Math.round(((now - position.createdAt) / (position.maturityDate - position.createdAt)) * 100))
  
  return {
    ...position,
    accumulatedYield: totalYield,
    currentYield: totalYield - position.claimedYield,
    isMatured,
    canWithdraw: isMatured && position.state !== 'withdrawn',
    canClaim: totalYield > position.claimedYield + 0.01,
    daysRemaining,
    progressPercent,
    vaultName: vault.meta.name,
  }
}

export function computeDemoStats(positions: DemoPosition[]): DemoPortfolioStats {
  let totalDeployed = 0
  let totalUnclaimed = 0
  let totalClaimed = 0
  let activeVaults = 0

  for (const pos of positions) {
    if (pos.state === 'withdrawn') continue
    totalDeployed += pos.deposited
    totalClaimed += pos.claimedYield
    const vault = getSystemDemoVaultById(pos.vaultId)
    if (vault) {
      const yield_ = calculateDemoYield(pos)
      totalUnclaimed += yield_ - pos.claimedYield
    }
    if (pos.state === 'active' || pos.state === 'matured') {
      activeVaults++
    }
  }

  return {
    totalDeployed,
    totalUnclaimedYield: Math.max(0, totalUnclaimed),
    totalClaimedYield: totalClaimed,
    activeVaults,
  }
}
