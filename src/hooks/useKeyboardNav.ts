'use client'

import { useEffect, useCallback } from 'react'

interface UseKeyboardNavOptions {
  onEscape?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onEnter?: () => void
  enabled?: boolean
}

export function useKeyboardNav({
  onEscape,
  onArrowUp,
  onArrowDown,
  onEnter,
  enabled = true,
}: UseKeyboardNavOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      switch (event.key) {
        case 'Escape':
          if (onEscape) {
            event.preventDefault()
            onEscape()
          }
          break
        case 'ArrowUp':
          if (onArrowUp) {
            event.preventDefault()
            onArrowUp()
          }
          break
        case 'ArrowDown':
          if (onArrowDown) {
            event.preventDefault()
            onArrowDown()
          }
          break
        case 'Enter':
          if (onEnter) {
            event.preventDefault()
            onEnter()
          }
          break
      }
    },
    [enabled, onEscape, onArrowUp, onArrowDown, onEnter]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
