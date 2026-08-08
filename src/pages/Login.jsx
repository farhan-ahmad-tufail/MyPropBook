import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, ShieldAlert, LogIn, UserPlus, AlertCircle } from 'lucide-react';

export default function Login() {
  const { signIn, signUp, signInWithGoogle, isLocal } = useAuth();
  const navigate = useNavigate();

  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUpMode) {
        await signUp(email, password, fullName);
      } else {
        await signIn(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 relative min-h-screen">
      {/* Glow background decoration */}
      <div className="absolute w-[400px] h-[400px] bg-blue-600/10 blur-[80px] rounded-full top-1/4 left-1/4 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-purple-600/10 blur-[80px] rounded-full bottom-1/4 right-1/4 pointer-events-none" />

      <div className="w-full max-w-md card glass-card border-slate-800/80 shadow-2xl relative z-10">
        {/* Top Gradient strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-600" />
        
        <div className="p-8">
          {/* Brand Logo Header */}
          <div className="flex flex-col items-center mb-8 text-center">
            <Link to="/" className="mb-4">
              <img src="/logo.png" alt="BillRoom Logo" className="w-16 h-16 object-contain" />
            </Link>
            <h2 className="text-2xl font-bold text-slate-100">
              {isSignUpMode ? 'Create your Account' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-slate-400 mt-1.5">
              {isSignUpMode ? 'Start managing properties professionally' : 'Log in to manage properties'}
            </p>
          </div>

          {/* Local Mode Warning */}
          {isLocal && (
            <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-xl text-xs flex items-start gap-2.5">
              <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold">Local Offline Demo Mode</span>
                <p className="mt-0.5 text-yellow-400/80 leading-relaxed">
                  Supabase configuration is not detected in your `.env` file. You can enter any email/password combination to try the app offline instantly.
                </p>
              </div>
            </div>
          )}

          {/* Error Alert Box */}
          {error && (
            <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl text-sm flex items-center gap-2.5 animate-pulse">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login/Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUpMode && (
              <div className="form-group">
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  className="form-input bg-slate-900 border-slate-800"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}

            <div className="form-group">
              <label className="input-label">Email Address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="form-input bg-slate-900 border-slate-800"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="input-label">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="form-input bg-slate-900 border-slate-800"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary justify-center py-3 text-base shadow-glow flex items-center gap-2 rounded-xl mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-transparent animate-spin" />
              ) : isSignUpMode ? (
                <>
                  <UserPlus size={18} /> Register
                </>
              ) : (
                <>
                  <LogIn size={18} /> Log In
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-700"></div>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">or continue with</span>
            <div className="flex-1 h-px bg-slate-700"></div>
          </div>

          {/* Google Sign-In Button */}
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
                setError(err.message || 'Google sign-in failed.');
              } finally {
                setGoogleLoading(false);
              }
            }}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-700/60 hover:border-slate-600 text-slate-200 font-medium text-sm transition-all duration-200 cursor-pointer"
          >
            {googleLoading ? (
              <div className="w-5 h-5 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Sign in with Google
              </>
            )}
          </button>

          {/* Toggle Link */}
          <div className="mt-8 text-center text-sm text-slate-400">
            {isSignUpMode ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsSignUpMode(!isSignUpMode);
                setError('');
              }}
              className="text-blue-400 hover:text-blue-300 font-semibold focus:outline-none transition-colors"
            >
              {isSignUpMode ? 'Log In here' : 'Register here'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
