'use client';

import Link from 'next/link';

const MAILTO_SALES =
  'mailto:hello@hearstvault.com?subject=' + encodeURIComponent('Hearst Connect access inquiry');

const VALUE_PROPS = [
  {
    title: 'Real Infrastructure',
    desc: 'Direct exposure to industrial-scale Bitcoin mining operations with proven hashrate and transparent reporting.',
  },
  {
    title: 'Institutional Controls',
    desc: 'Multi-signature governance, audited smart contracts, and custody solutions built for serious allocators.',
  },
  {
    title: 'Onchain Transparency',
    desc: 'Monthly distributions, proof of reserves, and third-party audits. No black boxes.',
  },
];

const HOW_IT_WORKS = [
  { step: '1', title: 'Qualify', desc: 'Confirm accredited investor status and complete KYC' },
  { step: '2', title: 'Select Strategy', desc: 'Choose between Prime Yield or Growth vault' },
  { step: '3', title: 'Deploy USDC', desc: 'Deposit USDC to your chosen vault on Base' },
  { step: '4', title: 'Earn Yield', desc: 'Receive monthly distributions from mining operations' },
];

const REQUIREMENTS = [
  'Accredited investor status (US) or qualified investor equivalent',
  'Minimum investment: $250,000 USDC',
  '3-year lock-up period with monthly distributions',
  'Web3 wallet compatible with Base network (setup assistance available)',
];

