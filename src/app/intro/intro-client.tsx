'use client'

import { useState } from 'react'
import Link from 'next/link'

const TOKENS = {
  colors: {
    bgApp: '#050505',
    bgSidebar: '#050505',
    bgSurface: '#0A0A0A',
    bgSecondary: '#0F0F0F',
    textPrimary: 'rgba(255,255,255,0.92)',
    textSecondary: 'rgba(255,255,255,0.55)',
    textGhost: 'rgba(255,255,255,0.35)',
    accent: '#A7FB90',
    black: '#000000',
    borderSubtle: 'rgba(255,255,255,0.08)',
  },
  fonts: {
    sans: 'var(--font-satoshi), system-ui, sans-serif',
    mono: '"IBM Plex Mono", ui-monospace, monospace',
  },
  fontSizes: {
    xs: '12px',
    sm: '13px',
    md: '14px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
    display: '32px',
  },
  spacing: [0, 2, 4, 6, 8, 10, 12, 16, 20, 24, 32] as const,
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
  },
}

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Secure Vaults',
    desc: 'Audited smart contracts with multi-sig controls',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    title: 'Real Yield',
    desc: 'USDC returns from industrial Bitcoin mining',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: 'Transparent',
    desc: 'On-chain proof of reserves & monthly audits',
  },
]

export function IntroClient() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      style={{
        minHeight: '100vh',
        background: TOKENS.colors.bgApp,
        color: TOKENS.colors.textPrimary,
        fontFamily: TOKENS.fonts.sans,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${TOKENS.spacing[4]}px ${TOKENS.spacing[6]}px`,
          borderBottom: `1px solid ${TOKENS.colors.borderSubtle}`,
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img
            src="/logos/hearst.svg"
            alt="Hearst"
            style={{ height: '32px', width: 'auto' }}
          />
        </Link>
        <Link
          href="/"
          style={{
            color: TOKENS.colors.textSecondary,
            textDecoration: 'none',
            fontSize: TOKENS.fontSizes.sm,
            fontWeight: 600,
          }}
        >
          ← Back to Home
        </Link>
      </header>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${TOKENS.spacing[8]}px`,
          gap: `${TOKENS.spacing[8]}px`,
        }}
      >
        {/* Hero Section */}
        <div
          style={{
            textAlign: 'center',
            maxWidth: '600px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: `${TOKENS.spacing[2]}px`,
              padding: `${TOKENS.spacing[2]}px ${TOKENS.spacing[4]}px`,
              background: 'rgba(167, 251, 144, 0.1)',
              borderRadius: TOKENS.radius.md,
              marginBottom: `${TOKENS.spacing[6]}px`,
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                background: TOKENS.colors.accent,
                borderRadius: '50%',
              }}
            />
            <span
              style={{
                color: TOKENS.colors.accent,
                fontSize: TOKENS.fontSizes.xs,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Institutional DeFi
            </span>
          </div>

          <h1
            style={{
              fontSize: '48px',
              fontWeight: 800,
              margin: `0 0 ${TOKENS.spacing[4]}px 0`,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            Hearst Connect
          </h1>

          <p
            style={{
              fontSize: TOKENS.fontSizes.lg,
              color: TOKENS.colors.textSecondary,
              margin: `0 0 ${TOKENS.spacing[8]}px 0`,
              lineHeight: 1.6,
            }}
          >
            Access real yield from industrial Bitcoin mining operations.
            <br />
            USDC vaults on Base with institutional-grade controls.
          </p>
        </div>

        {/* Features Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: `${TOKENS.spacing[6]}px`,
            maxWidth: '900px',
            width: '100%',
          }}
        >
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              style={{
                padding: `${TOKENS.spacing[6]}px`,
                background: TOKENS.colors.bgSurface,
                border: `1px solid ${TOKENS.colors.borderSubtle}`,
                borderRadius: TOKENS.radius.md,
                display: 'flex',
                flexDirection: 'column',
                gap: `${TOKENS.spacing[4]}px`,
              }}
            >
              <div style={{ color: TOKENS.colors.accent }}>{feature.icon}</div>
              <h3
                style={{
                  fontSize: TOKENS.fontSizes.md,
                  fontWeight: 700,
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontSize: TOKENS.fontSizes.sm,
                  color: TOKENS.colors.textSecondary,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Link
          href="/app"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: `${TOKENS.spacing[3]}px`,
            padding: `${TOKENS.spacing[4]}px ${TOKENS.spacing[8]}px`,
            background: isHovered ? 'rgba(167, 251, 144, 0.9)' : TOKENS.colors.accent,
            color: TOKENS.colors.black,
            border: 'none',
            borderRadius: TOKENS.radius.md,
            fontSize: TOKENS.fontSizes.md,
            fontWeight: 700,
            textDecoration: 'none',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            transition: 'all 150ms ease-out',
            marginTop: `${TOKENS.spacing[4]}px`,
          }}
        >
          <span>Enter Platform</span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
              transition: 'transform 150ms ease-out',
            }}
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>

        <p
          style={{
            fontSize: TOKENS.fontSizes.xs,
            color: TOKENS.colors.textGhost,
            margin: 0,
          }}
        >
          Connect your wallet to view available vaults and manage positions
        </p>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: `${TOKENS.spacing[6]}px`,
          borderTop: `1px solid ${TOKENS.colors.borderSubtle}`,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: TOKENS.fontSizes.xs,
            color: TOKENS.colors.textGhost,
            margin: 0,
          }}
        >
          © 2026 Hearst. Audited smart contracts on Base.
        </p>
      </footer>
    </div>
  )
}
