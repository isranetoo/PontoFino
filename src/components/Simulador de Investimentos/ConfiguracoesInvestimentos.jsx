import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Settings } from 'lucide-react';

const ConfiguracoesInvestimentos = ({ config, onConfigChange }) => {
  return (
    <Card className="glassmorphism card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-200 text-lg sm:text-xl">
          <Settings className="h-5 w-5" />
          Configurações do Simulador
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="defaultAporte" className="text-gray-300 text-sm sm:text-base">Aporte Inicial Padrão (R$)</label>
            <input
              id="defaultAporte"
              type="number"
              min="0"
              className="bg-gray-800/50 border-gray-600 text-white h-12 text-base sm:text-lg w-full rounded-md px-3"
              value={config.defaultAporte}
              onChange={e => onConfigChange({ ...config, defaultAporte: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="defaultAporteMensal" className="text-gray-300 text-sm sm:text-base">Aporte Mensal Padrão (R$)</label>
            <input
              id="defaultAporteMensal"
              type="number"
              min="0"
              className="bg-gray-800/50 border-gray-600 text-white h-12 text-base sm:text-lg w-full rounded-md px-3"
              value={config.defaultAporteMensal || ''}
              onChange={e => onConfigChange({ ...config, defaultAporteMensal: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="defaultTaxa" className="text-gray-300 text-sm sm:text-base">Taxa de Juros Padrão (% ao mês)</label>
            <input
              id="defaultTaxa"
              type="number"
              min="0"
              step="0.01"
              className="bg-gray-800/50 border-gray-600 text-white h-12 text-base sm:text-lg w-full rounded-md px-3"
              value={config.defaultTaxa}
              onChange={e => onConfigChange({ ...config, defaultTaxa: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="defaultInflacao" className="text-gray-300 text-sm sm:text-base">Inflação Anual Padrão (%)</label>
            <input
              id="defaultInflacao"
              type="number"
              min="0"
              step="0.01"
              className="bg-gray-800/50 border-gray-600 text-white h-12 text-base sm:text-lg w-full rounded-md px-3"
              value={config.defaultInflacao || ''}
              onChange={e => onConfigChange({ ...config, defaultInflacao: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="defaultTempo" className="text-gray-300 text-sm sm:text-base">Tempo Padrão (meses)</label>
            <input
              id="defaultTempo"
              type="number"
              min="1"
              className="bg-gray-800/50 border-gray-600 text-white h-12 text-base sm:text-lg w-full rounded-md px-3"
              value={config.defaultTempo}
              onChange={e => onConfigChange({ ...config, defaultTempo: e.target.value })}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ConfiguracoesInvestimentos;
