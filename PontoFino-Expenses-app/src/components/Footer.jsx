
import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';


function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-10 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-8 sm:gap-4">
          {/* Company Info */}
          <div className="mb-8 md:mb-0 text-center md:text-left">
            <img src="/assets/PontoFino_Logo.png" alt="Logo PontoFino" className="h-12 w-12 mx-auto md:mx-0 mb-2" />
            <h3 className="text-xl font-bold mb-2">PontoFino</h3>
            <p className="mb-2">Seu parceiro de investimentos</p>
            <p className="text-sm text-gray-400 mt-4">CNPJ: 12.345.678/0001-90</p>
          </div>
          {/* Contact Info */}
          <div className="mb-8 md:mb-0 text-center md:text-left">
            <h3 className="text-lg font-bold mb-4">Contato</h3>
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center justify-center md:justify-start mb-2">
                <FaEnvelope className="mr-2" />
                <a href="mailto:contato@pontofino.com.br" className="hover:text-blue-300 break-all">contato@pontofino.com.br</a>
              </div>
              <div className="flex items-center justify-center md:justify-start mb-2">
                <FaPhone className="mr-2" />
                <a href="tel:+551140028922" className="hover:text-blue-300">(11) 4002-8922</a>
              </div>
              <div className="flex items-start justify-center md:justify-start mb-2">
                <FaMapMarkerAlt className="mr-2 mt-1" />
                <p>Av. Paulista, 1000, São Paulo - SP<br />CEP: 01310-100</p>
              </div>
            </div>
          </div>
          {/* Social Media */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold mb-4">Redes Sociais</h3>
            <div className="flex justify-center md:justify-start space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                <FaFacebook size={24} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                <FaTwitter size={24} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors">
                <FaInstagram size={24} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                <FaLinkedin size={24} />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} PontoFino. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
