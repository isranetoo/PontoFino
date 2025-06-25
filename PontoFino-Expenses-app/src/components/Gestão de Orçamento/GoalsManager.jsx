// MOVIDO: src/components/GoalsManager.jsx
// ---
// Este arquivo foi movido para a pasta Gestão de Orçamento.
// O conteúdo original está abaixo:

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Target, Plus, Trash2, Edit, TrendingUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const GoalsManager = ({ goals, onAddGoal, onUpdateGoal, onDeleteGoal }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: ''
  });
  const { toast } = useToast();
  const { user, loading } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Faça login ou registre-se",
        description: "Você precisa estar logado para criar ou editar metas.",
        variant: "destructive"
      });
      return;
    }
    if (!formData.name || !formData.targetAmount) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const targetAmount = parseFloat(formData.targetAmount.replace(',', '.'));
    const currentAmount = parseFloat(formData.currentAmount.replace(',', '.')) || 0;

    if (isNaN(targetAmount) || targetAmount <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, insira um valor válido para a meta.",
        variant: "destructive"
      });
      return;
    }

    if (editingGoal) {
      onUpdateGoal(editingGoal.id, {
        name: formData.name,
        targetAmount,
        currentAmount
      });
      toast({
        title: "Sucesso!",
        description: "Meta atualizada com sucesso."
      });
    } else {
      onAddGoal({
        name: formData.name,
        targetAmount,
        currentAmount
      });
      toast({
        title: "Sucesso!",
        description: "Meta criada com sucesso."
      });
    }

    setFormData({ name: '', targetAmount: '', currentAmount: '' });
    setEditingGoal(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (goal) => {
    if (!user) {
      toast({
        title: "Faça login ou registre-se",
        description: "Você precisa estar logado para editar metas.",
        variant: "destructive"
      });
      return;
    }
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString()
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id, name) => {
    if (!user) {
      toast({
        title: "Faça login ou registre-se",
        description: "Você precisa estar logado para remover metas.",
        variant: "destructive"
      });
      return;
    }
    onDeleteGoal(id);
    toast({
      title: "Meta removida",
      description: `"${name}" foi removida com sucesso.`
    });
  };

  const handleAddProgress = (goalId, amount) => {
    if (!user) {
      toast({
        title: "Faça login ou registre-se",
        description: "Você precisa estar logado para adicionar progresso em metas.",
        variant: "destructive"
      });
      return;
    }
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      const newAmount = goal.currentAmount + amount;
      onUpdateGoal(goalId, { currentAmount: Math.min(newAmount, goal.targetAmount) });
      toast({
        title: "Progresso adicionado!",
        description: `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} adicionado à meta.`
      });
    }
  };

  return (
    <Card className="glassmorphism card-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-200">
            <Target className="h-5 w-5" />
            Metas de Economia
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="gradient-bg hover:opacity-90 transition-all duration-300"
                onClick={() => {
                  setEditingGoal(null);
                  setFormData({ name: '', targetAmount: '', currentAmount: '' });
                }}
                disabled={loading || !user}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-gray-200">
                  {editingGoal ? 'Editar Meta' : 'Nova Meta de Economia'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goalName" className="text-gray-300">Nome da Meta</Label>
                  <Input
                    id="goalName"
                    placeholder="Ex: Viagem para Europa"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-gray-800/50 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetAmount" className="text-gray-300">Valor da Meta</Label>
                  <Input
                    id="targetAmount"
                    placeholder="0,00"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                    className="bg-gray-800/50 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentAmount" className="text-gray-300">Valor Atual (opcional)</Label>
                  <Input
                    id="currentAmount"
                    placeholder="0,00"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentAmount: e.target.value }))}
                    className="bg-gray-800/50 border-gray-600 text-white"
                  />
                </div>
                <Button type="submit" className="w-full gradient-bg hover:opacity-90" disabled={loading || !user}>
                  {editingGoal ? 'Atualizar Meta' : 'Criar Meta'}
                </Button>
                {!user && (
                  <div className="text-center text-sm text-gray-400">
                    Para criar ou editar metas, <a href="/login" className="text-blue-400 underline">faça login</a> ou <a href="/register" className="text-blue-400 underline">registre-se</a>.
                  </div>
                )}
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {!user && (
          <div className="text-center text-sm text-gray-400 mb-2">
            Para adicionar, editar ou remover metas, <a href="/login" className="text-blue-400 underline">faça login</a> ou <a href="/register" className="text-blue-400 underline">registre-se</a>.
          </div>
        )}
        <div className="space-y-4">
          <AnimatePresence>
            {goals.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma meta criada</p>
                <p className="text-sm">Crie sua primeira meta de economia</p>
              </div>
            ) : (
              goals.map((goal, index) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                const isCompleted = progress >= 100;
                
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-green-900/20 border-green-500/50' 
                        : 'bg-gray-800/30 border-gray-700/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-200 flex items-center gap-2">
                          {goal.name}
                          {isCompleted && <span className="text-green-400">🎉</span>}
                        </h3>
                        <p className="text-sm text-gray-400">
                          R$ {goal.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / 
                          R$ {goal.targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(goal)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(goal.id, goal.name)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Progress 
                        value={Math.min(progress, 100)} 
                        className="h-2"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">
                          {progress.toFixed(1)}% concluído
                        </span>
                        {!isCompleted && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddProgress(goal.id, 50)}
                              className="text-xs border-gray-600 hover:bg-gray-700"
                            >
                              +R$ 50
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddProgress(goal.id, 100)}
                              className="text-xs border-gray-600 hover:bg-gray-700"
                            >
                              +R$ 100
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalsManager;
