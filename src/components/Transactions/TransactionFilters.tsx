import React from 'react'
import { Calendar, Search, Filter, SortAsc, SortDesc } from 'lucide-react'

interface TransactionFiltersProps {
  filters: {
    dateFrom?: string
    dateTo?: string
    category?: string
    type?: 'income' | 'expense' | 'transfer' | ''
    account?: string
    search?: string
  }
  accounts: any[]
  categories: any[]
  onFiltersChange: (filters: any) => void
  onSortChange: (field: 'date' | 'amount', order: 'asc' | 'desc') => void
  sortBy: 'date' | 'amount'
  sortOrder: 'asc' | 'desc'
}

export function TransactionFilters({
  filters,
  accounts,
  categories,
  onFiltersChange,
  onSortChange,
  sortBy,
  sortOrder
}: TransactionFiltersProps) {
  
  const handleFilterChange = (field: string, value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value || undefined
    })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = Object.values(filters).some(value => value && value !== '')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Limpar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Busca por texto */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar
          </label>
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Descrição, conta ou categoria..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo
          </label>
          <select
            value={filters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos os tipos</option>
            <option value="income">Receita</option>
            <option value="expense">Despesa</option>
            <option value="transfer">Transferência</option>
          </select>
        </div>

        {/* Conta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conta
          </label>
          <select
            value={filters.account || ''}
            onChange={(e) => handleFilterChange('account', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas as contas</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Data inicial */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data inicial
          </label>
          <div className="relative">
            <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Data final */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data final
          </label>
          <div className="relative">
            <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoria
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas as categorias</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.type === 'income' ? 'Receita' : category.type === 'expense' ? 'Despesa' : 'Transferência'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ordenação */}
      <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
        <span className="text-sm font-medium text-gray-700">Ordenar por:</span>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSortChange('date', sortBy === 'date' && sortOrder === 'desc' ? 'asc' : 'desc')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm transition-colors ${
              sortBy === 'date' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>Data</span>
            {sortBy === 'date' && (
              sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />
            )}
          </button>
          
          <button
            onClick={() => onSortChange('amount', sortBy === 'amount' && sortOrder === 'desc' ? 'asc' : 'desc')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm transition-colors ${
              sortBy === 'amount' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>Valor</span>
            {sortBy === 'amount' && (
              sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}