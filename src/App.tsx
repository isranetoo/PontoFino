import React, { useState } from 'react'
import { AuthProvider, useAuthContext } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { LoginForm } from './components/Auth/LoginForm'
import { Sidebar } from './components/Layout/Sidebar'
import Dashboard from './components/Dashboard/Dashboard'
import { FundsList } from './components/Funds/FundsList'
import { FundComparator } from './components/Compare/FundComparator'
import { Profile } from './components/Profile/Profile'
import { TransactionsPage } from './components/Transactions/TransactionsPage'
import { BudgetsPage } from './components/Budgets/BudgetsPage'
import { FirePlanner } from './components/Planning/FirePlanner'
import { CrisisSimulator } from './components/Planning/CrisisSimulator'
import { RetirementPlanner } from './components/Planning/RetirementPlanner'
import { PricingPage } from './components/Billing/PricingPage'
import { BillingPage } from './components/Billing/BillingPage'
import { PaywallModal } from './components/Billing/PaywallModal'
import { usePaywall } from './hooks/usePaywall'

function MainApp() {
  const { user, loading } = useAuthContext()
  const { paywallState, closePaywall } = usePaywall()
  const [activeTab, setActiveTab] = useState('dashboard')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'transactions':
        return <TransactionsPage />
      case 'budgets':
        return (
          <BudgetsPage />
        )
      case 'funds':
        return <FundsList />
      case 'compare':
        return <FundComparator />
      case 'profile':
        return <Profile />
      case 'fire':
        return <FirePlanner />
      case 'crisis':
        return <CrisisSimulator />
      case 'retirement':
        return <RetirementPlanner />
      case 'pricing':
        return <PricingPage />
      case 'billing':
        return <BillingPage />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="pl-0 lg:pl-64">
        <div className="px-6 lg:px-8 py-6 pt-20 lg:pt-6">
          {renderContent()}
        </div>
      </main>
      
      {/* Global Paywall Modal */}
      <PaywallModal
        isOpen={paywallState.isOpen}
        onClose={closePaywall}
        feature={paywallState.feature}
        featureDescription={paywallState.featureDescription}
        requiredPlan={paywallState.requiredPlan}
        currentUsage={paywallState.currentUsage}
        limit={paywallState.limit}
      />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainApp />
      </DataProvider>
    </AuthProvider>
  )
}

export default App