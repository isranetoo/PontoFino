import React, { useState, useEffect } from 'react'
import { useDataContext } from '../../contexts/DataContext'
import { TransactionsList } from './TransactionsList'
import { TransactionForm } from './TransactionForm'
import { TransactionFilters } from './TransactionFilters'
import { BulkActions } from './BulkActions'
import { StatementImport } from './StatementImport'
import { AICopilotWidget } from '../AI/AICopilotWidget'
import { AIInsightCard } from '../AI/AIInsightCard'
import { useSupabase } from '../../hooks/useSupabase'
import { 
  Plus, 
  Upload, 
  Download, 
  Filter,
  X,
  CheckSquare,
  Square
} from 'lucide-react'

interface TransactionFilters {
  dateFrom?: string
  dateTo?: string
  category?: string
  type?: 'income' | 'expense' | 'transfer' | ''
  account?: string
  search?: string
}

export function TransactionsPage() {
  const { 
    getTransactions,
    loading
  } = useSupabase()
  
  const {
    transactions,
    accounts,
    categories,
    refreshTransactions,
    refreshAll,
    error
  } = useDataContext()

  // Estados principais
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([])
  
  // Estados de UI
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  
  // Estados de filtros e paginação
  const [filters, setFilters] = useState<TransactionFilters>({})
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  
  // Filtrar e ordenar transações quando dados ou filtros mudarem
  useEffect(() => {
    let filtered = [...transactions]
    
    // Apply filters
    if (filters.account) {
      filtered = filtered.filter(t => t.account_id === filters.account)
    }
    if (filters.category) {
      filtered = filtered.filter(t => t.category_id === filters.category)
    }
    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type)
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(t => t.transaction_date >= filters.dateFrom)
    }
    if (filters.dateTo) {
      filtered = filtered.filter(t => t.transaction_date <= filters.dateTo)
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchTerm) ||
        t.account?.name.toLowerCase().includes(searchTerm) ||
        t.category?.name.toLowerCase().includes(searchTerm)
      )
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.transaction_date).getTime()
        const dateB = new Date(b.transaction_date).getTime()
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
      } else {
        const amountA = Math.abs(a.amount)
        const amountB = Math.abs(b.amount)
        return sortOrder === 'desc' ? amountB - amountA : amountA - amountB
      }
    })
    
    setFilteredTransactions(filtered)
  }, [transactions, filters, sortBy, sortOrder])

  const handleTransactionSuccess = () => {
    setShowTransactionModal(false)
    refreshAll()
    setSelectedTransactions(new Set())
    setSelectAll(false)
  }

  const handleImportSuccess = () => {
    setShowImportModal(false)
    refreshAll()
  }

  const handleFilterChange = (newFilters: TransactionFilters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset para primeira página
  }

  const handleSelectTransaction = (transactionId: string) => {
    const newSelected = new Set(selectedTransactions)
    if (newSelected.has(transactionId)) {
      newSelected.delete(transactionId)
    } else {
      newSelected.add(transactionId)
    }
    setSelectedTransactions(newSelected)
    setSelectAll(newSelected.size === filteredTransactions.length)
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTransactions(new Set())
      setSelectAll(false)
    } else {
      const allIds = new Set(filteredTransactions.map(t => t.id))
      setSelectedTransactions(allIds)
      setSelectAll(true)
    }
  }

  const handleBulkActionComplete = () => {
    setSelectedTransactions(new Set())
    setSelectAll(false)
    refreshAll()
  }

  const exportTransactions = () => {
    const csvContent = [
      ['Data', 'Descrição', 'Categoria', 'Conta', 'Tipo', 'Valor'].join(','),
      ...filteredTransactions.map(t => [
        t.transaction_date,
        `"${t.description}"`,
        `"${t.category?.name || ''}"`,
        `"${t.account?.name || ''}"`,
        t.type,
        t.amount
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transacoes-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Paginação
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-1 tracking-tight">Transações</h1>
          <p className="text-lg text-gray-500">Gerencie todas as suas transações financeiras</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border font-semibold shadow-sm transition-all ${
              showFilters 
                ? 'bg-blue-50 border-blue-300 text-blue-800' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span>Filtros</span>
          </button>
          <button
            onClick={exportTransactions}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 text-white rounded-xl shadow-sm hover:bg-gray-800 font-semibold transition-all"
          >
            <Download className="w-5 h-5" />
            <span>Exportar</span>
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white rounded-xl shadow-sm hover:bg-green-800 font-semibold transition-all"
          >
            <Upload className="w-5 h-5" />
            <span>Importar</span>
          </button>
          <button
            onClick={() => setShowTransactionModal(true)}
            className="flex items-center gap-2 bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-sm hover:bg-blue-800 font-semibold transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Nova Transação</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 animate-fade-in">
          <TransactionFilters
            filters={filters}
            accounts={accounts}
            categories={categories}
            onFiltersChange={handleFilterChange}
            onSortChange={(field, order) => {
              setSortBy(field)
              setSortOrder(order)
            }}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
        </div>
      )}

      {/* Ações em lote */}
      {selectedTransactions.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 animate-fade-in">
          <BulkActions
            selectedTransactions={Array.from(selectedTransactions)}
            accounts={accounts}
            categories={categories}
            onComplete={handleBulkActionComplete}
          />
        </div>
      )}

      {/* Tabela de transações */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden animate-fade-in">
        {/* Header da tabela com seleção */}
        <div className="px-8 py-5 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex items-center gap-4">
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 text-base text-gray-700 hover:text-blue-800 font-semibold transition-all"
              >
                {selectAll ? (
                  <CheckSquare className="w-5 h-5" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
                <span>Selecionar todos</span>
              </button>
              {selectedTransactions.size > 0 && (
                <span className="text-base text-blue-700 font-semibold">
                  {selectedTransactions.size} transação(ões) selecionada(s)
                </span>
              )}
            </div>
            <div className="text-base text-gray-500 font-medium">
              {filteredTransactions.length} transação(ões) encontrada(s)
            </div>
          </div>
        </div>

        {/* Lista de transações */}
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Carregando transações...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-700 text-lg font-semibold">
            <p>Erro ao carregar transações: {error}</p>
          </div>
        ) : (
          <TransactionsList
            transactions={currentTransactions}
            selectedTransactions={selectedTransactions}
            onSelectTransaction={handleSelectTransaction}
            onTransactionDeleted={refreshAll}
            showHeader={false}
          />
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="px-8 py-5 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="text-base text-gray-500 font-medium">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredTransactions.length)} de {filteredTransactions.length} transações
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-base border border-gray-300 rounded-xl bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
                >
                  Anterior
                </button>
                <span className="text-base text-gray-500 font-medium">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-base border border-gray-300 rounded-xl bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Nova Transação */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-8 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Nova Transação</h2>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="p-8">
              <TransactionForm
                onSuccess={handleTransactionSuccess}
                onCancel={() => setShowTransactionModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Importação */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-8 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Importar Extrato</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="p-8">
              <StatementImport
                accounts={accounts}
                categories={categories}
                onSuccess={handleImportSuccess}
                onCancel={() => setShowImportModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AIInsightCard
          type="spending"
          title="Padrões de Gastos"
          description="Analise seus hábitos de consumo"
          data={{ transactions: filteredTransactions }}
          compact
        />
        <AIInsightCard
          type="general"
          title="Otimizações Sugeridas"
          description="Encontre oportunidades de economia"
          data={{ transactions: filteredTransactions }}
          compact
        />
      </div>

      {/* AI Copilot Widget */}
      <AICopilotWidget 
        page="transactions" 
        contextData={{ 
          transactions: filteredTransactions.slice(0, 30),
          filters,
          totalTransactions: filteredTransactions.length
        }} 
      />
    </div>
  )
}