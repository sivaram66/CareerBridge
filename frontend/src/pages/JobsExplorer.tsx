import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, Building, ChevronDown, Megaphone, Star } from 'lucide-react';
import apiClient from '../api/axios';
import { Link } from 'react-router-dom';

// --- PREMIUM AVATAR COMPONENT ---
const AVATAR_COLORS = [
  'bg-indigo-50 text-indigo-700 border-indigo-200',
  'bg-emerald-50 text-emerald-700 border-emerald-200',
  'bg-violet-50 text-violet-700 border-violet-200',
  'bg-amber-50 text-amber-700 border-amber-200',
  'bg-rose-50 text-rose-700 border-rose-200',
  'bg-cyan-50 text-cyan-700 border-cyan-200',
];

const CompanyAvatar = ({ logoUrl, companyName }: { logoUrl?: string | null, companyName: string }) => {
  // 1. If we have a real logo, show it
  if (logoUrl) {
    return (
      <div className="w-14 h-14 shrink-0 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-200 overflow-hidden">
        <img src={logoUrl} alt={companyName} className="w-full h-full object-contain p-1.5" />
      </div>
    );
  }

  // 2. If it's a confidential job, show a classy building icon
  if (!companyName || companyName.toLowerCase() === 'confidential') {
    return (
      <div className="w-14 h-14 shrink-0 rounded-xl bg-slate-50 flex items-center justify-center shadow-sm border border-slate-200">
        <Building className="w-6 h-6 text-slate-400" />
      </div>
    );
  }

  // 3. Otherwise, generate the premium colored monogram
  const words = companyName.trim().split(' ');
  const initials = words.length >= 2 
    ? (words[0][0] + words[1][0]).toUpperCase() 
    : companyName.substring(0, 2).toUpperCase();

  // Pick a consistent color based on the company name
  const colorIndex = companyName.length % AVATAR_COLORS.length;
  const colorClass = AVATAR_COLORS[colorIndex];

  return (
    <div className={`w-14 h-14 shrink-0 rounded-xl flex items-center justify-center shadow-sm border ${colorClass}`}>
      <span className="text-xl font-medium tracking-wide">
        {initials}
      </span>
    </div>
  );
};

// 1. UPDATED INTERFACE TO MATCH YOUR DRIZZLE SCHEMA EXACTLY
interface Job {
  id: number;
  externalJobId: string;
  companyName: string;
  title: string;
  department?: string;
  location?: string;
  isRemote: boolean;
  country?: string;
  city?: string;
  description?: string;
  applyUrl: string;
  salaryRange?: string;
  logoUrl?: string;
  fresherOk: boolean;
  isFeatured: boolean;
  createdAt?: string;
}

