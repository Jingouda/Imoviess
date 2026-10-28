import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { SeatMatrix } from './components/SeatMatrix';
import { CheckoutModal } from './components/CheckoutModal';
import { TicketPassModal } from './components/TicketPassModal';
import { MovieDetailsModal } from './components/MovieDetailsModal';
import { WatchOnlineModal } from './components/WatchOnlineModal';
import { DownloadModal } from './components/DownloadModal';
import { DownloadsView } from './components/DownloadsView';
import { MyBookingsView } from './components/MyBookingsView';
import { AdminConsole } from './components/AdminConsole';
import { CinemasView } from './components/CinemasView';
import { ExperienceView } from './components/ExperienceView';
import { AuthModal } from './components/AuthModal';
import { LoginGate } from './components/LoginGate';
import { PosterApiKeyModal } from './components/PosterApiKeyModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { Movie, Show, Theatre, Seat, Booking, NotificationItem, DownloadedMovie } from './types/cinema';
import { api } from './services/api';
import { soundFx } from './services/soundFx';
import {
  Search,
  Star,
  Clock,
  Sparkles,
  Ticket,
  ChevronRight,
  Shield,
  Film,
  SlidersHorizontal,
  Play,
  Download,
  Tv,
  Globe,
  Radio,
  Gamepad2,
  Zap,
  Key,
} from 'lucide-react';

