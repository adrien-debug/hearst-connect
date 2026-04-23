'use client'

import '@/styles/connect/dashboard-vars.css'
import { useConnectRouting } from './use-connect-routing'
import { TOKENS, MONO } from './constants'
import { PortfolioSummary } from './portfolio-summary'
import { VaultDetailPanel } from './vault-detail-panel'
import { SubscribePanel } from './subscribe-panel'
import { SimulationPanel } from './simulation-panel'
import { AvailableVaultsPanel } from './available-vaults-panel'
import type { VaultLine, Aggregate, AvailableVault } from './data'
import { SIMULATION_VIEW_ID, AVAILABLE_VAULTS_VIEW_ID } from './view-ids'
import { DockRadial } from './dock-radial'

const WALLET = '0x5F…AA57'
const ON_DARK_GHOST = 'rgba(255,255,255,0.35)'

export function Canvas() {
  const { vaults, agg, selectedId, setSelectedId, selected, isSimulation } = useConnectRouting()
  const isAvailableVaultsList = selectedId === AVAILABLE_VAULTS_VIEW_ID
  const panelKey = isSimulation ? SIMULATION_VIEW_ID : isAvailableVaultsList ? AVAILABLE_VAULTS_VIEW_ID : selected?.id ?? 'portfolio'

  const handleSelect = (id: string | null) => {
    setSelectedId(id)
  }

  const availableVaults = vaults.filter((v): v is AvailableVault => v.type === 'available')

  return (
    <div
      className="connect-scope fixed inset-0 z-1 flex h-dvh flex-col overflow-hidden antialiased isolate"
      style={{
        background: TOKENS.colors.bgApp,
        color: TOKENS.colors.textPrimary,
        fontFamily: TOKENS.fonts.sans,
      }}
    >
      <header
        className="flex h-16 w-full min-w-0 shrink-0 select-none items-center justify-between"
        style={{
          background: TOKENS.colors.bgApp,
          borderBottom: `1px solid ${TOKENS.colors.borderSubtle}`,
          paddingLeft: TOKENS.spacing[4],
          paddingRight: TOKENS.spacing[8],
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <img
            src="/logos/hearst-connect-blackbg.svg"
            alt="Hearst Connect"
            style={{
              height: '42px',
              width: 'auto',
              display: 'block',
            }}
          />
        </div>
        <div className="flex h-full min-w-0 items-center justify-end">
          <span
            className="text-right uppercase"
            style={{
              fontFamily: MONO,
              fontSize: TOKENS.fontSizes.xs,
              fontWeight: TOKENS.fontWeights.bold,
              letterSpacing: TOKENS.letterSpacing.display,
              color: ON_DARK_GHOST,
            }}
          >
            {WALLET}
          </span>
        </div>
      </header>

      <main className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <section
          className="connect-main-scene min-h-0 min-w-0 flex-1 overflow-hidden"
          aria-label="Main scene"
        >
          <div key={panelKey} className="connect-panel-stage h-full min-h-0">
            <MainPanel
              vaults={vaults}
              availableVaults={availableVaults}
              selected={selected}
              agg={agg}
              isSimulation={isSimulation}
              isAvailableVaultsList={isAvailableVaultsList}
              onBack={() => handleSelect(null)}
              onVaultSelect={handleSelect}
            />
          </div>
        </section>
      </main>

      {/* Dock Radial Navigation */}
      <DockRadial
        selectedId={selectedId}
        onSelect={handleSelect}
        isSimulation={isSimulation}
      />
    </div>
  )
}

function MainPanel({
  vaults,
  availableVaults,
  selected,
  agg,
  isSimulation,
  isAvailableVaultsList,
  onBack,
  onVaultSelect,
}: {
  vaults: VaultLine[]
  availableVaults: AvailableVault[]
  selected: VaultLine | null
  agg: Aggregate
  isSimulation: boolean
  isAvailableVaultsList: boolean
  onBack: () => void
  onVaultSelect: (vaultId: string) => void
}) {
  if (isSimulation) return <SimulationPanel />
  if (selected) {
    if (selected.type === 'available') return <SubscribePanel vault={selected} onBack={onBack} />
    return <VaultDetailPanel vault={selected} onBack={onBack} />
  }
  if (isAvailableVaultsList) {
    return <AvailableVaultsPanel vaults={availableVaults} onVaultSelect={onVaultSelect} onBack={onBack} />
  }
  return (
    <PortfolioSummary
      vaults={vaults}
      agg={agg}
      onVaultSelect={onVaultSelect}
      onAvailableVaultsClick={() => onVaultSelect(AVAILABLE_VAULTS_VIEW_ID)}
    />
  )
}
