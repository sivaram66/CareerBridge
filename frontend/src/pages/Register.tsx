import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, KeyRound, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CareerBridgeIcon from '../components/CareerBridgeIcon';
import apiClient from '../api/axios';


export default function Register() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  

  const [step, setStep] = useState<1 | 2>(1); // Step 1: Register, Step 2: Verify OTP
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {

      await apiClient.post('/auth/register', { email, password });
      

      setStep(2); 
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {

      const res = await apiClient.post('/auth/verify-otp', { email, otp });
      

      login(res.data.token);
      

      navigate(-1); 
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid or expired code. Please try again.');
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

      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 border border-gray-100 relative overflow-hidden">
        

        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Create an account</h2>
              <p className="text-gray-500 font-medium">Join CareerBridge to unlock premium features.</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold mb-6 border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
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
                <label className="text-sm font-bold text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-11 py-3.5 focus:outline-none focus:border-[#1B1E16] focus:ring-1 focus:ring-[#1B1E16] transition-all font-medium"
                    placeholder="Create a strong password"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-11 py-3.5 focus:outline-none focus:border-[#1B1E16] focus:ring-1 focus:ring-[#1B1E16] transition-all font-medium"
                    placeholder="Repeat your password"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#1B1E16] hover:bg-black text-[#D1F55C] font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-70 mt-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-[#D1F55C]" /> : 'Continue'}
              </button>
            </form>

            <p className="text-center text-gray-500 font-medium mt-8 text-sm">
              Already have an account? <Link to="/login" className="text-[#1B1E16] font-bold hover:underline">Sign in</Link>
            </p>
          </div>
        )}


        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-200">
                <KeyRound className="w-8 h-8 text-gray-900" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-500 font-medium leading-relaxed">
                We sent a 6-digit verification code to <br/>
                <span className="font-bold text-gray-900">{email}</span>
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold mb-6 border border-red-100 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <input 
                  type="text" 
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-4 text-center text-3xl font-black tracking-[0.5em] focus:outline-none focus:border-[#1B1E16] focus:ring-1 focus:ring-[#1B1E16] transition-all"
                  placeholder="000000"
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-[#1B1E16] hover:bg-black text-[#D1F55C] font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-70 disabled:hover:bg-[#1B1E16]"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-[#D1F55C]" /> : (
                  <>Verify & Continue <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>

            <button 
              onClick={() => setStep(1)} 
              className="w-full mt-6 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Wrong email address? Go back
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
