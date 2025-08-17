import React, { useState } from 'react'
import { useSupabase } from '../../hooks/useSupabase'
import { Edit3, Trash2, Tag, CreditCard, AlertCircle, Check } from 'lucide-react'

interface BulkActionsProps {
  selectedTransactions: string[]
  accounts: any[]
  categories: any[]
  onComplete: () => void
}

export function BulkActions({ 
  selectedTransactions, 
  accounts, 
  categories, 
  onComplete 
}: BulkActionsProps) {
  const { updateTransaction, deleteTransaction } = useSupabase()
  const [action, setAction] = useState<'category' | 'account' | 'delete' | null>(null)
  const [selectedValue, setSelectedValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleBulkUpdate = async () => {
    if (!action || (!selectedValue && action !== 'delete')) return

    setLoading(true)
    setError(null)

    try {
      if (action === 'delete') {
        // Confirmar exclusão
        if (!window.confirm(`Tem certeza que deseja excluir ${selectedTransactions.length} transação(ões)?`)) {
          setLoading(false)
          return
        }

        // Deletar todas as transações selecionadas
        await Promise.all(
          selectedTransactions.map(id => deleteTransaction(id))
        )
      } else {
        // Atualizar categoria ou conta
        const updateData = action === 'category' 
          ? { category_id: selectedValue }
          : { account_id: selectedValue }

        await Promise.all(
          selectedTransactions.map(id => updateTransaction(id, updateData))
        )
      }

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setAction(null)
        setSelectedValue('')
        onComplete()
      }, 2000)

    } catch (err: any) {
      setError(err.message || 'Erro ao executar ação em lote')
    } finally {
      setLoading(false)
    }
  }

  const cancel = () => {
    setAction(null)
    setSelectedValue('')
    setError(null)
  }

  if (success) {
    return (
      <div className="flex items-center justify-center space-x-2 bg-green-100 border border-green-300 rounded-xl py-4 px-6 shadow-sm animate-fade-in">
        <Check className="w-6 h-6 text-green-700" />
        <span className="font-semibold text-green-800">Ação executada com sucesso!</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-white border border-gray-200 rounded-2xl shadow-lg p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900 text-lg tracking-tight">
          Ações em lote <span className="text-blue-700">({selectedTransactions.length} selecionadas)</span>
        </h3>
      </div>

      {!action ? (
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setAction('category')}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white rounded-xl shadow-sm hover:bg-blue-800 focus:ring-2 focus:ring-blue-400 transition-all font-medium"
          >
            <Tag className="w-5 h-5" />
            <span>Alterar Categoria</span>
          </button>

          <button
            onClick={() => setAction('account')}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white rounded-xl shadow-sm hover:bg-green-800 focus:ring-2 focus:ring-green-400 transition-all font-medium"
          >
            <CreditCard className="w-5 h-5" />
            <span>Alterar Conta</span>
          </button>

          <button
            onClick={() => setAction('delete')}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-700 text-white rounded-xl shadow-sm hover:bg-red-800 focus:ring-2 focus:ring-red-400 transition-all font-medium"
          >
            <Trash2 className="w-5 h-5" />
            <span>Excluir</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {action === 'category' && (
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Nova categoria para <span className="text-blue-700 font-bold">{selectedTransactions.length}</span> transação(ões):
              </label>
              <select
                value={selectedValue}
                onChange={(e) => setSelectedValue(e.target.value)}
                className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.type === 'income' ? 'Receita' : category.type === 'expense' ? 'Despesa' : 'Transferência'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {action === 'account' && (
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Nova conta para <span className="text-blue-700 font-bold">{selectedTransactions.length}</span> transação(ões):
              </label>
              <select
                value={selectedValue}
                onChange={(e) => setSelectedValue(e.target.value)}
                className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 text-gray-900"
              >
                <option value="">Selecione uma conta</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {action === 'delete' && (
            <div className="bg-red-100 border border-red-300 rounded-xl p-5 flex items-center gap-3 shadow-sm">
              <AlertCircle className="w-6 h-6 text-red-700" />
              <div>
                <span className="font-semibold text-red-800">Atenção!</span>
                <p className="text-red-700 mt-1 text-sm">
                  Você está prestes a excluir <span className="font-bold">{selectedTransactions.length}</span> transação(ões).<br />
                  <span className="font-medium">Esta ação não pode ser desfeita.</span>
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-xl font-medium shadow-sm">
              {error}
            </div>
          )}

          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={handleBulkUpdate}
              disabled={loading || (!selectedValue && action !== 'delete')}
              className="px-5 py-2.5 bg-blue-700 text-white rounded-xl shadow-sm hover:bg-blue-800 focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
            >
              {loading ? 'Executando...' : 'Confirmar'}
            </button>

            <button
              onClick={cancel}
              disabled={loading}
              className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 font-semibold transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}