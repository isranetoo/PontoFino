import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Cadastro realizado! Verifique seu email para confirmar.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-[#0096fd]">
      <div className="bg-white shadow-2xl rounded-3xl p-10 flex flex-col items-center w-full max-w-md">
        <img src="/assets/PontoFino_Logo.png" alt="PontoFino Logo" className="w-20 h-20 mb-4" />
        <h1 className="text-3xl font-extrabold text-blue-900 mb-2">Crie sua conta</h1>
        <p className="text-gray-500 mb-6 text-center">Registre-se para começar a gerenciar suas finanças.</p>
        <form onSubmit={handleRegister} className="flex flex-col gap-4 w-full">
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
          {success && <div className="text-green-600 text-sm text-center">{success}</div>}
          <button
            type="submit"
            className="bg-gradient-to-br from-gray-900 via-blue-900 to-[#0096fd] hover:from-blue-600 hover:to-blue-800 text-white rounded-xl p-3 font-bold shadow-md transition-all duration-200 mt-2"
          >
            Registrar
          </button>
        </form>
        <button
          className="mt-6 text-blue-600 hover:text-blue-800 underline font-medium transition-all duration-200"
          onClick={() => navigate('/login')}
        >
          Já tem conta? <span className="font-bold">Entrar</span>
        </button>
      </div>
    </div>
  );
};

export default Register;
