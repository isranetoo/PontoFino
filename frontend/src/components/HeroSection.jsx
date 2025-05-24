import React from "react";

const HeroSection = () => (
  <section className="w-full py-12 bg-gradient-to-r from-blue-900 via-blue-600 to-blue-500 text-white flex flex-col items-center justify-center mb-8 rounded-b-lg shadow-lg">
    <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 text-center">
      Potencialize seus investimentos com as nossas ferramentas
    </h1>
    <p className="text-lg sm:text-xl mb-6 text-center max-w-2xl">
      Facilitamos a análise de ativos, tornando suas decisões de investimento mais simples e otimizando o potencial de retorno.
    </p>
    <form className="w-full max-w-2xl mb-8 flex items-center justify-center">
      <input
        type="text"
        placeholder="Pesquise por fundos, ações, FII, título público e mais"
        className="w-full px-4 py-3 rounded-l bg-white text-blue-900 placeholder-blue-400 focus:outline-none"
      />
      <button
        type="submit"
        className="px-6 py-3 bg-blue-700 text-white font-semibold rounded-r hover:bg-blue-800 transition"
      >
        Pesquisar
      </button>
    </form>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8 w-full max-w-4xl">
      <div className="flex flex-col items-center bg-white bg-opacity-10 rounded-lg p-4 shadow">
        <span className="text-xs bg-green-600 px-2 py-0.5 rounded-full mb-2">Novo</span>
        <span className="font-semibold text-lg">Gerenciador</span>
        <span className="text-sm">de Carteira</span>
      </div>
      <div className="flex flex-col items-center bg-white bg-opacity-10 rounded-lg p-4 shadow">
        <span className="font-semibold text-lg">Comparador</span>
        <span className="text-sm">de Ativos</span>
      </div>
      <div className="flex flex-col items-center bg-white bg-opacity-10 rounded-lg p-4 shadow">
        <span className="font-semibold text-lg">Comparador</span>
        <span className="text-sm">de Fundos</span>
      </div>
      <div className="flex flex-col items-center bg-white bg-opacity-10 rounded-lg p-4 shadow">
        <span className="font-semibold text-lg">Simulador de</span>
        <span className="text-sm">Carteira</span>
      </div>
    </div>
    <a
      href="#simulador"
      className="bg-white text-blue-700 font-semibold px-8 py-3 rounded shadow hover:bg-blue-100 transition"
    >
      Comece a Simular
    </a>
  </section>
);

export default HeroSection;
