import React from "react";
import InfoExtraSimulacao from "./InfoExtraSimulacao";

const AjudaSimulacao = () => (
  <>
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded text-blue-900 text-sm">
      <b>Dica:</b> Preencha os campos acima com seus dados de investimento. 
      Você pode simular diferentes cenários alterando os valores e clicando em <b>Simular</b> para ver como seu dinheiro pode crescer ao longo do tempo!
    </div>
    <InfoExtraSimulacao />
  </>
);

export default AjudaSimulacao;
