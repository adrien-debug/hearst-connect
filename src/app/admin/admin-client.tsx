'use client'

import { useState } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useVaultRegistry } from '@/hooks/useVaultRegistry'
import type { VaultConfig, VaultConfigInput } from '@/types/vault'
import { TOKENS, MONO, fmtUsd } from '@/components/connect/constants'
import { isAddress } from 'viem'

export function AdminClient() {
  const { isAuthenticated, isLoading: isAuthLoading, error, login, logout } = useAdminAuth()
  const [email, setEmail] = useState('admin@hearst.app')
  const [password, setPassword] = useState('hearst2024')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    await login(email, password)
    setIsLoggingIn(false)
  }

  if (isAuthLoading) {
    return (
      <AdminShell>
        <div style={styles.centered}>
          <div style={styles.spinner} />
        </div>
      </AdminShell>
    )
  }

  if (!isAuthenticated) {
    return (
      <AdminShell>
        <div style={styles.loginContainer}>
          <div style={styles.loginBox}>
            <div style={styles.logoSection}>
              <img src="/logos/hearst.svg" alt="Hearst" style={styles.logo} />
              <h1 style={styles.loginTitle}>Admin Access</h1>
              <p style={styles.loginSubtitle}>Vault configuration and management</p>
            </div>

            <form onSubmit={handleLogin} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email</label>
                <div style={{
                  ...styles.inputWrapper,
                  borderColor: focusedField === 'email' ? TOKENS.colors.accent : TOKENS.colors.borderSubtle,
                  boxShadow: focusedField === 'email' ? `0 0 0 1px ${TOKENS.colors.accent}40` : 'none',
                }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Password</label>
                <div style={{
                  ...styles.inputWrapper,
                  borderColor: focusedField === 'password' ? TOKENS.colors.accent : TOKENS.colors.borderSubtle,
                  boxShadow: focusedField === 'password' ? `0 0 0 1px ${TOKENS.colors.accent}40` : 'none',
                }}>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              {error && (
                <div style={styles.error}>{error}</div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                style={{
                  ...styles.loginButton,
                  opacity: isLoggingIn ? 0.7 : 1,
                  cursor: isLoggingIn ? 'wait' : 'pointer',
                }}
              >
                {isLoggingIn ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <div style={styles.backLink}>
              <a href="/app" style={styles.link}>← Back to App</a>
            </div>
          </div>
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminPanel
      onLogout={logout}
    />
  )
}

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const {
    vaults,
    hasVaults,
    isLoading,
    addVault,
    removeVault,
    updateVault,
    isAdding,
    isRemoving,
    isUpdating,
  } = useVaultRegistry()

  const [editingVault, setEditingVault] = useState<VaultConfig | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showDemoConfirm, setShowDemoConfirm] = useState(false)

  const handleEnterDemo = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hearst:app-mode', 'demo')
      window.location.href = '/app'
    }
  }

  const handleSave = async (data: VaultConfigInput) => {
    if (editingVault) {
      await updateVault({ vaultId: editingVault.id, updates: data })
      setEditingVault(null)
    } else {
      await addVault(data)
    }
    setShowForm(false)
  }

  const handleEdit = (vault: VaultConfig) => {
    setEditingVault(vault)
    setShowForm(true)
  }

  const handleDelete = async (vaultId: string) => {
    if (confirm('Are you sure you want to delete this vault?')) {
      await removeVault(vaultId)
    }
  }

  const handleCancel = () => {
    setEditingVault(null)
    setShowForm(false)
  }

  return (
    <div style={styles.adminContainer}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <a href="/app" style={styles.backToApp}>← Back to App</a>
          <h1 style={styles.headerTitle}>Admin</h1>
        </div>
        <div style={styles.headerRight}>
          {/* Demo Mode Entry - Admin Only */}
          {showDemoConfirm ? (
            <div style={styles.demoConfirm}>
              <span style={styles.demoConfirmText}>Enter demo mode?</span>
              <button onClick={handleEnterDemo} style={styles.demoConfirmYes}>Yes</button>
              <button onClick={() => setShowDemoConfirm(false)} style={styles.demoConfirmNo}>No</button>
            </div>
          ) : (
            <button
              onClick={() => setShowDemoConfirm(true)}
              style={styles.demoButton}
            >
              Demo Mode
            </button>
          )}
          <button
            onClick={onLogout}
            style={styles.logoutButton}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {showForm && (
          <VaultConfigForm
            initialData={editingVault}
            onSave={handleSave}
            onCancel={handleCancel}
            isSaving={isAdding || isUpdating}
          />
        )}

        {isLoading ? (
          <LoadingState />
        ) : !hasVaults ? (
          <EmptyState onAdd={() => setShowForm(true)} />
        ) : (
          <VaultList
            vaults={vaults}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeleting={isRemoving}
          />
        )}
      </main>
    </div>
  )
}

