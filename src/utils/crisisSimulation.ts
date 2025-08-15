/**
 * Crisis Scenario Simulation Engine
 * 
 * Simulates portfolio performance under various market stress scenarios
 * using asset sensitivities (beta, duration) and market shocks.
 */

export interface Shock {
  equityIdx?: number // e.g., -0.4 for 40% drop
  rateAbs?: number   // target interest rate (e.g., 0.15 for 15%)
  fxUSD?: number     // USD/BRL exchange rate change (e.g., 0.25 for 25% increase)
}

export interface MarketContext {
  currentRate: number    // current interest rate (e.g., 0.1375 for 13.75%)
  currentFxRate: number  // current USD/BRL rate (e.g., 5.2)
  currentIndex: number   // current equity index level
}

export interface Position {
  id: string
  asset: Asset
  quantity: number
  price: number
  value: number
}

export interface Asset {
  id: string
  ticker: string
  name: string
  asset_class: 'Equity' | 'Bond' | 'FII' | 'Cash' | 'FX' | 'Crypto'
  currency: string
  metadata: {
    beta?: number
    beta_ifix?: number
    duration_years?: number
    duration_mod?: number
    duration_like?: number
    volatility?: number
    sector?: string
  }
}

export interface SimulationResult {
  valueBefore: number
  valueAfter: number
  drop: number
  totalLoss: number
  items: PositionResult[]
  byClass: ClassResult[]
  topLosers: PositionResult[]
  sensitivities: SensitivityResult[]
}

export interface PositionResult extends Position {
  relChange: number
  newPrice: number
  newValue: number
  absoluteLoss: number
}

export interface ClassResult {
  class: string
  valueBefore: number
  valueAfter: number
  change: number
  relChange: number
}

export interface SensitivityResult {
  factor: string
  impact: number
  description: string
}

/**
 * Simulate crisis scenario on portfolio positions
 */
export function simulateCrisis(
  positions: Position[], 
  shocks: Shock, 
  context: MarketContext
): SimulationResult {
  
  // Apply shocks to each position
  const items: PositionResult[] = positions.map(position => {
    const asset = position.asset
    let relChange = 0
    
    // Equity sensitivity
    if (asset.asset_class === 'Equity') {
      const beta = asset.metadata.beta ?? 1.0
      relChange += (shocks.equityIdx ?? 0) * beta
    }
    
    // Bond sensitivity (duration risk)
    if (asset.asset_class === 'Bond') {
      if (shocks.rateAbs !== undefined) {
        const dYield = shocks.rateAbs - context.currentRate
        const duration = asset.metadata.duration_mod ?? asset.metadata.duration_years ?? 5
        relChange += -duration * dYield // ΔP/P ≈ -Dmod * Δy
      }
    }
    
    // FII sensitivity (hybrid: equity + interest rate)
    if (asset.asset_class === 'FII') {
      // Equity component
      const betaIfix = asset.metadata.beta_ifix ?? 0.8
      relChange += (shocks.equityIdx ?? 0) * betaIfix
      
      // Interest rate component (lower sensitivity than bonds)
      if (shocks.rateAbs !== undefined) {
        const dYield = shocks.rateAbs - context.currentRate
        const durationLike = asset.metadata.duration_like ?? 2.0
        relChange += -durationLike * dYield * 0.5 // 50% of bond sensitivity
      }
    }
    
    // FX sensitivity (USD assets)
    if (asset.currency === 'USD') {
      relChange += (shocks.fxUSD ?? 0)
    }
    
    // Crypto sensitivity (high beta to equity markets)
    if (asset.asset_class === 'Crypto') {
      const cryptoBeta = asset.metadata.beta ?? 2.0
      relChange += (shocks.equityIdx ?? 0) * cryptoBeta
      
      // Additional volatility for crypto
      if (shocks.equityIdx !== undefined && shocks.equityIdx < 0) {
        relChange *= 1.2 // 20% additional downside in crisis
      }
    }
    
    // Cash is relatively stable (small interest rate sensitivity)
    if (asset.asset_class === 'Cash') {
      if (shocks.rateAbs !== undefined) {
        const dYield = shocks.rateAbs - context.currentRate
        const shortDuration = asset.metadata.duration_mod ?? 0.1
        relChange += -shortDuration * dYield
      }
    }
    
    // Ensure price doesn't go negative (sanity check)
    const newPrice = Math.max(position.price * (1 + relChange), 0.01)
    const newValue = newPrice * position.quantity
    const absoluteLoss = position.value - newValue
    
    return {
      ...position,
      relChange,
      newPrice,
      newValue,
      absoluteLoss
    }
  })
  
  // Calculate totals
  const valueBefore = positions.reduce((sum, p) => sum + p.value, 0)
  const valueAfter = items.reduce((sum, p) => sum + p.newValue, 0)
  const drop = (valueAfter / valueBefore) - 1
  const totalLoss = valueBefore - valueAfter
  
  // Group by asset class
  const byClass = calculateByClass(items)
  
  // Find top 5 losers
  const topLosers = items
    .filter(item => item.absoluteLoss > 0)
    .sort((a, b) => b.absoluteLoss - a.absoluteLoss)
    .slice(0, 5)
  
  // Calculate sensitivity breakdown
  const sensitivities = calculateSensitivities(positions, shocks, context)
  
  return {
    valueBefore,
    valueAfter,
    drop,
    totalLoss,
    items,
    byClass,
    topLosers,
    sensitivities
  }
}

