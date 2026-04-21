export const FONT = "var(--font-satoshi, 'Satoshi Variable', Inter, -apple-system, sans-serif)"
export const MONO = "var(--font-mono, 'IBM Plex Mono', ui-monospace, monospace)"

export const COLORS = {
  border: 'var(--dashboard-border, rgba(255,255,255,0.06))',
  surface: 'var(--dashboard-surface, rgba(255,255,255,0.02))',
  accent: 'var(--dashboard-accent, #FFFFFF)', // Pure white for institutional feel
  accentDim: 'rgba(255,255,255,0.1)',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.5)',
  textGhost: 'rgba(255,255,255,0.25)',
  bg: '#000000',
}

export function fmtUsd(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
