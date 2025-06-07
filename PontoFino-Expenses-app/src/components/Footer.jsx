
import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#00a4fd] py-12 mt-auto overflow-hidden animate-fade-in">
      {/* Floating shapes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <svg className="absolute left-10 top-0 animate-float-slow opacity-20" width="100" height="100" fill="none" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#00b6fc" /></svg>
        <svg className="absolute right-10 bottom-0 animate-float-slow opacity-10" width="120" height="120" fill="none" viewBox="0 0 120 120"><rect width="120" height="120" rx="30" fill="#fff" /></svg>
      </div>
      <div className="relative z-10 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 sm:gap-4">
          {/* Company Info */}
          <div className="mb-8 md:mb-0 text-center md:text-left animate-slide-up">
            <img src="/assets/PontoFino_Logo.png" alt="Logo PontoFino" className="h-14 w-14 mx-auto md:mx-0 mb-2 drop-shadow-xl animate-fade-in" style={{animationDelay: '0.1s', animationFillMode: 'both'}} />
            <h3 className="text-2xl font-extrabold mb-2 bg-gradient-to-r from-[#00b6fc] via-[#00a4fd] to-[#0096fd] bg-clip-text text-transparent animate-slide-up">PontoFino</h3>
            <p className="mb-2 text-gray-200 animate-fade-in" style={{animationDelay: '0.2s', animationFillMode: 'both'}}>Seu parceiro de investimentos</p>
            <p className="text-sm text-gray-400 mt-4 animate-fade-in" style={{animationDelay: '0.3s', animationFillMode: 'both'}}>CNPJ: 12.345.678/0001-90</p>
          </div>
          {/* Contact Info */}
          <div className="mb-8 md:mb-0 text-center md:text-left animate-slide-up" style={{animationDelay: '0.15s', animationFillMode: 'both'}}>
            <h3 className="text-lg font-bold mb-4 text-blue-200 animate-fade-in">Contato</h3>
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center justify-center md:justify-start mb-2 animate-fade-in" style={{animationDelay: '0.2s', animationFillMode: 'both'}}>
                <FaEnvelope className="mr-2 text-blue-300 " />
                <a href="mailto:contato@pontofino.com.br" className="hover:text-blue-300 break-all transition-colors duration-200">contato@pontofino.com</a>
              </div>
              <div className="flex items-center justify-center md:justify-start mb-2 animate-fade-in" style={{animationDelay: '0.25s', animationFillMode: 'both'}}>
                <FaPhone className="mr-2 text-green-300 animate-pulse" />
                <a href="tel:+551140028922" className="hover:text-blue-300 transition-colors duration-200">(11) 4002-8922</a>
              </div>
              <div className="flex items-start justify-center md:justify-start mb-2 animate-fade-in" style={{animationDelay: '0.3s', animationFillMode: 'both'}}>
                <FaMapMarkerAlt className="mr-2 mt-1 text-pink-300 animate-float-slow" />
                <p>Av. Paulista, 1000, São Paulo - SP<br />CEP: 01310-100</p>
              </div>
            </div>
          </div>
          {/* Social Media */}
          <div className="text-center md:text-left animate-slide-up" style={{animationDelay: '0.2s', animationFillMode: 'both'}}>
            <h3 className="text-lg font-bold mb-4 text-yellow-200 animate-fade-in">Redes Sociais</h3>
            <div className="flex justify-center md:justify-start space-x-6">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:scale-125 hover:text-blue-400 transition-all duration-300 " style={{animationDelay: '0.25s', animationFillMode: 'both'}}>
                <FaFacebook size={28} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:scale-125 hover:text-blue-400 transition-all duration-300 " style={{animationDelay: '0.3s', animationFillMode: 'both'}}>
                <FaTwitter size={28} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:scale-125 hover:text-pink-400 transition-all duration-300 " style={{animationDelay: '0.35s', animationFillMode: 'both'}}>
                <FaInstagram size={28} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:scale-125 hover:text-blue-400 transition-all duration-300 " style={{animationDelay: '0.4s', animationFillMode: 'both'}}>
                <FaLinkedin size={28} />
              </a>
            </div>
            <div className="mt-6 flex justify-center md:justify-start animate-fade-in" style={{animationDelay: '0.5s', animationFillMode: 'both'}}>
              <span className="inline-block px-4 py-2 rounded-full bg-white/10 text-xs text-white tracking-widest animate-pulse shadow-lg">#InvistaNoFuturo</span>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-10 pt-6 text-center text-sm text-gray-300 animate-fade-in" style={{animationDelay: '0.6s', animationFillMode: 'both'}}>
          <p>&copy; {new Date().getFullYear()} <span className="font-bold text-blue-200">PontoFino</span>. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
