import React from 'react';

const projects = [
  {
    icon: (
      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 10h18M9 16h6M12 6v10" /></svg>
    ),
    text: 'Integração com bancos para importação automática de transações',
  },
  {
    icon: (
      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 17h16M4 13h16M4 9h16" /></svg>
    ),
    text: 'Relatórios personalizados e exportação de dados',
  },
  {
    icon: (
      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 animate-spin-slow" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
    ),
    text: 'Ferramentas de educação financeira e dicas personalizadas',
  },
  {
    icon: (
      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-pink-400 animate-float-slow" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" /></svg>
    ),
    text: 'Aplicativo mobile para Android e iOS',
  },
];

export default function FutureProjects() {
  return (
    <section className="mb-16 animate-fade-in" style={{animationDelay: '0.4s', animationFillMode: 'both'}}>
      <h2 className="text-3xl font-extrabold mb-8 animate-slide-up drop-shadow-lg" style={{ color: 'white' }}>Projetos Futuros</h2>
      <ul
        className="flex flex-col gap-4 sm:gap-6 text-gray-200 text-base sm:text-lg max-w-2xl mx-auto animate-fade-in"
        style={{ animationDelay: '0.45s', animationFillMode: 'both' }}
      >
        {projects.map((proj, idx) => (
          <li
            key={proj.text}
            className="flex items-center gap-3 sm:gap-4 bg-background/60 rounded-lg sm:rounded-xl px-4 py-3 sm:px-6 sm:py-4 shadow-lg border border-white/10 hover:scale-105 transition-transform duration-300 animate-slide-up"
            style={{ animationDelay: `${0.5 + idx * 0.05}s`, animationFillMode: 'both' }}
          >
            <span className="flex-shrink-0">{proj.icon}</span>
            <span className="break-words">{proj.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
