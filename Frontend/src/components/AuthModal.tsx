import { PORTFOLIO_MODE } from "../portfolio";
import { PortfolioCollectionNotice } from "./PortfolioNotice";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Compass,
  Eye,
  EyeOff,
  HeartHandshake,
  Lock,
  LogIn,
  Mail,
  MapPin,
  Palmtree,
  ShieldCheck,
  User,
  UserPlus,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { api, errorText } from "../api";
import { UserProfile } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  initialMode?: "login" | "signup";
  onLoginSuccess: (user: UserProfile) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  isDarkMode,
  initialMode = "login",
  onLoginSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form states - Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Form states - Sign Up
  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"traveler" | "resident" | "guide" | "host">(
    "traveler",
  );
  const [agreedPledge, setAgreedPledge] = useState(true);

  if (!isOpen) return null;
  if (PORTFOLIO_MODE) return <div role="dialog" aria-modal="true" aria-label="Portfolio account information" className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4" onClick={onClose}>
    <div className="w-full max-w-2xl" onClick={event => event.stopPropagation()}><PortfolioCollectionNotice onContinue={onClose} /></div>
  </div>;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);
    try {
      const user = await api<UserProfile>("/api/auth/login", {
        email: loginEmail.trim(),
        password: loginPassword,
        rememberMe,
      });
      setLoginPassword("");
      setSignupPassword("");
      setConfirmPassword("");
      onLoginSuccess(user);
      onClose();
    } catch (error) {
      setErrorMessage(errorText(error));
    } finally {
      setIsLoading(false);
    }
  };
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    if (signupPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }
    if (signupPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    if (!agreedPledge) {
      setErrorMessage("Please accept the tourism guidelines.");
      return;
    }
    setIsLoading(true);
    try {
      const user = await api<UserProfile>("/api/auth/signup", {
        name: fullName.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
        role,
      });
      setLoginPassword("");
      setSignupPassword("");
      setConfirmPassword("");
      onLoginSuccess(user);
      onClose();
    } catch (error) {
      setErrorMessage(errorText(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className={`relative w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden my-auto max-h-[92dvh] flex flex-col transition-all ${
          isDarkMode
            ? "bg-[#061e2c] border-slate-700/70 text-slate-100 shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
            : "bg-white border-slate-200 text-slate-900 shadow-2xl"
        }`}
        onClick={(e) => e.stopPropagation()}>
        {/* Decorative Top Accent Header */}
        <div className="relative px-5 sm:px-6 pt-5 sm:pt-6 pb-4 sm:pb-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white p-0.5 shadow-md ring-2 ring-white/70 flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src="/portfolio-mark.svg"
                  alt="TaraSibale Logo"
                  className="w-full h-full object-contain rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                  {mode === "login"
                    ? "Sign In to TaraSibale"
                    : "Create Your TaraSibale Account"}
                </h3>
                <p className="text-[11px] sm:text-xs text-teal-100 font-medium">
                  {mode === "login"
                    ? "Access offline vault, homestay bookings, and island chat"
                    : "Join our eco-tourism community on Sibale Island, Romblon"}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Close modal">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex items-center gap-2 mt-4 sm:mt-5 p-1 bg-black/20 backdrop-blur-md rounded-2xl border border-white/15">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 min-h-[40px] flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-white text-slate-900 shadow-md font-extrabold"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}>
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 min-h-[40px] flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === "signup"
                  ? "bg-white text-slate-900 shadow-md font-extrabold"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}>
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Alerts */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
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
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-colors focus:outline-none focus:border-teal-500 ${
                      isDarkMode
                        ? "bg-white/5 border-slate-700 text-white placeholder:text-slate-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                    }`}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setErrorMessage(
                        "Password recovery is not configured. Contact the site administrator for account assistance.",
                      )
                    }
                    className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold hover:underline">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-colors focus:outline-none focus:border-teal-500 ${
                      isDarkMode
                        ? "bg-white/5 border-slate-700 text-white placeholder:text-slate-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
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
                  <span>Remember my session</span>
                </label>

                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  256-bit Encrypted
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-extrabold text-xs sm:text-sm shadow-lg hover:shadow-teal-500/25 hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 mt-2">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Your Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Don't have an account yet?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setErrorMessage(null);
                    }}
                    className="text-teal-600 dark:text-teal-400 font-extrabold hover:underline">
                    Create a free account
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* SIGN UP FORM */}
          {mode === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Maria Santos"
                    required
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-colors focus:outline-none focus:border-teal-500 ${
                      isDarkMode
                        ? "bg-white/5 border-slate-700 text-white placeholder:text-slate-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
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
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-colors focus:outline-none focus:border-teal-500 ${
                      isDarkMode
                        ? "bg-white/5 border-slate-700 text-white placeholder:text-slate-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                    }`}
                  />
                </div>
              </div>

              {/* Role / Traveler Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  I am visiting as / registering as:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      id: "traveler",
                      label: "Island Traveler / Explorer",
                      icon: Compass,
                    },
                    {
                      id: "resident",
                      label: "Sibale Native Resident",
                      icon: MapPin,
                    },
                    {
                      id: "host",
                      label: "Homestay Partner Host",
                      icon: Palmtree,
                    },
                    {
                      id: "guide",
                      label: "Local Certified Tour Guide",
                      icon: HeartHandshake,
                    },
                  ].map((r) => {
                    const Icon = r.icon;
                    const isSelected = role === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id as any)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-teal-500/20 border-teal-500 text-teal-950 dark:text-teal-200 font-bold shadow-sm"
                            : isDarkMode
                              ? "bg-white/5 border-slate-700/80 text-slate-300 hover:bg-white/10"
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}>
                        <Icon
                          className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-teal-600 dark:text-teal-400" : "text-slate-400"}`}
                        />
                        <span className="text-[11px] truncate leading-tight">
                          {r.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Min. 8 chars"
                      required
                      className={`w-full pl-10 pr-3 py-2.5 rounded-xl text-xs font-medium border transition-colors focus:outline-none focus:border-teal-500 ${
                        isDarkMode
                          ? "bg-white/5 border-slate-700 text-white placeholder:text-slate-500"
                          : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      required
                      className={`w-full pl-10 pr-3 py-2.5 rounded-xl text-xs font-medium border transition-colors focus:outline-none focus:border-teal-500 ${
                        isDarkMode
                          ? "bg-white/5 border-slate-700 text-white placeholder:text-slate-500"
                          : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
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
                  <span className="text-[11px] leading-relaxed">
                    I agree to support{" "}
                    <strong className="text-teal-600 dark:text-teal-400">
                      Leave No Trace
                    </strong>{" "}
                    environmental guidelines & respect Sibale's cultural
                    heritage.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-extrabold text-xs sm:text-sm shadow-lg hover:shadow-teal-500/25 hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 mt-2">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Sibale Explorer Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setErrorMessage(null);
                    }}
                    className="text-teal-600 dark:text-teal-400 font-extrabold hover:underline">
                    Sign In instead
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
