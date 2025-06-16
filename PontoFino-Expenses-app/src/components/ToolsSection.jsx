import React from 'react';

const tools = [
  {
    title: 'Gestão de Orçamento',
    route: '/orcamento',
    icon: (
      <svg className="w-16 h-16 text-blue-300 drop-shadow-2xl" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="4" fill="#0ea5e9" opacity="0.18" /><path d="M3 10h18M9 16h6M12 6v10" /></svg>
    ),
    desc: 'Defina limites de gastos, acompanhe receitas e despesas em tempo real.'
  },
  {
    title: 'Metas Financeiras',
    icon: (
      <svg className="w-16 h-16 text-green-300 drop-shadow-2xl animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#22d3ee" opacity="0.15" /><path d="M12 19V5m7 7H5" /></svg>
    ),
    desc: 'Crie, edite e monitore metas para alcançar seus sonhos financeiros.'
  },
  {
    title: 'Simulador de Investimentos',
    icon: (
      <svg className="w-16 h-16 text-yellow-300 drop-shadow-2xl animate-spin-slow" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fde68a" opacity="0.16" /><path d="M12 6v6l4 2" /></svg>
    ),
    desc: 'Simule diferentes cenários de investimento e acompanhe seus rendimentos.'
  },
];

export default function ToolsSection() {
  return (
    <section className="relative py-20 px-2 sm:px-8 md:px-20 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in" style={{animationDelay: '0.1s', animationFillMode: 'both'}}>
      {/* Fundo decorativo */}
      <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] bg-blue-400 opacity-25 rounded-full blur-3xl z-0 animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-[32rem] h-[32rem] bg-cyan-400 opacity-15 rounded-full blur-3xl z-0 animate-pulse" />

      <div className="relative z-10 flex flex-col items-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-12 bg-gradient-to-r from-cyan-300 via-blue-200 to-blue-100 bg-clip-text text-transparent drop-shadow-2xl animate-slide-up">
          Ferramentas que Potencializam Você
        </h2>
        <div className="w-full flex flex-wrap justify-center gap-10">
          {tools.map((tool, idx) => (
            <div
              key={tool.title}
              className="relative group bg-gradient-to-br from-blue-800/90 via-blue-700/90 to-blue-600/90 rounded-3xl p-10 shadow-2xl border border-white/10 hover:scale-105 hover:shadow-cyan-400/30 transition-transform duration-300 overflow-hidden animate-slide-up min-w-[270px] max-w-xs flex-1"
              style={{animationDelay: `${0.18 + idx * 0.09}s`, animationFillMode: 'both'}}
            >
              {/* Blob decorativo animado */}
              <div className="absolute -top-12 -right-12 w-36 h-36 bg-cyan-400 opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-300" />
              <div className="flex flex-col items-center text-center relative z-10">
                <span className="mb-4">{tool.icon}</span>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 group-hover:text-cyan-300 transition-colors duration-200">
                  {tool.title}
                </h3>
                <p className="text-gray-200 text-base mb-6 min-h-[48px]">{tool.desc}</p>
                {tool.route && (
                  <a href={tool.route} className="inline-block px-7 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold shadow-lg hover:scale-105 hover:bg-blue-600 transition-transform duration-200">
                    Acessar
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
