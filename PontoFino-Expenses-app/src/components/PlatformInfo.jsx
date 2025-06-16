import React from 'react';

export default function PlatformInfo() {
  return (
    <section className="relative py-16 px-4 sm:px-8 md:px-16 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in" style={{animationDelay: '0.1s', animationFillMode: 'both'}}>
      {/* Glow/Blurred Background */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-400 opacity-25 rounded-full blur-3xl z-0 animate-pulse" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-400 opacity-15 rounded-full blur-3xl z-0 animate-pulse" />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 justify-between">
        {/* Ilustração/Ícone */}
        <div className="flex-1 flex justify-center items-center">
          <div className="bg-gradient-to-tr from-blue-500 via-cyan-400 to-blue-300 p-1 rounded-full shadow-xl animate-float-slow">
            <svg className="w-32 h-32 md:w-44 md:h-44" fill="none" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="65" fill="#00b6fc" opacity="0.18" />
              <circle cx="70" cy="70" r="48" fill="#fff" opacity="0.10" />
              <rect x="45" y="45" width="50" height="50" rx="14" fill="#00a4fd" opacity="0.18" />
              <g>
                <path d="M70 55v30" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
                <circle cx="70" cy="70" r="8" fill="#00b6fc" stroke="#fff" strokeWidth="3" />
                <path d="M60 80c-8-8 8-24 20-12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </g>
            </svg>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 bg-gradient-to-r from-cyan-300 via-blue-200 to-blue-100 bg-clip-text text-transparent drop-shadow-lg animate-slide-up">
            Descubra o <span className="text-blue-200">PontoFino</span>
          </h2>
          <p className="text-gray-100 text-lg sm:text-xl mb-6 max-w-2xl animate-fade-in" style={{animationDelay: '0.2s', animationFillMode: 'both'}}>
            Sua jornada financeira começa aqui! Controle gastos, defina orçamentos, alcance metas e simule investimentos com uma experiência visual moderna, intuitiva e poderosa.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl mb-6">
            <Feature icon="💡" title="Gestão Inteligente" desc="Organize despesas e receitas de forma simples e visual." />
            <Feature icon="🎯" title="Metas e Orçamentos" desc="Defina objetivos e acompanhe seu progresso em tempo real." />
            <Feature icon="📈" title="Simulação de Investimentos" desc="Planeje o futuro com ferramentas de simulação fáceis de usar." />
            <Feature icon="🔒" title="Segurança e Privacidade" desc="Seus dados protegidos com tecnologia de ponta." />
          </div>
          <a href="#register" className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold shadow-lg hover:scale-105 transition-transform " style={{animationDelay: '0.3s', animationFillMode: 'both'}}>Comece Agora</a>
        </div>
      </div>
    </section>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="flex items-center gap-3 bg-blue-800/60 rounded-xl p-4 shadow-md hover:bg-blue-700/80 transition-colors">
      <span className="text-2xl md:text-3xl">{icon}</span>
      <div>
        <div className="font-bold text-blue-100 text-base md:text-lg">{title}</div>
        <div className="text-gray-200 text-sm md:text-base">{desc}</div>
      </div>
    </div>
  );
}
