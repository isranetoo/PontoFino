/**
 * Multi-Currency Retirement Planning Engine
 * 
 * Handles complex retirement scenarios with:
 * - Multiple currencies for income, expenses, and portfolio
 * - Dynamic FX rate projections
 * - Inflation adjustments per currency
 * - Safe withdrawal rate calculations
 * - Risk of ruin analysis
 */

export interface RetirementInput {
  baseCurrency: 'BRL' | 'USD' | 'EUR'
  spendCurrency: 'BRL' | 'USD' | 'EUR'
  targetCountry?: string
  currentAge: number
  retirementAge: number
  lifeExpectancy: number
  monthlyExpenses: number // in spend currency
  expenseInflationRate: number // annual rate for spend currency
  safeWithdrawalRate: number // annual rate
  incomes: RetirementIncome[]
  portfolio: RetirementPortfolio[]
  fxAssumptions?: FxProjection[]
}

export interface RetirementIncome {
  name: string
  currency: string
  monthlyAmount: number
  startAge: number
  endAge?: number
  inflationRate: number
  type: 'pension' | 'social_security' | 'rental' | 'business' | 'other'
}

export interface RetirementPortfolio {
  currency: string
  amount: number
  expectedRealReturn: number // annual real return
  volatility?: number
  assetClass: 'equity' | 'bonds' | 'real_estate' | 'cash' | 'alternatives'
}

export interface FxProjection {
  year: number
  baseCurrency: string
  quoteCurrency: string
  rate: number
}

export interface RetirementResult {
  yearsToRetirement: number
  requiredWealthBase: number
  requiredWealthSpend: number
  successProbability: number
  ruinRisk: number
  series: RetirementProjection[]
  summary: RetirementSummary
}

export interface RetirementProjection {
  year: number
  age: number
  wealthBase: number
  wealthSpend: number
  expensesBase: number
  incomesBase: number
  withdrawalBase: number
  fxRates: Record<string, number>
}

export interface RetirementSummary {
  totalRequiredWealth: number
  monthlyWithdrawalNeeded: number
  portfolioGapBase: number
  yearsOfSafety: number
  criticalAges: {
    portfolioDepletion?: number
    highRisk?: number
  }
}

/**
 * FX Rate Service for currency conversions
 */
export class FxService {
  private rates: Map<string, number> = new Map()
  private projections: FxProjection[] = []

  constructor(currentRates: Record<string, Record<string, number>>, projections?: FxProjection[]) {
    // Store current spot rates
    Object.entries(currentRates).forEach(([base, quotes]) => {
      Object.entries(quotes).forEach(([quote, rate]) => {
        this.rates.set(`${base}/${quote}`, rate)
      })
    })
    
    this.projections = projections || []
  }

  spot(from: string, to: string): number {
    if (from === to) return 1
    
    const direct = this.rates.get(`${from}/${to}`)
    if (direct) return direct
    
    const inverse = this.rates.get(`${to}/${from}`)
    if (inverse) return 1 / inverse
    
    // Try cross rate via USD
    if (from !== 'USD' && to !== 'USD') {
      const fromUsd = this.spot(from, 'USD')
      const toUsd = this.spot('USD', to)
      return fromUsd * toUsd
    }
    
    return 1 // Fallback
  }

  path(from: string, to: string, year: number): number {
    if (from === to) return 1
    
    // Look for specific projection
    const projection = this.projections.find(p => 
      p.year === year && 
      p.baseCurrency === from && 
      p.quoteCurrency === to
    )
    
    if (projection) return projection.rate
    
    // Use spot rate as fallback (could add trend/volatility here)
    return this.spot(from, to)
  }
}

/**
 * Calculate multi-currency retirement plan
 */
