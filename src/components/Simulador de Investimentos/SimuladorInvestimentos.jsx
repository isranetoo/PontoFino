import React, { useState } from 'react';
import SimuladorNavBar from './NavBar';
import DashboardSimulador from './Dashboard';
import ComparadorFundosRendaVariavel from './ComparadorFundosRendaVariavel';
import Footer from '../Footer';
import { Toaster } from '../ui/toaster';
import HistoricoInvestimentos from './HistoricoInvestimentos';
import ConfiguracoesInvestimentos from './ConfiguracoesInvestimentos';
import CalculadoraAposentadoria from './CalculadoraAposentadoria';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../ui/use-toast';

const investmentTypes = [
  { id: 'cdi', name: 'CDI', emoji: '🏦', description: 'Certificado de Depósito Interbancário, referência para renda fixa.' },
  { id: 'cdb', name: 'CDB', emoji: '💳', description: 'Certificado de Depósito Bancário, renda fixa emitida por bancos.' },
  { id: 'lci', name: 'LCI', emoji: '🏠', description: 'Letra de Crédito Imobiliário, isenta de IR para pessoa física.' },
  { id: 'lca', name: 'LCA', emoji: '🌾', description: 'Letra de Crédito do Agronegócio, isenta de IR para pessoa física.' },
  { id: 'fii', name: 'FII', emoji: '🏢', description: 'Fundo de Investimento Imobiliário, renda variável.' },
  { id: 'debenture', name: 'Debênture', emoji: '📜', description: 'Título de dívida de empresas, pode ter isenção de IR.' },
  { id: 'poupanca', name: 'Poupança', emoji: '💸', description: 'Investimento tradicional, rendimento fixo e baixo risco.' },
  { id: 'previdencia', name: 'Previdência Privada', emoji: '👴', description: 'Plano de aposentadoria de longo prazo.' },
  { id: 'etf', name: 'ETF', emoji: '🌍', description: 'Fundo de índice, diversificação em renda variável.' },
  { id: 'renda_variavel', name: 'Renda Variável', emoji: '📈', description: 'Ações, fundos, etc.' },
  { id: 'fundo', name: 'Fundos de Investimento', emoji: '📊', description: 'Fundos de renda fixa, multimercado, etc.' },
  { id: 'crypto', name: 'Criptomoeda', emoji: '💰', description: 'Bitcoin, Ethereum, etc.' },
  { id: 'dolar', name: 'Em Dólar', emoji: '💵', description: 'Investimento atrelado ao dólar.' },
  { id: 'tesouro', name: 'Tesouro Direto', emoji: '🏛️', description: 'Títulos públicos federais.' },
  { id: 'outro', name: 'Outro', emoji: '💼', description: 'Outro tipo de investimento.' },
];


const defaultConfig = {
  defaultAporte: '',
  defaultAporteMensal: '',
  defaultTaxa: '',
  defaultInflacao: '',
  defaultTempo: '',
};

