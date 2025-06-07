import React from 'react';
import { Button } from '../components/ui/button';

export default function HeroSection() {
  return (
    <section className="relative py-20 text-center bg-gradient-to-br from-[#00b6fc] via-[#00a4fd] to-[#0096fd] text-white rounded-3xl shadow-2xl mb-12 overflow-hidden animate-fade-in">
      {/* Floating shapes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <svg className="absolute left-10 top-10 animate-pulse opacity-30" width="80" height="80" fill="none" viewBox="0 0 80 80"><circle cx="40" cy="40" r="40" fill="#fff" /></svg>
        <svg className="absolute right-10 bottom-10 opacity-20" width="60" height="60" fill="none" viewBox="0 0 60 60"><rect width="60" height="60" rx="15" fill="#fff" /></svg>
      </div>
      <div className="relative z-10 flex flex-col items-center">
        <img src="/assets/PontoFino_Logo.png" alt="Logo" className="w-20 h-20 mb-4 drop-shadow-lg animate-fade-in" style={{animationDelay: '0.1s', animationFillMode: 'both'}} />
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 animate-slide-up drop-shadow-lg">Bem-vindo ao <span className="bg-white/20 px-3 py-1 rounded-xl">PontoFino</span></h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto animate-fade-in" style={{animationDelay: '0.2s', animationFillMode: 'both'}}>
          Sua plataforma completa para <span className="font-bold text-yellow-200">controle financeiro</span>, planejamento de metas e investimentos inteligentes.
        </p>
        <Button size="lg" variant="secondary" className="text-lg font-semibold transition-transform duration-300 hover:scale-110 shadow-xl px-8 py-4" style={{animationDelay: '0.4s', animationFillMode: 'both'}}>
          <span className="inline-flex items-center gap-2">
            <svg className="w-6 h-6 animate-spin-slow" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2v2m6.364 1.636l-1.414 1.414M22 12h-2m-1.636 6.364l-1.414-1.414M12 22v-2m-6.364-1.636l1.414-1.414M2 12h2m1.636-6.364l1.414 1.414" /></svg>
            Comece Agora
          </span>
        </Button>
      </div>
    </section>
  );
}
