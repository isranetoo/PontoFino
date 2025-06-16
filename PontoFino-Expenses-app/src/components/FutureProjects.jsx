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
    <section className="relative py-20 px-4 sm:px-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120vw] h-64 bg-gradient-to-r from-blue-500/20 via-cyan-400/10 to-yellow-400/20 blur-2xl opacity-60 pointer-events-none" />
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        <h2 className="text-5xl sm:text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-200 to-blue-100 drop-shadow-xl animate-slide-up" style={{ letterSpacing: '2px' }}>
          O Futuro é Agora
        </h2>
        <p className="text-lg sm:text-2xl text-gray-200 mb-10 text-center max-w-2xl animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
          Descubra as inovações que vão transformar sua experiência financeira. Estamos preparando novidades incríveis para você ir além!
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
          {projects.map((proj, idx) => (
            <div
              key={proj.text}
              className="relative group bg-gradient-to-br from-blue-800/90 via-blue-700/90 to-blue-600/90 rounded-3xl p-7 flex flex-col items-center shadow-xl border border-white/10 hover:scale-[1.04] hover:shadow-cyan-400/30 transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${0.6 + idx * 0.08}s`, animationFillMode: 'both', cursor: 'pointer' }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white/10 rounded-full p-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                {proj.icon}
              </div>
              <div className="mt-10 text-center">
                <span className="block text-xl sm:text-2xl font-semibold text-gray-100 group-hover:text-cyan-200 transition-colors duration-300 drop-shadow-lg">
                  {proj.text}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
