/**
 * Format vault name by removing prefix
 * "HashVault Ultra Yield" → "Ultra Yield"
 */
export function formatVaultName(name: string): string {
  return name.replace('HashVault ', '')
}
