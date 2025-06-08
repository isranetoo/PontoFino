
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';


export default function HomeNavBar() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Itens do menu
  const menuItems = [
    { label: 'Home', to: '/' },
    { label: 'Sobre', href: '/sobre' },
    { label: 'Ferramentas', to: '/ferramentas' },
    { label: 'Projetos Futuros', href: '/projetos-futuros' },
  ];

  return (
    <nav className="w-full bg-gradient-to-br from-gray-900 via-[#1c2948]  to-blue-900 shadow-2xl  mb-8 z-50 relative animate-fade-in-down">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-2">
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <h1 className="flex items-center justify-center gap-3 text-2xl sm:text-3xl md:text-3xl font-bold bg-gradient-to-r from-[#00b6fc] via-[#00a4fd] to-[#0096fd] bg-clip-text text-transparent mb-2 sm:mb-4">
            <img src="/assets/PontoFino_Logo.png" alt="Logo" className="mt-2 h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16" />
            PontoFino
          </h1>
        </Link>
        {/* Menu desktop */}
        <div className="hidden md:flex gap-2 items-center rounded-lg px-2 py-1">
          {menuItems.map((item) =>
            item.to ? (
              <Link key={item.label} to={item.to} className="flex items-center px-4 py-2 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/20 shadow-md transition-all duration-150 backdrop-blur-md border border-white/10 animate-fade-in text-base">
                {item.label}
              </Link>
            ) : (
              <a key={item.label} href={item.href} className="flex items-center px-4 py-2 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/20 shadow-md transition-all duration-150 backdrop-blur-md border border-white/10 animate-fade-in text-base">
                {item.label}
              </a>
            )
          )}
        </div>
        {/* Ações de usuário desktop removidas */}
        <div className="hidden sm:flex gap-2 items-center"></div>
        {/* Menu mobile hamburguer */}
        <button
          className="md:hidden flex items-center justify-center p-3 rounded-xl text-white bg-gradient-to-r from-[#00b6fc] to-[#0096fd] shadow-lg focus:outline-none transition-all duration-200"
          style={{ minWidth: 48, minHeight: 48 }}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          <svg className={menuOpen ? 'hidden' : 'block'} width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          <svg className={menuOpen ? 'block' : 'hidden'} width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      {/* Dropdown mobile */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-[#0096fd] animate-fade-in-down shadow-2xl rounded-b-3xl border-b-4 border-blue-400 mobile-menu-hamburger">
          <div className="flex items-center justify-between px-5 pt-5 pb-2">
            <div className="flex items-center gap-2">
              <img src="/assets/PontoFino_Logo.png" alt="Logo" className="h-9 w-9 rounded-full shadow-lg " />
              <span className="text-lg font-extrabold text-white drop-shadow">PontoFino</span>
            </div>
            <button
              className="flex items-center justify-center p-2 rounded-full bg-white/20 hover:bg-white/40 transition"
              onClick={() => setMenuOpen(false)}
              aria-label="Fechar menu"
            >
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <nav className="flex flex-col gap-2 px-6 py-4 flex-1">
            {menuItems.map((item, idx) =>
              item.to ? (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl font-semibold text-lg text-white bg-white/10 hover:bg-white/20 shadow-md transition-all duration-150 backdrop-blur-md border border-white/10 mb-1 animate-fade-in"
                  style={{ animationDelay: `${0.05 * idx + 0.1}s` }}
                >
                  <span className="flex items-center justify-center bg-white/20 rounded-full p-2">
                    {/* Ícone pode ser adicionado aqui se desejar */}
                  </span>
                  <span className="drop-shadow-lg">{item.label}</span>
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl font-semibold text-lg text-white bg-white/10 hover:bg-white/20 shadow-md transition-all duration-150 backdrop-blur-md border border-white/10 mb-1 animate-fade-in"
                  style={{ animationDelay: `${0.05 * idx + 0.1}s` }}
                >
                  <span className="flex items-center justify-center bg-white/20 rounded-full p-2">
                    {/* Ícone pode ser adicionado aqui se desejar */}
                  </span>
                  <span className="drop-shadow-lg">{item.label}</span>
                </a>
              )
            )}
            {/* Botões de login/cadastro removidos do menu mobile */}
            <div className="flex flex-col gap-2 mt-6 animate-fade-in-up"></div>
          </nav>
          <div className="text-center text-xs text-white/70 pb-3 pt-2 animate-fade-in-up">© {new Date().getFullYear()} PontoFino</div>
        </div>
      )}
    </nav>
  );
}