import React, { useState, useEffect } from 'react';
import { AnalyticsSummary, Movie, Show, Theatre, Booking } from '../types/cinema';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  DollarSign,
  Ticket,
  Users,
  Percent,
  Plus,
  Trash2,
  Edit,
  RotateCcw,
  Calendar,
  Film,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  ArrowLeft,
} from 'lucide-react';

interface AdminConsoleProps {
  theatres: Theatre[];
  onMovieAddedOrUpdated: () => void;
  onBackToMovies?: () => void;
}

export function AdminConsole({ theatres, onMovieAddedOrUpdated, onBackToMovies }: AdminConsoleProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'analytics' | 'movies' | 'shows' | 'bookings'>('analytics');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Search filter for bookings
  const [bookingSearch, setBookingSearch] = useState('');

  // New Movie Modal
  const [showAddMovieModal, setShowAddMovieModal] = useState(false);
  const [newMovieForm, setNewMovieForm] = useState({
    title: '',
    tagline: '',
    description: '',
    genres: 'Action, Sci-Fi',
    languages: 'English',
    durationMinutes: 135,
    certificate: 'PG-13',
    director: '',
    cast: '',
    posterUrl: '/src/assets/images/poster_sci_fi_1793119908580.jpg',
    backdropUrl: '/src/assets/images/hero_cinema_hall_1793119894097.jpg',
    formats: 'IMAX 3D, Dolby Cinema',
    status: 'now_showing',
  });

  // New Show Modal
  const [showAddShowModal, setShowAddShowModal] = useState(false);
  const [newShowForm, setNewShowForm] = useState({
    movieId: '',
    theatreId: theatres[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    startTime: '04:00 PM',
    endTime: '06:45 PM',
    format: 'IMAX 3D',
    pricingStandard: 14,
    pricingPremium: 20,
    pricingVip: 30,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsData, moviesData, showsData, bookingsData] = await Promise.all([
        api.getAnalytics(),
        api.getMovies(),
        api.getShows(),
        api.getBookings(true),
      ]);
      setAnalytics(analyticsData);
      setMovies(moviesData);
      setShows(showsData);
      setAllBookings(bookingsData);
      if (moviesData.length > 0 && !newShowForm.movieId) {
        setNewShowForm((prev) => ({ ...prev, movieId: moviesData[0].id }));
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createMovie({
        ...newMovieForm,
        genres: newMovieForm.genres.split(',').map((g) => g.trim()),
        languages: newMovieForm.languages.split(',').map((l) => l.trim()),
        cast: newMovieForm.cast.split(',').map((c) => c.trim()),
        formats: newMovieForm.formats.split(',').map((f) => f.trim()),
        durationMinutes: Number(newMovieForm.durationMinutes),
        certificate: newMovieForm.certificate as any,
        status: newMovieForm.status as any,
      });
      showToast(`Movie "${newMovieForm.title}" added to catalog!`, 'success');
      setShowAddMovieModal(false);
      loadData();
      onMovieAddedOrUpdated();
    } catch (err: any) {
      showToast(err.message || 'Failed to add movie', 'error');
    }
  };

  const handleDeleteMovie = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? Associated shows will also be removed.`)) return;
    try {
      await api.deleteMovie(id);
      showToast(`Movie "${title}" deleted`, 'info');
      loadData();
      onMovieAddedOrUpdated();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete movie', 'error');
    }
  };

  const handleAddShow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createShow({
        movieId: newShowForm.movieId,
        theatreId: newShowForm.theatreId,
        date: newShowForm.date,
        startTime: newShowForm.startTime,
        endTime: newShowForm.endTime,
        format: newShowForm.format,
        pricing: {
          standard: Number(newShowForm.pricingStandard),
          premium: Number(newShowForm.pricingPremium),
          vip: Number(newShowForm.pricingVip),
        },
      });
      showToast('Show scheduled successfully!', 'success');
      setShowAddShowModal(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to schedule show', 'error');
    }
  };

  const handleDeleteShow = async (id: string) => {
    try {
      await api.deleteShow(id);
      showToast('Show deleted', 'info');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete show', 'error');
    }
  };

  const handleResetDemo = async () => {
    if (!confirm('Reset database to initial seed data? Custom added shows/movies and bookings will revert to default.')) return;
    try {
      await api.resetDemoData();
      showToast('Database reset to initial demo state', 'success');
      loadData();
      onMovieAddedOrUpdated();
    } catch (err: any) {
      showToast(err.message || 'Failed to reset demo data', 'error');
    }
  };

  const filteredBookings = allBookings.filter((b) => {
    if (!bookingSearch) return true;
    const q = bookingSearch.toLowerCase();
    return (
      b.bookingCode.toLowerCase().includes(q) ||
      b.userName.toLowerCase().includes(q) ||
      b.movieTitle.toLowerCase().includes(q) ||
      b.userEmail.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-100">
      {onBackToMovies && (
        <button
          onClick={onBackToMovies}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 font-semibold mb-5 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Movies</span>
        </button>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Admin Cinema Management Panel
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time box office analytics, movie catalog inventory, scheduling, and live customer bookings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDemo}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo DB</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Box Office Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-white">
              ${analytics.totalRevenue.toLocaleString()}
            </p>
            <span className="text-[11px] text-emerald-400 mt-1 block">+18.4% vs last week</span>
          </div>

          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Total Tickets Sold</span>
              <Ticket className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-white">
              {analytics.totalTicketsSold}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">across {analytics.totalBookings} orders</span>
          </div>

          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Auditorium Occupancy</span>
              <Percent className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-white">
              {analytics.occupancyRate}%
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">Real-time seat utilization</span>
          </div>

          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Active Screens</span>
              <Film className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-white">
              {shows.length} shows
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">{analytics.activeMoviesCount} movies showing</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-amber-400 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Box Office Analytics
        </button>
        <button
          onClick={() => setActiveTab('movies')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'movies'
              ? 'bg-amber-400 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Movie Catalog ({movies.length})
        </button>
        <button
          onClick={() => setActiveTab('shows')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'shows'
              ? 'bg-amber-400 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Show Scheduling ({shows.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'bookings'
              ? 'bg-amber-400 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Master Bookings ({allBookings.length})
        </button>
      </div>

      {/* TAB CONTENT: ANALYTICS */}
      {activeTab === 'analytics' && analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by Movie */}
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Revenue Breakdown by Movie
            </h3>
            <div className="space-y-3">
              {analytics.revenueByMovie.map((item) => (
                <div key={item.movieId} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-200">{item.title}</span>
                    <span className="font-mono text-amber-300 font-bold">
                      ${item.revenue.toFixed(2)} ({item.tickets} tickets)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-400 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, (item.revenue / (analytics.totalRevenue || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Sales Table */}
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Daily Performance
            </h3>
            <div className="divide-y divide-slate-800 text-xs">
              {analytics.dailySales.map((day) => (
                <div key={day.date} className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-300 font-medium">{day.date}</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-100">
                      ${day.amount.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {day.tickets} tickets issued
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: MOVIES */}
      {activeTab === 'movies' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-400">Manage film releases, durations, age ratings, and formats.</p>
            <button
              onClick={() => setShowAddMovieModal(true)}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Movie</span>
            </button>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Poster / Title</th>
                    <th className="py-3 px-4">Genres</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4">Formats</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {movies.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={m.posterUrl}
                          alt={m.title}
                          referrerPolicy="no-referrer"
                          className="w-10 h-14 object-cover rounded border border-slate-800 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-white">{m.title}</p>
                          <p className="text-[11px] text-slate-400">{m.certificate} · Dir: {m.director}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">{m.genres.join(', ')}</td>
                      <td className="py-3 px-4 font-mono">{m.durationMinutes}m</td>
                      <td className="py-3 px-4 font-mono text-amber-300">★ {m.rating}</td>
                      <td className="py-3 px-4 text-[11px]">{m.formats.join(', ')}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            m.status === 'now_showing'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                          }`}
                        >
                          {m.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteMovie(m.id, m.title)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition-colors"
                          title="Delete movie"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SHOWS */}
      {activeTab === 'shows' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-400">Schedule daily showtimes, screens, and ticket pricing tiers.</p>
            <button
              onClick={() => setShowAddShowModal(true)}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule New Show</span>
            </button>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Movie</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Cinema Theatre</th>
                    <th className="py-3 px-4">Format</th>
                    <th className="py-3 px-4">Pricing (Std/Prem/VIP)</th>
                    <th className="py-3 px-4">Booked Seats</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {shows.map((show) => {
                    const movie = movies.find((m) => m.id === show.movieId);
                    const theatre = theatres.find((t) => t.id === show.theatreId);
                    return (
                      <tr key={show.id} className="hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-bold text-white">
                          {movie?.title || show.movieId}
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {show.date} at <span className="text-amber-300">{show.startTime}</span>
                        </td>
                        <td className="py-3 px-4">{theatre?.name || show.theatreId}</td>
                        <td className="py-3 px-4 font-medium text-amber-400">{show.format}</td>
                        <td className="py-3 px-4 font-mono">
                          ${show.pricing.standard} / ${show.pricing.premium} / ${show.pricing.vip}
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <span className="text-amber-300">{show.bookedSeatsCount}</span> / {show.totalSeats}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteShow(show.id)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition-colors"
                            title="Delete show"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by code, customer, or movie..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <p className="text-xs text-slate-400">Total Bookings: {filteredBookings.length}</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Booking Ref</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Movie & Format</th>
                    <th className="py-3 px-4">Show Schedule</th>
                    <th className="py-3 px-4">Seats</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">
                        {b.bookingCode}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-white">{b.userName}</p>
                        <p className="text-[11px] text-slate-400">{b.userEmail}</p>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-200">
                        {b.movieTitle} ({b.format})
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {b.showDate} {b.showTime}
                      </td>
                      <td className="py-3 px-4 font-mono text-amber-300 font-semibold">
                        {b.seats.map((s) => s.seatId).join(', ')}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        ${b.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            b.bookingStatus === 'confirmed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {b.bookingStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD MOVIE */}
      {showAddMovieModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121622] border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Add Movie to Catalog</h3>
            <form onSubmit={handleAddMovie} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Movie Title</label>
                <input
                  type="text"
                  required
                  value={newMovieForm.title}
                  onChange={(e) => setNewMovieForm({ ...newMovieForm, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  placeholder="e.g. Dune: Part Three"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tagline</label>
                <input
                  type="text"
                  value={newMovieForm.tagline}
                  onChange={(e) => setNewMovieForm({ ...newMovieForm, tagline: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  placeholder="e.g. Beyond the edge of fear."
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Synopsis</label>
                <textarea
                  required
                  rows={3}
                  value={newMovieForm.description}
                  onChange={(e) => setNewMovieForm({ ...newMovieForm, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Genres (comma-separated)</label>
                  <input
                    type="text"
                    value={newMovieForm.genres}
                    onChange={(e) => setNewMovieForm({ ...newMovieForm, genres: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={newMovieForm.durationMinutes}
                    onChange={(e) => setNewMovieForm({ ...newMovieForm, durationMinutes: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Director</label>
                  <input
                    type="text"
                    value={newMovieForm.director}
                    onChange={(e) => setNewMovieForm({ ...newMovieForm, director: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Certificate</label>
                  <select
                    value={newMovieForm.certificate}
                    onChange={(e) => setNewMovieForm({ ...newMovieForm, certificate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  >
                    <option value="PG-13">PG-13</option>
                    <option value="R">R</option>
                    <option value="U">U (Universal)</option>
                    <option value="U/A">U/A</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddMovieModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl"
                >
                  Save Movie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SHOW */}
      {showAddShowModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121622] border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Schedule Cinema Show</h3>
            <form onSubmit={handleAddShow} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Movie</label>
                <select
                  value={newShowForm.movieId}
                  onChange={(e) => setNewShowForm({ ...newShowForm, movieId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                >
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Cinema Theatre</label>
                <select
                  value={newShowForm.theatreId}
                  onChange={(e) => setNewShowForm({ ...newShowForm, theatreId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                >
                  {theatres.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newShowForm.date}
                    onChange={(e) => setNewShowForm({ ...newShowForm, date: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Start Time</label>
                  <input
                    type="text"
                    required
                    value={newShowForm.startTime}
                    onChange={(e) => setNewShowForm({ ...newShowForm, startTime: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    placeholder="07:30 PM"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Standard ($)</label>
                  <input
                    type="number"
                    value={newShowForm.pricingStandard}
                    onChange={(e) => setNewShowForm({ ...newShowForm, pricingStandard: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Premium ($)</label>
                  <input
                    type="number"
                    value={newShowForm.pricingPremium}
                    onChange={(e) => setNewShowForm({ ...newShowForm, pricingPremium: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">VIP Recliner ($)</label>
                  <input
                    type="number"
                    value={newShowForm.pricingVip}
                    onChange={(e) => setNewShowForm({ ...newShowForm, pricingVip: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddShowModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl"
                >
                  Schedule Show
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
