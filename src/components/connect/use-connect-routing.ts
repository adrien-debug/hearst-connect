'use client'

import {
  createElement,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { SIMULATION_VIEW_ID } from './view-ids'
import { VAULTS, type VaultLine, aggregate, type Aggregate } from './data'

interface ConnectRoutingContextValue {
  vaults: VaultLine[]
  agg: Aggregate
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  selected: VaultLine | null
  isSimulation: boolean
}

const CONNECT_AGG = aggregate(VAULTS)

const ConnectRoutingContext = createContext<ConnectRoutingContextValue | null>(null)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const isSimulation = selectedId === SIMULATION_VIEW_ID
  const selected = useMemo(
    () =>
      selectedId && !isSimulation
        ? (VAULTS.find((v) => v.id === selectedId) ?? null)
        : null,
    [isSimulation, selectedId],
  )

  const select = useCallback((id: string | null) => {
    setSelectedId(id)
  }, [])

  const value = useMemo<ConnectRoutingContextValue>(
    () => ({
      vaults: VAULTS,
      agg: CONNECT_AGG,
      selectedId,
      setSelectedId: select,
      selected: selected as VaultLine | null,
      isSimulation,
    }),
    [isSimulation, select, selected, selectedId],
  )

  return createElement(ConnectRoutingContext.Provider, { value }, children)
}

export function useConnectRouting() {
  const value = useContext(ConnectRoutingContext)

  if (!value) {
    throw new Error('useConnectRouting must be used within NavigationProvider')
  }

  return value
}
