import React, { useState } from 'react'
import { useSubscription } from '../../hooks/useSubscription'
import { PLAN_CONFIGS } from '../../types/subscription'
import { 
  Check, 
  Star, 
  Zap, 
  Crown, 
  ArrowRight, 
  Shield, 
  Users, 
  CreditCard,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

export function PricingPage() {
  const { subscription, createCheckoutSession, loading } = useSubscription()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const handleSubscribe = async (plan: string) => {
    if (plan === 'free') {
      // For free plan, just show success message
      alert('Conta gratuita criada! Você já pode usar todos os recursos do plano Free.')
      return
    }

    setCheckoutLoading(plan)
    try {
      // In a real implementation, you would have actual Stripe price IDs
      const priceId = getPriceId(plan, billingCycle)
      const session = await createCheckoutSession(priceId, billingCycle === 'annual')
      
      if (session?.url) {
        // Mock successful subscription for demo purposes
        alert(`Redirecionando para checkout do plano ${plan.toUpperCase()}...\n\nEm produção, isso abriria o Stripe Checkout.`)
        
        // In production, this would redirect to actual Stripe checkout
        // window.location.href = session.url
      }
    } catch (err) {
      console.error('Error creating checkout session:', err)
      alert('Erro ao iniciar processo de pagamento. Tente novamente.')
    } finally {
      setCheckoutLoading(null)
    }
  }

  const getPriceId = (plan: string, cycle: string): string => {
    // In production, these would be actual Stripe price IDs
    const priceIds: Record<string, Record<string, string>> = {
      pro: {
        monthly: 'price_pro_monthly',
        annual: 'price_pro_annual'
      },
      premium: {
        monthly: 'price_premium_monthly',
        annual: 'price_premium_annual'
      }
    }
    return priceIds[plan]?.[cycle] || ''
  }

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'free':
        return <Star className="w-8 h-8 text-gray-600" />
      case 'pro':
        return <Zap className="w-8 h-8 text-blue-600" />
      case 'premium':
        return <Crown className="w-8 h-8 text-purple-600" />
      default:
        return <Star className="w-8 h-8 text-gray-600" />
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const getAnnualSavings = (plan: string) => {
    const config = PLAN_CONFIGS[plan]
    if (!config || config.price.monthly === 0) return 0
    const monthlyCost = config.price.monthly * 12
    const annualCost = config.price.annual
    return monthlyCost - annualCost
  }

  const faqItems = [
    {
      question: "Posso usar de graça?",
      answer: "Sim. O plano Free é permanente. Você faz upgrade quando precisar."
    },
    {
      question: "Como funciona o teste do Pro?",
      answer: "Você tem 7 dias para testar. Antes de acabar, avisamos por e-mail. Pode cancelar a qualquer momento."
    },
    {
      question: "O que acontece se eu cancelar?",
      answer: "Você mantém acesso até o fim do período já pago e volta para o Free, sem perder seus dados."
    },
    {
      question: "Posso migrar entre mensal e anual?",
      answer: "Sim. Você pode alternar no Portal do Cliente (Stripe) e o ajuste é feito automaticamente."
    },
    {
      question: "Vocês guardam meus dados de cartão?",
      answer: "Não. Quem processa e armazena com segurança é a Stripe."
    },
    {
      question: "O app dá recomendação de investimento?",
      answer: "Não. Oferecemos análise e educação financeira. As decisões são suas."
    },
    {
      question: "Tenho CNPJ/Time. Tem plano empresarial?",
      answer: "Sim. Fale com a gente para planos multiusuário e relatórios personalizados."
    }
  ]

  const comparisonFeatures = [
    {
      feature: "Transações mensais",
      free: "1.000",
      pro: "50.000",
      premium: "200.000"
    },
    {
      feature: "Contas conectadas",
      free: "1",
      pro: "5",
      premium: "10"
    },
    {
      feature: "Orçamentos com alertas",
      free: "—",
      pro: "✅",
      premium: "✅ + relatórios mensais"
    },
    {
      feature: "Comparador",
      free: "2 ativos",
      pro: "5 ativos",
      premium: "10 ativos"
    },
    {
      feature: "Métricas",
      free: "—",
      pro: "Sharpe, Vol, DD",
      premium: "+ Beta, Treynor, Sortino"
    },
    {
      feature: "Planejamento FIRE",
      free: "Básico",
      pro: "Completo",
      premium: "+ Monte Carlo"
    },
    {
      feature: "Simulação de Crises",
      free: "—",
      pro: "MVP",
      premium: "Avançado com sensibilidades"
    },
    {
      feature: "Aposentadoria multi-moeda",
      free: "—",
      pro: "—",
      premium: "✅"
    },
    {
      feature: "Alertas",
      free: "0",
      pro: "Até 20",
      premium: "Ilimitado"
    },
    {
      feature: "Exportações",
      free: "CSV",
      pro: "CSV + Excel",
      premium: "+ PDF"
    },
    {
      feature: "Integrações",
      free: "—",
      pro: "—",
      premium: "Sheets + API pessoal"
    },
    {
      feature: "IA Assistente",
      free: "Insights básicos (10/mês)",
      pro: "Análises detalhadas (100/mês)",
      premium: "Ilimitado + relatórios + ações automáticas"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 pt-12 md:pt-16 pb-16 md:pb-24">
          {/* Header */}
          <div className="text-center mb-10 md:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
              Escolha o plano ideal para sua vida financeira
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto">
              Comece grátis. Faça upgrade quando precisar. Sem burocracia.
            </p>

            {/* Social Proof */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6 md:mb-8">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-gray-600 text-sm sm:text-base">+3.000 investidores usando diariamente</span>
            </div>

            {/* Security Badge */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 mb-8 md:mb-12">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Pagamentos seguros por Stripe</span>
              </div>
              <div className="w-1 h-1 bg-gray-400 rounded-full hidden sm:block"></div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <X className="w-4 h-4 text-blue-600" />
                <span>Cancele quando quiser</span>
              </div>
            </div>

            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-gray-100 rounded-xl p-1 mb-6 md:mb-8 relative">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mensal
              </button>
              <div className="relative">
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    billingCycle === 'annual'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Anual
                </button>
                {billingCycle !== 'annual' && (
                  <span className="absolute -top-3 -right-3 sm:-top-2 sm:-right-2 bg-green-500 text-white text-[10px] sm:text-xs px-2 py-1 rounded-full z-10 shadow">
                    2 meses grátis
                  </span>
                )}
              </div>
            </div>

            {/* Main CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={() => handleSubscribe('pro')}
                disabled={checkoutLoading === 'pro'}
                className="bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg w-full sm:w-auto"
              >
                {checkoutLoading === 'pro' ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Experimentar o Pro por 7 dias</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              <button
                onClick={() => handleSubscribe('free')}
                className="bg-gray-100 text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-200 transition-colors w-full sm:w-auto"
              >
                Ficar no Free
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 pb-16 md:pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-24">
          {Object.entries(PLAN_CONFIGS).map(([planKey, config]) => (
            <div
              key={planKey}
              className={`relative bg-white rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col justify-between ${
                config.popular ? 'ring-2 ring-blue-500 scale-105 z-10' : ''
              }`}
            >
              {config.popular && (
                <div className="absolute left-1/2 -top-5 sm:-top-6 -translate-x-1/2 z-20 flex justify-center w-full pointer-events-none">
                  <span className="bg-blue-500 text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-lg">
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6 sm:mb-8">
                <div className="flex justify-center mb-3 sm:mb-4">
                  {getPlanIcon(planKey)}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">{config.name}</h3>
                
                <div className="mb-3 sm:mb-4">
                  {planKey === 'free' ? (
                    <div className="text-3xl sm:text-4xl font-bold text-gray-900">Grátis</div>
                  ) : (
                    <div>
                      <div className="text-3xl sm:text-4xl font-bold text-gray-900">
                        {formatPrice(config.price[billingCycle])}
                      </div>
                      <div className="text-gray-600 text-xs sm:text-base">
                        /{billingCycle === 'monthly' ? 'mês' : 'ano'}
                      </div>
                      {billingCycle === 'annual' && getAnnualSavings(planKey) > 0 && (
                        <div className="text-xs sm:text-sm text-green-600 mt-1">
                          Economize {formatPrice(getAnnualSavings(planKey))} por ano
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6">
                  {planKey === 'free' && "Para começar a organizar finanças e testar o app."}
                  {planKey === 'pro' && "Automatize seu controle e decida com dados."}
                  {planKey === 'premium' && "Para quem quer o máximo em análise, IA e integrações."}
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {config.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 sm:gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-xs sm:text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handleSubscribe(planKey)}
                disabled={
                  checkoutLoading === planKey || 
                  loading || 
                  (subscription?.plan === planKey && subscription?.status === 'active')
                }
                className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 sm:gap-2 ${
                  planKey === 'free'
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : config.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                } ${
                  subscription?.plan === planKey && subscription?.status === 'active'
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                } text-sm sm:text-base`}
              >
                {checkoutLoading === planKey ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : subscription?.plan === planKey && subscription?.status === 'active' ? (
                  'Plano Atual'
                ) : planKey === 'free' ? (
                  'Criar conta grátis'
                ) : planKey === 'pro' ? (
                  'Experimentar Pro por 7 dias'
                ) : (
                  'Assinar Premium'
                )}
              </button>

              {planKey === 'pro' && (
                <p className="text-center text-xs text-gray-500 mt-2 sm:mt-3">
                  Sem compromisso. Cancele quando quiser.
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Pricing Notes */}
        <div className="text-center mb-10 md:mb-16">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-8 text-xs sm:text-sm text-gray-600">
            <span>Preços em BRL. Impostos incluídos quando aplicável.</span>
            <span>Pagamentos processados de forma segura pela Stripe.</span>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-x-auto mb-16 md:mb-24">
          <div className="bg-gray-50 px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">
              Compare todos os recursos
            </h2>
          </div>

          <div className="w-full min-w-[500px] sm:min-w-0 overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-8 py-2 sm:py-4 text-left font-semibold text-gray-900">Recursos</th>
                  <th className="px-2 sm:px-8 py-2 sm:py-4 text-center font-semibold text-gray-900">Free</th>
                  <th className="px-2 sm:px-8 py-2 sm:py-4 text-center font-semibold text-gray-900 bg-blue-50">
                    Pro
                    <span className="block text-[10px] sm:text-xs font-normal text-blue-600 mt-1">Mais Popular</span>
                  </th>
                  <th className="px-2 sm:px-8 py-2 sm:py-4 text-center font-semibold text-gray-900">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {comparisonFeatures.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-8 py-2 sm:py-4 font-medium text-gray-900">{row.feature}</td>
                    <td className="px-2 sm:px-8 py-2 sm:py-4 text-center text-gray-600">{row.free}</td>
                    <td className="px-2 sm:px-8 py-2 sm:py-4 text-center text-blue-700 bg-blue-50 font-medium">{row.pro}</td>
                    <td className="px-2 sm:px-8 py-2 sm:py-4 text-center text-purple-700 font-medium">{row.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Target Audience */}
        <div className="mb-16 md:mb-24">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12">
            Para quem é cada plano?
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center p-6 sm:p-8 bg-white rounded-xl shadow-lg">
              <Star className="w-10 sm:w-12 h-10 sm:h-12 text-gray-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-4">Free</h3>
              <p className="text-gray-600 text-xs sm:text-base">
                Para começar — controle simples, testes e aprendizado da interface.
              </p>
            </div>

            <div className="text-center p-6 sm:p-8 bg-white rounded-xl shadow-lg ring-2 ring-blue-500">
              <Zap className="w-10 sm:w-12 h-10 sm:h-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-4">Pro</h3>
              <p className="text-gray-600 text-xs sm:text-base">
                Para quem movimenta conta todo mês, quer alertas e métricas para decidir melhor.
              </p>
            </div>

            <div className="text-center p-6 sm:p-8 bg-white rounded-xl shadow-lg">
              <Crown className="w-10 sm:w-12 h-10 sm:h-12 text-purple-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-4">Premium</h3>
              <p className="text-gray-600 text-xs sm:text-base">
                Para investidores que usam análise de risco, cenários e integrações no dia a dia.
              </p>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-12 mb-16 md:mb-24">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12">
            O que nossos usuários dizem
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                M
              </div>
              <p className="text-gray-600 mb-3 sm:mb-4 italic text-xs sm:text-base">
                "O comparador de fundos me ajudou a escolher melhor onde investir. 
                Os gráficos são muito claros."
              </p>
              <div className="font-medium text-gray-900 text-xs sm:text-base">Marina</div>
              <div className="text-xs sm:text-sm text-gray-500">São Paulo</div>
            </div>

            <div className="text-center">
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                R
              </div>
              <p className="text-gray-600 mb-3 sm:mb-4 italic text-xs sm:text-base">
                "A simulação de crise me mostrou que minha carteira estava muito arriscada. 
                Consegui diversificar melhor."
              </p>
              <div className="font-medium text-gray-900 text-xs sm:text-base">Roberto</div>
              <div className="text-xs sm:text-sm text-gray-500">Rio de Janeiro</div>
            </div>

            <div className="text-center">
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                A
              </div>
              <p className="text-gray-600 mb-3 sm:mb-4 italic text-xs sm:text-base">
                "O planejamento FIRE me deu clareza sobre quando posso me aposentar. 
                Mudou minha estratégia completamente."
              </p>
              <div className="font-medium text-gray-900 text-xs sm:text-base">Ana</div>
              <div className="text-xs sm:text-sm text-gray-500">Belo Horizonte</div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="bg-gray-50 rounded-2xl p-6 sm:p-12 mb-16 md:mb-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 text-center">
            <div>
              <Shield className="w-10 sm:w-12 h-10 sm:h-12 text-green-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-base sm:text-lg">Segurança Garantida</h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Seus dados são criptografados. Você controla suas permissões.
              </p>
            </div>

            <div>
              <CreditCard className="w-10 sm:w-12 h-10 sm:h-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-base sm:text-lg">Pagamentos Seguros</h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Processados pela Stripe. Não armazenamos dados de cartão.
              </p>
            </div>

            <div>
              <Users className="w-10 sm:w-12 h-10 sm:h-12 text-purple-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-base sm:text-lg">Suporte Especializado</h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Equipe de especialistas em planejamento financeiro.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-2xl sm:max-w-3xl md:max-w-4xl mx-auto mb-16 md:mb-24 px-2 sm:px-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12">
            Perguntas Frequentes
          </h2>

          <div className="space-y-3 sm:space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-4 sm:px-8 py-4 sm:py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">{item.question}</h3>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-4 sm:px-8 pb-4 sm:pb-6">
                    <p className="text-gray-600 text-xs sm:text-base">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 sm:p-12 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
            Pronto para simplificar suas finanças?
          </h2>
          <p className="text-base sm:text-xl mb-6 sm:mb-8 opacity-90">
            Comece grátis e desbloqueie recursos avançados quando quiser.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => handleSubscribe('pro')}
              disabled={checkoutLoading === 'pro'}
              className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-lg w-full sm:w-auto"
            >
              {checkoutLoading === 'pro' ? (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Experimentar Pro por 7 dias</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <button
              onClick={() => handleSubscribe('free')}
              className="bg-transparent border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-white hover:text-blue-600 transition-colors w-full sm:w-auto"
            >
              Ficar no Free
            </button>
          </div>
        </div>

        {/* Legal Footer */}
        <div className="mt-10 md:mt-16 pt-6 md:pt-8 border-t border-gray-200 text-center text-xs sm:text-sm text-gray-500 space-y-2">
          <p>
            <strong>Informações educacionais.</strong> Não constituem recomendação de investimento.
          </p>
          <p>
            Pagamentos processados pela Stripe. Não armazenamos dados completos de cartão.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-2 sm:mt-4">
            <a href="/terms" className="hover:text-gray-700">Termos de Uso</a>
            <a href="/privacy" className="hover:text-gray-700">Política de Privacidade</a>
            <a href="/lgpd" className="hover:text-gray-700">LGPD</a>
            <a href="/contact" className="hover:text-gray-700">Contato</a>
          </div>
        </div>
      </div>
    </div>
  )
}