/**
 * Financial Independence (FIRE) Calculation Engine
 * 
 * Implements the core FIRE planning calculations including:
 * - Target wealth calculation based on safe withdrawal rate
 * - Wealth accumulation projections with inflation
 * - Real vs nominal return conversions
 * - Time to financial independence estimation
 */

export interface FireInput {
  baseCurrency: string
  monthlyExpenses: number
  monthlyContribution: number
  currentWealth: number
  expInflationAA: number // Annual inflation rate (e.g., 0.04 = 4%)
  expReturnRealAA: number // Annual real return rate (e.g., 0.05 = 5%)
  swrAA: number // Safe withdrawal rate (e.g., 0.035 = 3.5%)
  taxRate?: number // Optional tax rate on returns
  maxMonths?: number // Maximum projection period (default: 1200 = 100 years)
}

export interface FireResult {
  horizonMonths: number
  horizonYears: number
  targetWealthReal: number
  targetWealthNominal: number
  series: Array<{
    month: number
    wealth_nominal: number
    wealth_real: number
    price_level: number
  }>
  isAchievable: boolean
  monthlyRealReturn: number
  monthlyNominalReturn: number
}

/**
 * Calculate FIRE plan projections
 */
export function calcFirePlan(input: FireInput): FireResult {
  const {
    monthlyExpenses,
    monthlyContribution,
    currentWealth,
    expInflationAA,
    expReturnRealAA,
    swrAA,
    taxRate = 0,
    maxMonths = 1200 // 100 years
  } = input

  // Convert annual rates to monthly
  const monthlyInflation = Math.pow(1 + expInflationAA, 1/12) - 1
  const monthlyRealReturn = Math.pow(1 + expReturnRealAA, 1/12) - 1
  
  // Fisher equation: (1 + nominal) = (1 + real) * (1 + inflation)
  const monthlyNominalReturn = (1 + monthlyRealReturn) * (1 + monthlyInflation) - 1

  // Calculate target wealth in today's purchasing power
  const yearlyRealExpenses = monthlyExpenses * 12
  const targetWealthReal = yearlyRealExpenses / swrAA

  // Initialize tracking variables
  let wealthNominal = currentWealth
  let priceLevel = 1 // Base price index (today = 1)
  let month = 0
  
  const series: FireResult['series'] = []

  // Project wealth accumulation month by month
  while (month <= maxMonths) {
    const wealthReal = wealthNominal / priceLevel
    
    series.push({
      month,
      wealth_nominal: wealthNominal,
      wealth_real: wealthReal,
      price_level: priceLevel
    })

    // Check if we've reached FIRE target (in real terms)
    if (wealthReal >= targetWealthReal) {
      break
    }

    // Move to next month
    month += 1
    priceLevel *= (1 + monthlyInflation)

    // Calculate returns and apply taxes
    const grossReturn = wealthNominal * monthlyNominalReturn
    const netReturn = grossReturn * (1 - taxRate)
    
    // Add returns and monthly contribution
    wealthNominal += netReturn + monthlyContribution
  }

  // Calculate final target wealth in nominal terms (at horizon)
  const finalPriceLevel = Math.pow(1 + expInflationAA, month / 12)
  const targetWealthNominal = targetWealthReal * finalPriceLevel

  return {
    horizonMonths: month,
    horizonYears: Math.round((month / 12) * 10) / 10, // Round to 1 decimal
    targetWealthReal,
    targetWealthNominal,
    series,
    isAchievable: month <= maxMonths,
    monthlyRealReturn,
    monthlyNominalReturn
  }
}

/**
 * Validate FIRE input parameters
 */
export function validateFireInput(input: Partial<FireInput>): string[] {
  const errors: string[] = []

  if (!input.monthlyExpenses || input.monthlyExpenses <= 0) {
    errors.push('Gastos mensais devem ser maiores que zero')
  }

  if (!input.monthlyContribution || input.monthlyContribution <= 0) {
    errors.push('Contribuição mensal deve ser maior que zero')
  }

  if (input.currentWealth === undefined || input.currentWealth < 0) {
    errors.push('Patrimônio atual não pode ser negativo')
  }

  if (!input.expInflationAA || input.expInflationAA < 0 || input.expInflationAA > 0.5) {
    errors.push('Inflação esperada deve estar entre 0% e 50% ao ano')
  }

  if (!input.expReturnRealAA || input.expReturnRealAA <= 0 || input.expReturnRealAA > 0.5) {
    errors.push('Retorno real esperado deve estar entre 0% e 50% ao ano')
  }

  if (!input.swrAA || input.swrAA <= 0 || input.swrAA > 0.2) {
    errors.push('Taxa de retirada segura deve estar entre 0% e 20% ao ano')
  }

  if (input.swrAA && input.expReturnRealAA && input.swrAA >= input.expReturnRealAA) {
    errors.push('Taxa de retirada deve ser menor que o retorno real esperado')
  }

  if (input.taxRate && (input.taxRate < 0 || input.taxRate > 0.5)) {
    errors.push('Taxa de imposto deve estar entre 0% e 50%')
  }

  return errors
}

/**
 * Format currency values for display
 */
export function formatCurrency(amount: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

/**
 * Format percentage values for display
 */
export function formatPercentage(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`
}

/**
 * Format time horizon for display
 */
export function formatTimeHorizon(months: number): string {
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (years === 0) {
    return `${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`
  } else if (remainingMonths === 0) {
    return `${years} ${years === 1 ? 'ano' : 'anos'}`
  } else {
    return `${years} ${years === 1 ? 'ano' : 'anos'} e ${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`
  }
}