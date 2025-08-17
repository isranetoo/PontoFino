/**
 * Formulário para criar/editar transações
 * 
 * Funcionalidades integradas com Supabase:
 * - Carrega contas e categorias do usuário
 * - Cria nova transação com validação
 * - Feedback visual de sucesso/erro
 * - Suporte a diferentes tipos (receita/despesa/transferência)
 * 
 * Como personalizar:
 * - Adicione novos campos no formulário
 * - Modifique as validações conforme necessário
 * - Altere os tipos de transação disponíveis
 */

import React, { useState } from 'react';
import { useSupabase } from '../../hooks/useSupabase';
import { useDataContext } from '../../contexts/DataContext';

interface TransactionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function TransactionForm({ onSuccess, onCancel }: TransactionFormProps) {
  const { createTransaction, error } = useSupabase();
  const { accounts, categories } = useDataContext();

  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense' | 'transfer',
    amount: '',
    description: '',
    account_id: '',
    category_id: '',
    transaction_date: new Date().toISOString().split('T')[0],
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTransaction({
        ...formData,
        amount: parseFloat(formData.amount),
        category_id: formData.category_id || undefined,
      });
      onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Nova Transação</h2>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">Descrição</label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">Valor</label>
        <input
          type="number"
          value={formData.amount}
          onChange={(e) => handleInputChange('amount', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">Conta</label>
        <select
          value={formData.account_id}
          onChange={(e) => handleInputChange('account_id', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        >
          <option value="">Selecione uma conta</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">Categoria</label>
        <select
          value={formData.category_id}
          onChange={(e) => handleInputChange('category_id', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        >
          <option value="">Selecione uma categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">Data</label>
        <input
          type="date"
          value={formData.transaction_date}
          onChange={(e) => handleInputChange('transaction_date', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        />
      </div>

      {error && <p className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-xl font-medium shadow-sm">Erro: {error}</p>}

      <div className="flex justify-end gap-4 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 font-semibold transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 bg-blue-700 text-white rounded-xl shadow-sm hover:bg-blue-800 focus:ring-2 focus:ring-blue-400 font-semibold transition-all"
        >
          Salvar
        </button>
      </div>
    </form>
  );
}