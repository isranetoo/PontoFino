import { useState } from "react";
import { simularInvestimento } from "./api/api";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  const [form, setForm] = useState({
    valor_inicial: 100000,
    aporte_mensal: 1000,
    taxa_juros_mensal: 1,
    meta_final: 1000000,
  });

  const [resultado, setResultado] = useState({
    anos: 10,
    meses: 5,
    tabela: [
      { ano: 1, valor: 120000 },
      { ano: 2, valor: 150000 },
      { ano: 3, valor: 200000 },
    ],
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: parseFloat(e.target.value) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dados = { ...form, taxa_juros_mensal: form.taxa_juros_mensal / 100 };
    const res = await simularInvestimento(dados);
    setResultado(res);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="p-8 bg-gradient-to-r from-blue-900 via-blue-600 to-blue-500 flex-1">
        <Navbar />
        <h1 className="text-3xl font-extrabold mb-6 text-center text-white">Simulador de Investimento</h1>
        <div className="flex flex-col lg:flex-row lg:space-x-8 items-start justify-center">
          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-8 px-12 rounded shadow-md max-w-3xl text-gray-800 w-full">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Inicial (R$)</label>
              <input
                name="valor_inicial"
                type="number"
                placeholder="R$ Valor Inicial"
                value={form.valor_inicial}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aporte Mensal (R$)</label>
              <input
                name="aporte_mensal"
                type="number"
                placeholder="R$ Aporte Mensal"
                value={form.aporte_mensal}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Taxa de Juros (% ao mês)</label>
              <input
                name="taxa_juros_mensal"
                type="number"
                placeholder="Juros (% ao mês)"
                value={form.taxa_juros_mensal}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Final (R$)</label>
              <input
                name="meta_final"
                type="number"
                placeholder="R$ Meta Final"
                value={form.meta_final}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-blue-900 via-blue-600 to-blue-500 text-white py-3 rounded hover:opacity-90 transition-opacity">
              Simular
            </button>
          </form>

          {resultado && (
            <div className="mt-8 lg:mt-0 bg-white p-8 px-12 rounded shadow-md max-w-5xl text-gray-800 w-full">
              <h2 className="text-2xl font-semibold mb-4 text-center">
                Tempo para meta: {resultado.anos} anos e {resultado.meses} meses
              </h2>
              
              <div className="mb-6 grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Valor Inicial:</span>
                  <span className="font-semibold">R$ {form.valor_inicial.toLocaleString("pt-BR")}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Aporte Mensal:</span>
                  <span className="font-semibold">R$ {form.aporte_mensal.toLocaleString("pt-BR")}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Taxa de Juros Mensal:</span>
                  <span className="font-semibold">{form.taxa_juros_mensal}% ao mês</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Meta Final:</span>
                  <span className="font-semibold">R$ {form.meta_final.toLocaleString("pt-BR")}</span>
                </div>
              </div>
              
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
                  {resultado.tabela.map((linha, i) => (
                    <tr key={i} className="hover:bg-gray-100">
                      <td className="border border-gray-300 p-3">{linha.ano}</td>
                      <td className="border border-gray-300 p-3">R$ {linha.valor.toLocaleString("pt-BR")}</td>
                      <td className="border border-gray-300 p-3">R$ {(form.aporte_mensal * 12).toLocaleString("pt-BR")}</td>
                      <td className="border border-gray-300 p-3">
                        {i > 0 
                          ? `R$ ${(linha.valor - resultado.tabela[i-1].valor - form.aporte_mensal * 12).toLocaleString("pt-BR")}`
                          : `R$ ${(linha.valor - form.valor_inicial - form.aporte_mensal * 12).toLocaleString("pt-BR")}`
                        }
                      </td>
                      <td className="border border-gray-300 p-3">
                        {((linha.valor / form.meta_final) * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
