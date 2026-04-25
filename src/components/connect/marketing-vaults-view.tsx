'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TOKENS, fmtUsdCompact, VALUE_LETTER_SPACING, MONO } from './constants'
import { formatVaultName } from './formatting'
import type { AvailableVault } from './data'
import { useAccount, useConnect } from 'wagmi'

interface MarketingVaultsViewProps {
  vaults: AvailableVault[]
  onVaultSelect: (vaultId: string) => void
}

export function MarketingVaultsView({ vaults, onVaultSelect }: MarketingVaultsViewProps) {
  const [hoveredVault, setHoveredVault] = useState<string | null>(null)
  const { isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()

  const handleConnect = () => {
    const connector = connectors[0]
    if (connector) connect({ connector })
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        background: TOKENS.colors.bgApp,
      }}
    >
      {/* HEADER - Top bar with Connect Wallet */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${TOKENS.spacing[4]} ${TOKENS.spacing[6]}`,
          borderBottom: `1px solid ${TOKENS.colors.borderSubtle}`,
          background: TOKENS.colors.bgApp,
          flexShrink: 0,
        }}
      >
        {/* Left - Logo small */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: TOKENS.spacing[3] }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: TOKENS.radius.md,
                background: TOKENS.colors.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '16px', fontWeight: 800, color: TOKENS.colors.black }}>H</span>
            </div>
            <span
              style={{
                fontSize: TOKENS.fontSizes.md,
                fontWeight: TOKENS.fontWeights.black,
                color: TOKENS.colors.textPrimary,
                letterSpacing: VALUE_LETTER_SPACING,
              }}
            >
              HEARST
            </span>
          </div>
        </Link>

        {/* Right - Connect Wallet */}
        {!isConnected ? (
          <button
            onClick={handleConnect}
            disabled={isPending}
            style={{
              padding: `${TOKENS.spacing[3]} ${TOKENS.spacing[5]}`,
              background: TOKENS.colors.accent,
              border: 'none',
              borderRadius: TOKENS.radius.md,
              color: TOKENS.colors.black,
              fontSize: TOKENS.fontSizes.sm,
              fontWeight: TOKENS.fontWeights.black,
              letterSpacing: TOKENS.letterSpacing.display,
              textTransform: 'uppercase',
              cursor: isPending ? 'wait' : 'pointer',
              opacity: isPending ? 0.7 : 1,
              transition: 'all 200ms ease',
              display: 'flex',
              alignItems: 'center',
              gap: TOKENS.spacing[2],
            }}
            onMouseEnter={(e) => {
              if (!isPending) {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = `0 4px 12px ${TOKENS.colors.accent}40`
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 7H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2z" />
              <path d="M16 11h0" />
            </svg>
            {isPending ? 'Connecting…' : 'Connect Wallet'}
          </button>
        ) : (
          <div
            style={{
              padding: `${TOKENS.spacing[3]} ${TOKENS.spacing[5]}`,
              background: `${TOKENS.colors.accent}20`,
              border: `1px solid ${TOKENS.colors.accent}`,
              borderRadius: TOKENS.radius.md,
              color: TOKENS.colors.accent,
              fontSize: TOKENS.fontSizes.sm,
              fontWeight: TOKENS.fontWeights.bold,
              display: 'flex',
              alignItems: 'center',
              gap: TOKENS.spacing[2],
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: TOKENS.colors.accent }} />
            Connected
          </div>
        )}
      </header>

      {/* MAIN CONTENT - 1/3 left, 2/3 right */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flex: 1,
          overflow: 'hidden',
        }}
      >
      {/* LEFT COLUMN - 1/3 : Logo, Brand, Animation */}
      <div
        style={{
          width: '33.333%',
          minWidth: '380px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: TOKENS.spacing[8],
          background: `linear-gradient(180deg, ${TOKENS.colors.bgApp} 0%, ${TOKENS.colors.black} 100%)`,
          borderRight: `1px solid ${TOKENS.colors.borderSubtle}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.03,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${TOKENS.colors.accent.replace('#', '')}' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Top: Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: TOKENS.spacing[4],
              marginBottom: TOKENS.spacing[6],
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: TOKENS.radius.lg,
                background: TOKENS.colors.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 40px ${TOKENS.colors.accent}40`,
              }}
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill={TOKENS.colors.black} />
                <text
                  x="16"
                  y="22"
                  textAnchor="middle"
                  fill={TOKENS.colors.accent}
                  fontSize="16"
                  fontWeight="800"
                  fontFamily={TOKENS.fonts.sans}
                >
                  H
                </text>
              </svg>
            </div>
            <div>
              <div
                style={{
                  fontSize: TOKENS.fontSizes.lg,
                  fontWeight: TOKENS.fontWeights.black,
                  color: TOKENS.colors.textPrimary,
                  letterSpacing: VALUE_LETTER_SPACING,
                }}
              >
                HEARST
              </div>
              <div
                style={{
                  fontSize: TOKENS.fontSizes.xs,
                  color: TOKENS.colors.accent,
                  fontFamily: MONO,
                  letterSpacing: TOKENS.letterSpacing.display,
                  textTransform: 'uppercase',
                }}
              >
                Connect
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: TOKENS.fontSizes.xxxl,
              fontWeight: TOKENS.fontWeights.black,
              lineHeight: 1.1,
              color: TOKENS.colors.textPrimary,
              marginBottom: TOKENS.spacing[4],
            }}
          >
            Mining
            <br />
            <span style={{ color: TOKENS.colors.accent }}>Yield</span>
          </div>

          <p
            style={{
              fontSize: TOKENS.fontSizes.md,
              color: TOKENS.colors.textSecondary,
              lineHeight: 1.6,
              maxWidth: '320px',
            }}
          >
            Institutional-grade yield from industrial Bitcoin mining operations. 
            Transparent, audited, on-chain.
          </p>
        </div>

        {/* Middle: Animated Box Visualization */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <AnimatedVaultBox />
        </div>

        {/* Bottom: CTA */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {!isConnected ? (
            <button
              onClick={handleConnect}
              disabled={isPending}
              style={{
                width: '100%',
                padding: `${TOKENS.spacing[4]} ${TOKENS.spacing[6]}`,
                background: TOKENS.colors.accent,
                border: 'none',
                borderRadius: TOKENS.radius.md,
                color: TOKENS.colors.black,
                fontSize: TOKENS.fontSizes.md,
                fontWeight: TOKENS.fontWeights.black,
                letterSpacing: TOKENS.letterSpacing.display,
                textTransform: 'uppercase',
                cursor: isPending ? 'wait' : 'pointer',
                opacity: isPending ? 0.7 : 1,
                transition: 'all 200ms ease',
                marginBottom: TOKENS.spacing[4],
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = `0 8px 24px ${TOKENS.colors.accent}40`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {isPending ? 'Connecting…' : 'Connect Wallet'}
            </button>
          ) : (
            <div
              style={{
                padding: `${TOKENS.spacing[4]} ${TOKENS.spacing[6]}`,
                background: TOKENS.colors.bgTertiary,
                border: `1px solid ${TOKENS.colors.accent}`,
                borderRadius: TOKENS.radius.md,
                color: TOKENS.colors.accent,
                fontSize: TOKENS.fontSizes.sm,
                fontWeight: TOKENS.fontWeights.bold,
                textAlign: 'center',
                marginBottom: TOKENS.spacing[4],
              }}
            >
              ✓ Wallet Connected
            </div>
          )}

          <Link
            href="/products"
            style={{
              display: 'block',
              textAlign: 'center',
              fontSize: TOKENS.fontSizes.sm,
              color: TOKENS.colors.textGhost,
              textDecoration: 'none',
              transition: 'color 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = TOKENS.colors.textSecondary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = TOKENS.colors.textGhost
            }}
          >
            ← Back to Products
          </Link>
        </div>
      </div>

      {/* RIGHT COLUMN - 2/3 : Vault Cards Grid */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: TOKENS.colors.bgApp,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: `${TOKENS.spacing[6]} ${TOKENS.spacing[8]}`,
            borderBottom: `1px solid ${TOKENS.colors.borderSubtle}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: TOKENS.fontSizes.xxl,
                fontWeight: TOKENS.fontWeights.black,
                color: TOKENS.colors.textPrimary,
                letterSpacing: VALUE_LETTER_SPACING,
                textTransform: 'uppercase',
                marginBottom: TOKENS.spacing[2],
              }}
            >
              Available Vaults
            </h2>
            <p
              style={{
                fontSize: TOKENS.fontSizes.sm,
                color: TOKENS.colors.textSecondary,
              }}
            >
              {vaults.length} vault{vaults.length !== 1 ? 's' : ''} ready for allocation
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: TOKENS.spacing[3],
              padding: `${TOKENS.spacing[3]} ${TOKENS.spacing[4]}`,
              background: TOKENS.colors.black,
              borderRadius: TOKENS.radius.md,
              border: `1px solid ${TOKENS.colors.borderSubtle}`,
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: TOKENS.colors.accent,
                animation: 'pulse 2s infinite',
              }}
            />
            <span
              style={{
                fontSize: TOKENS.fontSizes.xs,
                fontFamily: MONO,
                color: TOKENS.colors.textSecondary,
                textTransform: 'uppercase',
              }}
            >
              Live Yields
            </span>
          </div>
        </div>

        {/* Vaults Grid */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: TOKENS.spacing[6],
          }}
          className="hide-scrollbar"
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
              gap: TOKENS.spacing[6],
            }}
          >
            {vaults.map((vault, index) => (
              <PhotoVaultCard
                key={vault.id}
                vault={vault}
                index={index}
                isHovered={hoveredVault === vault.id}
                onHover={() => setHoveredVault(vault.id)}
                onLeave={() => setHoveredVault(null)}
                onClick={() => onVaultSelect(vault.id)}
              />
            ))}
          </div>
        </div>
      </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

