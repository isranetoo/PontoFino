import React from 'react';
import { 
  BookOpen, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  Shield, 
  Star, 
  Users, 
  Heart, 
  Quote,
  Sparkles,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import HomeNavBar from '../components/HomeNavBar';
import Footer from '../components/Footer';

const About = () => {
  const values = [
    {
      icon: BookOpen,
      title: "Educação Financeira",
      description: "Acreditamos que o conhecimento é o primeiro passo para a independência financeira."
    },
    {
      icon: Target,
      title: "Foco em Resultados",
      description: "Ferramentas práticas e eficazes para transformar seus objetivos em realidade."
    },
    {
      icon: Shield,
      title: "Transparência Total",
      description: "Informações claras e honestas sobre investimentos e estratégias financeiras."
    },
    {
      icon: Heart,
      title: "Compromisso Humano",
      description: "Colocamos as pessoas no centro de tudo, entendendo suas necessidades únicas."
    }
  ];

  const differentials = [
    {
      icon: TrendingUp,
      title: "Análise Inteligente",
      description: "Algoritmos avançados para análise de padrões financeiros",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Lightbulb,
      title: "Insights Personalizados",
      description: "Recomendações baseadas no seu perfil e objetivos",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: Users,
      title: "Comunidade Ativa",
      description: "Rede de pessoas compartilhando experiências e dicas",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Sparkles,
      title: "Interface Moderna",
      description: "Design intuitivo e experiência de usuário excepcional",
      color: "from-emerald-500 to-teal-500"
    }
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Empreendedora",
      content: "O PontoFino transformou completamente minha relação com o dinheiro. Em 6 meses consegui organizar minhas finanças e começar a investir.",
      rating: 5
    },
    {
      name: "João Santos",
      role: "Engenheiro",
      content: "As ferramentas de simulação são incríveis! Me ajudaram a planejar minha aposentadoria de forma muito mais estratégica.",
      rating: 5
    },
    {
      name: "Ana Costa",
      role: "Professora",
      content: "Nunca pensei que gerenciar orçamento pudesse ser tão simples. A interface é muito intuitiva e os insights são valiosos.",
      rating: 5
    }
  ];

  const stats = [
    { value: "50K+", label: "Usuários ativos" },
    { value: "R$ 100M+", label: "Em investimentos" },
    { value: "98%", label: "Satisfação" },
    { value: "24/7", label: "Suporte" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <HomeNavBar />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-blue-300 text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            Nossa História
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Transformando vidas através da
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> educação financeira</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Nascemos da necessidade de democratizar o acesso à educação financeira de qualidade, 
            oferecendo ferramentas simples mas poderosas para quem quer tomar controle de sua vida financeira.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nossa Missão */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Nossa <span className="text-blue-400">Missão</span>
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Capacitar pessoas a alcançarem suas metas financeiras através de educação, 
                tecnologia e ferramentas intuitivas que tornam o planejamento financeiro 
                acessível para todos.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                Acreditamos que toda pessoa merece ter controle sobre seu futuro financeiro, 
                independente de sua situação atual ou conhecimento prévio.
              </p>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Nosso Objetivo</h3>
                    <p className="text-gray-400 text-sm">Independência financeira para todos</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {[
                    "Educação financeira acessível",
                    "Ferramentas práticas e eficazes",
                    "Comunidade de apoio",
                    "Resultados mensuráveis"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nossos Valores */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Nossos <span className="text-blue-400">Valores</span>
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Os princípios que guiam cada decisão e inovação em nossa plataforma
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="group">
                  <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/20 p-6 h-full hover:from-white/15 hover:to-white/10 transition-all duration-300 hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-white font-semibold mb-3">{value.title}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{value.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Nossos Diferenciais */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Nossos <span className="text-blue-400">Diferenciais</span>
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              O que nos torna únicos no mercado de educação financeira
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {differentials.map((differential, index) => {
              const Icon = differential.icon;
              return (
                <div key={index} className="group">
                  <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/20 p-8 hover:from-white/15 hover:to-white/10 transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${differential.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-xl mb-3">{differential.title}</h3>
                        <p className="text-gray-300 leading-relaxed">{differential.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              O que nossos <span className="text-blue-400">usuários dizem</span>
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Histórias reais de transformação financeira
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="group">
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/20 p-6 hover:from-white/15 hover:to-white/10 transition-all duration-300 hover:-translate-y-1">
                  <Quote className="w-8 h-8 text-blue-400 mb-4" />
                  <p className="text-gray-300 leading-relaxed mb-6">"{testimonial.content}"</p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-semibold">{testimonial.name}</h4>
                      <p className="text-gray-400 text-sm">{testimonial.role}</p>
                    </div>
                    
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Pronto para transformar sua
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> vida financeira?</span>
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de pessoas que já descobriram o poder da educação 
              financeira e estão construindo um futuro mais próspero.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 justify-center">
                Começar Agora
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button className="border border-white/20 hover:bg-white/10 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105">
                Saiba Mais
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
