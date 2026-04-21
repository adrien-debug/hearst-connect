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
    danger: '#EF4444',
  },
  fonts: {
    sans: "'Satoshi Variable', Inter, -apple-system, sans-serif",
    mono: "'IBM Plex Mono', monospace",
  },
  fontSizes: {
    xs: '12px',           // marketing --dashboard-text-xs
    sm: '14px',           // marketing --dashboard-text-sm
    md: '16px',           // marketing --dashboard-text-base
    lg: '20px',           // marketing --dashboard-text-lg
    xl: '24px',           // marketing --dashboard-text-xl
    xxl: '40px',          // marketing --dashboard-text-2xl
    xxxl: '56px',         // marketing --dashboard-text-3xl
    display: 'clamp(48px, 5vw, 64px)',
  },
  fontWeights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 800,
  },
  letterSpacing: {
    tight: '-0.04em',
    normal: '0',
    wide: '0.1em',
    display: '0.2em',
  },
  spacing: {
    0: '0px',
    2: '8px',
    3: '12px',
    4: '16px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
  },
  borders: {
    none: 'none',
    thin: '1px',
    thick: '2px',
    heavy: '6px',
  }
}

export const FONT = TOKENS.fonts.sans
export const MONO = TOKENS.fonts.mono

export function fmtUsd(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}