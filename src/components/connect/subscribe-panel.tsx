'use client'

import { useState } from 'react'
import { TOKENS, fmtUsd } from './constants'
import type { AvailableVault } from './data'

export function SubscribePanel({ vault }: { vault: AvailableVault }) {
  const [amount, setAmount] = useState('')
  const [agreed, setAgreed] = useState(false)

  const num = parseFloat(amount) || 0
  const isValid = num >= vault.minDeposit
  const isReady = isValid && agreed
  const yearlyYield = num * (vault.apr / 100)
  const targetPct = parseFloat(vault.target.replace('%', '')) || 0
  const totalYield = num * (targetPct / 100)

  return (
    <div className="flex-1" style={{ 
      height: '100%',
      overflowY: 'auto',
      padding: `${TOKENS.spacing[6]} ${TOKENS.spacing[6]}`,
      background: TOKENS.colors.white,
      display: 'flex',
      flexDirection: 'column',
      gap: TOKENS.spacing[6]
    }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: TOKENS.spacing[6], flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: TOKENS.fontSizes.xs, fontWeight: TOKENS.fontWeights.bold, letterSpacing: TOKENS.letterSpacing.display, color: TOKENS.colors.textSecondary, marginBottom: TOKENS.spacing[3], textTransform: 'uppercase' }}>Subscription</div>
          <div style={{ fontSize: TOKENS.fontSizes.xxxl, fontWeight: TOKENS.fontWeights.black, letterSpacing: TOKENS.letterSpacing.tight, color: TOKENS.colors.black, lineHeight: 0.92 }}>{vault.name}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: TOKENS.fontSizes.xxl, fontWeight: TOKENS.fontWeights.black, color: TOKENS.colors.black, lineHeight: 1 }}>{vault.apr}%</div>
          <div style={{ fontSize: TOKENS.fontSizes.xs, fontWeight: TOKENS.fontWeights.bold, color: TOKENS.colors.textSecondary, letterSpacing: TOKENS.letterSpacing.display, marginTop: TOKENS.spacing[2], textTransform: 'uppercase' }}>Target Yield</div>
        </div>
      </div>

      <div style={{ flexShrink: 0, position: 'relative' }}>
        <div style={{ fontSize: TOKENS.fontSizes.xs, fontWeight: TOKENS.fontWeights.bold, letterSpacing: TOKENS.letterSpacing.display, textTransform: 'uppercase', color: TOKENS.colors.textSecondary, marginBottom: TOKENS.spacing[2] }}>Amount to Deploy</div>
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          borderBottom: `1px solid ${isValid ? TOKENS.colors.accent : TOKENS.colors.black}`,
          paddingBottom: TOKENS.spacing[3],
          transition: '120ms ease-out',
        }}>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: TOKENS.colors.black,
              fontSize: TOKENS.fontSizes.figure,
              fontFamily: TOKENS.fonts.sans,
              width: '100%',
              fontWeight: TOKENS.fontWeights.black,
              letterSpacing: '-0.07em',
              lineHeight: 0.85,
            }}
          />
          <span style={{ fontSize: TOKENS.fontSizes.lg, fontWeight: TOKENS.fontWeights.black, color: TOKENS.colors.textSecondary, opacity: 0.5, letterSpacing: '-0.02em' }}>USDC</span>
        </div>
        <div style={{ marginTop: TOKENS.spacing[4], minHeight: '20px' }}>
          {num > 0 && !isValid && <div style={{ fontSize: TOKENS.fontSizes.xs, color: TOKENS.colors.danger, fontWeight: TOKENS.fontWeights.bold }}>Minimum deposit: {fmtUsd(vault.minDeposit)}</div>}
          {isValid && <div style={{ fontSize: TOKENS.fontSizes.xs, color: TOKENS.colors.accent, background: TOKENS.colors.black, display: 'inline-block', padding: '3px 16px', fontWeight: TOKENS.fontWeights.bold, letterSpacing: TOKENS.letterSpacing.display, textTransform: 'uppercase' }}>Deposit amount valid</div>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: TOKENS.spacing[6], borderTop: `1px solid ${TOKENS.colors.borderSubtle}`, paddingTop: TOKENS.spacing[6], flexShrink: 0 }}>
        <SpecItem label="Lock Period" value={vault.lockPeriod} />
        <SpecItem label="Risk Profile" value={vault.risk} />
        <SpecItem label="Fees" value={vault.fees} />
      </div>

      <div style={{ 
        marginTop: 'auto',
        paddingTop: TOKENS.spacing[6],
        display: 'grid', 
        gridTemplateColumns: 'minmax(0, 1fr) 360px', 
        gap: TOKENS.spacing[6], 
        alignItems: 'end',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[4] }}>
          <ProjectionRow label="Estimated Yearly Yield" value={num > 0 ? '+ ' + fmtUsd(yearlyYield) : '—'} accent />
          <ProjectionRow label="Projected Yield at Maturity" value={num > 0 ? '+ ' + fmtUsd(totalYield) : '—'} accent />
          <div style={{ fontSize: TOKENS.fontSizes.sm, color: TOKENS.colors.textSecondary, fontWeight: TOKENS.fontWeights.medium, marginTop: TOKENS.spacing[3], lineHeight: 1.6, maxWidth: '520px' }}>
            Capital remains allocated until the term or target condition is met. Review the term sheet before confirming the subscription.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: TOKENS.spacing[4] }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: TOKENS.spacing[3], background: TOKENS.colors.bgSurface, transition: '120ms ease-out' }}>
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: TOKENS.colors.black }} />
            <span style={{ fontSize: TOKENS.fontSizes.sm, fontWeight: TOKENS.fontWeights.bold, color: TOKENS.colors.textSecondary }}>I confirm the term sheet and minimum deposit.</span>
          </label>
          <button
            disabled={!isReady}
            style={{
              width: '100%',
              padding: `${TOKENS.spacing[4]} ${TOKENS.spacing[6]}`,
              background: isReady ? TOKENS.colors.black : TOKENS.colors.gray100,
              color: isReady ? TOKENS.colors.accent : TOKENS.colors.textGhost,
              border: 'none',
              fontSize: TOKENS.fontSizes.md,
              fontWeight: TOKENS.fontWeights.black,
              letterSpacing: TOKENS.letterSpacing.display,
              textTransform: 'uppercase',
              cursor: isReady ? 'pointer' : 'not-allowed',
              transition: '120ms ease-out',
            }}
          >
            {isReady ? 'Deploy Capital' : 'Complete Review'}
          </button>
        </div>
      </div>
    </div>
  )
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: TOKENS.fontSizes.xs, fontWeight: TOKENS.fontWeights.bold, letterSpacing: TOKENS.letterSpacing.display, color: TOKENS.colors.textSecondary, marginBottom: TOKENS.spacing[3], textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: TOKENS.fontSizes.lg, fontWeight: 900, color: TOKENS.colors.black, letterSpacing: '-0.04em', lineHeight: 1.05 }}>{value}</div>
    </div>
  )
}

function ProjectionRow({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: TOKENS.spacing[4], padding: `${TOKENS.spacing[3]} 0`, borderBottom: `1px solid ${TOKENS.colors.borderSubtle}` }}>
      <span style={{ fontSize: TOKENS.fontSizes.md, fontWeight: 700, color: TOKENS.colors.textSecondary }}>{label}</span>
      <span style={{ 
        fontSize: TOKENS.fontSizes.lg, 
        fontWeight: 900, 
        color: accent ? TOKENS.colors.accent : TOKENS.colors.black, 
        background: accent ? TOKENS.colors.black : 'transparent', 
        padding: accent ? '4px 12px' : '0',
        letterSpacing: '-0.02em'
      }}>{value}</span>
    </div>
  )
}
