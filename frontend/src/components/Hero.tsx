import React from 'react';
import { Search, MapPin, CheckCircle2, ArrowUpRight, Sparkles, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext';
import CareerBridgeIcon from './CareerBridgeIcon';


export default function Hero() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Teleport the user to the jobs page when they hit search!
    navigate('/jobs');
  };

  return (
    <div className="min-h-screen bg-[#1B1E16] flex flex-col lg:flex-row p-0 lg:p-6 lg:pr-8 gap-8 items-stretch relative">
      
      

      {/* ========================================
        LEFT SIDE: Dark Olive Background 
      ======================================== */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-6 py-16 lg:pl-16 lg:pr-8">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 mb-12">
          <div className="w-10 h-10 bg-[#D1F55C] rounded-full flex items-center justify-center">
            <CareerBridgeIcon size={22} className="text-[#1B1E16]" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">CareerBridge</span>
        </div>

        {/* MASSIVE Presentation Text */}
        <h1 className="text-6xl lg:text-[5.5rem] font-extrabold leading-[1.05] mb-10 tracking-tighter max-w-xl break-words">
          <span className="text-[#D1F55C]">The Premium</span> <br/>
          <span className="text-gray-300">Startup Job Board Platform</span>
        </h1>

        {/* Feature Badges */}
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div className="flex items-center space-x-2 px-5 py-3 rounded-full border border-[#D1F55C]/40 bg-transparent text-white">
            <CheckCircle2 className="w-5 h-5 text-[#D1F55C] flex-shrink-0" />
            <span className="font-medium text-sm">Remote First</span>
          </div>
          <div className="flex items-center space-x-2 px-5 py-3 rounded-full border border-[#D1F55C]/40 bg-transparent text-white">
            <CheckCircle2 className="w-5 h-5 text-[#D1F55C] flex-shrink-0" />
            <span className="font-medium text-sm">India Startups</span>
          </div>
          <div className="flex items-center space-x-2 px-5 py-3 rounded-full border border-[#D1F55C]/40 bg-transparent text-white">
            <CheckCircle2 className="w-5 h-5 text-[#D1F55C] flex-shrink-0" />
            <span className="font-medium text-sm">Fresher Friendly</span>
          </div>
          <div className="flex items-center space-x-2 px-5 py-3 rounded-full border border-[#D1F55C]/40 bg-transparent text-white">
            <CheckCircle2 className="w-5 h-5 text-[#D1F55C] flex-shrink-0" />
            <span className="font-medium text-sm">Direct to Founders</span>
          </div>
        </div>
      </div>

      {/* ========================================
        RIGHT SIDE: The Floating White App Interface 
        ========================================
      */}
      <div className="w-full lg:w-[55%] bg-white rounded-t-[3rem] lg:rounded-[3rem] shadow-2xl relative flex flex-col justify-center p-8 lg:p-12 xl:p-20 min-h-[700px]">
        
        {/* DESKTOP AUTH - Dynamic based on Login State */}
        <div className="absolute top-8 right-8 lg:top-8 lg:right-10 z-50 hidden lg:flex items-center gap-3">
          
          {token ? (
            /* --- LOGGED IN VIEW --- */
            <>
              <Link to="/jobs" className="bg-[#D1F55C] text-[#1B1E16] text-sm font-extrabold px-6 py-2.5 rounded-full hover:bg-[#c2e434] transition-all shadow-[0_0_15px_rgba(209,245,92,0.3)] hover:shadow-[0_0_20px_rgba(209,245,92,0.5)] hover:-translate-y-0.5 flex items-center gap-1.5">
                Explore Jobs <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link to="/profile" className="w-10 h-10 bg-[#1B1E16] rounded-full flex items-center justify-center text-[#D1F55C] hover:bg-black transition-all shadow-md hover:-translate-y-0.5 border border-slate-700">
                <User className="w-5 h-5" />
              </Link>
            </>
          ) : (
            /* --- LOGGED OUT VIEW --- */
            <>
              <Link to="/login" className="text-sm font-bold text-[#1B1E16] bg-slate-100 px-6 py-2.5 rounded-full hover:bg-slate-200 transition-all">
                Sign In
              </Link>
              <Link to="/register" className="bg-[#1B1E16] text-[#D1F55C] text-sm font-bold px-6 py-2.5 rounded-full hover:bg-black transition-all shadow-md hover:-translate-y-0.5">
                Create Account
              </Link>
              <Link to="/jobs" className="bg-[#D1F55C] text-[#1B1E16] text-sm font-extrabold px-6 py-2.5 rounded-full hover:bg-[#c2e434] transition-all shadow-[0_0_15px_rgba(209,245,92,0.3)] hover:shadow-[0_0_20px_rgba(209,245,92,0.5)] hover:-translate-y-0.5 flex items-center gap-1.5">
                Explore Jobs <ArrowUpRight className="w-4 h-4" />
              </Link>
            </>
          )}

        </div>

        {/* Mobile Login Links (Shows only on small screens) */}
        <div className="flex lg:hidden justify-end mb-8 gap-4">
           <Link to="/login" className="text-sm font-bold text-gray-500">Sign In</Link>
           <Link to="/register" className="text-sm font-bold text-[#1B1E16]">Create Account</Link>
        </div>

        {/* THE OVERLAPPING STAT BOX */}
        <div className="hidden lg:flex absolute top-5 -left-6 bg-[#D1F55C] rounded-[2rem] px-10 py-8 shadow-2xl z-30 transform hover:scale-105 transition-transform cursor-default flex-col items-center justify-center">
          <div className="text-6xl font-black text-[#1B1E16] tracking-tight mb-2">130+</div>
          <div className="text-[#1B1E16] font-semibold text-lg tracking-wide">Jobs in Vault</div>
        </div>

        

        {/* The Actual Content */}
        <div className="relative z-10 max-w-lg mt-10 lg:mt-0 mx-auto lg:mx-0 lg:ml-12">
          <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 mb-6 shadow-sm">
            2,886 open positions
          </div>

          <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-5 leading-[1.1]">
            Find your next <Sparkles className="inline-block w-8 h-8 text-[#FFD700] fill-[#FFD700] -mt-2 mx-1" /> <br/>
            exciting startup job
          </h2>

          <p className="text-sm lg:text-base text-slate-500 mb-8 leading-relaxed font-medium">
            Drop your resume. Let our AI parser extract your stack, experience, and instantly match you with highly-vetted startup roles.
          </p>

          {/* Form wrapper added so hitting Enter works! */}
          <form onSubmit={handleSearch} className="bg-white rounded-xl p-1.5 border border-slate-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] flex flex-col xl:flex-row items-center">
            <div className="flex-1 flex items-center px-3 py-3 xl:py-0 w-full xl:w-auto border-b xl:border-b-0 xl:border-r border-slate-100">
              <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
              <input 
                type="text" 
                placeholder="Company, Job Title..." 
                className="w-full bg-transparent border-none focus:outline-none text-slate-900 placeholder-slate-400 text-sm font-medium"
              />
            </div>

            <div className="flex-1 flex items-center px-3 py-3 xl:py-0 w-full xl:w-auto">
              <MapPin className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
              <input 
                type="text" 
                placeholder="City, State, or Country" 
                className="w-full bg-transparent border-none focus:outline-none text-slate-900 placeholder-slate-400 text-sm font-medium"
              />
            </div>

            <button type="submit" className="w-full xl:w-auto mt-2 xl:mt-0 bg-[#2A2A2A] hover:bg-black text-white font-semibold px-8 py-3 rounded-lg transition-colors flex-shrink-0 text-sm">
              Search
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}