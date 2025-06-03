
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from './ui/use-toast';
import { useBudgetSupabase } from '@/hooks/useBudgetSupabase';
import { useAuth } from '@/hooks/useAuth';

const investmentTypes = [
  { id: 'cdi', name: 'CDI' },
  { id: 'cdb', name: 'CDB' },
  { id: 'renda_variavel', name: 'Renda Variável' },
  { id: 'fundo', name: 'Fundos de Investimento' },
  { id: 'crypto', name: 'Criptomoeda' },
  { id: 'dolar', name: 'Em Dólar' },
  { id: 'tesouro', name: 'Tesouro Direto' },
  { id: 'outro', name: 'Outro' },
];


const Investments = () => {
  const [form, setForm] = useState({
    type: '',
    name: '',
    value: '',
    date: '',
  });
  const { data, addInvestment } = useBudgetSupabase();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
    toast({ title: 'Sucesso!', description: 'Investimento adicionado.' });
  };

  return (
    <Card className="glassmorphism card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-200">
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
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
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
              <Input
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                className="bg-gray-800/50 border-gray-600 text-white"
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
        <div className="space-y-2">
          {(!data.investments || data.investments.length === 0) ? (
            <div className="text-gray-500 text-center">Nenhum investimento cadastrado.</div>
          ) : (
            <table className="w-full text-sm text-gray-200">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-1 text-left">Tipo</th>
                  <th className="py-1 text-left">Nome</th>
                  <th className="py-1 text-left">Valor</th>
                  <th className="py-1 text-left">Data</th>
                </tr>
              </thead>
              <tbody>
                {data.investments.map(inv => (
                  <tr key={inv.id} className="border-b border-gray-800">
                    <td className="py-1">{investmentTypes.find(t => t.id === inv.type)?.name || inv.type}</td>
                    <td className="py-1">{inv.name}</td>
                    <td className="py-1">R$ {Number(inv.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="py-1">{inv.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Investments;
