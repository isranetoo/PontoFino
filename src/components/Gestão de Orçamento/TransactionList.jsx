import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, TrendingUp, TrendingDown, Calendar, History } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const TransactionList = ({ transactions, categories, onDeleteTransaction, isRecentList = true }) => {
  const { toast } = useToast();

  const handleDelete = (id, description) => {
    onDeleteTransaction(id);
    toast({
      title: "Transação removida",
      description: `"${description}" foi removida com sucesso.`
    });
  };

  const getCategoryInfo = (categoryId) => {
    if (categoryId === 'income') {
      return { name: 'Receita', icon: '💰', color: '#10B981' };
    }
    return categories.find(cat => cat.id === categoryId) || { name: 'Desconhecido', icon: '❓', color: '#636e72' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Paginação: 3 por página para lista recente, 6 por página para histórico
  const ITEMS_PER_PAGE = isRecentList ? 3 : 6;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(transactions.length / ITEMS_PER_PAGE));

  let transactionsToDisplay = transactions.slice(0, ITEMS_PER_PAGE);
  if (!isRecentList) {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    transactionsToDisplay = transactions.slice(start, end);
  }

  return (
    <Card className="glassmorphism card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-200 text-lg sm:text-xl">
          {isRecentList ? <Calendar className="h-5 w-5" /> : <History className="h-5 w-5" />}
          {isRecentList ? "Transações Recentes" : "Histórico de Transações"}
        </CardTitle>
      </CardHeader>
      <CardContent className={!isRecentList ? "max-h-[600px] overflow-y-auto" : ""}>
        <div className="space-y-2 sm:space-y-3">
          <AnimatePresence>
            {transactionsToDisplay.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                {isRecentList ? <Calendar className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" /> : <History className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />}
                <p className="text-sm sm:text-base">Nenhuma transação encontrada</p>
                {isRecentList && <p className="text-xs sm:text-sm">Adicione sua primeira transação</p>}
              </div>
            ) : (
              transactionsToDisplay.map((transaction, index) => {
                const categoryInfo = getCategoryInfo(transaction.category);
                return (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-gray-800/30 border border-gray-700/50 hover:bg-gray-700/40 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full ${transaction.type === 'income' ? 'bg-green-500/20' : 'bg-gray-700/50'}`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                        ) : (
                          <span className="text-base sm:text-lg">{categoryInfo.icon}</span>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-medium text-gray-200 text-sm sm:text-base truncate max-w-[120px] sm:max-w-[200px] md:max-w-[250px]">{transaction.description}</p>
                        <div className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
                          <span className="truncate max-w-[80px] sm:max-w-[100px] inline-block align-bottom">{categoryInfo.name}</span>
                          <span className="mx-1">&bull;</span>
                          <span>{formatDate(transaction.date)} {formatTime(transaction.date)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="text-right">
                        <p className={`font-bold text-sm sm:text-base ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                          {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(transaction.id, transaction.description)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-7 w-7 sm:h-8 sm:w-8"
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
        {/* Paginação */}
        {!isRecentList && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="px-2 py-1"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <span className="text-xs text-gray-400 select-none">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="px-2 py-1"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Próxima
            </Button>
          </div>
        )}
        {!isRecentList && transactions.length > ITEMS_PER_PAGE && (
          <p className="text-center text-xs text-gray-500 mt-2">Exibindo {transactionsToDisplay.length} de {transactions.length} transações.</p>
        )}
        {isRecentList && transactions.length > 3 && (
           <p className="text-center text-xs text-white mt-3">
             Para ver todas, acesse a aba <span className="font-semibold">Histórico</span>.
           </p>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionList;