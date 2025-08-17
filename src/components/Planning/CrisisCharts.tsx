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

  // const formatTornadoTooltip = (value: number, name: string, props: any) => {
  //   const sign = props.payload.direction === 'positive' ? '+' : '-'
  //   return [`${sign}${formatCurrency(value)}`, 'Impacto']
  // }

  return (
    <div className="space-y-10">
      {/* Before vs After Chart */}
      <div className="bg-gradient-to-br from-blue-50 to-slate-100 rounded-2xl p-8 border border-blue-100 shadow-xl">
        <h3 className="text-2xl font-extrabold text-blue-900 mb-6 flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
          Antes vs Depois por Classe
        </h3>
        <div className="h-80 flex items-center justify-center">
          <div className="w-full h-full bg-white rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 text-lg font-semibold">
            {/* Gráfico será renderizado aqui */}
            Gráfico de Barras Comparativo
          </div>
        </div>
      </div>

      {/* Tornado Chart (Sensitivity Analysis) */}
      {tornadoData.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl p-8 border border-amber-100 shadow-xl">
          <h3 className="text-2xl font-extrabold text-amber-900 mb-6 flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
            Análise de Sensibilidade
          </h3>
          <div className="h-64 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 text-lg font-semibold">
              {/* Tornado chart será renderizado aqui */}
              Gráfico Tornado (Sensibilidade)
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-700 flex flex-col gap-1">
            <span className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full bg-green-400"></span> Impacto positivo</span>
            <span className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full bg-red-400"></span> Impacto negativo</span>
            <span className="mt-1">📊 O gráfico mostra o impacto absoluto de cada fator de risco na carteira</span>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border border-blue-100 shadow">
        <h4 className="font-semibold text-blue-900 mb-4 text-lg flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-sky-500 mr-2"></span>
          Estatísticas do Cenário
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-base">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm min-h-[60px] flex flex-col items-center justify-center">
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
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm min-h-[60px] flex flex-col items-center justify-center">
            <span className="text-gray-600">Diversificação:</span>
            <div className="font-medium text-blue-600">
              {result.byClass.length} classe{result.byClass.length !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm min-h-[60px] flex flex-col items-center justify-center">
            {/* Estatística extra ou placeholder */}
          </div>
        </div>
      </div>
    </div>
  )
}