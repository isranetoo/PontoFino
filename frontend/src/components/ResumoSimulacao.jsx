import React from "react";

const ResumoSimulacao = ({ form }) => (
  <div className="mb-6 grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
    <div className="flex flex-col">
      <span className="text-sm text-gray-500">Valor Inicial:</span>
      <span className="font-semibold">
        R$ {form.valor_inicial.toLocaleString("pt-BR")}
      </span>
    </div>
    <div className="flex flex-col">
      <span className="text-sm text-gray-500">Aporte Mensal:</span>
      <span className="font-semibold">
        R$ {form.aporte_mensal.toLocaleString("pt-BR")}
      </span>
    </div>
    <div className="flex flex-col">
      <span className="text-sm text-gray-500">Taxa de Juros Mensal:</span>
      <span className="font-semibold">
        {form.taxa_juros_mensal}% ao mês
      </span>
    </div>
    <div className="flex flex-col">
      <span className="text-sm text-gray-500">Meta Final:</span>
      <span className="font-semibold">
        R$ {form.meta_final.toLocaleString("pt-BR")}
      </span>
    </div>
  </div>
);

export default ResumoSimulacao;
