import { useEffect, useState } from 'react';

// Define the TypeScript interface matching our Backend
interface Job {
  id: number;
  companyName: string;
  title: string;
  description: string;
  salaryRange: string;
  isRemoteIndia: boolean;
  isPremium: boolean;
  applyUrl: string;
}

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from our custom Node.js backend
    fetch('http://localhost:5000/api/jobs')
      .then((res) => res.json())
      .then((data) => {
        setJobs(data);
        setLoading(false);
      })
      .catch((err) => console.error("Failed to fetch jobs:", err));
  }, []);

  return (
    <div className="min-h-screen p-8 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">CareerBridge</h1>
          <p className="text-lg text-slate-500 mt-2">Exclusive Remote & Async Roles for India-based Engineers</p>
        </header>

        {/* Job Feed */}
        {loading ? (
          <div className="text-center text-slate-500 font-medium">Loading jobs...</div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div 
                key={job.id} 
                className={`p-6 rounded-xl border bg-white shadow-sm transition-all hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 
                  ${job.isPremium ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-200'}`}
              >
                <div>
                  {job.isPremium && (
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-md mb-2">
                      Featured
                    </span>
                  )}
                  <h2 className="text-xl font-bold text-slate-900">{job.title}</h2>
                  <div className="flex items-center gap-3 text-sm text-slate-500 mt-1 font-medium">
                    <span className="text-slate-700">{job.companyName}</span>
                    <span>•</span>
                    <span>{job.salaryRange}</span>
                    <span>•</span>
                    <span>{job.isRemoteIndia ? 'Remote (India)' : 'Remote'}</span>
                  </div>
                  <p className="mt-3 text-slate-600 text-sm whitespace-pre-line leading-relaxed">
                    {job.description}
                  </p>
                </div>
                
                <a 
                  href={job.applyUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="shrink-0 px-6 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors text-center"
                >
                  Apply Now
                </a>
              </div>
            ))}
          </div>
        )}
        
      </div>
    </div>
  );
}

export default App;