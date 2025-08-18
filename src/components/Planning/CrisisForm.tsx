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
    <div className="space-y-6">
      {/* Current Market Context */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-3">Condições Atuais do Mercado</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Taxa Selic:</span>
            <span className="font-medium text-blue-900 ml-2">
              {formatPercentage(context.currentRate)}
            </span>
          </div>
          <div>
            <span className="text-blue-700">USD/BRL:</span>
            <span className="font-medium text-blue-900 ml-2">
              R$ {context.currentFxRate.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-blue-700">Ibovespa:</span>
            <span className="font-medium text-blue-900 ml-2">
              {context.currentIndex.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>
      </div>

      {/* Equity Market Shock */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <div className="flex items-center space-x-2">
            <TrendingDown className="w-4 h-4 text-red-600" />
            <span>Choque no Mercado de Ações</span>
          </div>
        </label>
        
        <div className="space-y-3">
          <input
            type="range"
            min="-60"
            max="60"
            step="1"
            value={(shocks.equityIdx ?? 0) * 100}
            onChange={(e) => handleSliderChange('equityIdx', e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-red"
          />
          
          <div className="flex justify-between text-sm text-gray-600">
            <span>-60%</span>
            <span className={`font-medium ${
              (shocks.equityIdx ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {((shocks.equityIdx ?? 0) * 100).toFixed(1)}%
            </span>
            <span>+60%</span>
          </div>
          
          <p className="text-xs text-gray-500">
            Variação no índice de ações (Ibovespa). Afeta ações e FIIs com base no beta.
          </p>
        </div>
      </div>

      {/* Interest Rate Shock */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <div className="flex items-center space-x-2">
            <Percent className="w-4 h-4 text-orange-600" />
            <span>Taxa de Juros Alvo</span>
          </div>
        </label>
        
        <div className="space-y-3">
          <input
            type="range"
            min="5"
            max="20"
            step="0.25"
            value={(shocks.rateAbs ?? context.currentRate) * 100}
            onChange={(e) => onChange('rateAbs', parseFloat(e.target.value) / 100)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-orange"
          />
          
          <div className="flex justify-between text-sm text-gray-600">
            <span>5%</span>
            <span className="font-medium text-orange-600">
              {((shocks.rateAbs ?? context.currentRate) * 100).toFixed(2)}%
            </span>
            <span>20%</span>
          </div>
          
          <div className="text-xs text-gray-500">
            <p>Taxa de juros alvo (Selic). Atual: {formatPercentage(context.currentRate)}</p>
            <p>Variação: {((shocks.rateAbs ?? context.currentRate) - context.currentRate > 0 ? '+' : '')}
              {(((shocks.rateAbs ?? context.currentRate) - context.currentRate) * 100).toFixed(2)} p.p.
            </p>
          </div>
        </div>
      </div>

      {/* FX Shock */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span>Variação USD/BRL</span>
          </div>
        </label>
        
        <div className="space-y-3">
          <input
            type="range"
            min="-30"
            max="50"
            step="1"
            value={(shocks.fxUSD ?? 0) * 100}
            onChange={(e) => handleSliderChange('fxUSD', e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-green"
          />
          
          <div className="flex justify-between text-sm text-gray-600">
            <span>-30%</span>
            <span className={`font-medium ${
              (shocks.fxUSD ?? 0) >= 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {((shocks.fxUSD ?? 0) * 100).toFixed(1)}%
            </span>
            <span>+50%</span>
          </div>
          
          <div className="text-xs text-gray-500">
            <p>Variação na taxa de câmbio USD/BRL. Atual: R$ {context.currentFxRate.toFixed(2)}</p>
            <p>Nova taxa: R$ {(context.currentFxRate * (1 + (shocks.fxUSD ?? 0))).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Preset Scenarios */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cenários Pré-definidos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              onChange('equityIdx', -0.2)
              onChange('rateAbs', 0.16)
              onChange('fxUSD', 0.15)
            }}
            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <div className="font-medium text-gray-900">Crise Moderada</div>
            <div className="text-sm text-gray-600">-20% ações, 16% juros, +15% USD</div>
          </button>
          
          <button
            type="button"
            onClick={() => {
              onChange('equityIdx', -0.4)
              onChange('rateAbs', 0.18)
              onChange('fxUSD', 0.3)
            }}
            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <div className="font-medium text-gray-900">Crise Severa</div>
            <div className="text-sm text-gray-600">-40% ações, 18% juros, +30% USD</div>
          </button>
          
          <button
            type="button"
            onClick={() => {
              onChange('equityIdx', -0.6)
              onChange('rateAbs', 0.2)
              onChange('fxUSD', 0.5)
            }}
            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <div className="font-medium text-gray-900">Crise Extrema</div>
            <div className="text-sm text-gray-600">-60% ações, 20% juros, +50% USD</div>
          </button>
          
          <button
            type="button"
            onClick={resetToDefaults}
            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4 text-gray-600" />
            <div>
              <div className="font-medium text-gray-900">Padrão</div>
              <div className="text-sm text-gray-600">-40% ações, 15% juros, +25% USD</div>
            </div>
          </button>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <span className="font-medium text-yellow-800">Importante</span>
        </div>
        <p className="text-yellow-700 mt-1 text-sm">
          Esta simulação usa aproximações matemáticas e não considera todos os fatores de risco. 
          Use apenas como referência para análise de cenários.
        </p>
      </div>
    </div>
  )
}