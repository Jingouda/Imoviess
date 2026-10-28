import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { soundFx } from '../services/soundFx';
import { X, Lock, Mail, User, Film, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register, loginWithGoogle } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [googleEmail, setGoogleEmail] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async (customEmail?: string) => {
    soundFx.playClick();
    setSubmitting(true);
    try {
      const emailToUse = customEmail || googleEmail || 'operator@gmail.com';
      const nameToUse = emailToUse.split('@')[0].replace('.', ' ').toUpperCase();

      await loginWithGoogle({
        name: nameToUse,
        email: emailToUse,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      });

      soundFx.playSuccess();
      showToast(`Signed in with Google: ${emailToUse}`, 'success');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Google Sign-In failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        soundFx.playSuccess();
        showToast('Signed in successfully.', 'success');
      } else {
        await register({ name, email, password });
        soundFx.playSuccess();
        showToast('Account registered! Welcome to IMovies.', 'success');
      }
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Authentication error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-sans">
      <div className="bg-[#090e0b] border border-emerald-500/40 rounded-2xl max-w-md w-full p-6 sm:p-7 text-slate-100 shadow-2xl relative">
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="text-center mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto mb-2.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Film className="w-5 h-5 text-emerald-400" />
          </div>
          <h2 className="text-xl font-black font-display text-white tracking-wide">
            {mode === 'login' ? 'SIGN IN // IMOVIES' : 'ENROLL OPERATOR // IMOVIES'}
          </h2>
          <p className="text-xs font-mono text-emerald-400/90 mt-1">
            Access 100+ blockbusters, 4K streaming, seat radar & digital passes.
          </p>
        </div>

        {/* Continue with Google Button */}
        <div className="space-y-3 mb-5">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleGoogleSignIn()}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="font-semibold text-slate-800">
              {submitting ? 'Verifying Session...' : 'Continue with Google'}
            </span>
          </button>

          {/* Direct Gmail Input */}
          <div className="p-2.5 rounded-xl bg-black border border-emerald-500/20 flex gap-2">
            <input
              type="email"
              placeholder="Enter your Gmail address..."
              value={googleEmail}
              onChange={(e) => setGoogleEmail(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-2.5 py-1 text-xs text-white font-mono placeholder-slate-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleGoogleSignIn(googleEmail)}
              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-[10px] font-mono text-slate-500 uppercase">
            OR USE PASSWORD
          </span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs font-mono">
          {mode === 'register' && (
            <div>
              <label className="block text-slate-400 mb-1 text-[11px]">FULL NAME</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-400 mb-1 text-[11px]">EMAIL ADDRESS</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="operator@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 text-[11px]">PASSWORD</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg shadow-md transition-all text-xs disabled:opacity-50 mt-2 cursor-pointer"
          >
            {submitting ? 'Authenticating...' : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-800 text-center text-xs font-mono text-slate-400">
          {mode === 'login' ? (
            <p>
              Need an account?{' '}
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setMode('register');
                }}
                className="text-emerald-400 hover:underline font-bold"
              >
                Enroll here
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setMode('login');
                }}
                className="text-emerald-400 hover:underline font-bold"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
