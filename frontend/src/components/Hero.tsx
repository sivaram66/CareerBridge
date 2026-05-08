import React from 'react';
import { Search, MapPin, CheckCircle2, ArrowUpRight, Sparkles } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom'; // <-- Added Router imports

export default function Hero() {
  const navigate = useNavigate(); // <-- Added navigation hook

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Teleport the user to the jobs page when they hit search!
    navigate('/jobs');
  };

  return (
    <div className="min-h-screen bg-[#1B1E16] flex flex-col lg:flex-row p-0 lg:p-6 lg:pr-8 gap-8 items-stretch relative">
      
      {/* Absolute Header for Login */}
      <div className="absolute top-6 right-12 z-50 hidden lg:flex items-center gap-6">
        <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Sign In</Link>
        <Link to="/register" className="bg-[#1B1E16] text-[#D1F55C] text-sm font-bold px-6 py-2 rounded-full hover:bg-black transition-colors shadow-md">
          Create Account
        </Link>
      </div>

      {/* ========================================
        LEFT SIDE: Dark Olive Background 
      ======================================== */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-6 py-16 lg:pl-16 lg:pr-8">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 mb-12">
          <div className="w-10 h-10 bg-[#D1F55C] rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#1B1E16] fill-[#1B1E16]" />
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
      ======================================== */}
      <div className="w-full lg:w-[55%] bg-white rounded-t-[3rem] lg:rounded-[3rem] shadow-2xl relative flex flex-col justify-center p-8 lg:p-12 xl:p-20 min-h-[700px]">
        
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

        {/* Floating Job Card (Mailchimp) */}
        <div className="hidden lg:flex absolute top-12 right-12 bg-white p-6 rounded-3xl shadow-[0_10px_40px_rgb(0,0,0,0.08)] border border-slate-100 w-64 z-20 hover:-translate-y-1 transition-transform flex-col items-center text-center">
          <div className="w-16 h-16 bg-[#FFD700] rounded-full mb-4 flex items-center justify-center text-slate-900 font-bold text-3xl">
            M
          </div>
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Job By</div>
          <div className="font-extrabold text-slate-900 mb-3 flex items-center justify-center gap-1 text-lg">
            Mailchimp
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xs text-slate-500 leading-relaxed px-2 font-medium">
            Mailchimp is an all-in-one Marketing Platform for small business.
          </p>
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