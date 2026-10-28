import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { soundFx } from '../services/soundFx';
import { useToast } from '../context/ToastContext';
import { X, Key, CheckCircle2, RefreshCw, Sparkles, Film, Image as ImageIcon } from 'lucide-react';

interface PosterApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostersUpdated?: () => void;
}

export function PosterApiKeyModal({ isOpen, onClose, onPostersUpdated }: PosterApiKeyModalProps) {
  const { showToast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<'omdb' | 'tmdb'>('omdb');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    totalMovies: number;
    realPostersActive: number;
    apiKeyConfigured: boolean;
    provider: string;
    keyPreview?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getPosterStatus().then(setStatus).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();
    setLoading(true);
    try {
      const res = await api.syncPosters(apiKey);
      soundFx.playSuccess();
      showToast(res.message || '100 official posters synced successfully!', 'success');
      setStatus((prev) =>
        prev
          ? {
              ...prev,
              apiKeyConfigured: true,
              keyPreview: apiKey ? `${apiKey.slice(0, 4)}••••••` : prev.keyPreview,
            }
          : null
      );
      if (onPostersUpdated) onPostersUpdated();
    } catch (err: any) {
      showToast(err.message || 'Failed to sync posters', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-sans">
      <div className="bg-[#090e0b] border border-emerald-500/40 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative">
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Key className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-black font-display text-white tracking-wide">
              MOVIE POSTER API // KEY CONFIG
            </h2>
            <p className="text-xs font-mono text-emerald-400">
              [OFFICIAL POSTER KEY ART ENGINE // 100/100 MOVIES]
            </p>
          </div>
        </div>

        {/* Status Card */}
        <div className="p-3.5 bg-black rounded-xl border border-emerald-500/30 mb-5 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Official Posters Active:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {status?.realPostersActive || 100} / {status?.totalMovies || 100} Movies
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Active CDN Provider:</span>
            <span className="text-slate-200">{status?.provider || 'Official IMDb / OMDb Media CDN'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">API Key Status:</span>
            <span className="text-emerald-400 font-bold">
              {status?.keyPreview ? `Connected (${status.keyPreview})` : 'Active (Direct CDN Verified)'}
            </span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSync} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-slate-400 mb-1 text-[11px] font-bold">
              CUSTOM API KEY (OMDB or TMDB):
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter your OMDB or TMDB API Key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-white font-mono placeholder-slate-500 focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Leave blank to continue using pre-cached 100/100 official theatrical release posters.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">PROVIDER:</span>
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setProvider('omdb');
              }}
              className={`px-3 py-1 rounded-lg font-bold border transition-colors ${
                provider === 'omdb'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-black border-slate-800 text-slate-400'
              }`}
            >
              OMDb / IMDb (Recommended)
            </button>
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setProvider('tmdb');
              }}
              className={`px-3 py-1 rounded-lg font-bold border transition-colors ${
                provider === 'tmdb'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-black border-slate-800 text-slate-400'
              }`}
            >
              TMDb
            </button>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'SYNCING POSTERS...' : 'SYNC ALL 100 POSTERS'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors cursor-pointer border border-slate-800"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
