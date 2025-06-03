import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

const Investments = () => {
  return (
    <Card className="glassmorphism card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-200">
          Investimentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-gray-400 text-base mb-4">
          Esta funcionalidade de investimentos está sendo desenvolvida e está em progresso. Em breve você poderá simular investimentos, acompanhar projeções e ver rankings de fundos aqui!
        </div>
        <form className="flex flex-col gap-2 max-w-sm" onSubmit={e => { e.preventDefault(); alert('Você será notificado quando a ferramenta estiver disponível!'); }}>
          <label htmlFor="email" className="text-gray-300">Deseja ser notificado quando estiver disponível?</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="Seu e-mail"
            className="rounded px-3 py-2 bg-gray-800 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-[#00b6fc] via-[#00a4fd] to-[#0096fd] hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Quero ser notificado
          </button>
        </form>
        {/* Adicione aqui gráficos, simuladores ou ranking de fundos futuramente */}
      </CardContent>
    </Card>
  );
};

export default Investments;
