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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showResumo, setShowResumo] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.objetivo || parseFloat(form.objetivo) <= 0) newErrors.objetivo = 'Informe um objetivo válido.';
    if (!form.tempo || parseFloat(form.tempo) < 1) newErrors.tempo = 'Tempo deve ser maior que zero.';
    if (!form.taxa || parseFloat(form.taxa) < 0) newErrors.taxa = 'Taxa deve ser positiva.';
    return newErrors;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleCalcular = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setResultado(null);
      setShowResumo(false);
      return;
    }
    setShowResumo(true);
    setLoading(true);
    setTimeout(() => {
      const objetivo = parseFloat(form.objetivo);
      const tempo = parseFloat(form.tempo);
      const taxa = parseFloat(form.taxa);
      const inflacao = parseFloat(form.inflacao);
      const aporteInicial = parseFloat(form.aporteInicial) || 0;
      const aporte = calcularAporteMensal(objetivo, tempo, taxa, inflacao || 0, aporteInicial);
      setResultado(aporte);
      setLoading(false);
    }, 800);
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
            <input type="number" name="objetivo" min="0" step="0.01" className={`bg-gray-800/50 border-gray-600 text-white h-12 w-full rounded-md px-3 ${errors.objetivo ? 'border-red-500' : ''}`} value={form.objetivo} onChange={handleChange} required />
            {errors.objetivo && <span className="text-red-400 text-xs">{errors.objetivo}</span>}
          </div>
          <div className="space-y-2">
            <label className="text-gray-300 text-sm">Tempo até a aposentadoria (anos)</label>
            <input type="number" name="tempo" min="1" className={`bg-gray-800/50 border-gray-600 text-white h-12 w-full rounded-md px-3 ${errors.tempo ? 'border-red-500' : ''}`} value={form.tempo} onChange={handleChange} required />
            {errors.tempo && <span className="text-red-400 text-xs">{errors.tempo}</span>}
          </div>
          <div className="space-y-2">
            <label className="text-gray-300 text-sm">Taxa de juros anual esperada (%)</label>
            <input type="number" name="taxa" min="0" step="0.01" className={`bg-gray-800/50 border-gray-600 text-white h-12 w-full rounded-md px-3 ${errors.taxa ? 'border-red-500' : ''}`} value={form.taxa} onChange={handleChange} required />
            {errors.taxa && <span className="text-red-400 text-xs">{errors.taxa}</span>}
          </div>
          <div className="space-y-2">
            <label className="text-gray-300 text-sm">Inflação anual estimada (%)</label>
            <input type="number" name="inflacao" min="0" step="0.01" className="bg-gray-800/50 border-gray-600 text-white h-12 w-full rounded-md px-3" value={form.inflacao} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-gray-300 text-sm">Aporte inicial (R$)</label>
            <input type="number" name="aporteInicial" min="0" step="0.01" className="bg-gray-800/50 border-gray-600 text-white h-12 w-full rounded-md px-3" value={form.aporteInicial} onChange={handleChange} />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg mt-2 transition">{loading ? 'Calculando...' : 'Calcular'}</button>
        </form>

        {showResumo && (
          <div className="mt-6 p-4 rounded-lg bg-gray-900/60 border border-gray-700 text-gray-200">
            <div className="font-semibold mb-2">Resumo dos dados:</div>
            <ul className="text-sm space-y-1">
              <li>Objetivo: <span className="font-bold">R$ {parseFloat(form.objetivo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></li>
              <li>Tempo: <span className="font-bold">{form.tempo} anos</span></li>
              <li>Taxa anual: <span className="font-bold">{form.taxa}%</span></li>
              <li>Inflação anual: <span className="font-bold">{form.inflacao || 0}%</span></li>
              <li>Aporte inicial: <span className="font-bold">R$ {parseFloat(form.aporteInicial || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></li>
            </ul>
          </div>
        )}

        {loading && (
          <div className="mt-4 text-center text-blue-400 animate-pulse">Calculando...</div>
        )}

        {resultado !== null && !loading && (
          <div className="mt-6 text-center text-lg text-green-400 font-bold">
            Você precisa investir <span className="text-2xl">R$ {resultado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> por mês para atingir seu objetivo.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalculadoraAposentadoria;
