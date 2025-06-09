import React, { useState } from 'react';
import SimuladorNavBar from './NavBar';
import DashboardSimulador from './Dashboard';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../ui/use-toast';

const investmentTypes = [
  { id: 'cdi', name: 'CDI', emoji: '🏦' },
  { id: 'cdb', name: 'CDB', emoji: '💳' },
  { id: 'renda_variavel', name: 'Renda Variável', emoji: '📈' },
  { id: 'fundo', name: 'Fundos de Investimento', emoji: '📊' },
  { id: 'crypto', name: 'Criptomoeda', emoji: '💰' },
  { id: 'dolar', name: 'Em Dólar', emoji: '💵' },
  { id: 'tesouro', name: 'Tesouro Direto', emoji: '🏛️' },
  { id: 'outro', name: 'Outro', emoji: '💼' },
];

const SimuladorInvestimentos = () => {
  const [form, setForm] = useState({
    type: '',
    aporte: '',
    taxa: '',
    tempo: '',
    rendimento: 'bruto',
  });
  const [result, setResult] = useState(null);
  const [simulations, setSimulations] = useState([]);
  const [tab, setTab] = useState('simular');
  const { toast } = useToast();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (value) => {
    setForm({ ...form, type: value });
  };

  const calcularSimulacao = (e) => {
    e.preventDefault();
    const aporte = parseFloat(form.aporte.replace(',', '.'));
    const taxa = parseFloat(form.taxa.replace(',', '.')) / 100;
    const tempo = parseInt(form.tempo);
    if (isNaN(aporte) || isNaN(taxa) || isNaN(tempo) || aporte <= 0 || taxa < 0 || tempo <= 0) {
      toast({ title: 'Erro', description: 'Preencha todos os campos corretamente.', variant: 'destructive' });
      return;
    }
    // Juros compostos: VF = VP * (1 + i)^n
    const valorFinal = aporte * Math.pow(1 + taxa, tempo);
    const simData = {
      name: investmentTypes.find((t) => t.id === form.type)?.name || 'Simulação',
      valorFinal,
      rendimento: valorFinal - aporte,
      aporte,
      tempo,
      taxa: taxa * 100,
    };
    setResult(simData);
    setSimulations((prev) => [...prev, simData]);
    setForm({ type: '', aporte: '', taxa: '', tempo: '', rendimento: 'bruto' });
    setTab('comparar'); // Vai para a aba comparar automaticamente
  };

  return (
    <div className="space-y-6 relative">
      {/* NavBar do Simulador */}
      <SimuladorNavBar tab={tab} setTab={setTab} />

      {/* Conteúdo das abas */}
      {tab === 'simular' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="glassmorphism card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-200 text-lg sm:text-xl">
                <span role="img" aria-label="Simulador">📊</span>
                Simulador de Investimentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={calcularSimulacao} className="space-y-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-gray-300">Tipo de Investimento</Label>
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
                    <Label htmlFor="aporte" className="text-gray-300">Aporte Inicial (R$)</Label>
                    <Input id="aporte" name="aporte" type="text" placeholder="0,00" value={form.aporte} onChange={handleChange} className="bg-gray-800/50 border-gray-600 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxa" className="text-gray-300">Taxa de Juros (% ao mês)</Label>
                    <Input id="taxa" name="taxa" type="text" placeholder="0,00" value={form.taxa} onChange={handleChange} className="bg-gray-800/50 border-gray-600 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tempo" className="text-gray-300">Tempo (meses)</Label>
                    <Input id="tempo" name="tempo" type="number" placeholder="0" value={form.tempo} onChange={handleChange} className="bg-gray-800/50 border-gray-600 text-white" />
                  </div>
                </div>
                <Button type="submit" className="w-full gradient-bg hover:opacity-90">Simular</Button>
              </form>
              {result && (
                <div className="mt-6 p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-blue-400">Resultado da Simulação</span>
                  </div>
                  <p className="text-lg font-bold text-blue-300">Valor Final: R$ {result.valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-sm text-gray-400">Rendimento: R$ {result.rendimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-gray-400">Aporte: R$ {result.aporte.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Tempo: {result.tempo} meses | Taxa: {result.taxa}% ao mês</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Dashboard das Simulações e Comparação */}
      {(tab === 'comparar' || tab === 'historico' || tab === 'config') && (
        <DashboardSimulador
          simulations={simulations.length > 0 ? simulations : [
            { name: 'Exemplo 1', valorFinal: 1000, rendimento: 100, aporte: 900, tempo: 12, taxa: 1 },
            { name: 'Exemplo 2', valorFinal: 2000, rendimento: 200, aporte: 1800, tempo: 24, taxa: 1.5 },
          ]}
          comparisonData={
            simulations.length > 0
              ? simulations.map((sim) => ({ name: sim.name, valorFinal: sim.valorFinal }))
              : [
                  { name: 'Exemplo 1', valorFinal: 1000 },
                  { name: 'Exemplo 2', valorFinal: 2000 },
                ]
          }
        />
      )}
    </div>
  );
};

export default SimuladorInvestimentos;
