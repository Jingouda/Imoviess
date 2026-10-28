import React from 'react';
import { DownloadedMovie, Movie } from '../types/cinema';
import { soundFx } from '../services/soundFx';
import {
  Download,
  Play,
  Trash2,
  HardDrive,
  Clock,
  Sparkles,
  WifiOff,
  Film,
  CheckCircle2,
} from 'lucide-react';

interface DownloadsViewProps {
  downloadedMovies: DownloadedMovie[];
  onPlayMovie: (movieId: string) => void;
  onDeleteDownload: (downloadId: string) => void;
  onExploreMovies: () => void;
}

export const DownloadsView: React.FC<DownloadsViewProps> = ({
  downloadedMovies,
  onPlayMovie,
  onDeleteDownload,
  onExploreMovies,
}) => {
  const totalSizeGB = downloadedMovies.reduce((acc, m) => {
    const num = parseFloat(m.fileSize) || 3.5;
    return acc + num;
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Banner Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#0d1410] via-[#111c16] to-[#0d1410] border border-emerald-500/30 shadow-xl shadow-emerald-950/40">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono tracking-wider text-emerald-400">
              TACTICAL OFFLINE VAULT
            </span>
            <span className="text-xs text-slate-400 font-mono">
              [ENCRYPTED LOCAL STORAGE]
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 font-display">
            Downloaded Media & Offline Passes
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Access your 4K and 1080p downloaded blockbusters on airplanes, high-speed rail, or zero-connectivity missions without internet.
          </p>
        </div>

        {/* Tactical Storage Gauge */}
        <div className="p-4 rounded-xl bg-black/50 border border-emerald-500/20 flex flex-col gap-2 min-w-[260px]">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-300">
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              Local SSD Cache:
            </span>
            <span className="text-emerald-400 font-bold">{totalSizeGB.toFixed(1)} GB / 128 GB</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalSizeGB / 128) * 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>{downloadedMovies.length} TITLES SAVED</span>
            <span>READY FOR OFFLINE PLAY</span>
          </div>
        </div>
      </div>

      {/* Downloads List or Empty State */}
      {downloadedMovies.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-2xl bg-[#0d1410]/50 border border-slate-800 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
            <WifiOff className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-200 font-mono">
            YOUR OFFLINE VAULT IS EMPTY
          </h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md">
            Download your favorite Hindi and Hollywood blockbusters in 4K HDR to watch on the go with zero buffering.
          </p>
          <button
            onClick={() => {
              soundFx.playClick();
              onExploreMovies();
            }}
            className="mt-6 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono tracking-wider transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <Film className="w-4 h-4" />
            <span>BROWSE 100+ MOVIES</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {downloadedMovies.map((item) => (
            <div
              key={item.id}
              className="group relative bg-[#0d1410] border border-emerald-500/25 hover:border-emerald-400/80 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              {/* Poster Graphic with Play Overlay */}
              <div className="relative aspect-[16/10] overflow-hidden bg-black">
                <img
                  src={item.posterUrl}
                  alt={item.title}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                {/* Quality & Offline Badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/90 text-slate-950 font-mono text-[10px] font-bold">
                    {item.quality}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-black/75 border border-emerald-500/40 text-emerald-300 font-mono text-[10px]">
                    OFFLINE READY
                  </span>
                </div>

                {/* File size badge */}
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 font-mono text-[10px] text-slate-300">
                  {item.fileSize}
                </div>

                {/* Center Quick Play Trigger */}
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onPlayMovie(item.movieId);
                  }}
                  className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-emerald-500/90 hover:bg-emerald-400 text-slate-950 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-110 shadow-lg shadow-emerald-500/50"
                  title="Play Movie Offline"
                >
                  <Play className="w-5 h-5 ml-0.5 fill-current" />
                </button>
              </div>

              {/* Information Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-emerald-400/80 font-mono mt-1">
                    AUDIO: {item.audioTrack}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Saved {new Date(item.downloadedAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onPlayMovie(item.movieId);
                    }}
                    className="flex-1 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 border border-emerald-500/50 text-emerald-300 hover:text-slate-950 font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>PLAY OFFLINE</span>
                  </button>
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onDeleteDownload(item.id);
                    }}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-red-950/60 border border-slate-800 hover:border-red-500/50 text-slate-400 hover:text-red-400 transition-colors"
                    title="Remove from Local Storage"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
