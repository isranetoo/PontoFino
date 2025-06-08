
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, DollarSign, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const BudgetSettings = ({ monthlyBudget, onSetMonthlyBudget }) => {
  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());
  const { toast } = useToast();

  const { user, loading } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Faça login ou registre-se",
        description: "Você precisa estar logado para definir o orçamento mensal.",
        variant: "destructive"
      });
      return;
    }
    const budget = parseFloat(budgetInput.replace(',', '.'));
    if (isNaN(budget) || budget < 0) {
      toast({
        title: "Erro",
        description: "Por favor, insira um valor válido para o orçamento.",
        variant: "destructive"
      });
      return;
    }

    onSetMonthlyBudget(budget);
    toast({
      title: "Sucesso!",
      description: "Orçamento mensal atualizado com sucesso."
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glassmorphism card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-200">
            <Settings className="h-5 w-5" />
            Configurações de Orçamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyBudget" className="text-gray-300">
                Orçamento Mensal
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="monthlyBudget"
                  type="text"
                  placeholder="0,00"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-600 text-white"
                />
              </div>
              <p className="text-sm text-gray-400">
                Defina seu limite de gastos mensais para acompanhar melhor suas finanças
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full gradient-bg hover:opacity-90 transition-all duration-300"
              disabled={loading || !user}
            >
              <Save className="h-4 w-4 mr-2" />
              {user ? 'Salvar Orçamento' : 'Faça login para salvar'}
            </Button>
            {!user && (
              <div className="text-center text-sm text-gray-400">
                Para definir o orçamento, <a href="/login" className="text-blue-400 underline">faça login</a> ou <a href="/register" className="text-blue-400 underline">registre-se</a>.
              </div>
            )}
          </form>

          {monthlyBudget > 0 && (
            <div className="mt-6 p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Orçamento Atual</span>
              </div>
              <p className="text-lg font-bold text-blue-300">
                R$ {monthlyBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BudgetSettings;
