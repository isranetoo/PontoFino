import React from 'react';

const tools = [
  {
    title: 'Gestão de Orçamento',
    route: '/orcamento',
    icon: (
      <svg className="w-10 h-10 text-blue-400 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 10h18M9 16h6M12 6v10" /></svg>
    ),
    desc: 'Defina limites de gastos, acompanhe receitas e despesas em tempo real.'
  },
  {
    title: 'Metas Financeiras',
    icon: (
      <svg className="w-10 h-10 text-green-400 mb-2 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 19V5m7 7H5" /></svg>
    ),
    desc: 'Crie, edite e monitore metas para alcançar seus sonhos financeiros.'
  },
  {
    title: 'Simulador de Investimentos',
    icon: (
      <svg className="w-10 h-10 text-yellow-400 mb-2 animate-spin-slow" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
    ),
    desc: 'Simule diferentes cenários de investimento e acompanhe seus rendimentos.'
  },
];

export default function ToolsSection() {
  return (
    <section className="mb-16 animate-fade-in" style={{animationDelay: '0.3s', animationFillMode: 'both'}}>
      <h2 className="text-2xl sm:text-3xl font-extrabold mb-6 sm:mb-8 animate-slide-up drop-shadow-lg" style={{ color: 'white' }}>Ferramentas Disponíveis</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
        {tools.map((tool, idx) => (
          <div
            key={tool.title}
            className="bg-background rounded-2xl p-5 sm:p-8 shadow-xl border border-white/10 hover:scale-105 transition-transform duration-300 group relative overflow-hidden animate-slide-up"
            style={{animationDelay: `${0.35 + idx * 0.05}s`, animationFillMode: 'both'}}
          >
            <div className="flex flex-col items-center">
              <span className="drop-shadow-lg">{tool.icon}</span>
              <h3 className="text-base sm:text-xl font-bold mb-1 sm:mb-2 group-hover:text-blue-300 transition-colors duration-200">{tool.title}</h3>
              <p className="text-gray-400 text-center text-sm sm:text-base">{tool.desc}</p>
            </div>
            {/* Decorative blob */}
            <svg className="absolute -top-6 -right-6 sm:-top-8 sm:-right-8 w-16 h-16 sm:w-24 sm:h-24 opacity-10 group-hover:opacity-20 transition-opacity duration-300" fill="#00b6fc" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" /></svg>
          </div>
        ))}
      </div>
    </section>
  );
}
