import React, { useState, useEffect, useRef } from 'react';
import { Movie } from '../types/cinema';
import { soundFx } from '../services/soundFx';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sliders,
  RotateCcw,
  RotateCw,
  Tv,
  Wifi,
  Sparkles,
  Shield,
  Radio,
  Download,
  Info,
} from 'lucide-react';

interface WatchOnlineModalProps {
  movie: Movie;
  onClose: () => void;
  onSwitchToDownload?: (movie: Movie) => void;
}

export const WatchOnlineModal: React.FC<WatchOnlineModalProps> = ({
  movie,
  onClose,
  onSwitchToDownload,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(45);
  const [duration] = useState(movie.durationMinutes * 60 || 7200);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [quality, setQuality] = useState<'4K UHD' | '1080p' | '720p'>('4K UHD');
  const [selectedAudio, setSelectedAudio] = useState(
    movie.audioLanguages?.[0] || 'Hindi Dolby Atmos'
  );
  const [subtitle, setSubtitle] = useState<'English' | 'Hindi' | 'Off'>('English');
  const [theaterMode, setTheaterMode] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<any>(null);

  useEffect(() => {
    soundFx.playStreamStart();
  }, []);

  // Timer simulation for playback
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => (prev >= duration ? 0 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSettingsMenu(false);
      }
    }, 3500);
  };

  const togglePlay = () => {
    soundFx.playClick();
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(Number(e.target.value));
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const toggleFullscreen = () => {
    soundFx.playClick();
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const availableAudioTracks = movie.audioLanguages || [
    'Hindi Dolby Atmos',
    'English 5.1 Surround',
    'Tamil 5.1',
    'Director Commentary',
  ];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 transition-all duration-500 ${
        theaterMode ? 'bg-black/95 backdrop-blur-2xl' : 'bg-black/85 backdrop-blur-md'
      }`}
      onMouseMove={handleMouseMove}
    >
      {/* Ambient reactive cinema glow around player */}
      <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/15 via-cyan-500/10 to-emerald-500/15 rounded-3xl blur-3xl opacity-60 pointer-events-none" />

      {/* Main Tactical Player Container */}
      <div
        ref={containerRef}
        className="relative w-full max-w-5xl bg-[#090e0b] border border-emerald-500/40 rounded-xl overflow-hidden shadow-2xl shadow-emerald-950/80 flex flex-col group font-sans"
      >
        {/* Top Tactical Telemetry Header */}
        <div
          className={`absolute top-0 inset-x-0 z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/90 via-black/60 to-transparent transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/50 text-[11px] font-mono tracking-wider text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>TACTICAL STREAM // {quality}</span>
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-100 tracking-wide flex items-center gap-2">
                {movie.title}
                <span className="text-xs font-mono text-emerald-400/80">[{movie.certificate}]</span>
              </h2>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {movie.genres.join(' · ')} · {movie.durationMinutes} MIN · DIRECTED BY {movie.director.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Download Quick Button */}
            {onSwitchToDownload && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onSwitchToDownload(movie);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900/80 hover:bg-emerald-950/80 border border-emerald-500/30 text-xs font-mono text-emerald-300 transition-colors"
                title="Download for offline viewing"
              >
                <Download className="w-3.5 h-3.5" />
                <span>OFFLINE PASS</span>
              </button>
            )}

            {/* Ambient Theater Mode Toggle */}
            <button
              onClick={() => {
                soundFx.playClick();
                setTheaterMode(!theaterMode);
              }}
              className={`p-2 rounded border transition-colors ${
                theaterMode
                  ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
              title="Toggle Ambient Theater Glow"
            >
              <Tv className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="p-2 rounded bg-slate-900/80 hover:bg-red-950/60 border border-slate-700 hover:border-red-500 text-slate-300 hover:text-red-300 transition-colors"
              title="Exit Player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Canvas Stage with Backdrop Image & HUD Scanline */}
        <div
          className="relative aspect-video w-full bg-black flex items-center justify-center cursor-pointer select-none overflow-hidden"
          onClick={togglePlay}
        >
          {/* Backdrop Graphic */}
          <img
            src={movie.backdropUrl || movie.posterUrl}
            alt={movie.title}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isPlaying ? 'scale-105' : 'scale-100 filter brightness-75'
            }`}
          />

          {/* Futuristic Cyber Scanlines & Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />

          {/* HUD Corner Reticles */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-emerald-500/50 pointer-events-none" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-emerald-500/50 pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-emerald-500/50 pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-emerald-500/50 pointer-events-none" />

          {/* Real-time Telemetry Overlay (Top Right of Canvas) */}
          <div className="absolute top-16 right-4 hidden sm:flex flex-col items-end gap-1 pointer-events-none text-[10px] font-mono text-emerald-400/70 bg-black/60 px-2.5 py-1.5 rounded border border-emerald-500/20 backdrop-blur-sm">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              NODE: AP-MUMBAI-01 // PING: 11ms
            </span>
            <span>BITRATE: 24.8 Mbps [HEVC-HDR10+]</span>
            <span>AUDIO: {selectedAudio.toUpperCase()}</span>
          </div>

          {/* Center Play/Pause Flash Indicator */}
          {!isPlaying && (
            <div className="absolute w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.5)] backdrop-blur-md transform transition-transform hover:scale-110">
              <Play className="w-8 h-8 ml-1" />
            </div>
          )}

          {/* Simulated Subtitles */}
          {isPlaying && subtitle !== 'Off' && (
            <div className="absolute bottom-16 inset-x-0 flex justify-center pointer-events-none px-6">
              <p className="bg-black/75 px-4 py-1.5 rounded border border-slate-700 text-sm sm:text-base font-medium text-amber-200 tracking-wide text-center max-w-xl backdrop-blur-sm">
                [Subtitles · {subtitle}]: "Every moment leads to this reckoning."
              </p>
            </div>
          )}
        </div>

        {/* Bottom Playback Controls HUD */}
        <div
          className={`absolute bottom-0 inset-x-0 z-30 p-4 bg-gradient-to-t from-black via-black/90 to-transparent transition-opacity duration-300 flex flex-col gap-2 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Scrubber Progress Bar */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-emerald-400 min-w-10">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 hover:h-2 transition-all"
            />
            <span className="text-[11px] font-mono text-slate-400 min-w-10 text-right">
              {formatTime(duration)}
            </span>
          </div>

          {/* Control Bar Actions */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="p-2 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-transform hover:scale-105"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              {/* Seek -10s / +10s */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  setCurrentTime((t) => Math.max(0, t - 10));
                }}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-emerald-400 transition-colors"
                title="Rewind 10s"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setCurrentTime((t) => Math.min(duration, t + 10));
                }}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-emerald-400 transition-colors"
                title="Forward 10s"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-1.5 group/vol">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setIsMuted(!isMuted);
                  }}
                  className="p-1.5 text-slate-300 hover:text-emerald-400 transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(Number(e.target.value));
                    setIsMuted(false);
                  }}
                  className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>
            </div>

            {/* Right Side Settings: Audio, Quality, Subtitles, Fullscreen */}
            <div className="flex items-center gap-2">
              {/* Quality Selector */}
              <div className="relative">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setShowSettingsMenu(!showSettingsMenu);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-emerald-500 text-xs font-mono text-emerald-300 transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{quality}</span>
                </button>

                {/* Settings Dropdown Popover */}
                {showSettingsMenu && (
                  <div className="absolute right-0 bottom-full mb-2 w-64 bg-[#0d1410] border border-emerald-500/40 rounded-lg p-3 shadow-2xl backdrop-blur-md z-40 text-xs">
                    <div className="text-[10px] font-mono text-emerald-400 tracking-wider mb-2 border-b border-emerald-500/20 pb-1">
                      STREAM CONFIGURATION
                    </div>

                    {/* Resolution Choice */}
                    <div className="mb-3">
                      <label className="text-[11px] text-slate-400 block mb-1">Resolution Quality</label>
                      <div className="grid grid-cols-3 gap-1">
                        {(['4K UHD', '1080p', '720p'] as const).map((q) => (
                          <button
                            key={q}
                            onClick={() => {
                              soundFx.playClick();
                              setQuality(q);
                            }}
                            className={`px-2 py-1 rounded font-mono text-[10px] border transition-colors ${
                              quality === q
                                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
                            }`}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Audio Track */}
                    <div className="mb-3">
                      <label className="text-[11px] text-slate-400 block mb-1">Audio Track</label>
                      <select
                        value={selectedAudio}
                        onChange={(e) => {
                          soundFx.playClick();
                          setSelectedAudio(e.target.value);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                      >
                        {availableAudioTracks.map((track) => (
                          <option key={track} value={track}>
                            {track}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Subtitles */}
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Subtitles</label>
                      <div className="flex gap-1">
                        {(['English', 'Hindi', 'Off'] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() => {
                              soundFx.playClick();
                              setSubtitle(s);
                            }}
                            className={`flex-1 px-2 py-1 rounded font-mono text-[10px] border transition-colors ${
                              subtitle === s
                                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-emerald-400 transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
