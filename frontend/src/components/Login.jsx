import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2, Sparkles } from 'lucide-react';

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

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch(`${apiUrl}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
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

  return (
    <div className="flex h-screen w-full bg-[#05070a] text-white overflow-hidden font-sans">
      
      {/* LEFT SIDE: Video Section */}
      <div className="hidden lg:flex relative w-1/2 h-full bg-[#0a0f18] overflow-hidden">
        {/* Video Element */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen"
          poster="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2874&auto=format&fit=crop"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-network-connection-background-27898-large.mp4" type="video/mp4" />
          <source src="/login-video.mp4" type="video/mp4" />
        </video>
        
        {/* Blending Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#05070a]/40 to-[#05070a]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-emerald-500/10 mix-blend-overlay"></div>

        {/* Content Overlay */}
        <div className="relative z-10 p-16 flex flex-col justify-end h-full w-full">
          <div className="mb-8 inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md w-fit shadow-lg">
            <Sparkles size={16} className="text-emerald-400 mr-2" />
            <span className="text-sm font-medium tracking-wide text-gray-200">IDR Enterprise AI</span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            Supercharge your workflow with <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">intelligent automation.</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
            Join thousands of professionals using our advanced AI to analyze, create, and optimize their daily tasks in real-time. Experience the future of work.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative bg-[#05070a]">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="z-10 p-8 sm:p-12 max-w-md w-full mx-4 flex flex-col">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-400 to-blue-500 p-[2px] mb-8 shadow-[0_0_30px_rgba(16,185,129,0.2)] transform hover:rotate-3 transition-all duration-300">
            <div className="w-full h-full bg-[#0d131f] rounded-2xl flex items-center justify-center">
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">IDR</span>
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight text-white">
            {isRegister ? 'Create an account' : 'Welcome back'}
          </h1>
          <p className="text-gray-400 text-sm mb-10">
            {isRegister 
              ? 'Enter your details below to create your account and get started.'
              : 'Enter your credentials to access your account.'}
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
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-[#0d131f] border border-gray-800 text-white text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 block pl-11 p-4 transition-all outline-none placeholder-gray-600 hover:border-gray-700 shadow-inner"
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
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full bg-[#0d131f] border border-gray-800 text-white text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 block pl-11 p-4 transition-all outline-none placeholder-gray-600 hover:border-gray-700 shadow-inner"
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
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full bg-[#0d131f] border border-gray-800 text-white text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 block pl-11 p-4 transition-all outline-none placeholder-gray-600 hover:border-gray-700 shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black hover:bg-gray-100 font-semibold py-4 px-4 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-[0_0_20px_rgba(255,255,255,0.1)] flex justify-center items-center group disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-2"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight size={18} className="ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </>
              )}
            </button>
          </form>

          <div className="w-full flex items-center justify-between mb-8">
            <div className="w-full h-[1px] bg-gray-800"></div>
            <span className="px-4 text-xs text-gray-500 uppercase tracking-widest font-medium whitespace-nowrap">Or continue with</span>
            <div className="w-full h-[1px] bg-gray-800"></div>
          </div>
          
          <div className="w-full flex justify-center transform hover:scale-[1.01] transition-transform duration-200">
            <div className="w-full overflow-hidden rounded-xl border border-gray-800 shadow-sm">
               <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login Failed')}
                useOneTap
                theme="filled_black"
                shape="rectangular"
                size="large"
                context="signin"
                text="continue_with"
              />
            </div>
          </div>

          <div className="mt-10 text-center text-sm text-gray-400">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }} 
              className="text-white hover:text-emerald-400 font-semibold transition-colors focus:outline-none underline decoration-gray-700 underline-offset-4 hover:decoration-emerald-400"
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
