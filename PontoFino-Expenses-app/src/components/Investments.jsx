
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { BarChart3 } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from './ui/use-toast';
import { useBudgetSupabase } from '@/hooks/useBudgetSupabase';
import { useAuth } from '@/hooks/useAuth';

const investmentTypes = [
  { id: 'cdi', name: 'CDI', emoji: '🏦' },
  { id: 'cdb', name: 'CDB', emoji: '💳' },
  { id: 'renda_variavel', name: 'Renda Variável', emoji: '📈' },
  { id: 'fundo', name: 'Fundos de Investimento', emoji: '📊' },
  { id: 'crypto', name: 'Criptomoeda', emoji: '🪙' },
  { id: 'dolar', name: 'Em Dólar', emoji: '💵' },
  { id: 'tesouro', name: 'Tesouro Direto', emoji: '🏛️' },
  { id: 'outro', name: 'Outro', emoji: '💼' },
];


const Investments = () => {
  const [form, setForm] = useState({
    type: '',
    name: '',
    value: '',
    date: '', // manter string para compatibilidade
  });

  // Para o DatePicker funcionar com Date, precisamos de um estado auxiliar
  const [dateObj, setDateObj] = useState(null);
  const { data, addInvestment, deleteInvestment, loading } = useBudgetSupabase();
  // Deletar investimento
  const handleDeleteInvestment = async (id) => {
    if (!user) {
      toast({
        title: 'Faça login ou registre-se',
        description: 'Você precisa estar logado para deletar investimentos.',
        variant: 'destructive',
      });
      return;
    }
    await deleteInvestment(id);
    toast({ title: 'Investimento removido', description: 'O investimento foi deletado com sucesso.' });
  };
  const { toast } = useToast();
  const { user } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Quando o usuário seleciona uma data no calendário
  const handleDateChange = (date) => {
    setDateObj(date);
    // Salva no formato yyyy-mm-dd para compatibilidade
    if (date) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      setForm({ ...form, date: `${yyyy}-${mm}-${dd}` });
    } else {
      setForm({ ...form, date: '' });
    }
  };

  const handleTypeChange = (value) => {
    setForm({ ...form, type: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Faça login ou registre-se',
        description: 'Você precisa estar logado para adicionar investimentos.',
        variant: 'destructive',
      });
      return;
    }
    if (!form.type || !form.name || !form.value || !form.date) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos.',
        variant: 'destructive',
      });
      return;
    }
    const value = parseFloat(form.value.replace(',', '.'));
    if (isNaN(value) || value <= 0) {
      toast({
        title: 'Erro',
        description: 'Valor inválido.',
        variant: 'destructive',
      });
      return;
    }
    await addInvestment({
      type: form.type,
      name: form.name,
      value,
      date: form.date
    });
    setForm({ type: '', name: '', value: '', date: '' });
    setDateObj(null);
    toast({ title: 'Sucesso!', description: 'Investimento adicionado.' });
  };

  // Recent investments (last 5)
  const recentInvestments = (data.investments || []).slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glassmorphism card-hover">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-50 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          </div>
        )}
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-200 text-lg sm:text-xl">
            <BarChart3 className="h-6 w-6" />
            Investimentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-400 text-base mb-4">
            Adicione e acompanhe seus investimentos de todos os tipos.
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-gray-300">Tipo</Label>
                <Select value={form.type} onValueChange={handleTypeChange}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {investmentTypes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        <span className="mr-2">{t.emoji}</span>{t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ex: Tesouro Selic, Bitcoin, Fundo XPTO"
                  value={form.name}
                  onChange={handleChange}
                  className="bg-gray-800/50 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value" className="text-gray-300">Valor (R$)</Label>
                <Input
                  id="value"
                  name="value"
                  type="text"
                  placeholder="0,00"
                  value={form.value}
                  onChange={handleChange}
                  className="bg-gray-800/50 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date" className="text-gray-300">Data</Label>
                <DatePicker
                  id="date"
                  selected={dateObj}
                  onChange={handleDateChange}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Selecione a data"
                  className="bg-gray-800/50 border-gray-600 text-white w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  calendarClassName="bg-gray-900 text-white border border-gray-700 rounded-lg shadow-lg"
                  popperClassName="z-50"
                  wrapperClassName="w-full"
                  locale="pt-BR"
                  autoComplete="off"
                />
              </div>
            </div>
            <Button type="submit" className="w-full gradient-bg hover:opacity-90" disabled={!user}>
              {user ? 'Adicionar Investimento' : 'Faça login para adicionar'}
            </Button>
          </form>
          {!user && (
            <div className="text-center text-sm text-gray-400 mb-2">
              Para adicionar investimentos, <a href="/login" className="text-blue-400 underline">faça login</a> ou <a href="/register" className="text-blue-400 underline">registre-se</a>.
            </div>
          )}

          {/* Recent Investments Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-200 text-lg sm:text-xl mb-2">
              <span role="img" aria-label="Investimento">💸</span>
              Investimentos Recentes
            </div>
            {loading ? (
              <div className="flex justify-center items-center py-8 text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              </div>
            ) : recentInvestments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <span className="text-3xl">💸</span>
                <p className="text-sm sm:text-base mt-2">Nenhum investimento cadastrado</p>
                <p className="text-xs sm:text-sm">Adicione seu primeiro investimento</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {recentInvestments.map((inv, index) => {
                  const typeObj = investmentTypes.find(t => t.id === inv.type);
                  return (
                    <motion.div
                      key={inv.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-center justify-between rounded-lg bg-gray-800/60 px-3 py-2 shadow-sm border border-gray-700"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{typeObj?.emoji || '💸'}</span>
                        <span className="font-medium text-gray-100">{typeObj?.name || inv.type}</span>
                        <span className="text-xs text-gray-400">{inv.name}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-semibold text-blue-400">R$ {Number(inv.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        <span className="text-xs text-gray-400">{inv.date}</span>
                        {user && (
                          <button
                            onClick={() => handleDeleteInvestment(inv.id)}
                            className="mt-1 px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-700 text-white transition"
                            title="Excluir investimento"
                          >
                            Excluir
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Investments;
