import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  User, Mail, Phone, MapPin, Briefcase,
  GraduationCap, Code2, Star, FileText, Globe, Edit3,
  Check, X, ChevronRight, LogOut, Target,
  Building2, Award, Plus, Trash2, TrendingUp, ExternalLink,
  Bell, Settings, BarChart2, BookOpen, Loader2, GitBranch, Link2
} from 'lucide-react';
import CareerBridgeIcon from '../components/CareerBridgeIcon';

// Lucide-react this version doesn't ship Linkedin/Github — using inline SVG
const LinkedinIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const GithubIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
  </svg>
);

interface Profile {
  fullName: string;
  email?: string;
  headline: string;
  experienceYears: number | string;
  techStack: string[];
  githubUrl: string;
  linkedinUrl: string;
  phone: string;
  location: string;
  college: string;
  degree: string;
  graduationYear: string;
  cgpa: string;
  currentCompany: string;
  currentRole: string;
  preferredRoles: string[];
  preferredLocations: string[];
  resumeUrl: string;
  portfolioUrl: string;
}

const emptyProfile: Profile = {
  fullName: '', email: '', headline: '', experienceYears: 0,
  techStack: [], githubUrl: '', linkedinUrl: '', phone: '', location: '',
  college: '', degree: '', graduationYear: '', cgpa: '',
  currentCompany: '', currentRole: '', preferredRoles: [],
  preferredLocations: [], resumeUrl: '', portfolioUrl: '',
};

const TABS = ['Overview', 'Experience', 'Education', 'Skills', 'Preferences'];

