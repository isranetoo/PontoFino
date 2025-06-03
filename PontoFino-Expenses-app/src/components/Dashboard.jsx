
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { TrendingUp, TrendingDown, DollarSign, Target, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const investmentTypes = [
  { id: 'cdi', name: 'CDI' },
  { id: 'cdb', name: 'CDB' },
  { id: 'renda_variavel', name: 'Renda Variável' },
  { id: 'fundo', name: 'Fundos de Investimento' },
  { id: 'crypto', name: 'Criptomoeda' },
  { id: 'dolar', name: 'Em Dólar' },
  { id: 'tesouro', name: 'Tesouro Direto' },
  { id: 'outro', name: 'Outro' },
];

const Dashboard = ({ 
  totalIncome, 
  totalExpenses, 
  balance, 
  expensesByCategory, 
  currentMonthTransactions,
  goals,
  monthlyBudget,
  investments = []
}) => {
  const budgetUsed = monthlyBudget > 0 ? (totalExpenses / monthlyBudget) * 100 : 0;
  
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date;
  }).reverse();

  const dailyData = last7Days.map(date => {
    const dayTransactions = currentMonthTransactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.toDateString() === date.toDateString();
    });

    const income = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      date: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
      receitas: income,
      despesas: expenses
    };
  });


  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'];

  // Calculate total expenses for percentage calculation
  const totalExpensesForPie = expensesByCategory.reduce((sum, cat) => sum + cat.amount, 0);
  const expensesByCategoryWithPercent = expensesByCategory.map(cat => ({
    ...cat,
    percentage: totalExpensesForPie > 0 ? (cat.amount / totalExpensesForPie) * 100 : 0
  }));

  return (
    <div className="space-y-6">
      {/* Investimentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="glassmorphism card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Investimentos</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              {(!investments || investments.length === 0) ? (
                <div className="text-gray-500 text-center">Nenhum investimento cadastrado.</div>
              ) : (
                <div className="text-2xl font-bold text-blue-400">
                  R$ {investments.reduce((sum, inv) => sum + Number(inv.value), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1">Total investido</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glassmorphism card-hover neon-glow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-400 mt-1">Este mês</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glassmorphism card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-400 mt-1">Este mês</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glassmorphism card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Saldo</CardTitle>
              <DollarSign className={`h-4 w-4 ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-400 mt-1">Diferença</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glassmorphism card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Orçamento</CardTitle>
              <Target className={`h-4 w-4 ${budgetUsed > 100 ? 'text-red-400' : budgetUsed > 80 ? 'text-yellow-400' : 'text-green-400'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${budgetUsed > 100 ? 'text-red-400' : budgetUsed > 80 ? 'text-yellow-400' : 'text-green-400'}`}>
                {budgetUsed.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-400 mt-1">Usado este mês</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glassmorphism card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-200">
                <PieChartIcon className="h-5 w-5" />
                Despesas por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expensesByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expensesByCategoryWithPercent}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage ? percentage.toFixed(1) : '0.0'}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {expensesByCategoryWithPercent.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                      labelStyle={{ color: '#000' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400">
                  Nenhuma despesa registrada
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glassmorphism card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-200">
                <BarChart3 className="h-5 w-5" />
                Últimos 7 Dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
                    labelStyle={{ color: '#000' }}
                  />
                  <Legend />
                  <Bar dataKey="receitas" fill="#10B981" name="Receitas" />
                  <Bar dataKey="despesas" fill="#EF4444" name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Goals Progress */}
      {goals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="glassmorphism card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-200">
                <Target className="h-5 w-5" />
                Progresso das Metas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {goals.slice(0, 3).map((goal) => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100;
                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-200">{goal.name}</span>
                        <span className="text-sm text-gray-400">
                          R$ {goal.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / 
                          R$ {goal.targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="text-right text-xs text-gray-400">
                        {progress.toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
