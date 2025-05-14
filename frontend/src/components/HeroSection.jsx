import React from "react";

const HeroSection = () => (
  <section className="w-full py-12 bg-gradient-to-r from-blue-900 via-blue-600 to-blue-500 text-white flex flex-col items-center justify-center mb-8 rounded-b-lg shadow-lg">
    <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 text-center">
      Bem-vindo ao PontoFino
    </h1>
    <p className="text-lg sm:text-xl mb-6 text-center max-w-2xl">
      Simule seus investimentos, planeje o futuro e alcance seus objetivos financeiros com facilidade.
    </p>
    <a
      href="#simulador"
      className="bg-white text-blue-700 font-semibold px-8 py-3 rounded shadow hover:bg-blue-100 transition"
    >
      Comece a Simular
    </a>
  </section>
);

export default HeroSection;
