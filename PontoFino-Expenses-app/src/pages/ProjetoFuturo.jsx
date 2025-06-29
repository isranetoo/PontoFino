import React from 'react';
import { 
  CreditCard, 
  FileText, 
  GraduationCap, 
  Smartphone,
  Clock,
  Zap,
  Target,
  Rocket,
  Mail,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Send
} from 'lucide-react';
import HomeNavBar from '../components/HomeNavBar';
import Footer from '../components/Footer';

const ProjetoFuturo = () => {
  const projects = [
    {
      icon: CreditCard,
      title: 'Integração Bancária',
      description: 'Conecte suas contas bancárias e importe transações automaticamente, facilitando o controle financeiro sem esforço manual.',
      status: 'Em breve',
      color: 'from-blue-500 to-cyan-500',
      progress: 75
    },
    {
      icon: FileText,
      title: 'Relatórios Personalizados',
      description: 'Gere relatórios detalhados, gráficos interativos e exporte seus dados para Excel ou PDF, tornando a análise financeira simples e visual.',
      status: 'Planejado',
      color: 'from-emerald-500 to-teal-500',
      progress: 45
    },
    {
      icon: GraduationCap,
      title: 'Educação Financeira',
      description: 'Acesse dicas personalizadas, conteúdos educativos e trilhas de aprendizado para evoluir sua saúde financeira.',
      status: 'Em pesquisa',
      color: 'from-amber-500 to-orange-500',
      progress: 25
    },
    {
      icon: Smartphone,
      title: 'App Mobile',
      description: 'Tenha o PontoFino na palma da mão! Aplicativo para Android e iOS, com notificações e sincronização em tempo real.',
      status: 'Futuro',
      color: 'from-purple-500 to-pink-500',
      progress: 10
    }
  ];

  const roadmapItems = [
    { quarter: 'Q1 2025', title: 'Integração Bancária', status: 'active' },
    { quarter: 'Q2 2025', title: 'Relatórios Avançados', status: 'planned' },
    { quarter: 'Q3 2025', title: 'Educação Financeira', status: 'planned' },
    { quarter: 'Q4 2025', title: 'App Mobile', status: 'planned' }
  ];

  const features = [
    { icon: Zap, title: 'Sincronização em tempo real' },
    { icon: Target, title: 'Metas inteligentes' },
    { icon: CheckCircle, title: 'Análise preditiva' },
    { icon: Rocket, title: 'Performance otimizada' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <HomeNavBar />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20" />
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-purple-300 text-sm mb-6">
            <Rocket className="w-4 h-4" />
            Projetos Futuros
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            O futuro das suas
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> finanças começa aqui</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Descubra as inovações que estamos desenvolvendo para revolucionar sua experiência 
            financeira e tornar o controle do seu dinheiro ainda mais inteligente e eficaz.
          </p>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Nosso <span className="text-purple-400">Roadmap</span>
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Acompanhe o cronograma de lançamento das nossas próximas funcionalidades
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {roadmapItems.map((item, index) => (
              <div key={index} className="relative">
                <div className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/20 p-6 text-center ${item.status === 'active' ? 'ring-2 ring-purple-400' : ''}`}>
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full mb-4 ${item.status === 'active' ? 'bg-purple-400' : 'bg-gray-600'}`}>
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                  <h3 className="text-white font-semibold mb-2">{item.quarter}</h3>
                  <p className="text-gray-300 text-sm">{item.title}</p>
                </div>
                {index < roadmapItems.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-white/20 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projetos */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Próximas <span className="text-purple-400">Funcionalidades</span>
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Inovações que vão transformar sua experiência financeira
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project, index) => {
              const Icon = project.icon;
              return (
                <div key={index} className="group">
                  <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/20 p-8 hover:from-white/15 hover:to-white/10 transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${project.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-white font-semibold text-xl">{project.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            project.status === 'Em breve' ? 'bg-green-500/20 text-green-300' :
                            project.status === 'Planejado' ? 'bg-blue-500/20 text-blue-300' :
                            project.status === 'Em pesquisa' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-purple-500/20 text-purple-300'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        <p className="text-gray-300 leading-relaxed mb-4">{project.description}</p>
                        
                        {/* Progress Bar */}
                        <div className="mb-2">
                          <div className="flex justify-between text-sm text-gray-400 mb-1">
                            <span>Progresso</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full bg-gradient-to-r ${project.color} transition-all duration-500`}
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features em Desenvolvimento */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Recursos <span className="text-purple-400">Inovadores</span>
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Tecnologias avançadas que estamos implementando
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="group">
                  <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/20 p-6 text-center hover:from-white/15 hover:to-white/10 transition-all duration-300 hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-white font-semibold">{feature.title}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Tem uma ideia <span className="text-purple-400">incrível?</span>
            </h2>
            
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Sua sugestestão pode ser o próximo grande recurso do PontoFino! 
              Envie suas ideias e ajude-nos a construir o futuro das finanças digitais.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="mailto:contato@pontofino.com"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Enviar Sugestão
              </a>
              
              <button className="border border-white/20 hover:bg-white/10 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2">
                <Send className="w-5 h-5" />
                Feedback
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Fique por dentro das <span className="text-purple-400">novidades</span>
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Estamos sempre inovando para entregar a melhor experiência financeira. 
            Seja o primeiro a saber sobre nossos lançamentos!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Seu melhor e-mail"
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 justify-center">
              Inscrever-se
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProjetoFuturo;
