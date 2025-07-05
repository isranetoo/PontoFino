
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { EyeIcon, EyeOffIcon, MailIcon, LockIcon, UserIcon, CheckIcon, ArrowRightIcon } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user types
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Nome é obrigatório';
    if (!formData.email) return 'Email é obrigatório';
    if (formData.password.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
    if (formData.password !== formData.confirmPassword) return 'Senhas não coincidem';
    if (!acceptTerms) return 'Você deve aceitar os termos de uso';
    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    
    const { error } = await supabase.auth.signUp({ 
      email: formData.email, 
      password: formData.password,
      options: {
        data: {
          name: formData.name
        }
      }
    });
    
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Cadastro realizado! Verifique seu email para confirmar.');
      // Redireciona para a página de origem, se houver, senão para '/'
      const from = location.state?.from?.pathname || '/';
      // Se veio da rota App.jsx (catch-all /*), redireciona para /app
      if (from === '/*' || from === '/' || from === '/login' || from === '/register') {
        navigate('/app', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
    
    setIsLoading(false);
  };

  const passwordStrength = (password) => {
    if (password.length === 0) return { score: 0, text: '', color: '' };
    if (password.length < 6) return { score: 1, text: 'Fraca', color: 'text-red-400' };
    if (password.length < 8) return { score: 2, text: 'Média', color: 'text-yellow-400' };
    if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) return { score: 3, text: 'Forte', color: 'text-green-400' };
    return { score: 2, text: 'Média', color: 'text-yellow-400' };
  };

  const strength = passwordStrength(formData.password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-[#0096fd] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        <Card className="p-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl">
          {/* Logo and Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 p-3 rounded-full shadow-xl mx-auto w-fit">
                <img 
                  src="/assets/PontoFino_Logo.png" 
                  alt="PontoFino Logo" 
                  className="w-16 h-16" 
                />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">
              Crie sua conta
            </h1>
            <p className="text-blue-100">
              Registre-se para começar a gerenciar suas finanças.
            </p>
          </motion.div>

          {/* Register Form */}
          <motion.form
            onSubmit={handleRegister}
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white font-medium">
                Nome completo
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-blue-300" />
                </div>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white font-medium">
                Email
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MailIcon className="h-5 w-5 text-blue-300" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white font-medium">
                Senha
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon className="h-5 w-5 text-blue-300" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-300 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {/* Password Strength */}
              {formData.password && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 bg-white/10 rounded-full h-2">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        strength.score === 1 ? 'bg-red-400 w-1/3' :
                        strength.score === 2 ? 'bg-yellow-400 w-2/3' :
                        strength.score === 3 ? 'bg-green-400 w-full' : 'w-0'
                      }`}
                    ></div>
                  </div>
                  <span className={`text-sm ${strength.color}`}>{strength.text}</span>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white font-medium">
                Confirmar senha
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon className="h-5 w-5 text-blue-300" />
                </div>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-300 hover:text-white"
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className="flex items-center gap-2 mt-1">
                  {formData.password === formData.confirmPassword ? (
                    <div className="flex items-center text-green-400 text-sm">
                      <CheckIcon className="h-4 w-4 mr-1" />
                      Senhas coincidem
                    </div>
                  ) : (
                    <div className="text-red-400 text-sm">
                      Senhas não coincidem
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="terms" className="text-blue-100 text-sm cursor-pointer">
                Eu aceito os{' '}
                <Link to="/terms" className="text-blue-300 hover:text-white underline">
                  Termos de Uso
                </Link>{' '}
                e a{' '}
                <Link to="/privacy" className="text-blue-300 hover:text-white underline">
                  Política de Privacidade
                </Link>
              </Label>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-sm"
              >
                {success}
              </motion.div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !acceptTerms}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white py-3 rounded-lg font-semibold shadow-xl transition-all duration-300 inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Criar conta
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </motion.form>

          {/* Login Link */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <p className="text-blue-100">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="text-blue-300 hover:text-white font-semibold transition-colors"
              >
                Faça login aqui
              </Link>
            </p>
          </motion.div>
        </Card>

        {/* Back to Home */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          <Link
            to="/"
            className="text-blue-200 hover:text-white transition-colors inline-flex items-center"
          >
            ← Voltar para a página inicial
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