const SimuladorInvestimentos = () => {
  const [form, setForm] = useState({
    type: '',
    aporte: '',
    aporteMensal: '',
    taxa: '',
    inflacao: '',
    tempo: '',
    rendimento: 'bruto',
  });
  const [result, setResult] = useState(null);
  const [simulations, setSimulations] = useState([]);
  const [tab, setTab] = useState('simular');
  const [config, setConfig] = useState(defaultConfig);
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
    const aporteMensal = parseFloat(form.aporteMensal?.replace(',', '.') || '0');
    const taxa = parseFloat(form.taxa.replace(',', '.')) / 100;
    const inflacao = parseFloat(form.inflacao?.replace(',', '.') || '0') / 100;
    const tempo = parseInt(form.tempo);
    if (isNaN(aporte) || isNaN(taxa) || isNaN(tempo) || aporte < 0 || taxa < 0 || tempo <= 0) {
      toast({ title: 'Erro', description: 'Preencha todos os campos corretamente.', variant: 'destructive' });
      return;
    }
    // Juros compostos com aporte mensal e inflação
    let valorFinal = aporte;
    let saldo = aporte;
    for (let i = 1; i <= tempo; i++) {
      saldo = (saldo + aporteMensal) * (1 + taxa);
      if (inflacao > 0) {
        saldo = saldo / (1 + inflacao / 12);
      }
    }
    valorFinal = saldo;
    const simData = {
      name: investmentTypes.find((t) => t.id === form.type)?.name || 'Simulação',
      valorFinal,
      rendimento: valorFinal - aporte - (aporteMensal * tempo),
      aporte,
      aporteMensal,
      tempo,
      taxa: taxa * 100,
      inflacao: inflacao * 100,
    };
    setResult(simData);
    setSimulations((prev) => [...prev, simData]);
    setForm({ type: '', aporte: '', aporteMensal: '', taxa: '', inflacao: '', tempo: '', rendimento: 'bruto' });
    setTab('comparar');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-[#0096fd]">
      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 flex-1 w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="flex items-center justify-center gap-3 text-3xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-[#00b6fc] via-[#00a4fd] to-[#0096fd] bg-clip-text text-transparent mb-2 sm:mb-4">
            <img src="/assets/PontoFino_Logo.png" alt="Logo" className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16" />
            Simulador de Investimentos
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto px-2">
            Simule, compare e visualize diferentes cenários de investimentos de forma simples e visual.
          </p>
        </motion.div>

        <div className="space-y-6 relative">
          {/* NavBar do Simulador */}
          <SimuladorNavBar tab={tab} setTab={setTab} />

          {/* Conteúdo das abas */}
          {tab === 'simular' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card className="glassmorphism card-hover animate-pulse-glow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-200 text-lg sm:text-xl">
                    <span role="img" aria-label="Simulador">📊</span>
                    Simulador de Investimentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={calcularSimulacao} className="space-y-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="type" className="text-gray-300 text-sm sm:text-base">Tipo de Investimento</Label>
                        <Select value={form.type} onValueChange={handleTypeChange}>
                          <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white h-12 text-base sm:text-lg">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {investmentTypes.map((t) => (
                              <SelectItem key={t.id} value={t.id} className="text-base sm:text-lg h-12">
                                <span className="mr-2 text-lg sm:text-xl">{t.emoji}</span>{t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {form.type && (
                          <div className="text-xs text-blue-200 mt-1">
                            {investmentTypes.find(t => t.id === form.type)?.description}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="aporte" className="text-gray-300 text-sm sm:text-base">Aporte Inicial (R$)</Label>
                        <Input id="aporte" name="aporte" type="text" placeholder="0,00" value={form.aporte} onChange={handleChange} className="bg-gray-800/50 border-gray-600 text-white h-12 text-base sm:text-lg" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="aporteMensal" className="text-gray-300 text-sm sm:text-base">Aporte Mensal (R$)</Label>
                        <Input id="aporteMensal" name="aporteMensal" type="text" placeholder="0,00" value={form.aporteMensal} onChange={handleChange} className="bg-gray-800/50 border-gray-600 text-white h-12 text-base sm:text-lg" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="taxa" className="text-gray-300 text-sm sm:text-base">Taxa de Juros (% ao mês)</Label>
                        <Input id="taxa" name="taxa" type="text" placeholder="0,00" value={form.taxa} onChange={handleChange} className="bg-gray-800/50 border-gray-600 text-white h-12 text-base sm:text-lg" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="inflacao" className="text-gray-300 text-sm sm:text-base">Inflação Anual (%)</Label>
                        <Input id="inflacao" name="inflacao" type="text" placeholder="0,00" value={form.inflacao} onChange={handleChange} className="bg-gray-800/50 border-gray-600 text-white h-12 text-base sm:text-lg" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tempo" className="text-gray-300 text-sm sm:text-base">Tempo (meses)</Label>
                        <Input id="tempo" name="tempo" type="number" placeholder="0" value={form.tempo} onChange={handleChange} className="bg-gray-800/50 border-gray-600 text-white h-12 text-base sm:text-lg" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-12 text-base sm:text-lg gradient-bg hover:opacity-90 transition-all duration-300 transform hover:scale-105">Simular</Button>
                  </form>
                  {result && (
                    <div className="mt-6 p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-blue-400">Resultado da Simulação</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-300">Valor Final: R$ {result.valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <p className="text-sm text-gray-400">Rendimento: R$ {result.rendimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <p className="text-xs text-gray-400">Aporte: R$ {result.aporte.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Tempo: {result.tempo} meses | Taxa: {result.taxa}% ao mês</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Dashboard das Simulações e Comparação */}
          {tab === 'comparar' && (
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
          {tab === 'comparador_fundos' && (
            <ComparadorFundosRendaVariavel />
          )}
          {tab === 'historico' && (
            <HistoricoInvestimentos simulations={simulations} />
          )}
          {tab === 'config' && (
            <ConfiguracoesInvestimentos config={config} onConfigChange={setConfig} />
          )}
          {tab === 'aposentadoria' && (
            <CalculadoraAposentadoria />
          )}
        </div>
      </div>
      <Toaster />
      <Footer />
    </div>
  );
};

export default SimuladorInvestimentos;
