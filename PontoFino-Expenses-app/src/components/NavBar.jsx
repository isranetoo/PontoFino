import React from 'react';
import { motion } from 'framer-motion';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Plus, Target, Settings, Wallet } from 'lucide-react';


import { UserInfo } from './Auth';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

function NavBar() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex justify-between items-center mb-2 w-full">
        <div />
        <div className="flex items-center gap-2">
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
      </div>
      <TabsList className="grid w-full grid-cols-3 gap-1 py-1 sm:grid-cols-6 md:grid-cols-6 bg-gray-800/50 border border-gray-700 rounded-lg">
        <TabsTrigger value="dashboard" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00b6fc] data-[state=active]:to-[#0096fd] h-12 sm:h-auto text-xs sm:text-sm min-w-0">
          <BarChart3 className="h-4 w-4 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Dashboard</span>
          <span className="sm:hidden text-[10px]">Painel</span>
        </TabsTrigger>
        <TabsTrigger value="transactions" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00b6fc] data-[state=active]:to-[#0096fd] h-12 sm:h-auto text-xs sm:text-sm min-w-0">
          <Plus className="h-4 w-4 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Transações</span>
          <span className="sm:hidden text-[10px]">Nova</span>
        </TabsTrigger>
        <TabsTrigger value="history" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00b6fc] data-[state=active]:to-[#0096fd] h-12 sm:h-auto text-xs sm:text-sm min-w-0">
          <Wallet className="h-4 w-4 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Histórico</span>
          <span className="sm:hidden text-[10px]">Lista</span>
        </TabsTrigger>
        <TabsTrigger value="goals" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00b6fc] data-[state=active]:to-[#0096fd] h-12 sm:h-auto text-xs sm:text-sm min-w-0">
          <Target className="h-4 w-4 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Metas</span>
          <span className="sm:hidden text-[10px]">Metas</span>
        </TabsTrigger>
        <TabsTrigger value="investments" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00b6fc] data-[state=active]:to-[#0096fd] h-12 sm:h-auto text-xs sm:text-sm min-w-0">
          <BarChart3 className="h-4 w-4 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Investimentos</span>
          <span className="sm:hidden text-[10px]">Investir</span>
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00b6fc] data-[state=active]:to-[#0096fd] h-12 sm:h-auto text-xs sm:text-sm min-w-0">
          <Settings className="h-4 w-4 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Config</span>
          <span className="sm:hidden text-[10px]">Ajustes</span>
        </TabsTrigger>
      </TabsList>
    </motion.div>
  );
}

export default NavBar;
