import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleNormalAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const endpoint = isRegister ? '/auth/register' : '/auth/login';

    try {
      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.user, data.token);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      const res = await fetch(`${apiUrl}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: tokenResponse.access_token }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.user, data.token);
      } else {
        setError(data.error || 'Google login failed.');
      }
    } catch (err) {
      setError('Network error during Google login.');
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError('Google Login Failed'),
  });

  return (
    <div className="flex h-screen w-full bg-[#05070a] text-white overflow-hidden font-sans">

      {/* LEFT SIDE: Brand Section */}
      <div className="hidden lg:flex relative w-1/2 h-full bg-[#0a0f18] overflow-hidden">
        <img
          src="/images/login-bg.jpg"
          alt="Login Background"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#05070a]/40 to-[#05070a]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-transparent to-transparent"></div>

        <div className="relative z-10 p-20 flex flex-col justify-center h-full max-w-2xl">
          <div className="flex items-center space-x-3 mb-8 bg-emerald-500/10 w-fit px-3 py-1 rounded-full border border-emerald-500/20">
            <Sparkles size={14} className="text-emerald-400" />
            <span className="text-[11px] font-bold tracking-widest text-emerald-400 uppercase">IDR Enterprise AI</span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            Supercharge your workflow with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">intelligent automation.</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
            Join thousands of professionals using our advanced AI to analyze, create, and optimize their daily tasks in real-time.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative bg-[#05070a]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="z-10 p-8 sm:p-12 max-w-md w-full mx-4 flex flex-col">
          <img
            src="/images/logo.png"
            alt="Logo"
            className="w-16 h-16 mb-8 object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          />

          <h1 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight text-white">
            {isRegister ? 'Create an account' : 'Welcome back'}
          </h1>
          <p className="text-gray-400 text-sm mb-10">
            {isRegister ? 'Enter your details below to create your account.' : 'Enter your credentials to access your account.'}
          </p>

          {error && (
            <div className="w-full bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2 animate-pulse"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleNormalAuth} className="w-full space-y-4 mb-8">
            {isRegister && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-emerald-400 transition-colors">
                  <UserIcon size={18} />
                </div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  className="w-full bg-[#111827]/50 border border-gray-800 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500/50 transition-colors placeholder-gray-600"
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-emerald-400 transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Email address"
                className="w-full bg-[#111827]/50 border border-gray-800 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500/50 transition-colors placeholder-gray-600"
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-emerald-400 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full bg-[#111827]/50 border border-gray-800 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500/50 transition-colors placeholder-gray-600"
                onChange={handleInputChange}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 group"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>{isRegister ? 'Sign Up' : 'Sign In'}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="w-full h-[1px] bg-gray-800"></div>
            <span className="px-4 text-xs text-gray-500 uppercase tracking-widest font-medium whitespace-nowrap">Or continue with</span>
            <div className="w-full h-[1px] bg-gray-800"></div>
          </div>

          {/* MODERN CUSTOM GOOGLE BUTTON */}
          <motion.button
            whileHover={{
              scale: 1.01,
              backgroundColor: "#f8f9fa",
              boxShadow: "0 0 25px rgba(66, 133, 244, 0.5)"
            }}
            whileTap={{ scale: 0.99 }}
            onClick={() => loginWithGoogle()}
            className="w-full flex items-center justify-center space-x-3 py-3 rounded-xl bg-white transition-all duration-300 group relative overflow-hidden shadow-sm"
          >
            <div className="bg-white p-1 rounded-lg">
              <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-[#3c4043]">
              Continue with Google
            </span>
          </motion.button>

          <div className="mt-10 text-center text-sm text-gray-400">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-white hover:text-emerald-400 font-semibold transition-colors focus:outline-none"
            >
              {isRegister ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
