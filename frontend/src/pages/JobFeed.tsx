import { useState, useEffect } from 'react';
import axios from 'axios';


interface Job {
  id: number;
  companyName: string;
  title: string;
  description: string;
  salaryRange: string;
  applyUrl: string;
}

interface MatchResult {
  matchPercentage: number;
  reason: string;
}

export default function JobFeed() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchResults, setMatchResults] = useState<Record<number, MatchResult>>({});
  const [calculatingId, setCalculatingId] = useState<number | null>(null);


  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/jobs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJobs(response.data);
      } catch (error) {
        console.error('Failed to fetch jobs', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);


  const handleCalculateMatch = async (jobId: number) => {
    setCalculatingId(jobId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/jobs/${jobId}/match`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      

      setMatchResults(prev => ({
        ...prev,
        [jobId]: response.data
      }));
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to calculate match. Is your profile tech stack filled out?');
    } finally {
      setCalculatingId(null);
    }
  };

  if (loading) return <div className="text-white text-center mt-20">Loading jobs...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-8">Latest Remote Roles</h1>
      
      <div className="space-y-6">
        {jobs.map((job) => (
          <div key={job.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-blue-400">{job.title}</h2>
                <p className="text-slate-400 font-medium">{job.companyName} • {job.salaryRange}</p>
              </div>
              
              <a 
                href={job.applyUrl} 
                target="_blank" 
                rel="noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors"
              >
                Apply Now
              </a>
            </div>


            <div className="text-slate-300 mb-6 whitespace-pre-wrap text-sm bg-slate-900/50 p-4 rounded">
              {job.description}
            </div>


            <div className="border-t border-slate-700 pt-4 mt-4">
              {matchResults[job.id] ? (
                <div className="bg-slate-900 p-4 rounded-lg border border-blue-500/30">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="text-2xl font-bold text-blue-400">
                      {matchResults[job.id].matchPercentage}% Match
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm italic">
                    "{matchResults[job.id].reason}"
                  </p>
                </div>
              ) : (
                <button 
                  onClick={() => handleCalculateMatch(job.id)}
                  disabled={calculatingId === job.id}
                  className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white px-4 py-2 rounded font-medium transition-colors text-sm flex items-center gap-2"
                >
                  {calculatingId === job.id ? '🧠 Analyzing your stack...' : '✨ Calculate AI Match'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}