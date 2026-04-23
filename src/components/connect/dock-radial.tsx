'use client'

import { useState, useEffect, useCallback } from 'react'
import { TOKENS, VALUE_LETTER_SPACING } from './constants'
import { SIMULATION_VIEW_ID, AVAILABLE_VAULTS_VIEW_ID } from './view-ids'

interface DockRadialProps {
  selectedId: string | null
  onSelect: (id: string | null) => void
  isSimulation: boolean
}

type NavState = 'dashboard' | 'available' | 'simulation'

export function DockRadial({ selectedId, onSelect, isSimulation }: DockRadialProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Determine current state from routing
  const currentState: NavState = (() => {
    if (isSimulation) return 'simulation'
    if (selectedId === AVAILABLE_VAULTS_VIEW_ID) return 'available'
    if (selectedId?.startsWith('available-vault-')) return 'available'
    return 'dashboard'
  })()

  // Auto-collapse when clicking outside
  useEffect(() => {
    if (!isExpanded) return
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-dock-radial]')) {
        setIsExpanded(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isExpanded])

  // Keyboard shortcut: Space to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault()
        setIsExpanded(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleNavClick = useCallback((state: NavState) => {
    switch (state) {
      case 'dashboard':
        onSelect(null) // null = dashboard/overview
        break
      case 'available':
        onSelect(AVAILABLE_VAULTS_VIEW_ID)
        break
      case 'simulation':
        onSelect(SIMULATION_VIEW_ID)
        break
    }
    setIsExpanded(false)
  }, [onSelect])

  const navItems = [
    { id: 'dashboard' as const, label: 'DASH', x: -70, y: -30 },
    { id: 'available' as const, label: 'AVAIL', x: 0, y: -55 },
    { id: 'simulation' as const, label: 'SIMU', x: 70, y: -30 },
  ]

  return (
    <div
      data-dock-radial
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow background */}
      {isExpanded && (
        <div
          style={{
            position: 'absolute',
            width: '300px',
            height: '150px',
            background: `radial-gradient(ellipse at center bottom, ${TOKENS.colors.accentGlow} 0%, transparent 70%)`,
            pointerEvents: 'none',
            animation: 'fadeIn 300ms ease',
          }}
        />
      )}

      {/* Nav items */}
      {navItems.map((item, index) => {
        const isActive = currentState === item.id
        return (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            style={{
              position: 'absolute',
              transform: isExpanded
                ? `translate(${item.x}px, ${item.y}px)`
                : 'translate(0, 20px) scale(0)',
              opacity: isExpanded ? 1 : 0,
              transition: 'all 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              transitionDelay: isExpanded ? `${index * 60}ms` : '0ms',
              padding: '8px 14px',
              background: isActive ? TOKENS.colors.accent : TOKENS.colors.bgSurface,
              border: `1px solid ${isActive ? TOKENS.colors.accent : TOKENS.colors.borderSubtle}`,
              borderRadius: '16px',
              cursor: 'pointer',
              boxShadow: isActive
                ? `0 0 16px ${TOKENS.colors.accentGlow}`
                : '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            <span
              style={{
                fontSize: '10px',
                fontWeight: TOKENS.fontWeights.black,
                letterSpacing: VALUE_LETTER_SPACING,
                color: isActive ? TOKENS.colors.black : TOKENS.colors.textPrimary,
                textTransform: 'uppercase',
              }}
            >
              {item.label}
            </span>
          </button>
        )
      })}

      {/* Central Hub Button */}
      <button
        onClick={() => setIsExpanded(prev => !prev)}
        style={{
          position: 'relative',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: isExpanded || isHovered
            ? TOKENS.colors.accent
            : TOKENS.colors.bgSurface,
          border: `2px solid ${isExpanded ? TOKENS.colors.accent : TOKENS.colors.borderSubtle}`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isExpanded
            ? `0 0 24px ${TOKENS.colors.accentGlow}`
            : '0 4px 12px rgba(0,0,0,0.3)',
          transition: 'all 300ms ease',
          zIndex: 10,
        }}
        aria-label={isExpanded ? 'Close navigation' : 'Open navigation'}
        aria-expanded={isExpanded}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            color: isExpanded || isHovered ? TOKENS.colors.black : TOKENS.colors.textPrimary,
          }}
        >
          <path
            d="M4 6h16M4 12h16M4 18h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Active indicator - always visible when collapsed */}
      {!isExpanded && (
        <div
          style={{
            position: 'absolute',
            bottom: '-24px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '9px',
            fontWeight: TOKENS.fontWeights.bold,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: TOKENS.colors.textGhost,
            whiteSpace: 'nowrap',
            opacity: isHovered ? 1 : 0.7,
            transition: 'opacity 200ms ease',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: currentState === 'dashboard' ? TOKENS.colors.accent : TOKENS.colors.textGhost,
            }}
          />
          <span>{navItems.find(n => n.id === currentState)?.label || 'DASH'}</span>
          <span style={{ marginLeft: '4px', opacity: 0.5 }}>· Space</span>
        </div>
      )}
    </div>
  )
}
