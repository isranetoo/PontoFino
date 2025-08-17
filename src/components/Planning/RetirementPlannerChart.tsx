import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend, Area, AreaChart } from 'recharts'
import { RetirementResult, RetirementInput, formatCurrency } from '../../utils/retirementCalculations'

interface RetirementPlannerChartProps {
  result: RetirementResult
  input: RetirementInput
}

export function RetirementPlannerChart({ result, input }: RetirementPlannerChartProps) {
  const chartData = result.series.map(point => ({
    age: point.age,
    year: new Date().getFullYear() + point.year,
    'Patrimônio (Base)': point.wealthBase,
    'Patrimônio (Consumo)': point.wealthSpend,
    'Gastos Anuais': point.expensesBase,
    'Renda Anual': point.incomesBase,
    'Retirada Necessária': point.withdrawalBase,
    isRetired: point.age >= input.retirementAge
  }));

  const formatTooltip = (value: number, name: string) => {
    const currency = name.includes('Consumo') ? input.spendCurrency : input.baseCurrency;
    return [formatCurrency(value, currency), name];
  };
  const formatXAxisLabel = (value: number) => `${value} anos`;
  const formatYAxisLabel = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
  };

  return (
    <div className="space-y-10">
      {/* Gráfico de Projeção de Patrimônio */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-100 rounded-2xl p-8 border border-blue-200 shadow-xl">
        <h3 className="text-2xl font-extrabold text-blue-900 mb-6 flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
          Projeção de Patrimônio ao Longo do Tempo
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ef" />
              <XAxis 
                dataKey="age" 
                tickFormatter={formatXAxisLabel}
                stroke="#6366f1"
                fontSize={14}
              />
              <YAxis 
                tickFormatter={formatYAxisLabel}
                stroke="#6366f1"
                fontSize={14}
              />
              <Tooltip 
                formatter={formatTooltip}
                labelFormatter={label => `Idade: ${label} anos`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  boxShadow: '0 4px 12px 0 rgba(0,0,0,0.08)'
                }}
              />
              <Legend iconType="circle"/>
              <ReferenceLine 
                x={input.retirementAge} 
                stroke="#10B981" 
                strokeDasharray="5 5"
                label={{ value: "Aposentadoria", position: "top", fill: '#10B981', fontWeight: 700 }}
              />
              <Line
                type="monotone"
                dataKey="Patrimônio (Base)"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 7, fill: '#3B82F6' }}
              />
              <Line
                type="monotone"
                dataKey="Patrimônio (Consumo)"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: '#10B981' }}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Renda vs Gastos */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow flex flex-col gap-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
          Renda vs Gastos na Aposentadoria
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {/* Gráfico de linhas para Renda Anual e Gastos Anuais */}
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="age" tickFormatter={formatXAxisLabel} stroke="#666" />
              <YAxis tickFormatter={formatYAxisLabel} stroke="#666" />
              <Tooltip formatter={formatTooltip} labelFormatter={label => `Idade: ${label} anos`} />
              <Legend iconType="circle"/>
              <Line
                type="monotone"
                dataKey="Renda Anual"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: '#6366f1' }}
              />
              <Line
                type="monotone"
                dataKey="Gastos Anuais"
                stroke="#f59e42"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: '#f59e42' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legenda dos Gráficos */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm">
        <h4 className="font-semibold text-gray-900 mb-4">Legenda dos Gráficos</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base">
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded-full bg-blue-500"></span>
            <span className="font-medium text-blue-900">Patrimônio (Base)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded-full bg-green-500"></span>
            <span className="font-medium text-green-900">Patrimônio (Consumo)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded-full bg-orange-400"></span>
            <span className="font-medium text-orange-900">Gastos Anuais</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded-full bg-indigo-500"></span>
            <span className="font-medium text-indigo-900">Renda Anual</span>
          </div>
        </div>
      </div>

      {/* Insights do Gráfico */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 shadow">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">💡 Insights do Gráfico</h4>
        <ul className="text-base text-blue-800 space-y-1">
          <li>O gráfico azul mostra a evolução do seu patrimônio na moeda base.</li>
          <li>O gráfico verde mostra o patrimônio ajustado para a moeda de consumo.</li>
          <li>Quando a linha azul cruza a idade de aposentadoria, você atinge sua meta.</li>
          <li>Compare renda e gastos para avaliar a sustentabilidade do plano.</li>
        </ul>
      </div>
    </div>
  );
}