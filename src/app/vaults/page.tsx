import { AppClient } from '../app/app-client'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'My Vaults | Hearst Connect',
  description: 'Your portfolio — positions, yield tracking, and vault management.',
}

export default function VaultsPortfolioPage() {
  return <AppClient />
}
