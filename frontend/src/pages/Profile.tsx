import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Megaphone, User, Briefcase, GraduationCap, Link as LinkIcon, Loader2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleLogout = () => {
    logout();      // Clears the token
    navigate('/'); // Kicks you to the home page!
  };
  // Massive state object to hold everything from your Drizzle schema
  const [formData, setFormData] = useState({
    fullName: '', headline: '', experienceYears: '', phone: '', location: '',
    college: '', degree: '', graduationYear: '', cgpa: '',
    currentCompany: '', currentRole: '',
    githubUrl: '', linkedinUrl: '', portfolioUrl: '', resumeUrl: '',
    techStack: '', preferredRoles: '', preferredLocations: '' // We store arrays as comma-separated strings for the UI
  });

  // 1. FETCH PROFILE ON LOAD
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const p = res.data;
        // Map backend data to form state (converting arrays to strings for the input fields)
        setFormData({
          fullName: p.fullName || '',
          headline: p.headline || '',
          experienceYears: p.experienceYears || '',
          phone: p.phone || '',
          location: p.location || '',
          college: p.college || '',
          degree: p.degree || '',
          graduationYear: p.graduationYear || '',
          cgpa: p.cgpa || '',
          currentCompany: p.currentCompany || '',
          currentRole: p.currentRole || '',
          githubUrl: p.githubUrl || '',
          linkedinUrl: p.linkedinUrl || '',
          portfolioUrl: p.portfolioUrl || '',
          resumeUrl: p.resumeUrl || '',
          techStack: p.techStack ? p.techStack.join(', ') : '',
          preferredRoles: p.preferredRoles ? p.preferredRoles.join(', ') : '',
          preferredLocations: p.preferredLocations ? p.preferredLocations.join(', ') : ''
        });
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. SAVE PROFILE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: '', type: '' });

    // Format strings back into arrays before sending to Postgres
    const payload = {
      ...formData,
      experienceYears: formData.experienceYears ? parseInt(formData.experienceYears as string) : null,
      cgpa: formData.cgpa ? parseFloat(formData.cgpa as string) : null,
      techStack: formData.techStack.split(',').map(s => s.trim()).filter(Boolean),
      preferredRoles: formData.preferredRoles.split(',').map(s => s.trim()).filter(Boolean),
      preferredLocations: formData.preferredLocations.split(',').map(s => s.trim()).filter(Boolean),
    };

    try {
      await axios.put('http://localhost:5000/api/profile', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      window.scrollTo(0, 0);
    } catch (error) {
      setMessage({ text: 'Failed to update profile.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-20">
      
      {/* Brand Header */}
      <div className="bg-[#1B1E16] text-white pt-10 pb-32 px-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3 cursor-pointer">
            <div className="w-10 h-10 bg-[#D1F55C] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(209,245,92,0.15)]">
              <Megaphone className="w-5 h-5 text-[#1B1E16] fill-[#1B1E16]" />
            </div>
            <span className="text-xl font-bold tracking-tight">CareerBridge</span>
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
          
          <div className="flex items-center gap-5 mb-10 pb-8 border-b border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-md">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Your Profile</h1>
              <p className="text-gray-500 font-medium mt-1">This information helps AI match you with the perfect roles.</p>
            </div>
          </div>

          {message.text && (
            <div className={`p-4 rounded-xl mb-8 font-semibold text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* SECTION 1: Personal Info */}
            <section>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2"><User className="w-4 h-4"/> Basic Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1B1E16] outline-none transition-all" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Headline</label>
                  <input type="text" name="headline" value={formData.headline} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1B1E16] outline-none transition-all" placeholder="Senior Backend Developer" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1B1E16] outline-none transition-all" placeholder="+91 9876543210" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1B1E16] outline-none transition-all" placeholder="Bengaluru, India" />
                </div>
              </div>
            </section>

            {/* SECTION 2: Professional & Tech */}
            <section>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Briefcase className="w-4 h-4"/> Professional</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Current Company</label>
                  <input type="text" name="currentCompany" value={formData.currentCompany} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1B1E16] outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Current Role</label>
                  <input type="text" name="currentRole" value={formData.currentRole} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1B1E16] outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Years of Experience</label>
                  <input type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1B1E16] outline-none transition-all" placeholder="e.g., 3" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tech Stack <span className="text-gray-400 font-normal ml-1">(Comma separated)</span></label>
                <input type="text" name="techStack" value={formData.techStack} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1B1E16] outline-none transition-all" placeholder="React, Node.js, PostgreSQL, TypeScript" />
              </div>
            </section>

            {/* SECTION 3: Education */}
            <section>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2"><GraduationCap className="w-4 h-4"/> Education</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">College / University</label>
                  <input type="text" name="college" value={formData.college} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1B1E16] outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Degree</label>
                  <input type="text" name="degree" value={formData.degree} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1B1E16] outline-none transition-all" placeholder="B.Tech Computer Science" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Graduation Year</label>
                  <input type="text" name="graduationYear" value={formData.graduationYear} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1B1E16] outline-none transition-all" placeholder="2024" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">CGPA</label>
                  <input type="number" step="0.01" name="cgpa" value={formData.cgpa} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1B1E16] outline-none transition-all" placeholder="8.5" />
                </div>
              </div>
            </section>

            {/* SECTION 4: Preferences & Links */}
            <section>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2"><LinkIcon className="w-4 h-4"/> Preferences & Assets</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Roles</label>
                  <input type="text" name="preferredRoles" value={formData.preferredRoles} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1B1E16] outline-none transition-all" placeholder="Backend Engineer, Full Stack" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Locations</label>
                  <input type="text" name="preferredLocations" value={formData.preferredLocations} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1B1E16] outline-none transition-all" placeholder="Remote, Bengaluru" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">GitHub URL</label>
                  <input type="url" name="githubUrl" value={formData.githubUrl} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1B1E16] outline-none transition-all" placeholder="https://github.com/username" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">LinkedIn URL</label>
                  <input type="url" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1B1E16] outline-none transition-all" placeholder="https://linkedin.com/in/username" />
                </div>
              </div>
            </section>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button 
                type="submit" 
                disabled={isSaving}
                className="bg-[#c2e434] text-[#1B1E16] font-bold px-10 py-4 rounded-xl hover:bg-[#b0d02b] transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Profile Settings'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}