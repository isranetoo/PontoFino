import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/toaster';
import { useBudgetSupabase } from '@/hooks/useBudgetSupabase';
import Dashboard from '@/components/Gestão de Orçamento/Dashboard';
import TransactionForm from '@/components/Gestão de Orçamento/TransactionForm';
import TransactionList from '@/components/Gestão de Orçamento/TransactionList';
import GoalsManager from '@/components/Gestão de Orçamento/GoalsManager';
import BudgetSettings from '@/components/Gestão de Orçamento/BudgetSettings';
import Investments from '@/components/Gestão de Orçamento/Investments';
import { BarChart3, Plus, Target, Settings, Wallet } from 'lucide-react';
import NavBar from '@/components/Gestão de Orçamento/NavBar';
import Footer from '@/components/Footer';


function App() {
  const {
    data,
    addTransaction,
    deleteTransaction,
    addGoal,
    updateGoal,
    deleteGoal,
    setMonthlyBudget,
    totalIncome,
    totalExpenses,
    balance,
    expensesByCategory,
    currentMonthTransactions,
    loading
  } = useBudgetSupabase();

  const [tab, setTab] = useState('dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-[#0096fd]">
      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 flex-1 w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="flex items-center justify-center gap-3 text-3xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-[#00b6fc] via-[#00a4fd] to-[#0096fd] bg-clip-text text-transparent mb-2 sm:mb-4">
            <img src="/assets/PontoFino_Logo.png" alt="Logo" className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16" />
            PontoFino
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto px-2">
            Controle suas finanças de forma inteligente e alcance seus objetivos financeiros
          </p>
        </motion.div>

        <Tabs value={tab} onValueChange={setTab} className="space-y-4 sm:space-y-6">
          <NavBar tab={tab} setTab={setTab} />

          <TabsContent value="dashboard" className="space-y-4 sm:space-y-6">
            <Dashboard
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              balance={balance}
              expensesByCategory={expensesByCategory}
              currentMonthTransactions={currentMonthTransactions}
              goals={data.goals}
              monthlyBudget={data.monthlyBudget}
              investments={data.investments}
            />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <TransactionForm
                onAddTransaction={addTransaction}
                categories={data.categories}
              />
              <TransactionList
                transactions={currentMonthTransactions}
                categories={data.categories}
                onDeleteTransaction={deleteTransaction}
                isRecentList={true}
              />
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 sm:space-y-6">
            <TransactionList
              transactions={data.transactions}
              categories={data.categories}
              onDeleteTransaction={deleteTransaction}
              isRecentList={false}
            />
          </TabsContent>

          <TabsContent value="goals" className="space-y-4 sm:space-y-6">
            <GoalsManager
              goals={data.goals}
              onAddGoal={addGoal}
              onUpdateGoal={updateGoal}
              onDeleteGoal={deleteGoal}
            />
          </TabsContent>

          <TabsContent value="investments" className="space-y-4 sm:space-y-6">
            <Investments />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 sm:space-y-6">
            <BudgetSettings
              monthlyBudget={data.monthlyBudget}
              onSetMonthlyBudget={setMonthlyBudget}
            />
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
      <Footer />
    </div>
  );
}

export default App;