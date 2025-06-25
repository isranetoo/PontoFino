import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { BarChart3 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const fundosMock = [
  { nome: 'Fundo Alpha', categoria: 'Fundo de Investimento', retorno: 12.5 },
  { nome: 'Fundo Beta', categoria: 'Fundo de Investimento', retorno: 10.2 },
  { nome: 'Fundo Gamma', categoria: 'Fundo de Investimento', retorno: 14.1 },
];

const rendaVariavelMock = [
  { nome: 'Ação XPTO3', categoria: 'Ação', retorno: 18.7 },
  { nome: 'ETF BOVA11', categoria: 'ETF', retorno: 16.3 },
  { nome: 'FII HGLG11', categoria: 'FII', retorno: 13.9 },
];

const ComparadorFundosRendaVariavel = () => {
  const [tipo, setTipo] = useState('fundos');
  const data = tipo === 'fundos' ? fundosMock : rendaVariavelMock;

  return (
    <Card className="glassmorphism card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-200 text-lg sm:text-xl">
          <BarChart3 className="h-5 w-5" />
          Comparador de Fundos e Renda Variável
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <button
            className={`px-4 py-2 rounded-lg font-semibold ${tipo === 'fundos' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}
            onClick={() => setTipo('fundos')}
          >
            Fundos de Investimento
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-semibold ${tipo === 'renda' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}
            onClick={() => setTipo('renda')}
          >
            Renda Variável
          </button>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="nome" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip formatter={(value) => [`${value}%`, 'Retorno']} labelStyle={{ color: '#000' }} />
            <Legend />
            <Bar dataKey="retorno" fill="#10B981" name="Retorno (%)" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 text-xs text-gray-400">
          Fonte: Dados fictícios para demonstração. Personalize com dados reais do seu backend ou API.
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparadorFundosRendaVariavel;
