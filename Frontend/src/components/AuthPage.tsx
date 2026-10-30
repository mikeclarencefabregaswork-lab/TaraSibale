import {
  AlertCircle,
  ArrowRight,
  Award,
  CheckCircle2,
  Compass,
  Eye, EyeOff,
  HeartHandshake,
  Lock,
  LogIn,
  Mail,
  MapPin,
  Palmtree,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus,
  Users
} from 'lucide-react';
import React, { useState } from 'react';
import { api, errorText } from '../api';
import { UserProfile } from '../types';

interface AuthPageProps {
  initialMode?: 'login' | 'signup';
  isDarkMode: boolean;
  currentUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
  onLogout: () => void;
  setActiveTab: (tab: string) => void;
}

export function AuthPage({
  initialMode = 'login',
  isDarkMode,
  currentUser,
  onLoginSuccess,
  onLogout,
  setActiveTab
}: AuthPageProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Login inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Sign up inputs
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'traveler' | 'resident' | 'guide' | 'host'>('traveler');
  const [agreedPledge, setAgreedPledge] = useState(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setErrorMessage(null); setSuccessMessage(null); setIsLoading(true);
    try {
      const user = await api<UserProfile>('/api/auth/login', { email: loginEmail.trim(), password: loginPassword, rememberMe });
      setLoginPassword(''); setSignupPassword(''); setConfirmPassword(''); onLoginSuccess(user); setActiveTab('explore');
    } catch (error) { setErrorMessage(errorText(error)); }
    finally { setIsLoading(false); }
  };
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault(); setErrorMessage(null); setSuccessMessage(null);
    if (signupPassword.length < 8) { setErrorMessage('Password must be at least 8 characters.'); return; }
    if (signupPassword !== confirmPassword) { setErrorMessage('Passwords do not match.'); return; }
    if (!agreedPledge) { setErrorMessage('Please accept the tourism guidelines.'); return; }
    setIsLoading(true);
    try {
      const user = await api<UserProfile>('/api/auth/signup', { name: fullName.trim(), email: signupEmail.trim(), password: signupPassword, role });
      setLoginPassword(''); setSignupPassword(''); setConfirmPassword(''); onLoginSuccess(user); setActiveTab('explore');
    } catch (error) { setErrorMessage(errorText(error)); }
    finally { setIsLoading(false); }
  };

  // If already logged in, show user profile management and logout view
  if (currentUser) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 p-6 sm:p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-3xl border border-white/30 shadow-lg text-white shrink-0">
              {currentUser.initials}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black">{currentUser.name}</h1>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-white/20 backdrop-blur-md border border-white/30 flex items-center gap-1.5 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-200" />
                  {currentUser.badge}
                </span>
              </div>
              <p className="text-teal-100 text-sm">{currentUser.email}</p>
              <p className="text-xs text-white/80">Member since {currentUser.joinedDate || '2026'}</p>
            </div>

            <button
              onClick={onLogout}
              className="px-5 py-2.5 rounded-2xl bg-white text-rose-600 hover:bg-rose-50 font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer flex items-center gap-2 shrink-0"
            >
              <LogIn className="w-4 h-4 rotate-180 text-rose-600" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-3xl border transition-all ${isDarkMode ? 'bg-[#0b2d40] border-slate-700/80 text-slate-100' : 'bg-white border-slate-200 text-slate-800 shadow-sm'}`}>
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base mb-1">Account Security</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Your account uses a password and a secure server session.
            </p>
            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> {currentUser.isVerified ? 'Verified account' : 'Verification pending'}
            </span>
          </div>

          <div className={`p-6 rounded-3xl border transition-all ${isDarkMode ? 'bg-[#0b2d40] border-slate-700/80 text-slate-100' : 'bg-white border-slate-200 text-slate-800 shadow-sm'}`}>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base mb-1">Eco-Pledge Status</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Committed to preserving marine life and pristine beaches in Concepcion.
            </p>
            <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <Sparkles className="w-4 h-4" /> Responsible Island Traveler
            </span>
          </div>

          <div className={`p-6 rounded-3xl border transition-all ${isDarkMode ? 'bg-[#0b2d40] border-slate-700/80 text-slate-100' : 'bg-white border-slate-200 text-slate-800 shadow-sm'}`}>
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base mb-1">Quick Island Navigation</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              View your homestays, offline documents, or explore tourist spots.
            </p>
            <button
              onClick={() => setActiveTab('explore')}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              Explore Sibale <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-extrabold bg-teal-500/15 text-teal-800 dark:text-teal-300 border border-teal-500/30">
          <div className="w-5 h-5 rounded-full bg-white p-0.5 shadow-xs ring-1 ring-teal-500/50 flex items-center justify-center shrink-0 overflow-hidden">
            <img
              src="/tarasibale-logo.png"
              alt="TaraSibale Logo"
              className="w-full h-full object-contain rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
          <span>TaraSibale Explorer Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {authMode === 'login' ? 'Welcome Back Traveler' : 'Join the Sibale Community'}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {authMode === 'login'
            ? 'Sign in to access your offline vault, saved itineraries, homestay reservations, and island guide chat.'
            : 'Register your account to unlock full island features, community group messaging, and verified homestay booking.'}
        </p>
      </div>

      {/* Main Auth Container */}
      <div className={`max-w-xl mx-auto rounded-3xl border shadow-xl overflow-hidden transition-all ${isDarkMode
          ? 'bg-[#0b2d40] border-slate-700/80 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.6)]'
          : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}>
        {/* Mode Selector Tabs */}
        <div className="p-3 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700/80 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${authMode === 'login'
                ? 'bg-white dark:bg-[#103c50] text-slate-900 dark:text-white shadow-md border border-slate-200 dark:border-slate-600'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <LogIn className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${authMode === 'signup'
                ? 'bg-white dark:bg-[#103c50] text-slate-900 dark:text-white shadow-md border border-slate-200 dark:border-slate-600'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <UserPlus className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Create New Account</span>
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Alerts */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className={`w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-medium border transition-colors focus:outline-none focus:border-teal-500 ${isDarkMode
                        ? 'bg-white/5 border-slate-700 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setErrorMessage('Password recovery is not configured. Contact the site administrator for account assistance.')}
                    className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className={`w-full pl-10 pr-10 py-3 rounded-2xl text-sm font-medium border transition-colors focus:outline-none focus:border-teal-500 ${isDarkMode
                        ? 'bg-white/5 border-slate-700 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <span>Keep me signed in on this device</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-black text-sm shadow-xl hover:shadow-teal-500/25 hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to TaraSibale</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Legal Name / Display Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Maria Santos"
                    required
                    className={`w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-medium border transition-colors focus:outline-none focus:border-teal-500 ${isDarkMode
                        ? 'bg-white/5 border-slate-700 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="maria@example.com"
                    required
                    className={`w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-medium border transition-colors focus:outline-none focus:border-teal-500 ${isDarkMode
                        ? 'bg-white/5 border-slate-700 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Account Type / Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'traveler', label: 'Island Traveler / Explorer', icon: Compass },
                    { id: 'resident', label: 'Sibale Native Resident', icon: MapPin },
                    { id: 'host', label: 'Homestay Partner Host', icon: Palmtree },
                    { id: 'guide', label: 'Local Tour Guide', icon: HeartHandshake },
                  ].map((r) => {
                    const Icon = r.icon;
                    const isSelected = role === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id as any)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${isSelected
                            ? 'bg-teal-500/20 border-teal-500 text-teal-950 dark:text-teal-200 font-bold shadow-sm'
                            : isDarkMode
                              ? 'bg-white/5 border-slate-700/80 text-slate-300 hover:bg-white/10'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
                        <span className="text-xs truncate">{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Min. 8 chars"
                      required
                      className={`w-full pl-10 pr-3 py-3 rounded-2xl text-xs font-medium border transition-colors focus:outline-none focus:border-teal-500 ${isDarkMode
                          ? 'bg-white/5 border-slate-700 text-white placeholder:text-slate-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                        }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      required
                      className={`w-full pl-10 pr-3 py-3 rounded-2xl text-xs font-medium border transition-colors focus:outline-none focus:border-teal-500 ${isDarkMode
                          ? 'bg-white/5 border-slate-700 text-white placeholder:text-slate-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                        }`}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedPledge}
                    onChange={(e) => setAgreedPledge(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer shrink-0"
                  />
                  <span className="text-xs leading-relaxed">
                    I pledge to protect Sibale Island's beaches, coral reefs, and respect the local Asi/Bantoanon heritage.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-black text-sm shadow-xl hover:shadow-teal-500/25 hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
