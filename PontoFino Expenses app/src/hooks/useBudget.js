
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'budget-tracker-data';

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

export function useBudget() {
  const [data, setData] = useState({
    transactions: [],
    categories: defaultCategories,
    goals: [],
    monthlyBudget: 0
  });

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setData(prev => ({
          ...prev,
          ...parsed,
          categories: parsed.categories || defaultCategories
        }));
      } catch (error) {
        console.error('Error loading data:', error);
      }
    }
  }, []);

  const saveData = (newData) => {
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  };

  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };
    
    const newData = {
      ...data,
      transactions: [newTransaction, ...data.transactions]
    };
    saveData(newData);
  };

  const deleteTransaction = (id) => {
    const newData = {
      ...data,
      transactions: data.transactions.filter(t => t.id !== id)
    };
    saveData(newData);
  };

  const addGoal = (goal) => {
    const newGoal = {
      ...goal,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    const newData = {
      ...data,
      goals: [...data.goals, newGoal]
    };
    saveData(newData);
  };

  const updateGoal = (id, updates) => {
    const newData = {
      ...data,
      goals: data.goals.map(goal => 
        goal.id === id ? { ...goal, ...updates } : goal
      )
    };
    saveData(newData);
  };

  const deleteGoal = (id) => {
    const newData = {
      ...data,
      goals: data.goals.filter(g => g.id !== id)
    };
    saveData(newData);
  };

  const setMonthlyBudget = (budget) => {
    const newData = {
      ...data,
      monthlyBudget: budget
    };
    saveData(newData);
  };

  // Calculations
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthTransactions = data.transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const expensesByCategory = data.categories.map(category => {
    const categoryExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense' && t.category === category.id)
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      ...category,
      amount: categoryExpenses,
      percentage: totalExpenses > 0 ? (categoryExpenses / totalExpenses) * 100 : 0
    };
  }).filter(cat => cat.amount > 0);

  return {
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
    currentMonthTransactions
  };
}
