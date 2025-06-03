import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Componente para proteger rotas privadas
export function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Componente para mostrar info do usuário logado e botão de logout
export function UserInfo() {
  const { user, signOut } = useAuth();
  if (!user) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">{user.email}</span>
      <button onClick={signOut} className="bg-red-500 text-white rounded px-2 py-1 text-xs">Sair</button>
    </div>
  );
}
