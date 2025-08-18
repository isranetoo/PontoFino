import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend, Area, AreaChart } from 'recharts'
import { RetirementResult, RetirementInput, formatCurrency } from '../../utils/retirementCalculations'

interface RetirementPlannerChartProps {
  result: RetirementResult
  input: RetirementInput
}

export function RetirementPlannerChart({ result, input }: RetirementPlannerChartProps) {
  // Prepare data for chart
  const chartData = result.series.map(point => ({
    age: point.age,
    year: new Date().getFullYear() + point.year,
    'Patrimônio (Base)': point.wealthBase,
    'Patrimônio (Consumo)': point.wealthSpend,
    'Gastos Anuais': point.expensesBase,
    'Renda Anual': point.incomesBase,
    'Retirada Necessária': point.withdrawalBase,
    isRetired: point.age >= input.retirementAge
  }))

  const formatTooltip = (value: number, name: string) => {
    const currency = name.includes('Consumo') ? input.spendCurrency : input.baseCurrency
    return [formatCurrency(value, currency), name]
  }

  const formatXAxisLabel = (value: number) => {
    return `${value} anos`
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
      {/* Wealth Projection Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="age" 
              tickFormatter={formatXAxisLabel}
              stroke="#666"
            />
            <YAxis 
              tickFormatter={formatYAxisLabel}
              stroke="#666"
            />
            <Tooltip 
              formatter={formatTooltip}
              labelFormatter={(label) => `Idade: ${label} anos`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            
            {/* Retirement age reference line */}
            <ReferenceLine 
              x={input.retirementAge} 
              stroke="#10B981" 
              strokeDasharray="5 5"
              label={{ value: "Aposentadoria", position: "topRight" }}
            />
            
            {/* Wealth projection lines */}
            <Line
              type="monotone"
              dataKey="Patrimônio (Base)"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#3B82F6' }}
            />
            <Line
              type="monotone"
              dataKey="Patrimônio (Consumo)"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#10B981' }}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Income vs Expenses Chart */}
      <div className="h-64">
        <h4 className="text-md font-medium text-gray-900 mb-4">Renda vs Gastos na Aposentadoria</h4>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData.filter(d => d.isRetired)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="age" 
              tickFormatter={formatXAxisLabel}
              stroke="#666"
            />
            <YAxis 
              tickFormatter={formatYAxisLabel}
              stroke="#666"
            />
            <Tooltip 
              formatter={formatTooltip}
              labelFormatter={(label) => `Idade: ${label} anos`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            
            <Area
              type="monotone"
              dataKey="Gastos Anuais"
              stackId="1"
              stroke="#EF4444"
              fill="#FEE2E2"
            />
            <Area
              type="monotone"
              dataKey="Renda Anual"
              stackId="2"
              stroke="#10B981"
              fill="#D1FAE5"
            />
            <Area
              type="monotone"
              dataKey="Retirada Necessária"
              stackId="3"
              stroke="#F59E0B"
              fill="#FEF3C7"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Legenda dos Gráficos</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-blue-500"></div>
            <span><strong>Patrimônio (Base):</strong> Valor em {input.baseCurrency}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-green-500 border-dashed border-t"></div>
            <span><strong>Patrimônio (Consumo):</strong> Valor em {input.spendCurrency}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-red-300"></div>
            <span><strong>Gastos Anuais:</strong> Despesas com inflação</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-green-300"></div>
            <span><strong>Renda Anual:</strong> Pensões e benefícios</span>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Insights do Gráfico</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• A linha vertical verde marca o início da aposentadoria</li>
          <li>• O patrimônio em {input.spendCurrency} mostra seu poder de compra no país de destino</li>
          <li>• A área entre renda e gastos mostra quanto precisa ser retirado do patrimônio</li>
          <li>• Monitore se o patrimônio se mantém positivo até os {input.lifeExpectancy} anos</li>
        </ul>
      </div>
    </div>
  )
}