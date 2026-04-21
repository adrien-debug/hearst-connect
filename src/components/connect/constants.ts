export const FONT = "var(--font-satoshi, 'Satoshi Variable', Inter, -apple-system, sans-serif)"
export const MONO = "var(--font-mono, 'IBM Plex Mono', ui-monospace, monospace)"

export const COLORS = {
  page: '#141414',
  sidebar: '#0A0A0A',
  surfaceHover: 'rgba(255, 255, 255, 0.03)',
  surfaceActive: 'rgba(255, 255, 255, 0.06)',
  surfaceElevated: '#1A1A1A',
  textPrimary: '#F3F4F6',
  textSecondary: '#9CA3AF',
  textGhost: '#4B5563',
  borderSubtle: 'rgba(255, 255, 255, 0.05)',
  accent: '#FFFFFF',
}

export function fmtUsd(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
