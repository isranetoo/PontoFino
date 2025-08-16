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
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Nova Transação</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
        <input
          type="number"
          value={formData.amount}
          onChange={(e) => handleInputChange('amount', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Conta</label>
        <select
          value={formData.account_id}
          onChange={(e) => handleInputChange('account_id', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
        <select
          value={formData.category_id}
          onChange={(e) => handleInputChange('category_id', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
        <input
          type="date"
          value={formData.transaction_date}
          onChange={(e) => handleInputChange('transaction_date', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {error && <p className="text-red-500 text-sm">Erro: {error}</p>}

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Salvar
        </button>
      </div>
    </form>
  );
}