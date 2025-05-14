import React from "react";

const TabelaResultados = ({ tabela, form, meta_final }) => {
  return (
    <div className="max-h-[560px] overflow-y-auto">
      <table className="w-full border-collapse border border-gray-300 text-center">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-3">Ano</th>
            <th className="border border-gray-300 p-3">Valor Acumulado</th>
            <th className="border border-gray-300 p-3">Aporte Anual</th>
            <th className="border border-gray-300 p-3">Juros no Ano</th>
            <th className="border border-gray-300 p-3">% da Meta</th>
          </tr>
        </thead>
        <tbody>
          {tabela.map((linha, i) => (
            <tr key={i} className="hover:bg-gray-100">
              <td className="border border-gray-300 p-3">{linha.ano}</td>
              <td className="border border-gray-300 p-3">
                R$ {linha.valor.toLocaleString("pt-BR")}
              </td>
              <td className="border border-gray-300 p-3">
                R$ {(form.aporte_mensal * 12).toLocaleString("pt-BR")}
              </td>
              <td className="border border-gray-300 p-3">
                {i > 0
                  ? `R$ ${(linha.valor - tabela[i - 1].valor - form.aporte_mensal * 12).toLocaleString("pt-BR")}`
                  : `R$ ${(linha.valor - form.valor_inicial - form.aporte_mensal * 12).toLocaleString("pt-BR")}`}
              </td>
              <td className="border border-gray-300 p-3">
                {((linha.valor / meta_final) * 100).toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TabelaResultados;
