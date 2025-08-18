import React, { useEffect } from 'react'
import { useSubscription } from '../../hooks/useSubscription'
import { CheckCircle, ArrowRight, Zap, Crown } from 'lucide-react'

export function BillingSuccess() {
  const { subscription, reloadSubscription, loading } = useSubscription()

  useEffect(() => {
    // Reload subscription data to get the latest status
    reloadSubscription()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Confirmando sua assinatura...</p>
        </div>
      </div>
    )
  }

  const getPlanIcon = (plan: string) => {
    return plan === 'pro' ? <Zap className="w-12 h-12 text-blue-600" /> : <Crown className="w-12 h-12 text-purple-600" />
  }

  const getUnlockedFeatures = (plan: string) => {
    if (plan === 'pro') {
      return [
        'Comparador de fundos expandido (até 5 fundos)',
        'Simulação de cenários de crise',
        'Planejamento de aposentadoria internacional',
        'Gráficos avançados com indicadores técnicos',
        'Alertas inteligentes personalizados'
      ]
    } else if (plan === 'premium') {
      return [
        'Todos os recursos Pro +',
        'Comparações ilimitadas',
        'Cenários e simulações ilimitados',
        'Acesso à API para integrações',
        'Suporte prioritário',
        'Relatórios personalizados'
      ]
    }
    return []
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {subscription?.status === 'trialing' ? 'Teste Ativado!' : 'Assinatura Confirmada!'}
          </h1>
          <p className="text-gray-600">
            {subscription?.status === 'trialing' 
              ? `Seu período de teste do plano ${subscription.plan.toUpperCase()} foi ativado com sucesso.`
              : `Bem-vindo ao plano ${subscription?.plan.toUpperCase()}! Sua assinatura está ativa.`
            }
          </p>
        </div>

        {/* Plan Details */}
        {subscription && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
            <div className="flex items-center space-x-4 mb-4">
              {getPlanIcon(subscription.plan)}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Plano {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
                </h2>
                {subscription.status === 'trialing' && subscription.trial_end && (
                  <p className="text-blue-700">
                    Teste gratuito até {new Date(subscription.trial_end).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 mb-3">Recursos Desbloqueados:</h3>
            <ul className="space-y-2">
              {getUnlockedFeatures(subscription.plan).map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next Steps */}
        <div className="space-y-4 mb-8">
          <h3 className="font-semibold text-gray-900">Próximos Passos:</h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <span className="text-blue-900">
                Explore o comparador de fundos com até 5 ativos simultaneamente
              </span>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="text-green-900">
                Teste simulações de crise para avaliar riscos da sua carteira
              </span>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <span className="text-purple-900">
                Configure seu planejamento de aposentadoria internacional
              </span>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="/dashboard"
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <span>Ir para Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          
          <a
            href="/compare"
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            <span>Testar Comparador</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Support */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Precisa de ajuda? Entre em contato conosco em{' '}
            <a href="mailto:suporte@financehub.com" className="text-blue-600 hover:text-blue-700">
              suporte@financehub.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}