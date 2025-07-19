import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { History } from 'lucide-react';

const HistoricoInvestimentos = ({ simulations }) => {
  return (
    <Card className="glassmorphism card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-200 text-lg sm:text-xl">
          <History className="h-5 w-5" />
          Histórico de Simulações
        </CardTitle>
      </CardHeader>
      <CardContent>
        {simulations && simulations.length > 0 ? (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {simulations.slice().reverse().map((sim, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="font-semibold text-blue-300 text-base">{sim.name}</div>
                  <div className="text-xs text-gray-400">Aporte: R$ {sim.aporte.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Tempo: {sim.tempo} meses | Taxa: {sim.taxa}%</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-400">R$ {sim.valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  <div className="text-xs text-gray-400">Rendimento: R$ {sim.rendimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">Nenhuma simulação realizada ainda.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoricoInvestimentos;
