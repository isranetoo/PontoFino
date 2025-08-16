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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white/10 border border-white/10 rounded-lg shadow-md backdrop-blur-md hover:bg-white/20 transition-colors"
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-br from-blue-900 via-blue-900 to-blue-900 shadow-xl border-r border-white/10 transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <img src="/assets/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <h1 className="text-xl font-bold text-white px-3 py-1 shadow-sm">PontoFino</h1>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors font-medium
                    ${isActive
                      ? 'bg-gradient-to-r from-blue-700/60 to-blue-500/60 text-white border border-blue-400/40 shadow-md'
                      : 'text-blue-100 hover:bg-white/5 hover:text-white border border-white/10'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-200' : 'text-blue-300'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}