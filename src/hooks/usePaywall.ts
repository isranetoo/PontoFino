import { useState, useCallback } from 'react'
import { useSubscription } from './useSubscription'

interface PaywallState {
  isOpen: boolean
  feature: string
  featureDescription: string
  requiredPlan: 'pro' | 'premium'
  currentUsage?: number
  limit?: number
}

export function usePaywall() {
  const { canUseFeature, incrementUsage } = useSubscription()
  const [paywallState, setPaywallState] = useState<PaywallState>({
    isOpen: false,
    feature: '',
    featureDescription: '',
    requiredPlan: 'pro'
  })

  // Check if user can perform an action, show paywall if not
  const checkFeatureAccess = useCallback((
    featureKey: string,
    featureName: string,
    featureDescription: string,
    requiredPlan: 'pro' | 'premium' = 'pro'
  ): boolean => {
    const canUse = canUseFeature(featureKey)
    const allowed = typeof canUse === 'object' ? canUse.allowed : canUse
    const reason = typeof canUse === 'object' ? canUse.reason : undefined
    
    if (!allowed) {
      setPaywallState({
        isOpen: true,
        feature: featureName,
        featureDescription,
        requiredPlan,
        currentUsage: reason?.includes('Limite mensal') ? extractCurrentUsage(reason) : undefined,
        limit: reason?.includes('Limite mensal') ? extractLimit(reason) : undefined
      })
      return false
    }
    
    return true
  }, [canUseFeature])

  // Execute an action if allowed, increment usage, or show paywall
  const executeWithPaywall = useCallback(async (
    featureKey: string,
    featureName: string,
    featureDescription: string,
    action: () => Promise<void> | void,
    requiredPlan: 'pro' | 'premium' = 'pro'
  ): Promise<boolean> => {
    const hasAccess = checkFeatureAccess(featureKey, featureName, featureDescription, requiredPlan)
    
    if (!hasAccess) {
      return false
    }

    try {
      await action()
      await incrementUsage(featureKey)
      return true
    } catch (err) {
      console.error('Error executing action:', err)
      return false
    }
  }, [checkFeatureAccess, incrementUsage])

  const closePaywall = useCallback(() => {
    setPaywallState(prev => ({ ...prev, isOpen: false }))
  }, [])

  // Helper functions to extract usage info from error messages
  const extractCurrentUsage = (reason: string): number => {
    const match = reason.match(/(\d+)\/\d+/)
    return match ? parseInt(match[1]) : 0
  }

  const extractLimit = (reason: string): number => {
    const match = reason.match(/\d+\/(\d+)/)
    return match ? parseInt(match[1]) : 0
  }

  return {
    paywallState,
    checkFeatureAccess,
    executeWithPaywall,
    closePaywall
  }
}