function TagInput({ label, values, onChange, placeholder }: {
  label: string; values: string[]; onChange: (v: string[]) => void; placeholder: string;
}) {
  const [input, setInput] = useState('');
  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setInput('');
  };
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2 min-h-[2rem]">
        {values.map((v, i) => (
          <span key={i} className="inline-flex items-center gap-1 bg-[#1B1E16] text-[#D1F55C] px-3 py-1 rounded-full text-xs font-semibold">
            {v}
            <button onClick={() => onChange(values.filter((_, j) => j !== i))} className="hover:text-red-400 transition-colors ml-1">
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D1F55C] focus:border-transparent transition-all"
        />
        <button onClick={add} className="bg-[#1B1E16] text-[#D1F55C] rounded-lg px-3 py-2 hover:bg-black transition-colors">
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        {icon && <span className="text-slate-400">{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  );
}

function InputField({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D1F55C] focus:border-transparent placeholder-slate-400 transition-all"
    />
  );
}

export default function Profile() {
  const { token, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    apiClient.get('/profile')
      .then(res => {
        const data = res.data;
        setProfile({
          fullName: data.fullName || '',
          email: data.email || '',
          headline: data.headline || '',
          experienceYears: data.experienceYears ?? 0,
          techStack: data.techStack || [],
          githubUrl: data.githubUrl || '',
          linkedinUrl: data.linkedinUrl || '',
          phone: data.phone || '',
          location: data.location || '',
          college: data.college || '',
          degree: data.degree || '',
          graduationYear: data.graduationYear || '',
          cgpa: data.cgpa ? String(data.cgpa) : '',
          currentCompany: data.currentCompany || '',
          currentRole: data.currentRole || '',
          preferredRoles: data.preferredRoles || [],
          preferredLocations: data.preferredLocations || [],
          resumeUrl: data.resumeUrl || '',
          portfolioUrl: data.portfolioUrl || '',
        });
      })
      .catch(() => setError('Failed to load profile. Please try refreshing.'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  const set = (field: keyof Profile) => (value: any) => setProfile(p => ({ ...p, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...profile,
        cgpa: profile.cgpa ? String(profile.cgpa) : null,
        experienceYears: Number(profile.experienceYears) || 0,
      };
      await apiClient.put('/profile', payload);
      setSaved(true);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const completionFields = [
    profile.fullName, profile.headline, profile.location,
    profile.techStack.length > 0 ? 'x' : '', profile.githubUrl || profile.linkedinUrl,
    profile.college, profile.resumeUrl || profile.portfolioUrl,
  ];
  const completionPct = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  const initials = profile.fullName
    ? profile.fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-[#1B1E16] rounded-xl flex items-center justify-center">
            <Loader2 className="text-[#D1F55C] animate-spin" size={24} />
          </div>
          <p className="text-slate-500 text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans">
      {/* ── TOP NAV ── */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/jobs" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1B1E16] rounded-lg flex items-center justify-center">
              <CareerBridgeIcon size={18} className="text-[#D1F55C]" />
            </div>
            <span className="text-lg font-black text-[#1B1E16] tracking-tight">CareerBridge</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/jobs" className="hidden md:flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100">
              <BarChart2 size={15} />
              Explore Jobs
            </Link>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors">
              <Bell size={18} />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors">
              <Settings size={18} />
            </button>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
            >
              <LogOut size={15} />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO BANNER ── */}
      <div className="bg-[#1B1E16] h-36 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #D1F55C 0%, transparent 50%), radial-gradient(circle at 80% 20%, #D1F55C 0%, transparent 40%)' }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex flex-col lg:flex-row gap-6 items-start pt-8">

          {/* ── LEFT SIDEBAR ── */}
          <div className="w-full lg:w-80 flex-shrink-0 space-y-4 lg:sticky lg:top-20">

            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="px-6 pt-6 pb-5 flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#1B1E16] to-[#3a4030] flex items-center justify-center text-[#D1F55C] font-black text-3xl shadow-lg ring-4 ring-white mb-4">
                  {initials}
                </div>
                <h2 className="text-xl font-bold text-slate-900">{profile.fullName || 'Your Name'}</h2>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">{profile.headline || 'Add your professional headline'}</p>

                {profile.location && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                    <MapPin size={11} />
                    <span>{profile.location}</span>
                  </div>
                )}

                {/* Quick links */}
                <div className="flex gap-3 mt-4">
                  {profile.linkedinUrl && (
                    <a href={profile.linkedinUrl} target="_blank" rel="noreferrer"
                      className="w-9 h-9 rounded-xl bg-[#0A66C2]/10 text-[#0A66C2] flex items-center justify-center hover:bg-[#0A66C2]/20 transition-colors">
                      <LinkedinIcon size={16} />
                    </a>
                  )}
                  {profile.githubUrl && (
                    <a href={profile.githubUrl} target="_blank" rel="noreferrer"
                      className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 transition-colors">
                      <GithubIcon size={16} />
                    </a>
                  )}
                  {profile.portfolioUrl && (
                    <a href={profile.portfolioUrl} target="_blank" rel="noreferrer"
                      className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center hover:bg-violet-100 transition-colors">
                      <Globe size={16} />
                    </a>
                  )}
                </div>
              </div>

              {/* Profile completion */}
              <div className="px-6 pb-5 border-t border-slate-100 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-600">Profile Strength</span>
                  <span className="text-xs font-bold text-[#1B1E16]">{completionPct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-700"
                    style={{
                      width: `${completionPct}%`,
                      background: completionPct >= 80 ? '#22c55e' : completionPct >= 50 ? '#D1F55C' : '#f59e0b',
                    }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {completionPct < 50 ? 'Add more details to stand out to recruiters.' : completionPct < 80 ? 'Almost there! A complete profile gets 3x more views.' : '🎉 Your profile looks great!'}
                </p>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Quick Stats</h3>
              <div className="space-y-3">
                {[
                  { icon: <Briefcase size={14} />, label: 'Experience', value: profile.experienceYears ? `${profile.experienceYears} Years` : 'Not Set' },
                  { icon: <GraduationCap size={14} />, label: 'Education', value: profile.college || 'Not Set' },
                  { icon: <Code2 size={14} />, label: 'Tech Stack', value: profile.techStack.length > 0 ? `${profile.techStack.length} Skills` : 'Not Set' },
                  { icon: <Target size={14} />, label: 'Target Roles', value: profile.preferredRoles.length > 0 ? `${profile.preferredRoles.length} Roles` : 'Not Set' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                      {stat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-slate-400 font-medium">{stat.label}</p>
                      <p className="text-xs font-semibold text-slate-700 truncate">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resume Card */}
            <div className="bg-gradient-to-br from-[#1B1E16] to-[#2d3024] rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={16} className="text-[#D1F55C]" />
                <h3 className="text-sm font-bold">Resume</h3>
              </div>
              {profile.resumeUrl ? (
                <a href={profile.resumeUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-xs text-[#D1F55C] hover:underline">
                  <ExternalLink size={12} />
                  View Resume
                </a>
              ) : (
                <p className="text-xs text-slate-400">Add your resume URL in the Overview tab</p>
              )}
            </div>
          </div>

          {/* ── MAIN CONTENT ── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Save bar */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2">
                <X size={14} />
                {error}
              </div>
            )}

            {/* Tab bar + Save button */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="flex items-center justify-between px-4 border-b border-slate-100">
                <div className="flex overflow-x-auto hide-scrollbar">
                  {TABS.map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${activeTab === tab
                        ? 'border-[#1B1E16] text-[#1B1E16]'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  id="save-profile-btn"
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all flex-shrink-0 ml-2 ${saved
                    ? 'bg-green-500 text-white'
                    : 'bg-[#1B1E16] hover:bg-black text-[#D1F55C]'
                    } disabled:opacity-60`}
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Edit3 size={14} />}
                  {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                </button>
              </div>

              <div className="p-6">
                {/* ── OVERVIEW TAB ── */}
                {activeTab === 'Overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Field label="Full Name" icon={<User size={12} />}>
                        <InputField value={profile.fullName} onChange={set('fullName')} placeholder="e.g. Sivaram Krishnan" />
                      </Field>
                      <Field label="Email" icon={<Mail size={12} />}>
                        <InputField value={profile.email || ''} onChange={() => {}} placeholder={profile.email || 'your@email.com'} />
                      </Field>
                      <Field label="Professional Headline" icon={<Star size={12} />}>
                        <InputField value={profile.headline} onChange={set('headline')} placeholder="e.g. Full Stack Developer | React & Node.js" />
                      </Field>
                      <Field label="Phone" icon={<Phone size={12} />}>
                        <InputField value={profile.phone} onChange={set('phone')} placeholder="+91 98765 43210" type="tel" />
                      </Field>
                      <Field label="Location" icon={<MapPin size={12} />}>
                        <InputField value={profile.location} onChange={set('location')} placeholder="e.g. Bangalore, India" />
                      </Field>
                      <Field label="Years of Experience" icon={<TrendingUp size={12} />}>
                        <input
                          type="number"
                          min={0}
                          max={40}
                          value={String(profile.experienceYears)}
                          onChange={e => set('experienceYears')(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D1F55C] focus:border-transparent transition-all"
                        />
                      </Field>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Field label="Resume URL" icon={<FileText size={12} />}>
                        <InputField value={profile.resumeUrl} onChange={set('resumeUrl')} placeholder="https://drive.google.com/..." />
                      </Field>
                      <Field label="Portfolio URL" icon={<Globe size={12} />}>
                        <InputField value={profile.portfolioUrl} onChange={set('portfolioUrl')} placeholder="https://yourportfolio.dev" />
                      </Field>
                    </div>
                  </div>
                )}

                {/* ── EXPERIENCE TAB ── */}
                {activeTab === 'Experience' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Field label="Current Company" icon={<Building2 size={12} />}>
                        <InputField value={profile.currentCompany} onChange={set('currentCompany')} placeholder="e.g. Infosys, Google, Startup" />
                      </Field>
                      <Field label="Current Role / Title" icon={<Briefcase size={12} />}>
                        <InputField value={profile.currentRole} onChange={set('currentRole')} placeholder="e.g. Software Engineer" />
                      </Field>
                      <Field label="GitHub Profile" icon={<GithubIcon size={12} />}>
                        <InputField value={profile.githubUrl} onChange={set('githubUrl')} placeholder="https://github.com/username" />
                      </Field>
                      <Field label="LinkedIn Profile" icon={<LinkedinIcon size={12} />}>
                        <InputField value={profile.linkedinUrl} onChange={set('linkedinUrl')} placeholder="https://linkedin.com/in/username" />
                      </Field>
                    </div>
                  </div>
                )}

                {/* ── EDUCATION TAB ── */}
                {activeTab === 'Education' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Field label="College / University" icon={<GraduationCap size={12} />}>
                        <InputField value={profile.college} onChange={set('college')} placeholder="e.g. IIT Bombay, VIT Vellore" />
                      </Field>
                      <Field label="Degree" icon={<BookOpen size={12} />}>
                        <InputField value={profile.degree} onChange={set('degree')} placeholder="e.g. B.Tech Computer Science" />
                      </Field>
                      <Field label="Graduation Year" icon={<Award size={12} />}>
                        <InputField value={profile.graduationYear} onChange={set('graduationYear')} placeholder="e.g. 2025" />
                      </Field>
                      <Field label="CGPA / Percentage" icon={<Star size={12} />}>
                        <InputField
                          value={profile.cgpa}
                          onChange={set('cgpa')}
                          placeholder="e.g. 8.5 or 85%"
                        />
                      </Field>
                    </div>
                  </div>
                )}

                {/* ── SKILLS TAB ── */}
                {activeTab === 'Skills' && (
                  <div className="space-y-6">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <p className="text-xs text-slate-500 mb-1 font-medium">💡 Tip: Press <kbd className="bg-white border border-slate-300 rounded px-1 py-0.5 text-[10px] font-mono">Enter</kbd> after each skill to add it</p>
                    </div>
                    <TagInput
                      label="Tech Stack & Skills"
                      values={profile.techStack}
                      onChange={set('techStack')}
                      placeholder="e.g. React, Node.js, PostgreSQL..."
                    />

                    {profile.techStack.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Current Skills ({profile.techStack.length})</p>
                        <div className="flex flex-wrap gap-2">
                          {profile.techStack.map((skill, i) => (
                            <span key={i} className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm hover:border-[#1B1E16] transition-colors">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── PREFERENCES TAB ── */}
                {activeTab === 'Preferences' && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-[#1B1E16]/5 to-transparent rounded-xl p-4 border border-[#1B1E16]/10">
                      <p className="text-xs text-slate-600 font-medium">
                        🎯 These preferences help CareerBridge's AI find the most relevant jobs for you
                      </p>
                    </div>
                    <TagInput
                      label="Preferred Job Roles"
                      values={profile.preferredRoles}
                      onChange={set('preferredRoles')}
                      placeholder="e.g. Frontend Developer, SDE-1..."
                    />
                    <TagInput
                      label="Preferred Locations"
                      values={profile.preferredLocations}
                      onChange={set('preferredLocations')}
                      placeholder="e.g. Bangalore, Remote, Pune..."
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Danger zone */}
            <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-5">
              <h3 className="text-sm font-bold text-red-600 mb-1 flex items-center gap-2"><Trash2 size={14} /> Danger Zone</h3>
              <p className="text-xs text-slate-500 mb-4">These actions cannot be undone.</p>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="text-xs font-semibold text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-4 py-2 rounded-lg transition-all"
              >
                Sign Out of All Devices
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}