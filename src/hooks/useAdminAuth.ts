'use client'

import { useState, useEffect, useCallback } from 'react'

// Simple admin credentials - in production, this should be server-side
const ADMIN_EMAIL = 'admin@hearst.app'
const ADMIN_PASSWORD_HASH = 'c7ad44cbad762a5da0a452f9e854fdc1e0e7a52a38015f23f3eab1d80b931dd472634dfac71cd56e9037000a879104bd9b1e9e5c6c5c6c6c6c6c6c6c6c6c6c' // "hearst2024"

interface AdminSession {
  email: string
  timestamp: number
}

const SESSION_KEY = 'hearst:admin-session'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

// Simple SHA-256 hash (client-side only - for demo purposes)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = () => {
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    try {
      const saved = localStorage.getItem(SESSION_KEY)
      if (!saved) {
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      const session: AdminSession = JSON.parse(saved)
      const now = Date.now()

      if (now - session.timestamp > SESSION_DURATION) {
        localStorage.removeItem(SESSION_KEY)
        setIsAuthenticated(false)
      } else {
        setIsAuthenticated(true)
      }
    } catch {
      localStorage.removeItem(SESSION_KEY)
      setIsAuthenticated(false)
    }
    setIsLoading(false)
  }

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setError(null)

    if (email !== ADMIN_EMAIL) {
      setError('Invalid credentials')
      return false
    }

    const hashed = await hashPassword(password)
    if (hashed !== ADMIN_PASSWORD_HASH) {
      setError('Invalid credentials')
      return false
    }

    const session: AdminSession = {
      email,
      timestamp: Date.now(),
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setIsAuthenticated(true)
    return true
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setIsAuthenticated(false)
    setError(null)
  }, [])

  return {
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
  }
}
