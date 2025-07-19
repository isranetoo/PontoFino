
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';


const TransactionForm = ({ onAddTransaction, categories }) => {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category: ''
  });
  const { toast } = useToast();
  const { user, loading } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Faça login ou registre-se",
        description: "Você precisa estar logado para adicionar uma transação.",
        variant: "destructive"
      });
      return;
    }
    if (!formData.amount || !formData.description || (formData.type === 'expense' && !formData.category)) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(formData.amount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, insira um valor válido.",
        variant: "destructive"
      });
      return;
    }

    onAddTransaction({
      ...formData,
      amount,
      category: formData.type === 'income' ? 'income' : formData.category
    });

    setFormData({
      type: 'expense',
      amount: '',
      description: '',
      category: ''
    });

    toast({
      title: "Sucesso!",
      description: `${formData.type === 'income' ? 'Receita' : 'Despesa'} adicionada com sucesso.`
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glassmorphism card-hover animate-pulse-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-200">
            <Plus className="h-5 w-5" />
            Nova Transação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-gray-300">Tipo</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value, category: '' }))}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">💸 Despesa</SelectItem>
                    <SelectItem value="income">💰 Receita</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-gray-300">Valor</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="amount"
                    type="text"
                    placeholder="0,00"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="pl-10 bg-gray-800/50 border-gray-600 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300">Descrição</Label>
              <Input
                id="description"
                type="text"
                placeholder="Descreva a transação..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="bg-gray-800/50 border-gray-600 text-white"
              />
            </div>

            {formData.type === 'expense' && (
              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-300">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-600">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full gradient-bg hover:opacity-90 transition-all duration-300 transform hover:scale-105"
              disabled={loading || !user}
            >
              <Plus className="h-4 w-4 mr-2" />
              {user ? 'Adicionar Transação' : 'Faça login para adicionar'}
            </Button>
            {!user && (
              <div className="text-center text-sm text-gray-400">
                Para adicionar uma transação, <a href="/login" className="text-blue-400 underline">faça login</a> ou <a href="/register" className="text-blue-400 underline">registre-se</a>.
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TransactionForm;
