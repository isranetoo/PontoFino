import React from "react";

const InfoExtraSimulacaoBox = () => (
  <div
    className="mt-8 lg:mt-0 bg-white p-8 rounded shadow-md max-w-5xl text-gray-800 w-full flex flex-col items-center justify-center min-h-[300px] lg:min-h-[150px] overflow-x-auto"
    style={{ marginTop: "25px" }}
  >
    {/* Novo conteúdo criado do zero */}
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Informações Extras da Simulação</h2>
      <ul className="list-disc pl-5 text-left">
        <li>Prazo estimado: <span className="font-semibold">24 meses</span></li>
        <li>Taxa de juros: <span className="font-semibold">1,5% a.m.</span></li>
        <li>Valor total financiado: <span className="font-semibold">R$ 10.000,00</span></li>
        <li>Parcelas mensais: <span className="font-semibold">R$ 480,00</span></li>
      </ul>
      <p className="mt-6 text-sm text-gray-500">Estes valores são apenas uma simulação e podem variar conforme análise de crédito.</p>
    </div>
  </div>
);

export default InfoExtraSimulacaoBox;
