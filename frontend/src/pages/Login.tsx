import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CareerBridgeIcon from '../components/CareerBridgeIcon';
import apiClient from '../api/axios';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [sessionMsg, setSessionMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const msg = sessionStorage.getItem('auth_redirect_msg');
    if (msg) {
      setSessionMsg(msg);
      sessionStorage.removeItem('auth_redirect_msg');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {

      const res = await apiClient.post('/auth/login', { email, password });
     
      login(res.data.token);
      navigate('/jobs');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] p-4 font-sans">
      

      <Link to="/" className="flex items-center space-x-3 mb-8 cursor-pointer hover:opacity-80 transition-opacity">
        <div className="w-12 h-12 bg-[#D1F55C] rounded-xl flex items-center justify-center shadow-lg shadow-[#D1F55C]/20">
          <CareerBridgeIcon size={26} className="text-[#1B1E16]" />
        </div>
        <span className="text-2xl font-black tracking-tight text-gray-900">CareerBridge</span>
      </Link>


      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-500 font-medium">Sign in to continue to your account.</p>
        </div>

        {sessionMsg && (
          <div className="bg-amber-50 text-amber-700 p-4 rounded-xl text-sm font-semibold mb-4 border border-amber-200 flex items-center gap-2">
            <span>⏱</span> {sessionMsg}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700">Email address</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-11 py-3.5 focus:outline-none focus:border-[#1B1E16] focus:ring-1 focus:ring-[#1B1E16] transition-all font-medium"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-700">Password</label>
              <a href="#" className="text-sm font-bold text-indigo-600 hover:underline">Forgot password?</a>
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-11 py-3.5 focus:outline-none focus:border-[#1B1E16] focus:ring-1 focus:ring-[#1B1E16] transition-all font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#1B1E16] hover:bg-black text-[#D1F55C] font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-70 mt-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-[#D1F55C]" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-500 font-medium mt-8 text-sm">
          Don't have an account? <Link to="/register" className="text-[#1B1E16] font-bold hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
