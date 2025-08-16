import { useSupabase } from '../../hooks/useSupabase';

interface TransactionsListProps {
  transactions: any[];
  showHeader?: boolean;
  selectedTransactions?: Set<string>;
  onSelectTransaction?: (transactionId: string) => void;
  onTransactionDeleted?: () => void;
}

export function TransactionsList({
  transactions,
  showHeader = true,
  selectedTransactions = new Set(),
  onSelectTransaction,
  onTransactionDeleted,
}: TransactionsListProps) {
  const { deleteTransaction } = useSupabase();

  const handleDelete = async (transactionId: string, description: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a transação "${description}"?`)) {
      return;
    }

    try {
      await deleteTransaction(transactionId);
      onTransactionDeleted?.();
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
          <div
            key={transaction.id}
            className="px-6 py-4 hover:bg-gray-50 transition-colors grid grid-cols-1 md:grid-cols-6 gap-4 items-center"
          >
            {onSelectTransaction && (
              <input
                type="checkbox"
                checked={selectedTransactions.has(transaction.id)}
                onChange={() => onSelectTransaction?.(transaction.id)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            )}

            <div className="text-sm text-gray-600 md:text-base">
              {transaction.description}
            </div>

            <div className="text-sm text-gray-600 md:text-base">
              {transaction.category?.name || 'Sem categoria'}
            </div>

            <div className="text-sm text-gray-600 md:text-base">
              {transaction.account?.name || 'Conta não encontrada'}
            </div>

            <div className="text-sm text-gray-600 md:text-base">
              {transaction.transaction_date}
            </div>

            <div className="text-sm text-gray-600 md:text-base text-right">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(transaction.amount)}
            </div>

            <div className="text-sm text-gray-600 md:text-base text-right space-x-2">
              <button
                onClick={() => handleDelete(transaction.id, transaction.description)}
                className="text-red-600 hover:text-red-800"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {transactions.length === 0 && (
        <div className="px-6 py-12 text-center text-gray-500">
          <p className="text-lg">Nenhuma transação encontrada</p>
          <p className="text-sm">Suas transações aparecerão aqui quando você começar a registrá-las</p>
        </div>
      )}
    </div>
  );
}