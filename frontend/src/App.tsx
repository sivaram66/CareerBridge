import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Loader2, Server } from 'lucide-react';
import Hero from './components/Hero';
import JobsExplorer from './pages/JobsExplorer';
import JobDetails from './pages/JobDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import CareerBridgeIcon from './components/CareerBridgeIcon';
import { BACKEND_ROOT_URL } from './api/axios';

type BackendStatus = 'checking' | 'ready' | 'slow';

function BackendWakeScreen({ status }: { status: BackendStatus }) {
  return (
    <div className="min-h-screen bg-[#1B1E16] text-white flex items-center justify-center px-6 font-sans">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-[#D1F55C] flex items-center justify-center shadow-[0_0_30px_rgba(209,245,92,0.25)]">
          {status === 'slow' ? (
            <Server className="w-8 h-8 text-[#1B1E16]" />
          ) : (
            <CareerBridgeIcon size={32} className="text-[#1B1E16]" />
          )}
        </div>
        <h1 className="text-2xl font-black tracking-tight mb-3">Waking up CareerBridge</h1>
        <p className="text-slate-300 text-sm leading-relaxed mb-6">
          The backend runs on Render's free tier, so it can take a few moments to start after being idle.
        </p>
        <div className="flex items-center justify-center gap-2 text-[#D1F55C] text-sm font-bold">
          <Loader2 className="w-4 h-4 animate-spin" />
          {status === 'slow' ? 'Still connecting to the API...' : 'Checking backend health...'}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('checking');

  useEffect(() => {
    let isMounted = true;
    let attempts = 0;
    let retryTimer: ReturnType<typeof setTimeout>;
    let slowTimer: ReturnType<typeof setTimeout>;

    const checkBackendHealth = async () => {
      attempts += 1;

      try {
        const response = await fetch(`${BACKEND_ROOT_URL}/health`, {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Health check failed with ${response.status}`);
        }

        if (isMounted) {
          setBackendStatus('ready');
        }
      } catch (error) {
        if (!isMounted) return;

        setBackendStatus(attempts >= 3 ? 'slow' : 'checking');
        retryTimer = setTimeout(checkBackendHealth, 4000);
      }
    };

    slowTimer = setTimeout(() => {
      if (isMounted) setBackendStatus('slow');
    }, 9000);

    checkBackendHealth();

    return () => {
      isMounted = false;
      clearTimeout(retryTimer);
      clearTimeout(slowTimer);
    };
  }, []);

  if (backendStatus !== 'ready') {
    return <BackendWakeScreen status={backendStatus} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/jobs" element={<JobsExplorer />} />
        <Route path="/job/:id" element={<JobDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
