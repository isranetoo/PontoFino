import React from 'react';
import { Button } from './ui/button';
import { ArrowRightIcon, PlayIcon, SparklesIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HeroSection() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleWatchDemo = () => {
    // Aqui você pode adicionar lógica para um modal de demo ou vídeo
    console.log('Assistir demo');
  };

  return (
    <section className="py-20 sm:py-28 md:py-32 text-center">
      <div className="flex flex-col items-center max-w-6xl mx-auto">
        {/* Logo Badge */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-30"></div>
          <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 p-4 rounded-full shadow-2xl">
            <img 
              src="/assets/logo_branco.png" 
              alt="PontoFino Logo" 
              className="w-20 h-20 sm:w-28 sm:h-28" 
            />
          </div>
        </div>

        {/* Main Heading */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <SparklesIcon className="h-6 w-6 text-yellow-400" />
            <span className="text-blue-200 text-sm font-medium uppercase tracking-wider">
              Sua Jornada Financeira Começa Aqui
            </span>
            <SparklesIcon className="h-6 w-6 text-yellow-400" />
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 text-white leading-tight">
            Bem-vindo ao{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                PontoFino
              </span>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-60"></div>
            </span>
          </h1>
        </div>

        {/* Description */}
        <p className="text-lg sm:text-xl md:text-2xl mb-12 max-w-4xl text-blue-100 leading-relaxed">
          Sua plataforma completa para{' '}
          <span className="font-semibold text-white">controle financeiro</span>, 
          planejamento de metas e investimentos inteligentes.
          <br className="hidden sm:block" />
          <span className="text-blue-200 font-medium">
            Gerencie, conquiste e evolua suas finanças com facilidade e estilo.
          </span>
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Button
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:scale-105 transition-all duration-300 inline-flex items-center"
          >
            Comece Agora
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Button>
          
          <Button
            onClick={handleWatchDemo}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-xl font-semibold text-lg backdrop-blur-sm inline-flex items-center"
          >
            <PlayIcon className="mr-2 h-5 w-5" />
            Assistir Demo
          </Button>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Controle Total</h3>
            <p className="text-blue-200 text-sm">Gerencie todas suas finanças em um só lugar</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Metas Inteligentes</h3>
            <p className="text-blue-200 text-sm">Defina e alcance seus objetivos financeiros</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Investimentos</h3>
            <p className="text-blue-200 text-sm">Simule e compare diferentes investimentos</p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-blue-200">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">100% Gratuito</span>
          </div>
          
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Dados Seguros</span>
          </div>
          
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium">Fácil de Usar</span>
          </div>
        </div>
      </div>
    </section>
  );
}
