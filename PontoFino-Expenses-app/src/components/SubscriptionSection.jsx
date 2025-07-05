import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { CheckIcon, ArrowRightIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SubscriptionSection() {
  const navigate = useNavigate();

  const featuredPlan = {
    name: 'Plano Premium',
    price: 'R$ 19,90',
    period: '/mês',
    description: 'Controle total das suas finanças',
    features: [
      'Transações ilimitadas',
      'Relatórios avançados',
      'Metas financeiras',
      'Simulador de investimentos',
      'Suporte prioritário'
    ]
  };

  const handleViewAllPlans = () => {
    navigate('/subscriptions');
  };

  const handleStartFree = () => {
    navigate('/register');
  };

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Planos e Preços
        </h2>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
          Escolha o plano ideal para suas necessidades financeiras. 
          Comece gratuitamente e evolua conforme sua demanda.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Plano Gratuito */}
        <Card className="p-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">Plano Básico</h3>
            <p className="text-blue-100 mb-4">Ideal para começar</p>
            <div className="flex items-end justify-center mb-4">
              <span className="text-4xl font-bold text-white">Gratuito</span>
            </div>
          </div>

          <ul className="space-y-3 mb-8">
            <li className="flex items-center text-blue-100">
              <CheckIcon className="h-5 w-5 text-green-400 mr-3" />
              <span>Até 50 transações/mês</span>
            </li>
            <li className="flex items-center text-blue-100">
              <CheckIcon className="h-5 w-5 text-green-400 mr-3" />
              <span>Relatórios básicos</span>
            </li>
            <li className="flex items-center text-blue-100">
              <CheckIcon className="h-5 w-5 text-green-400 mr-3" />
              <span>Suporte por email</span>
            </li>
          </ul>

          <Button
            onClick={handleStartFree}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold"
          >
            Começar Grátis
          </Button>
        </Card>

        {/* Plano Premium */}
        <Card className="relative p-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl ring-2 ring-yellow-400">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-semibold">
              Mais Popular
            </span>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">{featuredPlan.name}</h3>
            <p className="text-blue-100 mb-4">{featuredPlan.description}</p>
            <div className="flex items-end justify-center mb-4">
              <span className="text-4xl font-bold text-white">{featuredPlan.price}</span>
              <span className="text-blue-100 ml-1">{featuredPlan.period}</span>
            </div>
          </div>

          <ul className="space-y-3 mb-8">
            {featuredPlan.features.map((feature, index) => (
              <li key={index} className="flex items-center text-blue-100">
                <CheckIcon className="h-5 w-5 text-green-400 mr-3" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            onClick={handleViewAllPlans}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-black py-3 rounded-lg font-semibold"
          >
            Ver Todos os Planos
          </Button>
        </Card>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-12">
        <Button
          onClick={handleViewAllPlans}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold inline-flex items-center"
        >
          Ver Todos os Planos
          <ArrowRightIcon className="ml-2 h-5 w-5" />
        </Button>
      </div>

      {/* Features Highlight */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckIcon className="h-8 w-8 text-white" />
          </div>
          <h4 className="text-xl font-semibold text-white mb-2">Sem Compromisso</h4>
          <p className="text-blue-100">Cancele a qualquer momento, sem taxas ou burocracias.</p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckIcon className="h-8 w-8 text-white" />
          </div>
          <h4 className="text-xl font-semibold text-white mb-2">Teste Gratuito</h4>
          <p className="text-blue-100">7 dias grátis para experimentar todos os recursos premium.</p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckIcon className="h-8 w-8 text-white" />
          </div>
          <h4 className="text-xl font-semibold text-white mb-2">Suporte Dedicado</h4>
          <p className="text-blue-100">Equipe especializada pronta para ajudar você.</p>
        </div>
      </div>
    </section>
  );
}
