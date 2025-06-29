import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { WalletIcon, TargetIcon, TrendingUpIcon, ArrowRightIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const tools = [
  {
    title: 'Gestão de Orçamento',
    route: '/orcamento',
    icon: WalletIcon,
    desc: 'Defina limites de gastos, acompanhe receitas e despesas em tempo real.',
    color: 'bg-blue-500',
    features: ['Controle de gastos', 'Categorização', 'Relatórios em tempo real']
  },
  {
    title: 'Metas Financeiras',
    route: '/orcamento/metas',
    icon: TargetIcon,
    desc: 'Crie, edite e monitore metas para alcançar seus sonhos financeiros.',
    color: 'bg-green-500',
    features: ['Definir objetivos', 'Acompanhar progresso', 'Alertas personalizados']
  },
  {
    title: 'Simulador de Investimentos',
    route: '/simulador-investimentos',
    icon: TrendingUpIcon,
    desc: 'Simule diferentes cenários de investimento e acompanhe seus rendimentos.',
    color: 'bg-yellow-500',
    features: ['Simulações avançadas', 'Comparar fundos', 'Projeções futuras']
  },
];

export default function ToolsSection() {
  const navigate = useNavigate();

  const handleToolAccess = (route) => {
    navigate(route);
  };

  return (
    <section className="py-16">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Ferramentas que <span className="text-blue-300">Potencializam</span> Você
        </h2>
        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
          Descubra nossas principais ferramentas financeiras desenvolvidas para 
          transformar a maneira como você gerencia seu dinheiro.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {tools.map((tool, index) => (
          <Card
            key={index}
            className="group p-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
          >
            <div className="flex flex-col items-center text-center h-full">
              {/* Icon */}
              <div className={`w-20 h-20 ${tool.color} rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <tool.icon className="h-10 w-10 text-white" />
              </div>

              {/* Title and Description */}
              <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-blue-300 transition-colors">
                {tool.title}
              </h3>
              <p className="text-blue-100 leading-relaxed mb-6 flex-1">
                {tool.desc}
              </p>

              {/* Features List */}
              <div className="w-full mb-6">
                <ul className="space-y-2">
                  {tool.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-blue-200">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 flex-shrink-0"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <Button
                onClick={() => handleToolAccess(tool.route)}
                className={`w-full ${
                  tool.color === 'bg-blue-500' ? 'bg-blue-600 hover:bg-blue-500' :
                  tool.color === 'bg-green-500' ? 'bg-green-600 hover:bg-green-500' :
                  'bg-yellow-600 hover:bg-yellow-500'
                } text-white py-3 rounded-lg font-semibold inline-flex items-center justify-center group-hover:scale-105 transition-transform`}
              >
                Acessar Ferramenta
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Access Section */}
      <div className="mt-16 max-w-4xl mx-auto">
        <Card className="p-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Acesso Rápido
            </h3>
            <p className="text-blue-100">
              Comece agora mesmo com nossas ferramentas mais populares
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button
              onClick={() => handleToolAccess('/orcamento/nova-transacao')}
              className="bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium"
            >
              + Nova Transação
            </Button>
            <Button
              onClick={() => handleToolAccess('/orcamento/metas')}
              className="bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-medium"
            >
              + Nova Meta
            </Button>
            <Button
              onClick={() => handleToolAccess('/simulador-investimentos')}
              className="bg-yellow-600 hover:bg-yellow-500 text-white py-3 rounded-lg font-medium"
            >
              Simular Investimento
            </Button>
          </div>
        </Card>
      </div>

      {/* Statistics */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-300 mb-2">3</div>
          <p className="text-blue-100">Ferramentas Principais</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">100%</div>
          <p className="text-blue-100">Gratuitas</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-2">24/7</div>
          <p className="text-blue-100">Disponíveis</p>
        </div>
      </div>
    </section>
  );
}
