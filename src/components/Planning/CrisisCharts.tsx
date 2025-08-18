import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { SimulationResult, formatCurrency } from '../../utils/crisisSimulation'

interface CrisisChartsProps {
  result: SimulationResult
}

export function CrisisCharts({ result }: CrisisChartsProps) {
  // Prepare data for before/after comparison chart
  const comparisonData = result.byClass.map(classResult => ({
    class: classResult.class,
    antes: classResult.valueBefore,
    depois: classResult.valueAfter,
    mudanca: classResult.change
  }))

  // Prepare data for tornado chart (sensitivity analysis)
  const tornadoData = result.sensitivities.map(sensitivity => ({
    factor: sensitivity.factor,
    impact: Math.abs(sensitivity.impact),
    direction: sensitivity.impact >= 0 ? 'positive' : 'negative',
    description: sensitivity.description
  })).sort((a, b) => b.impact - a.impact)

  const formatTooltip = (value: number, name: string) => {
    return [formatCurrency(value), name === 'antes' ? 'Antes' : name === 'depois' ? 'Depois' : name]
  }

  const formatTornadoTooltip = (value: number, name: string, props: any) => {
    const sign = props.payload.direction === 'positive' ? '+' : '-'
    return [`${sign}${formatCurrency(value)}`, 'Impacto']
  }

  return (
    <div className="space-y-8">
      {/* Before vs After Chart */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Antes vs Depois por Classe</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="class" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={formatTooltip}
                labelFormatter={(label) => `Classe: ${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="antes" fill="#3B82F6" name="Antes" />
              <Bar dataKey="depois" fill="#EF4444" name="Depois" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tornado Chart (Sensitivity Analysis) */}
      {tornadoData.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Análise de Sensibilidade</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={tornadoData} 
                layout="horizontal"
                margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <YAxis 
                  type="category" 
                  dataKey="factor" 
                  width={80}
                  fontSize={12}
                />
                <Tooltip 
                  formatter={formatTornadoTooltip}
                  labelFormatter={(label) => `Fator: ${label}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="impact">
                  {tornadoData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.direction === 'positive' ? '#10B981' : '#EF4444'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>📊 Gráfico mostra o impacto absoluto de cada fator de risco na carteira</p>
            <p>🟢 Verde: impacto positivo | 🔴 Vermelho: impacto negativo</p>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Estatísticas do Cenário</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Maior Perda por Classe:</span>
            <div className="font-medium text-red-600">
              {(() => {
                const worstClass = result.byClass.reduce((worst, current) => 
                  current.relChange < worst.relChange ? current : worst
                )
                return `${worstClass.class}: ${(worstClass.relChange * 100).toFixed(1)}%`
              })()}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Classe Mais Resiliente:</span>
            <div className="font-medium text-green-600">
              {(() => {
                const bestClass = result.byClass.reduce((best, current) => 
                  current.relChange > best.relChange ? current : best
                )
                return `${bestClass.class}: ${(bestClass.relChange * 100).toFixed(1)}%`
              })()}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Diversificação:</span>
            <div className="font-medium text-blue-600">
              {result.byClass.length} classe{result.byClass.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}