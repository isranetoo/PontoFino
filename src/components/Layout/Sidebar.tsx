import React from 'react'
import { 
  Home, 
  TrendingUp, 
  BarChart3, 
  CreditCard, 
  Target, 
  User,
  Menu,
  X,
  Calculator,
  AlertTriangle,
  Plane,
  Star
} from 'lucide-react'
import { useState } from 'react'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'transactions', label: 'Transações', icon: CreditCard },
  { id: 'budgets', label: 'Orçamentos', icon: Target },
  { id: 'funds', label: 'Fundos', icon: TrendingUp },
  { id: 'compare', label: 'Comparador', icon: BarChart3 },
  { id: 'fire', label: 'Plano FIRE', icon: Calculator },
  { id: 'crisis', label: 'Simulação de Crise', icon: AlertTriangle },
  { id: 'retirement', label: 'Aposentadoria', icon: Plane },
  { id: 'pricing', label: 'Planos', icon: Star },
  { id: 'billing', label: 'Cobrança', icon: CreditCard },
  { id: 'profile', label: 'Perfil', icon: User }
]

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div
          className="p-6 h-full max-h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50"
          style={{
            /* fallback for browsers without tailwind-scrollbar plugin */
            scrollbarWidth: 'thin',
            scrollbarColor: '#bfdbfe #f0f9ff',
          }}
        >
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">FinanceHub</h1>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id)
                    setIsOpen(false)
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}