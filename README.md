# Hearst Connect

Onchain access to institutional Bitcoin mining cash flows.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page — marketing, investment strategies, CTA |
| `/app` | DeFi vault interface — connect wallet, deposit, claim, withdraw |

> **Redirects:** `/launch-app`, `/hub`, and `/vault` all redirect to their canonical routes.

## Tech Stack

- **Next.js 16** (App Router, webpack)
- **React 19** + TypeScript
- **Tailwind CSS v4** (via `@tailwindcss/webpack`)
- **wagmi v2** + **viem** + **RainbowKit** (Web3, Base chain)
- **GSAP** — canvas claim flow animation (`CustomEase`)
- **Satoshi Variable** (brand font) + **Inter** (fallback)

## Getting Started

```bash
cp .env.example .env   # fill in contract addresses + WalletConnect ID
npm install
npm run dev            # http://localhost:8100
```

## Environment Variables

Copy `.env.example` and fill in:

```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=   # Required for /app
NEXT_PUBLIC_VAULT_ADDRESS=0x...         # EpochVault contract on Base
NEXT_PUBLIC_USDC_ADDRESS=0x...          # USDC contract on Base
NEXT_PUBLIC_GA_ID=                      # Optional — Google Analytics
NEXT_PUBLIC_GOOGLE_ADS_ID=              # Optional — Google Ads
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx                # Landing (server) → landing-client.tsx
│   ├── landing-client.tsx      # Landing page (client)
│   ├── not-found.tsx           # 404 page
│   ├── layout.tsx              # Root layout with ErrorBoundary + analytics
│   └── app/
│       ├── page.tsx            # Vault interface (server, force-dynamic)
│       └── app-client.tsx      # Vault interface (client)
├── components/
│   ├── connect/                # Vault UI (Canvas timeline, providers)
│   │   ├── canvas.tsx          # Main vault interface with temporal flow
│   │   └── providers.tsx       # Wagmi + RainbowKit providers
│   ├── layout/                 # Analytics scripts
│   ├── ui/                     # Click ripple component
│   └── error-boundary.tsx      # Global error handler
├── config/
│   ├── abi/                    # EpochVault + USDC ABIs
│   ├── contracts.ts            # Addresses, chain, constants, env validation
│   └── wagmi.ts                # RainbowKit config (Base chain)
├── hooks/                      # Web3 hooks for vault operations
│   ├── useVaultData.ts         # Global vault stats (TVL, APR)
│   ├── useUserPosition.ts      # User deposit + lock info
│   ├── useRewards.ts           # Claimable rewards + claim action
│   ├── useEpoch.ts             # Current epoch + countdown
│   ├── useDeposit.ts           # Deposit flow (approve → deposit)
│   └── useWithdraw.ts          # Withdraw action
├── generated/
│   └── dashboard-vars.css      # Design tokens (auto-generated)
└── styles/
    ├── tailwind.css
    └── marketing/              # Landing page styles (hub.css, hub-font.css)
```

## Recent Updates (Apr 21, 2026)

- ✅ Fixed `projected` calculation with NaN validation
- ✅ Removed code duplication (ICONS 3x → 1x, INVESTMENT_STRATEGY_SLIDES 2x → 1x)
- ✅ Cleaned dead code (hearst-os folder, unused constants)
- ✅ Improved env var validation (server-side only, better fallbacks)
- ✅ Added `/vault → /app` redirect for consistency
- ✅ Enabled TypeScript strict mode
- ✅ Optimized GSAP animations (moved CustomEase inline)