function VaultConfigForm({
  initialData,
  onSave,
  onCancel,
  isSaving,
}: {
  initialData: VaultConfig | null
  onSave: (data: VaultConfigInput) => void
  onCancel: () => void
  isSaving: boolean
}) {
  const [formData, setFormData] = useState<VaultConfigInput>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    vaultAddress: (initialData?.vaultAddress || '0x0000000000000000000000000000000000000000') as `0x${string}`,
    usdcAddress: (initialData?.usdcAddress || '0x0000000000000000000000000000000000000000') as `0x${string}`,
    chain: initialData?.chain || { id: 8453, name: 'Base', nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: [''] } } } as const,
    apr: initialData?.apr || 12,
    target: initialData?.target || '36%',
    lockPeriodDays: initialData?.lockPeriodDays || 1095,
    minDeposit: initialData?.minDeposit || 500000,
    strategy: initialData?.strategy || 'RWA Mining · USDC Yield · BTC Hedged',
    fees: initialData?.fees || '1.5% Mgmt · 15% Perf',
    risk: initialData?.risk || 'Moderate',
    image: initialData?.image || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.vaultAddress) {
      newErrors.vaultAddress = 'Vault address is required'
    } else if (!isAddress(formData.vaultAddress)) {
      newErrors.vaultAddress = 'Invalid Ethereum address'
    }

    if (!formData.usdcAddress) {
      newErrors.usdcAddress = 'USDC address is required'
    } else if (!isAddress(formData.usdcAddress)) {
      newErrors.usdcAddress = 'Invalid Ethereum address'
    }

    if (formData.apr <= 0) {
      newErrors.apr = 'APR must be positive'
    }

    if (formData.minDeposit < 0) {
      newErrors.minDeposit = 'Minimum deposit cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSave(formData)
    }
  }

  const updateField = <K extends keyof VaultConfigInput>(
    field: K,
    value: VaultConfigInput[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div style={styles.formContainer}>
      <h2 style={styles.formTitle}>
        {initialData ? 'Edit Vault' : 'Create New Vault'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={styles.formGrid}>
          <FormField
            label="Name"
            value={formData.name}
            onChange={(v) => updateField('name', v)}
            error={errors.name}
            placeholder="e.g., HashVault Prime #1"
            required
          />

          <FormField
            label="Description"
            value={formData.description || ''}
            onChange={(v) => updateField('description', v)}
            placeholder="Optional description"
          />

          <FormField
            label="Vault Contract Address"
            value={formData.vaultAddress}
            onChange={(v) => updateField('vaultAddress', v as `0x${string}`)}
            error={errors.vaultAddress}
            placeholder="0x..."
            required
          />

          <FormField
            label="USDC Contract Address"
            value={formData.usdcAddress}
            onChange={(v) => updateField('usdcAddress', v as `0x${string}`)}
            error={errors.usdcAddress}
            placeholder="0x..."
            required
          />

          <FormField
            label="APR (%)"
            type="number"
            value={String(formData.apr)}
            onChange={(v) => updateField('apr', parseFloat(v) || 0)}
            error={errors.apr}
            required
          />

          <FormField
            label="Target Yield"
            value={formData.target}
            onChange={(v) => updateField('target', v)}
            placeholder="e.g., 36%"
            required
          />

          <FormField
            label="Lock Period (Days)"
            type="number"
            value={String(formData.lockPeriodDays)}
            onChange={(v) => updateField('lockPeriodDays', parseInt(v) || 0)}
            required
          />

          <FormField
            label="Minimum Deposit"
            type="number"
            value={String(formData.minDeposit)}
            onChange={(v) => updateField('minDeposit', parseFloat(v) || 0)}
            error={errors.minDeposit}
            placeholder="500000"
            required
          />

          <FormField
            label="Strategy"
            value={formData.strategy}
            onChange={(v) => updateField('strategy', v)}
            placeholder="e.g., RWA Mining · USDC Yield"
          />

          <FormField
            label="Fees"
            value={formData.fees}
            onChange={(v) => updateField('fees', v)}
            placeholder="e.g., 1.5% Mgmt · 15% Perf"
          />

          <FormField
            label="Risk Level"
            value={formData.risk}
            onChange={(v) => updateField('risk', v)}
            placeholder="e.g., Moderate, High, Low"
          />

          <FormField
            label="Image URL"
            value={formData.image || ''}
            onChange={(v) => updateField('image', v)}
            placeholder="https://..."
          />
        </div>

        <div style={styles.formActions}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            style={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            style={{
              ...styles.saveButton,
              opacity: isSaving ? 0.7 : 1,
              cursor: isSaving ? 'wait' : 'pointer',
            }}
          >
            {isSaving ? 'Saving...' : initialData ? 'Update Vault' : 'Create Vault'}
          </button>
        </div>
      </form>
    </div>
  )
}

function FormField({
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  required,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  type?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <div style={styles.field}>
      <label style={styles.fieldLabel}>
        {label}
        {required && <span style={styles.required}> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          ...styles.fieldInput,
          borderColor: error ? TOKENS.colors.danger : TOKENS.colors.borderSubtle,
        }}
      />
      {error && (
        <span style={styles.fieldError}>{error}</span>
      )}
    </div>
  )
}

function VaultList({
  vaults,
  onEdit,
  onDelete,
  isDeleting,
}: {
  vaults: VaultConfig[]
  onEdit: (vault: VaultConfig) => void
  onDelete: (vaultId: string) => void
  isDeleting: boolean
}) {
  return (
    <div>
      <h3 style={styles.listTitle}>Configured Vaults ({vaults.length})</h3>

      <div style={styles.vaultList}>
        {vaults.map((vault) => (
          <VaultCard
            key={vault.id}
            vault={vault}
            onEdit={() => onEdit(vault)}
            onDelete={() => onDelete(vault.id)}
            isDeleting={isDeleting}
          />
        ))}
      </div>
    </div>
  )
}

function VaultCard({
  vault,
  onEdit,
  onDelete,
  isDeleting,
}: {
  vault: VaultConfig
  onEdit: () => void
  onDelete: () => void
  isDeleting: boolean
}) {
  return (
    <div style={styles.vaultCard}>
      <div style={styles.vaultCardLeft}>
        {vault.image && (
          <img src={vault.image} alt={vault.name} style={styles.vaultImage} />
        )}
        <div>
          <h4 style={styles.vaultName}>{vault.name}</h4>
          <div style={styles.vaultMeta}>
            <span>{vault.apr}% APR</span>
            <span>·</span>
            <span>Target: {vault.target}</span>
            <span>·</span>
            <span>Min: {fmtUsd(vault.minDeposit)}</span>
          </div>
          <div style={styles.vaultAddress}>
            {vault.vaultAddress.slice(0, 8)}...{vault.vaultAddress.slice(-6)}
          </div>
        </div>
      </div>

      <div style={styles.vaultActions}>
        <button onClick={onEdit} style={styles.editButton}>Edit</button>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          style={{
            ...styles.deleteButton,
            opacity: isDeleting ? 0.5 : 1,
          }}
        >
          {isDeleting ? '...' : 'Delete'}
        </button>
      </div>
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={styles.emptyState}>
      <div style={styles.emptyIcon}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 style={styles.emptyTitle}>No Vaults Configured</h3>
      <p style={styles.emptyText}>Create your first vault to enable deposits and yield generation in the app.</p>
      <button onClick={onAdd} style={styles.emptyButton}>Create First Vault</button>
    </div>
  )
}

function LoadingState() {
  return (
    <div style={styles.loadingState}>
      <div style={styles.spinner} />
    </div>
  )
}

function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={styles.shell}>
      {children}
    </div>
  )
}

