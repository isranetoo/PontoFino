import React, { useState } from 'react'
import { useSubscription } from '../../hooks/useSubscription'
import { PLAN_CONFIGS } from '../../types/subscription'
import { 
  CreditCard, 
  Calendar, 
  Download, 
  Settings, 
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Check,
  ArrowRight
} from 'lucide-react'

export function BillingPage() {
  const { 
    subscription, 
    usage, 
    getPlanConfig, 
    isOnTrial, 
    getTrialDaysRemaining,
    createPortalSession,
    loading 
  } = useSubscription()
  
  const [portalLoading, setPortalLoading] = useState(false)

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    try {
      const session = await createPortalSession()
      if (session?.url) {
        window.location.href = session.url
      }
    } catch (err) {
      console.error('Error opening customer portal:', err)
      alert('Erro ao abrir portal de gerenciamento. Tente novamente.')
    } finally {
      setPortalLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'trialing':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'past_due':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'canceled':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5" />
      case 'trialing':
        return <Clock className="w-5 h-5" />
      case 'past_due':
        return <AlertCircle className="w-5 h-5" />
      case 'canceled':
        return <X className="w-5 h-5" />
      default:
        return <AlertCircle className="w-5 h-5" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo'
      case 'trialing':
        return 'Período de Teste'
      case 'past_due':
        return 'Pagamento Pendente'
      case 'canceled':
        return 'Cancelado'
      default:
        return 'Status Desconhecido'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando informações de cobrança...</p>
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Assinatura não encontrada
          </h2>
          <p className="text-gray-600">
            Não foi possível carregar suas informações de assinatura.
          </p>
        </div>
      </div>
    )
  }

  const currentPlan = getPlanConfig(subscription.plan)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Central de Cobrança</h1>
          <p className="text-gray-600">Gerencie sua assinatura e histórico de pagamentos</p>
        </div>

        {/* Current Plan Status */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Plano Atual</h2>
            {subscription.plan !== 'free' && (
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>{portalLoading ? 'Carregando...' : 'Gerenciar Assinatura'}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Plano</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {currentPlan.name}
              </div>
              {subscription.plan !== 'free' && (
                <div className="text-sm text-gray-600">
                  {formatPrice(currentPlan.price.monthly)}/mês
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                {getStatusIcon(subscription.status)}
                <span className="font-medium text-gray-900">Status</span>
              </div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(subscription.status)}`}>
                {getStatusText(subscription.status)}
              </div>
              {isOnTrial() && (
                <div className="text-sm text-blue-600 mt-1">
                  {getTrialDaysRemaining()} dias restantes
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Próxima Cobrança</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {subscription.current_period_end 
                  ? formatDate(subscription.current_period_end)
                  : 'N/A'
                }
              </div>
              {subscription.cancel_at_period_end && (
                <div className="text-sm text-red-600 mt-1">
                  Cancelamento agendado
                </div>
              )}
            </div>
          </div>

          {/* Trial Warning */}
          {isOnTrial() && getTrialDaysRemaining() <= 3 && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Seu teste termina em breve!</span>
              </div>
              <p className="text-yellow-700 mt-1">
                Seu período de teste do plano Pro termina em {getTrialDaysRemaining()} dias. 
                Para continuar usando os recursos premium, certifique-se de que seu método de pagamento está atualizado.
              </p>
            </div>
          )}
        </div>

        {/* Usage This Month */}
        {usage && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Uso Este Mês</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {usage.comparisons_used}
                </div>
                <div className="text-sm text-gray-600">Comparações de Fundos</div>
                <div className="text-xs text-gray-500 mt-1">
                  Limite: {currentPlan.limits.fund_comparisons === -1 ? 'Ilimitado' : currentPlan.limits.fund_comparisons}
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {usage.alerts_created}
                </div>
                <div className="text-sm text-gray-600">Alertas Criados</div>
                <div className="text-xs text-gray-500 mt-1">
                  Limite: {currentPlan.limits.budget_alerts === -1 ? 'Ilimitado' : currentPlan.limits.budget_alerts}
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {usage.scenarios_saved}
                </div>
                <div className="text-sm text-gray-600">Cenários Salvos</div>
                <div className="text-xs text-gray-500 mt-1">
                  Limite: {currentPlan.limits.portfolio_scenarios === -1 ? 'Ilimitado' : currentPlan.limits.portfolio_scenarios}
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {usage.exports_generated}
                </div>
                <div className="text-sm text-gray-600">Exportações</div>
                <div className="text-xs text-gray-500 mt-1">
                  Limite: {currentPlan.limits.data_exports === -1 ? 'Ilimitado' : currentPlan.limits.data_exports}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Plan Features */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recursos do Seu Plano</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentPlan.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          {subscription.plan === 'free' && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Desbloqueie Mais Recursos</h3>
              <p className="text-blue-800 mb-4">
                Upgrade para Pro ou Premium e tenha acesso a simulações de crise, 
                planejamento de aposentadoria internacional e muito mais.
              </p>
              <a
                href="/pricing"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>Ver Planos</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Billing History */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Histórico de Faturas</h2>
            <button
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <Download className="w-4 h-4" />
              <span>Ver Todas as Faturas</span>
            </button>
          </div>

          {/* Mock billing history - in production this would come from Stripe */}
          <div className="space-y-4">
            {subscription.plan !== 'free' ? (
              <>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Plano {currentPlan.name} - Janeiro 2025
                      </div>
                      <div className="text-sm text-gray-600">
                        Pago em 01/01/2025
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatPrice(currentPlan.price.monthly)}
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-700">
                      Baixar PDF
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Plano {currentPlan.name} - Dezembro 2024
                      </div>
                      <div className="text-sm text-gray-600">
                        Pago em 01/12/2024
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatPrice(currentPlan.price.monthly)}
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-700">
                      Baixar PDF
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p>Nenhuma fatura encontrada</p>
                <p className="text-sm">Você está no plano gratuito</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}