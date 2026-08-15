import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, 
  LogIn, 
  UserPlus, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Building2, 
  Zap, 
  CheckCircle2,
  Lock,
  Sparkles,
  HelpCircle,
  X,
  ArrowRight,
  ArrowUpRight,
  Shield,
  Receipt,
  Users,
  Check
} from 'lucide-react';
import Logo from '../components/Logo';

export default function Login() {
  const { signIn, signUp, signInWithGoogle, isLocal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Detect mode from route path (/signup vs /login)
  const isSignUpPath = location.pathname === '/signup';
  const [isSignUpMode, setIsSignUpMode] = useState(isSignUpPath);

  useEffect(() => {
    setIsSignUpMode(location.pathname === '/signup');
  }, [location.pathname]);

  const toggleMode = (signUp) => {
    setIsSignUpMode(signUp);
    setError('');
    setSuccessMessage('');
    navigate(signUp ? '/signup' : '/login', { replace: true });
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Password strength rules
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const getPasswordScore = () => {
    let score = 0;
    if (hasMinLength) score++;
    if (hasUpper) score++;
    if (hasLower) score++;
    if (hasNumber) score++;
    return score;
  };

  const passwordScore = getPasswordScore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isSignUpMode) {
        if (!hasMinLength || !hasUpper || !hasLower || !hasNumber) {
          setError('Password must be at least 8 characters and contain 1 number, both upper & lowercase letters.');
          setLoading(false);
          return;
        }
        await signUp(email, password, fullName);
        setSuccessMessage('Your MyPropBook account is ready!');
        setTimeout(() => navigate('/dashboard?newuser=true'), 600);
      } else {
        await signIn(email, password);
        setSuccessMessage('Welcome back!');
        setTimeout(() => navigate('/dashboard'), 500);
      }
    } catch (err) {
      console.error(err);
      const rawMsg = err.message || '';
      if (rawMsg.toLowerCase().includes('invalid login credentials') || rawMsg.toLowerCase().includes('invalid credentials')) {
        setError('Unable to sign in. Check your email and password and try again.');
      } else if (rawMsg.toLowerCase().includes('user already exists') || rawMsg.toLowerCase().includes('already registered')) {
        setError('An account with this email already exists. Try signing in instead.');
      } else {
        setError(err.message || 'Something went wrong. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async () => {
    setError('');
    setLoading(true);
    try {
      if (isLocal) {
        localStorage.setItem('mock_token', 'demo_token');
        window.dispatchEvent(new Event('storage'));
        navigate('/dashboard');
      } else {
        await signIn('demo@billroom.app', 'DemoPass123!');
        navigate('/dashboard');
      }
    } catch (err) {
      try {
        await signUp('demo@billroom.app', 'DemoPass123!', 'Demo Landlord');
        navigate('/dashboard');
      } catch (e) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setForgotSubmitted(true);
  };

  return (
    <div className="h-screen w-full bg-[#f8faf9] text-slate-800 font-sans overflow-hidden select-none" style={{ fontFamily: "'Inter', 'Outfit', system-ui, sans-serif" }}>

      {/* ========================================================================= */}
      {/* 1. SIGN UP VIEW (Split-Screen 100vh No Scroll)                          */}
      {/* ========================================================================= */}
      {isSignUpMode ? (
        <div className="h-screen w-full grid grid-cols-1 md:grid-cols-12 bg-[#f8faf9] overflow-hidden">
          
          {/* ── LEFT PANEL (Dark MyPropBook Brand Intro) ── */}
          <div className="hidden md:flex md:col-span-5 lg:col-span-5 bg-[#0b1320] text-slate-100 p-8 lg:p-12 flex-col justify-between relative overflow-hidden h-screen">
            {/* Ambient Radial Background */}
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#2d5a47]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Brand Header */}
            <div className="relative z-10">
              <Link to="/" className="inline-block">
                <Logo size={36} />
              </Link>
            </div>

            {/* Middle Main Content */}
            <div className="relative z-10 space-y-5 my-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2d5a47]/20 border border-[#2d5a47]/40 text-[#4a9978] text-[10px] font-black uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4a9978] animate-pulse" />
                <span>YOUR OPERATIONS, CLEARER</span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-[1.15]">
                Your properties,<br />
                <span className="text-[#4a9978]">finally under control.</span>
              </h1>

              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                Manage rent, tenants, utility bills, and payments from one dependable place.
              </p>

              {/* 3 Short Benefits */}
              <div className="flex flex-col gap-2 pt-1">
                {[
                  'Flexible utility billing',
                  'Tenant & rent tracking',
                  'Professional receipts'
                ].map((benefit) => (
                  <div key={benefit} className="inline-flex items-center gap-2 text-slate-300 text-xs font-semibold">
                    <div className="w-4 h-4 rounded-full bg-[#2d5a47]/40 text-[#4a9978] flex items-center justify-center shrink-0">
                      <Check size={11} />
                    </div>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Subtle Floating Product Preview Card */}
              <div className="pt-2">
                <div className="bg-[#121c2c] border border-slate-800/80 rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400 font-medium">Monthly collection</span>
                    <span className="text-[#4a9978] font-black text-sm">₹1,24,500</span>
                  </div>

                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2.5">
                    <div className="bg-[#4a9978] h-full rounded-full w-[96%]" />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>18 rooms billed</span>
                    <span className="text-slate-500 font-bold">96% collected</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Security Note */}
            <div className="relative z-10 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center gap-2">
              <Lock size={12} className="text-[#4a9978]" />
              <span>Your property records stay private and protected.</span>
            </div>
          </div>

          {/* ── RIGHT PANEL (Sign Up Form - 100vh No Scroll) ── */}
          <div className="col-span-12 md:col-span-7 lg:col-span-7 bg-[#f8faf9] p-6 lg:p-10 flex flex-col justify-between h-screen overflow-hidden">
            
            {/* Top Navigation Row */}
            <div className="flex justify-between md:justify-end items-center text-xs font-medium text-slate-500">
              <div className="md:hidden">
                <Logo size={28} />
              </div>
              <div className="flex items-center gap-2">
                <span>Already have an account?</span>
                <button
                  type="button"
                  onClick={() => toggleMode(false)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-all cursor-pointer"
                >
                  <span>Sign in</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>
            </div>

            {/* Form Main Body */}
            <div className="w-full max-w-md mx-auto my-auto space-y-4">
              
              <div>
                <span className="text-[10px] font-black text-[#2d5a47] uppercase tracking-widest block mb-0.5">
                  A BETTER RENT ROLL STARTS HERE
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Create your MyPropBook account
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Start managing your properties professionally.
                </p>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success Banner */}
              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 size={15} className="shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* GOOGLE SIGN-IN BUTTON */}
              <button
                type="button"
                disabled={googleLoading}
                onClick={async () => {
                  setError('');
                  setGoogleLoading(true);
                  try {
                    const result = await signInWithGoogle();
                    if (result) navigate('/dashboard');
                  } catch (err) {
                    console.error(err);
                    setError(err.message || "Could not sign in with Google.");
                  } finally {
                    setGoogleLoading(false);
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2.5 cursor-pointer"
              >
                {googleLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 border-t-[#2d5a47] animate-spin" />
                    <span>Connecting...</span>
                  </span>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">OR</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* SIGN UP FORM FIELDS */}
              <form onSubmit={handleSubmit} className="space-y-3">
                
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    FULL NAME
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="For example, Ananya Mehta"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 outline-none focus:border-[#2d5a47] transition-all"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@yourproperty.in"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 outline-none focus:border-[#2d5a47] transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Create a secure password"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 outline-none focus:border-[#2d5a47] transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password.length > 0 && (
                    <div className="mt-1.5 space-y-0.5">
                      <div className="grid grid-cols-4 gap-1">
                        {[1, 2, 3, 4].map((bar) => (
                          <div
                            key={bar}
                            className={`h-1 rounded-full transition-all duration-300 ${
                              passwordScore >= bar
                                ? passwordScore <= 2 ? 'bg-amber-400' : 'bg-[#2d5a47]'
                                : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-[9px] text-slate-400">
                        Use 8+ characters with a mix of letters and numbers.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-[#2d5a47] hover:bg-[#234738] text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                  {!loading && <ArrowRight size={14} />}
                </button>

                {/* Terms Acknowledgement */}
                <div className="pt-1 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
                  <CheckCircle2 size={12} className="text-[#2d5a47]" />
                  <span>By creating an account, you agree to MyPropBook's terms and privacy policy.</span>
                </div>
              </form>
            </div>

            {/* Bottom Footer Credit */}
            <div className="pt-2 text-center text-[10px] text-slate-400">
              © {new Date().getFullYear()} MyPropBook · Built for property owners in India
            </div>

          </div>

        </div>
      ) : (
        /* ========================================================================= */
        /* 2. SIGN IN VIEW (Centered Auth Layout: 100vh No Scroll)                   */
        /* ========================================================================= */
        <div className="h-screen w-full flex flex-col justify-between items-center p-4 sm:p-6 bg-[#f8faf9] overflow-hidden">
          
          {/* Top Bar */}
          <header className="w-full max-w-5xl flex items-center justify-between py-2 px-2">
            <Link to="/" className="flex items-center">
              <Logo size={34} />
            </Link>
            <div className="text-xs text-slate-400 font-medium">
              Secure sign in
            </div>
          </header>

          {/* Centered Auth Card Container */}
          <main className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 my-auto">
            
            {/* Header */}
            <div className="text-center space-y-1">
              <span className="text-[10px] font-black text-[#2d5a47] uppercase tracking-widest block">
                WELCOME BACK
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Your properties,<br />in one calm place.
              </h1>
              <p className="text-xs text-slate-500">
                Sign in to continue managing rent, tenants, electricity and bills.
              </p>
            </div>

            {/* Local Offline Banner */}
            {isLocal && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-[11px] flex items-center gap-2">
                <ShieldAlert size={14} className="shrink-0 text-amber-600" />
                <span>Local Offline Demo Mode. Enter any email &amp; password to test.</span>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 size={15} className="shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* SIGN IN FORM */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@yourproperty.in"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 outline-none focus:border-[#2d5a47] transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    PASSWORD
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setShowForgotModal(true);
                    }}
                    className="text-[11px] text-[#2d5a47] hover:underline font-bold cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Your password"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 outline-none focus:border-[#2d5a47] transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#2d5a47] hover:bg-[#234738] text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                {loading ? 'Signing in...' : 'Sign in'}
                {!loading && <ArrowRight size={14} />}
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">OR</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* GOOGLE SIGN-IN BUTTON */}
            <button
              type="button"
              disabled={googleLoading}
              onClick={async () => {
                setError('');
                setGoogleLoading(true);
                try {
                  const result = await signInWithGoogle();
                  if (result) navigate('/dashboard');
                } catch (err) {
                  console.error(err);
                  setError(err.message || "Could not sign in with Google.");
                } finally {
                  setGoogleLoading(false);
                }
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2.5 cursor-pointer"
            >
              {googleLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 border-t-[#2d5a47] animate-spin" />
                  <span>Connecting...</span>
                </span>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Demo Account Trigger */}
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={handleDemoClick}
                className="text-xs text-slate-500 hover:text-[#2d5a47] font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={13} className="text-amber-500" />
                <span>Try MyPropBook Demo instantly</span>
              </button>
            </div>

            {/* Bottom Switch Link */}
            <div className="pt-3 border-t border-slate-100 text-center text-xs font-medium text-slate-500">
              New to MyPropBook?{' '}
              <button
                type="button"
                onClick={() => toggleMode(true)}
                className="text-[#2d5a47] font-extrabold hover:underline cursor-pointer"
              >
                Create an account
              </button>
            </div>

          </main>

          {/* Footer */}
          <footer className="py-2 text-center text-[10px] text-slate-400">
            © {new Date().getFullYear()} MyPropBook · Property Management Software
          </footer>
        </div>
      )}

      {/* ── FORGOT PASSWORD MODAL ── */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-4">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotSubmitted(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            >
              <X size={18} />
            </button>

            {!forgotSubmitted ? (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-[#edf5f1] text-[#2d5a47]">
                    <HelpCircle size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">Reset Password</h3>
                    <p className="text-xs text-slate-500">Enter your email to receive recovery instructions.</p>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@yourproperty.in"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 outline-none focus:border-[#2d5a47]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#2d5a47] hover:bg-[#234738] text-white font-bold text-xs transition-all cursor-pointer shadow-sm"
                >
                  Send Recovery Link
                </button>
              </form>
            ) : (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#2d5a47] mx-auto flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">Recovery Link Sent</h3>
                <p className="text-xs text-slate-500">
                  Instructions sent to <strong className="text-slate-800">{forgotEmail}</strong>.
                </p>
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSubmitted(false);
                  }}
                  className="py-2.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
