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
    <div className="flex-1" style={{ overflowY: 'auto', padding: `${TOKENS.spacing[20]} ${TOKENS.spacing[12]}`, background: TOKENS.colors.bgPage }}>

      {/* KPIs — grille séparée par border main */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: TOKENS.borders.thin, background: TOKENS.colors.borderMain, marginBottom: TOKENS.spacing[8] }}>
        {[
          { k: 'Target APY', v: vault.apr + '%', accent: true },
          { k: 'Lock Period', v: vault.lockPeriod },
          { k: 'Min Deposit', v: fmtUsd(vault.minDeposit) },
          { k: 'Risk Profile', v: vault.risk },
        ].map(item => (
          <div key={item.k} style={{ background: TOKENS.colors.bgPage, padding: TOKENS.spacing[6] }}>
            <div style={{
              fontFamily: TOKENS.fonts.mono,
              fontSize: TOKENS.fontSizes.xs,
              fontWeight: TOKENS.fontWeights.bold,
              textTransform: 'uppercase' as const,
              letterSpacing: TOKENS.letterSpacing.display,
              color: TOKENS.colors.textPrimary,
              marginBottom: TOKENS.spacing[2],
            }}>{item.k}</div>
            <div style={{
              fontFamily: TOKENS.fonts.mono,
              fontSize: TOKENS.fontSizes.xl,
              fontWeight: TOKENS.fontWeights.bold,
              letterSpacing: TOKENS.letterSpacing.tight,
              lineHeight: 1,
              color: item.accent ? TOKENS.colors.accent : TOKENS.colors.textPrimary,
            }}>{item.v}</div>
          </div>
        ))}
      </div>

      {/* Amount input */}
      <div style={{ marginBottom: TOKENS.spacing[8] }}>
        <div style={{
          fontFamily: TOKENS.fonts.mono,
          fontSize: TOKENS.fontSizes.xs,
          fontWeight: TOKENS.fontWeights.bold,
          letterSpacing: TOKENS.letterSpacing.display,
          textTransform: 'uppercase' as const,
          color: TOKENS.colors.textPrimary,
          marginBottom: TOKENS.spacing[2],
        }}>
          Amount (USDC)
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: `${TOKENS.borders.thick} solid ${isValid ? TOKENS.colors.accent : TOKENS.colors.borderSubtle}`,
          paddingBottom: TOKENS.spacing[2],
          transition: 'border-color 200ms ease',
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
              borderRadius: 0,
              color: TOKENS.colors.textPrimary,
              fontSize: TOKENS.fontSizes.xxxl,
              fontFamily: TOKENS.fonts.mono,
              width: '100%',
              fontWeight: TOKENS.fontWeights.semibold,
              letterSpacing: TOKENS.letterSpacing.tight,
            }}
          />
          <span style={{
            fontFamily: TOKENS.fonts.mono,
            fontSize: TOKENS.fontSizes.xs,
            fontWeight: TOKENS.fontWeights.bold,
            color: TOKENS.colors.textGhost,
            letterSpacing: TOKENS.letterSpacing.wide,
          }}>USDC</span>
        </div>
        <div style={{ marginTop: TOKENS.spacing[2], fontFamily: TOKENS.fonts.mono, fontSize: TOKENS.fontSizes.xs, fontWeight: TOKENS.fontWeights.bold }}>
          {num > 0 && !isValid && (
            <span style={{ color: TOKENS.colors.danger }}>Min. deposit is {fmtUsd(vault.minDeposit)}</span>
          )}
          {isValid && (
            <span style={{ color: TOKENS.colors.accent }}>✓ Minimum reached</span>
          )}
        </div>
      </div>

      {/* Summary */}
      <div style={{
        borderTop: `${TOKENS.borders.heavy} solid ${TOKENS.colors.borderMain}`,
        paddingTop: TOKENS.spacing[4],
        marginBottom: TOKENS.spacing[8],
        display: 'flex',
        flexDirection: 'column',
        gap: TOKENS.spacing[2],
      }}>
        <Row label="You deposit" value={num > 0 ? fmtUsd(num) + ' USDC' : '—'} />
        <Row label="Est. yearly yield" value={num > 0 ? '+ ' + fmtUsd(yearlyYield) : '—'} accent />
        <Row label="Total yield at close" value={num > 0 ? '+ ' + fmtUsd(totalYield) : '—'} accent />
        <Row label="Capital unlocks" value={`When ${vault.target} target hit · max 3 years`} />
        <Row label="Fees" value={vault.fees} />
      </div>

      {/* Agree + CTA */}
      <label style={{ display: 'flex', alignItems: 'center', gap: TOKENS.spacing[2], cursor: 'pointer', marginBottom: TOKENS.spacing[3] }}>
        <input
          type="checkbox"
          checked={agreed}
          onChange={e => setAgreed(e.target.checked)}
          style={{ accentColor: TOKENS.colors.accent, width: TOKENS.spacing[4], height: TOKENS.spacing[4] }}
        />
        <span style={{
          fontFamily: TOKENS.fonts.sans,
          fontSize: TOKENS.fontSizes.sm,             // sm (13px) — pas xs
          color: TOKENS.colors.textSecondary,
        }}>I have read and accept the term sheet.</span>
      </label>

      {/* CTA — DS btn-primary */}
      <button
        disabled={!isReady}
        style={{
          width: '100%',
          padding: `18px ${TOKENS.spacing[10]}`,    // 18px 40px — spec DS
          background: isReady ? TOKENS.colors.black : 'transparent',
          color: isReady ? TOKENS.colors.textOnDark : TOKENS.colors.textGhost,
          border: `${TOKENS.borders.thick} solid ${isReady ? TOKENS.colors.black : TOKENS.colors.borderSubtle}`,
          borderRadius: 0,                           // explicite DS
          fontFamily: TOKENS.fonts.mono,
          fontSize: TOKENS.fontSizes.sm,
          fontWeight: TOKENS.fontWeights.black,
          letterSpacing: TOKENS.letterSpacing.display,
          textTransform: 'uppercase' as const,
          cursor: isReady ? 'pointer' : 'not-allowed',
          transition: '120ms ease-out',
        }}
      >
        {isReady ? 'Confirm Deposit' : 'Awaiting Input'}
      </button>
    </div>
  )
}

function Row({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: `${TOKENS.spacing[2]} 0`,
      borderBottom: `${TOKENS.borders.thin} solid ${TOKENS.colors.borderSubtle}`,
    }}>
      <span style={{
        fontFamily: TOKENS.fonts.sans,
        fontSize: TOKENS.fontSizes.sm,              // sm (13px) — pas xs pour labels Row
        color: TOKENS.colors.textSecondary,
      }}>{label}</span>
      <span style={{
        fontFamily: TOKENS.fonts.mono,
        fontSize: TOKENS.fontSizes.xs,
        fontWeight: TOKENS.fontWeights.bold,
        color: accent ? TOKENS.colors.accent : TOKENS.colors.textPrimary,
      }}>{value}</span>
    </div>
  )
}
