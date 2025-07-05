
import React from 'react';
import { Card } from './ui/card';
import { MailIcon, PhoneIcon, MapPinIcon, FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: FacebookIcon, href: 'https://facebook.com', label: 'Facebook', color: 'hover:text-blue-400' },
    { icon: TwitterIcon, href: 'https://twitter.com', label: 'Twitter', color: 'hover:text-blue-400' },
    { icon: InstagramIcon, href: 'https://instagram.com', label: 'Instagram', color: 'hover:text-pink-400' },
    { icon: LinkedinIcon, href: 'https://linkedin.com', label: 'LinkedIn', color: 'hover:text-blue-400' }
  ];

  const quickLinks = [
    { label: 'Home', to: '/' },
    { label: 'Sobre', to: '/sobre' },
    { label: 'Ferramentas', to: '/ferramentas' },
    { label: 'Planos', to: '/subscriptions' },
    { label: 'Projetos Futuros', to: '/projetos-futuros' }
  ];

  return (
    <footer className="py-16 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <img 
                src="/assets/PontoFino_Logo.png" 
                alt="PontoFino Logo" 
                className="h-12 w-12" 
              />
              <h3 className="text-2xl font-bold text-white">
                PontoFino
              </h3>
            </div>
            <p className="text-blue-100 mb-4 max-w-xs mx-auto md:mx-0">
              Sua plataforma completa para controle financeiro, planejamento de metas e investimentos inteligentes.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full text-blue-300 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Seu parceiro financeiro</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-semibold text-white mb-4">
              Links Rápidos
            </h4>
            <nav className="space-y-2">
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.to}
                  className="block text-blue-100 hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-semibold text-white mb-4">
              Contato
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <MailIcon className="h-4 w-4 text-white" />
                </div>
                <a 
                  href="mailto:contato@pontofino.com" 
                  className="text-blue-100 hover:text-white transition-colors duration-200 text-sm"
                >
                  contato@pontofino.com
                </a>
              </div>
              
              <div className="flex items-center justify-center md:justify-start gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <PhoneIcon className="h-4 w-4 text-white" />
                </div>
                <a 
                  href="tel:+551140028922" 
                  className="text-blue-100 hover:text-white transition-colors duration-200 text-sm"
                >
                  (11) 4002-8922
                </a>
              </div>
              
              <div className="flex items-start justify-center md:justify-start gap-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPinIcon className="h-4 w-4 text-white" />
                </div>
                <div className="text-blue-100 text-sm">
                  <p>Av. Paulista, 1000</p>
                  <p>São Paulo - SP</p>
                  <p>CEP: 01310-100</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media & Newsletter */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-semibold text-white mb-4">
              Conecte-se
            </h4>
            
            {/* Social Links */}
            <div className="flex justify-center md:justify-start gap-4 mb-6">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-blue-100 ${social.color} hover:scale-110 transition-all duration-300`}
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <div className="space-y-3">
              <p className="text-blue-100 text-sm">
                Receba nossas atualizações
              </p>
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
                  Inscrever-se
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <Card className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <p className="text-blue-100 text-sm">
                &copy; {currentYear} <span className="font-semibold text-white">PontoFino</span>. 
                Todos os direitos reservados.
              </p>
              <div className="flex items-center gap-4 text-xs text-blue-200">
                <span>CNPJ: 12.345.678/0001-90</span>
                <span className="hidden md:inline">•</span>
                <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full">
                  #InvistaNoFuturo
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-blue-200">
              <a href="#" className="hover:text-white transition-colors">
                Política de Privacidade
              </a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">
                Termos de Uso
              </a>
            </div>
          </div>
        </Card>
      </div>
    </footer>
  );
}

export default Footer;
