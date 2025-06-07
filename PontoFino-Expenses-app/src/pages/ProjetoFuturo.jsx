import React from 'react';
import HomeNavBar from '../components/HomeNavBar';
import Footer from '../components/Footer';

const projects = [
  {
    icon: (
      <svg className="w-10 h-10 text-blue-400 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 10h18M9 16h6M12 6v10" /></svg>
    ),
    text: 'Integração com bancos para importação automática de transações',
  },
  {
    icon: (
      <svg className="w-10 h-10 text-green-400 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 17h16M4 13h16M4 9h16" /></svg>
    ),
    text: 'Relatórios personalizados e exportação de dados',
  },
  {
    icon: (
      <svg className="w-10 h-10 text-yellow-400 animate-spin-slow" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
    ),
    text: 'Ferramentas de educação financeira e dicas personalizadas',
  },
  {
    icon: (
      <svg className="w-10 h-10 text-pink-400 animate-float-slow" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" /></svg>
    ),
    text: 'Aplicativo mobile para Android e iOS',
  },
];

export default function ProjetoFuturo() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-[#0096fd] relative overflow-hidden">
      {/* Floating blobs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <svg className="absolute left-10 top-10 animate-float-slow opacity-20" width="120" height="120" fill="none" viewBox="0 0 120 120"><circle cx="60" cy="60" r="60" fill="#00b6fc" /></svg>
        <svg className="absolute right-10 bottom-10 animate-float-slow opacity-10" width="160" height="160" fill="none" viewBox="0 0 160 160"><rect width="160" height="160" rx="40" fill="#fff" /></svg>
      </div>
      <HomeNavBar />
      <main className="container mx-auto px-4 py-16 flex-1 w-full relative z-10 flex flex-col items-center">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-center mb-6 sm:mb-8 animate-slide-up drop-shadow-lg" style={{ color: 'white' }}>Projetos Futuros</h1>
        <ul className="flex flex-col gap-4 sm:gap-8 text-gray-200 text-sm sm:text-lg max-w-xs sm:max-w-2xl mx-auto animate-fade-in w-full" style={{animationDelay: '0.3s', animationFillMode: 'both'}}>
          {projects.map((proj, idx) => (
            <li key={proj.text} className="flex items-center gap-3 sm:gap-5 bg-background/60 rounded-2xl px-4 sm:px-8 py-4 sm:py-6 shadow-xl border border-white/10 hover:scale-105 transition-transform duration-300 animate-slide-up" style={{animationDelay: `${0.4 + idx * 0.07}s`, animationFillMode: 'both'}}>
              <span>{proj.icon}</span>
              <span>{proj.text}</span>
            </li>
          ))}
        </ul>
        <div className="mt-10 sm:mt-16 text-center animate-fade-in" style={{animationDelay: '0.7s', animationFillMode: 'both'}}>
          <h2 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2 text-primary animate-slide-up">E muito mais por vir!</h2>
          <p className="text-gray-200 text-xs sm:text-base">Estamos sempre inovando para entregar a melhor experiência financeira para você. Fique ligado nas novidades!</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
