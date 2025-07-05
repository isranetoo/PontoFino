import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { CalendarCheck2 } from 'lucide-react';

function calcularAporteMensal(objetivo, tempo, taxa, inflacao, aporteInicial = 0) {
  // taxa e inflacao em % ao ano, tempo em anos
  const taxaReal = ((1 + taxa / 100) / (1 + inflacao / 100)) - 1;
  const n = tempo * 12;
  const i = Math.pow(1 + taxaReal, 1 / 12) - 1;
  // FV = PV*(1+i)^n + PMT*(((1+i)^n - 1)/i)
  // PMT = (FV - PV*(1+i)^n) * i / ((1+i)^n - 1)
  const FV = objetivo;
  const PV = aporteInicial;
  const fator = Math.pow(1 + i, n);
  const pmt = (FV - PV * fator) * i / (fator - 1);
  return pmt > 0 ? pmt : 0;
}

const CalculadoraAposentadoria = () => {
  const [form, setForm] = useState({
    objetivo: '',
    tempo: '',
    taxa: '',
    inflacao: '',
    aporteInicial: '',
  });
  const [resultado, setResultado] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCalcular = (e) => {
    e.preventDefault();
    const objetivo = parseFloat(form.objetivo);
    const tempo = parseFloat(form.tempo);
    const taxa = parseFloat(form.taxa);
    const inflacao = parseFloat(form.inflacao);
    const aporteInicial = parseFloat(form.aporteInicial) || 0;
    if (!objetivo || !tempo || !taxa) {
      setResultado(null);
      return;
    }
    const aporte = calcularAporteMensal(objetivo, tempo, taxa, inflacao || 0, aporteInicial);
    setResultado(aporte);
  };

  return (
    <Card className="glassmorphism card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-200 text-lg sm:text-xl">
          <CalendarCheck2 className="h-5 w-5" />
          Calculadora de Aposentadoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleCalcular}>
          <div className="space-y-2">
            <label className="text-gray-300 text-sm">Objetivo de patrimônio (R$)</label>
            <input type="number" name="objetivo" min="0" step="0.01" className="bg-gray-800/50 border-gray-600 text-white h-12 w-full rounded-md px-3" value={form.objetivo} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <label className="text-gray-300 text-sm">Tempo até a aposentadoria (anos)</label>
            <input type="number" name="tempo" min="1" className="bg-gray-800/50 border-gray-600 text-white h-12 w-full rounded-md px-3" value={form.tempo} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <label className="text-gray-300 text-sm">Taxa de juros anual esperada (%)</label>
            <input type="number" name="taxa" min="0" step="0.01" className="bg-gray-800/50 border-gray-600 text-white h-12 w-full rounded-md px-3" value={form.taxa} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <label className="text-gray-300 text-sm">Inflação anual estimada (%)</label>
            <input type="number" name="inflacao" min="0" step="0.01" className="bg-gray-800/50 border-gray-600 text-white h-12 w-full rounded-md px-3" value={form.inflacao} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-gray-300 text-sm">Aporte inicial (R$)</label>
            <input type="number" name="aporteInicial" min="0" step="0.01" className="bg-gray-800/50 border-gray-600 text-white h-12 w-full rounded-md px-3" value={form.aporteInicial} onChange={handleChange} />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg mt-2 transition">Calcular</button>
        </form>
        {resultado !== null && (
          <div className="mt-6 text-center text-lg text-green-400 font-bold">
            Você precisa investir <span className="text-2xl">R$ {resultado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> por mês para atingir seu objetivo.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalculadoraAposentadoria;