function CinemaApp() {
  const { user, isAuthenticated, loading: authLoading, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [currentTab, setCurrentTab] = useState<
    'movies' | 'stream_vault' | 'downloads' | 'cinemas' | 'bookings' | 'experience' | 'admin'
  >('movies');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [selectedCity, setSelectedCity] = useState('Madhya Pradesh (All MP)');
  const [selectedAvailability, setSelectedAvailability] = useState<'All' | 'stream' | 'theatres' | 'download'>('All');

  // Modals & Active Flows
  const [selectedMovieForDetails, setSelectedMovieForDetails] = useState<Movie | null>(null);
  const [watchOnlineMovie, setWatchOnlineMovie] = useState<Movie | null>(null);
  const [downloadMovie, setDownloadMovie] = useState<Movie | null>(null);
  const [activeShowForSeats, setActiveShowForSeats] = useState<{
    show: Show;
    movie: Movie;
    theatre: Theatre;
  } | null>(null);
  const [checkoutData, setCheckoutData] = useState<{
    movie: Movie;
    show: Show;
    theatre: Theatre;
    selectedSeats: Seat[];
  } | null>(null);
  const [confirmedBookingForPass, setConfirmedBookingForPass] = useState<Booking | null>(null);

  // Downloaded Movies List (persisted in localStorage)
  const [downloadedMovies, setDownloadedMovies] = useState<DownloadedMovie[]>(() => {
    try {
      const saved = localStorage.getItem('imovies_downloaded_movies');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Navigation Drawers & Config Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [posterApiKeyModalOpen, setPosterApiKeyModalOpen] = useState(false);

  // Initial Data Load
  const loadInitialData = async () => {
    try {
      const [moviesList, theatresList] = await Promise.all([
        api.getMovies(),
        api.getTheatres(),
      ]);
      setMovies(moviesList);
      setTheatres(theatresList);
    } catch (err: any) {
      console.error('Failed to load cinema data:', err);
      showToast('Could not load cinema data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const [bookings, notifs] = await Promise.all([
        api.getBookings(),
        api.getNotifications(),
      ]);
      setUserBookings(bookings);
      setNotifications(notifs);
    } catch (err) {
      console.warn('Failed to fetch user-specific data:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadUserData();
  }, [user]);

  // Handle Download Complete
  const handleDownloadComplete = (downloaded: DownloadedMovie) => {
    setDownloadedMovies((prev) => {
      const filtered = prev.filter((d) => d.movieId !== downloaded.movieId);
      const updated = [downloaded, ...filtered];
      try {
        localStorage.setItem('imovies_downloaded_movies', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast(`Offline Pass generated: ${downloaded.title}`, 'success');
  };

  const handleDeleteDownload = (id: string) => {
    soundFx.playClick();
    setDownloadedMovies((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      try {
        localStorage.setItem('imovies_downloaded_movies', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast('Removed from offline cache', 'info');
  };

  const handlePlayDownloadedMovie = (movieId: string) => {
    const found = movies.find((m) => m.id === movieId);
    if (found) {
      setWatchOnlineMovie(found);
    }
  };

  // Handle movie selection for details
  const handleOpenMovieDetails = (movie: Movie) => {
    soundFx.playClick();
    setSelectedMovieForDetails(movie);
  };

  // Handle showtime selected from modal
  const handleShowtimeSelected = (show: Show, movie: Movie, theatre: Theatre) => {
    soundFx.playClick();
    setSelectedMovieForDetails(null);
    setActiveShowForSeats({ show, movie, theatre });
  };

  // Handle locking seats from seat matrix
  const handleLockSeats = async (seatIds: string[]) => {
    if (!activeShowForSeats) return false;
    try {
      await api.lockSeats(activeShowForSeats.show.id, seatIds, 8);
      return true;
    } catch (err: any) {
      showToast(err.message || 'Seat is currently unavailable', 'error');
      return false;
    }
  };

  // Proceed to Checkout
  const handleProceedToCheckout = (selectedSeats: Seat[]) => {
    if (!activeShowForSeats) return;
    setCheckoutData({
      movie: activeShowForSeats.movie,
      show: activeShowForSeats.show,
      theatre: activeShowForSeats.theatre,
      selectedSeats,
    });
  };

  // Handle Booking Success
  const handleBookingSuccess = (newBooking: Booking) => {
    soundFx.playSuccess();
    setCheckoutData(null);
    setActiveShowForSeats(null);
    setConfirmedBookingForPass(newBooking);
    loadUserData();
    showToast(`Mission Pass Confirmed! +${newBooking.loyaltyPointsEarned || 240} XP Earned`, 'success');
  };

  // Comprehensive Genre and Language Lists for 100 movies
  const genres = [
    'All',
    'Action',
    'Sci-Fi',
    'Mythological',
    'Cyberpunk',
    'Drama',
    'Comedy',
    'Romance',
    'Horror',
    'Thriller',
    'Crime',
    'Anime',
    'War',
    'Fantasy',
    'Adventure',
    'Sports',
    'Musical',
    'Family',
  ];

  const languages = ['All', 'Hindi', 'English', 'Japanese', 'Tamil', 'Telugu', 'Spanish'];
  const formats = ['All', 'IMAX 3D', 'Dolby Cinema', '4DX', 'Standard 2D'];

  // Filtered movies
  const filteredMovies = movies.filter((m) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.cast.some((c) => c.toLowerCase().includes(q)) ||
        m.director.toLowerCase().includes(q) ||
        m.languages.some((l) => l.toLowerCase().includes(q)) ||
        m.genres.some((g) => g.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (selectedGenre !== 'All' && !m.genres.includes(selectedGenre)) {
      return false;
    }
    if (selectedLanguage !== 'All' && !m.languages.includes(selectedLanguage)) {
      return false;
    }
    if (selectedFormat !== 'All' && !m.formats.includes(selectedFormat)) {
      return false;
    }
    if (selectedAvailability === 'stream' && !m.canWatchOnline) {
      return false;
    }
    if (selectedAvailability === 'download' && !m.canDownload) {
      return false;
    }
    if (selectedAvailability === 'theatres' && m.status !== 'now_showing') {
      return false;
    }
    return true;
  });

  const featuredMovie = movies.find((m) => m.featured) || movies[0];

  // RADAR LOADING STATE
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#070b09] flex flex-col items-center justify-center text-emerald-400 font-mono">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20" />
          <div className="absolute inset-0 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
        </div>
        <p className="text-xs tracking-widest">[INITIALIZING TACTICAL SUBSYSTEMS...]</p>
      </div>
    );
  }

  // ENFORCE LOGIN FIRST GATE: User MUST authenticate to enter the application
  if (!isAuthenticated || !user) {
    return <LoginGate />;
  }

  return (
    <div className="min-h-screen bg-[#070b09] text-slate-100 flex flex-col selection:bg-emerald-400 selection:text-slate-950 font-sans">
      {/* Top Bar Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab as any);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        notifications={notifications}
        onOpenNotifications={() => setNotifDrawerOpen(true)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        downloadCount={downloadedMovies.length}
        userAreaName={selectedCity === 'All India' ? 'Bandra BKC, Mumbai' : `${selectedCity} Radar`}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {/* VIEW 1: MOVIES CATALOG (100 TITLES) */}
        {currentTab === 'movies' && (
          <div>
            {/* CINEMATIC HERO SPOTLIGHT */}
            {featuredMovie && (
              <section className="relative w-full h-[500px] sm:h-[560px] overflow-hidden bg-black font-sans">
                <img
                  src={featuredMovie.backdropUrl || featuredMovie.posterUrl}
                  alt={featuredMovie.title}
                  className="w-full h-full object-cover object-center filter brightness-50 contrast-115 scale-102"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070b09] via-[#070b09]/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#070b09] via-[#070b09]/75 to-transparent" />

                {/* HUD Corner Reticles */}
                <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-emerald-400/60 pointer-events-none" />
                <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-emerald-400/60 pointer-events-none" />

                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-2xl space-y-4">
                      {/* Telemetry metadata */}
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-emerald-400 font-semibold tracking-wider">
                        <span className="flex items-center gap-1 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-500/40">
                          <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                          {featuredMovie.rating} / 10
                        </span>
                        <span className="text-slate-500">//</span>
                        <span className="text-slate-300">{featuredMovie.certificate}</span>
                        <span className="text-slate-500">//</span>
                        <span className="text-slate-300">{featuredMovie.durationMinutes} MIN</span>
                        <span className="text-slate-500">//</span>
                        <span className="text-emerald-300 uppercase">
                          {featuredMovie.languages.join(' · ')}
                        </span>
                      </div>

                      <h1 className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight leading-tight uppercase">
                        {featuredMovie.title}
                      </h1>

                      <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed max-w-xl font-sans">
                        {featuredMovie.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        {/* Watch Online Button */}
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            setWatchOnlineMovie(featuredMovie);
                          }}
                          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>WATCH ONLINE (4K HDR)</span>
                        </button>

                        {/* Download Button */}
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            setDownloadMovie(featuredMovie);
                          }}
                          className="px-5 py-3 bg-[#0d1410] hover:bg-emerald-950/80 text-emerald-300 font-mono text-xs sm:text-sm font-bold rounded-xl border border-emerald-500/40 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          <span>DOWNLOAD PASS</span>
                        </button>

                        {/* Reserve Seats Button */}
                        <button
                          onClick={() => handleOpenMovieDetails(featuredMovie)}
                          className="px-5 py-3 bg-black/60 hover:bg-slate-900 text-slate-200 text-xs sm:text-sm font-mono font-medium rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Ticket className="w-4 h-4 text-emerald-400" />
                          <span>THEATRICAL SEATS</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SEARCH & MULTI-GENRE TACTICAL FILTER HUD */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10 font-sans">
              <div className="bg-[#090e0b] border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-emerald-950/40 space-y-4">
                <div className="flex flex-col md:flex-row items-center gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1 w-full flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search 100+ movies (Kalki, Jawan, Dune, Batman, Cyberpunk, RRR, Anime)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/60 border border-emerald-500/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    {/* Poster API Key Sync Button */}
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setPosterApiKeyModalOpen(true);
                      }}
                      className="px-3 py-2.5 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm cursor-pointer"
                      title="Manage Movie Poster API Key"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">POSTER API</span>
                      <span className="text-[10px] bg-emerald-500 text-slate-950 px-1 py-0.2 rounded font-black">100/100</span>
                    </button>
                  </div>

                  {/* Availability / Mode Toggles */}
                  <div className="flex items-center gap-1 p-1 bg-black rounded-xl border border-emerald-500/20 w-full md:w-auto shrink-0 font-mono text-xs">
                    {[
                      { key: 'All', label: 'ALL 100' },
                      { key: 'stream', label: '▶ 4K STREAM' },
                      { key: 'download', label: '⤓ DOWNLOAD' },
                      { key: 'theatres', label: '🎟 IN THEATRES' },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => {
                          soundFx.playClick();
                          setSelectedAvailability(tab.key as any);
                        }}
                        className={`flex-1 md:flex-none px-3.5 py-1.5 font-bold rounded-lg transition-all ${
                          selectedAvailability === tab.key
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language & Genre Segmented Filters */}
                <div className="space-y-3 pt-2 border-t border-emerald-500/20 text-xs font-mono">
                  {/* Language Selector */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    <span className="text-emerald-400 text-[11px] font-bold mr-1 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5" />
                      AUDIO:
                    </span>
                    {languages.map((l) => (
                      <button
                        key={l}
                        onClick={() => {
                          soundFx.playClick();
                          setSelectedLanguage(l);
                        }}
                        className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap transition-colors ${
                          selectedLanguage === l
                            ? 'bg-emerald-400 text-slate-950'
                            : 'bg-black border border-slate-800 text-slate-400 hover:text-white hover:border-emerald-500/40'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>

                  {/* Genre Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    <span className="text-slate-500 text-[11px] font-bold mr-1 uppercase">GENRE:</span>
                    {genres.map((g) => (
                      <button
                        key={g}
                        onClick={() => {
                          soundFx.playClick();
                          setSelectedGenre(g);
                        }}
                        className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                          selectedGenre === g
                            ? 'bg-slate-200 text-slate-950 font-bold'
                            : 'bg-black border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 100 MOVIE CARDS GRID WITH 2:3 POSTERS & ACTION TRIGGERS */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <h2 className="text-xl sm:text-2xl font-black font-display text-white tracking-wide uppercase">
                      Tactical Movie Radar
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    100 Blockbusters with 4K Streaming, Offline Downloads, and Theatrical Auditoriums
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-500/30">
                  {filteredMovies.length} TITLES DETECTED
                </span>
              </div>

              {filteredMovies.length === 0 ? (
                <div className="py-20 text-center bg-[#090e0b] border border-slate-800 rounded-2xl font-mono">
                  <Film className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-white">NO MOVIES MATCH SELECTED FILTERS</p>
                  <p className="text-xs text-slate-400 mt-1">Try resetting the language, format, or search keywords.</p>
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setSearchQuery('');
                      setSelectedGenre('All');
                      setSelectedLanguage('All');
                      setSelectedFormat('All');
                      setSelectedAvailability('All');
                    }}
                    className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
                  >
                    RESET ALL FILTERS
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredMovies.map((movie) => (
                    <div
                      key={movie.id}
                      className="group relative bg-[#090e0b] border border-emerald-500/25 hover:border-emerald-400 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-emerald-500/15 transition-all duration-300 flex flex-col"
                    >
                      {/* Corner Reticles on Card */}
                      <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-emerald-400/40 pointer-events-none group-hover:border-emerald-400" />
                      <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-emerald-400/40 pointer-events-none group-hover:border-emerald-400" />

                      {/* 2:3 Vertical Poster */}
                      <div
                        onClick={() => handleOpenMovieDetails(movie)}
                        className="relative aspect-[2/3] w-full overflow-hidden bg-black cursor-pointer"
                      >
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#090e0b] via-transparent to-transparent opacity-90" />

                        {/* Top Rating Badge */}
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded bg-black/85 backdrop-blur-md border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold shadow-md">
                          <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                          <span>{movie.rating}</span>
                        </div>

                        {/* Top Left Certificate & Language */}
                        <div className="absolute top-3 left-3 flex items-center gap-1">
                          <span className="px-2 py-0.5 rounded bg-black/85 backdrop-blur-md border border-slate-700 text-slate-300 font-mono text-[10px] font-bold">
                            {movie.certificate}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-emerald-300 font-mono text-[10px]">
                            {movie.languages[0]}
                          </span>
                        </div>

                        {/* Quick Stream Launch Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              soundFx.playClick();
                              setWatchOnlineMovie(movie);
                            }}
                            className="p-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-xl shadow-emerald-500/50 transform group-hover:scale-110 transition-transform"
                            title="Instant 4K Play"
                          >
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          </button>
                        </div>

                        {/* Bottom Overlay Info */}
                        <div className="absolute bottom-2.5 left-3 right-3">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                            <span>{movie.durationMinutes} MIN</span>
                            <span>·</span>
                            <span className="truncate text-slate-300">{movie.genres.slice(0, 2).join(', ')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h3
                            onClick={() => handleOpenMovieDetails(movie)}
                            className="font-bold text-base font-display text-white group-hover:text-emerald-300 transition-colors cursor-pointer truncate"
                          >
                            {movie.title}
                          </h3>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                            {movie.description}
                          </p>
                        </div>

                        {/* Action Buttons: Watch Online / Download / Theatrical Seats */}
                        <div className="pt-2 border-t border-emerald-500/20 space-y-2">
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              onClick={() => {
                                soundFx.playClick();
                                setWatchOnlineMovie(movie);
                              }}
                              className="py-1.5 px-2 bg-emerald-500/20 hover:bg-emerald-500 border border-emerald-500/50 text-emerald-300 hover:text-slate-950 font-mono text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>WATCH 4K</span>
                            </button>
                            <button
                              onClick={() => {
                                soundFx.playClick();
                                setDownloadMovie(movie);
                              }}
                              className="py-1.5 px-2 bg-slate-900 hover:bg-emerald-950/80 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 font-mono text-[11px] rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Download className="w-3 h-3" />
                              <span>DOWNLOAD</span>
                            </button>
                          </div>

                          <button
                            onClick={() => handleOpenMovieDetails(movie)}
                            className="w-full py-2 bg-black hover:bg-slate-900 text-emerald-400 hover:text-white border border-emerald-500/30 hover:border-emerald-400 font-mono text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Ticket className="w-3.5 h-3.5" />
                            <span>BOOK THEATRICAL SEATS</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* VIEW 2: 4K STREAM VAULT */}
        {currentTab === 'stream_vault' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-[#0d1410] to-[#090e0b] border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-2 font-mono text-xs text-emerald-400">
                <Tv className="w-4 h-4" />
                <span>4K ULTRA HD CYBER STREAMING VAULT</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-display text-white uppercase tracking-tight">
                Watch Full Blockbusters Online
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                Stream cinema releases at 24.8 Mbps HEVC with Dolby Atmos audio dub tracks, ambient reactive backlighting, and instant subtitles.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {movies.map((movie) => (
                <div
                  key={movie.id}
                  className="bg-[#090e0b] border border-emerald-500/30 hover:border-emerald-400 rounded-xl overflow-hidden group shadow-lg transition-all duration-300 flex flex-col"
                >
                  <div className="relative aspect-video overflow-hidden bg-black cursor-pointer" onClick={() => setWatchOnlineMovie(movie)}>
                    <img
                      src={movie.backdropUrl || movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-mono text-[10px] font-bold">
                      4K UHD HDR
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFx.playClick();
                        setWatchOnlineMovie(movie);
                      }}
                      className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center opacity-85 group-hover:opacity-100 transition-all transform group-hover:scale-110 shadow-lg shadow-emerald-500/50"
                    >
                      <Play className="w-5 h-5 ml-0.5 fill-current" />
                    </button>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors truncate">
                        {movie.title}
                      </h3>
                      <p className="text-[11px] text-emerald-400/80 font-mono mt-1">
                        {movie.languages.join(' · ')}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-slate-800">
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          setWatchOnlineMovie(movie);
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all flex items-center justify-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>PLAY 4K</span>
                      </button>
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          setDownloadMovie(movie);
                        }}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-emerald-300 transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: OFFLINE DOWNLOADS VAULT */}
        {currentTab === 'downloads' && (
          <DownloadsView
            downloadedMovies={downloadedMovies}
            onPlayMovie={handlePlayDownloadedMovie}
            onDeleteDownload={handleDeleteDownload}
            onExploreMovies={() => setCurrentTab('movies')}
          />
        )}

        {/* VIEW 4: CINEMAS DIRECTORY & NEARBY INDIAN RADAR */}
        {currentTab === 'cinemas' && (
          <CinemasView
            theatres={theatres}
            movies={movies}
            selectedCity={selectedCity}
            onCityChange={(city) => setSelectedCity(city)}
            onSelectShow={(show, movie, theatre) => {
              handleShowtimeSelected(show, movie, theatre);
            }}
            onSelectTheatre={(theatre) => {
              setSelectedCity(theatre.city);
              setCurrentTab('movies');
            }}
            onBack={() => setCurrentTab('movies')}
          />
        )}

        {/* VIEW 5: MY BOOKINGS & PASSES */}
        {currentTab === 'bookings' && (
          <MyBookingsView
            bookings={userBookings}
            onRefreshBookings={loadUserData}
            onViewTicket={(b) => setConfirmedBookingForPass(b)}
            onBrowseMovies={() => setCurrentTab('movies')}
          />
        )}

        {/* VIEW 6: EXPERIENCE FORMATS */}
        {currentTab === 'experience' && (
          <ExperienceView onExploreMovies={() => setCurrentTab('movies')} />
        )}

        {/* VIEW 7: ADMIN CONSOLE */}
        {currentTab === 'admin' && isAdmin && (
          <AdminConsole
            theatres={theatres}
            onMovieAddedOrUpdated={() => {
              loadInitialData();
              loadUserData();
            }}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-emerald-500/20 bg-[#060907] py-8 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-slate-200">IMOVIES CINEMA</span>
            <span>//</span>
            <span>PREMIER THEATRES, RADAR BOOKING & 4K STREAM VAULT</span>
          </div>
          <div className="flex items-center gap-6 text-[11px] text-slate-400">
            <span>IMAX 70MM</span>
            <span>·</span>
            <span>DOLBY ATMOS 128-CH</span>
            <span>·</span>
            <span>4K HDR HEVC STREAMING</span>
            <span>·</span>
            <span className="text-emerald-400">STATUS: OPERATIONAL 100%</span>
          </div>
        </div>
      </footer>

      {/* MODAL 1: TACTICAL SEAT RADAR MATRIX */}
      {activeShowForSeats && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/95">
          <SeatMatrix
            show={activeShowForSeats.show}
            movie={activeShowForSeats.movie}
            theatre={activeShowForSeats.theatre}
            onBack={() => setActiveShowForSeats(null)}
            onProceedToCheckout={handleProceedToCheckout}
            onLockSeats={handleLockSeats}
          />
        </div>
      )}

      {/* MODAL 2: WATCH ONLINE 4K CYBER PLAYER */}
      {watchOnlineMovie && (
        <WatchOnlineModal
          movie={watchOnlineMovie}
          onClose={() => setWatchOnlineMovie(null)}
          onSwitchToDownload={(m) => {
            setWatchOnlineMovie(null);
            setDownloadMovie(m);
          }}
        />
      )}

      {/* MODAL 3: OFFLINE DOWNLOAD MANAGER */}
      {downloadMovie && (
        <DownloadModal
          movie={downloadMovie}
          onClose={() => setDownloadMovie(null)}
          onDownloadComplete={handleDownloadComplete}
          onWatchNow={(m) => setWatchOnlineMovie(m)}
        />
      )}

      {/* MODAL 4: MOVIE DETAILS MISSION DOSSIER */}
      {selectedMovieForDetails && (
        <MovieDetailsModal
          movie={selectedMovieForDetails}
          theatres={theatres}
          onClose={() => setSelectedMovieForDetails(null)}
          onSelectShow={handleShowtimeSelected}
          onWatchOnline={(m) => setWatchOnlineMovie(m)}
          onDownload={(m) => setDownloadMovie(m)}
        />
      )}

      {/* MODAL 5: CHECKOUT MODAL */}
      {checkoutData && (
        <CheckoutModal
          movie={checkoutData.movie}
          show={checkoutData.show}
          theatre={checkoutData.theatre}
          selectedSeats={checkoutData.selectedSeats}
          onClose={() => setCheckoutData(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {/* MODAL 6: HOLOGRAPHIC TICKET PASS MODAL */}
      {confirmedBookingForPass && (
        <TicketPassModal
          booking={confirmedBookingForPass}
          onClose={() => setConfirmedBookingForPass(null)}
          onViewMyBookings={() => {
            setConfirmedBookingForPass(null);
            setCurrentTab('bookings');
          }}
        />
      )}

      {/* MODAL 7: AUTH MODAL */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* MODAL 8: POSTER API KEY SYNC MODAL */}
      <PosterApiKeyModal
        isOpen={posterApiKeyModalOpen}
        onClose={() => setPosterApiKeyModalOpen(false)}
        onPostersUpdated={loadInitialData}
      />

      {/* MODAL 8: NOTIFICATION DRAWER */}
      <NotificationDrawer
        isOpen={notifDrawerOpen}
        notifications={notifications}
        onClose={() => setNotifDrawerOpen(false)}
        onRefresh={loadUserData}
        onSelectBookingNotification={() => {
          setNotifDrawerOpen(false);
          setCurrentTab('bookings');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CinemaApp />
      </AuthProvider>
    </ToastProvider>
  );
}