export default function JobsExplorer() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        console.log("📡 Sending request to backend...");
        const response = await apiClient.get('/jobs');
        
        console.log("✅ Backend replied! Raw data:", response.data);
        
        // Safely extract the data array
        const jobData = response.data.data || response.data;
        setJobs(jobData);
      } catch (error) {
        console.error("❌ Frontend Error:", error);
      } finally {
        setLoading(false); // <--- THIS is what hides the gray skeleton boxes!
      }
    };
    fetchJobs();
  }, []);

  // Helper function to easily check/uncheck boxes
  const toggleFilter = (setState: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setState((prev) => 
      prev.includes(value) 
        ? prev.filter((item) => item !== value) // Uncheck
        : [...prev, value] // Check
    );
  };

  // --- UPGRADED: ADVANCED FILTERING ENGINE ---
  const filteredJobs = jobs.filter((job) => {
    
    // 1. Location Match (Checks if the job's location string includes any selected city)
    // 1. Location Match with Aliasing
    if (selectedLocations.length > 0) {
      const jobLoc = (job.location || '').toLowerCase();
      
      const matchesLoc = selectedLocations.some(loc => {
        const searchTerm = loc.toLowerCase();
        // If they click "Remote" in the locations list, check the database boolean
        if (searchTerm === 'remote') {
          return job.isRemote === true; 
        }
        // The Bangalore/Bengaluru Alias
        if (searchTerm === 'bengaluru') {
          // If they checked Bengaluru, accept BOTH spellings
          return jobLoc.includes('bengaluru') || jobLoc.includes('bangalore');
        }
        
        // Otherwise, just do a normal check
        return jobLoc.includes(searchTerm);
      });

      if (!matchesLoc) return false;
    }

    // 2. Job Type Match (Full-time vs Internship)
    if (selectedJobTypes.length > 0) {
      const title = (job.title || '').toLowerCase();
      const isInternship = title.includes('intern'); // Instantly detects internships

      // If they want Internships, the title MUST contain "intern"
      if (selectedJobTypes.includes('Internship') && !isInternship) return false;
      
      // If they want Full-time, the title MUST NOT be an internship
      if (selectedJobTypes.includes('Full-time') && isInternship) return false;
    }

    // 3. Experience Match
    if (selectedExperience.length > 0) {
      // If they want Entry Level, the job MUST have fresherOk = true
      if (selectedExperience.includes('Entry Level') && !job.fresherOk) return false;
      // If they want Mid/Senior, the job MUST NOT be a fresher role
      if (selectedExperience.includes('Mid/Senior Level') && job.fresherOk) return false;
    }

    return true; // If it passes all active filters, show it!
  
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      
      {/* 
        ========================================
        BRANDED DARK OLIVE HEADER
        ========================================
      */}
      <div className="bg-[#1B1E16] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-8 pb-20">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-10 h-10 bg-[#D1F55C] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(209,245,92,0.15)]">
                <Megaphone className="w-5 h-5 text-[#1B1E16] fill-[#1B1E16]" />
              </div>
              <span className="text-xl font-bold tracking-tight">CareerBridge</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm font-medium text-gray-400">
              <span className="hover:text-[#D1F55C] cursor-pointer transition-colors">Find Jobs</span>
              <span className="hover:text-[#D1F55C] cursor-pointer transition-colors">Companies</span>
              <span className="hover:text-[#D1F55C] cursor-pointer transition-colors">Salaries</span>
              <div className="h-4 w-px bg-gray-700"></div>
              <button className="text-white hover:text-gray-300 transition-colors">Sign In</button>
              <button className="bg-[#D1F55C] text-[#1B1E16] font-bold px-5 py-2.5 rounded-lg hover:bg-[#bce63c] transition-colors shadow-lg shadow-[#D1F55C]/10">
                Post a Job
              </button>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Discover your next role.
          </h1>
          <p className="text-gray-400 text-lg max-w-xl font-normal leading-relaxed">
            Explore thousands of curated opportunities from top tech companies and fast-growing startups.
          </p>
        </div>
      </div>

      {/* 
        ========================================
        MAIN CONTENT CANVAS 
        ========================================
      */}
      <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 -mt-10 relative z-10 pb-24">
        
        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-200 p-1.5 flex flex-col md:flex-row items-center mb-10">
          <div className="flex-1 flex items-center px-4 py-3 md:py-2 w-full border-b md:border-b-0 md:border-r border-gray-100 group">
            <Search className="w-5 h-5 text-gray-400 mr-3 group-focus-within:text-[#1B1E16] transition-colors" />
            <input 
              type="text" 
              placeholder="Job title, keywords, or company" 
              className="w-full bg-transparent border-none focus:outline-none text-gray-900 placeholder-gray-400 text-sm font-medium"
            />
          </div>
          <div className="flex-1 flex items-center px-4 py-3 md:py-2 w-full group">
            <MapPin className="w-5 h-5 text-gray-400 mr-3 group-focus-within:text-[#1B1E16] transition-colors" />
            <input 
              type="text" 
              placeholder="City, state, or remote" 
              className="w-full bg-transparent border-none focus:outline-none text-gray-900 placeholder-gray-400 text-sm font-medium"
            />
          </div>
          <button className="w-full md:w-auto mt-2 md:mt-0 bg-[#1B1E16] hover:bg-black text-[#D1F55C] font-bold px-10 py-3 rounded-lg transition-colors text-sm">
            Search
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Sidebar Filters */}
          <div className="w-full lg:w-[240px] shrink-0 hidden lg:block">
            <h3 className="text-sm font-bold text-gray-900 tracking-tight mb-6 flex items-center justify-between">
              Filter Results
              <span className="text-xs text-gray-400 font-medium cursor-pointer hover:text-gray-900">Reset</span>
            </h3>
            
            <div className="space-y-8">
              
              {/* 1. LOCATIONS FILTER */}
              <div className="border-t border-gray-200 pt-5">
                <h4 className="font-semibold text-gray-900 mb-4 text-sm">Location</h4>
                <div className="space-y-3">
                  {["Remote","Bengaluru" ,'Mumbai', 'Pune', 'Hyderabad', 'Delhi'].map((loc) => (
                    <label key={loc} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={selectedLocations.includes(loc)}
                        onChange={() => toggleFilter(setSelectedLocations, loc)}
                        className="w-4 h-4 rounded border-gray-300 text-[#1B1E16] focus:ring-[#1B1E16] transition-colors cursor-pointer" 
                      />
                      <span className="text-gray-600 font-medium text-sm group-hover:text-gray-900">{loc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 2. TYPE OF JOBS FILTER */}
              <div className="border-t border-gray-200 pt-5">
                <h4 className="font-semibold text-gray-900 mb-4 text-sm">Employment Type</h4>
                <div className="space-y-3">
                  {/* CHANGED 'Remote' to 'Internship' HERE */}
                  {['Full-time', 'Internship'].map((type) => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={selectedJobTypes.includes(type)}
                        onChange={() => toggleFilter(setSelectedJobTypes, type)}
                        className="w-4 h-4 rounded border-gray-300 text-[#1B1E16] focus:ring-[#1B1E16] transition-colors cursor-pointer" 
                      />
                      <span className="text-gray-600 font-medium text-sm group-hover:text-gray-900">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 3. EXPERIENCE FILTER */}
              <div className="border-t border-gray-200 pt-5">
                <h4 className="font-semibold text-gray-900 mb-4 text-sm">Experience Level</h4>
                <div className="space-y-3">
                  {['Entry Level', 'Mid/Senior Level'].map((level) => (
                    <label key={level} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={selectedExperience.includes(level)}
                        onChange={() => toggleFilter(setSelectedExperience, level)}
                        className="w-4 h-4 rounded border-gray-300 text-[#1B1E16] focus:ring-[#1B1E16] transition-colors cursor-pointer" 
                      />
                      <span className="text-gray-600 font-medium text-sm group-hover:text-gray-900">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Job List Feed */}
          <div className="w-full flex-1">
            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm text-gray-500 font-medium">
                Showing <span className="text-gray-900 font-bold">{filteredJobs.length}</span> open positions
              </p>
              <div className="flex items-center gap-1 text-sm font-semibold text-gray-700 cursor-pointer hover:text-black">
                Sort by: <span className="text-black">Most relevant</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4].map((skeleton) => (
                    <div key={skeleton} className="h-24 bg-gray-50 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-gray-100 flex flex-col">
                  {filteredJobs.map((job) => {
                    
                    // 2. DATA MAPPING DIRECTLY FROM SCHEMA
                    const company = job.companyName || 'Confidential';
                    const initial = company !== 'Confidential' ? company.substring(0, 2).toUpperCase() : 'CO';
                    const isFeatured = job.isFeatured || false;
                    const isFresherOk = job.fresherOk || false;
                    const salary = job.salaryRange || "Not Disclosed";
                    const isRemote = job.isRemote || false;
                    const logo = job.logoUrl || null;

                    return (
                      <Link
                        to={`/job/${job.id}`} 
                        target="_blank" 
                        rel="noreferrer"
                        key={job.id} 
                        className="group relative flex flex-col sm:flex-row justify-between p-6 hover:bg-[#FAFAFA] transition-colors cursor-pointer overflow-hidden"
                      >
                        
                        {/* FEATURED BADGE */}
                        {isFeatured && (
                          <div className="absolute top-0 right-0 bg-[#fceba8] text-yellow-800 text-[10px] font-bold px-3 py-1.5 rounded-bl-lg uppercase tracking-widest border-b border-l border-yellow-200">
                            Featured
                          </div>
                        )}

                        {/* Left side: Avatar + Content */}
                        <div className="flex items-start gap-5">
                          
                          {/* THE NEW COMPONENT */}
                          <CompanyAvatar logoUrl={logo} companyName={company} />
                          
                          <div className="flex flex-col mt-0.5">
            
                            {/* Company Name*/}
                            <span className="text-lg font-bold text-gray-900 mb-1">
                              {company}
                            </span>
                            
                            {/* Job Title: Toned down to be clean, professional, and readable */}
                            <h3 className="text-m font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors tracking-tight mb-3">
                              {job.title}
                            </h3>
                            
                            {/* The Premium Light Pill Badges */}
                            <div className="flex flex-wrap gap-2 mt-2">
                              {isRemote && (
                                <span className="px-3 py-1 text-[11px] font-semibold tracking-wide rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm">
                                  Remote
                                </span>
                              )}
                              {isFresherOk && (
                                <span className="px-3 py-1 text-[11px] font-semibold tracking-wide rounded-full bg-blue-50 border border-blue-200 text-blue-700 shadow-sm">
                                  Fresher OK
                                </span>
                              )}
                              <span className="px-3 py-1 text-[11px] font-semibold tracking-wide rounded-full bg-slate-50 border border-slate-200 text-slate-700 shadow-sm">
                                {job.location || 'Anywhere'}
                              </span>
                              <span className="px-3 py-1 text-[11px] font-semibold tracking-wide rounded-full bg-amber-50 border border-amber-200 text-amber-700 shadow-sm">
                                Full-time
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right side: Salary, Time, & Star Button */}
                        <div className="mt-5 sm:mt-0 flex flex-col items-end justify-between shrink-0 relative z-10">
                          
                          {/* Salary & Time */}
                          <div className="text-right mt-1 sm:mt-6">
                            <div className="text-lg font-bold text-[#1B1E16] tracking-tight">
                              {salary}
                            </div>
                            <div className="text-xs text-gray-400 font-medium mt-1">
                              Recently added
                            </div>
                          </div>
                          
                          {/* Star Button (Save Job) */}
                          <button 
                            className="mt-4 p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-yellow-500 hover:border-yellow-500 hover:bg-yellow-50 transition-all bg-white"
                            onClick={(e) => {
                              e.preventDefault(); 
                              e.stopPropagation(); 
                              console.log("Saved job:", job.id);
                            }}
                          >
                            <Star className="w-4 h-4" />
                          </button>

                        </div>

                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}