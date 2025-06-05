import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Plus, Target, Settings, Wallet, Menu, X } from 'lucide-react';


import { UserInfo } from './Auth';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';


function NavBar() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Navegação do menu mobile (mesmo conteúdo dos TabsTrigger)
  const mobileMenuItems = [
    {
      label: 'Dashboard',
      short: 'Painel',
      icon: <BarChart3 className="h-5 w-5" />, value: 'dashboard',
    },
    {
      label: 'Transações',
      short: 'Nova',
      icon: <Plus className="h-5 w-5" />, value: 'transactions',
    },
    {
      label: 'Histórico',
      short: 'Lista',
      icon: <Wallet className="h-5 w-5" />, value: 'history',
    },
    {
      label: 'Metas',
      short: 'Metas',
      icon: <Target className="h-5 w-5" />, value: 'goals',
    },
    {
      label: 'Investimentos',
      short: 'Investir',
      icon: <BarChart3 className="h-5 w-5" />, value: 'investments',
    },
    {
      label: 'Config',
      short: 'Ajustes',
      icon: <Settings className="h-5 w-5" />, value: 'settings',
    },
  ];

  // Função para navegação dos tabs no mobile
  const handleMobileNav = (value) => {
    // Aqui você pode usar navegação por rota se necessário
    // Exemplo: navigate(`/${value}`)
    // Ou disparar um evento para mudar o tab ativo
    const tab = document.querySelector(`[data-state="active"]`);
    const trigger = document.querySelector(`[data-value="${value}"]`);
    if (trigger && tab !== trigger) {
      trigger.click();
    }
    setMenuOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex justify-between items-center mb-2 w-full">
        <div />
        <div className="flex items-center gap-2">
          {/* Botões de login/registro visíveis apenas em telas médias para cima */}
          <div className="hidden sm:flex items-center gap-2">
            {!loading && !user && (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-1 rounded-lg font-medium text-white bg-gradient-to-r from-[#00b6fc] via-[#00a4fd] to-[#0096fd] hover:bg-blue-700 transition-all duration-200"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-1 rounded-lg font-medium text-blue-600 border border-blue-600 bg-white hover:bg-blue-50 transition-all duration-200"
                >
                  Registrar
                </button>
              </>
            )}
            <UserInfo />
          </div>
          {/* Ícone de menu hamburguer no mobile */}
          <button
            className="sm:hidden flex items-center justify-center p-2 rounded-md text-white bg-gradient-to-r from-[#00b6fc] to-[#0096fd] focus:outline-none"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Menu mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden absolute left-0 right-0 z-30 bg-gray-900/95 border-b border-gray-700 rounded-b-lg shadow-lg animate-fade-in-down">
          <nav className="flex flex-col gap-1 py-2 px-4">
            {mobileMenuItems.map((item) => (
              <button
                key={item.value}
                onClick={() => handleMobileNav(item.value)}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-blue-900/30 transition-all text-base"
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
            <div className="flex flex-col gap-2 mt-2">
              {!loading && !user && (
                <>
                  <button
                    onClick={() => { setMenuOpen(false); navigate('/login'); }}
                    className="px-4 py-1 rounded-lg font-medium text-white bg-gradient-to-r from-[#00b6fc] via-[#00a4fd] to-[#0096fd] hover:bg-blue-700 transition-all duration-200"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); navigate('/register'); }}
                    className="px-4 py-1 rounded-lg font-medium text-blue-600 border border-blue-600 bg-white hover:bg-blue-50 transition-all duration-200"
                  >
                    Registrar
                  </button>
                </>
              )}
              <UserInfo />
            </div>
          </nav>
        </div>
      )}

      {/* TabsList visível apenas em telas médias para cima */}
      <TabsList className="hidden sm:grid w-full grid-cols-3 gap-1 py-1 sm:grid-cols-6 md:grid-cols-6 bg-gray-800/50 border border-gray-700 rounded-lg">
        <TabsTrigger value="dashboard" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00b6fc] data-[state=active]:to-[#0096fd] h-12 sm:h-auto text-xs sm:text-sm min-w-0" data-value="dashboard">
          <BarChart3 className="h-4 w-4 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Dashboard</span>
          <span className="sm:hidden text-[10px]">Painel</span>
        </TabsTrigger>
        <TabsTrigger value="transactions" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00b6fc] data-[state=active]:to-[#0096fd] h-12 sm:h-auto text-xs sm:text-sm min-w-0" data-value="transactions">
          <Plus className="h-4 w-4 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Transações</span>
          <span className="sm:hidden text-[10px]">Nova</span>
        </TabsTrigger>
        <TabsTrigger value="history" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00b6fc] data-[state=active]:to-[#0096fd] h-12 sm:h-auto text-xs sm:text-sm min-w-0" data-value="history">
          <Wallet className="h-4 w-4 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Histórico</span>
          <span className="sm:hidden text-[10px]">Lista</span>
        </TabsTrigger>
        <TabsTrigger value="goals" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00b6fc] data-[state=active]:to-[#0096fd] h-12 sm:h-auto text-xs sm:text-sm min-w-0" data-value="goals">
          <Target className="h-4 w-4 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Metas</span>
          <span className="sm:hidden text-[10px]">Metas</span>
        </TabsTrigger>
        <TabsTrigger value="investments" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00b6fc] data-[state=active]:to-[#0096fd] h-12 sm:h-auto text-xs sm:text-sm min-w-0" data-value="investments">
          <BarChart3 className="h-4 w-4 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Investimentos</span>
          <span className="sm:hidden text-[10px]">Investir</span>
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00b6fc] data-[state=active]:to-[#0096fd] h-12 sm:h-auto text-xs sm:text-sm min-w-0" data-value="settings">
          <Settings className="h-4 w-4 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Config</span>
          <span className="sm:hidden text-[10px]">Ajustes</span>
        </TabsTrigger>
      </TabsList>
    </motion.div>
  );
}

export default NavBar;
