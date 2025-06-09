
import React from 'react';
import HomeNavBar from '../components/HomeNavBar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

const tools = [
  {
    title: 'Gestão de Orçamento',
    route: '/orcamento',
    icon: (
      <svg className="w-8 h-8 md:w-12 md:h-12 text-blue-400 mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 10h18M9 16h6M12 6v10" /></svg>
    ),
    desc: 'Defina limites de gastos, acompanhe receitas e despesas em tempo real, visualize gráficos e relatórios do seu orçamento mensal.',
    action: (
      <Link to="/app" className="w-full flex justify-center mt-auto">
        <Button variant="secondary" className="w-full font-semibold">Acessar</Button>
      </Link>
    ),
    available: true,
    delay: 0.1,
  },
  {
    title: 'Metas Financeiras',
    icon: (
      <svg className="w-8 h-8 md:w-12 md:h-12 text-green-400 mb-3 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 19V5m7 7H5" /></svg>
    ),
    desc: 'Crie, edite e monitore metas para alcançar seus sonhos financeiros, com acompanhamento de progresso e dicas personalizadas.',
    action: <Button variant="secondary" className="mt-auto" disabled>Em breve</Button>,
    available: false,
    delay: 0.2,
  },
  {
    title: 'Simulador de Investimentos',
    route: '/simulador-investimentos',
    icon: (
      <svg className="w-8 h-8 md:w-12 md:h-12 text-yellow-400 mb-3 animate-spin-slow" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
    ),
    desc: 'Simule diferentes cenários de investimento, compare rentabilidades e acompanhe seus rendimentos ao longo do tempo.',
    action: (
      <Link to="/simulador-investimentos" className="w-full flex justify-center mt-auto">
        <Button variant="secondary" className="w-full font-semibold">Acessar</Button>
      </Link>
    ),
    available: true,
    delay: 0.3,
  },
];

export default function Ferramentas() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-[#0096fd] relative overflow-hidden">
      {/* Floating blobs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <svg className="absolute left-10 top-10 animate-float-slow opacity-20" width="120" height="120" fill="none" viewBox="0 0 120 120"><circle cx="60" cy="60" r="60" fill="#00b6fc" /></svg>
        <svg className="absolute right-10 bottom-10 animate-float-slow opacity-10" width="160" height="160" fill="none" viewBox="0 0 160 160"><rect width="160" height="160" rx="40" fill="#fff" /></svg>
      </div>
      <HomeNavBar />
      <div className="container mx-auto px-4 py-12 min-h-[60vh] flex-1 w-full relative z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-12 animate-slide-up drop-shadow-lg" style={{ color: 'white' }}>Ferramentas da Plataforma</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-10">
          {tools.map((tool, idx) => (
            <div
              key={tool.title}
              className={`bg-background rounded-2xl p-6 sm:p-8 md:p-10 shadow-2xl flex flex-col items-center border border-white/10 relative overflow-hidden animate-slide-up transition-all duration-300 group ${tool.available ? 'hover:scale-105 hover:shadow-blue-400/30' : 'opacity-70 grayscale'}`}
              style={{animationDelay: `${tool.delay}s`, animationFillMode: 'both'}}
            >
              {/* Decorative blob */}
              <svg className="absolute -top-8 -right-8 w-24 h-24 opacity-10 group-hover:opacity-20 transition-opacity duration-300" fill="#00b6fc" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" /></svg>
              <span className="drop-shadow-lg">{tool.icon}</span>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 group-hover:text-blue-300 transition-colors duration-200 text-center">{tool.title}</h2>
              <p className="text-gray-400 mb-4 sm:mb-6 text-center text-sm sm:text-base">{tool.desc}</p>
              {tool.action}
              {!tool.available && (
                <span className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow">Em breve</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-16 text-center animate-fade-in" style={{animationDelay: '0.4s', animationFillMode: 'both'}}>
          <h3 className="text-xl font-bold mb-2 animate-slide-up" style={{ color: 'white' }}>Mais ferramentas em breve!</h3>
          <p className="text-gray-200 animate-fade-in">Estamos trabalhando para trazer novas funcionalidades como integração bancária, relatórios personalizados, exportação de dados e muito mais.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
