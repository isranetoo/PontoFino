import React from 'react'
import { useState } from 'react'
import { useSupabase } from '../../hooks/useSupabase'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Trash2, Edit3, Square, CheckSquare } from 'lucide-react'

/**
 * Lista de transações com integração Supabase
 * 
 * Funcionalidades:
 * - Exibe transações do usuário com dados relacionados
 * - Permite deletar transações com confirmação
 * - Formatação automática de valores e datas
 * - Ícones e cores baseados no tipo de transação
 * 
 * Como personalizar:
 * - Adicione novos campos nas colunas
 * - Modifique a formatação de valores/datas
 * - Adicione filtros ou ordenação
 */

interface TransactionsListProps {
  transactions: any[] // Usando any por simplicidade, mas pode tipar melhor
  showHeader?: boolean
  selectedTransactions?: Set<string>
  onSelectTransaction?: (transactionId: string) => void
  onTransactionDeleted?: () => void // Callback para atualizar lista após deletar
}

export function TransactionsList({ 
  transactions, 
  showHeader = true, 
  selectedTransactions = new Set(),
  onSelectTransaction,
  onTransactionDeleted 
}: TransactionsListProps) {
  const { deleteTransaction, loading } = useSupabase()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Função para deletar transação
  const handleDelete = async (transactionId: string, description: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a transação "${description}"?`)) {
      return
    }

    setDeletingId(transactionId)
    try {
      const result = await deleteTransaction(transactionId)
      if (result.error) {
        alert('Erro ao excluir transação: ' + result.error)
      } else {
        // Chamar callback para atualizar a lista
        onTransactionDeleted?.()
      }
    } catch (error) {
      console.error('Erro ao excluir transação:', error)
      alert('Erro ao excluir transação')
    } finally {
      setDeletingId(null)
    }
  }

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'income':
        return <ArrowUpRight className="w-5 h-5 text-green-600" />
      case 'expense':
        return <ArrowDownLeft className="w-5 h-5 text-red-600" />
      case 'transfer':
        return <ArrowLeftRight className="w-5 h-5 text-blue-600" />
    }
  }

  const getAmountColor = (amount: number) => {
    if (amount > 0) return 'text-green-600'
    if (amount < 0) return 'text-red-600'
    return 'text-blue-600'
  }

  const formatAmount = (amount: number) => {
    const abs = Math.abs(amount)
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
  }

  return (
    <div className="overflow-hidden">
      {showHeader && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 text-sm font-medium text-gray-700">
            {onSelectTransaction && <div className="w-8"></div>}
            <div>Descrição</div>
            <div>Categoria</div>
            <div>Conta</div>
            <div>Data</div>
            <div className="text-right">Valor</div>
            <div className="text-right">Ações</div>
          </div>
        </div>
      )}

      <div className="divide-y divide-gray-200">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
              {onSelectTransaction && (
                <div className="flex items-center">
                  <button
                    onClick={() => onSelectTransaction(transaction.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {selectedTransactions.has(transaction.id) ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                </div>
              </div>

              <div className="text-sm text-gray-600 md:text-base">
                {transaction.category?.name || 'Sem categoria'}
              </div>

              <div className="text-sm text-gray-600 md:text-base">
                {transaction.account?.name || 'Conta não encontrada'}
              </div>

              <div className="text-sm text-gray-600 md:text-base">
                {format(new Date(transaction.transaction_date), 'dd/MM/yyyy', { locale: ptBR })}
              </div>

              <div className={`text-right font-semibold ${getAmountColor(transaction.amount)}`}>
                {formatAmount(transaction.amount)}
              </div>

              <div className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleDelete(transaction.id, transaction.description)}
                    disabled={deletingId === transaction.id || loading}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Excluir transação"
                  >
                    {deletingId === transaction.id ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {transactions.length === 0 && (
        <div className="px-6 py-12 text-center text-gray-500">
          <div className="text-center">
            <ArrowUpRight className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-lg">Nenhuma transação encontrada</p>
            <p className="text-sm">Suas transações aparecerão aqui quando você começar a registrá-las</p>
          </div>
        </div>
      )}
    </div>
  )
}