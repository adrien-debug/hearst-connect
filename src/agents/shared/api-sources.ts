/**
 * External API wrappers for market data collection
 * All functions are standalone and handle their own errors
 */

export interface BtcPriceData {
  price: number
  change24h: number
  change7d: number
  volume24h: number
  marketCap: number
}

export interface DeFiYieldData {
  usdcApy: number
  usdtApy: number
  btcApy: number
  usdcPool: string | null
  usdtPool: string | null
  btcPool: string | null
}

export interface FearGreedData {
  value: number
  label: string
  timestamp: number
}

export async function fetchBtcPrice(): Promise<BtcPriceData> {
  const res = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_7d_change=true&include_24hr_vol=true&include_market_cap=true'
  )
  if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`)
  const data = await res.json()
  const btc = data.bitcoin
  return {
    price: btc.usd,
    change24h: btc.usd_24h_change ?? 0,
    change7d: btc.usd_7d_change ?? 0,
    volume24h: btc.usd_24h_vol ?? 0,
    marketCap: btc.usd_market_cap ?? 0,
  }
}

export async function fetchDeFiYields(): Promise<DeFiYieldData> {
  const res = await fetch('https://yields.llama.fi/pools')
  if (!res.ok) throw new Error(`DeFiLlama error: ${res.status}`)
  const data = await res.json()
  const pools: Array<{ symbol: string; project: string; chain: string; apy: number; pool: string }> = data.data || []

  const find = (symbol: string, project: string) =>
    pools.find(p => p.symbol === symbol && p.project === project && p.chain === 'Ethereum')

  const usdc = find('USDC', 'aave-v3')
  const usdt = find('USDT', 'aave-v3')
  const wbtc = find('WBTC', 'aave-v3')

  return {
    usdcApy: usdc?.apy ?? 0,
    usdtApy: usdt?.apy ?? 0,
    btcApy: wbtc?.apy ?? 0,
    usdcPool: usdc?.pool ?? null,
    usdtPool: usdt?.pool ?? null,
    btcPool: wbtc?.pool ?? null,
  }
}

export async function fetchFearGreed(): Promise<FearGreedData> {
  const res = await fetch('https://api.alternative.me/fng/?limit=1')
  if (!res.ok) throw new Error(`Fear & Greed error: ${res.status}`)
  const data = await res.json()
  const fg = data.data?.[0]
  return {
    value: fg ? parseInt(fg.value, 10) : 50,
    label: fg?.value_classification ?? 'Neutral',
    timestamp: fg ? parseInt(fg.timestamp, 10) * 1000 : Date.now(),
  }
}

export function estimateMiningHashprice(btcPrice: number): number {
  const baseHashprice = 48
  const basePrice = 95000
  return Math.round(baseHashprice * (btcPrice / basePrice) * 100) / 100
}
