import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Star, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [aiData, setAiData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [userProfile, setUserProfile] = useState("Software Developer based in India focused on backend engineering. Tech stack: Node.js, Express.js, Next.js. Experience with Neon PostgreSQL, Drizzle ORM, microservices architecture, and building event-driven AI workflow orchestrators.");

  useEffect(() => {
    axios.get(`http://localhost:5000/api/jobs/${id}`).then(res => setJob(res.data));
  }, [id]);

  const runAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await axios.post(`http://localhost:5000/api/jobs/${id}/analyze`, { userProfile });
      setAiData(res.data.analysis);
    } catch (error) {
      console.error("Failed to analyze", error);
    }
    setIsAnalyzing(false);
  };


  const formatJobDescription = (text: string) => {
    if (!text) return '';
    const txt = document.createElement("textarea");
    txt.innerHTML = text;
    let formatted = txt.value;
    

    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    
    return formatted;
  };

  if (!job) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Loading position details...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-32 pt-10 font-sans">
      <div className="max-w-6xl mx-auto px-6">
        

        <div className="mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl shrink-0 shadow-sm">
                {job.companyName ? job.companyName.substring(0, 2).toUpperCase() : 'CO'}
              </div>
              
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                  {job.companyName}
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span className="text-gray-400">Growing Team</span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4 leading-tight">
                  {job.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-2.5">
                  {job.isFeatured && (
                    <span className="px-3 py-1 bg-[#c2e434]/20 border border-[#c2e434]/50 text-[#6a7d18] text-xs font-bold rounded-md">Featured</span>
                  )}
                  {job.isRemote && (
                    <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-md">Remote</span>
                  )}
                  {job.fresherOk && (
                    <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold rounded-md">Fresher OK</span>
                  )}
                  <span className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-md">{job.location || 'Anywhere'}</span>
                  <span className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-md">Full-time</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0 w-full md:w-auto mt-4 md:mt-0">
              <div className="text-right mb-6 hidden md:block">
                <div className="text-2xl font-black text-gray-900">{job.salaryRange || 'Not Disclosed'}</div>
                <div className="text-xs text-gray-400 font-medium mt-1">Posted Recently</div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={(e) => {
                    if (!isAuthenticated) {
                      e.preventDefault();
                      setShowAuthModal(true); // Show modal if logged out
                    } else {
                      window.open(job.applyUrl, '_blank', 'noopener,noreferrer'); // Open link if logged in
                    }
                  }}
                  className="flex-1 md:flex-none text-center bg-[#c2e434] text-[#1B1E16] px-8 py-3 rounded-xl font-bold hover:bg-[#b0d02b] transition-colors shadow-sm"
                >
                  Apply now
                </button>
                <button className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors shadow-sm bg-white">
                  <Star className="w-4 h-4" />
                  Save role
                </button>
              </div>
            </div>
          </div>
        </div>


        <div className="grid grid-cols-2 gap-6 py-6 border-y border-gray-200 mb-10">
          <div className="px-4 border-l-2 border-transparent md:border-none">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Experience</div>
            <div className="font-bold text-gray-900 text-[15px]">{job.experience || 'Not Specified'}</div>
            <div className="text-[11px] text-gray-500 mt-1">{job.fresherOk ? 'Freshers welcome' : 'Prior experience preferred'}</div>
          </div>
          <div className="px-4 border-l border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Work Mode</div>
            <div className="font-bold text-gray-900 text-[15px]">{job.isRemote ? 'Remote' : 'Hybrid / On-site'}</div>
            <div className="text-[11px] text-gray-500 mt-1">{job.location || 'Flexible timezone'}</div>
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
          
          <div className="space-y-12">
            

            {!aiData && (
              <div className="bg-white p-8 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -mr-20 -mt-20 pointer-events-none"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold mb-3 text-sm tracking-wide uppercase">
                    <Sparkles className="w-4 h-4" />
                    CareerBridge AI Scanner
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Summarize this role</h3>
                  <p className="text-gray-500 text-[15px] mb-6 leading-relaxed">
                    Review your profile below and let AI extract the actual tech stack, requirements, and calculate your exact match percentage.
                  </p>
                  <textarea 
                    className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 mb-4 outline-none resize-y"
                    rows={3}
                    value={userProfile}
                    onChange={(e) => setUserProfile(e.target.value)}
                  />
                  <button 
                    onClick={(e) => {
                      if (!isAuthenticated) {
                        e.preventDefault();
                        setShowAuthModal(true); // Show modal if logged out
                      } else {
                        runAiAnalysis(); // Run AI if logged in
                      }
                    }}
                    disabled={isAnalyzing}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-70 flex items-center gap-2 shadow-sm"
                  >
                    {isAnalyzing ? 'Analyzing Match...' : 'Generate Smart Summary'}
                  </button>
                </div>
              </div>
            )}


            {aiData && (
              <div className="space-y-8 bg-indigo-50/50 p-8 rounded-2xl border border-indigo-50">
                <div className="flex items-center gap-4 border-b border-indigo-100 pb-6">
                  <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-200">
                    {aiData.matchScore}%
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Match Score</h3>
                    <p className="text-indigo-900/70 text-sm font-medium">{aiData.matchReason}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">The TL;DR</h3>
                  <p className="text-gray-800 leading-relaxed font-medium text-[15px]">
                    {aiData.summary}
                  </p>
                </div>

                <div>
                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Required Tech Stack</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {aiData.techStack.map((tech: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-indigo-50 shadow-sm">
                        <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="text-gray-700 font-medium text-sm">{tech}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}


            <div>
              <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">About the Role</h2>
              
              <div 
                className="prose prose-gray max-w-none text-[15px] leading-relaxed text-gray-600 
                prose-headings:font-bold prose-headings:text-gray-900 prose-headings:mt-8 prose-headings:mb-4
                prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                prose-strong:font-semibold prose-strong:text-gray-900 
                prose-ul:my-4 prose-li:my-1
                prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline
                whitespace-pre-line"

                dangerouslySetInnerHTML={{ __html: formatJobDescription(job.description) }} 
              />
            </div>

          </div>

          {/* RIGHT COLUMN: Sidebar */}
          <div className="space-y-8">
            
            <div>
              <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Role Details</h2>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">Function</span>
                  <span className="font-semibold text-gray-900 text-sm">Engineering</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">Reports to</span>
                  <span className="font-semibold text-gray-900 text-sm">Hiring Manager</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">Location</span>
                  <span className="font-semibold text-gray-900 text-sm">{job.location || 'Remote'}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">Timezone</span>
                  <span className="font-semibold text-gray-900 text-sm">Flexible</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Interviews</span>
                  <span className="font-semibold text-gray-900 text-sm">Standard</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">About {job.companyName}</h2>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-bold text-gray-900 text-lg">{job.companyName}</h3>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">
                  A leading organization expanding its engineering and development teams. Dedicated to building high-quality, scalable solutions.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-semibold rounded-md border border-gray-200">Technology</span>
                  <span className="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-semibold rounded-md border border-gray-200">Software</span>
                  <span className="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-semibold rounded-md border border-gray-200">Hiring</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-in fade-in zoom-in-95 duration-200">
            

            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
              ✕
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#D1F55C] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#D1F55C]/20">
                <Star className="w-8 h-8 text-[#1B1E16] fill-[#1B1E16]" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Unlock CareerBridge</h2>
              <p className="text-gray-500 font-medium">Sign in to apply for roles, generate AI summaries, and save jobs to your board.</p>
            </div>

            <div className="space-y-4">
              <Link 
                to="/login"
                className="w-full block text-center bg-[#1B1E16] text-[#D1F55C] font-bold py-3.5 rounded-xl hover:bg-black transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/register"
                className="w-full block text-center bg-white border-2 border-gray-200 text-gray-700 font-bold py-3.5 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Create an Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
    
  );
}