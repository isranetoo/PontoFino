import React from 'react';
import HomeNavBar from '../components/HomeNavBar';
import Footer from '../components/Footer';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-[#0096fd] relative overflow-hidden">
      {/* Floating blobs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <svg className="absolute left-10 top-10 animate-float-slow opacity-20" width="120" height="120" fill="none" viewBox="0 0 120 120"><circle cx="60" cy="60" r="60" fill="#00b6fc" /></svg>
        <svg className="absolute right-10 bottom-10 animate-float-slow opacity-10" width="160" height="160" fill="none" viewBox="0 0 160 160"><rect width="160" height="160" rx="40" fill="#fff" /></svg>
      </div>
      <HomeNavBar />
      <main className="container mx-auto px-4 py-16 flex-1 w-full relative z-10 flex flex-col items-center">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-center mb-6 sm:mb-8 animate-slide-up drop-shadow-lg" style={{ color: 'white' }}>Sobre o PontoFino</h1>
        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-12 w-full animate-fade-in" style={{animationDelay: '0.2s', animationFillMode: 'both'}}>
          <div className="flex-1 flex justify-center mb-4 md:mb-0">
            <svg className="w-24 h-24 sm:w-40 sm:h-40 md:w-56 md:h-56 animate-float-slow" fill="none" viewBox="0 0 180 180">
              <circle cx="90" cy="90" r="80" fill="#00b6fc" opacity="0.12" />
              <circle cx="90" cy="90" r="60" fill="#fff" opacity="0.08" />
              <rect x="50" y="50" width="80" height="80" rx="20" fill="#00a4fd" opacity="0.13" />
              <image href="/assets/PontoFino_Logo.png" x="65" y="65" height="50" width="50" />
            </svg>
          </div>
          <div className="flex-1 max-w-xs sm:max-w-2xl">
            <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-4 sm:mb-6 animate-fade-in" style={{animationDelay: '0.3s', animationFillMode: 'both'}}>
              O <span className="font-bold text-blue-200">PontoFino</span> nasceu para revolucionar a forma como você cuida do seu dinheiro. Nossa missão é tornar o controle financeiro acessível, simples e inteligente para todos.
            </p>
            <ul className="list-disc list-inside text-gray-100 text-sm sm:text-lg space-y-2 sm:space-y-3 animate-slide-up" style={{animationDelay: '0.4s', animationFillMode: 'both'}}>
              <li><span className="font-bold text-yellow-200">Gestão de Orçamento:</span> Controle receitas, despesas e visualize relatórios dinâmicos.</li>
              <li><span className="font-bold text-green-200">Metas Financeiras:</span> Crie, acompanhe e conquiste seus sonhos.</li>
              <li><span className="font-bold text-pink-200">Simulador de Investimentos:</span> Planeje o futuro com cenários realistas e comparativos.</li>
              <li><span className="font-bold text-blue-300">Segurança e Privacidade:</span> Seus dados protegidos com tecnologia de ponta.</li>
            </ul>
            <div className="mt-4 sm:mt-8 animate-fade-in" style={{animationDelay: '0.5s', animationFillMode: 'both'}}>
              <p className="text-xs sm:text-base text-gray-300">Nossa equipe é apaixonada por tecnologia, educação financeira e inovação. Estamos sempre ouvindo nossos usuários para evoluir a plataforma e entregar a melhor experiência possível.</p>
            </div>
          </div>
        </div>
        <div className="mt-10 sm:mt-16 text-center animate-fade-in" style={{animationDelay: '0.6s', animationFillMode: 'both'}}>
          <h2 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2 text-primary animate-slide-up">Junte-se ao PontoFino!</h2>
          <p className="text-gray-200 text-sm sm:text-base">Transforme sua relação com o dinheiro e alcance seus objetivos financeiros de forma leve, moderna e inteligente.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
