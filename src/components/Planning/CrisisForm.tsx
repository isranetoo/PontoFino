import React from 'react'
import { Shock, MarketContext, formatPercentage } from '../../utils/crisisSimulation'
import { 
  TrendingDown, 
  Percent, 
  DollarSign,
  AlertTriangle,
  RotateCcw
} from 'lucide-react'

interface CrisisFormProps {
  shocks: Shock
  context: MarketContext
  onChange: (field: keyof Shock, value: number) => void
  errors: string[]
}

export function CrisisForm({ shocks, context, onChange, errors }: CrisisFormProps) {
  const handleSliderChange = (field: keyof Shock, value: string) => {
    const numValue = parseFloat(value) / 100 // Convert percentage to decimal
    onChange(field, numValue)
  }

  const resetToDefaults = () => {
    onChange('equityIdx', -0.4)
    onChange('rateAbs', 0.15)
    onChange('fxUSD', 0.25)
  }

  return (
    <div className="space-y-8">
      {/* Current Market Context */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border border-blue-100 shadow">
        <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
          Condições Atuais do Mercado
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-base">
          <div className="bg-white rounded-xl border border-blue-100 p-4 shadow-sm min-h-[60px] flex flex-col items-center justify-center">
            <span className="text-blue-700">Taxa Selic</span>
            <span className="font-bold text-blue-900 text-lg">{formatPercentage(context.currentRate)}</span>
          </div>
          <div className="bg-white rounded-xl border border-blue-100 p-4 shadow-sm min-h-[60px] flex flex-col items-center justify-center">
            <span className="text-blue-700">USD/BRL</span>
            <span className="font-bold text-blue-900 text-lg">R$ {context.currentFxRate.toFixed(2)}</span>
          </div>
          <div className="bg-white rounded-xl border border-blue-100 p-4 shadow-sm min-h-[60px] flex flex-col items-center justify-center">
            <span className="text-blue-700">Ibovespa</span>
            <span className="font-bold text-blue-900 text-lg">{context.currentIndex.toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>

      {/* Equity Market Shock */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow flex flex-col gap-2">
  <label className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-red-600" />
          Choque no Mercado de Ações
        </label>
        <input
          type="range"
          min="-60"
          max="60"
          step="1"
          value={(shocks.equityIdx ?? 0) * 100}
          onChange={(e) => handleSliderChange('equityIdx', e.target.value)}
          className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-red-400 transition-all"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>-60%</span>
          <span className={`font-medium ${(shocks.equityIdx ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{((shocks.equityIdx ?? 0) * 100).toFixed(1)}%</span>
          <span>+60%</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Variação no índice de ações (Ibovespa). Afeta ações e FIIs com base no beta.
        </p>
      </div>

      {/* Interest Rate Shock */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow flex flex-col gap-2">
  <label className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Percent className="w-5 h-5 text-orange-600" />
          Choque na Taxa de Juros
        </label>
        <input
          type="range"
          min="5"
          max="20"
          step="0.25"
          value={(shocks.rateAbs ?? context.currentRate) * 100}
          onChange={(e) => onChange('rateAbs', parseFloat(e.target.value) / 100)}
          className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-orange-400 transition-all"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>5%</span>
          <span className="font-medium text-orange-600">{((shocks.rateAbs ?? context.currentRate) * 100).toFixed(2)}%</span>
          <span>20%</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          <p>Taxa de juros alvo (Selic). Atual: {formatPercentage(context.currentRate)}</p>
          <p>Variação: {((shocks.rateAbs ?? context.currentRate) - context.currentRate > 0 ? '+' : '')}{(((shocks.rateAbs ?? context.currentRate) - context.currentRate) * 100).toFixed(2)} p.p.</p>
        </div>
      </div>

      {/* FX Shock */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow flex flex-col gap-2">
  <label className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Choque no Dólar (USD/BRL)
        </label>
        <input
          type="range"
          min="-30"
          max="50"
          step="1"
          value={(shocks.fxUSD ?? 0) * 100}
          onChange={(e) => handleSliderChange('fxUSD', e.target.value)}
          className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-green-400 transition-all"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>-30%</span>
          <span className={`font-medium ${(shocks.fxUSD ?? 0) >= 0 ? 'text-red-600' : 'text-green-600'}`}>{((shocks.fxUSD ?? 0) * 100).toFixed(1)}%</span>
          <span>+50%</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          <p>Variação na taxa de câmbio USD/BRL. Atual: R$ {context.currentFxRate.toFixed(2)}</p>
          <p>Nova taxa: R$ {(context.currentFxRate * (1 + (shocks.fxUSD ?? 0))).toFixed(2)}</p>
        </div>
      </div>

      {/* Preset Scenarios */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-blue-100 shadow">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
          Cenários Pré-definidos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              onChange('equityIdx', -0.2)
              onChange('rateAbs', 0.16)
              onChange('fxUSD', 0.15)
            }}
            className="p-4 border-2 border-gray-200 rounded-xl hover:bg-blue-50 text-left transition-colors shadow-sm"
          >
            <div className="font-semibold text-gray-900">Crise Moderada</div>
            <div className="text-sm text-gray-600">-20% ações, 16% juros, +15% USD</div>
          </button>
          <button
            type="button"
            onClick={() => {
              onChange('equityIdx', -0.4)
              onChange('rateAbs', 0.18)
              onChange('fxUSD', 0.3)
            }}
            className="p-4 border-2 border-gray-200 rounded-xl hover:bg-blue-50 text-left transition-colors shadow-sm"
          >
            <div className="font-semibold text-gray-900">Crise Severa</div>
            <div className="text-sm text-gray-600">-40% ações, 18% juros, +30% USD</div>
          </button>
          <button
            type="button"
            onClick={() => {
              onChange('equityIdx', -0.6)
              onChange('rateAbs', 0.2)
              onChange('fxUSD', 0.5)
            }}
            className="p-4 border-2 border-gray-200 rounded-xl hover:bg-blue-50 text-left transition-colors shadow-sm"
          >
            <div className="font-semibold text-gray-900">Crise Extrema</div>
            <div className="text-sm text-gray-600">-60% ações, 20% juros, +50% USD</div>
          </button>
          <button
            type="button"
            onClick={resetToDefaults}
            className="p-4 border-2 border-gray-200 rounded-xl hover:bg-blue-50 text-left transition-colors flex items-center gap-2 shadow-sm"
          >
            <RotateCcw className="w-5 h-5 text-gray-600" />
            <div>
              <div className="font-semibold text-gray-900">Padrão</div>
              <div className="text-sm text-gray-600">-40% ações, 15% juros, +25% USD</div>
            </div>
          </button>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mt-2 flex items-start gap-3 shadow">
        <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1" />
        <div>
          <span className="font-semibold text-yellow-800">Atenção:</span>
          <p className="text-yellow-700 mt-1 text-sm">
            Esta simulação usa aproximações matemáticas e não considera todos os fatores de risco.<br/>
            Use apenas como referência para análise de cenários.
          </p>
        </div>
      </div>
    </div>
  )
}