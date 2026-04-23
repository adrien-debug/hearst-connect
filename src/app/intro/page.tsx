import type { Metadata } from 'next'
import { IntroClient } from './intro-client'

export const metadata: Metadata = {
  title: 'Hearst Connect | Enter the Platform',
  description: 'Access on-chain Bitcoin mining yields through USDC vaults.',
}

export default function IntroPage() {
  return <IntroClient />
}
