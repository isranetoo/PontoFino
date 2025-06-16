import React from 'react';


export default function HeroSection() {
  return (
    <section className="relative py-20 sm:py-28 md:py-32 text-center bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 text-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in">
      {/* Floating shapes and blobs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <svg className="absolute left-4 top-4 sm:left-10 sm:top-10 animate-pulse opacity-30" width="70" height="70" fill="none" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#00b6fc" /></svg>
        <svg className="absolute right-4 bottom-4 sm:right-10 sm:bottom-10 opacity-20" width="60" height="60" fill="none" viewBox="0 0 100 100"><rect width="100" height="100" rx="25" fill="#00a4fd" /></svg>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-96 h-32 bg-cyan-400 opacity-10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute right-0 bottom-0 w-80 h-40 bg-blue-400 opacity-10 rounded-full blur-2xl animate-pulse" />
      </div>
      <div className="relative z-10 flex flex-col items-center">
        <div className="bg-gradient-to-tr from-blue-500 via-cyan-400 to-blue-300 p-2 rounded-full shadow-xl mb-6 animate-float-slow">
          <img src="/assets/PontoFino_Logo.png" alt="Logo" className="w-20 h-20 sm:w-28 sm:h-28 drop-shadow-2xl" />
        </div>
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-6 animate-slide-up drop-shadow-2xl bg-gradient-to-r from-cyan-300 via-blue-200 to-blue-100 bg-clip-text text-transparent">
          Bem-vindo ao <span className="inline-block bg-gradient-to-br from-blue-700 via-cyan-400 to-blue-300 px-4 py-2 rounded-2xl text-white shadow-lg ml-2">PontoFino</span>
        </h1>
        <p className="text-lg sm:text-2xl md:text-3xl mb-8 max-w-2xl mx-auto animate-fade-in text-gray-100" style={{animationDelay: '0.2s', animationFillMode: 'both'}}>
          Sua plataforma completa para <span className="font-bold text-cyan-200">controle financeiro</span>, planejamento de metas e investimentos inteligentes.<br />
          <span className="text-blue-200 font-semibold">Gerencie, conquiste e evolua suas finanças com facilidade e estilo.</span>
        </p>
        <a href="#register" className="inline-block px-10 py-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold shadow-xl hover:scale-105 transition-transform  text-lg" style={{animationDelay: '0.3s', animationFillMode: 'both'}}>Comece Agora</a>
      </div>
    </section>
  );
}
