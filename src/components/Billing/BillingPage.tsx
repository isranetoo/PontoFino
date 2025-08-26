import { useState } from 'react'
import { useSubscription } from '../../hooks/useSubscription'
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
        return 'text-green-600 bg-green-100 border-green-300'
      case 'trialing':
        return 'text-blue-600 bg-blue-100 border-blue-300'
      case 'past_due':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300'
      case 'canceled':
        return 'text-red-600 bg-red-100 border-red-300'
      default:
        return 'text-gray-600 bg-gray-100 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-6 h-6" />
      case 'trialing':
        return <Clock className="w-6 h-6" />
      case 'past_due':
        return <AlertCircle className="w-6 h-6" />
      case 'canceled':
        return <X className="w-6 h-6" />
      default:
        return <AlertCircle className="w-6 h-6" />
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-blue-700 font-medium">Carregando informações de cobrança...</p>
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Assinatura não encontrada</h2>
          <p className="text-gray-600">Não foi possível carregar suas informações de assinatura.</p>
        </div>
      </div>
    )
  }

  const currentPlan = getPlanConfig(subscription.plan)

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex items-center gap-4">
          <CreditCard className="w-12 h-12 text-blue-600 bg-white rounded-full shadow-lg p-2" />
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-1 tracking-tight">Central de Cobrança</h1>
            <p className="text-lg text-gray-600">Gerencie sua assinatura, pagamentos e recursos premium</p>
          </div>
        </div>

        {/* Current Plan Status */}
        <div className="bg-white/90 rounded-2xl shadow-xl p-8 mb-10 border border-blue-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold border-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-900 border-blue-200 shadow-sm">
                <CreditCard className="w-6 h-6 mr-2 text-blue-500" />
                {currentPlan.name}
              </span>
              {subscription.plan !== 'free' && (
                <span className="ml-2 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-400 to-blue-400 text-white shadow">PRO</span>
              )}
            </div>
            {subscription.plan !== 'free' && (
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
              >
                <Settings className="w-5 h-5" />
                <span>{portalLoading ? 'Carregando...' : 'Gerenciar Assinatura'}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 shadow">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-7 h-7 text-blue-500" />
                <span className="font-bold text-gray-900 text-lg">Plano</span>
              </div>
              <div className="text-2xl font-extrabold text-blue-900 mb-1 tracking-tight">
                {currentPlan.name}
              </div>
              {subscription.plan !== 'free' && (
                <div className="text-base text-blue-700 font-semibold">
                  {formatPrice(currentPlan.price.monthly)}<span className="text-xs font-normal">/mês</span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 shadow">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(subscription.status)}
                <span className="font-bold text-gray-900 text-lg">Status</span>
              </div>
              <div className={`inline-flex items-center px-4 py-1 rounded-full text-base font-bold border-2 shadow ${getStatusColor(subscription.status)}`}>
                {getStatusText(subscription.status)}
              </div>
              {isOnTrial() && (
                <div className="text-sm text-blue-600 mt-1 animate-pulse">
                  {getTrialDaysRemaining()} dias restantes de teste
                </div>
              )}
            </div>

            <div className="flex flex-col items-center bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 shadow">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-7 h-7 text-yellow-500" />
                <span className="font-bold text-gray-900 text-lg">Próxima Cobrança</span>
              </div>
              <div className="text-xl font-bold text-gray-900">
                {subscription.current_period_end
                  ? formatDate(subscription.current_period_end)
                  : 'N/A'}
              </div>
              {Boolean((subscription as any).cancel_at_period_end) && (
                <div className="text-sm text-red-600 mt-1 animate-pulse">
                  Cancelamento agendado
                </div>
              )}
            </div>
          </div>

          {/* Trial Warning */}
          {isOnTrial() && getTrialDaysRemaining() <= 3 && (
            <div className="mt-8 bg-gradient-to-r from-yellow-100 to-yellow-50 border border-yellow-300 rounded-xl p-5 flex items-center gap-3 shadow animate-pulse">
              <AlertCircle className="w-7 h-7 text-yellow-600" />
              <div>
                <span className="font-bold text-yellow-800">Seu teste termina em breve!</span>
                <p className="text-yellow-700 mt-1 text-sm">
                  Seu período de teste do plano Pro termina em {getTrialDaysRemaining()} dias. Para continuar usando os recursos premium, certifique-se de que seu método de pagamento está atualizado.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Usage This Month */}
        {usage && (
          <div className="bg-white/90 rounded-2xl shadow-xl p-8 mb-10 border border-purple-100">
            <h2 className="text-2xl font-bold text-purple-900 mb-8 flex items-center gap-2">
              <Download className="w-6 h-6 text-purple-500" /> Uso Este Mês
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="flex flex-col items-center">
                <div className="text-3xl font-extrabold text-blue-600 mb-1 animate-bounce">{usage.comparisons_used}</div>
                <div className="text-base text-gray-700 font-semibold">Comparações de Fundos</div>
                <div className="text-xs text-gray-500 mt-1">Limite: {currentPlan.limits.fund_comparisons === -1 ? 'Ilimitado' : currentPlan.limits.fund_comparisons}</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-extrabold text-green-600 mb-1 animate-bounce">{usage.alerts_created}</div>
                <div className="text-base text-gray-700 font-semibold">Alertas Criados</div>
                <div className="text-xs text-gray-500 mt-1">Limite: {currentPlan.limits.budget_alerts === -1 ? 'Ilimitado' : currentPlan.limits.budget_alerts}</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-extrabold text-purple-600 mb-1 animate-bounce">{usage.scenarios_saved}</div>
                <div className="text-base text-gray-700 font-semibold">Cenários Salvos</div>
                <div className="text-xs text-gray-500 mt-1">Limite: {currentPlan.limits.portfolio_scenarios === -1 ? 'Ilimitado' : currentPlan.limits.portfolio_scenarios}</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-extrabold text-orange-500 mb-1 animate-bounce">{usage.exports_generated}</div>
                <div className="text-base text-gray-700 font-semibold">Exportações</div>
                <div className="text-xs text-gray-500 mt-1">Limite: {currentPlan.limits.data_exports === -1 ? 'Ilimitado' : currentPlan.limits.data_exports}</div>
              </div>
            </div>
          </div>
        )}

        {/* Plan Features */}
        <div className="bg-white/90 rounded-2xl shadow-xl p-8 mb-10 border border-green-100">
          <h2 className="text-2xl font-bold text-green-900 mb-8 flex items-center gap-2">
            <Check className="w-6 h-6 text-green-500" /> Recursos do Seu Plano
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentPlan.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg px-4 py-3 mb-2 shadow-sm">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>
          {subscription.plan === 'free' && (
            <div className="mt-8 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 rounded-xl p-6 flex flex-col items-center shadow">
              <h3 className="font-bold text-blue-900 text-lg mb-2">Desbloqueie Mais Recursos</h3>
              <p className="text-blue-800 mb-4 text-center">Upgrade para Pro ou Premium e tenha acesso a simulações de crise, planejamento de aposentadoria internacional e muito mais.</p>
              <a
                href="/pricing"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:scale-105 transition-transform"
              >
                <span>Ver Planos</span>
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          )}
        </div>

        {/* Billing History */}
        <div className="bg-white/90 rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Download className="w-6 h-6 text-blue-500" /> Histórico de Faturas
            </h2>
            <button
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className="flex items-center gap-2 text-blue-700 hover:text-purple-700 font-semibold px-4 py-2 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              <span>Ver Todas as Faturas</span>
            </button>
          </div>
          {/* Mock billing history - in produção viria do Stripe */}
          <div className="space-y-6">
            {subscription.plan !== 'free' ? (
              <>
                {/* Timeline style for invoices */}
                <div className="relative flex items-center gap-6 p-6 border border-green-200 rounded-xl bg-gradient-to-r from-green-50 to-blue-50 shadow">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center shadow">
                      <CheckCircle className="w-7 h-7 text-green-700" />
                    </div>
                    <div className="h-10 w-1 bg-green-300 my-1 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-lg">Plano {currentPlan.name} - Janeiro 2025</div>
                    <div className="text-sm text-gray-600">Pago em 01/01/2025</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-700 text-lg">{formatPrice(currentPlan.price.monthly)}</div>
                    <button className="text-sm text-blue-600 hover:text-purple-700 font-semibold mt-1">Baixar PDF</button>
                  </div>
                </div>
                <div className="relative flex items-center gap-6 p-6 border border-green-200 rounded-xl bg-gradient-to-r from-green-50 to-blue-50 shadow">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center shadow">
                      <CheckCircle className="w-7 h-7 text-green-700" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-lg">Plano {currentPlan.name} - Dezembro 2024</div>
                    <div className="text-sm text-gray-600">Pago em 01/12/2024</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-700 text-lg">{formatPrice(currentPlan.price.monthly)}</div>
                    <button className="text-sm text-blue-600 hover:text-purple-700 font-semibold mt-1">Baixar PDF</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-semibold">Nenhuma fatura encontrada</p>
                <p className="text-sm">Você está no plano gratuito</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}