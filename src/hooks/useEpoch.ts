'use client'

import { useEffect, useState } from 'react'

// MOCK stable SSR/CSR values, then live-update on mount.
const MOCK_EPOCH = 42
const MOCK_DURATION = 30 * 86400
const MOCK_START = Math.floor(new Date('2026-04-09T00:00:00Z').getTime() / 1000)
const INITIAL_ELAPSED = 12 * 86400
const INITIAL_COUNTDOWN = MOCK_DURATION - INITIAL_ELAPSED

export function useEpoch() {
  const [elapsed, setElapsed] = useState(INITIAL_ELAPSED)
  const [countdown, setCountdown] = useState(INITIAL_COUNTDOWN)

  useEffect(() => {
    const tick = () => {
      const now = Math.floor(Date.now() / 1000)
      setElapsed(Math.max(0, now - MOCK_START))
      setCountdown(Math.max(0, MOCK_START + MOCK_DURATION - now))
    }
    tick()
    const id = setInterval(() => {
      tick()
    }, 1_000)
    return () => clearInterval(id)
  }, [])

  const progress = Math.min(1, elapsed / MOCK_DURATION)

  const formatRemaining = (s: number) => {
    const d = Math.floor(s / 86400)
    const h = Math.floor((s % 86400) / 3600)
    const m = Math.floor((s % 3600) / 60)
    if (d > 0) return `${d}d ${h}h`
    if (h > 0) return `${h}h ${m}m`
    return `${m}m ${s % 60}s`
  }

  return {
    epoch: MOCK_EPOCH,
    startTime: MOCK_START,
    duration: MOCK_DURATION,
    elapsed,
    shouldAdvance: false,
    progress,
    countdown,
    countdownFormatted: formatRemaining(countdown),
    isLoading: false,
  }
}
