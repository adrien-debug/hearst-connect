export const TOKENS = {
  colors: {
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#F8F9FA',
    gray100: '#F1F3F5',
    gray200: '#E9ECEF',
    gray500: '#ADB5BD',
    gray700: '#495057',
    accent: '#a7fb90',
    bgPage: '#FFFFFF',
    bgSidebar: '#000000',
    bgSurface: '#F8F9FA',
    textPrimary: '#000000',
    textSecondary: '#495057',
    textGhost: '#ADB5BD',
    textOnDark: '#FFFFFF',
    borderMain: '#000000',
    borderSubtle: '#E9ECEF',
    sidebarTextPrimary: '#FFFFFF',
    sidebarTextGhost: '#ADB5BD',
    /** Row hover (light panels / tables) */
    surfaceHover: '#F1F3F5',
    /** Progress track / inactive bar */
    surfaceActive: '#E9ECEF',
  },
  fonts: {
    sans: "'Inter', -apple-system, sans-serif",
    mono: "'IBM Plex Mono', monospace",
  },
  fontSizes: {
    xs: '9px',
    sm: '11px',
    md: '12px',
    lg: '14px',
    xl: '16px',
    xxl: '18px',
    xxxl: '24px',
    display: 'clamp(32px, 4vw, 48px)',
  },
  fontWeights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 800,
  },
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.05em',
    display: '0.1em',
  },
  spacing: {
    0: '0px',
    2: '4px',
    3: '8px',
    4: '12px',
    6: '16px',
    8: '20px',
    12: '24px',
    16: '32px',
    20: '48px',
  },
  borders: {
    none: 'none',
    thin: '1px',
    thick: '2px',
    heavy: '4px',
  }
}

/** Align with `hub-font-scope` / layout (CSS vars from dashboard tokens) */
export const FONT =
  "var(--font-sans, 'Satoshi Variable', Inter, -apple-system, sans-serif)"
export const MONO = "var(--font-mono, 'IBM Plex Mono', ui-monospace, monospace)"

export function fmtUsd(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}