import React from 'react';
import { Calendar, Search } from 'lucide-react';

interface TransactionFiltersProps {
  filters: {
    dateFrom?: string;
    dateTo?: string;
    category?: string;
    type?: 'income' | 'expense' | 'transfer' | '';
    account?: string;
    search?: string;
  };
  accounts: any[];
  categories: any[];
  onFiltersChange: (filters: any) => void;
  onSortChange: (field: 'date' | 'amount', order: 'asc' | 'desc') => void;
  sortBy: 'date' | 'amount';
  sortOrder: 'asc' | 'desc';
}

export function TransactionFilters({
  filters,
  accounts,
  categories,
  onFiltersChange,
  onSortChange,
  sortBy,
  sortOrder,
}: TransactionFiltersProps) {
  const handleFilterChange = (field: string, value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value || undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value && value !== ''
  );

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Filtros</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-700 font-semibold hover:underline hover:text-blue-900 transition-colors"
          >
            Limpar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Busca por texto */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-semibold text-gray-800 mb-2">Buscar</label>
          <div className="relative">
            <Search className="w-5 h-5 text-blue-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Descrição, conta ou categoria..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Tipo</label>
          <select
            value={filters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          >
            <option value="">Todos</option>
            <option value="income">Receita</option>
            <option value="expense">Despesa</option>
            <option value="transfer">Transferência</option>
          </select>
        </div>

        {/* Conta */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Conta</label>
          <select
            value={filters.account || ''}
            onChange={(e) => handleFilterChange('account', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          >
            <option value="">Todas</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Data inicial */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Data inicial</label>
          <div className="relative">
            <Calendar className="w-5 h-5 text-blue-400 absolute left-3 top-3" />
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>
        </div>

        {/* Data final */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Data final</label>
          <div className="relative">
            <Calendar className="w-5 h-5 text-blue-400 absolute left-3 top-3" />
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>
        </div>
      </div>
    </div>
  );
}