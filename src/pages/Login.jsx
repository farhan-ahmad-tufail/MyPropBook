import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  X
} from 'lucide-react';
import Logo from '../components/Logo';

export default function Login() {
  const { signIn, signUp, signInWithGoogle, isLocal } = useAuth();
  const navigate = useNavigate();

  const [isSignUpMode, setIsSignUpMode] = useState(false);
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

  // Simple password strength rules (TenantCloud inspired)
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
        setSuccessMessage('Your BillRoom account is ready!');
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
    <div className="h-screen w-full bg-[#050816] text-slate-100 flex flex-col justify-between font-sans overflow-hidden relative">
      
      {/* Background ambient lighting */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[160px] rounded-full pointer-events-none" />

      {/* ── Top Navigation Bar ── */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative z-10">
        <Link to="/" className="flex items-center">
          <Logo size={36} />
        </Link>

        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <span className="text-slate-400">
            {isSignUpMode ? 'Already have an account?' : "Don't have an account?"}
          </span>
          <button
            onClick={() => {
              setIsSignUpMode(!isSignUpMode);
              setError('');
              setSuccessMessage('');
            }}
            className="px-4 py-2 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-500 shadow-md transition-all cursor-pointer"
          >
            {isSignUpMode ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </header>

      {/* ── Main View Container (Guaranteed 100vh with no scroll) ── */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10 min-h-0 overflow-hidden">
        
        {isSignUpMode ? (
          /* ========================================================= */
          /* SIGN UP VIEW (Clean 2-Column Split: Form + Clean Promo Card) */
          /* ========================================================= */
          <div className="w-full max-w-4xl bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row my-auto">
            
            {/* LEFT SIDE: Sign Up Form */}
            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
              
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Start your BillRoom journey
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your details to manage properties & bills.
                </p>
              </div>

              {/* Error / Success Notifications */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl text-xs flex items-start gap-2 animate-shake">
                  <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* 1. GOOGLE SIGN-IN ON TOP */}
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
                className="w-full h-11 flex items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold text-xs transition-all cursor-pointer mb-4"
              >
                {googleLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-400 border-t-white animate-spin" />
                    <span>Connecting to Google...</span>
                  </span>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Or</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {/* SIGNUP FORM */}
              <form onSubmit={handleSubmit} className="space-y-3">
                
                <div>
                  <label className="input-label">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    className="form-input bg-slate-950 border-slate-800 h-10 text-xs"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="input-label">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    className="form-input bg-slate-950 border-slate-800 h-10 text-xs"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="input-label">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Create a password"
                      className="form-input bg-slate-950 border-slate-800 h-10 text-xs pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Clean 4-bar Password Strength Indicator (TenantCloud Style) */}
                  <div className="mt-2 space-y-1.5">
                    <div className="grid grid-cols-4 gap-1.5">
                      {[1, 2, 3, 4].map((bar) => (
                        <div
                          key={bar}
                          className={`h-1 rounded-full transition-all duration-300 ${
                            passwordScore >= bar
                              ? passwordScore <= 2 ? 'bg-amber-400' : 'bg-blue-500'
                              : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Password must be at least 8 characters & contain 1 number, upper & lower letters.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary justify-center h-11 text-xs font-bold shadow-glow mt-4"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            </div>

            {/* RIGHT SIDE: Clean Presentation Banner (TenantCloud Style) */}
            <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-blue-950/40 via-slate-900 to-indigo-950/40 border-l border-slate-800 p-8 flex-col justify-between relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
              
              <div className="space-y-4 relative z-10 my-auto">
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                  Landlord Portal
                </span>
                
                <h3 className="text-2xl font-extrabold text-white leading-tight">
                  Manage your rental portfolio with ease.
                </h3>
                
                <p className="text-xs text-slate-400 leading-relaxed">
                  Automate monthly electricity readings, generate instant WhatsApp invoice receipts, and manage all your properties cleanly.
                </p>

                {/* Minimal preview card */}
                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2 mt-6">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Monthly Collection</span>
                    <span className="text-emerald-400 font-bold">₹1,24,500</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-3/4 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                <Lock size={12} className="text-emerald-400" />
                <span>256-Bit Encrypted Security</span>
              </div>
            </div>

          </div>
        ) : (
          /* ========================================================= */
          /* LOGIN VIEW (Clean Centered 1-Card 100vh Layout)            */
          /* ========================================================= */
          <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl my-auto">
            
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">Sign in</h2>
              <p className="text-xs text-slate-400 mt-1">Sign in to your rental management software.</p>
            </div>

            {/* Local Offline Banner */}
            {isLocal && (
              <div className="mb-5 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-[11px] flex items-start gap-2">
                <ShieldAlert size={15} className="mt-0.5 flex-shrink-0" />
                <span>Local Offline Demo Mode. Enter any email & password to test instantly.</span>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="mb-5 p-3 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl text-xs flex items-start gap-2 animate-shake">
                <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 1. GOOGLE SIGN-IN ON TOP */}
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
              className="w-full h-11 flex items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold text-xs transition-all cursor-pointer mb-5"
            >
              {googleLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-400 border-t-white animate-spin" />
                  <span>Connecting...</span>
                </span>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Or</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="input-label">Email</label>
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="form-input bg-slate-950 border-slate-800 h-11 text-xs"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="input-label mb-0">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setShowForgotModal(true);
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    className="form-input bg-slate-950 border-slate-800 h-11 text-xs pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary justify-center h-11 text-xs font-bold shadow-glow mt-2"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Demo Trigger */}
            <div className="mt-4 pt-3 text-center">
              <button
                type="button"
                onClick={handleDemoClick}
                className="text-xs text-slate-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1.5"
              >
                <Sparkles size={13} className="text-amber-400" />
                <span>Try BillRoom Demo instantly</span>
              </button>
            </div>

          </div>
        )}

      </main>

      {/* ── Footer ── */}
      <footer className="py-3 text-center text-[11px] text-slate-600 relative z-10">
        <span>© {new Date().getFullYear()} BillRoom • Property Management Software</span>
      </footer>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotSubmitted(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X size={18} />
            </button>

            {!forgotSubmitted ? (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <HelpCircle size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-100">Reset Password</h3>
                    <p className="text-xs text-slate-400">Enter your email to receive recovery instructions.</p>
                  </div>
                </div>

                <div>
                  <label className="input-label">Email</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="form-input bg-slate-950 border-slate-800 text-xs"
                  />
                </div>

                <button type="submit" className="w-full btn btn-primary justify-center h-10 text-xs font-semibold">
                  Send Recovery Link
                </button>
              </form>
            ) : (
              <div className="text-center py-4 space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mx-auto flex items-center justify-center">
                  <CheckCircle2 size={20} />
                </div>
                <h3 className="font-bold text-base text-slate-100">Recovery Link Sent</h3>
                <p className="text-xs text-slate-400">
                  Instructions sent to <strong className="text-slate-200">{forgotEmail}</strong>.
                </p>
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSubmitted(false);
                  }}
                  className="btn btn-secondary text-xs px-4 py-2"
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
