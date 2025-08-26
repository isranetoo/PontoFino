import React from 'react'
import { useSubscription } from '../../hooks/useSubscription'
import { PLAN_CONFIGS } from '../../types/subscription'
import { X, Zap, Crown, ArrowRight, Star } from 'lucide-react'

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  feature: string
  featureDescription: string
  requiredPlan: 'pro' | 'premium'
  currentUsage?: number
  limit?: number
}

export function PaywallModal({ 
  isOpen, 
  onClose, 
  feature, 
  featureDescription, 
  requiredPlan,
  currentUsage,
  limit
}: PaywallModalProps) {
  const { subscription, createCheckoutSession } = useSubscription()
  const [upgradeLoading, setUpgradeLoading] = React.useState(false)

  if (!isOpen) return null

  const handleUpgrade = async (plan: string) => {
    setUpgradeLoading(true)
    try {
      // In production, use actual Stripe price IDs
      const priceId = plan === 'pro' ? 'price_pro_monthly' : 'price_premium_monthly'
      const session = await createCheckoutSession(priceId, false)
      
      if (session?.url) {
        window.location.href = session.url
      }
    } catch (err) {
      console.error('Error creating checkout session:', err)
      alert('Erro ao iniciar upgrade. Tente novamente.')
    } finally {
      setUpgradeLoading(false)
    }
  }

  const getFeatureIcon = (plan: string) => {
    return plan === 'pro' ? <Zap className="w-8 h-8 text-blue-600" /> : <Crown className="w-8 h-8 text-purple-600" />
  }

  const requiredPlanConfig = PLAN_CONFIGS[requiredPlan]
  const premiumConfig = PLAN_CONFIGS.premium

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg sm:max-w-xl md:max-w-2xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {getFeatureIcon(requiredPlan)}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Recurso Premium</h2>
              <p className="text-gray-600">Upgrade necessário</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
  <div className="p-4 sm:p-6">
          {/* Feature Description */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">{feature}</h3>
            <p className="text-blue-800">{featureDescription}</p>
            {currentUsage !== undefined && limit !== undefined && (
              <p className="text-blue-700 mt-2 text-sm">
                Você já usou {currentUsage} de {limit} {feature.toLowerCase()} este mês.
              </p>
            )}
          </div>

          {/* Plan Comparison */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 mb-4 sm:mb-6">
            {/* Required Plan */}
            <div className="border-2 border-blue-500 rounded-xl p-4 sm:p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-blue-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
                  Recomendado
                </span>
              </div>
              
              <div className="text-center mb-3 sm:mb-4">
                <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 mx-auto mb-1 sm:mb-2" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">{requiredPlanConfig.name}</h3>
                <div className="text-lg sm:text-2xl font-bold text-blue-600 mt-1 sm:mt-2">
                  R$ {requiredPlanConfig.price.monthly.toFixed(2)}
                </div>
                <div className="text-gray-600 text-sm">/mês</div>
              </div>

              <ul className="space-y-1 sm:space-y-2 mb-4 sm:mb-6">
                {requiredPlanConfig.features.slice(0, 4).map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 text-xs sm:text-sm">
                    <Star className="w-4 h-4 text-blue-500" />
                    <span>{feature}</span>
                  </li>
                ))}
                <li className="text-sm text-gray-500">+ muito mais...</li>
              </ul>

              <button
                onClick={() => handleUpgrade('pro')}
                disabled={upgradeLoading}
                className="w-full bg-blue-600 text-white py-2 sm:py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                {upgradeLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Experimentar Pro - 7 dias grátis</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <p className="text-center text-[10px] sm:text-xs text-gray-500 mt-1 sm:mt-2">
                Cancele a qualquer momento
              </p>
            </div>

            {/* Premium Plan */}
            <div className="border border-gray-200 rounded-xl p-4 sm:p-6">
              <div className="text-center mb-3 sm:mb-4">
                <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 mx-auto mb-1 sm:mb-2" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">{premiumConfig.name}</h3>
                <div className="text-lg sm:text-2xl font-bold text-purple-600 mt-1 sm:mt-2">
                  R$ {premiumConfig.price.monthly.toFixed(2)}
                </div>
                <div className="text-gray-600 text-sm">/mês</div>
              </div>

              <ul className="space-y-1 sm:space-y-2 mb-4 sm:mb-6">
                {premiumConfig.features.slice(0, 4).map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 text-xs sm:text-sm">
                    <Star className="w-4 h-4 text-purple-500" />
                    <span>{feature}</span>
                  </li>
                ))}
                <li className="text-sm text-gray-500">+ recursos exclusivos</li>
              </ul>

              <button
                onClick={() => handleUpgrade('premium')}
                disabled={upgradeLoading}
                className="w-full bg-purple-600 text-white py-2 sm:py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                {upgradeLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Assinar Premium</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <h4 className="font-medium text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Por que fazer upgrade?</h4>
            <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
              <li>✅ Acesso completo a simulações de crise e cenários de mercado</li>
              <li>✅ Planejamento de aposentadoria internacional multi-moeda</li>
              <li>✅ Comparações avançadas com até 5 fundos simultaneamente</li>
              <li>✅ Alertas inteligentes e automações personalizadas</li>
              <li>✅ Exportações ilimitadas em múltiplos formatos</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-0 text-xs sm:text-sm text-gray-600">
            <span>Pagamento seguro processado pelo Stripe</span>
            <span>Cancele a qualquer momento</span>
          </div>
        </div>
      </div>
    </div>
  )
}