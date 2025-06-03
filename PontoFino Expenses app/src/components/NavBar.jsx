import React from 'react';
import { motion } from 'framer-motion';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Plus, Target, Settings, Wallet } from 'lucide-react';


import { UserInfo } from './Auth';

function NavBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex justify-between items-center mb-2">
        <div />
        <UserInfo />
      </div>
      <TabsList className="grid w-full grid-cols-3 gap-1 py-1 sm:grid-cols-5 md:grid-cols-5 bg-gray-800/50 border border-gray-700 rounded-lg">
        <TabsTrigger value="dashboard" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 h-12 sm:h-auto text-xs sm:text-sm">
          <BarChart3 className="h-4 w-4 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Dashboard</span>
          <span className="sm:hidden text-[10px]">Painel</span>
        </TabsTrigger>
        <TabsTrigger value="transactions" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 h-12 sm:h-auto text-xs sm:text-sm">
          <Plus className="h-4 w-4 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Transações</span>
          <span className="sm:hidden text-[10px]">Nova</span>
        </TabsTrigger>
        <TabsTrigger value="history" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 h-12 sm:h-auto text-xs sm:text-sm">
          <Wallet className="h-4 w-4 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Histórico</span>
          <span className="sm:hidden text-[10px]">Lista</span>
        </TabsTrigger>
        <TabsTrigger value="goals" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 h-12 sm:h-auto text-xs sm:text-sm">
          <Target className="h-4 w-4 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Metas</span>
          <span className="sm:hidden text-[10px]">Metas</span>
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 h-12 sm:h-auto text-xs sm:text-sm">
          <Settings className="h-4 w-4 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Config</span>
          <span className="sm:hidden text-[10px]">Ajustes</span>
        </TabsTrigger>
      </TabsList>
    </motion.div>
  );
}

export default NavBar;
