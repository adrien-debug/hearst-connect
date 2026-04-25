'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/theme/theme-toggle'

export function MainNav() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <header className="main-nav">
      <nav className="main-nav-inner">
        {/* Left - Products */}
        <Link
          href="/products"
          className={`main-nav-link ${isActive('/products') ? 'active' : ''}`}
        >
          Products
        </Link>

        {/* Center - Logo H */}
        <Link href="/" className="main-nav-logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="currentColor" />
            <text x="16" y="22" textAnchor="middle" fill="var(--color-bg-primary)" fontSize="16" fontWeight="700">H</text>
          </svg>
        </Link>

        {/* Right - My Vaults + Theme */}
        <div className="main-nav-right">
          <Link
            href="/vaults"
            className={`main-nav-link ${isActive('/vaults') ? 'active' : ''}`}
          >
            My Vaults
          </Link>
          <ThemeToggle variant="minimal" size="sm" />
        </div>
      </nav>
    </header>
  )
}
