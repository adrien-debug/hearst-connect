/**
 * Centralized storage keys for localStorage
 * All keys must be defined here to avoid collisions and enable easy auditing
 */

export const STORAGE_KEYS = {
  // App mode
  APP_MODE: 'hearst:app-mode',

  // Admin
  ADMIN_SESSION: 'hearst:admin-session',

  // Vault
  VAULT_REGISTRY: 'hearst:vault-registry',

  // Demo
  DEMO_PORTFOLIO: 'hearst:demo-portfolio-v3',
} as const

// Type for validation
export type StorageKey = keyof typeof STORAGE_KEYS
