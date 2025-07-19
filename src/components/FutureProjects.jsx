import React from 'react';
import { Card } from './ui/card';
import { CreditCardIcon, FileTextIcon, GraduationCapIcon, SmartphoneIcon } from 'lucide-react';

const projects = [
  {
    icon: CreditCardIcon,
    title: 'Integração Bancária',
    text: 'Integração com bancos para importação automática de transações',
    color: 'bg-blue-500',
    status: 'Em Desenvolvimento'
  },
  {
    icon: FileTextIcon,
    title: 'Relatórios Avançados',
    text: 'Relatórios personalizados e exportação de dados',
    color: 'bg-green-500',
    status: 'Planejado'
  },
  {
    icon: GraduationCapIcon,
    title: 'Educação Financeira',
    text: 'Ferramentas de educação financeira e dicas personalizadas',
    color: 'bg-yellow-500',
    status: 'Em Análise'
  },
  {
    icon: SmartphoneIcon,
    title: 'App Mobile',
    text: 'Aplicativo mobile para Android e iOS',
    color: 'bg-purple-500',
    status: 'Próximo'
  },
];

export default function FutureProjects() {
  return (
    <section className="py-16">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          O Futuro é <span className="text-blue-300">Agora</span>
        </h2>
        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
          Descubra as inovações que vão transformar sua experiência financeira. 
          Estamos preparando novidades incríveis para você ir além!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {projects.map((project, index) => (
          <Card
            key={index}
            className="group p-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
          >
            <div className="flex flex-col items-center text-center">
              {/* Status Badge */}
              <div className="mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  project.status === 'Em Desenvolvimento' ? 'bg-blue-500/20 text-blue-300' :
                  project.status === 'Planejado' ? 'bg-green-500/20 text-green-300' :
                  project.status === 'Em Análise' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-purple-500/20 text-purple-300'
                }`}>
                  {project.status}
                </span>
              </div>

              {/* Icon */}
              <div className={`w-20 h-20 ${project.color} rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <project.icon className="h-10 w-10 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-blue-300 transition-colors">
                {project.title}
              </h3>
              <p className="text-blue-100 leading-relaxed">
                {project.text}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Progress Timeline */}
      <div className="mt-16 max-w-4xl mx-auto">
        <Card className="p-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            Roadmap de Desenvolvimento
          </h3>
          
          <div className="space-y-6">
            {/* Timeline Item */}
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Q1 2025</span>
                  <span className="text-blue-300 text-sm">Integração Bancária</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div className="bg-blue-500 h-2 rounded-full w-3/4"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Q2 2025</span>
                  <span className="text-green-300 text-sm">Relatórios Avançados</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div className="bg-green-500 h-2 rounded-full w-1/2"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-4 h-4 bg-yellow-500 rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Q3 2025</span>
                  <span className="text-yellow-300 text-sm">Educação Financeira</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div className="bg-yellow-500 h-2 rounded-full w-1/4"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-4 h-4 bg-purple-500 rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Q4 2025</span>
                  <span className="text-purple-300 text-sm">App Mobile</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div className="bg-purple-500 h-2 rounded-full w-1/6"></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Call to Action */}
      <div className="mt-16 text-center">
        <Card className="p-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/20 rounded-2xl max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-4">
            Seja o primeiro a saber!
          </h3>
          <p className="text-blue-100 mb-6">
            Cadastre-se para receber notificações sobre novos recursos e atualizações exclusivas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <input
              type="email"
              placeholder="Seu melhor e-mail"
              className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors">
              Notificar-me
            </button>
          </div>
        </Card>
      </div>
    </section>
  );
}
