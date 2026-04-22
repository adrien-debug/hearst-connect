export const TOKENS = {
  colors: {
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#F8F9FA',
    gray100: '#F1F3F5',
    gray200: '#E9ECEF',
    gray500: '#ADB5BD',
    gray700: '#495057',
    accent: '#a7fb90', // Citrus
    accentDim: 'rgba(167, 251, 144, 0.05)', // Encore plus subtil
    accentGlow: 'rgba(167, 251, 144, 0.15)', // Diffusion large
    bgPage: '#FFFFFF',
    bgSidebar: '#000000',
    bgSurface: '#F9F9FB', 
    textPrimary: '#000000',
    textSecondary: '#52525B',
    textGhost: '#D4D4D8', // Plus clair pour moins de dureté
    textOnDark: '#FFFFFF',
    borderMain: 'rgba(0, 0, 0, 0.04)', // Presque invisible
    borderSubtle: '#F4F4F7',
    sidebarTextPrimary: '#FFFFFF',
    sidebarTextGhost: 'rgba(255, 255, 255, 0.25)',
    surfaceHover: '#F4F4F7',
    surfaceActive: '#E4E4E7',
    danger: '#FF453A',
  },
  fonts: {
    sans: "'Satoshi Variable', Inter, -apple-system, sans-serif",
    mono: "'Satoshi Variable', Inter, -apple-system, sans-serif", // Satoshi partout
  },
  fontSizes: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '20px',
    xl: '24px',
    xxl: '48px',
    xxxl: '80px', // Poussé au max
    display: 'clamp(56px, 8vw, 96px)',
  },
  fontWeights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },
  letterSpacing: {
    tight: '-0.06em',
    normal: '0',
    wide: '0.12em',
    display: '0.3em',
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
    24: '120px',
    32: '160px',
  },
  borders: {
    none: 'none',
    thin: '1px',
    thick: '2px',
    heavy: '12px',
  }
}

export const FONT = TOKENS.fonts.sans
export const MONO = TOKENS.fonts.mono

export function fmtUsd(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function fmtUsdCompact(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}