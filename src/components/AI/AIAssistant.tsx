import React, { useState, useEffect, useRef } from 'react';
import { useSupabase } from '../../hooks/useSupabase';
import { useAuthContext } from '../../contexts/AuthContext';
import {
  Bot,
  Send,
  Settings,
  TrendingUp,
  DollarSign,
  BarChart3,
  Eye,
  EyeOff,
  MessageSquare
} from 'lucide-react';

interface Account {
  balance: number;
}

interface Goal {
  current_amount: number;
  target_amount: number;
  target_date?: string;
}

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
  const { user } = useAuthContext();
  const { getAccounts, getGoals } = useSupabase();

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      icon: <BarChart3 className="w-4 h-4" /> // Substituir Target por BarChart3
    }
  ]);

  // Insights state
  const [proactiveInsights, setProactiveInsights] = useState<InsightCard[]>([]);
  const [quickMetrics, setQuickMetrics] = useState({
    predictedBalance30d: 0,
    goalsAtRisk: 0,
    activeAlerts: 0
  });

  // Load initial data and generate insights
  useEffect(() => {
    if (user) {
      loadFinancialData();
      generateProactiveInsights();
    }
  }, [user, permissions]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadFinancialData = async () => {
    try {
      const [accounts, goals] = await Promise.all([
        getAccounts(),
        getGoals()
      ]);

      // Calculate quick metrics
      const totalBalance = accounts?.reduce((sum: number, acc: Account) => sum + acc.balance, 0) || 0;
      const goalsAtRisk = goals?.filter((goal: Goal) => {
        const progress = (goal.current_amount / goal.target_amount) * 100;
        const timeLeft = goal.target_date
          ? Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          : 365;
        return progress < 50 && timeLeft < 90;
      }).length || 0;

      setQuickMetrics({
        predictedBalance30d: totalBalance * 1.02, // Mock prediction
        goalsAtRisk,
        activeAlerts: 3 // Mock active alerts
      });
    } catch (err) {
      console.error('Error loading financial data:', err);
    }
  };

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

  const generateAIResponse = (userMessage: string): string => {
    // Simulação de resposta da IA
    return `Resposta simulada para: ${userMessage}`;
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant', // Corrigido para o tipo esperado
        content: generateAIResponse(userMessage.content),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
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
      <div className="bg-gray-900 text-white px-6 py-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Seu Copiloto Financeiro</h1>
              <p className="text-gray-400">Respostas com seus dados, sem jargão. Você no controle.</p>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Permission Chips */}
      <div className="bg-gray-800 text-gray-300 px-6 py-4">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium">Escopo de acesso:</span>
          <div className="flex flex-wrap gap-2">
            {permissions.map(permission => (
              <button
                key={permission.id}
                onClick={() => togglePermission(permission.id)}
                className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm transition-colors ${
                  permission.enabled
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {permission.icon}
                <span>{permission.name}</span>
                {permission.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-gray-900 text-white">
        <div className="bg-blue-700 rounded-lg p-3">
          <div className="text-sm">Saldo previsto 30d</div>
          <div className="text-lg font-bold">
            {formatCurrency(quickMetrics.predictedBalance30d)}
          </div>
        </div>
        <div className="bg-yellow-700 rounded-lg p-3">
          <div className="text-sm">Metas em risco</div>
          <div className="text-lg font-bold">
            {quickMetrics.goalsAtRisk}
          </div>
        </div>
        <div className="bg-green-700 rounded-lg p-3">
          <div className="text-sm">Alertas ativos</div>
          <div className="text-lg font-bold">
            {quickMetrics.activeAlerts}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex h-[calc(100vh-200px)]">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-800 text-gray-300">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <Bot className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium">Olá! Sou seu assistente financeiro</h3>
                <p className="text-gray-400 mb-6">
                  Faça perguntas sobre suas finanças ou escolha uma sugestão abaixo:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInputValue(question)}
                      className="p-3 text-left bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-blue-400 mb-2" />
                      <div className="text-sm">{question}</div>
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
                      : 'bg-gray-700'
                  }`}>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                  <div className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-right' : 'text-left'
                  }`}>{message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-700 bg-gray-800 p-4">
            <div className="flex space-x-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Pergunte sobre suas finanças..."
                className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Insights Panel */}
        <div className="w-80 bg-gray-900 text-white p-6">
          <h2 className="text-lg font-semibold mb-6">Insights Proativos</h2>
          <div className="space-y-4">
            {proactiveInsights.map(insight => (
              <div
                key={insight.id}
                className={`p-4 rounded-lg ${
                  insight.type === 'warning' ? 'bg-yellow-700' :
                  insight.type === 'success' ? 'bg-green-700' :
                  'bg-blue-700'
                }`}
              >
                <h3 className="font-medium">{insight.title}</h3>
                <p className="text-sm">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}