import type { Metadata } from 'next'
import { ProductsClient } from './products-client'

export const metadata: Metadata = {
  title: 'Products | Hearst Connect',
  description:
    'Explore institutional-grade yield vaults backed by Bitcoin mining. USDC distributions, transparent reporting, audited contracts.',
  openGraph: {
    title: 'Products | Hearst Connect',
    description:
      'Explore institutional-grade yield vaults backed by Bitcoin mining.',
    siteName: 'Hearst',
    url: '/products',
    images: [
      {
        url: '/platform-screenshot.png',
        width: 1024,
        height: 657,
        alt: 'Hearst vault strategies',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Products | Hearst Connect',
    description: 'Explore institutional-grade yield vaults.',
    images: ['/platform-screenshot.png'],
  },
}

export const dynamic = 'force-dynamic'

export default function ProductsPage() {
  return <ProductsClient />
}
