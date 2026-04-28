'use client'

import type { AvailableVault } from './data'
import { InvestWizard } from './invest/wizard'

/** SubscribePanel — Thin route-level wrapper around the Invest wizard.
 * Steps 2-3-4 of the flow are owned by InvestWizard; Step 1 (product
 * selection) lives in AvailableVaultsPanel. */
export function SubscribePanel({ vault, onBack }: { vault: AvailableVault; onBack?: () => void }) {
  return <InvestWizard vault={vault} onBack={onBack} />
}
