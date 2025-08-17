import React, { useState, useEffect } from 'react'
import { useSupabase } from '../../hooks/useSupabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react'

interface BudgetHistoryProps {
  budgets: any[]
}

export function BudgetHistory({ budgets }: BudgetHistoryProps) {
  const { getTransactions } = useSupabase()
  const [historyData, setHistoryData] = useState<any[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState('6months')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    generateHistoryData()
  }, [budgets, selectedPeriod])

  const generateHistoryData = async () => {
    if (budgets.length === 0) return

    setLoading(true)
    try {
      const months = getMonthsForPeriod(selectedPeriod)
      
      const historyPromises = months.map(async (month) => {
        const monthData = {
          month: month.label,
          date: month.date,
          totalBudget: 0,
          totalSpent: 0,
          categories: {} as any
        }

        // Para cada orçamento, calcular gastos do mês
        for (const budget of budgets) {
          if (!budget.category) continue

          const startDate = `${month.date}-01`
          const endDate = `${month.date}-${new Date(month.date.split('-')[0], month.date.split('-')[1], 0).getDate()}`

          const transactionsResult = await getTransactions({
            category_id: budget.category_id,
            start_date: startDate,
            end_date: endDate
          })

          const spent = transactionsResult.data
            ?.filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0

          monthData.totalBudget += budget.amount
          monthData.totalSpent += spent
          monthData.categories[budget.category.name] = {
            budget: budget.amount,
            spent,
            percentage: (spent / budget.amount) * 100
          }
        }

        return monthData
      })

      const history = await Promise.all(historyPromises)
      setHistoryData(history.reverse()) // Mais recente primeiro

    } catch (err) {
      console.error('Erro ao gerar histórico:', err)
    } finally {
      setLoading(false)
    }
  }

  const getMonthsForPeriod = (period: string) => {
    const months = []
    const now = new Date()
    const monthsCount = period === '3months' ? 3 : period === '6months' ? 6 : 12

    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        label: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      })
    }

    return months
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const getComplianceRate = () => {
    if (historyData.length === 0) return 0
    const compliantMonths = historyData.filter(month => month.totalSpent <= month.totalBudget).length
    return (compliantMonths / historyData.length) * 100
  }

  const getAverageSpending = () => {
    if (historyData.length === 0) return 0
    const totalSpent = historyData.reduce((sum, month) => sum + month.totalSpent, 0)
    return totalSpent / historyData.length
  }

  const getTrend = () => {
    if (historyData.length < 2) return 'stable'
    const recent = historyData.slice(-3).reduce((sum, month) => sum + month.totalSpent, 0) / 3
    const older = historyData.slice(0, 3).reduce((sum, month) => sum + month.totalSpent, 0) / 3
    
    if (recent > older * 1.1) return 'increasing'
    if (recent < older * 0.9) return 'decreasing'
    return 'stable'
  }

  return (
    <div className="space-y-8">
      {/* Controles */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Histórico de Compliance</h3>
        <div className="flex space-x-2">
          {[
            { value: '3months', label: '3 meses' },
            { value: '6months', label: '6 meses' },
            { value: '12months', label: '12 meses' }
          ].map(period => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-sm border-2 transition-all duration-150
                ${selectedPeriod === period.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-400'}
              `}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Métricas resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow p-6 border border-blue-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-base font-semibold text-blue-900">Taxa de Compliance</span>
          </div>
          <p className="text-3xl font-bold text-blue-900">{getComplianceRate().toFixed(1)}%</p>
          <p className="text-sm text-blue-700">dos meses dentro do orçamento</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl shadow p-6 border border-green-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-base font-semibold text-green-900">Gasto Médio</span>
          </div>
          <p className="text-3xl font-bold text-green-900">{formatCurrency(getAverageSpending())}</p>
          <p className="text-sm text-green-700">por mês no período</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow p-6 border border-purple-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-base font-semibold text-purple-900">Tendência</span>
          </div>
          <p className="text-3xl font-bold text-purple-900">
            {getTrend() === 'increasing' ? '↗️' : getTrend() === 'decreasing' ? '↘️' : '→'}
          </p>
          <p className="text-sm text-purple-700">
            {getTrend() === 'increasing' ? 'Aumentando' : 
             getTrend() === 'decreasing' ? 'Diminuindo' : 'Estável'}
          </p>
        </div>
      </div>

      {/* Gráfico */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow p-10 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando histórico...</p>
        </div>
      ) : historyData.length > 0 ? (
        <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Orçamento vs Gastos Reais</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value, name) => [formatCurrency(Number(value)), name]}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Legend />
                <Bar dataKey="totalBudget" fill="#3B82F6" name="Orçamento" />
                <Bar dataKey="totalSpent" fill="#EF4444" name="Gasto Real" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-500">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p>Nenhum dado histórico disponível</p>
        </div>
      )}

      {/* Tabela detalhada */}
      {historyData.length > 0 && (
        <div className="bg-white rounded-2xl shadow overflow-hidden border border-gray-100">
          <div className="px-8 py-5 bg-gray-50 border-b">
            <h4 className="text-lg font-semibold text-gray-900">Detalhamento Mensal</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mês</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Orçamento</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Gasto</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Diferença</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {historyData.map((month, index) => {
                  const difference = month.totalBudget - month.totalSpent
                  const isCompliant = difference >= 0
                  return (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{month.month}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatCurrency(month.totalBudget)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatCurrency(month.totalSpent)}</td>
                      <td className={`px-6 py-4 text-sm text-right font-bold ${isCompliant ? 'text-green-600' : 'text-red-600'}`}>{isCompliant ? '+' : ''}{formatCurrency(difference)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-sm ${isCompliant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{isCompliant ? 'Dentro' : 'Excedido'}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}