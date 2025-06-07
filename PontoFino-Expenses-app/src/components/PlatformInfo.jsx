import React from 'react';

export default function PlatformInfo() {
  return (
    <section className="mb-16 animate-fade-in" style={{animationDelay: '0.2s', animationFillMode: 'both'}}>
      <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 justify-center">
        <div className="flex-1 flex justify-center mb-4 md:mb-0">
          <svg className="w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 animate-float-slow" fill="none" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="55" fill="#00b6fc" opacity="0.15" />
            <circle cx="60" cy="60" r="40" fill="#fff" opacity="0.08" />
            <rect x="35" y="35" width="50" height="50" rx="12" fill="#00a4fd" opacity="0.12" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 sm:mb-4 animate-slide-up drop-shadow-lg" style={{ color: 'white' }}>Sobre a Plataforma</h2>
          <p className="text-gray-200 text-base sm:text-lg max-w-xs sm:max-w-3xl mx-auto animate-fade-in" style={{animationDelay: '0.3s', animationFillMode: 'both'}}>
            O <span className="font-bold text-blue-200">PontoFino</span> oferece uma solução moderna para gerenciar suas finanças pessoais, acompanhar despesas, definir orçamentos, criar e monitorar metas financeiras, além de ferramentas para simulação e acompanhamento de investimentos.
          </p>
        </div>
      </div>
    </section>
  );
}
