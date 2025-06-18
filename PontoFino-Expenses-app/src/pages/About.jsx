import React from 'react';
import HomeNavBar from '../components/HomeNavBar';
import Footer from '../components/Footer';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-[#0096fd] relative overflow-hidden">
      {/* Floating blobs and decorative shapes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <svg className="absolute left-10 top-10 animate-float-slow opacity-20" width="120" height="120" fill="none" viewBox="0 0 120 120"><circle cx="60" cy="60" r="60" fill="#00b6fc" /></svg>
        <svg className="absolute right-10 bottom-10 animate-float-slow opacity-10" width="160" height="160" fill="none" viewBox="0 0 160 160"><rect width="160" height="160" rx="40" fill="#fff" /></svg>
        <svg className="absolute right-1/3 top-1/4 animate-float-slow opacity-10" width="100" height="100" fill="none" viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="50" ry="30" fill="#fff" /></svg>
      </div>
      <HomeNavBar />
      <main className="container mx-auto px-4 py-16 flex-1 w-full relative z-10 flex flex-col items-center">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-center mb-6 sm:mb-10 animate-slide-up drop-shadow-lg text-white tracking-tight">Sobre o PontoFino</h1>
        {/* Nossa História */}
        <section className="w-full max-w-3xl bg-white/10 rounded-2xl shadow-lg p-6 sm:p-10 mb-10 animate-fade-in" style={{animationDelay: '0.2s', animationFillMode: 'both'}}>
          <h2 className="text-xl sm:text-2xl font-bold text-blue-200 mb-3 flex items-center gap-2"><span role="img" aria-label="história">📖</span>Nossa História</h2>
          <p className="text-gray-100 text-base sm:text-lg mb-2">Tudo começou com um sonho: tornar o controle financeiro acessível, simples e inteligente para todos. O <span className="font-bold text-blue-200">PontoFino</span> nasceu da paixão de um grupo de amigos por tecnologia e educação financeira. Vimos de perto como a falta de organização pode impactar vidas e decidimos criar uma solução moderna, intuitiva e realmente útil.</p>
          <p className="text-gray-200 text-sm">Desde então, evoluímos ouvindo nossos usuários, inovando e trazendo recursos que realmente fazem a diferença no dia a dia.</p>
        </section>
        {/* Diferenciais */}
        <section className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 animate-fade-in" style={{animationDelay: '0.3s', animationFillMode: 'both'}}>
          <div className="bg-white/10 rounded-xl p-6 flex flex-col gap-3 shadow-md">
            <h3 className="text-lg font-semibold text-yellow-200 flex items-center gap-2"><span role="img" aria-label="orçamento">💡</span>Gestão de Orçamento</h3>
            <p className="text-gray-100 text-sm">Controle receitas, despesas e visualize relatórios dinâmicos e interativos.</p>
          </div>
          <div className="bg-white/10 rounded-xl p-6 flex flex-col gap-3 shadow-md">
            <h3 className="text-lg font-semibold text-green-200 flex items-center gap-2"><span role="img" aria-label="metas">🎯</span>Metas Financeiras</h3>
            <p className="text-gray-100 text-sm">Crie, acompanhe e conquiste seus sonhos com ferramentas de acompanhamento inteligentes.</p>
          </div>
          <div className="bg-white/10 rounded-xl p-6 flex flex-col gap-3 shadow-md">
            <h3 className="text-lg font-semibold text-pink-200 flex items-center gap-2"><span role="img" aria-label="investimentos">📈</span>Simulador de Investimentos</h3>
            <p className="text-gray-100 text-sm">Planeje o futuro com cenários realistas, comparativos e dicas personalizadas.</p>
          </div>
          <div className="bg-white/10 rounded-xl p-6 flex flex-col gap-3 shadow-md">
            <h3 className="text-lg font-semibold text-blue-300 flex items-center gap-2"><span role="img" aria-label="segurança">🔒</span>Segurança e Privacidade</h3>
            <p className="text-gray-100 text-sm">Seus dados protegidos com tecnologia de ponta e criptografia avançada.</p>
          </div>
        </section>
        {/* Valores */}
        <section className="w-full max-w-3xl bg-white/10 rounded-2xl shadow-lg p-6 sm:p-10 mb-10 animate-fade-in" style={{animationDelay: '0.4s', animationFillMode: 'both'}}>
          <h2 className="text-xl sm:text-2xl font-bold text-blue-100 mb-3 flex items-center gap-2"><span role="img" aria-label="valores">🌟</span>Nossos Valores</h2>
          <ul className="list-disc list-inside text-gray-100 text-base space-y-2">
            <li><span className="font-bold text-yellow-200">Transparência:</span> Clareza em cada funcionalidade e informação.</li>
            <li><span className="font-bold text-green-200">Inovação:</span> Sempre em busca de novas soluções para facilitar sua vida financeira.</li>
            <li><span className="font-bold text-pink-200">Empatia:</span> Ouvimos nossos usuários e evoluímos juntos.</li>
            <li><span className="font-bold text-blue-300">Segurança:</span> Compromisso total com a proteção dos seus dados.</li>
          </ul>
        </section>
        {/* Depoimentos */}
        <section className="w-full max-w-4xl mb-12 animate-fade-in" style={{animationDelay: '0.5s', animationFillMode: 'both'}}>
          <h2 className="text-xl sm:text-2xl font-bold text-blue-100 mb-6 flex items-center gap-2"><span role="img" aria-label="depoimentos">💬</span>O que dizem nossos usuários</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-xl p-5 shadow-md flex flex-col gap-2">
              <p className="text-gray-100 italic">“O PontoFino mudou minha relação com o dinheiro. Hoje consigo planejar e realizar meus sonhos!”</p>
              <span className="text-blue-200 font-semibold text-sm">— Ana, 28 anos</span>
            </div>
            <div className="bg-white/10 rounded-xl p-5 shadow-md flex flex-col gap-2">
              <p className="text-gray-100 italic">“Simples, intuitivo e seguro. Recomendo para todos que querem ter mais controle financeiro.”</p>
              <span className="text-green-200 font-semibold text-sm">— Carlos, 35 anos</span>
            </div>
            <div className="bg-white/10 rounded-xl p-5 shadow-md flex flex-col gap-2">
              <p className="text-gray-100 italic">“Acompanhar meus investimentos nunca foi tão fácil. A plataforma é incrível!”</p>
              <span className="text-pink-200 font-semibold text-sm">— Juliana, 41 anos</span>
            </div>
            <div className="bg-white/10 rounded-xl p-5 shadow-md flex flex-col gap-2">
              <p className="text-gray-100 italic">“Adoro as dicas e o suporte da equipe. Sinto que realmente se importam com os usuários.”</p>
              <span className="text-yellow-200 font-semibold text-sm">— Rafael, 23 anos</span>
            </div>
          </div>
        </section>
        {/* CTA */}
        <div className="mt-6 sm:mt-10 text-center animate-fade-in" style={{animationDelay: '0.6s', animationFillMode: 'both'}}>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white animate-slide-up">Junte-se ao PontoFino!</h2>
          <p className="text-gray-200 text-base sm:text-lg mb-6">Transforme sua relação com o dinheiro e alcance seus objetivos financeiros de forma leve, moderna e inteligente.</p>
          <a href="/register" className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-200 text-lg">Experimente Grátis</a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
