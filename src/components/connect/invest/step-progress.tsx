'use client'

import { TOKENS } from '../constants'

export type WizardStep = 'select' | 'product' | 'deposit' | 'confirmed'

const STEPS: ReadonlyArray<{ id: WizardStep; label: string }> = [
  { id: 'select',    label: 'Select' },
  { id: 'product',   label: 'Product' },
  { id: 'deposit',   label: 'Deposit' },
  { id: 'confirmed', label: 'Confirmed' },
]

const ORDER: Record<WizardStep, number> = {
  select: 1, product: 2, deposit: 3, confirmed: 4,
}

/** StepProgress — Top header showing the 4-step Invest wizard.
 * Active step gets the accent dot + accent label, past steps show a check,
 * future steps are muted. Matches the "1 Select → 2 Product → 3 Deposit → 4 Confirmed"
 * pill row from the Hearst Connect Invest mockups. */
export function StepProgress({ active }: { active: WizardStep }) {
  const activeOrder = ORDER[active]

  return (
    <div
      role="list"
      aria-label="Invest wizard progress"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: TOKENS.spacing[3],
        flexWrap: 'wrap',
        flexShrink: 0,
      }}
    >
      {STEPS.map((step, index) => {
        const order = index + 1
        const isActive = step.id === active
        const isPast = order < activeOrder
        const isFuture = order > activeOrder

        const dotBg = isActive
          ? TOKENS.colors.accent
          : isPast
            ? TOKENS.colors.accentSubtle
            : TOKENS.colors.bgTertiary
        const dotBorder = isActive || isPast ? TOKENS.colors.accent : TOKENS.colors.borderSubtle
        const dotColor = isActive ? TOKENS.colors.black : isPast ? TOKENS.colors.accent : TOKENS.colors.textGhost
        const labelColor = isFuture ? TOKENS.colors.textGhost : TOKENS.colors.textPrimary

        return (
          <div
            key={step.id}
            role="listitem"
            aria-current={isActive ? 'step' : undefined}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: TOKENS.spacing[2],
            }}
          >
            <span
              aria-hidden
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: TOKENS.spacing[5],
                height: TOKENS.spacing[5],
                borderRadius: TOKENS.radius.full,
                background: dotBg,
                border: `${TOKENS.borders.thin} solid ${dotBorder}`,
                color: dotColor,
                fontFamily: TOKENS.fonts.mono,
                fontSize: TOKENS.fontSizes.micro,
                fontWeight: TOKENS.fontWeights.bold,
              }}
            >
              {isPast ? '✓' : order}
            </span>
            <span
              style={{
                fontFamily: TOKENS.fonts.mono,
                fontSize: TOKENS.fontSizes.xs,
                fontWeight: TOKENS.fontWeights.bold,
                letterSpacing: TOKENS.letterSpacing.display,
                textTransform: 'uppercase',
                color: labelColor,
              }}
            >
              {step.label}
            </span>
            {index < STEPS.length - 1 && (
              <span
                aria-hidden
                style={{
                  width: TOKENS.spacing[8],
                  height: TOKENS.borders.thin,
                  background: order < activeOrder ? TOKENS.colors.accent : TOKENS.colors.borderSubtle,
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
