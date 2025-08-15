import React, { useState } from 'react'
import { usePaywall } from '../../hooks/usePaywall'
import { useSupabase } from '../../hooks/useSupabase'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { ScatterChart, Scatter } from 'recharts'
import { AICopilotWidget } from '../AI/AICopilotWidget'
import { AIInsightCard } from '../AI/AIInsightCard'
import { Search, X, Plus, BarChart3, Bot, Target, TrendingUp } from 'lucide-react'

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

// Mock data para demonstração
const mockFunds = [
  {
    id: '1',
    ticker: 'HASH11',
    name: 'Hashdex Nasdaq Crypto Index FII',
    category: 'Criptomoedas',
    returns: { ytd: 45.2, '12m': 78.5, '36m': 125.8 },
    volatility: 28.5,
    adminFee: 1.30,
    benchmark: 'NASDAQ Crypto Index',
    annualizedReturn: 65.4,
    sharpeRatio: 1.8,
    maxDrawdown: -35.2
  },
  {
    id: '2',
    ticker: 'IVVB11',
    name: 'iShares Core S&P 500 FII',
    category: 'Ações Internacionais',
    returns: { ytd: 12.8, '12m': 24.3, '36m': 45.7 },
    volatility: 18.2,
    adminFee: 0.30,
    benchmark: 'S&P 500',
    annualizedReturn: 22.1,
    sharpeRatio: 1.2,
    maxDrawdown: -18.7
  },
  {
    id: '3',
    ticker: 'XPML11',
    name: 'XP Malls FII',
    category: 'Fundos Imobiliários',
    returns: { ytd: 8.4, '12m': 15.6, '36m': 28.9 },
    volatility: 12.8,
    adminFee: 1.00,
    benchmark: 'IFIX',
    annualizedReturn: 18.3,
    sharpeRatio: 1.4,
    maxDrawdown: -12.1
  }
]

// Mock data para gráfico normalizado
const generateNormalizedData = (funds: Fund[]) => {
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (11 - i))
    return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
  })

  return months.map((month, index) => {
    const dataPoint: any = { month }
    
    funds.forEach(fund => {
      // Simulação de performance normalizada (começando em 100)
      const volatility = fund.volatility / 100
      const trend = fund.returns['12m'] / 1200 // Retorno mensal médio
      const randomFactor = (Math.random() - 0.5) * volatility * 2
      
      let value = 100
      for (let i = 0; i <= index; i++) {
        value *= (1 + trend + (Math.random() - 0.5) * volatility * 0.3)
      }
      
      dataPoint[fund.ticker] = Math.max(value, 80) // Mínimo de 80 para visualização
    })
    
    return dataPoint
  })
}

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

export function FundComparator() {
  const [selectedFunds, setSelectedFunds] = useState<Fund[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const { executeWithPaywall } = usePaywall()
  const { } = useSupabase()

  const availableFunds = mockFunds.filter(fund => 
    !selectedFunds.find(selected => selected.id === fund.id) &&
    fund.ticker.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const normalizedData = selectedFunds.length > 0 ? generateNormalizedData(selectedFunds) : []
  const riskReturnData = selectedFunds.length > 0 ? generateRiskReturnData(selectedFunds) : []

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
          <p className="text-gray-600">Compare até 5 fundos lado a lado</p>
        </div>
      </div>

      {/* Seleção de fundos */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Fundos Selecionados ({selectedFunds.length}/5)</h2>
          
          {selectedFunds.length < 5 && (
            <div className="relative">
              {!showSearch ? (
                <button
                  onClick={() => setShowSearch(true)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Adicionar Fundo</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Pesquisar ticker..."
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

          {selectedFunds.length === 0 && (
            <div className="text-gray-500 py-8 text-center w-full">
              Selecione fundos para começar a comparação
            </div>
          )}
        </div>
      </div>

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