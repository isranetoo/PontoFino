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
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden animate-fade-in">
      {showHeader && (
        <div className="px-8 py-5 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 text-base font-semibold text-gray-900 tracking-tight">
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

      <div className="divide-y divide-gray-100">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="px-8 py-5 group grid grid-cols-1 md:grid-cols-6 gap-6 items-center bg-white hover:bg-blue-50 transition-colors duration-150"
          >
            {onSelectTransaction && (
              <input
                type="checkbox"
                checked={selectedTransactions.has(transaction.id)}
                onChange={() => onSelectTransaction?.(transaction.id)}
                className="w-5 h-5 text-blue-700 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 transition-all"
              />
            )}

            <div className="text-base text-gray-900 font-medium truncate">
              {transaction.description}
            </div>

            <div className="text-base text-gray-700 font-semibold">
              {transaction.category?.name || <span className="italic text-gray-400">Sem categoria</span>}
            </div>

            <div className="text-base text-gray-700 font-semibold">
              {transaction.account?.name || <span className="italic text-gray-400">Conta não encontrada</span>}
            </div>

            <div className="text-base text-gray-600">
              {transaction.transaction_date}
            </div>

            <div className="text-base text-right font-bold text-gray-900">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(transaction.amount)}
            </div>

            <div className="text-base text-right">
              <button
                onClick={() => handleDelete(transaction.id, transaction.description)}
                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg font-semibold shadow-sm hover:bg-red-200 hover:text-red-900 transition-all"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {transactions.length === 0 && (
        <div className="px-8 py-16 text-center text-gray-400">
          <p className="text-xl font-semibold">Nenhuma transação encontrada</p>
          <p className="text-base">Suas transações aparecerão aqui quando você começar a registrá-las</p>
        </div>
      )}
    </div>
  );
}