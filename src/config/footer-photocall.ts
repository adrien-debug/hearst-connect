/**
 * Marques / mentions affichées dans le bandeau footer (photocall horizontal).
 * À importer dans `hearst-client.tsx` : `import { FOOTER_H_PHOTOCALL } from '@/config/footer-photocall'`
 */
export const FOOTER_H_PHOTOCALL = [
  'Base',
  'USDC',
  'On-chain',
  'Audited',
] as const

export type FooterPhotocallMark = (typeof FOOTER_H_PHOTOCALL)[number]
