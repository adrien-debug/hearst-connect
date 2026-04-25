'use client'

import { useState, useMemo, useCallback } from 'react'
import { useSwitchChain } from 'wagmi'
import { base } from 'wagmi/chains'
import { fmtUsdCompact } from '@/components/connect/constants'
import { formatVaultName } from '@/components/connect/formatting'
import type { AvailableVault } from '@/components/connect/data'
import { TimeToTargetChart } from './time-to-target-chart'
import { ScenarioCards } from './scenario-cards'

interface SubscriptionPanelProps {
  vault: AvailableVault
  isConnected: boolean
  isPending: boolean
  wrongChain: boolean
  onConnect: () => void
  onClose: () => void
}

const SCENARIOS = {
  bull: { label: 'Bull', months: 12, description: 'Accelerate growth', color: '#10B981' },
  sideways: { label: 'Flat', months: 26, description: 'Baseline mix', color: '#6B7280' },
  bear: { label: 'Bear', months: 36, description: 'Protect capital', color: '#F59E0B' },
}

export function SubscriptionPanel({
  vault,
  isConnected,
  isPending,
  wrongChain,
  onConnect,
  onClose,
}: SubscriptionPanelProps) {
  const [amount, setAmount] = useState('')
  const [selectedScenario, setSelectedScenario] = useState<keyof typeof SCENARIOS>('sideways')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const { switchChain, isPending: isSwitching } = useSwitchChain()

  const targetPct = parseFloat(vault.target.replace('%', '')) || 0
  const minDeposit = vault.minDeposit
  const numericAmount = parseFloat(amount) || 0
  const isAmountValid = numericAmount >= minDeposit

  // Calculate yields
  const calculations = useMemo(() => {
    if (!isAmountValid) return null
    const yearlyYield = numericAmount * (vault.apr / 100)
    const scenario = SCENARIOS[selectedScenario]
    const totalYield = yearlyYield * (scenario.months / 12)
    return { yearlyYield, totalYield, months: scenario.months }
  }, [numericAmount, vault.apr, selectedScenario, isAmountValid])

  const handleSubscribe = useCallback(() => {
    if (!isAmountValid || !termsAccepted) return
    // TODO: Implement actual subscription
    console.log('Subscribe:', { vault: vault.id, amount: numericAmount, scenario: selectedScenario })
  }, [isAmountValid, termsAccepted, vault.id, numericAmount, selectedScenario])

  // Get CTA button state
  const getCtaState = () => {
    if (!isConnected) {
      return {
        text: isPending ? 'Connecting…' : 'Connect Wallet to Subscribe',
        action: onConnect,
        disabled: isPending,
      }
    }
    if (wrongChain) {
      return {
        text: isSwitching ? 'Switching…' : 'Switch to Base Network',
        action: () => switchChain({ chainId: base.id }),
        disabled: isSwitching,
      }
    }
    if (!isAmountValid) {
      return { text: `Min ${fmtUsdCompact(minDeposit)} required`, action: () => {}, disabled: true }
    }
    if (!termsAccepted) {
      return { text: 'Accept terms to continue', action: () => {}, disabled: true }
    }
    return { text: 'Confirm Subscription', action: handleSubscribe, disabled: false }
  }

  const cta = getCtaState()
  const scenario = SCENARIOS[selectedScenario]

  return (
    <div className="subscription-overlay" onClick={onClose}>
      <div className="subscription-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="subscription-header">
          <button className="subscription-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="subscription-vault-header">
            {vault.image && (
              <img src={vault.image} alt={vault.name} className="subscription-vault-image" />
            )}
            <div>
              <h2 className="subscription-vault-name">{formatVaultName(vault.name)}</h2>
              <p className="subscription-vault-strategy">{vault.strategy}</p>
            </div>
            <div className="subscription-vault-apr">
              {vault.apr}%
              <span>APR</span>
            </div>
          </div>
        </div>

        {/* Vault Terms */}
        <div className="subscription-terms">
          <div className="subscription-term">
            <span className="subscription-term-label">Lock Period</span>
            <span className="subscription-term-value">{vault.lockPeriod}</span>
          </div>
          <div className="subscription-term">
            <span className="subscription-term-label">Min Deposit</span>
            <span className="subscription-term-value">{fmtUsdCompact(minDeposit)}</span>
          </div>
          <div className="subscription-term">
            <span className="subscription-term-label">Target</span>
            <span className="subscription-term-value">{vault.target}</span>
          </div>
          <div className="subscription-term">
            <span className="subscription-term-label">Risk</span>
            <span className="subscription-term-value">{vault.risk}</span>
          </div>
          <div className="subscription-term">
            <span className="subscription-term-label">Fees</span>
            <span className="subscription-term-value">{vault.fees}</span>
          </div>
        </div>

        {/* Amount Input */}
        <div className="subscription-amount-section">
          <label className="subscription-label">Amount (USDC)</label>
          <div className={`subscription-input-wrapper ${isAmountValid ? 'valid' : amount ? 'invalid' : ''}`}>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Min ${fmtUsdCompact(minDeposit)}`}
              className="subscription-input"
            />
            <span className="subscription-input-suffix">USDC</span>
            {isAmountValid && <span className="subscription-input-check">✓</span>}
          </div>
          {isConnected && (
            <p className="subscription-wallet-balance">
              {/* TODO: Show actual wallet balance */}
              Wallet: Connect to view balance
            </p>
          )}
        </div>

        {/* Calculations */}
        {calculations && (
          <div className="subscription-calculations">
            <div className="subscription-calc-item">
              <span className="subscription-calc-label">Est. yearly yield</span>
              <span className="subscription-calc-value">{fmtUsdCompact(calculations.yearlyYield)} USDC</span>
            </div>
            <div className="subscription-calc-item">
              <span className="subscription-calc-label">Total yield at target</span>
              <span className="subscription-calc-value">{fmtUsdCompact(calculations.totalYield)} USDC</span>
            </div>
            <div className="subscription-calc-item">
              <span className="subscription-calc-label">Target unlock</span>
              <span className="subscription-calc-value">M{calculations.months} or {targetPct}% hit</span>
            </div>
          </div>
        )}

        {/* Simulation Chart */}
        <div className="subscription-simulation">
          <h3 className="subscription-section-title">Time to Target Simulation</h3>
          <TimeToTargetChart
            amount={numericAmount}
            apr={vault.apr}
            target={targetPct}
            selectedScenario={selectedScenario}
          />
          <ScenarioCards
            scenarios={SCENARIOS}
            selected={selectedScenario}
            onSelect={(key) => setSelectedScenario(key as keyof typeof SCENARIOS)}
          />
        </div>

        {/* Terms & Confirm */}
        <div className="subscription-confirm">
          <label className="subscription-checkbox-label">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="subscription-checkbox"
            />
            <span>I accept the <a href="#" className="subscription-terms-link">term sheet</a></span>
          </label>

          <button
            className="subscription-cta"
            onClick={isConnected ? cta.action : onConnect}
            disabled={isConnected ? cta.disabled : isPending}
          >
            {isConnected ? cta.text : isPending ? 'Connecting…' : 'Connect Wallet →'}
          </button>
        </div>
      </div>
    </div>
  )
}
