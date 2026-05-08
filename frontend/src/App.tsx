import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Hero from './components/Hero'; // <-- Import your Hero component
import JobsExplorer from './pages/JobsExplorer';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Hero />} />
          
          <Route path="/jobs" element={<JobsExplorer />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;