'use client'

import { useState } from 'react'

export function SettingsSection() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    allowNewDeposits: true,
    enableAnalytics: true,
    sessionTimeout: 24,
  })

  return (
    <div className="settings-container">
      <div className="status-card">
        <div className="status-header">
          <h3 className="status-title">System Status</h3>
          <div className="status-badge">
            <span className="status-dot" />
            Operational
          </div>
        </div>
        <div className="status-grid">
          <StatusItem label="API" value="Connected" status="good" />
          <StatusItem label="Database" value="Synced" status="good" />
          <StatusItem label="Web3 Provider" value="Base Mainnet" status="good" />
          <StatusItem label="Last Sync" value="2 min ago" status="neutral" />
        </div>
      </div>

      <div className="admin-card">
        <h3 className="admin-card-title">Configuration</h3>
        <div className="settings-list">
          <ToggleSetting
            label="Maintenance Mode"
            description="Disable all user interactions"
            checked={settings.maintenanceMode}
            onChange={(v) => setSettings((s) => ({ ...s, maintenanceMode: v }))}
          />
          <ToggleSetting
            label="Allow New Deposits"
            description="Enable deposit functionality"
            checked={settings.allowNewDeposits}
            onChange={(v) => setSettings((s) => ({ ...s, allowNewDeposits: v }))}
          />
          <ToggleSetting
            label="Enable Analytics"
            description="Track user activity"
            checked={settings.enableAnalytics}
            onChange={(v) => setSettings((s) => ({ ...s, enableAnalytics: v }))}
          />
        </div>
      </div>

      <div className="admin-card">
        <h3 className="admin-card-title">Admin Credentials</h3>
        <div className="creds-list">
          <div className="cred-item">
            <span className="cred-label">Email</span>
            <code className="cred-value">admin@hearst.app</code>
          </div>
          <div className="cred-item">
            <span className="cred-label">Password Hash</span>
            <code className="cred-value">SHA-256 (hidden)</code>
          </div>
          <div className="cred-item">
            <span className="cred-label">Session Duration</span>
            <span className="cred-value">{settings.sessionTimeout} hours</span>
          </div>
        </div>
      </div>

    </div>
  )
}

function StatusItem({
  label,
  value,
  status,
}: {
  label: string
  value: string
  status: 'good' | 'warning' | 'error' | 'neutral'
}) {
  return (
    <div className="status-item">
      <span className="status-item-label">{label}</span>
      <span className={`status-item-value status-item-value-${status}`}>{value}</span>
    </div>
  )
}

function ToggleSetting({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="setting-row">
      <div className="setting-info">
        <span className="setting-label">{label}</span>
        <span className="setting-desc">{description}</span>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`toggle ${checked ? 'toggle-active' : 'toggle-inactive'}`}
      >
        <span className={`toggle-knob ${checked ? 'toggle-knob-active' : 'toggle-knob-inactive'}`} />
      </button>
    </div>
  )
}
