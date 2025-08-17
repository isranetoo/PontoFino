import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts'
import { FireResult, formatCurrency } from '../../utils/fireCalculations'

interface FirePlannerChartProps {
  result: FireResult
}

export function FirePlannerChart({ result }: FirePlannerChartProps) {
  // Prepare data for chart (sample every 12 months for better performance)
  const chartData = result.series
    .filter((_, index) => index % 12 === 0 || index === result.series.length - 1)
    .map(point => ({
      year: Math.round(point.month / 12 * 10) / 10,
      'Patrimônio Nominal': point.wealth_nominal,
      'Patrimônio Real': point.wealth_real,
      month: point.month
    }))

  const formatTooltip = (value: number, name: string) => [formatCurrency(value), name]
  const formatXAxisLabel = (value: number) => `${value}a`
  const formatYAxisLabel = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`
    }
    return value.toString()
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 border border-blue-100 shadow">
        <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
          Projeção de Patrimônio ao Longo do Tempo
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ef" />
              <XAxis 
                dataKey="year" 
                tickFormatter={formatXAxisLabel}
                stroke="#666"
              />
              <YAxis 
                tickFormatter={(value) => String(formatYAxisLabel(value))}
                stroke="#666"
              />
              <Tooltip 
                formatter={formatTooltip}
                labelFormatter={(label) => `Ano ${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  boxShadow: '0 4px 12px -2px rgba(16, 185, 129, 0.10)'
                }}
              />
              <Legend />
              <ReferenceLine 
                y={result.targetWealthReal} 
                stroke="#10B981" 
                strokeDasharray="5 5"
                label={{ value: "Meta FIRE", fill: '#10B981', fontWeight: 700 }}
              />
              <Line
                type="monotone"
                dataKey="Patrimônio Real"
                stroke="#10B981"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: '#10B981' }}
              />
              <Line
                type="monotone"
                dataKey="Patrimônio Nominal"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#3B82F6' }}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart Legend */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h4 className="font-semibold text-gray-900 mb-4">Legenda do Gráfico</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base">
          <div className="flex items-center gap-2">
            <div className="w-6 h-1 bg-green-500 rounded"></div>
            <span>Valor em poder de compra atual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-1 bg-blue-500 border-dashed border-t"></div>
            <span>Valor sem ajuste de inflação</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-1 bg-green-500 border-dashed border-t"></div>
            <span>Patrimônio necessário para independência</span>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100 shadow">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">💡 Insights Importantes</h4>
        <ul className="text-base text-blue-800 space-y-1">
          <li>A linha verde mostra seu poder de compra futuro.</li>
          <li>A diferença entre as linhas representa o impacto da inflação.</li>
          <li>Quando a linha verde cruza a meta, você atinge a independência financeira.</li>
          <li>Após atingir a meta, você pode retirar um percentual seguro do patrimônio anualmente.</li>
        </ul>
      </div>
    </div>
  )
}