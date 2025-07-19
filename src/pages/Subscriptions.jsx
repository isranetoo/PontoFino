import React, { useState } from 'react';
import HomeNavBar from '../components/HomeNavBar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { CheckIcon } from 'lucide-react';

export default function Subscriptions() {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      id: 'basic',
      name: 'Plano Básico',
      price: 'Gratuito',
      period: '',
      description: 'Ideal para começar a controlar suas finanças',
      features: [
        'Controle básico de gastos',
        'Até 50 transações por mês',
        'Relatórios simples',
        'Suporte por email'
      ],
      color: 'bg-gray-500',
      popular: false
    },
    {
      id: 'premium',
      name: 'Plano Premium',
      price: 'R$ 19,90',
      period: '/mês',
      description: 'Para quem quer controle total das finanças',
      features: [
        'Transações ilimitadas',
        'Categorização automática',
        'Relatórios avançados',
        'Metas financeiras',
        'Simulador de investimentos',
        'Suporte prioritário',
        'Sincronização em nuvem'
      ],
      color: 'bg-blue-600',
      popular: true
    },
    {
      id: 'business',
      name: 'Plano Empresarial',
      price: 'R$ 49,90',
      period: '/mês',
      description: 'Perfeito para pequenas empresas e empreendedores',
      features: [
        'Tudo do Plano Premium',
        'Múltiplos usuários (até 10)',
        'Controle de fluxo de caixa',
        'Relatórios empresariais',
        'API de integração',
        'Suporte 24/7',
        'Consultoria financeira mensal'
      ],
      color: 'bg-purple-600',
      popular: false
    }
  ];

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
    // Aqui você pode adicionar a lógica para processar a assinatura
    console.log(`Plano selecionado: ${planId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-[#0096fd]">
      <HomeNavBar />
      
      <div className="container mx-auto px-4 py-16 flex-1">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Escolha Seu Plano
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Selecione o plano que melhor atende às suas necessidades financeiras.
            Comece gratuitamente e evolua conforme sua demanda.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative p-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl transition-transform hover:scale-105 ${
                plan.popular ? 'ring-2 ring-yellow-400' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-semibold">
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-blue-100 mb-4">{plan.description}</p>
                <div className="flex items-end justify-center mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-blue-100 ml-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-blue-100">
                    <CheckIcon className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  plan.id === 'basic'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : plan.popular
                    ? 'bg-yellow-400 hover:bg-yellow-300 text-black'
                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                }`}
              >
                {plan.id === 'basic' ? 'Começar Grátis' : 'Assinar Agora'}
              </Button>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Perguntas Frequentes
          </h2>
          
          <div className="space-y-6">
            <Card className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
              <h3 className="text-xl font-semibold text-white mb-3">
                Posso cancelar minha assinatura a qualquer momento?
              </h3>
              <p className="text-blue-100">
                Sim, você pode cancelar sua assinatura a qualquer momento. Não há taxas de cancelamento
                e você continuará tendo acesso aos recursos premium até o final do período pago.
              </p>
            </Card>

            <Card className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
              <h3 className="text-xl font-semibold text-white mb-3">
                Existe período de teste gratuito?
              </h3>
              <p className="text-blue-100">
                O plano básico é gratuito para sempre. Para os planos Premium e Empresarial,
                oferecemos 7 dias de teste gratuito para você experimentar todos os recursos.
              </p>
            </Card>

            <Card className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
              <h3 className="text-xl font-semibold text-white mb-3">
                Como funciona o suporte técnico?
              </h3>
              <p className="text-blue-100">
                Oferecemos suporte por email para todos os planos. Usuários Premium têm suporte
                prioritário, e usuários do plano Empresarial têm acesso ao suporte 24/7.
              </p>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
