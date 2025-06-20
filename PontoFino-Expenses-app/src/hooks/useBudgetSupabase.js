import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from './useAuth';

const defaultCategories = [
  { id: 'food', name: 'Alimentação', color: '#ff6b6b', icon: '🍽️' },
  { id: 'transport', name: 'Transporte', color: '#4ecdc4', icon: '🚗' },
  { id: 'entertainment', name: 'Entretenimento', color: '#45b7d1', icon: '🎬' },
  { id: 'shopping', name: 'Compras', color: '#f9ca24', icon: '🛍️' },
  { id: 'health', name: 'Saúde', color: '#6c5ce7', icon: '🏥' },
  { id: 'education', name: 'Educação', color: '#a29bfe', icon: '📚' },
  { id: 'bills', name: 'Contas', color: '#fd79a8', icon: '📄' },
  { id: 'other', name: 'Outros', color: '#636e72', icon: '📦' }
];

export function useBudgetSupabase() {
  const { user } = useAuth();
  const [data, setData] = useState({
    transactions: [],
    categories: defaultCategories,
    goals: [],
    investments: [],
    monthlyBudget: 0
  });
  const [loading, setLoading] = useState(false);

  // Buscar dados do usuário ao logar
  useEffect(() => {
    if (user) {
      fetchUserData(user.id);
    } else {
      // Limpar dados ao deslogar
      setData({
        transactions: [],
        categories: defaultCategories,
        goals: [],
        monthlyBudget: 0
      });
    }
    // eslint-disable-next-line
  }, [user]);

  async function fetchUserData(userId) {
    setLoading(true);
    // Buscar transações
    const { data: transactions = [] } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    // Buscar metas
    const { data: goals = [] } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    // Converter snake_case para camelCase nas metas
    const goalsCamel = (goals || []).map(g => ({
      ...g,
      targetAmount: g.target_amount,
      currentAmount: g.current_amount
    }));
    // Buscar investimentos
    const { data: investments = [] } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    // Buscar orçamento
    const { data: budgetData = [] } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setData({
      transactions: transactions || [],
      categories: defaultCategories,
      goals: goalsCamel,
      investments: investments || [],
      monthlyBudget: budgetData && budgetData[0] ? budgetData[0].amount : 0
    });
    setLoading(false);
  }
  // Adicionar investimento
  const addInvestment = async (investment) => {
    if (!user) return;
    const newInvestment = {
      ...investment,
      user_id: user.id,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      date: investment.date || new Date().toISOString()
    };
    const { error } = await supabase.from('investments').insert([newInvestment]);
    if (error) {
      console.error('Erro ao adicionar investimento:', error.message);
    }
    fetchUserData(user.id);
  };

  // Remover investimento
  const deleteInvestment = async (id) => {
    if (!user) return;
    await supabase.from('investments').delete().eq('id', id).eq('user_id', user.id);
    fetchUserData(user.id);
  };

  // Adicionar transação
  const addTransaction = async (transaction) => {
    if (!user) return;
    // Use crypto.randomUUID() for a valid UUID (supported in modern browsers)
    const newTransaction = {
      ...transaction,
      user_id: user.id,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      date: new Date().toISOString()
    };
    await supabase.from('transactions').insert([newTransaction]);
    fetchUserData(user.id);
  };

  // Remover transação
  const deleteTransaction = async (id) => {
    if (!user) return;
    await supabase.from('transactions').delete().eq('id', id).eq('user_id', user.id);
    fetchUserData(user.id);
  };

  // Adicionar meta
  const addGoal = async (goal) => {
    if (!user) return;
    const newGoal = {
      name: goal.name,
      user_id: user.id,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      target_amount: goal.targetAmount,
      current_amount: goal.currentAmount,
      created_at: new Date().toISOString()
    };
    const { error } = await supabase.from('goals').insert([newGoal]);
    if (error) {
      // Opcional: exibir erro no console ou toast
      console.error('Erro ao adicionar meta:', error.message);
    }
    fetchUserData(user.id);
  };

  // Atualizar meta
  const updateGoal = async (id, updates) => {
    if (!user) return;
    // Converta para snake_case se necessário
    const updatesSnake = {
      ...updates,
      target_amount: updates.targetAmount,
      current_amount: updates.currentAmount
    };
    delete updatesSnake.targetAmount;
    delete updatesSnake.currentAmount;
    await supabase.from('goals').update(updatesSnake).eq('id', id).eq('user_id', user.id);
    fetchUserData(user.id);
  };

  // Remover meta
  const deleteGoal = async (id) => {
    if (!user) return;
    await supabase.from('goals').delete().eq('id', id).eq('user_id', user.id);
    fetchUserData(user.id);
  };

  // Definir orçamento mensal
  const setMonthlyBudget = async (budget) => {
    if (!user) return;
    // Remove orçamento anterior
    await supabase.from('budgets').delete().eq('user_id', user.id);
    // Insere novo orçamento
    await supabase.from('budgets').insert([{ user_id: user.id, amount: budget, created_at: new Date().toISOString() }]);
    fetchUserData(user.id);
  };

  // Calculations
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthTransactions = data.transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;
  const expensesByCategory = data.categories.map(category => {
    const amount = currentMonthTransactions
      .filter(t => t.category === category.id && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { ...category, amount };
  }).filter(cat => cat.amount > 0);

  return {
    data,
    addTransaction,
    deleteTransaction,
    addGoal,
    updateGoal,
    deleteGoal,
    addInvestment,
    deleteInvestment,
    setMonthlyBudget,
    totalIncome,
    totalExpenses,
    balance,
    expensesByCategory,
    currentMonthTransactions,
    loading
  };
}
