import React from 'react';
import type { UserRole } from '../../types';
import { Shield, Lock, Mail, User as UserIcon, ArrowRight, Fingerprint, Key } from 'lucide-react';

const DEMO_PERSONAS = [
  {
    id: 'demo_admin',
    name: 'Priya Iyer',
    email: 'priya.iyer@mospi.gov.in',
    designation: 'Deputy Director, MoSPI',
    avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Priya&backgroundColor=d4f4dd',
    userRole: 'admin' as UserRole,
    bgGradient: 'from-emerald-500/20 to-teal-500/10',
    borderColor: 'border-emerald-500/30',
  },
  {
    id: 'demo_learner',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@jsu.gov.in',
    designation: 'NSSTA Learner',
    avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Rajesh&backgroundColor=d4f4dd',
    userRole: 'employee' as UserRole,
    bgGradient: 'from-teal-500/20 to-emerald-500/10',
    borderColor: 'border-teal-500/30',
  },
  {
    id: 'demo_judge',
    name: 'Dr. Anita Sharma',
    email: 'anita.sharma@gov.in',
    designation: 'DG-CSO',
    avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Anita&backgroundColor=d4f4dd',
    userRole: 'admin' as UserRole,
    bgGradient: 'from-emerald-600/20 to-green-500/10',
    borderColor: 'border-emerald-600/30',
  },
];

interface LoginPageProps {
  onLogin: (persona: { name: string; email: string; designation: string; role: UserRole; isAdmin: boolean }) => void;
}

type AuthTab = 'persona' | 'register' | 'login';

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = React.useState<AuthTab>('persona');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // Register form
  const [regName, setRegName] = React.useState('');
  const [regEmail, setRegEmail] = React.useState('');
  const [regPassword, setRegPassword] = React.useState('');

  // Login form
  const [loginEmail, setLoginEmail] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');

  const handleDemoLogin = async (personaId: string) => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Demo login failed');

      localStorage.setItem('stackconnect_token', data.token);
      localStorage.setItem('stackconnect_auth', 'true');
      onLogin(data.user);
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      localStorage.setItem('stackconnect_token', data.token);
      localStorage.setItem('stackconnect_auth', 'true');
      onLogin(data.user);
    } catch (e: any) {
      setError(e.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('stackconnect_token', data.token);
      localStorage.setItem('stackconnect_auth', 'true');
      onLogin(data.user);
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const tabs: { key: AuthTab; label: string; icon: React.ReactNode }[] = [
    { key: 'persona', label: 'Quick Access', icon: <Fingerprint className="w-3.5 h-3.5" /> },
    { key: 'register', label: 'Register', icon: <UserIcon className="w-3.5 h-3.5" /> },
    { key: 'login', label: 'Login', icon: <Key className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-oled-base">
      {/* Aurora mesh background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/8 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-teal-500/6 blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-600/4 blur-3xl" />
      </div>

      {/* Film grain */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")` }}
      />

      <div className="relative z-10 w-full max-w-lg mx-auto px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl shadow-emerald-500/20 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            StackConnect
          </h1>
          <p className="text-sm text-white/40 mt-1.5 font-medium">
            AI Skill Intelligence for MoSPI
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-emerald-500/40" />
            <span className="text-[10px] font-bold text-emerald-500/60 tracking-widest uppercase">
              Ministry of Statistics & Programme Implementation
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-emerald-500/40" />
          </div>
        </div>

        {/* Auth tabs */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/10 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-white/50 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {/* === PERSONA TAB === */}
        {activeTab === 'persona' && (
          <div className="space-y-3">
            <p className="text-xs text-white/40 text-center mb-4 font-medium">
              Select a role to access the platform — no password required for demo
            </p>
            {DEMO_PERSONAS.map((persona) => (
              <button
                key={persona.id}
                disabled={loading}
                onClick={() => handleDemoLogin(persona.id)}
                className={`w-full p-4 rounded-2xl border ${persona.borderColor} bg-gradient-to-r ${persona.bgGradient} backdrop-blur-xl hover:scale-[1.01] hover:shadow-lg transition-all duration-300 flex items-center gap-4 disabled:opacity-50`}
              >
                <img
                  src={persona.avatarUrl}
                  alt={persona.name}
                  className="w-14 h-14 rounded-xl object-cover border-2 border-white/10 shadow-md"
                />
                <div className="flex-1 text-left">
                  <div className="font-bold text-sm text-white">{persona.name}</div>
                  <div className="text-xs text-white/50 font-medium">{persona.designation}</div>
                  <div className="text-[10px] text-emerald-400/60 font-mono mt-0.5">{persona.email}</div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${persona.userRole === 'admin' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {persona.userRole}
                  </span>
                  <ArrowRight className="w-3 h-3 text-white/40" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* === REGISTER TAB === */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <p className="text-xs text-white/40 text-center mb-2 font-medium">
              Create a new account — passwords are bcrypt-hashed and stored securely
            </p>
            <div>
              <label className="text-xs font-semibold text-white/60 block mb-1.5">Full Name</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-white/60 block mb-1.5">Official Email</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition"
                placeholder="you@mospi.gov.in"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-white/60 block mb-1.5">Password</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition"
                placeholder="Minimum 8 characters"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* === LOGIN TAB === */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <p className="text-xs text-white/40 text-center mb-2 font-medium">
              Sign in with your registered email and password
            </p>
            <div>
              <label className="text-xs font-semibold text-white/60 block mb-1.5">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition"
                placeholder="you@mospi.gov.in"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-white/60 block mb-1.5">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition"
                placeholder="Your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Security badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-500/60 tracking-wider uppercase">
              Server-Side Authentication · JWT · bcrypt
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
