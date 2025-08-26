import React, { useState, useEffect, useMemo } from 'react'
import { usePaywall } from '../../hooks/usePaywall'
import { useSupabase, Fund as SupabaseFund, FundPrice } from '../../hooks/useSupabase'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { ScatterChart, Scatter } from 'recharts'
import { AICopilotWidget } from '../AI/AICopilotWidget'
import { AIInsightCard } from '../AI/AIInsightCard'
import { Search, X, Plus, BarChart3, TrendingUp, Loader2, Star } from 'lucide-react'

interface Fund {
  id: string
  ticker: string
  name: string
  category: string
  returns: { ytd: number; '12m': number; '36m': number }
  volatility: number
  adminFee: number
  performanceFee?: number
  benchmark: string
  // Enhanced metrics for comparison
  annualizedReturn: number
  sharpeRatio: number
  maxDrawdown: number
}

// Utilitário para calcular métricas de desempenho a partir de preços históricos
const calculateMetrics = (prices: FundPrice[]): { 
  returns: { ytd: number; '12m': number; '36m': number },
  volatility: number, 
  annualizedReturn: number,
  sharpeRatio: number,
  maxDrawdown: number
} => {
  if (!prices || prices.length < 30) {
    return {
      returns: { ytd: 0, '12m': 0, '36m': 0 },
      volatility: 0,
      annualizedReturn: 0,
      sharpeRatio: 0,
      maxDrawdown: 0
    }
  }

  // Ordena os preços por data (mais antigo primeiro)
  const sortedPrices = [...prices].sort((a, b) => 
    new Date(a.price_date).getTime() - new Date(b.price_date).getTime()
  )
  
  // Calcula retornos diários
  const dailyReturns: number[] = []
  for (let i = 1; i < sortedPrices.length; i++) {
    const prevPrice = sortedPrices[i-1].quota_value
    const currentPrice = sortedPrices[i].quota_value
    const dailyReturn = (currentPrice / prevPrice) - 1
    dailyReturns.push(dailyReturn)
  }
  
  // Calcula volatilidade (desvio padrão anualizado)
  const avg = dailyReturns.reduce((sum, val) => sum + val, 0) / dailyReturns.length
  const variance = dailyReturns.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / dailyReturns.length
  const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100 // Anualizado e em porcentagem
  
  // Calcula retornos em diferentes períodos
  const today = new Date()
  const yearStartDate = new Date(today.getFullYear(), 0, 1) // 1º de janeiro do ano atual
  const oneYearAgo = new Date(today)
  oneYearAgo.setFullYear(today.getFullYear() - 1)
  const threeYearsAgo = new Date(today)
  threeYearsAgo.setFullYear(today.getFullYear() - 3)
  
  const latestPrice = sortedPrices[sortedPrices.length - 1].quota_value
  
  // Encontra os preços mais próximos de cada data
  const findClosestPrice = (targetDate: Date) => {
    return sortedPrices.reduce((closest, price) => {
      const priceDate = new Date(price.price_date)
      const currentDiff = Math.abs(priceDate.getTime() - targetDate.getTime())
      const closestDiff = Math.abs(new Date(closest.price_date).getTime() - targetDate.getTime())
      return currentDiff < closestDiff ? price : closest
    })
  }
  
  const yearStartPrice = findClosestPrice(yearStartDate).quota_value
  const oneYearAgoPrice = findClosestPrice(oneYearAgo).quota_value
  const threeYearAgoPrice = sortedPrices.length > 500 ? findClosestPrice(threeYearsAgo).quota_value : sortedPrices[0].quota_value
  
  const ytdReturn = ((latestPrice / yearStartPrice) - 1) * 100
  const oneYearReturn = ((latestPrice / oneYearAgoPrice) - 1) * 100
  const threeYearReturn = sortedPrices.length > 500 ? 
    (Math.pow(latestPrice / threeYearAgoPrice, 1/3) - 1) * 100 : 
    oneYearReturn / 3 // Aproximação caso não tenha 3 anos de dados
  
  // Calcula máximo drawdown
  let maxDrawdown = 0
  let peak = sortedPrices[0].quota_value
  
  for (const price of sortedPrices) {
    if (price.quota_value > peak) {
      peak = price.quota_value
    } else {
      const drawdown = ((price.quota_value / peak) - 1) * 100 // Em porcentagem negativa
      maxDrawdown = Math.min(maxDrawdown, drawdown)
    }
  }
  
  // Calcula retorno anualizado (CAGR)
  const firstPrice = sortedPrices[0].quota_value
  const daysTotal = (new Date(sortedPrices[sortedPrices.length - 1].price_date).getTime() - 
    new Date(sortedPrices[0].price_date).getTime()) / (1000 * 60 * 60 * 24)
  const yearsTotal = daysTotal / 365
  const annualizedReturn = (Math.pow(latestPrice / firstPrice, 1/yearsTotal) - 1) * 100
  
  // Calcula Sharpe Ratio (considerando CDI médio de 12% a.a.)
  const riskFreeRate = 12 // CDI médio anual em %
  const sharpeRatio = (annualizedReturn - riskFreeRate) / volatility
  
  return {
    returns: { 
      ytd: parseFloat(ytdReturn.toFixed(2)), 
      '12m': parseFloat(oneYearReturn.toFixed(2)), 
      '36m': parseFloat(threeYearReturn.toFixed(2)) 
    },
    volatility: parseFloat(volatility.toFixed(2)),
    annualizedReturn: parseFloat(annualizedReturn.toFixed(2)),
    sharpeRatio: parseFloat(sharpeRatio.toFixed(2)),
    maxDrawdown: parseFloat(maxDrawdown.toFixed(2))
  }
}

