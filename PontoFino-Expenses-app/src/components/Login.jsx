
import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-white shadow-2xl rounded-3xl p-10 flex flex-col items-center w-full max-w-md"
      >
        <motion.img
          src="/assets/PontoFino_Logo.png"
          alt="PontoFino Logo"
          className="w-20 h-20 mb-4"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
        />
        <motion.h1
          className="text-3xl font-extrabold text-blue-900 mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Bem-vindo de volta!
        </motion.h1>
        <motion.p
          className="text-gray-500 mb-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Faça login para acessar sua gestão financeira.
        </motion.p>
        <motion.form
          onSubmit={handleLogin}
          className="flex flex-col gap-4 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
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
            className="bg-gradient-to-r from-[#00b6fc] via-[#00a4fd] to-[#0096fd] hover:from-blue-600 hover:to-blue-800 text-white rounded-xl p-3 font-bold shadow-md transition-all duration-200 mt-2"
          >
            Entrar
          </button>
        </motion.form>
        <motion.button
          className="mt-6 text-blue-600 hover:text-blue-800 underline font-medium transition-all duration-200"
          onClick={() => navigate('/register')}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          Não tem conta? <span className="font-bold">Registre-se</span>
        </motion.button>
      </motion.div>
      <div className="w-full mt-4">
        {/* Footer em todas as páginas */}
        <div className="max-w-md mx-auto">
          {/** Importação dinâmica para evitar erro de import recursivo se Login for importado em App.jsx **/}
          {(() => {
            const Footer = require('./Footer').default;
            return <Footer />;
          })()}
        </div>
      </div>
    </div>
  );
};

export default Login;
