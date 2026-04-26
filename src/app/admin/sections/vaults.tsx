'use client'

import { useState } from 'react'
import { useVaultRegistry } from '@/hooks/useVaultRegistry'
import { fmtUsd } from '../constants'
import { isAddress } from 'viem'
import type { VaultConfig, VaultConfigInput } from '@/types/vault'

export function VaultsSection() {
  const {
    vaults,
    isLoading,
    addVault,
    removeVault,
    updateVault,
    isAdding,
    isRemoving,
    isUpdating,
  } = useVaultRegistry()

  const [showForm, setShowForm] = useState(false)
  const [editingVault, setEditingVault] = useState<VaultConfig | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredVaults = vaults.filter((v) =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

  return (
    <div className="vaults-container">
      <div className="vaults-toolbar">
        <div className="vaults-search-box">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search vaults..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="vaults-search-input"
          />
        </div>
        <button
          onClick={() => {
            setEditingVault(null)
            setShowForm(true)
          }}
          className="vaults-add-button"
        >
          <PlusIcon />
          Create Vault
        </button>
      </div>

      {showForm && (
        <VaultFormModal
          initialData={editingVault}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingVault(null)
          }}
          isSaving={isAdding || isUpdating}
        />
      )}

      <div className="vaults-table-card">
        {isLoading ? (
          <LoadingState />
        ) : filteredVaults.length === 0 ? (
          <EmptyState onCreate={() => setShowForm(true)} />
        ) : (
          <div className="vaults-table">
            <div className="vaults-table-header">
              <span className="vaults-th">Vault</span>
              <span className="vaults-th">Contract</span>
              <span className="vaults-th">APR</span>
              <span className="vaults-th">Target</span>
              <span className="vaults-th">Min Deposit</span>
              <span className="vaults-th">Lock</span>
              <span className="vaults-th">Actions</span>
            </div>
            <div className="vaults-table-body">
              {filteredVaults.map((vault) => (
                <VaultRow
                  key={vault.id}
                  vault={vault}
                  onEdit={() => handleEdit(vault)}
                  onDelete={() => handleDelete(vault.id)}
                  isDeleting={isRemoving}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="vaults-footer-stats">
        <span className="vaults-footer-stat">
          Total: <strong>{vaults.length}</strong> vaults
        </span>
        <span className="vaults-footer-stat">
          Active: <strong>{vaults.filter((v) => v.isActive !== false).length}</strong>
        </span>
        <span className="vaults-footer-stat">
          Avg APR: <strong>{vaults.length > 0 ? (vaults.reduce((s, v) => s + v.apr, 0) / vaults.length).toFixed(1) : 0}%</strong>
        </span>
      </div>
    </div>
  )
}

function VaultRow({
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
    <div className="vaults-table-row">
      <div className="vaults-td-vault">
        {vault.image && <img src={vault.image} alt="" className="vaults-vault-image" />}
        <div>
          <span className="vaults-vault-name">{vault.name}</span>
          <span className="vaults-vault-strategy">{vault.strategy}</span>
        </div>
      </div>
      <span className="vaults-td-mono">
        {vault.vaultAddress.slice(0, 6)}...{vault.vaultAddress.slice(-4)}
      </span>
      <span className="vaults-td-apr">{vault.apr}%</span>
      <span className="vaults-td">{vault.target}</span>
      <span className="vaults-td">{fmtUsd(vault.minDeposit)}</span>
      <span className="vaults-td">{vault.lockPeriodDays} days</span>
      <div className="vaults-td-actions">
        <button onClick={onEdit} className="vaults-action-btn">Edit</button>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="vaults-action-btn vaults-delete-btn"
        >
          {isDeleting ? '...' : 'Delete'}
        </button>
      </div>
    </div>
  )
}

function VaultFormModal({
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
    vaultAddress: (initialData?.vaultAddress || '') as `0x${string}`,
    usdcAddress: (initialData?.usdcAddress || '') as `0x${string}`,
    chain: initialData?.chain || {
      id: 8453,
      name: 'Base',
      nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: [''] } },
    } as const,
    apr: initialData?.apr || 12,
    target: initialData?.target || '36%',
    lockPeriodDays: initialData?.lockPeriodDays || 1095,
    minDeposit: initialData?.minDeposit || 500000,
    strategy: initialData?.strategy || '',
    fees: initialData?.fees || '',
    risk: initialData?.risk || 'Moderate',
    image: initialData?.image || '',
    isTest: initialData?.isTest ?? false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Required'
    if (!formData.vaultAddress || !isAddress(formData.vaultAddress)) {
      newErrors.vaultAddress = 'Valid address required'
    }
    if (!formData.usdcAddress || !isAddress(formData.usdcAddress)) {
      newErrors.usdcAddress = 'Valid address required'
    }
    if (formData.apr <= 0) newErrors.apr = 'Must be positive'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) onSave(formData)
  }

  return (
    <div className="vaults-modal-overlay">
      <div className="vaults-modal">
        <div className="vaults-modal-header">
          <h2 className="vaults-modal-title">
            {initialData ? 'Edit Vault' : 'Create New Vault'}
          </h2>
          <button onClick={onCancel} className="vaults-close-btn">×</button>
        </div>

        <form onSubmit={handleSubmit} className="vaults-form">
          <div className="vaults-form-grid">
            <FormField
              label="Name *"
              value={formData.name}
              onChange={(v) => setFormData((p) => ({ ...p, name: v }))}
              error={errors.name}
              placeholder="e.g., Prime Yield Vault"
            />
            <FormField
              label="Description"
              value={formData.description || ''}
              onChange={(v) => setFormData((p) => ({ ...p, description: v }))}
              placeholder="Short description..."
            />
            <FormField
              label="Vault Address *"
              value={formData.vaultAddress}
              onChange={(v) => setFormData((p) => ({ ...p, vaultAddress: v as `0x${string}` }))}
              error={errors.vaultAddress}
              placeholder="0x..."
            />
            <FormField
              label="USDC Address *"
              value={formData.usdcAddress}
              onChange={(v) => setFormData((p) => ({ ...p, usdcAddress: v as `0x${string}` }))}
              error={errors.usdcAddress}
              placeholder="0x..."
            />
            <FormField
              label="APR (%) *"
              type="number"
              value={String(formData.apr)}
              onChange={(v) => setFormData((p) => ({ ...p, apr: parseFloat(v) || 0 }))}
              error={errors.apr}
            />
            <FormField
              label="Target Yield"
              value={formData.target}
              onChange={(v) => setFormData((p) => ({ ...p, target: v }))}
              placeholder="e.g., 36%"
            />
            <FormField
              label="Lock Period (Days)"
              type="number"
              value={String(formData.lockPeriodDays)}
              onChange={(v) => setFormData((p) => ({ ...p, lockPeriodDays: parseInt(v) || 0 }))}
            />
            <FormField
              label="Min Deposit (USDC)"
              type="number"
              value={String(formData.minDeposit)}
              onChange={(v) => setFormData((p) => ({ ...p, minDeposit: parseFloat(v) || 0 }))}
            />
            <FormField
              label="Strategy"
              value={formData.strategy || ''}
              onChange={(v) => setFormData((p) => ({ ...p, strategy: v }))}
              placeholder="e.g., RWA Mining"
            />
            <FormField
              label="Fees"
              value={formData.fees || ''}
              onChange={(v) => setFormData((p) => ({ ...p, fees: v }))}
              placeholder="e.g., 1.5% Mgmt"
            />
            <FormField
              label="Risk Level"
              value={formData.risk || ''}
              onChange={(v) => setFormData((p) => ({ ...p, risk: v }))}
              placeholder="e.g., Moderate"
            />
            <FormField
              label="Image URL"
              value={formData.image || ''}
              onChange={(v) => setFormData((p) => ({ ...p, image: v }))}
              placeholder="https://..."
            />
          </div>

          <div className="vaults-form-actions">
            <button type="button" onClick={onCancel} className="vaults-cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="vaults-save-btn">
              {isSaving ? 'Saving...' : initialData ? 'Update Vault' : 'Create Vault'}
            </button>
          </div>
        </form>
      </div>
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
}: {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  type?: string
  placeholder?: string
}) {
  return (
    <div className="vaults-field">
      <label className="vaults-field-label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`vaults-field-input ${error ? 'error' : ''}`}
      />
      {error && <span className="vaults-field-error">{error}</span>}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="vaults-loading-state">
      <div className="admin-spinner" />
    </div>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="vaults-empty-state">
      <p className="vaults-empty-text">No vaults configured yet</p>
      <button onClick={onCreate} className="vaults-empty-btn">Create First Vault</button>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
