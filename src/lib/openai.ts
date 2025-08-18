import OpenAI from 'openai'

// Check if API keys are available
const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY
const deepseekApiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || 'sk-2e395158aff14a5d883acd1202d1f71f'

if (!openaiApiKey && !deepseekApiKey) {
  console.warn('No AI API keys found. AI features will be disabled.')
}

// Initialize OpenAI client
const openai = openaiApiKey ? new OpenAI({
  apiKey: openaiApiKey,
  dangerouslyAllowBrowser: true
}) : null

// Initialize DeepSeek client (compatible with OpenAI API)
const deepseek = deepseekApiKey ? new OpenAI({
  apiKey: deepseekApiKey,
  baseURL: 'https://api.deepseek.com/v1',
  dangerouslyAllowBrowser: true
}) : null

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
  private async makeAIRequest(messages: any[], options: any = {}): Promise<string> {
    const requestOptions = {
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 1500,
      ...options
    }

    // Try OpenAI first
    if (openai) {
      try {
        console.log('🤖 Tentando OpenAI...')
        const completion = await openai.chat.completions.create(requestOptions)
        const response = completion.choices[0]?.message?.content || ''
        console.log('✅ OpenAI respondeu com sucesso')
        return response
      } catch (error: any) {
        console.warn('⚠️ OpenAI falhou:', error.message)
        // Continue to try DeepSeek
      }
    }

    // Try DeepSeek as fallback
    if (deepseek) {
      try {
        console.log('🤖 Tentando DeepSeek como fallback...')
        const deepseekOptions = {
          ...requestOptions,
          model: 'deepseek-chat' // DeepSeek's chat model
        }
        const completion = await deepseek.chat.completions.create(deepseekOptions)
        const response = completion.choices[0]?.message?.content || ''
        console.log('✅ DeepSeek respondeu com sucesso')
        return response
      } catch (error: any) {
        console.warn('⚠️ DeepSeek também falhou:', error.message)
      }
    }

    // If both fail, throw error
    throw new Error('Ambas as IAs (OpenAI e DeepSeek) estão indisponíveis no momento. Tente novamente em alguns minutos.')
  }

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

  private handleAIRequestFailure(error: any, userContext: AIAnalysisRequest['userContext'], type: string, query?: string): AIResponse {
    if (userContext.plan === 'free') {
      // For free users, return educational content instead of error
      return this.getFreeEducationalContent(type, query)
    }
    // For paid users, re-throw the error
    throw error
  }

  async analyzeSpending(request: AIAnalysisRequest): Promise<AIResponse> {
    const { data, userContext, query } = request

    if (!openaiApiKey && !deepseekApiKey) {
      // Return educational content for free users when API key is not available
      return this.getFreeEducationalContent('spending_analysis', query)
    }

    const prompt = userContext.plan === 'free' ? `
Forneça dicas educacionais sobre controle de gastos:

PERGUNTA: ${query || 'Como controlar melhor os gastos?'}

Forneça dicas práticas e educacionais sobre controle financeiro.` : `
Analise os gastos reais do usuário e forneça insights personalizados:

PERFIL FINANCEIRO:
- Renda mensal: R$ ${userContext.monthlyIncome?.toLocaleString('pt-BR') || 'N/A'}
- Gastos mensais: R$ ${userContext.monthlyExpenses?.toLocaleString('pt-BR') || 'N/A'}
- Patrimônio total: R$ ${userContext.totalBalance?.toLocaleString('pt-BR') || 'N/A'}

ANÁLISE DE GASTOS:
- Total de transações analisadas: ${data.transactions?.length || 0}
- Gastos por categoria: ${JSON.stringify(data.categorySpending, null, 2)}
- Tendência mensal: Média 3 meses: R$ ${data.monthlyTrend?.average3Months?.toLocaleString('pt-BR')}, Mês atual: R$ ${data.monthlyTrend?.currentMonth?.toLocaleString('pt-BR')}
- Variação: ${data.monthlyTrend?.variance > 0 ? '+' : ''}R$ ${data.monthlyTrend?.variance?.toLocaleString('pt-BR')}

TOP 5 CATEGORIAS DE GASTO:
${data.topCategories?.map((cat: any) => `- ${cat.name}: R$ ${cat.amount.toLocaleString('pt-BR')} (${cat.percentage.toFixed(1)}%)`).join('\n')}

CONTAS:
${data.accounts?.map((acc: any) => `- ${acc.name} (${acc.type}): R$ ${acc.balance.toLocaleString('pt-BR')}`).join('\n')}

PERGUNTA ESPECÍFICA: ${query || 'Análise completa dos gastos'}

Com base nos dados REAIS do usuário, forneça:
1. **Análise dos padrões de gasto** - identifique tendências e anomalias
2. **Oportunidades de economia** - categorias com maior potencial de redução
3. **Recomendações específicas** - ações práticas com valores em R$
4. **Previsão para próximo mês** - baseada nos padrões identificados
5. **Alertas importantes** - gastos fora do padrão ou crescimento acelerado

Seja específico com valores em R$, percentuais e prazos. Use os dados reais fornecidos.`

    try {
      const response = await this.makeAIRequest([
        { role: 'system', content: this.getSystemPrompt(userContext) },
        { role: 'user', content: prompt }
      ])
      
      return this.parseAIResponse(response, 'spending_analysis')
    } catch (error) {
      console.error('Error in AI spending analysis:', error)
      return this.handleAIRequestFailure(error, userContext, 'spending_analysis', query)
    }
  }

  async optimizeBudget(request: AIAnalysisRequest): Promise<AIResponse> {
    const { data, userContext, query } = request

    if (!openaiApiKey && !deepseekApiKey) {
      return this.getFreeEducationalContent('budget_optimization', query)
    }

    const prompt = userContext.plan === 'free' ? `
Forneça dicas educacionais sobre orçamentos pessoais:

OBJETIVO: ${query || 'Como criar e manter orçamentos eficazes'}

Forneça dicas práticas sobre orçamento pessoal.` : `
Analise os orçamentos REAIS do usuário e forneça otimizações personalizadas:

PERFIL FINANCEIRO:
- Renda mensal: R$ ${userContext.monthlyIncome?.toLocaleString('pt-BR') || 'N/A'}
- Gastos mensais: R$ ${userContext.monthlyExpenses?.toLocaleString('pt-BR') || 'N/A'}
- Total orçado: R$ ${data.totalBudgeted?.toLocaleString('pt-BR') || 'N/A'}
- Total gasto: R$ ${data.totalSpent?.toLocaleString('pt-BR') || 'N/A'}

ANÁLISE DETALHADA DOS ORÇAMENTOS:
${data.budgetAnalysis?.map((budget: any) => 
  `- ${budget.category}: Orçado R$ ${budget.budgeted.toLocaleString('pt-BR')}, Gasto R$ ${budget.spent.toLocaleString('pt-BR')} (${budget.compliance.toFixed(1)}% - ${budget.status})`
).join('\n')}

ORÇAMENTOS EXCEDIDOS:
${data.overBudgetCategories?.map((budget: any) => 
  `- ${budget.category}: ${budget.compliance.toFixed(1)}% do orçamento (R$ ${(budget.spent - budget.budgeted).toLocaleString('pt-BR')} acima)`
).join('\n') || 'Nenhum orçamento excedido'}

ORÇAMENTOS SUBUTILIZADOS:
${data.underBudgetCategories?.map((budget: any) => 
  `- ${budget.category}: ${budget.compliance.toFixed(1)}% usado (R$ ${(budget.budgeted - budget.spent).toLocaleString('pt-BR')} disponível)`
).join('\n') || 'Todos os orçamentos bem utilizados'}

CATEGORIAS SEM ORÇAMENTO (com gastos significativos):
${data.categoriesWithoutBudgets?.map((cat: any) => 
  `- ${cat.name}: R$ ${cat.amount.toLocaleString('pt-BR')} gastos sem controle`
).join('\n') || 'Todas as categorias importantes têm orçamento'}

PERGUNTA ESPECÍFICA: ${query || 'Como otimizar meus orçamentos?'}

Com base nos dados REAIS dos orçamentos, forneça:
1. **Análise de compliance** - quais orçamentos estão funcionando
2. **Ajustes recomendados** - valores específicos para cada categoria
3. **Novas categorias de orçamento** - onde criar controles
4. **Estratégias de economia** - como reduzir gastos nas categorias problemáticas
5. **Metas de melhoria** - objetivos específicos para próximo mês

Seja específico com valores em R$ e percentuais de melhoria esperados.`

    try {
      const response = await this.makeAIRequest([
        { role: 'system', content: this.getSystemPrompt(userContext) },
        { role: 'user', content: prompt }
      ])
      
      return this.parseAIResponse(response, 'budget_optimization')
    } catch (error) {
      console.error('Error in AI budget optimization:', error)
      return this.handleAIRequestFailure(error, userContext, 'budget_optimization', query)
    }
  }

  async analyzeInvestments(request: AIAnalysisRequest): Promise<AIResponse> {
    const { data, userContext, query } = request

    if (!openaiApiKey && !deepseekApiKey) {
      return this.getFreeEducationalContent('investment_advice', query)
    }

    const prompt = userContext.plan === 'free' ? `
Forneça educação sobre investimentos:

PERGUNTA: ${query || 'Como começar a investir?'}

Forneça dicas educacionais sobre investimentos.` : `
Analise a carteira de investimentos REAL do usuário:

PERFIL FINANCEIRO:
- Patrimônio total: R$ ${userContext.totalBalance?.toLocaleString('pt-BR') || 'N/A'}
- Renda mensal: R$ ${userContext.monthlyIncome?.toLocaleString('pt-BR') || 'N/A'}
- Capacidade de investimento: R$ ${((userContext.monthlyIncome || 0) - (userContext.monthlyExpenses || 0)).toLocaleString('pt-BR')}

DADOS DA CARTEIRA:
${JSON.stringify(data, null, 2)}

FOCO: ${query || 'Análise completa da carteira'}

Com base nos dados REAIS, forneça:
1. **Análise de diversificação** - distribuição atual vs ideal
2. **Avaliação de risco vs retorno** - adequação ao perfil
3. **Sugestões de rebalanceamento** - ajustes específicos com valores
4. **Oportunidades de melhoria** - onde investir próximos aportes
5. **Proteção contra riscos** - como proteger o patrimônio atual

Considere o cenário atual da economia brasileira e seja específico com valores e percentuais.`

    try {
      const response = await this.makeAIRequest([
        { role: 'system', content: this.getSystemPrompt(userContext) },
        { role: 'user', content: prompt }
      ])
      
      return this.parseAIResponse(response, 'investment_advice')
    } catch (error) {
      console.error('Error in AI investment analysis:', error)
      return this.handleAIRequestFailure(error, userContext, 'investment_advice', query)
    }
  }

  async planFIRE(request: AIAnalysisRequest): Promise<AIResponse> {
    const { data, userContext, query } = request

    if (!openaiApiKey && !deepseekApiKey) {
      return this.getFreeEducationalContent('fire_planning', query)
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
      const response = await this.makeAIRequest([
        { role: 'system', content: this.getSystemPrompt(userContext) },
        { role: 'user', content: prompt }
      ])
      
      return this.parseAIResponse(response, 'fire_planning')
    } catch (error) {
      console.error('Error in AI FIRE planning:', error)
      return this.handleAIRequestFailure(error, userContext, 'fire_planning', query)
    }
  }

  async simulateCrisis(request: AIAnalysisRequest): Promise<AIResponse> {
    const { data, userContext, query } = request

    if (!openaiApiKey && !deepseekApiKey) {
      return this.getFreeEducationalContent('crisis_simulation', query)
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
      const response = await this.makeAIRequest([
        { role: 'system', content: this.getSystemPrompt(userContext) },
        { role: 'user', content: prompt }
      ])
      
      return this.parseAIResponse(response, 'crisis_simulation')
    } catch (error) {
      console.error('Error in AI crisis simulation:', error)
      return this.handleAIRequestFailure(error, userContext, 'crisis_simulation', query)
    }
  }

  async generalQuery(request: AIAnalysisRequest): Promise<AIResponse> {
    const { userContext, query } = request

    if (!openaiApiKey && !deepseekApiKey) {
      return this.getFreeEducationalContent('general_query', query)
    }

    const prompt = `
Responda à pergunta do usuário sobre finanças pessoais:

PERGUNTA: ${query}

Forneça uma resposta educacional e prática, considerando o contexto financeiro brasileiro e o perfil do usuário.`

    try {
      const response = await this.makeAIRequest([
        { role: 'system', content: this.getSystemPrompt(userContext) },
        { role: 'user', content: prompt }
      ], { max_tokens: 1000 })
      
      return this.parseAIResponse(response, 'general_query')
    } catch (error) {
      console.error('Error in AI general query:', error)
      return this.handleAIRequestFailure(error, userContext, 'general_query', query)
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
        analysis: `💡 **Dicas para Controlar Gastos**

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
        analysis: `🎯 **Guia de Orçamentos Eficazes**

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
      investment_advice: {
        analysis: `📈 **Guia de Investimentos para Iniciantes**

**🏦 Primeiros Passos:**
• Quite dívidas de cartão (juros de 300%+ ao ano)
• Monte reserva de emergência (6 meses de gastos)
• Comece com Tesouro Direto (seguro e acessível)
• Diversifique gradualmente

**💼 Carteira Básica Sugerida:**
• 60% Renda Fixa (Tesouro, CDB, LCI/LCA)
• 30% Ações/ETFs (BOVA11, IVVB11)
• 10% FIIs (fundos imobiliários)

**⚠️ Evite no Início:**
• Day trade e especulação
• Produtos complexos (COE, estruturados)
• Concentração em uma única ação
• Investir dinheiro que precisa em 2 anos

🎯 **Meta:** Comece com R$ 100/mês e aumente 10% a cada 6 meses`,
        recommendations: [
          {
            id: 'inv_1',
            title: 'Monte sua reserva de emergência',
            description: '6 meses de gastos em CDB ou Tesouro Selic',
            priority: 'high' as const,
            category: 'emergency',
            impact: 'Alto',
            actionable: true
          },
          {
            id: 'inv_2',
            title: 'Comece com Tesouro Direto',
            description: 'Investimento mais seguro para iniciantes',
            priority: 'high' as const,
            category: 'investing',
            impact: 'Médio',
            actionable: true
          }
        ]
      },
      fire_planning: {
        analysis: `🔥 **Guia FIRE (Financial Independence, Retire Early)**

**📊 Regra dos 25x:**
• Acumule 25x seus gastos anuais
• Exemplo: R$ 5.000/mês = R$ 1.500.000 para FIRE
• Use taxa de retirada de 4% ao ano

**🎯 Estratégias FIRE:**
• **Lean FIRE:** Vida minimalista, meta menor
• **Fat FIRE:** Manter padrão de vida alto
• **Coast FIRE:** Investir cedo, deixar render
• **Barista FIRE:** Trabalho part-time + investimentos

**⚡ Acelere seu FIRE:**
• Aumente renda (side hustles, promoções)
• Reduza gastos desnecessários
• Invista em ativos que rendem acima da inflação
• Reinvista todos os dividendos

**📈 Exemplo Prático:**
R$ 2.000/mês por 20 anos a 10% a.a. = R$ 1.5M`,
        recommendations: [
          {
            id: 'fire_1',
            title: 'Calcule sua meta FIRE',
            description: 'Multiplique gastos anuais por 25',
            priority: 'high' as const,
            category: 'planning',
            impact: 'Alto',
            actionable: true
          },
          {
            id: 'fire_2',
            title: 'Aumente sua taxa de poupança',
            description: 'Meta: poupar 50%+ da renda para FIRE rápido',
            priority: 'high' as const,
            category: 'savings',
            impact: 'Alto',
            actionable: true
          }
        ]
      },
      crisis_simulation: {
        analysis: `⚠️ **Preparação para Crises Financeiras**

**🛡️ Proteções Essenciais:**
• Reserva de emergência robusta (12 meses)
• Diversificação geográfica de investimentos
• Renda passiva através de dividendos
• Habilidades que geram renda extra

**📉 Cenários de Crise:**
• **Recessão:** -30% em ações, +20% desemprego
• **Hiperinflação:** Ativos reais protegem valor
• **Crise Setorial:** Diversificação salva carteira
• **Emergência Pessoal:** Reserva evita venda forçada

**🎯 Estratégias Anti-Crise:**
• Mantenha 20% em dólar (hedge cambial)
• Invista em REITs e FIIs (renda passiva)
• Desenvolva múltiplas fontes de renda
• Evite alavancagem excessiva

💪 **Mentalidade:** Crises são oportunidades para quem está preparado`,
        recommendations: [
          {
            id: 'crisis_1',
            title: 'Aumente reserva de emergência',
            description: 'Meta: 12 meses de gastos para maior segurança',
            priority: 'high' as const,
            category: 'emergency',
            impact: 'Alto',
            actionable: true
          },
          {
            id: 'crisis_2',
            title: 'Diversifique geograficamente',
            description: 'Tenha 20% dos investimentos em dólar',
            priority: 'medium' as const,
            category: 'diversification',
            impact: 'Médio',
            actionable: true
          }
        ]
      },
      general_query: {
        analysis: `💡 **Educação Financeira**

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