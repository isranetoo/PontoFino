import React, { useState, useEffect, useRef } from 'react'
import { useSupabase } from '../../hooks/useSupabase'
import { useAuthContext } from '../../contexts/AuthContext'
import { 
  Bot, 
  Send, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Target,
  DollarSign,
  Calendar,
  BarChart3,
  Shield,
  Eye,
  EyeOff,
  Lightbulb,
  MessageSquare,
  ChevronRight,
  Plus,
  Check,
  X,
  Download,
  Zap,
  Calculator
} from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  actions?: ActionChip[]
  insights?: InsightCard[]
}

interface ActionChip {
  id: string
  label: string
  type: 'create_budget' | 'create_alert' | 'run_simulation' | 'save_plan'
  data?: any
}

interface InsightCard {
  id: string
  title: string
  description: string
  type: 'warning' | 'success' | 'info' | 'goal'
  value?: string
  change?: number
  action?: string
}

interface PermissionScope {
  id: string
  name: string
  description: string
  enabled: boolean
  icon: React.ReactNode
}

export function AIAssistant() {
  const { user } = useAuthContext()
  const { getTransactions, getAccounts, getBudgets, getGoals } = useSupabase()
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Permissions state
  const [permissions, setPermissions] = useState<PermissionScope[]>([
    {
      id: 'aggregated',
      name: 'Dados Agregados',
      description: 'Totais, médias e tendências sem detalhes específicos',
      enabled: true,
      icon: <BarChart3 className="w-4 h-4" />
    },
    {
      id: 'transactions',
      name: 'Transações Detalhadas',
      description: 'Acesso a descrições e valores específicos',
      enabled: false,
      icon: <DollarSign className="w-4 h-4" />
    },
    {
      id: 'portfolio',
      name: 'Carteira de Investimentos',
      description: 'Posições, ativos e análise de risco',
      enabled: false,
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      id: 'goals',
      name: 'Metas e Planejamento',
      description: 'Objetivos financeiros e estratégias',
      enabled: true,
      icon: <Target className="w-4 h-4" />
    }
  ])
  
  // Insights state
  const [proactiveInsights, setProactiveInsights] = useState<InsightCard[]>([])
  const [quickMetrics, setQuickMetrics] = useState({
    predictedBalance30d: 0,
    goalsAtRisk: 0,
    activeAlerts: 0
  })
  
  // UI state
  const [showSimulationDrawer, setShowSimulationDrawer] = useState(false)
  const [simulationType, setSimulationType] = useState<'fire' | 'crisis' | 'retirement'>('fire')

  // Load initial data and generate insights
  useEffect(() => {
    if (user) {
      loadFinancialData()
      generateProactiveInsights()
    }
  }, [user, permissions])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadFinancialData = async () => {
    try {
      const [accounts, transactions, budgets, goals] = await Promise.all([
        getAccounts(),
        getTransactions({ limit: 100 }),
        getBudgets(),
        getGoals()
      ])

      // Calculate quick metrics
      const totalBalance = accounts?.data?.reduce((sum, acc) => sum + acc.balance, 0) || 0
      const goalsAtRisk = goals?.data?.filter(goal => {
        const progress = (goal.current_amount / goal.target_amount) * 100
        const timeLeft = goal.target_date ? 
          Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
          365
        return progress < 50 && timeLeft < 90
      }).length || 0

      setQuickMetrics({
        predictedBalance30d: totalBalance * 1.02, // Mock prediction
        goalsAtRisk,
        activeAlerts: 3 // Mock active alerts
      })

    } catch (err) {
      console.error('Error loading financial data:', err)
    }
  }

  const generateProactiveInsights = async () => {
    // Mock insights based on permissions
    const insights: InsightCard[] = []

    if (permissions.find(p => p.id === 'aggregated')?.enabled) {
      insights.push({
        id: '1',
        title: 'Gastos fora do padrão esta semana',
        description: 'Aumento de R$ 430 vs. média mensal',
        type: 'warning',
        value: '+R$ 430',
        change: 32,
        action: 'Revisar categorias'
      })
    }

    if (permissions.find(p => p.id === 'transactions')?.enabled) {
      insights.push({
        id: '2',
        title: 'Desvio de orçamento: Transporte',
        description: 'Uber e combustível acima do esperado',
        type: 'warning',
        value: '+25%',
        action: 'Ajustar orçamento'
      })
    }

    if (permissions.find(p => p.id === 'goals')?.enabled) {
      insights.push({
        id: '3',
        title: 'Meta "Viagem" adiantada',
        description: 'No ritmo atual, você chega 2 meses antes',
        type: 'success',
        value: '2 meses',
        action: 'Ver detalhes'
      })
    }

    if (permissions.find(p => p.id === 'portfolio')?.enabled) {
      insights.push({
        id: '4',
        title: 'Risco de crise simulado',
        description: 'Carteira perderia ~12% num choque -30%',
        type: 'info',
        value: '-12%',
        action: 'Simular cenários'
      })
    }

    setProactiveInsights(insights)
  }

  const togglePermission = (permissionId: string) => {
    setPermissions(prev => 
      prev.map(p => 
        p.id === permissionId ? { ...p, enabled: !p.enabled } : p
      )
    )
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage.content)
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  const generateAIResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase()
    
    // Pattern matching for different types of questions
    if (input.includes('reduzir') || input.includes('cortar') || input.includes('economizar')) {
      return {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Analisando seus gastos dos últimos 3 meses, identifiquei 3 estratégias para reduzir R$ 500/mês:

**1. Delivery e alimentação (-R$ 280/mês)**
• Reduzir iFood de 12x para 6x por mês
• Cozinhar 2x mais em casa nos fins de semana

**2. Assinaturas e serviços (-R$ 120/mês)**
• Cancelar Netflix duplicado (R$ 45)
• Trocar plano de celular (R$ 75 de economia)

**3. Transporte (-R$ 100/mês)**
• Usar transporte público 2x por semana
• Agrupar corridas de Uber

💡 **Impacto total:** R$ 500/mês = R$ 6.000/ano para suas metas!`,
        timestamp: new Date(),
        actions: [
          { id: '1', label: 'Criar orçamento alimentação', type: 'create_budget', data: { category: 'alimentacao', amount: 800 } },
          { id: '2', label: 'Configurar alerta delivery', type: 'create_alert', data: { type: 'spending', threshold: 400 } },
          { id: '3', label: 'Revisar assinaturas', type: 'create_budget', data: { category: 'assinaturas', amount: 200 } }
        ]
      }
    }

    if (input.includes('fire') || input.includes('independencia') || input.includes('aposentar')) {
      return {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Com base no seu perfil atual:

**📊 Situação Atual:**
• Patrimônio: R$ 85.000
• Aporte mensal: R$ 2.500
• Gastos mensais: R$ 4.200

**🎯 Projeção FIRE:**
• Meta de patrimônio: R$ 1.260.000 (25x gastos anuais)
• Tempo estimado: **18 anos e 4 meses**
• Você atingirá FIRE aos 53 anos

**⚡ Como acelerar:**
• +R$ 500/mês de aporte → FIRE 2 anos mais cedo
• Reduzir gastos em R$ 500/mês → FIRE 3 anos mais cedo
• Combinando ambos → FIRE 4,5 anos mais cedo!`,
        timestamp: new Date(),
        actions: [
          { id: '1', label: 'Salvar plano FIRE', type: 'save_plan', data: { type: 'fire' } },
          { id: '2', label: 'Simular cenários', type: 'run_simulation', data: { type: 'fire' } },
          { id: '3', label: 'Criar meta FIRE', type: 'create_budget', data: { goal: 'fire', amount: 1260000 } }
        ]
      }
    }

    if (input.includes('crise') || input.includes('risco') || input.includes('bolsa')) {
      return {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Simulei um cenário de crise na sua carteira:

**📉 Cenário: Crise Moderada**
• Bolsa: -30%
• Juros: 16%
• USD/BRL: +20%

**💥 Impacto Estimado:**
• Perda total: R$ 18.400 (-12,3%)
• Maior impacto: Ações (-R$ 12.800)
• Mais resiliente: Renda Fixa (+R$ 1.200)

**🛡️ Recomendações:**
• Sua carteira está bem diversificada
• Considere aumentar posição em Tesouro IPCA+
• FIIs ajudaram a reduzir volatilidade`,
        timestamp: new Date(),
        actions: [
          { id: '1', label: 'Ver simulação completa', type: 'run_simulation', data: { type: 'crisis' } },
          { id: '2', label: 'Salvar cenário', type: 'save_plan', data: { type: 'crisis' } },
          { id: '3', label: 'Ajustar alocação', type: 'create_alert', data: { type: 'rebalance' } }
        ]
      }
    }

    // Default response
    return {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: `Olá! Sou seu copiloto financeiro. Posso ajudar você a:

• **Analisar gastos** e encontrar oportunidades de economia
• **Planejar metas** como FIRE, viagens ou aposentadoria  
• **Simular cenários** de crise ou mudanças no mercado
• **Otimizar orçamentos** com base no seu histórico
• **Explicar investimentos** em linguagem simples

O que você gostaria de saber sobre suas finanças?`,
      timestamp: new Date(),
      actions: [
        { id: '1', label: 'Como reduzir gastos?', type: 'create_budget' },
        { id: '2', label: 'Quando atinjo FIRE?', type: 'run_simulation', data: { type: 'fire' } },
        { id: '3', label: 'Simular crise', type: 'run_simulation', data: { type: 'crisis' } }
      ]
    }
  }

  const handleActionClick = (action: ActionChip) => {
    // Simulate action execution
    const actionMessage: Message = {
      id: (Date.now() + 2).toString(),
      type: 'assistant',
      content: `✅ Ação executada: ${action.label}

${action.type === 'create_budget' ? 'Orçamento criado e ativo. Você receberá alertas quando atingir 80% do limite.' :
  action.type === 'create_alert' ? 'Alerta configurado. Você será notificado quando a condição for atingida.' :
  action.type === 'run_simulation' ? 'Simulação executada. Resultados salvos no seu histórico.' :
  'Plano salvo com sucesso. Você pode acessá-lo a qualquer momento.'}

Posso ajudar com mais alguma coisa?`,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, actionMessage])
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const suggestedQuestions = [
    "Como reduzir R$ 500/mês com mínimo de dor?",
    "Quando atinjo FIRE?",
    "Impacto de Selic 15% na minha carteira?",
    "Onde estou gastando mais que o normal?",
    "Vale a pena investir em FIIs agora?",
    "Como me aposentar em Portugal?"
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Seu Copiloto Financeiro</h1>
              <p className="text-gray-600">Respostas com seus dados, sem jargão. Você no controle.</p>
            </div>
          </div>
          
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Permission Chips */}
        <div className="flex items-center space-x-3 mt-4">
          <span className="text-sm font-medium text-gray-700">Escopo de acesso:</span>
          <div className="flex flex-wrap gap-2">
            {permissions.map(permission => (
              <button
                key={permission.id}
                onClick={() => togglePermission(permission.id)}
                className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm transition-colors ${
                  permission.enabled
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}
              >
                {permission.icon}
                <span>{permission.name}</span>
                {permission.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-sm text-blue-600">Saldo previsto 30d</div>
            <div className="text-lg font-bold text-blue-900">
              {formatCurrency(quickMetrics.predictedBalance30d)}
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="text-sm text-yellow-600">Metas em risco</div>
            <div className="text-lg font-bold text-yellow-900">
              {quickMetrics.goalsAtRisk}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-sm text-green-600">Alertas ativos</div>
            <div className="text-lg font-bold text-green-900">
              {quickMetrics.activeAlerts}
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-200px)]">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Olá! Sou seu assistente financeiro
                </h3>
                <p className="text-gray-600 mb-6">
                  Faça perguntas sobre suas finanças ou escolha uma sugestão abaixo:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInputValue(question)}
                      className="p-3 text-left bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-blue-600 mb-2" />
                      <div className="text-sm text-gray-900">{question}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-3xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`p-4 rounded-xl ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200'
                  }`}>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    
                    {/* Action Chips */}
                    {message.actions && message.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {message.actions.map(action => (
                          <button
                            key={action.id}
                            onClick={() => handleActionClick(action)}
                            className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                          >
                            <span>{action.label}</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className={`text-xs text-gray-500 mt-1 ${
                    message.type === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {message.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
                
                {message.type === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Pergunte sobre suas finanças..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Insights Panel */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Insights Proativos</h2>
          
          <div className="space-y-4">
            {proactiveInsights.map(insight => (
              <div
                key={insight.id}
                className={`p-4 rounded-lg border ${
                  insight.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  insight.type === 'success' ? 'bg-green-50 border-green-200' :
                  insight.type === 'info' ? 'bg-blue-50 border-blue-200' :
                  'bg-purple-50 border-purple-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className={`font-medium ${
                    insight.type === 'warning' ? 'text-yellow-900' :
                    insight.type === 'success' ? 'text-green-900' :
                    insight.type === 'info' ? 'text-blue-900' :
                    'text-purple-900'
                  }`}>
                    {insight.title}
                  </h3>
                  {insight.value && (
                    <span className={`text-sm font-bold ${
                      insight.type === 'warning' ? 'text-yellow-700' :
                      insight.type === 'success' ? 'text-green-700' :
                      insight.type === 'info' ? 'text-blue-700' :
                      'text-purple-700'
                    }`}>
                      {insight.value}
                    </span>
                  )}
                </div>
                
                <p className={`text-sm mb-3 ${
                  insight.type === 'warning' ? 'text-yellow-800' :
                  insight.type === 'success' ? 'text-green-800' :
                  insight.type === 'info' ? 'text-blue-800' :
                  'text-purple-800'
                }`}>
                  {insight.description}
                </p>
                
                {insight.action && (
                  <button className={`text-sm font-medium hover:underline ${
                    insight.type === 'warning' ? 'text-yellow-700' :
                    insight.type === 'success' ? 'text-green-700' :
                    insight.type === 'info' ? 'text-blue-700' :
                    'text-purple-700'
                  }`}>
                    {insight.action} →
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-md font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setSimulationType('fire')
                  setShowSimulationDrawer(true)
                }}
                className="w-full flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Calculator className="w-5 h-5 text-green-600" />
                <span className="text-green-900 font-medium">Planejar FIRE</span>
              </button>
              
              <button
                onClick={() => {
                  setSimulationType('crisis')
                  setShowSimulationDrawer(true)
                }}
                className="w-full flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-900 font-medium">Simular Crise</span>
              </button>
              
              <button
                onClick={() => {
                  setSimulationType('retirement')
                  setShowSimulationDrawer(true)
                }}
                className="w-full flex items-center space-x-3 p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Target className="w-5 h-5 text-purple-600" />
                <span className="text-purple-900 font-medium">Aposentadoria</span>
              </button>
            </div>
          </div>

          {/* Saved Scenarios */}
          <div className="mt-8">
            <h3 className="text-md font-semibold text-gray-900 mb-4">Cenários Salvos</h3>
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="text-sm font-medium text-gray-900">FIRE Conservador</div>
                <div className="text-xs text-gray-600">18 anos para independência</div>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="text-sm font-medium text-gray-900">Crise 2008</div>
                <div className="text-xs text-gray-600">-15% impacto na carteira</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulation Drawer */}
      {showSimulationDrawer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {simulationType === 'fire' ? 'Planejamento FIRE' :
                 simulationType === 'crisis' ? 'Simulação de Crise' :
                 'Aposentadoria Multi-moeda'}
              </h2>
              <button
                onClick={() => setShowSimulationDrawer(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center py-12 text-gray-500">
                <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg mb-2">Simulação {simulationType.toUpperCase()}</p>
                <p>Esta funcionalidade será integrada aqui</p>
                <button
                  onClick={() => setShowSimulationDrawer(false)}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Conteúdo educacional; não é recomendação de investimento.</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="hover:text-gray-800">
              Você controla os dados acessados pela IA
            </button>
            <button className="hover:text-gray-800">
              Como a IA funciona?
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}