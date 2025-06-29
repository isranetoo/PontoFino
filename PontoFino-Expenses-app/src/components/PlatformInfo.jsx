import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { TrendingUpIcon, TargetIcon, ShieldCheckIcon, LightbulbIcon, ArrowRightIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PlatformInfo() {
  const navigate = useNavigate();

  const features = [
    {
      icon: LightbulbIcon,
      title: 'Gestão Inteligente',
      description: 'Organize despesas e receitas de forma simples e visual com categorização automática.'
    },
    {
      icon: TargetIcon,
      title: 'Metas e Orçamentos',
      description: 'Defina objetivos financeiros e acompanhe seu progresso em tempo real.'
    },
    {
      icon: TrendingUpIcon,
      title: 'Simulação de Investimentos',
      description: 'Planeje o futuro com ferramentas de simulação fáceis de usar e comparação de fundos.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Segurança e Privacidade',
      description: 'Seus dados protegidos com tecnologia de ponta e criptografia avançada.'
    }
  ];

  const handleStartNow = () => {
    navigate('/register');
  };

  const handleLearnMore = () => {
    navigate('/sobre');
  };

  return (
    <section className="py-16">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Descubra o <span className="text-blue-300">PontoFino</span>
        </h2>
        <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
          Sua jornada financeira começa aqui! Controle gastos, defina orçamentos, 
          alcance metas e simule investimentos com uma experiência visual moderna, 
          intuitiva e poderosa.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleStartNow}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold inline-flex items-center"
          >
            Comece Agora
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Button>
          <Button
            onClick={handleLearnMore}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3 rounded-lg font-semibold"
          >
            Saiba Mais
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="p-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300"
          >
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-blue-100 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Statistics Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-300 mb-2">10K+</div>
          <p className="text-blue-100">Usuários Ativos</p>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-green-400 mb-2">R$ 50M+</div>
          <p className="text-blue-100">Valor Gerenciado</p>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-yellow-400 mb-2">98%</div>
          <p className="text-blue-100">Satisfação</p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-16 text-center">
        <Card className="p-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/20 rounded-2xl max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-4">
            Pronto para transformar suas finanças?
          </h3>
          <p className="text-blue-100 mb-6">
            Junte-se a milhares de usuários que já estão controlando melhor suas finanças com o PontoFino.
          </p>
          <Button
            onClick={handleStartNow}
            className="bg-yellow-400 hover:bg-yellow-300 text-black px-8 py-3 rounded-lg font-semibold inline-flex items-center"
          >
            Começar Gratuitamente
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Button>
        </Card>
      </div>
    </section>
  );
}
