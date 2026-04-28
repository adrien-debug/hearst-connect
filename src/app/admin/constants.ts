/**
 * Admin Design Tokens — Using global marketing design system
 * These use --color-* variables instead of --hc-* (Connect scope)
 */

export const ADMIN_TOKENS = {
  colors: {
    // Backgrounds
    bgApp: 'var(--color-bg-primary)',
    bgSidebar: 'var(--color-bg-secondary)',
    bgSurface: 'var(--color-bg-elevated)',
    bgTertiary: 'var(--color-bg-tertiary)',
    
    // Text
    textPrimary: 'var(--color-text-primary)',
    textSecondary: 'var(--color-text-secondary)',
    textGhost: 'var(--color-text-ghost)',
    white: 'var(--color-text-primary)',
    black: 'var(--color-bg-primary)',
    
    // Accents
    accent: 'var(--color-accent)',
    accentHover: 'var(--color-accent-glow)',
    accentSubtle: 'var(--color-accent-subtle)',
    
    // Status
    danger: 'var(--color-error)',
    warning: 'var(--color-warning)',
    success: 'var(--color-success)',
    
    // Borders
    borderSubtle: 'var(--color-border-subtle)',
    borderDefault: 'var(--color-border-default)',
    borderStrong: 'var(--color-border-strong)',

    // Status (semantic)
    info: 'var(--color-info, #3B82F6)',

    // Agent identification (admin sections)
    agentWatcher: 'var(--color-agent-watcher)',
    agentStrategy: 'var(--color-agent-strategy)',
    agentAudit: 'var(--color-agent-audit)',

    // Signal-type hues
    signalTakeProfit: 'var(--color-signal-take-profit)',
    signalYieldRotate: 'var(--color-signal-yield-rotate)',
    signalRebalance: 'var(--color-signal-rebalance)',
    signalIncreaseBtc: 'var(--color-signal-increase-btc)',
    signalReduceRisk: 'var(--color-signal-reduce-risk)',

    // Log-tag hues for agent run console
    logStart: 'var(--color-log-start)',
    logTool: 'var(--color-log-tool)',
    logResult: 'var(--color-log-result)',
    logSignal: 'var(--color-log-signal)',
    logClaude: 'var(--color-log-claude)',
    logError: 'var(--color-log-error)',
    logDone: 'var(--color-log-done)',

    // Terminal traffic-light dots
    terminalRed: 'var(--color-terminal-red)',
    terminalYellow: 'var(--color-terminal-yellow)',
    terminalGreen: 'var(--color-terminal-green)',
  },
  fonts: {
    sans: 'var(--font-sans)',
    mono: 'var(--font-mono)',
  },
  fontSizes: {
    /** 10px — sub-micro figure, only for ultra-dense badges/glyphs */
    nano: 'var(--dashboard-text-dense-xs)',
    micro: 'var(--text-micro)',
    xs: 'var(--text-xs)',
    sm: 'var(--text-sm)',
    md: 'var(--text-md)',
    lg: 'var(--text-lg)',
    xl: 'var(--text-xl)',
    xxl: 'var(--text-xxl)',
  },
  fontWeights: {
    regular: 'var(--weight-regular)',
    medium: 'var(--weight-medium)',
    semibold: 'var(--weight-semibold)',
    bold: 'var(--weight-bold)',
    black: 'var(--weight-black)',
  },
  letterSpacing: {
    tight: 'var(--tracking-tight)',
    normal: 'var(--tracking-normal)',
    loose: 'var(--tracking-loose)',
    /** Caption opener (0.08em). */
    caption: 'var(--dashboard-letter-spacing-caption)',
    /** UI micro labels (0.1em). */
    micro: 'var(--dashboard-letter-spacing-micro)',
    wide: 'var(--tracking-wide)',
    display: 'var(--tracking-display)',
  },
  lineHeight: {
    tight: 'var(--leading-tight)',
    normal: 'var(--leading-base)',
    relaxed: 'var(--leading-relaxed)',
    loose: 'var(--leading-loose)',
  },
  spacing: {
    0: 'var(--space-0)',
    /** 2px — micro spacing, ultra-dense layouts only. */
    half: '2px',
    1: 'var(--space-1)',
    2: 'var(--space-2)',
    3: 'var(--space-3)',
    4: 'var(--space-4)',
    5: 'var(--space-5)',
    6: 'var(--space-6)',
    8: 'var(--space-8)',
    10: 'var(--space-10)',
    12: 'var(--space-12)',
    16: 'var(--space-16)',
    20: 'var(--space-20)',
    50: 'var(--space-50)',
  },
  radius: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
    full: 'var(--radius-full)',
  },
  borders: {
    none: 'none',
    thin: '1px',
    thick: '2px',
    heavy: '6px',
  },
  transitions: {
    fast: 'var(--transition-fast)',
    base: 'var(--transition-base)',
    slow: 'var(--transition-slow)',
    /** Shorthand `all` transitions for hover state changes. */
    all: 'all var(--transition-fast)',
    allBase: 'all var(--transition-base)',
  },
  zIndex: {
    base: 'var(--z-base)',
    raised: 'var(--z-raised)',
    tooltip: 'var(--z-tooltip)',
    dock: 'var(--z-dock)',
    dockActive: 'var(--z-dock-active)',
    dropdown: 'var(--z-dropdown)',
    sticky: 'var(--z-sticky)',
    fixed: 'var(--z-fixed)',
    overlay: 'var(--z-overlay)',
    modal: 'var(--z-modal)',
    toast: 'var(--z-toast)',
    banner: 'var(--z-banner)',
  },
  /** Status & semantic indicator hues — consumed by signal/agent maps. */
  status: {
    info: 'var(--color-info, #3B82F6)',
    success: 'var(--color-success, #2DC558)',
    warning: 'var(--color-warning, #F59E0B)',
    danger: 'var(--color-error, #EF4444)',
  },
  lineHeights: {
    tight: 'var(--leading-tight)',
    base: 'var(--leading-base)',
    relaxed: 'var(--leading-relaxed)',
  },
  opacities: {
    subtle: 'var(--opacity-subtle)',
    medium: 'var(--opacity-medium)',
    strong: 'var(--opacity-strong)',
  },
}

export const MONO = ADMIN_TOKENS.fonts.mono

export function fmtUsd(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function fmtUsdCompact(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}
