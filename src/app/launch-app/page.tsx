import type { Metadata } from 'next';
import LaunchAppClient from './page-client';

export const metadata: Metadata = {
  title: 'Launch App | Hearst Connect',
  description: 'Access institutional-grade Bitcoin mining yield through transparent, onchain vaults on Base.',
  openGraph: {
    title: 'Launch App | Hearst Connect',
    description: 'Access institutional-grade Bitcoin mining yield through transparent, onchain vaults on Base.',
    url: '/launch-app',
    images: ['/platform-screenshot.png'],
  },
};

export default function LaunchAppPage() {
  return <LaunchAppClient />;
}