// Styles
const styles: Record<string, React.CSSProperties> = {
  shell: {
    minHeight: '100vh',
    background: TOKENS.colors.bgApp,
    color: TOKENS.colors.textPrimary,
    fontFamily: TOKENS.fonts.sans,
  },
  centered: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
  },
  spinner: {
    width: TOKENS.spacing[10],
    height: TOKENS.spacing[10],
    border: `3px solid ${TOKENS.colors.bgTertiary}`,
    borderTopColor: TOKENS.colors.accent,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loginContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: TOKENS.spacing[6],
  },
  loginBox: {
    width: '100%',
    maxWidth: '400px',
    background: TOKENS.colors.bgSidebar,
    border: `1px solid ${TOKENS.colors.borderSubtle}`,
    borderRadius: TOKENS.radius.lg,
    padding: `${TOKENS.spacing[8]}px`,
    boxSizing: 'border-box',
  },
  logoSection: {
    textAlign: 'center',
    marginBottom: TOKENS.spacing[6],
  },
  logo: {
    height: TOKENS.spacing[10],
    marginBottom: TOKENS.spacing[4],
  },
  loginTitle: {
    fontSize: TOKENS.fontSizes.xl,
    fontWeight: TOKENS.fontWeights.black,
    textTransform: 'uppercase',
    margin: `0 0 ${TOKENS.spacing[2]}px 0`,
  },
  loginSubtitle: {
    fontSize: TOKENS.fontSizes.sm,
    color: TOKENS.colors.textSecondary,
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${TOKENS.spacing[4]}px`,
    width: '100%',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${TOKENS.spacing[2]}px`,
    width: '100%',
  },
  label: {
    fontSize: TOKENS.fontSizes.xs,
    fontWeight: TOKENS.fontWeights.bold,
    textTransform: 'uppercase',
    letterSpacing: TOKENS.letterSpacing.normal,
    color: TOKENS.colors.textSecondary,
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    background: TOKENS.colors.bgTertiary,
    border: `1px solid ${TOKENS.colors.borderSubtle}`,
    borderRadius: TOKENS.radius.md,
    transition: 'all 0.15s ease-out',
    height: '48px',
  },
  input: {
    flex: 1,
    width: '100%',
    height: '100%',
    padding: `0 ${TOKENS.spacing[4]}px`,
    background: 'transparent',
    border: 'none',
    color: TOKENS.colors.textPrimary,
    fontSize: TOKENS.fontSizes.sm,
    outline: 'none',
    fontFamily: TOKENS.fonts.sans,
  },
  error: {
    padding: TOKENS.spacing[3],
    background: `${TOKENS.colors.danger}1A`,
    border: `1px solid ${TOKENS.colors.danger}4D`,
    borderRadius: TOKENS.radius.md,
    color: TOKENS.colors.danger,
    fontSize: TOKENS.fontSizes.sm,
  },
  loginButton: {
    padding: `${TOKENS.spacing[3]}px ${TOKENS.spacing[6]}px`,
    background: TOKENS.colors.accent,
    color: TOKENS.colors.black,
    border: 'none',
    borderRadius: TOKENS.radius.md,
    fontSize: TOKENS.fontSizes.sm,
    fontWeight: TOKENS.fontWeights.bold,
    textTransform: 'uppercase',
    letterSpacing: TOKENS.letterSpacing.normal,
    marginTop: TOKENS.spacing[2],
  },
  backLink: {
    textAlign: 'center',
    marginTop: TOKENS.spacing[4],
  },
  link: {
    color: TOKENS.colors.textSecondary,
    fontSize: TOKENS.fontSizes.sm,
    textDecoration: 'none',
  },
  adminContainer: {
    minHeight: '100vh',
    background: TOKENS.colors.bgApp,
    color: TOKENS.colors.textPrimary,
    fontFamily: TOKENS.fonts.sans,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${TOKENS.spacing[4]}px ${TOKENS.spacing[6]}px`,
    borderBottom: `1px solid ${TOKENS.colors.borderSubtle}`,
    background: TOKENS.colors.bgSidebar,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: TOKENS.spacing[4],
  },
  backToApp: {
    display: 'flex',
    alignItems: 'center',
    gap: TOKENS.spacing[2],
    color: TOKENS.colors.textSecondary,
    textDecoration: 'none',
    fontSize: TOKENS.fontSizes.sm,
    fontWeight: TOKENS.fontWeights.bold,
    textTransform: 'uppercase',
    letterSpacing: TOKENS.letterSpacing.normal,
  },
  headerTitle: {
    fontSize: TOKENS.fontSizes.xl,
    fontWeight: TOKENS.fontWeights.black,
    textTransform: 'uppercase',
    letterSpacing: TOKENS.letterSpacing.normal,
    margin: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: TOKENS.spacing[3],
  },
  demoButton: {
    padding: `${TOKENS.spacing[2]}px ${TOKENS.spacing[4]}px`,
    background: 'transparent',
    border: `1px solid ${TOKENS.colors.accent}`,
    borderRadius: TOKENS.radius.md,
    color: TOKENS.colors.accent,
    fontSize: TOKENS.fontSizes.xs,
    fontWeight: TOKENS.fontWeights.bold,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: TOKENS.letterSpacing.normal,
  },
  demoConfirm: {
    display: 'flex',
    alignItems: 'center',
    gap: TOKENS.spacing[2],
  },
  demoConfirmText: {
    fontSize: TOKENS.fontSizes.xs,
    color: TOKENS.colors.textSecondary,
  },
  demoConfirmYes: {
    padding: `${TOKENS.spacing[2]}px ${TOKENS.spacing[3]}px`,
    background: TOKENS.colors.accent,
    border: 'none',
    borderRadius: TOKENS.radius.sm,
    color: TOKENS.colors.black,
    fontSize: TOKENS.fontSizes.xs,
    fontWeight: TOKENS.fontWeights.bold,
    cursor: 'pointer',
  },
  demoConfirmNo: {
    padding: `${TOKENS.spacing[2]}px ${TOKENS.spacing[3]}px`,
    background: 'transparent',
    border: `1px solid ${TOKENS.colors.borderSubtle}`,
    borderRadius: TOKENS.radius.sm,
    color: TOKENS.colors.textSecondary,
    fontSize: TOKENS.fontSizes.xs,
    cursor: 'pointer',
  },
  logoutButton: {
    padding: `${TOKENS.spacing[2]}px ${TOKENS.spacing[4]}px`,
    background: 'transparent',
    border: `1px solid ${TOKENS.colors.borderSubtle}`,
    borderRadius: TOKENS.radius.md,
    color: TOKENS.colors.textSecondary,
    fontSize: TOKENS.fontSizes.xs,
    fontWeight: TOKENS.fontWeights.bold,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: TOKENS.letterSpacing.normal,
  },
  main: {
    padding: TOKENS.spacing[6],
  },
  formContainer: {
    background: TOKENS.colors.bgSidebar,
    border: `1px solid ${TOKENS.colors.borderSubtle}`,
    borderRadius: TOKENS.radius.lg,
    padding: TOKENS.spacing[6],
    marginBottom: TOKENS.spacing[6],
  },
  formTitle: {
    fontSize: TOKENS.fontSizes.lg,
    fontWeight: TOKENS.fontWeights.black,
    textTransform: 'uppercase',
    margin: `0 0 ${TOKENS.spacing[4]}px 0`,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: TOKENS.spacing[4],
  },
  formActions: {
    display: 'flex',
    gap: TOKENS.spacing[3],
    marginTop: TOKENS.spacing[6],
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: `${TOKENS.spacing[2]}px ${TOKENS.spacing[4]}px`,
    background: 'transparent',
    border: `1px solid ${TOKENS.colors.borderSubtle}`,
    borderRadius: TOKENS.radius.md,
    color: TOKENS.colors.textSecondary,
    fontSize: TOKENS.fontSizes.sm,
    fontWeight: TOKENS.fontWeights.bold,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: TOKENS.letterSpacing.normal,
  },
  saveButton: {
    padding: `${TOKENS.spacing[2]}px ${TOKENS.spacing[4]}px`,
    background: TOKENS.colors.accent,
    border: 'none',
    borderRadius: TOKENS.radius.md,
    color: TOKENS.colors.black,
    fontSize: TOKENS.fontSizes.sm,
    fontWeight: TOKENS.fontWeights.bold,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: TOKENS.letterSpacing.normal,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: TOKENS.spacing[2],
  },
  fieldLabel: {
    fontSize: TOKENS.fontSizes.xs,
    fontWeight: TOKENS.fontWeights.bold,
    textTransform: 'uppercase',
    letterSpacing: TOKENS.letterSpacing.normal,
    color: TOKENS.colors.textSecondary,
  },
  required: {
    color: TOKENS.colors.accent,
  },
  fieldInput: {
    padding: `${TOKENS.spacing[2]}px ${TOKENS.spacing[3]}px`,
    background: TOKENS.colors.bgTertiary,
    border: `1px solid ${TOKENS.colors.borderSubtle}`,
    borderRadius: TOKENS.radius.md,
    color: TOKENS.colors.textPrimary,
    fontSize: TOKENS.fontSizes.sm,
    fontFamily: 'inherit',
    outline: 'none',
  },
  fieldError: {
    fontSize: TOKENS.fontSizes.xs,
    color: TOKENS.colors.danger,
  },
  listTitle: {
    fontSize: TOKENS.fontSizes.md,
    fontWeight: TOKENS.fontWeights.black,
    textTransform: 'uppercase',
    margin: `0 0 ${TOKENS.spacing[4]}px 0`,
  },
  vaultList: {
    display: 'flex',
    flexDirection: 'column',
    gap: TOKENS.spacing[3],
  },
  vaultCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: TOKENS.spacing[4],
    background: TOKENS.colors.bgSidebar,
    border: `1px solid ${TOKENS.colors.borderSubtle}`,
    borderRadius: TOKENS.radius.lg,
  },
  vaultCardLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: TOKENS.spacing[4],
  },
  vaultImage: {
    width: TOKENS.spacing[12],
    height: TOKENS.spacing[12],
    borderRadius: TOKENS.radius.md,
    objectFit: 'cover',
  },
  vaultName: {
    fontSize: TOKENS.fontSizes.md,
    fontWeight: TOKENS.fontWeights.bold,
    margin: `0 0 ${TOKENS.spacing[2]}px 0`,
  },
  vaultMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: TOKENS.spacing[3],
    fontSize: TOKENS.fontSizes.xs,
    color: TOKENS.colors.textSecondary,
    fontFamily: MONO,
  },
  vaultAddress: {
    marginTop: TOKENS.spacing[2],
    fontSize: TOKENS.fontSizes.micro,
    color: TOKENS.colors.textGhost,
    fontFamily: MONO,
  },
  vaultActions: {
    display: 'flex',
    gap: TOKENS.spacing[2],
  },
  editButton: {
    padding: `${TOKENS.spacing[2]}px ${TOKENS.spacing[3]}px`,
    background: 'transparent',
    border: `1px solid ${TOKENS.colors.borderSubtle}`,
    borderRadius: TOKENS.radius.md,
    color: TOKENS.colors.textSecondary,
    fontSize: TOKENS.fontSizes.xs,
    fontWeight: TOKENS.fontWeights.bold,
    cursor: 'pointer',
    textTransform: 'uppercase',
  },
  deleteButton: {
    padding: `${TOKENS.spacing[2]}px ${TOKENS.spacing[3]}px`,
    background: 'transparent',
    border: `1px solid ${TOKENS.colors.danger}`,
    borderRadius: TOKENS.radius.md,
    color: TOKENS.colors.danger,
    fontSize: TOKENS.fontSizes.xs,
    fontWeight: TOKENS.fontWeights.bold,
    cursor: 'pointer',
    textTransform: 'uppercase',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${TOKENS.spacing[12]}px`,
    textAlign: 'center',
  },
  emptyIcon: {
    width: TOKENS.spacing[16],
    height: TOKENS.spacing[16],
    borderRadius: '50%',
    background: TOKENS.colors.bgTertiary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: TOKENS.spacing[4],
    color: TOKENS.colors.textSecondary,
  },
  emptyTitle: {
    fontSize: TOKENS.fontSizes.lg,
    fontWeight: TOKENS.fontWeights.bold,
    margin: `0 0 ${TOKENS.spacing[2]}px 0`,
  },
  emptyText: {
    fontSize: TOKENS.fontSizes.sm,
    color: TOKENS.colors.textSecondary,
    margin: `0 0 ${TOKENS.spacing[4]}px 0`,
    maxWidth: '400px',
  },
  emptyButton: {
    padding: `${TOKENS.spacing[3]}px ${TOKENS.spacing[6]}px`,
    background: TOKENS.colors.accent,
    color: TOKENS.colors.black,
    border: 'none',
    borderRadius: TOKENS.radius.md,
    fontSize: TOKENS.fontSizes.sm,
    fontWeight: TOKENS.fontWeights.bold,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: TOKENS.letterSpacing.normal,
  },
  loadingState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: TOKENS.spacing[12],
  },
}
