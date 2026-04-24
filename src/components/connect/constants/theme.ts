import { TOKENS } from '../constants'

/**
 * Chart color palette for vault visualizations
 * Consistent colors across donut, timeline, and position charts
 */
export const CHART_PALETTE = [
  TOKENS.colors.accent,
  TOKENS.colors.white,
  'rgba(255,255,255,0.45)',
  'rgba(255,255,255,0.35)',
  'rgba(255,255,255,0.25)',
] as const
