'use client'

import type { ReactNode, CSSProperties } from 'react'
import { TOKENS } from './constants'

/**
 * Card — Base reusable card component for the Connect scope.
 * All boxes, panels and surfaces must use this component or its sub-components.
 * Never hardcode padding, radius, border, background or shadow in ad-hoc divs.
 */

export type CardVariant =
  | 'default'
  | 'elevated'
  | 'interactive'
  | 'metric'
  | 'product'
  | 'warning'
  | 'danger'
  | 'success'

interface CardVariantConfig {
  background: string
  border: string
  shadow: string
}

const variantConfig: Record<CardVariant, CardVariantConfig> = {
  default: {
    background: TOKENS.colors.black,
    border: `1px solid ${TOKENS.colors.borderSubtle}`,
    shadow: 'none',
  },
  elevated: {
    background: TOKENS.colors.bgSecondary,
    border: `1px solid ${TOKENS.colors.borderSubtle}`,
    shadow: TOKENS.shadow.card,
  },
  interactive: {
    background: TOKENS.colors.black,
    border: `1px solid ${TOKENS.colors.borderSubtle}`,
    shadow: 'none',
  },
  metric: {
    background: TOKENS.colors.bgTertiary,
    border: `1px solid ${TOKENS.colors.borderSubtle}`,
    shadow: 'none',
  },
  product: {
    background: TOKENS.colors.black,
    border: `1px solid ${TOKENS.colors.borderSubtle}`,
    shadow: TOKENS.shadow.card,
  },
  warning: {
    background: TOKENS.colors.black,
    border: `1px solid var(--dashboard-warning-border)`,
    shadow: 'none',
  },
  danger: {
    background: TOKENS.colors.black,
    border: `1px solid var(--dashboard-error-border)`,
    shadow: TOKENS.shadow.glowDanger,
  },
  success: {
    background: TOKENS.colors.black,
    border: `1px solid var(--dashboard-success-border)`,
    shadow: 'none',
  },
}

interface CardProps {
  children: ReactNode
  variant?: CardVariant
  /** Padding preset: 'normal' | 'tight' | 'limit'. Defaults to 'normal' (--dashboard-card-padding). */
  density?: 'normal' | 'tight' | 'limit'
  style?: CSSProperties
  className?: string
  onClick?: () => void
  role?: string
}

function getPadding(density: CardProps['density']) {
  switch (density) {
    case 'tight': return TOKENS.spacing[4]
    case 'limit': return TOKENS.spacing[3]
    default: return TOKENS.spacing[6]
  }
}

export function Card({
  children,
  variant = 'default',
  density = 'normal',
  style,
  className,
  onClick,
  role,
}: CardProps) {
  const cfg = variantConfig[variant]
  const isInteractive = variant === 'interactive' || !!onClick

  return (
    <div
      role={onClick ? (role ?? 'button') : role}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
      onClick={onClick}
      style={{
        background: cfg.background,
        border: cfg.border,
        boxShadow: cfg.shadow,
        borderRadius: TOKENS.radius.lg,
        overflow: 'hidden',
        cursor: isInteractive ? 'pointer' : 'default',
        transition: isInteractive ? `all ${TOKENS.animation.durationNormal} ${TOKENS.animation.easeSpring}` : undefined,
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  )
}

/** CardHeader — Standardized panel header with accent bar, title, optional count and action. */
interface CardHeaderProps {
  title: string
  count?: number
  action?: ReactNode
  density?: CardProps['density']
}

export function CardHeader({ title, count, action, density = 'normal' }: CardHeaderProps) {
  const pad = getPadding(density)

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: `${pad} ${pad} 0`,
        marginBottom: TOKENS.spacing[8],
        flexShrink: 0,
        height: 'var(--dashboard-card-header-height)',
        boxSizing: 'content-box',
      }}
    >
      <span
        style={{
          fontFamily: TOKENS.fonts.mono,
          fontSize: TOKENS.fontSizes.xs,
          fontWeight: TOKENS.fontWeights.bold,
          letterSpacing: TOKENS.letterSpacing.display,
          textTransform: 'uppercase',
          borderLeft: `var(--dashboard-card-border-accent-width) solid ${TOKENS.colors.accent}`,
          paddingLeft: TOKENS.spacing[3],
          color: TOKENS.colors.textSecondary,
          display: 'flex',
          alignItems: 'center',
          gap: TOKENS.spacing[2],
        }}
      >
        {title}
        {count !== undefined && (
          <span
            style={{
              fontSize: TOKENS.fontSizes.xs,
              fontWeight: TOKENS.fontWeights.bold,
              color: TOKENS.colors.textGhost,
            }}
          >
            ({count})
          </span>
        )}
      </span>
      {action}
    </div>
  )
}

/** CardBody — Scrollable or static content area. */
interface CardBodyProps {
  children: ReactNode
  scrollable?: boolean
  density?: CardProps['density']
  style?: CSSProperties
}

export function CardBody({ children, scrollable = false, density = 'normal', style }: CardBodyProps) {
  const pad = getPadding(density)

  return (
    <div
      className={scrollable ? 'hide-scrollbar' : undefined}
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: scrollable ? 'auto' : 'visible',
        overflowX: 'hidden',
        padding: `0 ${pad} ${pad}`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/** CardFooter — Bottom area with separator. */
interface CardFooterProps {
  children: ReactNode
  density?: CardProps['density']
}

export function CardFooter({ children, density = 'normal' }: CardFooterProps) {
  const pad = getPadding(density)

  return (
    <div
      style={{
        padding: `${TOKENS.spacing[3]} ${pad} ${pad}`,
        borderTop: `1px solid ${TOKENS.colors.borderSubtle}`,
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  )
}

/** CardAction — Ghost button for panel header "View All" style actions. */
interface CardActionProps {
  label: string
  onClick?: () => void
  density?: CardProps['density']
}

export function CardAction({ label, onClick }: CardActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: `${TOKENS.spacing[2]} ${TOKENS.spacing[3]}`,
        background: 'transparent',
        border: `1px solid ${TOKENS.colors.borderSubtle}`,
        borderRadius: TOKENS.radius.md,
        color: TOKENS.colors.textGhost,
        fontSize: TOKENS.fontSizes.micro,
        fontWeight: TOKENS.fontWeights.bold,
        letterSpacing: TOKENS.letterSpacing.wide,
        textTransform: 'uppercase',
        cursor: onClick ? 'pointer' : 'default',
        height: 'var(--dashboard-control-height-sm)',
        display: 'flex',
        alignItems: 'center',
        transition: `all ${TOKENS.animation.durationFast} ${TOKENS.animation.easeSharp}`,
      }}
    >
      {label}
    </button>
  )
}
