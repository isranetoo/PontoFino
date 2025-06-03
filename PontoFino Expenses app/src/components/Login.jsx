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
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Entrar</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-3 w-80">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="p-2 rounded border"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="p-2 rounded border"
          required
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button type="submit" className="bg-primary text-white rounded p-2 font-bold">Entrar</button>
      </form>
      <button className="mt-4 text-blue-500 underline" onClick={() => navigate('/register')}>Não tem conta? Registre-se</button>
    </div>
  );
};

export default Login;
