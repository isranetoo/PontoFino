import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, AlertTriangle, Plus, X } from 'lucide-react';
import { MetricsCard } from './MetricsCard';
import { TransactionForm } from '../Transactions/TransactionForm';
import { AICopilotWidget } from '../AI/AICopilotWidget';
import { AIInsightCard } from '../AI/AIInsightCard';
import { useDataContext } from '../../contexts/DataContext';
import { useAuth } from '../../hooks/useAuth';
import { usePaywall } from '../../hooks/usePaywall';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    accounts,
    transactions,
    budgets,
    goals,
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    budgetAlerts,
    loading,
    error
  } = useDataContext();
  
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const { executeWithPaywall } = usePaywall();

  // Generate AI insights when data changes
  useEffect(() => {
    // Data will be automatically updated by DataContext
  }, [accounts, transactions, budgets]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleTransactionSuccess = () => {
    setShowTransactionModal(false);
    // Data will be automatically refreshed by the DataContext
  };
  
  // Calculate active goals
  const activeGoals = goals.filter(goal => !goal.is_completed).length;
  
  // Get recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Faça login para ver seu dashboard</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen  text-white flex flex-col py-10 px-2 md:px-8 lg:px-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-gray-600 text-base">Visão geral das suas finanças</p>
        </div>
        <button
          onClick={() => setShowTransactionModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg shadow transition-colors flex items-center gap-2 font-semibold"
        >
          <Plus className="w-5 h-5" /> Nova Transação
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600">Erro ao carregar dados: {error}</p>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid text-gray-900 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricsCard
          title="Saldo Total"
          value={formatCurrency(totalBalance)}
          icon={DollarSign}
          color="green"
        />
        <MetricsCard
          title="Receitas do Mês"
          value={formatCurrency(monthlyIncome)}
          icon={TrendingUp}
          color="blue"
        />
        <MetricsCard
          title="Despesas do Mês"
          value={formatCurrency(monthlyExpenses)}
          icon={TrendingDown}
          color="red"
        />
        <MetricsCard
          title="Metas Ativas"
          value={activeGoals.toString()}
          icon={Target}
          color="purple"
        />
      </div>

      {/* Budget Alerts */}
      {budgetAlerts > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">Alertas de Orçamento</h3>
          </div>
          <p className="text-yellow-700 mt-1">
            Você tem {budgetAlerts} orçamento(s) com mais de 80% do limite utilizado.
          </p>
        </div>
      )}

      {/* AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AIInsightCard
          type="spending"
          title="Análise de Gastos"
          description="Identifique padrões e oportunidades de economia"
          data={{ transactions, monthlyExpenses }}
        />
        <AIInsightCard
          type="budget"
          title="Otimização de Orçamentos"
          description="Melhore o controle dos seus gastos"
          data={{ budgets, budgetAlerts }}
        />
        <AIInsightCard
          type="fire"
          title="Estratégia FIRE"
          description="Acelere sua independência financeira"
          data={{ totalBalance, monthlyIncome, monthlyExpenses }}
        />
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-10">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Transações Recentes</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="w-32 h-4 bg-gray-200 rounded mb-1"></div>
                      <div className="w-24 h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="w-20 h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'income' ? 'bg-green-100' :
                      transaction.type === 'expense' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      ) : transaction.type === 'expense' ? (
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      ) : (
                        <DollarSign className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {transaction.account.name} • {formatDate(transaction.transaction_date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' :
                      transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(Number(transaction.amount))}
                    </p>
                    {transaction.category && (
                      <p className="text-sm text-gray-500">{transaction.category.name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhuma transação encontrada</p>
              <p className="text-sm text-gray-400">Adicione sua primeira transação para começar</p>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Nova Transação</h2>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <TransactionForm
                onSuccess={handleTransactionSuccess}
                onCancel={() => setShowTransactionModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* AI Copilot Widget */}
      <AICopilotWidget 
        page="dashboard" 
        contextData={{ 
          accounts, 
          transactions: transactions.slice(0, 20), 
          budgets, 
          totalBalance, 
          monthlyIncome, 
          monthlyExpenses 
        }} 
      />
    </div>
  );
};

export default Dashboard;