// D:\Projects\CareerBridge\frontend\src\App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import JobsExplorer from './pages/JobsExplorer';
import JobDetails from './pages/JobDetails'; 

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
        <main className="flex-grow">
          {/* Routes act like a switchboard, changing the page based on the URL */}
          <Routes>
            {/* The main feed stays at the root URL (/) */}
            <Route path="/" element={<JobsExplorer />} />
            
            {/* The new Details page loads when the URL has a job ID */}
            <Route path="/job/:id" element={<JobDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;