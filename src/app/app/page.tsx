import { AppClient } from './app-client'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'App | Hearst Connect',
  description: 'Access institutional-grade yield vaults backed by Bitcoin mining.',
}

export default function AppPage() {
  return <AppClient />
}