/** AnimatedVaultBox - Animated visualization of a vault box */
function AnimatedVaultBox() {
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    let rafId: number
    let startTime: number | null = null

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const newRotation = (elapsed / 50) % 360
      setRotation(newRotation)
      rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <div
      style={{
        position: 'relative',
        width: '200px',
        height: '200px',
        perspective: '1000px',
      }}
    >
      {/* Outer ring */}
      <div
        style={{
          position: 'absolute',
          inset: '-20px',
          border: `2px solid ${TOKENS.colors.accent}20`,
          borderRadius: '50%',
          animation: 'spin 20s linear infinite',
        }}
      />

      {/* Middle ring */}
      <div
        style={{
          position: 'absolute',
          inset: '-40px',
          border: `1px dashed ${TOKENS.colors.accent}15`,
          borderRadius: '50%',
          animation: 'spin-reverse 30s linear infinite',
        }}
      />

      {/* 3D Box */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformStyle: 'preserve-3d',
          transform: `rotateX(${20 + Math.sin(rotation / 50) * 10}deg) rotateY(${rotation}deg)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        {/* Front face */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: `linear-gradient(135deg, ${TOKENS.colors.accent}30 0%, ${TOKENS.colors.accent}10 100%)`,
            border: `2px solid ${TOKENS.colors.accent}`,
            borderRadius: TOKENS.radius.lg,
            transform: 'translateZ(100px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 60px ${TOKENS.colors.accent}40`,
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: TOKENS.colors.accent,
              borderRadius: TOKENS.radius.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
              <text
                x="16"
                y="24"
                textAnchor="middle"
                fill={TOKENS.colors.black}
                fontSize="20"
                fontWeight="800"
              >
                H
              </text>
            </svg>
          </div>
        </div>

        {/* Back face */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: TOKENS.colors.black,
            border: `2px solid ${TOKENS.colors.accent}50`,
            borderRadius: TOKENS.radius.lg,
            transform: 'translateZ(-100px) rotateY(180deg)',
          }}
        />

        {/* Right face */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: `${TOKENS.colors.accent}15`,
            border: `2px solid ${TOKENS.colors.accent}40`,
            borderRadius: TOKENS.radius.lg,
            transform: 'translateX(100px) rotateY(90deg)',
          }}
        />

        {/* Left face */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: `${TOKENS.colors.accent}15`,
            border: `2px solid ${TOKENS.colors.accent}40`,
            borderRadius: TOKENS.radius.lg,
            transform: 'translateX(-100px) rotateY(-90deg)',
          }}
        />

        {/* Top face */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: `${TOKENS.colors.accent}25`,
            border: `2px solid ${TOKENS.colors.accent}50`,
            borderRadius: TOKENS.radius.lg,
            transform: 'translateY(-100px) rotateX(90deg)',
          }}
        />

        {/* Bottom face */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: TOKENS.colors.black,
            border: `2px solid ${TOKENS.colors.accent}30`,
            borderRadius: TOKENS.radius.lg,
            transform: 'translateY(100px) rotateX(-90deg)',
          }}
        />
      </div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: '4px',
            height: '4px',
            background: TOKENS.colors.accent,
            borderRadius: '50%',
            top: `${20 + Math.random() * 60}%`,
            left: `${20 + Math.random() * 60}%`,
            animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
            opacity: 0.6,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-10px) translateX(5px); }
          50% { transform: translateY(-5px) translateX(-5px); }
          75% { transform: translateY(-15px) translateX(3px); }
        }
      `}</style>
    </div>
  )
}

/** PhotoVaultCard - Vault card with photo header */
interface PhotoVaultCardProps {
  vault: AvailableVault
  index: number
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
  onClick: () => void
}

const VAULT_GRADIENTS = [
  'linear-gradient(135deg, #A7FB90 0%, #5DD880 50%, #2D9B5F 100%)',
  'linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #1D4ED8 100%)',
  'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)',
  'linear-gradient(135deg, #EC4899 0%, #DB2777 50%, #BE185D 100%)',
]

function PhotoVaultCard({ vault, index, isHovered, onHover, onLeave, onClick }: PhotoVaultCardProps) {
  const gradient = VAULT_GRADIENTS[index % VAULT_GRADIENTS.length]
  const accentColor = index === 0 ? TOKENS.colors.accent : TOKENS.colors.white

  return (
    <div
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
      style={{
        background: TOKENS.colors.black,
        borderRadius: TOKENS.radius.xl,
        overflow: 'hidden',
        border: `1px solid ${isHovered ? TOKENS.colors.accent : TOKENS.colors.borderSubtle}`,
        cursor: 'pointer',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered
          ? `0 20px 40px ${TOKENS.colors.black}, 0 0 0 1px ${TOKENS.colors.accent}40`
          : `0 4px 12px ${TOKENS.colors.black}`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Photo Header */}
      <div
        style={{
          height: '140px',
          background: vault.image
            ? `linear-gradient(180deg, transparent 0%, ${TOKENS.colors.black} 100%), url(${vault.image})`
            : gradient,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          padding: TOKENS.spacing[4],
        }}
      >
        {/* Vault Badge */}
        <div
          style={{
            position: 'absolute',
            top: TOKENS.spacing[4],
            right: TOKENS.spacing[4],
            padding: `${TOKENS.spacing[2]} ${TOKENS.spacing[3]}`,
            background: `${TOKENS.colors.black}80`,
            backdropFilter: 'blur(8px)',
            borderRadius: TOKENS.radius.md,
            border: `1px solid ${accentColor}40`,
            display: 'flex',
            alignItems: 'center',
            gap: TOKENS.spacing[2],
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: TOKENS.colors.accent,
            }}
          />
          <span
            style={{
              fontSize: TOKENS.fontSizes.micro,
              fontWeight: TOKENS.fontWeights.bold,
              fontFamily: MONO,
              color: TOKENS.colors.textPrimary,
              textTransform: 'uppercase',
              letterSpacing: TOKENS.letterSpacing.display,
            }}
          >
            {vault.term}
          </span>
        </div>

        {/* Vault Icon / Symbol */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: TOKENS.radius.lg,
            background: TOKENS.colors.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 8px 24px ${TOKENS.colors.black}`,
          }}
        >
          <span
            style={{
              fontSize: TOKENS.fontSizes.xl,
              fontWeight: TOKENS.fontWeights.black,
              color: TOKENS.colors.black,
            }}
          >
            {vault.name.charAt(0)}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div
        style={{
          padding: TOKENS.spacing[5],
          display: 'flex',
          flexDirection: 'column',
          gap: TOKENS.spacing[4],
          flex: 1,
        }}
      >
        {/* Title & APR */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <h3
              style={{
                fontSize: TOKENS.fontSizes.lg,
                fontWeight: TOKENS.fontWeights.black,
                color: TOKENS.colors.textPrimary,
                textTransform: 'uppercase',
                letterSpacing: VALUE_LETTER_SPACING,
                marginBottom: TOKENS.spacing[1],
              }}
            >
              {formatVaultName(vault.name)}
            </h3>
            <p
              style={{
                fontSize: TOKENS.fontSizes.sm,
                color: TOKENS.colors.textSecondary,
              }}
            >
              {vault.strategy}
            </p>
          </div>
          <div
            style={{
              textAlign: 'right',
            }}
          >
            <div
              style={{
                fontSize: TOKENS.fontSizes.xxl,
                fontWeight: TOKENS.fontWeights.black,
                color: accentColor,
                letterSpacing: VALUE_LETTER_SPACING,
                lineHeight: 1,
              }}
            >
              {vault.apr}%
            </div>
            <div
              style={{
                fontSize: TOKENS.fontSizes.micro,
                fontFamily: MONO,
                color: TOKENS.colors.textGhost,
                textTransform: 'uppercase',
                letterSpacing: TOKENS.letterSpacing.display,
              }}
            >
              APR
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: TOKENS.spacing[3],
          }}
        >
          <VaultStat label="Target" value={vault.target} accent={index === 0} />
          <VaultStat label="Lock" value={vault.lockPeriod} />
          <VaultStat label="Min" value={fmtUsdCompact(vault.minDeposit)} />
          <VaultStat label="Risk" value={vault.risk} />
        </div>

        {/* Target Progress Bar */}
        <div
          style={{
            background: TOKENS.colors.bgTertiary,
            borderRadius: TOKENS.radius.md,
            padding: TOKENS.spacing[3],
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: TOKENS.spacing[2],
            }}
          >
            <span
              style={{
                fontSize: TOKENS.fontSizes.xs,
                fontFamily: MONO,
                color: TOKENS.colors.textSecondary,
                textTransform: 'uppercase',
              }}
            >
              Target Yield
            </span>
            <span
              style={{
                fontSize: TOKENS.fontSizes.xs,
                fontWeight: TOKENS.fontWeights.black,
                color: accentColor,
              }}
            >
              {vault.target}
            </span>
          </div>
          <div
            style={{
              height: '6px',
              background: TOKENS.colors.black,
              borderRadius: TOKENS.radius.sm,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '0%',
                height: '100%',
                background: `linear-gradient(90deg, ${accentColor} 0%, ${accentColor}80 100%)`,
                borderRadius: TOKENS.radius.sm,
                transition: 'width 1s ease',
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: TOKENS.spacing[3],
            borderTop: `1px solid ${TOKENS.colors.borderSubtle}`,
            marginTop: 'auto',
          }}
        >
          <span
            style={{
              fontSize: TOKENS.fontSizes.xs,
              color: TOKENS.colors.textGhost,
            }}
          >
            {vault.fees}
          </span>
          <button
            style={{
              padding: `${TOKENS.spacing[2]} ${TOKENS.spacing[4]}`,
              background: isHovered ? TOKENS.colors.accent : TOKENS.colors.accentDim,
              border: 'none',
              borderRadius: TOKENS.radius.md,
              color: isHovered ? TOKENS.colors.black : TOKENS.colors.accent,
              fontSize: TOKENS.fontSizes.sm,
              fontWeight: TOKENS.fontWeights.black,
              letterSpacing: TOKENS.letterSpacing.display,
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
          >
            Subscribe →
          </button>
        </div>
      </div>
    </div>
  )
}

/** VaultStat - Small stat display for vault cards */
function VaultStat({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div>
      <div
        style={{
          fontSize: TOKENS.fontSizes.micro,
          fontWeight: TOKENS.fontWeights.bold,
          fontFamily: MONO,
          letterSpacing: TOKENS.letterSpacing.display,
          textTransform: 'uppercase',
          color: TOKENS.colors.textSecondary,
          marginBottom: TOKENS.spacing[1],
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: TOKENS.fontSizes.sm,
          fontWeight: TOKENS.fontWeights.black,
          letterSpacing: VALUE_LETTER_SPACING,
          color: accent ? TOKENS.colors.accent : TOKENS.colors.textPrimary,
        }}
      >
        {value}
      </div>
    </div>
  )
}
