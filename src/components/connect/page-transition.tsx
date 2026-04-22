'use client'

import { useEffect, useState, type ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
  pageKey: string
}

export function PageTransition({ children, pageKey }: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(false)
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [pageKey])

  return (
    <div
      style={{
        height: '100%',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 150ms ease-out, transform 150ms ease-out',
      }}
    >
      {children}
    </div>
  )
}
