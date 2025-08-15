import React, { useState } from 'react'
import { useEffect } from 'react'
import { getDayOfYear } from 'date-fns'
import { useSupabase } from '../../hooks/useSupabase'
import { usePaywall } from '../../hooks/usePaywall'
import { FundCard } from './FundCard'
import { AICopilotWidget } from '../AI/AICopilotWidget'
import { AIInsightCard } from '../AI/AIInsightCard'
import { Search, Filter, SortAsc, Bot, TrendingUp, Star } from 'lucide-react'

/**
 * Lista de fundos integrada com Supabase
 * 
 * Funcionalidades:
 * - Carrega fundos do catálogo público
 * - Filtros por categoria e busca por nome/ticker
 * - Ordenação por diferentes critérios
 * - Integração com watchlist do usuário
 * - Cálculo de indicadores em tempo real
 * 
 * Como personalizar:
 * - Adicione novos filtros (ex: taxa máxima, risco)
 * - Modifique critérios de ordenação
 * - Altere layout dos cards conforme necessário
 */

export function FundsList() {
  const { 
    getFunds, 
    getFundPrices, 
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    loading, 
    error 
  } = useSupabase()
  
  // Estados
  const [funds, setFunds] = useState<any[]>([])
  const [watchlistedFunds, setWatchlistedFunds] = useState<Set<string>>(new Set())
  const [fundsWithReturns, setFundsWithReturns] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [loadingReturns, setLoadingReturns] = useState(false)
  const { executeWithPaywall } = usePaywall()

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Carregar fundos
        const fundsResult = await getFunds({
          search: searchTerm,
          category: selectedCategory
        })
        if (fundsResult.data) {
          setFunds(fundsResult.data)
        }

        // Carregar watchlist
        const watchlistResult = await getWatchlist()
        if (watchlistResult.data) {
          const watchlistedIds = new Set(watchlistResult.data.map(item => item.fund_id))
          setWatchlistedFunds(watchlistedIds)
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
      }
    }

    loadInitialData()
  }, [getFunds, getWatchlist, searchTerm, selectedCategory])

  // Calcular retornos dos fundos
  useEffect(() => {
    const calculateReturns = async () => {
      if (funds.length === 0) return
      
      setLoadingReturns(true)
      try {
        const fundsWithCalculatedReturns = await Promise.all(
          funds.map(async (fund) => {
            try {
              // Buscar preços dos últimos 3 anos
              const pricesResult = await getFundPrices(fund.id, 1095) // ~3 anos
              
              if (pricesResult.data && pricesResult.data.length > 0) {
                const prices = pricesResult.data.sort((a, b) => 
                  new Date(a.price_date).getTime() - new Date(b.price_date).getTime()
                )
                
                const latestPrice = prices[prices.length - 1]?.quota_value || 0
                
                // Calcular retornos
                const calculateReturn = (daysAgo: number) => {
                  const targetDate = new Date()
                  targetDate.setDate(targetDate.getDate() - daysAgo)
                  
                  const closestPrice = prices.find(p => 
                    new Date(p.price_date) >= targetDate
                  ) || prices[0]
                  
                  if (!closestPrice || closestPrice.quota_value === 0) return 0
                  return ((latestPrice - closestPrice.quota_value) / closestPrice.quota_value) * 100
                }
                
                // Calcular rentabilidade recente (últimos 30 dias)
                const recentReturn = calculateReturn(30)
                
                return {
                  ...fund,
                  returns: {
                    recent: recentReturn,
                    ytd: calculateReturn(getDayOfYear(new Date()) || 365), // YTD aproximado
                    '12m': calculateReturn(365),
                    '36m': calculateReturn(1095)
                  },
                  isWatchlisted: watchlistedFunds.has(fund.id)
                }
              }
              
              // Fallback se não houver dados de preço
              return {
                ...fund,
                returns: { recent: 0, ytd: 0, '12m': 0, '36m': 0 },
                isWatchlisted: watchlistedFunds.has(fund.id)
              }
            } catch (err) {
              console.error(`Erro ao calcular retornos para ${fund.ticker}:`, err)
              return {
                ...fund,
                returns: { recent: 0, ytd: 0, '12m': 0, '36m': 0 },
                isWatchlisted: watchlistedFunds.has(fund.id)
              }
            }
          })
        )
        setFundsWithReturns(fundsWithCalculatedReturns)
      } catch (err) {
        console.error('Erro ao calcular retornos:', err)
      } finally {
        setLoadingReturns(false)
      }
    }

    calculateReturns()
  }, [funds, watchlistedFunds, getFundPrices])


  // Categorias fixas conforme especificação
  const categories = [
    'Renda Fixa',
    'Multimercado', 
    'Ações',
    'FII'
  ]

  const filteredFunds = fundsWithReturns
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return (b.returns?.recent || 0) - (a.returns?.recent || 0)
        case 'ytd':
          return (b.returns?.ytd || 0) - (a.returns?.ytd || 0)
        case '12m':
          return (b.returns?.['12m'] || 0) - (a.returns?.['12m'] || 0)
        case 'adminFee':
          return a.admin_fee - b.admin_fee
        default:
          return a.name.localeCompare(b.name)
      }
    })

  const handleToggleWatchlist = async (fundId: string) => {
    try {
      const isWatchlisted = watchlistedFunds.has(fundId)
      
      if (isWatchlisted) {
        const result = await removeFromWatchlist(fundId)
        if (!result.error) {
          setWatchlistedFunds(prev => {
            const newSet = new Set(prev)
            newSet.delete(fundId)
            return newSet
          })
          // Atualizar o fund específico
          setFundsWithReturns(prev => 
            prev.map(fund => 
              fund.id === fundId ? { ...fund, isWatchlisted: false } : fund
            )
          )
        }
      } else {
        const result = await addToWatchlist(fundId)
        if (!result.error) {
          setWatchlistedFunds(prev => new Set([...prev, fundId]))
          // Atualizar o fund específico
          setFundsWithReturns(prev => 
            prev.map(fund => 
              fund.id === fundId ? { ...fund, isWatchlisted: true } : fund
            )
          )
        }
      }
      
      // Generate AI recommendations
      // generateAIRecommendations(fundsWithCalculatedReturns)
    } catch (err) {
      console.error('Erro ao alterar watchlist:', err)
    }
  }

  const handleViewDetails = (fundId: string) => {
    // TODO: Implementar navegação para detalhes do fundo
    console.log('View details for fund:', fundId)
  }

  // Loading state
  if (loading && funds.length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Catálogo de Fundos</h1>
          <p className="text-gray-600">Pesquise, compare e acompanhe os melhores fundos do mercado</p>
        </div>
      </div>

      {/* Mostrar erro se houver */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Erro ao carregar fundos: {error}
        </div>
      )}

      {/* AI Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AIInsightCard
          type="investment"
          title="Análise de Fundos"
          description="Recomendações baseadas em performance"
          data={{ funds: fundsWithReturns.slice(0, 10) }}
          compact
        />
        <AIInsightCard
          type="general"
          title="Diversificação Inteligente"
          description="Otimize sua carteira de fundos"
          data={{ watchlist: watchlistedFunds }}
          compact
        />
      </div>

      {/* Filtros e pesquisa */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Pesquisar fundo ou ticker..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="">Todas as categorias</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <SortAsc className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="name">Nome</option>
              <option value="recent">Rentabilidade Recente</option>
              <option value="ytd">Retorno YTD</option>
              <option value="12m">Retorno 12M</option>
              <option value="adminFee">Taxa Admin</option>
            </select>
          </div>

          <div className="text-sm text-gray-600 flex items-center">
            {filteredFunds.length} fundo{filteredFunds.length !== 1 ? 's' : ''} encontrado{filteredFunds.length !== 1 ? 's' : ''}
            {loadingReturns && (
              <span className="ml-2 text-blue-600">
                (calculando retornos...)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Lista de fundos */}
      {loadingReturns ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFunds.map(fund => (
            <div key={fund.id} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFunds.map(fund => (
            <FundCard
              key={fund.id}
              fund={{
                ...fund,
                adminFee: fund.admin_fee,
                performanceFee: fund.performance_fee,
                riskLevel: fund.risk_level
              }}
              onToggleWatchlist={handleToggleWatchlist}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {filteredFunds.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">Nenhum fundo encontrado</p>
          <p className="text-gray-400">Tente ajustar os filtros de pesquisa</p>
        </div>
      )}

      {/* AI Copilot Widget */}
      <AICopilotWidget 
        page="funds" 
        contextData={{ 
          funds: filteredFunds,
          watchlist: Array.from(watchlistedFunds),
          searchTerm,
          selectedCategory
        }} 
      />
    </div>
  )
}