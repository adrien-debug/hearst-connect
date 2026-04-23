import { AdminClient } from './admin-client'

export const metadata = {
  title: 'Admin | Hearst',
  description: 'Vault configuration and management',
}

export default function AdminPage() {
  return <AdminClient />
}
