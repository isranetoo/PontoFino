import { useState } from "react";
import { simularInvestimento } from "./api/api";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import About from "./pages/About";
import TabelaResultados from "./components/TabelaResultados";
import ResumoSimulacao from "./components/ResumoSimulacao";
import AjudaSimulacao from "./components/AjudaSimulacao";
import InfoExtraSimulacao from "./components/InfoExtraSimulacao";
import InfoExtraSimulacaoBox from "./components/InfoExtraSimulacaoBox";

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
    <Router>
      <div className="flex flex-col min-h-screen">
        <div className="p-4 sm:p-8 bg-gradient-to-r from-blue-900 via-blue-600 to-blue-500 flex-1">
          <Navbar />
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <h1 className="text-3xl font-extrabold mb-6 text-center text-white">
                    Simulador de Investimento
                  </h1>
                  <div className="flex flex-col lg:flex-row lg:space-x-8 items-start justify-center gap-8 lg:gap-0">
                    <div className="flex flex-col w-full max-w-3xl">
                      <form
                        onSubmit={handleSubmit}
                        className="space-y-4 bg-white p-4 sm:p-8 sm:px-12 rounded shadow-md text-gray-800 w-full"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Valor Inicial (R$)
                          </label>
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Aporte Mensal (R$)
                          </label>
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Taxa de Juros (% ao mês)
                          </label>
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Meta Final (R$)
                          </label>
                          <input
                            name="meta_final"
                            type="number"
                            placeholder="R$ Meta Final"
                            value={form.meta_final}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-gradient-to-r from-blue-900 via-blue-600 to-blue-500 text-white py-3 rounded hover:opacity-90 transition-opacity"
                        >
                          Simular
                        </button>
                        <AjudaSimulacao />
                      </form>
                      <InfoExtraSimulacaoBox />
                    </div>
                    {resultado ? (
                      <div className="mt-8 lg:mt-0 bg-white p-4 sm:p-8 sm:px-12 rounded shadow-md max-w-5xl text-gray-800 w-full overflow-x-auto">
                        <h2 className="text-2xl font-semibold mb-4 text-center">
                          Tempo para meta: {resultado.anos} anos e{" "}
                          {resultado.meses} meses
                        </h2>
                        <ResumoSimulacao form={form} />
                        <TabelaResultados tabela={resultado.tabela} form={form} meta_final={form.meta_final} />
                        <div className="mt-8 flex flex-col items-center justify-center">
                          <span className="text-lg text-gray-500 text-center">
                            Experimente alterar os valores e simule novamente para comparar diferentes estratégias de investimento!
                          </span>
                          <span className="mt-4 text-blue-700 text-center">
                            Dica: Pequenas mudanças nos aportes ou na taxa de juros podem fazer grande diferença no longo prazo.
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-8 lg:mt-0 bg-white p-8 rounded shadow-md max-w-5xl text-gray-800 w-full flex flex-col items-center justify-center min-h-[300px]">
                        <span className="text-lg text-gray-500 text-center">
                          Preencha os dados ao lado e clique em <b>Simular</b> para ver o resultado do seu investimento!
                        </span>
                        <span className="mt-4 text-blue-700 text-center">
                          Dica: Simular diferentes cenários pode ajudar você a planejar melhor seus objetivos financeiros.
                        </span>
                      </div>
                    )}
                  </div>
                </>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