export default function LaunchAppClient() {
  return (
    <div className="hub-font-scope">
      {/* Hero */}
      <section
        id="launch-hero"
        className="center"
        style={{
          minHeight: '80vh',
          display: 'grid',
          placeContent: 'center',
          placeItems: 'center',
          textAlign: 'center',
          paddingInline: 'clamp(1rem, 4vw, 3rem)',
        }}
      >
        <div className="hub-chapter">
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1.1,
              maxWidth: '20ch',
              marginInline: 'auto',
              marginBottom: 'var(--hub-space-md)',
              color: 'var(--dashboard-text-bright)',
            }}
          >
            Access Institutional Bitcoin Mining Yield
          </h1>
          <p
            style={{
              fontSize: 'clamp(1.05rem, 1.5vw, 1.25rem)',
              lineHeight: 1.6,
              color: 'var(--dashboard-text-secondary)',
              maxWidth: '52ch',
              marginInline: 'auto',
              marginBottom: 'var(--hub-space-lg)',
              textWrap: 'pretty',
            }}
          >
            Hearst Connect offers qualified investors direct exposure to industrial mining cash flows
            through USDC vaults backed by regulated infrastructure and transparent reporting.
          </p>
          <div
            style={{
              display: 'flex',
              gap: 'var(--hub-space-md)',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <a href={MAILTO_SALES} className="hub-cta-primary" style={{ fontSize: '1.05rem' }}>
              Contact Sales
            </a>
            <Link href="/" className="hub-cta-secondary" style={{ fontSize: '1.05rem' }}>
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section
        id="launch-value"
        className="theme-light"
        style={{
          paddingBlock: 'var(--hub-space-xl)',
          paddingInline: 'clamp(1rem, 4vw, 3rem)',
        }}
      >
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <h2
            className="hub-chapter"
            style={{
              fontSize: 'clamp(1.85rem, 3.8vw, 2.65rem)',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1.14,
              marginBottom: 'var(--hub-space-lg)',
              textAlign: 'center',
              color: 'var(--dashboard-text-primary)',
            }}
          >
            Why Hearst Connect?
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--hub-space-md)',
            }}
          >
            {VALUE_PROPS.map(prop => (
              <div
                key={prop.title}
                className="hub-chapter"
                style={{
                  padding: 'var(--hub-space-lg)',
                  background: 'var(--dashboard-surface)',
                  borderRadius: 'var(--dashboard-radius-card)',
                  border: '1px solid var(--dashboard-border)',
                  boxShadow: 'var(--dashboard-shadow-md)',
                }}
              >
                <h3
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: 700,
                    marginBottom: 'var(--hub-space-sm)',
                    color: 'var(--dashboard-text-primary)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {prop.title}
                </h3>
                <p
                  style={{
                    color: 'var(--dashboard-text-secondary)',
                    lineHeight: 1.6,
                    margin: 0,
                    fontSize: '0.95rem',
                  }}
                >
                  {prop.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="launch-how"
        style={{
          paddingBlock: 'var(--hub-space-xl)',
          paddingInline: 'clamp(1rem, 4vw, 3rem)',
        }}
      >
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <h2
            className="hub-chapter"
            style={{
              fontSize: 'clamp(1.85rem, 3.8vw, 2.65rem)',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1.14,
              marginBottom: 'var(--hub-space-lg)',
              textAlign: 'center',
              color: 'var(--dashboard-text-bright)',
            }}
          >
            How It Works
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 'var(--hub-space-lg)',
            }}
          >
            {HOW_IT_WORKS.map(item => (
              <div key={item.step} className="hub-chapter" style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--dashboard-accent)',
                    color: 'var(--dashboard-page)',
                    display: 'grid',
                    placeContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    margin: '0 auto var(--hub-space-sm)',
                    boxShadow: 'var(--dashboard-shadow-accent)',
                  }}
                >
                  {item.step}
                </div>
                <h3
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    marginBottom: 'var(--hub-space-xs)',
                    color: 'var(--dashboard-text-primary)',
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    color: 'var(--dashboard-text-secondary)',
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section
        id="launch-requirements"
        className="theme-light"
        style={{
          paddingBlock: 'var(--hub-space-xl)',
          paddingInline: 'clamp(1rem, 4vw, 3rem)',
        }}
      >
        <div style={{ maxWidth: '52rem', margin: '0 auto', textAlign: 'center' }}>
          <h2
            className="hub-chapter"
            style={{
              fontSize: 'clamp(1.85rem, 3.8vw, 2.65rem)',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              marginBottom: 'var(--hub-space-md)',
              color: 'var(--dashboard-text-primary)',
            }}
          >
            Investment Requirements
          </h2>
          <div
            className="hub-chapter"
            style={{
              padding: 'var(--hub-space-lg)',
              background: 'var(--dashboard-surface)',
              borderRadius: 'var(--dashboard-radius-card)',
              border: '1px solid var(--dashboard-border)',
              textAlign: 'left',
              boxShadow: 'var(--dashboard-shadow-md)',
            }}
          >
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--hub-space-sm)',
              }}
            >
              {REQUIREMENTS.map((req, idx) => (
                <li
                  key={idx}
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-start',
                    color: 'var(--dashboard-text-primary)',
                  }}
                >
                  <span
                    style={{
                      color: 'var(--dashboard-accent)',
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </span>
                  <span style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        id="launch-cta"
        className="center"
        style={{
          paddingBlock: 'var(--hub-space-xl)',
          paddingInline: 'clamp(1rem, 4vw, 3rem)',
        }}
      >
        <div className="hub-chapter" style={{ textAlign: 'center' }}>
          <h2
            style={{
              fontSize: 'clamp(2rem, 4.5vw, 3rem)',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              marginBottom: 'var(--hub-space-md)',
              color: 'var(--dashboard-text-bright)',
            }}
          >
            Ready to Allocate?
          </h2>
          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--dashboard-text-secondary)',
              marginBottom: 'var(--hub-space-lg)',
              maxWidth: '42ch',
              marginInline: 'auto',
              lineHeight: 1.6,
            }}
          >
            Contact our team for due diligence materials, detailed term sheets, and onboarding
            assistance.
          </p>
          <div
            style={{
              display: 'flex',
              gap: 'var(--hub-space-md)',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <a href={MAILTO_SALES} className="hub-cta-primary" style={{ fontSize: '1.05rem' }}>
              Contact Sales
            </a>
            <Link href="/" className="hub-cta-secondary" style={{ fontSize: '1.05rem' }}>
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
