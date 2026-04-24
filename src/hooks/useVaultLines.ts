'use client'

import { useMemo } from 'react'
import type { VaultLine, ActiveVault, AvailableVault, Aggregate } from '@/components/connect/data'
import { useVaultRegistry } from './useVaultRegistry'
import { useDemoPortfolio, useSystemVaults } from './useDemoPortfolio'
import { useAppMode } from './useAppMode'


function calculateAggregate(vaults: VaultLine[]): Aggregate {
  const active = vaults.filter((v): v is ActiveVault => v.type === 'active')

  const totalDeposited = active.reduce((sum, v) => sum + v.deposited, 0)
  const totalClaimable = active.reduce((sum, v) => sum + v.claimable, 0)

  const avgApr =
    totalDeposited > 0
      ? active.reduce((sum, v) => sum + v.apr * v.deposited, 0) / totalDeposited
      : 0

  return {
    totalDeposited,
    totalClaimable,
    avgApr,
  }
}

export function useVaultLines() {
  const { activeVaults, isLoading: isRegistryLoading } = useVaultRegistry()
  const { hydratedPositions, stats } = useDemoPortfolio()
  const systemVaults = useSystemVaults()
  const { isDemo } = useAppMode()

  return useMemo(() => {
    // MODE DÉMO: Forcé par le toggle
    if (isDemo) {
      const demoVaultLines: VaultLine[] = systemVaults.map((sysVault) => {
        const position = hydratedPositions.find((p) => p.vaultId === sysVault.id)

        if (position && position.state !== 'withdrawn') {
          const activeVault: ActiveVault = {
            type: 'active',
            id: sysVault.id,
            name: sysVault.meta.name,
            apr: sysVault.meta.apr,
            target: sysVault.meta.target,
            strategy: sysVault.meta.strategy,
            image: undefined,
            deposited: position.deposited,
            claimable: position.currentYield,
            lockedUntil: position.maturityDate,
            canWithdraw: position.canWithdraw,
            maturity: position.isMatured ? 'Matured' : `${position.daysRemaining} days`,
            progress: position.progressPercent,
          }
          return activeVault
        }

        const years = sysVault.meta.lockPeriodDays / 365
        const lockLabel = years >= 1 ? `${Math.floor(years)} Years` : `${sysVault.meta.lockPeriodDays} Days`
        const termLabel = years >= 1 ? `${Math.floor(years)}Y` : `${sysVault.meta.lockPeriodDays}D`

        const availableVault: AvailableVault = {
          type: 'available',
          id: sysVault.id,
          name: sysVault.meta.name,
          apr: sysVault.meta.apr,
          target: sysVault.meta.target,
          strategy: sysVault.meta.strategy,
          image: undefined,
          minDeposit: sysVault.meta.minDeposit,
          lockPeriod: lockLabel,
          term: termLabel,
          token: 'USDC',
          risk: sysVault.meta.risk,
          fees: sysVault.meta.fees,
        }
        return availableVault
      })

      const activeForAgg = demoVaultLines
        .filter((v): v is ActiveVault => v.type === 'active')
        .map((v) => ({ deposited: v.deposited, claimable: v.claimable, apr: v.apr }))

      const avgApr = stats.totalDeployed > 0
        ? activeForAgg.reduce((sum, v) => sum + v.apr * v.deposited, 0) / stats.totalDeployed
        : 0

      const agg: Aggregate = {
        totalDeposited: stats.totalDeployed,
        totalClaimable: stats.totalUnclaimedYield,
        avgApr,
      }

      return {
        vaults: demoVaultLines,
        agg,
        hasVaults: true,
        isLoading: false,
        mode: 'demo' as const,
      }
    }

    // MODE BLOCKCHAIN: Live
    const configuredLines: AvailableVault[] = activeVaults.map((config) => {
      const years = config.lockPeriodDays / 365
      const lockLabel = years >= 1 ? `${Math.floor(years)} Years` : `${config.lockPeriodDays} Days`
      const termLabel = years >= 1 ? `${Math.floor(years)}Y` : `${config.lockPeriodDays}D`
      return {
        id: config.id,
        name: config.name,
        type: 'available',
        apr: config.apr,
        target: config.target,
        strategy: config.strategy,
        image: config.image,
        minDeposit: config.minDeposit,
        lockPeriod: lockLabel,
        term: termLabel,
        token: 'USDC',
        risk: config.risk,
        fees: config.fees,
      }
    })

    if (configuredLines.length === 0) {
      return {
        vaults: [],
        agg: { totalDeposited: 0, totalClaimable: 0, avgApr: 0 },
        hasVaults: false,
        isLoading: isRegistryLoading,
        mode: 'live' as const,
      }
    }

    return {
      vaults: configuredLines,
      agg: calculateAggregate(configuredLines),
      hasVaults: true,
      isLoading: isRegistryLoading,
      mode: 'live' as const,
    }
  }, [isDemo, hydratedPositions, stats, systemVaults, activeVaults, isRegistryLoading])
}
