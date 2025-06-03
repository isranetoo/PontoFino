
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      navigate('/');
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-[#0096fd]">
      <div className="bg-white shadow-2xl rounded-3xl p-10 flex flex-col items-center w-full max-w-md">
        <img src="/assets/PontoFino_Logo.png" alt="PontoFino Logo" className="w-20 h-20 mb-4" />
        <h1 className="text-3xl font-extrabold text-blue-900 mb-2">Bem-vindo de volta!</h1>
        <p className="text-gray-500 mb-6 text-center">Faça login para acessar sua gestão financeira.</p>
        <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="p-3 rounded-xl border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-black outline-none transition-all duration-200"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="p-3 rounded-xl border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-black outline-none transition-all duration-200"
            required
          />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="bg-gradient-to-br from-gray-900 via-blue-900 to-[#0096fd] hover:from-blue-600 hover:to-blue-800 text-white rounded-xl p-3 font-bold shadow-md transition-all duration-200 mt-2"
          >
            Entrar
          </button>
        </form>
        <button
          className="mt-6 text-blue-600 hover:text-blue-800 underline font-medium transition-all duration-200"
          onClick={() => navigate('/register')}
        >
          Não tem conta? <span className="font-bold">Registre-se</span>
        </button>
      </div>
    </div>
  );
};

export default Login;
