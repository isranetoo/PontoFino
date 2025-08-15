import React, { useState } from 'react'
import { useAI } from '../../hooks/useAI'
import { 
  Bot, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Lightbulb,
  ChevronRight,
  Zap
} from 'lucide-react'

interface AIInsightCardProps {
  type: 'spending' | 'budget' | 'investment' | 'fire' | 'general'
  title: string
  description: string
  data?: any
  onAnalyze?: (response: any) => void
  compact?: boolean
}

export function AIInsightCard({ 
  type, 
  title, 
  description, 
  data, 
  onAnalyze, 
  compact = false 
}: AIInsightCardProps) {
  const { 
    analyzeSpending, 
    optimizeBudget, 
    analyzeInvestments, 
    planFIRE, 
    askGeneral,
    loading 
  } = useAI()

  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)

  const getIcon = () => {
    switch (type) {
      case 'spending':
        return <TrendingDown className="w-5 h-5 text-red-600" />
      case 'budget':
        return <Target className="w-5 h-5 text-blue-600" />
      case 'investment':
        return <TrendingUp className="w-5 h-5 text-green-600" />
      case 'fire':
        return <Zap className="w-5 h-5 text-purple-600" />
      default:
        return <Lightbulb className="w-5 h-5 text-yellow-600" />
    }
  }

  const getColor = () => {
    switch (type) {
      case 'spending':
        return 'from-red-50 to-orange-50 border-red-200'
      case 'budget':
        return 'from-blue-50 to-indigo-50 border-blue-200'
      case 'investment':
        return 'from-green-50 to-emerald-50 border-green-200'
      case 'fire':
        return 'from-purple-50 to-pink-50 border-purple-200'
      default:
        return 'from-yellow-50 to-amber-50 border-yellow-200'
    }
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    try {
      let response = null

      switch (type) {
        case 'spending':
          response = await analyzeSpending(title)
          break
        case 'budget':
          response = await optimizeBudget(title)
          break
        case 'investment':
          response = await analyzeInvestments(data, title)
          break
        case 'fire':
          response = await planFIRE(data, title)
          break
        default:
          response = await askGeneral(title)
      }

      if (response) {
        setResult(response)
        onAnalyze?.(response)
      }
    } catch (err) {
      console.error('AI analysis error:', err)
    } finally {
      setAnalyzing(false)
    }
  }

  if (compact) {
    return (
      <div className={`p-3 bg-gradient-to-br ${getColor()} border rounded-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">{title}</span>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={analyzing || loading}
            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {analyzing ? '...' : 'Analisar'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-4 bg-gradient-to-br ${getColor()} border rounded-lg`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
            {getIcon()}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </div>

      {result ? (
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-3">
            <div className="text-sm text-gray-800 whitespace-pre-wrap">
              {result.analysis}
            </div>
          </div>
          
          {result.recommendations?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium opacity-75">💡 Dicas Práticas:</p>
              {result.recommendations.map((rec: any) => (
                <div key={rec.id} className="flex items-start space-x-2 text-xs">
                  <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{rec.title}: {rec.description}</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="bg-blue-50 rounded-lg p-2 mt-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-3 h-3 text-blue-600" />
              <span className="text-xs text-blue-800">
                Upgrade para Pro: análises personalizadas dos seus dados!
              </span>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={handleAnalyze}
          disabled={analyzing || loading}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {analyzing ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Bot className="w-4 h-4" />
              <span>Analisar com IA</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  )
}