/**
 * Calculate results grouped by asset class
 */
function calculateByClass(items: PositionResult[]): ClassResult[] {
  const classMap = new Map<string, { before: number; after: number }>()
  
  items.forEach(item => {
    const className = item.asset.asset_class
    const current = classMap.get(className) || { before: 0, after: 0 }
    
    classMap.set(className, {
      before: current.before + item.value,
      after: current.after + item.newValue
    })
  })
  
  return Array.from(classMap.entries()).map(([className, values]) => ({
    class: className,
    valueBefore: values.before,
    valueAfter: values.after,
    change: values.after - values.before,
    relChange: values.before > 0 ? (values.after / values.before) - 1 : 0
  }))
}

/**
 * Calculate sensitivity breakdown by shock factor
 */
function calculateSensitivities(
  positions: Position[], 
  shocks: Shock, 
  context: MarketContext
): SensitivityResult[] {
  const sensitivities: SensitivityResult[] = []
  
  // Equity shock impact
  if (shocks.equityIdx !== undefined && shocks.equityIdx !== 0) {
    const equityValue = positions
      .filter(p => p.asset.asset_class === 'Equity' || p.asset.asset_class === 'FII' || p.asset.asset_class === 'Crypto')
      .reduce((sum, p) => sum + p.value, 0)
    
    const impact = equityValue * Math.abs(shocks.equityIdx) * 0.8 // Approximate average beta
    
    sensitivities.push({
      factor: 'Equity Market',
      impact: -impact,
      description: `${(shocks.equityIdx * 100).toFixed(1)}% equity market shock`
    })
  }
  
  // Interest rate shock impact
  if (shocks.rateAbs !== undefined) {
    const dYield = shocks.rateAbs - context.currentRate
    const bondValue = positions
      .filter(p => p.asset.asset_class === 'Bond' || p.asset.asset_class === 'FII')
      .reduce((sum, p) => sum + p.value, 0)
    
    const avgDuration = 4.0 // Approximate average duration
    const impact = bondValue * Math.abs(dYield) * avgDuration
    
    sensitivities.push({
      factor: 'Interest Rates',
      impact: dYield > 0 ? -impact : impact,
      description: `Interest rates to ${(shocks.rateAbs * 100).toFixed(2)}%`
    })
  }
  
  // FX shock impact
  if (shocks.fxUSD !== undefined && shocks.fxUSD !== 0) {
    const usdValue = positions
      .filter(p => p.asset.currency === 'USD')
      .reduce((sum, p) => sum + p.value, 0)
    
    const impact = usdValue * Math.abs(shocks.fxUSD)
    
    sensitivities.push({
      factor: 'USD Exchange Rate',
      impact: shocks.fxUSD > 0 ? impact : -impact,
      description: `${(shocks.fxUSD * 100).toFixed(1)}% USD/BRL change`
    })
  }
  
  return sensitivities.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
}

/**
 * Format currency values
 */
export function formatCurrency(amount: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

/**
 * Format percentage values
 */
export function formatPercentage(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`
}

/**
 * Validate shock parameters
 */
export function validateShocks(shocks: Shock): string[] {
  const errors: string[] = []
  
  if (shocks.equityIdx !== undefined) {
    if (shocks.equityIdx < -0.8 || shocks.equityIdx > 1.0) {
      errors.push('Equity shock must be between -80% and +100%')
    }
  }
  
  if (shocks.rateAbs !== undefined) {
    if (shocks.rateAbs < 0 || shocks.rateAbs > 0.5) {
      errors.push('Interest rate must be between 0% and 50%')
    }
  }
  
  if (shocks.fxUSD !== undefined) {
    if (shocks.fxUSD < -0.5 || shocks.fxUSD > 1.0) {
      errors.push('FX shock must be between -50% and +100%')
    }
  }
  
  return errors
}