export function calculateRetirementPlan(input: RetirementInput, fxService: FxService): RetirementResult {
  const yearsToRetirement = input.retirementAge - input.currentAge
  const retirementYears = input.lifeExpectancy - input.retirementAge
  const totalYears = input.lifeExpectancy - input.currentAge
  
  // Convert initial portfolio to base currency
  let initialWealthBase = 0
  for (const portfolio of input.portfolio) {
    const fxRate = fxService.spot(portfolio.currency, input.baseCurrency)
    initialWealthBase += portfolio.amount * fxRate
  }
  
  const series: RetirementProjection[] = []
  let currentWealthBase = initialWealthBase
  
  // Calculate weighted average portfolio return
  const totalPortfolioValue = input.portfolio.reduce((sum, p) => sum + p.amount * fxService.spot(p.currency, input.baseCurrency), 0)
  const avgRealReturn = input.portfolio.reduce((sum, p) => {
    const weight = (p.amount * fxService.spot(p.currency, input.baseCurrency)) / totalPortfolioValue
    return sum + (p.expectedRealReturn * weight)
  }, 0)
  
  // Project year by year
  for (let year = 0; year <= totalYears; year++) {
    const currentAge = input.currentAge + year
    const isRetired = currentAge >= input.retirementAge
    
    // Calculate expenses in spend currency (with inflation)
    const expensesSpend = input.monthlyExpenses * 12 * Math.pow(1 + input.expenseInflationRate, year)
    
    // Convert expenses to base currency
    const fxSpendToBase = fxService.path(input.spendCurrency, input.baseCurrency, year)
    const expensesBase = expensesSpend * fxSpendToBase
    
    // Calculate incomes in base currency
    let incomesBase = 0
    for (const income of input.incomes) {
      if (currentAge >= income.startAge && (!income.endAge || currentAge <= income.endAge)) {
        const incomeNominal = income.monthlyAmount * 12 * Math.pow(1 + income.inflationRate, year)
        const fxIncomeToBase = fxService.path(income.currency, input.baseCurrency, year)
        incomesBase += incomeNominal * fxIncomeToBase
      }
    }
    
    // Calculate required withdrawal
    const withdrawalBase = Math.max(0, expensesBase - incomesBase)
    
    // Apply portfolio growth (before retirement) or withdrawal (after retirement)
    if (!isRetired) {
      // Accumulation phase: apply returns
      currentWealthBase *= (1 + avgRealReturn)
    } else {
      // Withdrawal phase: apply returns and subtract withdrawal
      currentWealthBase = currentWealthBase * (1 + avgRealReturn) - withdrawalBase
    }
    
    // Convert wealth to spend currency for display
    const fxBaseToSpend = fxService.path(input.baseCurrency, input.spendCurrency, year)
    const wealthSpend = currentWealthBase * fxBaseToSpend
    
    // Store FX rates for this year
    const fxRates: Record<string, number> = {}
    const currencies = [input.baseCurrency, input.spendCurrency, ...input.incomes.map(i => i.currency)]
    const uniqueCurrencies = [...new Set(currencies)]
    
    for (const currency of uniqueCurrencies) {
      if (currency !== input.baseCurrency) {
        fxRates[`${currency}/${input.baseCurrency}`] = fxService.path(currency, input.baseCurrency, year)
      }
    }
    
    series.push({
      year,
      age: currentAge,
      wealthBase: Math.max(0, currentWealthBase),
      wealthSpend,
      expensesBase,
      incomesBase,
      withdrawalBase,
      fxRates
    })
    
    // Stop if wealth is depleted
    if (currentWealthBase <= 0) break
  }
  
  // Calculate required wealth at retirement
  const retirementExpensesSpend = input.monthlyExpenses * 12 * Math.pow(1 + input.expenseInflationRate, yearsToRetirement)
  const fxAtRetirement = fxService.path(input.spendCurrency, input.baseCurrency, yearsToRetirement)
  const requiredWealthBase = (retirementExpensesSpend * fxAtRetirement) / input.safeWithdrawalRate
  const requiredWealthSpend = retirementExpensesSpend / input.safeWithdrawalRate
  
  // Calculate success metrics
  const finalWealth = series[series.length - 1]?.wealthBase || 0
  const successProbability = finalWealth > 0 ? 1.0 : 0.0
  const ruinRisk = 1.0 - successProbability
  
  // Find critical ages
  const portfolioDepletionAge = series.find(s => s.wealthBase <= 0)?.age
  const highRiskAge = series.find(s => s.wealthBase < requiredWealthBase * 0.25)?.age
  
  const summary: RetirementSummary = {
    totalRequiredWealth: requiredWealthBase,
    monthlyWithdrawalNeeded: requiredWealthBase * input.safeWithdrawalRate / 12,
    portfolioGapBase: Math.max(0, requiredWealthBase - initialWealthBase),
    yearsOfSafety: series.filter(s => s.wealthBase > 0).length,
    criticalAges: {
      portfolioDepletion: portfolioDepletionAge,
      highRisk: highRiskAge
    }
  }
  
  return {
    yearsToRetirement,
    requiredWealthBase,
    requiredWealthSpend,
    successProbability,
    ruinRisk,
    series,
    summary
  }
}

/**
 * Validate retirement input parameters
 */
export function validateRetirementInput(input: Partial<RetirementInput>): string[] {
  const errors: string[] = []
  
  if (!input.currentAge || input.currentAge < 18 || input.currentAge > 100) {
    errors.push('Idade atual deve estar entre 18 e 100 anos')
  }
  
  if (!input.retirementAge || input.retirementAge < 50 || input.retirementAge > 100) {
    errors.push('Idade de aposentadoria deve estar entre 50 e 100 anos')
  }
  
  if (input.currentAge && input.retirementAge && input.retirementAge <= input.currentAge) {
    errors.push('Idade de aposentadoria deve ser maior que a idade atual')
  }
  
  if (!input.lifeExpectancy || input.lifeExpectancy < 60 || input.lifeExpectancy > 120) {
    errors.push('Expectativa de vida deve estar entre 60 e 120 anos')
  }
  
  if (input.retirementAge && input.lifeExpectancy && input.lifeExpectancy <= input.retirementAge) {
    errors.push('Expectativa de vida deve ser maior que a idade de aposentadoria')
  }
  
  if (!input.monthlyExpenses || input.monthlyExpenses <= 0) {
    errors.push('Gastos mensais devem ser maiores que zero')
  }
  
  if (!input.expenseInflationRate || input.expenseInflationRate < 0 || input.expenseInflationRate > 0.5) {
    errors.push('Taxa de inflação deve estar entre 0% e 50%')
  }
  
  if (!input.safeWithdrawalRate || input.safeWithdrawalRate <= 0 || input.safeWithdrawalRate > 0.2) {
    errors.push('Taxa de retirada segura deve estar entre 0% e 20%')
  }
  
  if (!input.portfolio || input.portfolio.length === 0) {
    errors.push('Pelo menos um ativo deve ser incluído no portfólio')
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
 * Get currency symbol
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    'BRL': 'R$',
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
  }
  return symbols[currency] || currency
}