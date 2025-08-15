import OpenAI from 'openai'

// Check if API key is available
const apiKey = import.meta.env.VITE_OPENAI_API_KEY

if (!apiKey) {
  console.warn('OpenAI API key not found. AI features will be disabled.')
}

const openai = new OpenAI({
  apiKey: apiKey || 'dummy-key',
  dangerouslyAllowBrowser: true
})

export interface AIAnalysisRequest {
  type: 'spending_analysis' | 'budget_optimization' | 'investment_advice' | 'fire_planning' | 'crisis_simulation' | 'general_query'
  data: any
  userContext: {
    plan: 'free' | 'pro' | 'premium'
    currency: string
    monthlyIncome?: number
    monthlyExpenses?: number
    totalBalance?: number
  }
  query?: string
}

export interface AIResponse {
  analysis: string
  recommendations: AIRecommendation[]
  insights: AIInsight[]
  actions?: AIAction[]
}

export interface AIRecommendation {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: string
  impact: string
  actionable: boolean
}

export interface AIInsight {
  id: string
  type: 'warning' | 'opportunity' | 'achievement' | 'trend'
  title: string
  description: string
  value?: string
  change?: number
}

export interface AIAction {
  id: string
  label: string
  type: 'create_budget' | 'adjust_allocation' | 'set_alert' | 'save_scenario'
  data: any
}

class AIFinancialCopilot {
  private getSystemPrompt(userContext: AIAnalysisRequest['userContext']): string {
    return `Você é um copiloto financeiro especializado em finanças pessoais brasileiras. Suas características:

PERSONALIDADE:
- Comunicação clara e didática, sem jargões financeiros
- Foco em ações práticas e realizáveis
- Otimista mas realista sobre metas financeiras
- Especialista em mercado brasileiro (Selic, Ibovespa, FIIs, Tesouro Direto)

CONTEXTO DO USUÁRIO:
- Plano: ${userContext.plan}
- Moeda: ${userContext.currency}
- Renda mensal: ${userContext.monthlyIncome ? `R$ ${userContext.monthlyIncome.toLocaleString('pt-BR')}` : 'Não informada'}
- Gastos mensais: ${userContext.monthlyExpenses ? `R$ ${userContext.monthlyExpenses.toLocaleString('pt-BR')}` : 'Não informados'}
- Patrimônio: ${userContext.totalBalance ? `R$ ${userContext.totalBalance.toLocaleString('pt-BR')}` : 'Não informado'}

LIMITAÇÕES POR PLANO:
${userContext.plan === 'free' ? `
- Foco em educação financeira e conceitos básicos
- Análises agregadas (sem dados específicos de transações)
- Sugestões gerais aplicáveis a qualquer situação
- Máximo 3 recomendações práticas por resposta
- Explicações didáticas sobre investimentos e planejamento
- Dicas de economia doméstica e controle de gastos
` : userContext.plan === 'pro' ? `
- Análises detalhadas de transações
- Simulações de cenários FIRE
- Otimizações de orçamento personalizadas
- Até 5 recomendações específicas
- Previsões de 30-90 dias
` : `
- Análises completas e narrativas
- Simulações Monte Carlo
- Otimizações fiscais avançadas
- Recomendações ilimitadas
- Ações automáticas sugeridas
- Relatórios mensais personalizados
`}

DIRETRIZES:
1. Sempre forneça números específicos quando possível
2. Sugira ações concretas, não apenas teoria
3. Considere o contexto brasileiro (impostos, inflação, Selic)
4. Seja direto: problema → solução → impacto
5. Use emojis para destacar pontos importantes
6. Sempre termine com próximos passos claros

FORMATO DE RESPOSTA:
- Análise principal em português claro
- Recomendações priorizadas por impacto
- Insights específicos com valores
- Ações sugeridas quando aplicável

Responda sempre em português brasileiro.`
  }

