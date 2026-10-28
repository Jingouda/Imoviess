import React, { useState, useEffect } from 'react';
import { Movie, DownloadedMovie } from '../types/cinema';
import { soundFx } from '../services/soundFx';
import {
  X,
  Download,
  CheckCircle2,
  HardDrive,
  Cpu,
  Wifi,
  Shield,
  Play,
  Clock,
  Sparkles,
  ArrowRight,
  Pause,
  AlertCircle,
} from 'lucide-react';

interface DownloadModalProps {
  movie: Movie;
  onClose: () => void;
  onDownloadComplete: (downloaded: DownloadedMovie) => void;
  onWatchNow: (movie: Movie) => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  movie,
  onClose,
  onDownloadComplete,
  onWatchNow,
}) => {
  const [quality, setQuality] = useState<'4K UHD' | '1080p' | '720p'>('4K UHD');
  const [selectedAudio, setSelectedAudio] = useState(
    movie.audioLanguages?.[0] || 'Hindi Dolby Atmos'
  );
  const [status, setStatus] = useState<'idle' | 'downloading' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(64.2); // MB/s
  const [eta, setEta] = useState(12);

  const getEstimatedSize = (q: string) => {
    switch (q) {
      case '4K UHD':
        return movie.downloadSize || '7.8 GB';
      case '1080p':
        return '3.4 GB';
      case '720p':
        return '1.2 GB';
      default:
        return '3.4 GB';
    }
  };

  const startDownload = () => {
    soundFx.playDownloadStart();
    setStatus('downloading');
    setProgress(2);
  };

  useEffect(() => {
    let interval: any;
    if (status === 'downloading') {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setStatus('completed');
            soundFx.playSuccess();

            // Trigger real browser file save of the simulated offline encrypted media package
            try {
              const fileData = {
                title: movie.title,
                movieId: movie.id,
                quality,
                audio: selectedAudio,
                downloadedAt: new Date().toISOString(),
                licenseKey: `IMV-OFFLINE-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
                videoPackage: 'IMOVIES-OFFLINE-ENCRYPTED-HEVC-STREAM-BLOB',
                genres: movie.genres,
                runtime: movie.durationMinutes,
              };
              const blob = new Blob([JSON.stringify(fileData, null, 2)], {
                type: 'application/json',
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${movie.title.replace(/[^a-zA-Z0-9]/g, '_')}_${quality.replace(' ', '_')}.imvpass`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            } catch (err) {
              console.warn('Simulated download file trigger:', err);
            }

            const item: DownloadedMovie = {
              id: `dl_${Date.now()}`,
              movieId: movie.id,
              title: movie.title,
              posterUrl: movie.posterUrl,
              quality,
              fileSize: getEstimatedSize(quality),
              downloadedAt: new Date().toISOString(),
              progress: 100,
              status: 'completed',
              audioTrack: selectedAudio,
              durationMinutes: movie.durationMinutes,
            };
            onDownloadComplete(item);
            return 100;
          }
          const increment = Math.floor(Math.random() * 8) + 5;
          setSpeed(Number((55 + Math.random() * 25).toFixed(1)));
          setEta(Math.max(1, Math.round(((100 - prev) / increment) * 0.4)));
          return Math.min(100, prev + increment);
        });
      }, 350);
    }
    return () => clearInterval(interval);
  }, [status, movie, quality, selectedAudio]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#0a0f0c] border border-emerald-500/40 rounded-xl overflow-hidden shadow-2xl shadow-emerald-950/80 font-sans text-slate-100 flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-emerald-500/20 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Download className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold tracking-wider font-mono text-emerald-300">
                OFFLINE DOWNLOAD VAULT
              </h3>
              <p className="text-[11px] text-slate-400">Tactical Direct Media Packaging</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Movie Info Mini Bar */}
        <div className="p-4 bg-slate-900/40 border-b border-slate-800/80 flex items-center gap-3">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-14 h-20 object-cover rounded border border-emerald-500/30 shadow-md"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-100 truncate">{movie.title}</h4>
            <p className="text-xs text-emerald-400/90 font-mono">
              {movie.languages.join(' · ')}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {movie.durationMinutes} min · {movie.certificate} · Rated {movie.rating}/10
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {status === 'idle' && (
            <>
              {/* Quality Selector */}
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-2">
                  SELECT DOWNLOAD RESOLUTION:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { q: '4K UHD', tag: 'HDR10+ Ultra', size: getEstimatedSize('4K UHD') },
                    { q: '1080p', tag: 'FHD Standard', size: getEstimatedSize('1080p') },
                    { q: '720p', tag: 'Data Saver', size: getEstimatedSize('720p') },
                  ].map((opt) => (
                    <button
                      key={opt.q}
                      onClick={() => {
                        soundFx.playClick();
                        setQuality(opt.q as any);
                      }}
                      className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                        quality === opt.q
                          ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200 shadow-sm shadow-emerald-500/30'
                          : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-mono text-xs font-bold text-slate-200">{opt.q}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">{opt.tag}</span>
                      <span className="text-[11px] font-mono text-emerald-400 font-semibold mt-1">
                        ~{opt.size}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio Track Selector */}
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1.5">
                  AUDIO TRACK EMBED:
                </label>
                <select
                  value={selectedAudio}
                  onChange={(e) => {
                    soundFx.playClick();
                    setSelectedAudio(e.target.value);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:border-emerald-500 focus:outline-none"
                >
                  {(movie.audioLanguages || [
                    'Hindi Dolby Atmos',
                    'English 5.1 Surround',
                    'Tamil 5.1',
                    'Telugu 5.1',
                  ]).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Storage Telemetry */}
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-2 text-slate-300">
                  <HardDrive className="w-4 h-4 text-emerald-400" />
                  Tactical SSD Cache:
                </span>
                <span className="text-emerald-300 font-bold">128 GB Available</span>
              </div>

              {/* Action Button */}
              <button
                onClick={startDownload}
                className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>START OFFLINE DOWNLOAD ({getEstimatedSize(quality)})</span>
              </button>
            </>
          )}

          {status === 'downloading' && (
            <div className="py-4 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-2 text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  DOWNLOADING MEDIA PACKAGE...
                </span>
                <span className="text-slate-400 font-mono">{progress}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-emerald-500/30 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Telemetry Stats */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-[11px] font-mono">
                <div>
                  <span className="text-slate-500 block">SPEED</span>
                  <span className="text-emerald-400 font-bold">{speed} MB/s</span>
                </div>
                <div>
                  <span className="text-slate-500 block">ETA</span>
                  <span className="text-slate-200">{eta}s REMAINING</span>
                </div>
                <div>
                  <span className="text-slate-500 block">FORMAT</span>
                  <span className="text-cyan-400 font-bold">{quality}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 text-center font-mono">
                Encrypted with AES-256 for offline player authorization.
              </p>
            </div>
          )}

          {status === 'completed' && (
            <div className="py-4 space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(16,185,129,0.5)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-100 tracking-wide font-mono">
                  DOWNLOAD COMPLETE!
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Saved to your personal offline vault & encrypted package file generated.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onClose();
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 transition-colors"
                >
                  CLOSE
                </button>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onClose();
                    onWatchNow(movie);
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>PLAY OFFLINE NOW</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
