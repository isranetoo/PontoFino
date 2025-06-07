import React from 'react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function HomeNavBar() {
  const { user, loading, signOut } = useAuth();
  return (
    <nav className="w-full bg-gradient-to-r from-[#00b6fc] via-[#00a4fd] to-[#0096fd] shadow-lg py-4 mb-8">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/assets/PontoFino_Logo.png" alt="Logo" className="h-10 w-10" />
          <span className="text-2xl font-bold text-white tracking-tight">PontoFino</span>
        </Link>
        <div className="hidden md:flex gap-8 items-center">
          <Link to="/" className="text-white hover:text-blue-200 font-medium transition-colors">Home</Link>
          <a href="#sobre" className="text-white hover:text-blue-200 font-medium transition-colors">Sobre</a>
          <Link to="/ferramentas" className="text-white hover:text-blue-200 font-medium transition-colors">Ferramentas</Link>
          <a href="#projetos" className="text-white hover:text-blue-200 font-medium transition-colors">Projetos Futuros</a>
        </div>
        <div className="flex gap-2">
          {loading ? null : user ? (
            <>
              <span className="text-white font-medium mr-2 hidden sm:inline">Olá, {user.email}</span>
              <Button variant="outline" className="font-semibold" onClick={signOut}>Sair</Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="secondary" className="font-semibold">Entrar</Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" className="font-semibold">Cadastrar</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