  async analyzeSpending(request: AIAnalysisRequest): Promise<AIResponse> {
    const { data, userContext, query } = request

    if (!apiKey) {
      // Return educational content for free users when API key is not available
      return this.getFreeEducationalContent('spending_analysis', query)
    }

    const prompt = userContext.plan === 'free' ? `
Forneça dicas educacionais sobre controle de gastos sem usar dados específicos do usuário:

PERGUNTA: ${query || 'Como controlar melhor os gastos?'}

Forneça:
1. Conceitos básicos de controle financeiro
2. Estratégias gerais de economia doméstica
3. Dicas práticas aplicáveis a qualquer pessoa
4. Educação sobre categorização de gastos

Seja educacional e motivacional, sem mencionar dados específicos.` : `
Analise os gastos do usuário e forneça insights acionáveis:

DADOS DE GASTOS:
${JSON.stringify(data, null, 2)}

PERGUNTA ESPECÍFICA: ${query || 'Análise geral dos gastos'}

Forneça:
1. Análise dos padrões de gasto
2. Identificação de anomalias ou oportunidades
3. Recomendações específicas para otimização
4. Previsões para os próximos 30 dias

Seja específico com valores em R$ e percentuais.`

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: this.getSystemPrompt(userContext) },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })

      const response = completion.choices[0]?.message?.content || ''
      
      return this.parseAIResponse(response, 'spending_analysis')
    } catch (error) {
      console.error('Error in AI spending analysis:', error)
      throw new Error('Erro ao analisar gastos com IA')
    }
  }

  async optimizeBudget(request: AIAnalysisRequest): Promise<AIResponse> {
    const { data, userContext, query } = request

    if (!apiKey) {
      return this.getFreeEducationalContent('budget_optimization', query)
    }

    const prompt = userContext.plan === 'free' ? `
Forneça dicas educacionais sobre orçamentos pessoais:

OBJETIVO: ${query || 'Como criar e manter orçamentos eficazes'}

Forneça:
1. Conceitos básicos de orçamento pessoal
2. Métodos populares (50/30/20, envelope, etc.)
3. Dicas para manter disciplina orçamentária
4. Como categorizar gastos eficientemente

Seja prático e educacional.` : `
Analise os orçamentos e gastos para otimização:

DADOS DE ORÇAMENTOS:
${JSON.stringify(data, null, 2)}

OBJETIVO: ${query || 'Otimizar orçamentos existentes'}

Forneça:
1. Análise de compliance dos orçamentos
2. Sugestões de ajustes por categoria
3. Identificação de categorias sem orçamento
4. Estratégias para melhorar controle de gastos

Inclua valores específicos e percentuais de melhoria esperados.`

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: this.getSystemPrompt(userContext) },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })

      const response = completion.choices[0]?.message?.content || ''
      
      return this.parseAIResponse(response, 'budget_optimization')
    } catch (error) {
      console.error('Error in AI budget optimization:', error)
      throw new Error('Erro ao otimizar orçamentos com IA')
    }
  }

  async analyzeInvestments(request: AIAnalysisRequest): Promise<AIResponse> {
    const { data, userContext, query } = request

    if (!apiKey) {
      throw new Error('OpenAI API key não configurada. Configure VITE_OPENAI_API_KEY no arquivo .env')
    }

    const prompt = `
Analise a carteira de investimentos e forneça recomendações:

DADOS DA CARTEIRA:
${JSON.stringify(data, null, 2)}

FOCO: ${query || 'Análise geral da carteira'}

Forneça:
1. Análise de diversificação
2. Avaliação de risco vs retorno
3. Sugestões de rebalanceamento
4. Oportunidades de melhoria

Considere o cenário atual da economia brasileira.`

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: this.getSystemPrompt(userContext) },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })

      const response = completion.choices[0]?.message?.content || ''
      
      return this.parseAIResponse(response, 'investment_advice')
    } catch (error) {
      console.error('Error in AI investment analysis:', error)
      throw new Error('Erro ao analisar investimentos com IA')
    }
  }

  async planFIRE(request: AIAnalysisRequest): Promise<AIResponse> {
    const { data, userContext, query } = request

    if (!apiKey) {
      throw new Error('OpenAI API key não configurada. Configure VITE_OPENAI_API_KEY no arquivo .env')
    }

    const prompt = `
Analise o plano FIRE do usuário e forneça estratégias de otimização:

DADOS DO PLANO FIRE:
${JSON.stringify(data, null, 2)}

OBJETIVO: ${query || 'Otimizar estratégia FIRE'}

Forneça:
1. Análise da viabilidade do plano atual
2. Estratégias para acelerar o FIRE
3. Ajustes de gastos e investimentos
4. Cenários alternativos

Seja específico sobre tempo e valores para atingir independência financeira.`

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: this.getSystemPrompt(userContext) },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })

      const response = completion.choices[0]?.message?.content || ''
      
      return this.parseAIResponse(response, 'fire_planning')
    } catch (error) {
      console.error('Error in AI FIRE planning:', error)
      throw new Error('Erro ao planejar FIRE com IA')
    }
  }

  async simulateCrisis(request: AIAnalysisRequest): Promise<AIResponse> {
    const { data, userContext, query } = request

    if (!apiKey) {
      throw new Error('OpenAI API key não configurada. Configure VITE_OPENAI_API_KEY no arquivo .env')
    }

    const prompt = `
Analise o resultado da simulação de crise e forneça insights:

DADOS DA SIMULAÇÃO:
${JSON.stringify(data, null, 2)}

CENÁRIO: ${query || 'Análise de resistência a crises'}

Forneça:
1. Interpretação dos resultados da simulação
2. Pontos de vulnerabilidade da carteira
3. Estratégias de proteção
4. Sugestões de diversificação

Foque em ações práticas para reduzir riscos.`

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: this.getSystemPrompt(userContext) },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })

      const response = completion.choices[0]?.message?.content || ''
      
      return this.parseAIResponse(response, 'crisis_simulation')
    } catch (error) {
      console.error('Error in AI crisis simulation:', error)
      throw new Error('Erro ao simular crise com IA')
    }
  }

  async generalQuery(request: AIAnalysisRequest): Promise<AIResponse> {
    const { userContext, query } = request

    if (!apiKey) {
      return this.getFreeEducationalContent('general_query', query)
    }

    const prompt = `
Responda à pergunta do usuário sobre finanças pessoais:

PERGUNTA: ${query}

Forneça uma resposta educacional e prática, considerando o contexto financeiro brasileiro e o perfil do usuário.`

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: this.getSystemPrompt(userContext) },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })

      const response = completion.choices[0]?.message?.content || ''
      
      return this.parseAIResponse(response, 'general_query')
    } catch (error) {
      console.error('Error in AI general query:', error)
      throw new Error('Erro ao processar pergunta com IA')
    }
  }

  private parseAIResponse(response: string, type: string): AIResponse {
    // Parse the AI response and extract structured data
    const lines = response.split('\n').filter(line => line.trim())
    
    const recommendations: AIRecommendation[] = []
    const insights: AIInsight[] = []
    const actions: AIAction[] = []
    
    // Extract recommendations (look for numbered lists or bullet points)
    const recPattern = /(?:^\d+\.|^[•\-\*])\s*(.+)/gm
    let match
    let recIndex = 0
    
    while ((match = recPattern.exec(response)) !== null && recIndex < 5) {
      recommendations.push({
        id: `rec_${recIndex}`,
        title: match[1].substring(0, 50) + (match[1].length > 50 ? '...' : ''),
        description: match[1],
        priority: recIndex < 2 ? 'high' : recIndex < 4 ? 'medium' : 'low',
        category: type,
        impact: 'Médio',
        actionable: true
      })
      recIndex++
    }
    
    // Extract insights from the response
    if (response.includes('R$') || response.includes('%')) {
      insights.push({
        id: 'insight_1',
        type: 'trend',
        title: 'Análise Financeira',
        description: 'IA identificou padrões nos seus dados financeiros',
        value: 'Analisado'
      })
    }
    
    // Generate actions based on type
    if (type === 'budget_optimization') {
      actions.push({
        id: 'action_1',
        label: 'Criar orçamento otimizado',
        type: 'create_budget',
        data: { optimized: true }
      })
    }
    
    return {
      analysis: response,
      recommendations,
      insights,
      actions
    }
  }

  private getFreeEducationalContent(type: string, query?: string): AIResponse {
    const educationalContent = {
      spending_analysis: {
        analysis: `💡 **Dicas para Controlar Gastos (Plano Free)**

**📊 Regra dos 50/30/20:**
• 50% para necessidades (moradia, alimentação, transporte)
• 30% para desejos (lazer, restaurantes, hobbies)
• 20% para poupança e investimentos

**🎯 Estratégias Práticas:**
• Anote TODOS os gastos por 1 semana
• Identifique os "vazamentos" (gastos pequenos frequentes)
• Use a regra das 24h para compras não essenciais
• Negocie contas fixas (internet, celular, seguros)

**💰 Onde Economizar Primeiro:**
• Delivery e aplicativos de comida
• Assinaturas não utilizadas
• Compras por impulso
• Transporte (considere alternativas)

✨ **Upgrade para Pro:** Análises personalizadas dos seus gastos reais!`,
        recommendations: [
          {
            id: 'free_1',
            title: 'Implemente a regra 50/30/20',
            description: 'Organize seus gastos nessas 3 categorias principais',
            priority: 'high' as const,
            category: 'budgeting',
            impact: 'Alto',
            actionable: true
          },
          {
            id: 'free_2',
            title: 'Registre gastos por 1 semana',
            description: 'Anote tudo para identificar padrões',
            priority: 'high' as const,
            category: 'tracking',
            impact: 'Médio',
            actionable: true
          },
          {
            id: 'free_3',
            title: 'Revise assinaturas mensais',
            description: 'Cancele serviços não utilizados',
            priority: 'medium' as const,
            category: 'optimization',
            impact: 'Médio',
            actionable: true
          }
        ]
      },
      budget_optimization: {
        analysis: `🎯 **Guia de Orçamentos Eficazes (Plano Free)**

**📋 Método Envelope Digital:**
• Crie "envelopes" para cada categoria de gasto
• Defina limites mensais realistas
• Pare de gastar quando o envelope esvaziar

**🔄 Ciclo de Melhoria:**
1. **Planeje:** Defina orçamentos baseados no histórico
2. **Execute:** Registre gastos em tempo real
3. **Revise:** Analise desvios semanalmente
4. **Ajuste:** Corrija orçamentos no mês seguinte

**⚠️ Erros Comuns:**
• Orçamentos muito restritivos (causam desistência)
• Não incluir "gastos surpresa" (10% de buffer)
• Ignorar pequenos gastos recorrentes
• Não revisar mensalmente

**🚀 Dica Avançada:** Use a regra 80/20 - foque nos 20% de categorias que representam 80% dos gastos.

✨ **Upgrade para Pro:** Alertas automáticos e análise de compliance!`,
        recommendations: [
          {
            id: 'budget_1',
            title: 'Use o método envelope',
            description: 'Organize gastos em categorias com limites claros',
            priority: 'high' as const,
            category: 'method',
            impact: 'Alto',
            actionable: true
          },
          {
            id: 'budget_2',
            title: 'Adicione 10% de buffer',
            description: 'Reserve margem para gastos inesperados',
            priority: 'medium' as const,
            category: 'planning',
            impact: 'Médio',
            actionable: true
          }
        ]
      },
      general_query: {
        analysis: `💡 **Educação Financeira (Plano Free)**

**🎯 Primeiros Passos:**
• Organize suas finanças: receitas, gastos, patrimônio
• Crie uma reserva de emergência (6 meses de gastos)
• Quite dívidas de cartão de crédito (juros altos)
• Comece a investir mesmo com pouco dinheiro

**📈 Investimentos Básicos:**
• Tesouro Direto: seguro e acessível
• CDB com garantia do FGC
• Fundos de índice (baixo custo)
• Diversifique sempre

**🧠 Mentalidade Financeira:**
• Pague-se primeiro (poupe antes de gastar)
• Viva abaixo das suas possibilidades
• Invista em educação financeira
• Tenha metas claras e mensuráveis

✨ **Upgrade para Pro:** Análises personalizadas dos seus dados!`,
        recommendations: [
          {
            id: 'general_1',
            title: 'Crie reserva de emergência',
            description: '6 meses de gastos em investimento líquido',
            priority: 'high' as const,
            category: 'emergency',
            impact: 'Alto',
            actionable: true
          },
          {
            id: 'general_2',
            title: 'Comece a investir',
            description: 'Mesmo R$ 100/mês faz diferença no longo prazo',
            priority: 'high' as const,
            category: 'investing',
            impact: 'Alto',
            actionable: true
          }
        ]
      }
    }

    const content = educationalContent[type as keyof typeof educationalContent] || educationalContent.general_query
    
    return {
      analysis: content.analysis,
      recommendations: content.recommendations,
      insights: [
        {
          id: 'free_insight_1',
          type: 'trend' as const,
          title: 'Conteúdo Educacional',
          description: 'Dicas gerais baseadas em boas práticas financeiras'
        }
      ],
      actions: [
        {
          id: 'upgrade_action',
          label: 'Upgrade para análises personalizadas',
          type: 'create_budget',
          data: { upgrade: true }
        }
      ]
    }
  }
}

export const aiCopilot = new AIFinancialCopilot()