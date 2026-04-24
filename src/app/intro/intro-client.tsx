'use client'

import Link from 'next/link'

const PILLARS = [
  { label: 'Industrial mining yield', desc: 'Direct exposure to real hashrate — no synthetic instruments.' },
  { label: 'Monthly USDC distributions', desc: 'On-chain disbursements, auditable end to end.' },
  { label: 'Institutional controls', desc: 'Multi-sig governance, audited contracts, regulated custody.' },
]

export function IntroClient() {
  return (
    <div className="intro-shell" data-theme="dark">

      {/* ── Header ── */}
      <header className="intro-header">
        <Link href="/" className="intro-logo-link">
          <img src="/logos/hearst.svg" alt="Hearst" className="intro-logo" />
        </Link>
        <Link href="/" className="intro-back">← Back to Home</Link>
      </header>

      {/* ── 50 / 50 split ── */}
      <main className="intro-main">

        {/* LEFT — copy */}
        <div className="intro-left">
          {/* Eyebrow */}
          <p className="intro-eyebrow">Institutional mining yield</p>

          {/* Wordmark */}
          <img
            src="/logos/hearst-connect-blackbg.svg"
            alt="Hearst Connect"
            className="intro-wordmark"
          />

          {/* Sub */}
          <p className="intro-subtitle">
            USDC vaults backed by industrial Bitcoin mining infrastructure.
            Transparent reporting. Institutional controls.
          </p>

          {/* Pillars */}
          <ul className="intro-pillars">
            {PILLARS.map((p) => (
              <li key={p.label} className="intro-pillar">
                <span className="intro-pillar-dot" aria-hidden />
                <div>
                  <strong className="intro-pillar-label">{p.label}</strong>
                  <span className="intro-pillar-desc">{p.desc}</span>
                </div>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="intro-cta-group">
            <Link href="/app" className="intro-cta-primary">
              <span>Enter Platform</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <p className="intro-cta-hint">Connect your wallet to view available vaults</p>
          </div>
        </div>

        {/* RIGHT — video card */}
        <div className="intro-right">
          <div className="intro-video-card">
            <video
              className="intro-video"
              src="/intro-bg.mp4"
              autoPlay
              loop
              muted
              playsInline
            />
            {/* subtle inner vignette so edges blend */}
            <div className="intro-video-vignette" aria-hidden />
          </div>
        </div>

      </main>

      {/* ── Footer ── */}
      <footer className="intro-footer">
        <p>© 2026 Hearst · Audited smart contracts on Base</p>
      </footer>
    </div>
  )
}
