import React, { useState } from 'react'
import { useAuthContext } from '../../contexts/AuthContext'
import { TrendingUp, Mail, Lock, Eye, EyeOff, User } from 'lucide-react'


export function LoginForm() {
  const { signIn, signUp } = useAuthContext();
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error } = isLogin
        ? await signIn(email, password)
        : await signUp(email, password, fullName);
      if (error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
          setError('Erro de conexão. Verifique se o Supabase está configurado corretamente.');
        } else {
          setError(error.message);
        }
      }
    } catch (err) {
      setError('Erro de conexão com o servidor. Verifique sua configuração do Supabase.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-[#0096fd] p-4">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-xl shadow-xl p-8 backdrop-blur-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4">
            <img src="/assets/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">PontoFino</h1>
          <p className="text-blue-200">
            {isLogin ? 'Entre na sua conta' : 'Crie sua conta gratuita'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-2">Nome Completo</label>
              <div className="relative">
                <User className="w-5 h-5 text-blue-300 absolute left-3 top-3" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/10 rounded-lg text-white placeholder-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                  placeholder="Seu nome completo"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-blue-100 mb-2">E-mail</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-blue-300 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/10 rounded-lg text-white placeholder-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-100 mb-2">Senha</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-blue-300 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/10 rounded-lg text-white placeholder-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-blue-300 hover:text-blue-100"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-400/30 text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
          >
            {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-300 hover:text-white font-medium transition-colors"
            >
              {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}