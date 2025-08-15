export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  plan: 'free' | 'pro' | 'premium'
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete'
  current_period_start?: string
  current_period_end?: string
  trial_end?: string
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export interface UsageQuota {
  id: string
  user_id: string
  month_year: string
  comparisons_used: number
  alerts_created: number
  scenarios_saved: number
  exports_generated: number
  created_at: string
  updated_at: string
}

export interface PlanFeature {
  id: string
  plan: 'free' | 'pro' | 'premium'
  feature_key: string
  limit_value: number // -1 means unlimited
  is_enabled: boolean
  created_at: string
}

export interface PlanConfig {
  name: string
  price: {
    monthly: number
    annual: number
  }
  features: string[]
  limits: Record<string, number>
  popular?: boolean
}

export const PLAN_CONFIGS: Record<string, PlanConfig> = {
  free: {
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    features: [
      'Importação manual (CSV/OFX) — 1 conta e até 1.000 transações/mês',
      'Orçamentos básicos (sem alertas)',
      'Catálogo de Fundos e busca',
      'Comparador simples: até 2 ativos com performance normalizada',
      'Planejamento FIRE básico',
      'Exportar CSV',
      'IA Copiloto básica — 25 interações/mês com insights educacionais'
    ],
    limits: {
      fund_comparisons: 2,
      budget_alerts: 3,
      portfolio_scenarios: 1,
      data_exports: 2,
      fire_planning: 1,
      ai_interactions: 25
    }
  },
  pro: {
    name: 'Pro',
    price: { monthly: 24.90, annual: 239.00 },
    features: [
      'Open Finance (quando disponível) — até 5 contas e 50k transações/mês',
      'Orçamentos com alertas 80%/100% + histórico',
      'Catálogo de Fundos com rent. 12m e taxas',
      'Comparador avançado: até 5 ativos + Sharpe, Volatilidade, Drawdown',
      'FIRE completo (cenários salvos)',
      'Simulação de crise (MVP) — impactos rápidos na carteira',
      'Até 20 alertas (preço, orçamento, metas)',
      'Export CSV/Excel',
      'IA Copiloto avançada — análise detalhada de transações e previsões'
    ],
    limits: {
      fund_comparisons: 5,
      budget_alerts: 10,
      portfolio_scenarios: 5,
      data_exports: 10,
      fire_planning: -1,
      crisis_simulation: 3,
      retirement_planning: 2,
      advanced_charts: 1,
      ai_interactions: 100
    },
    popular: true
  },
  premium: {
    name: 'Premium',
    price: { monthly: 49.90, annual: 479.00 },
    features: [
      'Tudo do Pro',
      'Beta, Treynor, Sortino; taxa vs. rent.; timeline de eventos',
      'Crises avançado; Aposentadoria multi-moeda; Monte Carlo',
      'Carteira multi-corretora + rebalanceamento sugerido',
      'Integrações: Google Sheets e API pessoal',
      'Alertas ilimitados',
      'IA Copiloto Premium — acesso completo + relatórios narrativos + ações automáticas'
    ],
    limits: {
      fund_comparisons: -1,
      budget_alerts: -1,
      portfolio_scenarios: -1,
      data_exports: -1,
      fire_planning: -1,
      crisis_simulation: -1,
      retirement_planning: -1,
      advanced_charts: -1,
      api_access: 1,
      priority_support: 1,
      ai_interactions: -1,
      ai_narrative_reports: 1,
      ai_auto_actions: 1
    }
  }
}