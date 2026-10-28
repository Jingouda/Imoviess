import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { soundFx } from '../services/soundFx';
import { Film, Shield, Lock, Mail, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export function LoginGate() {
  const { login, register, loginWithGoogle } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'google' | 'email'>('google');
  const [emailMode, setEmailMode] = useState<'login' | 'register'>('login');
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fast One-Click Google Continue
  const handleGoogleSignIn = async (customEmail?: string, customName?: string) => {
    soundFx.playClick();
    setSubmitting(true);
    try {
      const emailToUse = customEmail || googleEmail || 'operator@gmail.com';
      const nameToUse =
        customName ||
        googleName ||
        emailToUse.split('@')[0].replace('.', ' ').toUpperCase();

      await loginWithGoogle({
        name: nameToUse,
        email: emailToUse,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80`,
      });

      soundFx.playSuccess();
      showToast(`Google Identity Verified: ${emailToUse}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Google Sign-In failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();
    setSubmitting(true);
    try {
      if (emailMode === 'login') {
        await login(email, password);
        soundFx.playSuccess();
        showToast('Access Granted. Welcome to IMovies.', 'success');
      } else {
        await register({ name, email, password });
        soundFx.playSuccess();
        showToast('New Operator Enrolled. Welcome to IMovies.', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b09] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-emerald-400 selection:text-slate-950">
      {/* Background Cyber Glow & Gridlines */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(16,185,129,0.12),transparent_60%)] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Center Tactical Terminal Card */}
      <div className="relative w-full max-w-md bg-[#090e0b] border border-emerald-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/80 backdrop-blur-xl z-10 flex flex-col">
        {/* Reticle Brackets */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-emerald-400/60 pointer-events-none" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-emerald-400/60 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-emerald-400/60 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-emerald-400/60 pointer-events-none" />

        {/* Brand Terminal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto mb-3 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Film className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h1 className="text-2xl font-black font-display tracking-wider text-white">
              IMOVIES TERMINAL
            </h1>
          </div>
          <p className="text-xs font-mono text-emerald-400/90 tracking-wider">
            [IDENTIFICATION GATE // ACCESS RESTRICTED]
          </p>
          <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
            Please sign in with your Google / Gmail account to unlock 100+ blockbusters, 4K streaming & seat booking.
          </p>
        </div>

        {/* PRIMARY ACTION: SIGN IN WITH GOOGLE / GMAIL */}
        <div className="space-y-4">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleGoogleSignIn()}
            className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-3 cursor-pointer group"
          >
            {/* Google Multicolored SVG Icon */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
              {submitting ? 'Verifying Google Session...' : 'Continue with Google'}
            </span>
          </button>

          {/* Quick Custom Gmail Input (optional for any personal Gmail address) */}
          <div className="p-3 rounded-xl bg-black/60 border border-emerald-500/20 space-y-2">
            <span className="text-[10px] font-mono text-emerald-400 block tracking-wider">
              USE PERSONAL GMAIL ADDRESS:
            </span>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="you@gmail.com"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleGoogleSignIn(googleEmail)}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              OR LOGIN VIA CREDENTIALS
            </span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3 text-xs font-mono">
            {emailMode === 'register' && (
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">OPERATOR NAME</label>
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">EMAIL ADDRESS</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">PASSWORD</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wider transition-colors shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              {emailMode === 'login' ? 'SIGN IN WITH PASSWORD' : 'ENROLL NEW ACCOUNT'}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setEmailMode(emailMode === 'login' ? 'register' : 'login');
                }}
                className="text-[11px] text-emerald-400 hover:underline"
              >
                {emailMode === 'login'
                  ? 'Need an account? Register here'
                  : 'Already registered? Sign in here'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