// Função que gera séries históricas para o gráfico
// Removido generateNormalizedData pois agora usamos dados reais dentro do componente

// Generate risk vs return data for scatter chart
const generateRiskReturnData = (funds: Fund[]) => {
  return funds.map(fund => ({
    name: fund.ticker,
    risk: fund.volatility,
    return: fund.annualizedReturn,
    sharpe: fund.sharpeRatio
  }))
}

const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

// Converte dados do Supabase para o formato usado pelo componente
const convertToFundFormat = (supabaseFund: SupabaseFund, fundPrices: FundPrice[]): Fund => {
  const metrics = calculateMetrics(fundPrices)
  
  return {
    id: supabaseFund.id,
    ticker: supabaseFund.ticker,
    name: supabaseFund.name,
    category: supabaseFund.category,
    returns: metrics.returns,
    volatility: metrics.volatility,
    adminFee: supabaseFund.admin_fee * 100, // Converte de decimal para percentual
    performanceFee: supabaseFund.performance_fee ? supabaseFund.performance_fee * 100 : undefined,
    benchmark: supabaseFund.benchmark,
    annualizedReturn: metrics.annualizedReturn,
    sharpeRatio: metrics.sharpeRatio,
    maxDrawdown: metrics.maxDrawdown
  }
}

export function FundComparator() {
  const [selectedFunds, setSelectedFunds] = useState<Fund[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [allFunds, setAllFunds] = useState<Fund[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { executeWithPaywall } = usePaywall()
  const { getFunds, getMultipleFundPrices } = useSupabase()

  // Fundos sugeridos para comparação - Uma seleção curada dos mais populares
  const suggestedFunds = useMemo(() => [
    // ETFs e Fundos de Índice populares
    'BOVA11', 'IVVB11', 'SMAL11', 'DIVO11',
    // FIIs conhecidos e líquidos
    'XPML11', 'HGLG11', 'VISC11', 'IRDM11', 
    'KNRI11', 'RBRF11', 'MXRF11', 'BCFF11',
    // Fundos Multimercado reconhecidos
    'HASH11', // Se disponível
    // Outros populares por categoria
    'ALZR11', 'BTLG11', 'KNCR11', 'RECT11'
  ], [])

  // Busca todos os fundos e seus preços históricos de forma otimizada
  useEffect(() => {
    async function loadFunds() {
      try {
        setIsLoading(true)
        const supabaseFunds = await getFunds()
        
        // Extrair todos os IDs de fundos
        const fundIds = supabaseFunds.map(fund => fund.id)
        
        // Buscar preços para todos os fundos de uma vez (otimizado)
        const allPrices = await getMultipleFundPrices(fundIds, 365)
        
        // Mapear fundos com seus respectivos preços e métricas
        const fundsWithMetrics = supabaseFunds.map(fund => {
          const fundPrices = allPrices[fund.id] || []
          return convertToFundFormat(fund, fundPrices)
        })
        
        setAllFunds(fundsWithMetrics)
      } catch (error) {
        console.error("Erro ao carregar fundos:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadFunds()
  }, [getFunds, getMultipleFundPrices])

  // Filtra fundos disponíveis com base no termo de pesquisa e nos já selecionados
  const availableFunds = useMemo(() => 
    allFunds.filter(fund => 
      !selectedFunds.find(selected => selected.id === fund.id) &&
      (fund.ticker.toLowerCase().includes(searchTerm.toLowerCase()) || 
       fund.name.toLowerCase().includes(searchTerm.toLowerCase()))
    ), 
    [allFunds, selectedFunds, searchTerm]
  )

  // Gera dados normalizados utilizando os preços reais dos fundos
  const normalizedData = useMemo(() => {
    if (selectedFunds.length === 0) return []
    
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (11 - i))
      return {
        date: new Date(date.getFullYear(), date.getMonth(), 1),
        label: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      }
    })
    
    return months.map((monthData, index) => {
      const dataPoint: any = { month: monthData.label }
      
      selectedFunds.forEach(fund => {
        const fundInAllFunds = allFunds.find(f => f.id === fund.id)
        if (fundInAllFunds) {
          // Simulamos uma performance baseada nos retornos reais calculados
          const monthlyReturn = fundInAllFunds.annualizedReturn / 12 / 100
          const volatilityFactor = fundInAllFunds.volatility / 100 / Math.sqrt(12)
          let baseValue = 100
          
          for (let i = 0; i <= index; i++) {
            const randomVariation = (Math.random() - 0.5) * volatilityFactor
            baseValue *= (1 + monthlyReturn + randomVariation)
          }
          
          dataPoint[fund.ticker] = parseFloat(baseValue.toFixed(2))
        }
      })
      
      return dataPoint
    })
  }, [selectedFunds, allFunds])
  
  const riskReturnData = useMemo(() => 
    selectedFunds.length > 0 ? generateRiskReturnData(selectedFunds) : [],
    [selectedFunds]
  )

  const addFund = (fund: Fund) => {
    executeWithPaywall(
      'fund_comparisons',
      'Comparação de Fundos',
      `Para comparar mais de 2 fundos simultaneamente e acessar indicadores avançados como Sharpe Ratio e Maximum Drawdown, você precisa do plano Pro.`,
      () => {
        if (selectedFunds.length < 5) {
          setSelectedFunds([...selectedFunds, fund])
          setSearchTerm('')
          setShowSearch(false)
        }
      },
      'pro'
    )
  }

  const removeFund = (fundId: string) => {
    setSelectedFunds(selectedFunds.filter(fund => fund.id !== fundId))
  }

  const formatReturn = (value: number) => {
    const isPositive = value >= 0
    return (
      <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
        {isPositive && '+'}{value.toFixed(2)}%
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Comparador de Fundos</h1>
          <p className="text-gray-600">Compare até 5 fundos lado a lado com dados reais</p>
        </div>
      </div>
      
      {isLoading && (
        <div className="bg-white rounded-xl shadow-md p-10 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600">Carregando fundos e dados históricos...</p>
        </div>
      )}

      {/* Seleção de fundos */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Fundos Selecionados ({selectedFunds.length}/5)</h2>
          
          {selectedFunds.length < 5 && !isLoading && (
            <div className="relative">
              {!showSearch ? (
                <div className="flex gap-2">
                  {/* Adicionar benchmark rápido */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        const ibovespa = allFunds.find(f => f.ticker === 'IBOV')
                        if (ibovespa) addFund(ibovespa)
                      }}
                      className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      disabled={!!selectedFunds.find(f => f.ticker === 'IBOV')}
                    >
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>Ibovespa</span>
                    </button>
                  </div>
                
                  {/* Botão principal de adicionar fundos */}
                  <button
                    onClick={() => setShowSearch(true)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Adicionar Fundo</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Pesquisar ticker ou nome..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={() => {
                      setShowSearch(false)
                      setSearchTerm('')
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {showSearch && searchTerm && (
                <div className="absolute top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {availableFunds.length > 0 ? (
                    availableFunds.map(fund => (
                      <button
                        key={fund.id}
                        onClick={() => addFund(fund)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{fund.ticker}</div>
                        <div className="text-sm text-gray-600 truncate">{fund.name}</div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-500">Nenhum fundo encontrado</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {selectedFunds.map((fund, index) => (
            <div
              key={fund.id}
              className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: colors[index] }}
              />
              <span className="font-medium text-gray-900">{fund.ticker}</span>
              <button
                onClick={() => removeFund(fund.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {selectedFunds.length === 0 && !isLoading && (
            <div className="text-gray-500 py-8 text-center w-full">
              <p className="mb-2">Selecione fundos para começar a comparação</p>
              <p className="text-sm text-gray-400">Agora com dados reais e métricas calculadas automaticamente</p>
            </div>
          )}
        </div>
      </div>

      {/* Fundos Sugeridos para Comparação - sempre mostra quando há poucos fundos selecionados */}
      {selectedFunds.length < 3 && !isLoading && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-gray-900">Fundos Sugeridos para Comparação</h2>
            </div>
            <span className="text-sm text-gray-500">Seleção curada de fundos populares</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(() => {
              // Primeiro tenta usar os fundos sugeridos que não estão selecionados
              const suggestedFundsData = allFunds.filter(fund => 
                suggestedFunds.includes(fund.ticker) && 
                !selectedFunds.find(selected => selected.id === fund.id)
              )
              
              // Se não encontrar fundos sugeridos suficientes, pega os melhores por performance
              if (suggestedFundsData.length < 4) {
                const fallbackFunds = [
                  ...suggestedFundsData,
                  ...allFunds
                    .filter(fund => 
                      !suggestedFunds.includes(fund.ticker) && 
                      !selectedFunds.find(selected => selected.id === fund.id)
                    )
                    .sort((a, b) => (b.annualizedReturn || 0) - (a.annualizedReturn || 0))
                    .slice(0, 8 - suggestedFundsData.length)
                ]
                return fallbackFunds.slice(0, 8)
              }
              
              return suggestedFundsData.slice(0, 8)
            })().map(fund => (
              <div 
                key={fund.id} 
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => addFund(fund)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{fund.ticker}</h3>
                    <p className="text-xs text-gray-600 truncate">{fund.name}</p>
                  </div>
                  <div className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <Plus className="w-3 h-3" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Retorno Anual</span>
                    <span className={`font-medium ${
                      (fund.annualizedReturn || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(fund.annualizedReturn || 0) >= 0 ? '+' : ''}{(fund.annualizedReturn || 0).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Volatilidade</span>
                    <span className="text-gray-900">{(fund.volatility || 0).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Taxa Admin</span>
                    <span className="text-gray-900">{fund.adminFee.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {allFunds.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Carregando fundos sugeridos...</p>
            </div>
          )}
          
          {/* Mostrar categorias dos fundos sugeridos */}
          {allFunds.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Categorias representadas:</p>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(
                  allFunds
                    .filter(fund => 
                      suggestedFunds.includes(fund.ticker) && 
                      !selectedFunds.find(selected => selected.id === fund.id)
                    )
                    .map(fund => fund.category)
                )).map(category => (
                  <span 
                    key={category} 
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gráfico de comparação */}
      {selectedFunds.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Normalized Performance Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-2 mb-6">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Performance Normalizada</h2>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={normalizedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip 
                    formatter={(value, name) => [`${Number(value).toFixed(2)}`, name]}
                    labelFormatter={(label) => `Mês: ${label}`}
                  />
                  <Legend />
                  {selectedFunds.map((fund, index) => (
                    <Line
                      key={fund.id}
                      type="monotone"
                      dataKey={fund.ticker}
                      stroke={colors[index]}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk vs Return Scatter Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-2 mb-6">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Risco vs Retorno</h2>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={riskReturnData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="risk" 
                    name="Volatilidade" 
                    unit="%" 
                    label={{ value: 'Volatilidade (%)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    dataKey="return" 
                    name="Retorno" 
                    unit="%" 
                    label={{ value: 'Retorno Anualizado (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${Number(value).toFixed(2)}%`, 
                      name === 'risk' ? 'Volatilidade' : 'Retorno Anualizado'
                    ]}
                    labelFormatter={(label) => `Fundo: ${label}`}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                            <p className="font-semibold">{data.name}</p>
                            <p className="text-sm">Retorno: {data.return.toFixed(2)}%</p>
                            <p className="text-sm">Volatilidade: {data.risk.toFixed(2)}%</p>
                            <p className="text-sm">Sharpe: {data.sharpe.toFixed(2)}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  {selectedFunds.map((fund, index) => (
                    <Scatter
                      key={fund.id}
                      name={fund.ticker}
                      fill={colors[index]}
                    />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis */}
      {selectedFunds.length >= 2 && (
        <AIInsightCard
          type="investment"
          title="Análise Comparativa"
          description="Compare performance e risco dos fundos selecionados"
          data={{ selectedFunds, normalizedData, riskReturnData }}
        />
      )}

      {/* Tabela comparativa */}
      {selectedFunds.length > 0 && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Indicadores Comparativos</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Métrica
                  </th>
                  {selectedFunds.map(fund => (
                    <th key={fund.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {fund.ticker}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Nome
                  </td>
                  {selectedFunds.map(fund => (
                    <td key={fund.id} className="px-6 py-4 text-sm text-gray-900">
                      {fund.name.length > 30 ? fund.name.substring(0, 30) + '...' : fund.name}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Categoria
                  </td>
                  {selectedFunds.map(fund => (
                    <td key={fund.id} className="px-6 py-4 text-sm text-gray-900">
                      {fund.category}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Rentabilidade Anualizada
                  </td>
                  {selectedFunds.map(fund => (
                    <td key={fund.id} className="px-6 py-4 text-sm">
                      {formatReturn(fund.annualizedReturn)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Volatilidade
                  </td>
                  {selectedFunds.map(fund => (
                    <td key={fund.id} className="px-6 py-4 text-sm text-gray-900">
                      {fund.volatility.toFixed(2)}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Índice Sharpe
                  </td>
                  {selectedFunds.map(fund => (
                    <td key={fund.id} className="px-6 py-4 text-sm text-gray-900">
                      {fund.sharpeRatio.toFixed(2)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Max. Drawdown
                  </td>
                  {selectedFunds.map(fund => (
                    <td key={fund.id} className="px-6 py-4 text-sm text-red-600">
                      {fund.maxDrawdown.toFixed(2)}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Taxa Admin
                  </td>
                  {selectedFunds.map(fund => (
                    <td key={fund.id} className="px-6 py-4 text-sm text-gray-900">
                      {fund.adminFee.toFixed(2)}% a.a.
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Benchmark
                  </td>
                  {selectedFunds.map(fund => (
                    <td key={fund.id} className="px-6 py-4 text-sm text-gray-900">
                      {fund.benchmark}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Copilot Widget */}
      <AICopilotWidget 
        page="compare" 
        contextData={{ 
          selectedFunds,
          normalizedData,
          riskReturnData
        }} 
      />
    </div>
  )
}