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

  const formatTooltip = (value: number, name: string) => {
    return [formatCurrency(value), name]
  }

  const formatXAxisLabel = (value: number) => {
    return `${value}a`
  }

  const formatYAxisLabel = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`
    }
    return value.toString()
  }

  return (
    <div className="space-y-6">
      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="year" 
              tickFormatter={formatXAxisLabel}
              stroke="#666"
            />
            <YAxis 
              tickFormatter={formatYAxisLabel}
              stroke="#666"
            />
            <Tooltip 
              formatter={formatTooltip}
              labelFormatter={(label) => `Ano ${label}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            
            {/* Target wealth reference line */}
            <ReferenceLine 
              y={result.targetWealthReal} 
              stroke="#10B981" 
              strokeDasharray="5 5"
              label={{ value: "Meta FIRE", position: "topRight" }}
            />
            
            {/* Wealth projection lines */}
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

      {/* Chart Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Legenda do Gráfico</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-green-500"></div>
            <span><strong>Patrimônio Real:</strong> Valor em poder de compra atual</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-blue-500 border-dashed border-t"></div>
            <span><strong>Patrimônio Nominal:</strong> Valor sem ajuste de inflação</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-green-500 border-dashed border-t"></div>
            <span><strong>Meta FIRE:</strong> Patrimônio necessário para independência</span>
          </div>
          <div className="text-gray-600">
            <span><strong>Eixo X:</strong> Anos a partir de hoje</span>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Insights Importantes</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• O <strong>patrimônio real</strong> mostra seu poder de compra futuro</li>
          <li>• A diferença entre as linhas representa o impacto da inflação</li>
          <li>• Quando a linha verde cruza a meta, você atinge a independência financeira</li>
          <li>• Após atingir a meta, você pode retirar {(result.series[0] ? (result.targetWealthReal / (result.series[0].wealth_real || 1) * 12) : 0).toFixed(0)}% do patrimônio anualmente</li>
        </ul>
      </div>
    </div>
  )
}