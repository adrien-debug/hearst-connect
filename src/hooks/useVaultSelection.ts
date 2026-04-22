'use client'

import { useState, useCallback } from 'react'
import type { VaultLine, ActiveVault, AvailableVault } from '@/components/connect/data'

interface UseVaultSelectionOptions {
  vaults: VaultLine[]
  onSelect: (id: string | null) => void
}

export function useVaultSelection({ vaults, onSelect }: UseVaultSelectionOptions) {
  const activeVaults = vaults.filter((v): v is ActiveVault => v.type === 'active')
  const availableVaults = vaults.filter((v): v is AvailableVault => v.type === 'available')
  const allSelectable = [...activeVaults, ...availableVaults]

  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const handleArrowUp = useCallback(() => {
    setHighlightedIndex((prev) => {
      const newIndex = prev <= 0 ? allSelectable.length - 1 : prev - 1
      return newIndex
    })
  }, [allSelectable.length])

  const handleArrowDown = useCallback(() => {
    setHighlightedIndex((prev) => {
      const newIndex = prev >= allSelectable.length - 1 ? 0 : prev + 1
      return newIndex
    })
  }, [allSelectable.length])

  const handleEnter = useCallback(() => {
    if (highlightedIndex >= 0 && highlightedIndex < allSelectable.length) {
      onSelect(allSelectable[highlightedIndex].id)
    }
  }, [highlightedIndex, allSelectable, onSelect])

  const handleEscape = useCallback(() => {
    onSelect(null)
    setHighlightedIndex(-1)
  }, [onSelect])

  const isHighlighted = useCallback(
    (id: string) => {
      const index = allSelectable.findIndex((v) => v.id === id)
      return index === highlightedIndex
    },
    [allSelectable, highlightedIndex]
  )

  return {
    highlightedIndex,
    isHighlighted,
    handlers: {
      onArrowUp: handleArrowUp,
      onArrowDown: handleArrowDown,
      onEnter: handleEnter,
      onEscape: handleEscape,
    },
  }
}
