import React, { useState, useEffect } from 'react';
import { Movie, Show, Theatre } from '../types/cinema';
import { api } from '../services/api';
import { soundFx } from '../services/soundFx';
import {
  X,
  Star,
  Clock,
  Calendar,
  Film,
  MapPin,
  Play,
  Download,
  Ticket,
  Shield,
  ArrowLeft,
  Radio,
  Sliders,
  ChevronRight,
} from 'lucide-react';

interface MovieDetailsModalProps {
  movie: Movie;
  theatres: Theatre[];
  onClose: () => void;
  onSelectShow: (show: Show, movie: Movie, theatre: Theatre) => void;
  onWatchOnline?: (movie: Movie) => void;
  onDownload?: (movie: Movie) => void;
}

export function MovieDetailsModal({
  movie,
  theatres,
  onClose,
  onSelectShow,
  onWatchOnline,
  onDownload,
}: MovieDetailsModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [shows, setShows] = useState<Show[]>([]);
  const [loadingShows, setLoadingShows] = useState<boolean>(true);

  // Next 4 days
  const dateOptions = Array.from({ length: 4 }).map((_, i) => {
    const d = new Date(Date.now() + i * 86400000);
    return {
      dateString: d.toISOString().split('T')[0],
      dayName:
        i === 0
          ? 'Today'
          : i === 1
          ? 'Tomorrow'
          : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
    };
  });

  useEffect(() => {
    async function loadShows() {
      setLoadingShows(true);
      try {
        const fetched = await api.getShows({
          movieId: movie.id,
          date: selectedDate,
        });
        setShows(fetched);
      } catch (err) {
        console.error('Failed to load shows:', err);
      } finally {
        setLoadingShows(false);
      }
    }
    loadShows();
  }, [movie.id, selectedDate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 font-sans"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Viewport Back Arrow Button */}
      <button
        onClick={() => {
          soundFx.playClick();
          onClose();
        }}
        className="fixed top-4 left-4 z-[60] flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#090e0b]/90 hover:bg-[#121c17] border border-emerald-500/40 text-emerald-300 transition-all text-xs font-mono backdrop-blur-md shadow-2xl group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-emerald-400 group-hover:-translate-x-1 transition-transform" />
        <span>BACK TO CATALOG</span>
      </button>

      <div className="bg-[#090e0b] border border-emerald-500/40 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl relative my-6 text-slate-100 flex flex-col">
        {/* Backdrop Header */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          <img
            src={movie.backdropUrl || movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover object-top filter brightness-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090e0b] via-[#090e0b]/60 to-black/30" />

          {/* Corner Reticles */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-emerald-400/50 pointer-events-none" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-emerald-400/50 pointer-events-none" />

          {/* Close button */}
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-black/70 hover:bg-emerald-950/80 border border-emerald-500/40 text-slate-300 hover:text-emerald-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Content */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end gap-5">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-28 sm:w-36 aspect-[2/3] object-cover rounded-xl shadow-2xl border-2 border-emerald-500/50 shrink-0 hidden xs:block"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-emerald-400 font-semibold mb-1.5">
                <span className="flex items-center gap-1 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                  <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                  {movie.rating} / 10
                </span>
                <span className="text-slate-400">
                  [{movie.votesCount.toLocaleString()} VOTES]
                </span>
                <span className="border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] text-slate-300">
                  {movie.certificate}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
                {movie.title}
              </h1>
              <p className="text-xs text-slate-300 italic mt-0.5 max-w-xl font-mono">
                "{movie.tagline}"
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* PRIMARY TACTICAL ACTIONS BAR: WATCH ONLINE & DOWNLOAD */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-black to-emerald-950/40 border border-emerald-500/30 grid grid-cols-1 sm:grid-cols-2 gap-3 shadow-inner">
            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
                onWatchOnline?.(movie);
              }}
              className="py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs tracking-wider transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>WATCH ONLINE IN 4K HDR</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
                onDownload?.(movie);
              }}
              className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-emerald-950/80 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 font-mono text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>OFFLINE DOWNLOAD PASS ({movie.downloadSize || '5.4 GB'})</span>
            </button>
          </div>

          {/* Metadata bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 border-b border-emerald-500/20 pb-4">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Clock className="w-4 h-4" />
              <span>{movie.durationMinutes} MINS</span>
            </div>
            <span>//</span>
            <div>
              <span className="text-slate-500">GENRES: </span>
              <span className="text-slate-200">{movie.genres.join(', ')}</span>
            </div>
            <span>//</span>
            <div>
              <span className="text-slate-500">LANGUAGES: </span>
              <span className="text-emerald-300">{movie.languages.join(', ')}</span>
            </div>
          </div>

          {/* Synopsis */}
          <div>
            <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1.5">
              // MISSION DOSSIER & SYNOPSIS
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              {movie.description}
            </p>
          </div>

          {/* Cast & Director */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono bg-[#0d1410] p-4 rounded-xl border border-emerald-500/20">
            <div>
              <span className="text-slate-500 block text-[11px]">DIRECTOR</span>
              <span className="font-bold text-slate-200">{movie.director}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">STARRING CAST</span>
              <span className="font-bold text-slate-200">{movie.cast.join(', ')}</span>
            </div>
          </div>

          {/* THEATRICAL SHOWTIMES & SEAT RADAR SECTION */}
          <div className="pt-2 border-t border-emerald-500/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-emerald-400" />
                <span>// THEATRICAL AUDITORIUM SHOWTIMES</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                REAL-TIME SEAT RADAR
              </span>
            </div>

            {/* Date Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3">
              {dateOptions.map((opt) => (
                <button
                  key={opt.dateString}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedDate(opt.dateString);
                  }}
                  className={`flex flex-col items-center justify-center min-w-[76px] py-2 px-3 rounded-xl border text-xs font-mono transition-all ${
                    selectedDate === opt.dateString
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-md shadow-emerald-500/30'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300'
                  }`}
                >
                  <span className="text-[10px] uppercase font-medium">{opt.dayName}</span>
                  <span className="text-base font-bold font-mono">{opt.dayNumber}</span>
                  <span className="text-[10px]">{opt.month}</span>
                </button>
              ))}
            </div>

            {/* City Quick Filter for Shows */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 text-xs font-mono">
              <span className="text-[11px] text-slate-400 font-bold shrink-0">City Filter:</span>
              {['All', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Delhi NCR', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Kochi'].map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedCity(c);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all border cursor-pointer ${
                    selectedCity === c
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 font-bold'
                      : 'bg-black/40 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {c === 'All' ? 'All Indian Cities' : c}
                </button>
              ))}
            </div>

            {/* Theatres and Shows */}
            {loadingShows ? (
              <div className="py-8 text-center text-slate-400 text-xs font-mono">
                <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                SYNCING RADAR SHOWTIMES...
              </div>
            ) : shows.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
                No shows scheduled for {selectedDate}. Please select another date.
              </div>
            ) : (
              <div className="space-y-3 mt-2">
                {theatres
                  .filter((t) => {
                    if (selectedCity === 'All') return true;
                    return t.city.toLowerCase() === selectedCity.toLowerCase();
                  })
                  .map((theatre) => {
                    const theatreShows = shows.filter((s) => s.theatreId === theatre.id);
                    if (theatreShows.length === 0) return null;
                    const isIndia = theatre.city !== 'New York' && theatre.city !== 'Los Angeles' && theatre.city !== 'Chicago';

                    return (
                      <div
                        key={theatre.id}
                        className="p-4 bg-[#0d1410] border border-emerald-500/25 rounded-xl space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                                {theatre.city}
                              </span>
                              <h4 className="font-bold text-white text-sm flex items-center gap-1.5 font-mono">
                                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                                {theatre.name}
                              </h4>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{theatre.address}</p>
                            {theatre.landmark && (
                              <p className="text-[10px] text-emerald-400/80 font-mono mt-0.5">
                                Landmark: {theatre.landmark}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-emerald-400/80 font-mono">
                            {theatre.amenities.slice(0, 2).join(' · ')}
                          </div>
                        </div>

                        {/* Showtime Buttons */}
                        <div className="flex flex-wrap items-center gap-2.5 pt-1">
                          {theatreShows.map((show) => {
                            const availableSeats = show.totalSeats - show.bookedSeatsCount;
                            const currencyPrefix = isIndia ? '₹' : '$';
                            return (
                              <button
                                key={show.id}
                                onClick={() => {
                                  soundFx.playClick();
                                  onSelectShow(show, movie, theatre);
                                }}
                                className="group p-2.5 bg-black border border-slate-800 hover:border-emerald-400 rounded-xl text-left transition-all hover:scale-102 hover:shadow-md hover:shadow-emerald-500/20 cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold font-mono text-emerald-300 group-hover:text-emerald-200">
                                    {show.startTime}
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                                    {show.format}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-3 text-[10px] font-mono text-slate-400 mt-1">
                                  <span>from {currencyPrefix}{show.pricing.standard}</span>
                                  <span className="text-emerald-400 font-bold">
                                    {availableSeats} SEATS LEFT
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
