import React, { useState, useEffect } from 'react'
import { useAI } from '../../hooks/useAI'
import { usePaywall } from '../../hooks/usePaywall'
import { 
  Bot, 
  MessageSquare, 
  X, 
  Send, 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle,
  Target,
  Zap,
  ChevronRight,
  Minimize2,
  Maximize2
} from 'lucide-react'

interface AICopilotWidgetProps {
  page: 'dashboard' | 'transactions' | 'budgets' | 'funds' | 'compare' | 'fire' | 'crisis' | 'retirement'
  contextData?: any
}

export function AICopilotWidget({ page, contextData }: AICopilotWidgetProps) {
  const { 
    analyzeSpending, 
    optimizeBudget, 
    analyzeInvestments, 
    planFIRE, 
    simulateCrisis, 
    askGeneral,
    loading, 
    error 
  } = useAI()
  
  const { executeWithPaywall } = usePaywall()
  
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [currentQuery, setCurrentQuery] = useState('')
  const [aiResponse, setAiResponse] = useState<any>(null)
  const [conversationHistory, setConversationHistory] = useState<any[]>([])

  // Page-specific suggestions
  const getPageSuggestions = () => {
    switch (page) {
      case 'dashboard':
        return [
          'Como controlar melhor meus gastos?',
          'Dicas para economizar dinheiro',
          'Como começar a investir?'
        ]
      case 'transactions':
        return [
          'Como categorizar transações?',
          'Dicas para controlar gastos',
          'Métodos de registro financeiro'
        ]
      case 'budgets':
        return [
          'Como criar orçamentos eficazes?',
          'Método 50/30/20 funciona?',
          'Dicas para manter disciplina'
        ]
      case 'funds':
        return [
          'Como escolher bons fundos?',
          'O que é taxa de administração?',
          'Dicas de diversificação'
        ]
      case 'fire':
        return [
          'O que é FIRE?',
          'Como calcular independência financeira?',
          'Estratégias para aposentadoria'
        ]
      case 'crisis':
        return [
          'Como proteger investimentos?',
          'O que fazer em crises?',
          'Diversificação reduz riscos?'
        ]
      default:
        return [
          'Dicas de educação financeira',
          'Como começar a investir?',
          'Estratégias de economia'
        ]
    }
  }

  const handleAIQuery = async (query: string) => {
    try {
      let response = null

      await executeWithPaywall(
        'ai_interactions',
        'AI Financial Copilot',
        'Para acessar o AI Copilot com análises personalizadas, insights avançados e recomendações específicas, você precisa do plano Pro.',
        async () => {
          switch (page) {
            case 'transactions':
              response = await analyzeSpending(query)
              break
            case 'budgets':
              response = await optimizeBudget(query)
              break
            case 'funds':
            case 'compare':
              response = await analyzeInvestments(contextData, query)
              break
            case 'fire':
              response = await planFIRE(contextData, query)
              break
            case 'crisis':
              response = await simulateCrisis(contextData, query)
              break
            default:
              response = await askGeneral(query)
          }

          if (response) {
            setAiResponse(response)
            setConversationHistory(prev => [...prev, 
              { type: 'user', content: query, timestamp: new Date() },
              { type: 'ai', content: response, timestamp: new Date() }
            ])
          }
        },
        'pro'
      )
    } catch (err: any) {
      console.error('AI query error:', err)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentQuery(suggestion)
    handleAIQuery(suggestion)
  }

  const handleSendQuery = () => {
    if (currentQuery.trim()) {
      handleAIQuery(currentQuery.trim())
      setCurrentQuery('')
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 hover:scale-110"
      >
        <Bot className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    }`}>
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Copilot</h3>
              <p className="text-xs text-gray-600">Powered by GPT-4o</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversationHistory.length === 0 ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <Bot className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                    <h4 className="font-medium text-gray-900 mb-2">
                      Olá! Sou seu copiloto financeiro
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Posso ajudar com análises da página {page} ou responder perguntas gerais sobre finanças.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                      Sugestões para {page}:
                    </p>
                    {getPageSuggestions().map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors text-sm"
                      >
                        <MessageSquare className="w-4 h-4 text-blue-600 inline mr-2" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {conversationHistory.map((item, index) => (
                    <div key={index} className={`${item.type === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block max-w-[85%] p-3 rounded-lg ${
                        item.type === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        {item.type === 'ai' ? (
                          <div className="space-y-3">
                            <div className="text-sm whitespace-pre-wrap">{item.content.analysis}</div>
                            
                            {item.content.recommendations?.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs font-medium opacity-75">Recomendações:</p>
                                {item.content.recommendations.slice(0, 3).map((rec: any) => (
                                  <div key={rec.id} className="flex items-start space-x-2 text-xs">
                                    <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <span>{rec.description}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {item.content.actions?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {item.content.actions.map((action: any) => (
                                  <button
                                    key={action.id}
                                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                                  >
                                    {action.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm">{item.content}</div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="text-left">
                      <div className="inline-block bg-gray-100 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm text-gray-600">Analisando...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentQuery}
                  onChange={(e) => setCurrentQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendQuery()}
                  placeholder="Pergunte sobre suas finanças..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <button
                  onClick={handleSendQuery}
                  disabled={!currentQuery.trim() || loading}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}