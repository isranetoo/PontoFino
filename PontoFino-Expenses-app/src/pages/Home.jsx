import React from 'react';
import { Button } from '../components/ui/button';
import Footer from '../components/Footer';
import HomeNavBar from '../components/HomeNavBar';

function HeroSection() {
  return (
    <section className="py-16 text-center bg-gradient-to-r from-[#00b6fc] via-[#00a4fd] to-[#0096fd] text-white rounded-lg shadow-lg mb-10">
      <h1 className="text-4xl md:text-6xl font-bold mb-4">Bem-vindo ao PontoFino</h1>
      <p className="text-lg md:text-2xl mb-6 max-w-2xl mx-auto">Sua plataforma completa para controle financeiro, planejamento de metas e investimentos inteligentes.</p>
      <Button size="lg" variant="secondary" className="text-lg font-semibold">Comece Agora</Button>
    </section>
  );
}

function PlatformInfo() {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4 text-primary">Sobre a Plataforma</h2>
      <p className="text-gray-200 text-lg max-w-3xl mx-auto">
        O PontoFino oferece uma solução moderna para gerenciar suas finanças pessoais, acompanhar despesas, definir orçamentos, criar e monitorar metas financeiras, além de ferramentas para simulação e acompanhamento de investimentos.
      </p>
    </section>
  );
}

function ToolsSection() {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4 text-primary">Ferramentas Disponíveis</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-background rounded-lg p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-2">Gestão de Orçamento</h3>
          <p className="text-gray-400">Defina limites de gastos, acompanhe receitas e despesas em tempo real.</p>
        </div>
        <div className="bg-background rounded-lg p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-2">Metas Financeiras</h3>
          <p className="text-gray-400">Crie, edite e monitore metas para alcançar seus sonhos financeiros.</p>
        </div>
        <div className="bg-background rounded-lg p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-2">Simulador de Investimentos</h3>
          <p className="text-gray-400">Simule diferentes cenários de investimento e acompanhe seus rendimentos.</p>
        </div>
      </div>
    </section>
  );
}

function FutureProjects() {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4 text-primary">Projetos Futuros</h2>
      <ul className="list-disc list-inside text-gray-200 text-lg max-w-2xl mx-auto">
        <li>Integração com bancos para importação automática de transações</li>
        <li>Relatórios personalizados e exportação de dados</li>
        <li>Ferramentas de educação financeira e dicas personalizadas</li>
        <li>Aplicativo mobile para Android e iOS</li>
      </ul>
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-[#0096fd]">
      <HomeNavBar />
      <div className="container mx-auto px-4 py-8 flex-1 w-full">
        <HeroSection />
        <PlatformInfo />
        <ToolsSection />
        <FutureProjects />
      </div>
      <Footer />
    </div>
  );
}
 