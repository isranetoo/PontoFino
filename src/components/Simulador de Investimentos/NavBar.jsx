import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Plus, PieChart, Settings, ArrowLeft, Menu, X, CalendarCheck2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserInfo } from '../Auth';

function SimuladorNavBar({ tab, setTab }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading } = useAuth();

  const menuItems = [
    { label: 'Simular', icon: <PieChart className="h-5 w-5" />, value: 'simular' },
    { label: 'Comparar', icon: <BarChart3 className="h-5 w-5" />, value: 'comparar' },
    { label: 'Comparador Fundos & RV', icon: <BarChart3 className="h-5 w-5" />, value: 'comparador_fundos' },
    { label: 'Histórico', icon: <Plus className="h-5 w-5" />, value: 'historico' },
    { label: 'Aposentadoria', icon: <CalendarCheck2 className="h-5 w-5" />, value: 'aposentadoria' },
    { label: 'Configurações', icon: <Settings className="h-5 w-5" />, value: 'config' },
  ];

  const handleMobileNav = (value) => {
    setTab(value);
    setMenuOpen(false);
  };

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex justify-between items-center mb-2 w-full">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center p-2 rounded-full bg-white/20 hover:bg-white/40 transition text-[#00b6fc] mr-2"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2">
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
          <button
            className="sm:hidden flex items-center justify-center p-3 rounded-xl text-white bg-gradient-to-r from-[#00b6fc] to-[#0096fd] shadow-lg focus:outline-none transition-all duration-200"
            style={{ minWidth: 48, minHeight: 48 }}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {menuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="sm:hidden mt-6 fixed inset-0 z-40 flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-[#0096fd] animate-fade-in-down shadow-2xl rounded-b-3xl border-b-4 border-blue-400 mobile-menu-hamburger">
          <div className="flex items-center justify-between px-5 pt-5 pb-2">
            <div className="flex items-center gap-2">
              <img src="/assets/PontoFino_Logo.png" alt="Logo" className="h-9 w-9 rounded-full shadow-lg " />
              <span className="text-lg font-extrabold text-white drop-shadow">PontoFino</span>
            </div>
            <button
              className="flex items-center justify-center p-2 rounded-full bg-white/20 hover:bg-white/40 transition"
              onClick={() => setMenuOpen(false)}
              aria-label="Fechar menu"
            >
              <X className="h-7 w-7 text-white" />
            </button>
          </div>
          <nav className="flex flex-col gap-2 px-6 py-4 flex-1">
            {menuItems.map((item, idx) => (
              <button
                key={item.value}
                onClick={() => handleMobileNav(item.value)}
                className="flex items-center gap-4 px-4 py-3 rounded-xl font-semibold text-lg text-white bg-white/10 hover:bg-white/20 shadow-md transition-all duration-150 backdrop-blur-md border border-white/10 mb-1 animate-fade-in"
                style={{ animationDelay: `${0.05 * idx + 0.1}s` }}
              >
                <span className="flex items-center justify-center bg-white/20 rounded-full p-2">
                  {item.icon}
                </span>
                <span className="drop-shadow-lg">{item.label}</span>
              </button>
            ))}
            <div className="flex flex-col gap-2 mt-6 animate-fade-in-up">
              {!loading && !user && (
                <>
                  <button
                    onClick={() => { setMenuOpen(false); navigate('/login'); }}
                    className="w-full px-4 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-[#00b6fc] via-[#00a4fd] to-[#0096fd] hover:from-blue-700 hover:to-blue-900 shadow-lg transition-all duration-200 text-lg"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); navigate('/register'); }}
                    className="w-full px-4 py-2 rounded-xl font-bold text-blue-700 border-2 border-blue-400 bg-white hover:bg-blue-50 shadow-lg transition-all duration-200 text-lg"
                  >
                    Registrar
                  </button>
                </>
              )}
              <div className="mt-2"><UserInfo /></div>
            </div>
          </nav>
          <div className="text-center text-xs text-white/70 pb-3 pt-2 animate-fade-in-up">© {new Date().getFullYear()} PontoFino</div>
        </div>
      )}
        {/* TabsList: estilo igual ao NavBar de Gestão de Orçamento */}
        <TabsList className="hidden sm:flex w-full flex-row gap-1 py-1 bg-gray-800/50 border border-gray-700 rounded-lg justify-between">
          {menuItems.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              data-value={item.value}
              className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00b6fc] data-[state=active]:to-[#0096fd] h-12 sm:h-auto text-xs sm:text-sm min-w-0"
            >
              {item.icon}
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden text-[10px]">{item.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </motion.div>
    </Tabs>
  );
}

export default SimuladorNavBar;
