import React from 'react';
import HomeNavBar from '../components/HomeNavBar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

export default function Ferramentas() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-[#0096fd]">
      <HomeNavBar />
      <div className="container mx-auto px-4 py-12 min-h-[60vh] flex-1 w-full">
        <h1 className="text-4xl font-bold text-center mb-10 text-primary animate-fade-in">Ferramentas da Plataforma</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-background rounded-lg p-8 shadow-md flex flex-col items-center animate-slide-up" style={{animationDelay: '0.1s', animationFillMode: 'both'}}>
            <h2 className="text-2xl font-semibold mb-2">Gestão de Orçamento</h2>
            <p className="text-gray-500 mb-4 text-center">Defina limites de gastos, acompanhe receitas e despesas em tempo real, visualize gráficos e relatórios do seu orçamento mensal.</p>
            <Link to="/app" className="w-full flex justify-center mt-auto">
              <Button variant="secondary" className="w-full font-semibold">Acessar</Button>
            </Link>
          </div>
          <div className="bg-background rounded-lg p-8 shadow-md flex flex-col items-center animate-slide-up" style={{animationDelay: '0.2s', animationFillMode: 'both'}}>
            <h2 className="text-2xl font-semibold mb-2">Metas Financeiras</h2>
            <p className="text-gray-500 mb-4 text-center">Crie, edite e monitore metas para alcançar seus sonhos financeiros, com acompanhamento de progresso e dicas personalizadas.</p>
            <Button variant="secondary" className="mt-auto" disabled>Em breve</Button>
          </div>
          <div className="bg-background rounded-lg p-8 shadow-md flex flex-col items-center animate-slide-up" style={{animationDelay: '0.3s', animationFillMode: 'both'}}>
            <h2 className="text-2xl font-semibold mb-2">Simulador de Investimentos</h2>
            <p className="text-gray-500 mb-4 text-center">Simule diferentes cenários de investimento, compare rentabilidades e acompanhe seus rendimentos ao longo do tempo.</p>
            <Button variant="secondary" className="mt-auto" disabled>Em breve</Button>
          </div>
        </div>
        <div className="mt-16 text-center animate-fade-in" style={{animationDelay: '0.4s', animationFillMode: 'both'}}>
          <h3 className="text-xl font-bold mb-2 text-primary">Mais ferramentas em breve!</h3>
          <p className="text-gray-400">Estamos trabalhando para trazer novas funcionalidades como integração bancária, relatórios personalizados, exportação de dados e muito mais.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
