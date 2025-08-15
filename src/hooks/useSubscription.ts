import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'
import { PLAN_CONFIGS } from '../types/subscription'

// Mock subscription data since tables don't exist yet
interface MockSubscription {
  id: string
  user_id: string
  plan: 'free' | 'pro' | 'premium'
  status: 'active' | 'trialing' | 'past_due' | 'canceled'
  trial_end?: string
  current_period_end?: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
}

interface MockUsageQuota {
  id: string
  user_id: string
  month_year: string
  comparisons_used: number
  alerts_created: number
  scenarios_saved: number
  exports_generated: number
}

interface MockPlanFeature {
  id: string
  plan: string
  feature_key: string
  is_enabled: boolean
  limit_value: number
}

export function useSubscription() {
  const { user } = useAuthContext()
  const [subscription, setSubscription] = useState<MockSubscription | null>(null)
  const [usage, setUsage] = useState<MockUsageQuota | null>(null)
  const [planFeatures, setPlanFeatures] = useState<MockPlanFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load subscription data
  useEffect(() => {
    if (user) {
      loadSubscriptionData()
    }
  }, [user])

  const loadSubscriptionData = async () => {
    try {
      setLoading(true)
      
      // Mock subscription data since tables don't exist yet
      const mockSubscription: MockSubscription = {
        id: 'mock-sub-id',
        user_id: user!.id,
        plan: 'free',
        status: 'active'
      }
      setSubscription(mockSubscription)

      // Mock usage data
      const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
      const mockUsage: MockUsageQuota = {
        id: 'mock-usage-id',
        user_id: user!.id,
        month_year: currentMonth,
        comparisons_used: 0,
        alerts_created: 0,
        scenarios_saved: 0,
        exports_generated: 0
      }
      setUsage(mockUsage)

      // Mock plan features
      const mockFeatures: MockPlanFeature[] = [
        { id: '1', plan: 'free', feature_key: 'fund_comparisons', is_enabled: true, limit_value: 2 },
        { id: '2', plan: 'free', feature_key: 'budget_alerts', is_enabled: true, limit_value: 3 },
        { id: '3', plan: 'free', feature_key: 'portfolio_scenarios', is_enabled: false, limit_value: 0 },
        { id: '4', plan: 'free', feature_key: 'data_exports', is_enabled: false, limit_value: 0 },
        { id: '5', plan: 'free', feature_key: 'ai_interactions', is_enabled: true, limit_value: 25 }
      ]
      setPlanFeatures(mockFeatures)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription data')
    } finally {
      setLoading(false)
    }
  }

  // Check if user can use a feature
  const canUseFeature = useCallback((featureKey: string): { allowed: boolean; reason?: string } | boolean => {
    if (!subscription || !usage) return false

    const feature = planFeatures.find(f => f.feature_key === featureKey)
    if (!feature || !feature.is_enabled) return { allowed: false, reason: 'Recurso não disponível no seu plano' }

    const currentUsage = getCurrentUsage(featureKey)
    
    if (feature.limit_value === -1) return { allowed: true } // Unlimited
    
    const allowed = currentUsage < feature.limit_value
    const reason = allowed ? undefined : `Limite mensal atingido (${currentUsage}/${feature.limit_value})`
    
    return { allowed, reason }
  }, [subscription, usage, planFeatures])

  // Get current usage for a feature
  const getCurrentUsage = useCallback((featureKey: string): number => {
    if (!usage) return 0

    switch (featureKey) {
      case 'fund_comparisons':
        return usage.comparisons_used
      case 'budget_alerts':
        return usage.alerts_created
      case 'portfolio_scenarios':
        return usage.scenarios_saved
      case 'data_exports':
        return usage.exports_generated
      default:
        return 0
    }
  }, [usage])

  // Increment usage for a feature
  const incrementUsage = useCallback(async (featureKey: string): Promise<boolean> => {
    if (!user || !usage) return false

    // Mock increment for now
    const incrementField = getUsageField(featureKey)
    if (!incrementField) return false

    // Update local state
    setUsage(prev => {
      if (!prev) return prev
      return {
        ...prev,
        [incrementField]: prev[incrementField as keyof MockUsageQuota] + 1
      }
    })

    return true
  }, [user, usage, getCurrentUsage])

  const getUsageField = (featureKey: string): string | null => {
    switch (featureKey) {
      case 'fund_comparisons':
        return 'comparisons_used'
      case 'budget_alerts':
        return 'alerts_created'
      case 'portfolio_scenarios':
        return 'scenarios_saved'
      case 'data_exports':
        return 'exports_generated'
      default:
        return null
    }
  }

  // Get plan configuration
  const getPlanConfig = useCallback((plan: string) => {
    return PLAN_CONFIGS[plan] || PLAN_CONFIGS.free
  }, [])

  // Check if user is on trial
  const isOnTrial = useCallback((): boolean => {
    if (!subscription) return false
    return subscription.status === 'trialing' && 
           subscription.trial_end && 
           new Date(subscription.trial_end) > new Date()
  }, [subscription])

  // Get days remaining in trial
  const getTrialDaysRemaining = useCallback((): number => {
    if (!isOnTrial() || !subscription?.trial_end) return 0
    const trialEnd = new Date(subscription.trial_end)
    const now = new Date()
    const diffTime = trialEnd.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }, [subscription, isOnTrial])

  // Create Stripe checkout session
  const createCheckoutSession = useCallback(async (priceId: string, isAnnual: boolean = false) => {
    try {
      // Mock Stripe checkout session since Edge Function doesn't exist
      // In production, this would call the actual Stripe API
      console.log('Mock checkout session for:', { priceId, isAnnual, userId: user?.id })
      
      // Simulate successful checkout session creation
      return {
        url: `/billing/success?session_id=mock_session_${Date.now()}&plan=${priceId.includes('pro') ? 'pro' : 'premium'}`
      }
    } catch (err) {
      console.error('Error creating checkout session:', err)
      throw err
    }
  }, [user])

  // Create customer portal session
  const createPortalSession = useCallback(async () => {
    try {
      // Mock customer portal session since Edge Function doesn't exist
      // In production, this would call the actual Stripe Customer Portal API
      console.log('Mock portal session for customer:', subscription?.stripe_customer_id)
      
      // Simulate successful portal session creation
      return {
        url: `/billing/manage?customer_id=${subscription?.stripe_customer_id || 'mock_customer'}`
      }
    } catch (err) {
      console.error('Error creating portal session:', err)
      throw err
    }
  }, [subscription])

  return {
    // State
    subscription,
    usage,
    planFeatures,
    loading,
    error,

    // Methods
    canUseFeature,
    getCurrentUsage,
    incrementUsage,
    getPlanConfig,
    isOnTrial,
    getTrialDaysRemaining,
    createCheckoutSession,
    createPortalSession,
    
    // Utilities
    reloadSubscription: loadSubscriptionData
  }
}