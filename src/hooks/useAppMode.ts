'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'hearst:app-mode'

export function useAppMode() {
  const [mode, setMode] = useState<'demo' | 'live'>('demo')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'demo' || saved === 'live') {
      setMode(saved)
    }
  }, [])

  const setAppMode = useCallback((newMode: 'demo' | 'live') => {
    setMode(newMode)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newMode)
      // Force reload to apply changes
      window.location.reload()
    }
  }, [])

  const toggleMode = useCallback(() => {
    const newMode = mode === 'demo' ? 'live' : 'demo'
    setAppMode(newMode)
  }, [mode, setAppMode])

  return {
    mode,
    isDemo: mode === 'demo',
    isLive: mode === 'live',
    setMode: setAppMode,
    toggleMode,
  }
}
