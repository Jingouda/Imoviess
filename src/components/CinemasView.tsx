import React, { useState, useEffect, useMemo } from 'react';
import { Theatre, Show, Movie } from '../types/cinema';
import { api } from '../services/api';
import { soundFx } from '../services/soundFx';
import {
  MapPin,
  Sparkles,
  Film,
  ArrowRight,
  ArrowLeft,
  Navigation,
  Compass,
  Search,
  Filter,
  Star,
  Phone,
  Ticket,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  LocateFixed,
  Building2,
  Tv,
  CheckCircle2,
} from 'lucide-react';

interface CinemasViewProps {
  theatres: Theatre[];
  movies?: Movie[];
  onSelectTheatre: (theatre: Theatre) => void;
  onSelectShow?: (show: Show, movie: Movie, theatre: Theatre) => void;
  onBack?: () => void;
  selectedCity?: string;
  onCityChange?: (city: string) => void;
}

// Haversine formula to compute distance in km between two GPS coordinates
function computeDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Pre-configured Indian Metro reference coordinates for instant simulation
const INDIAN_SIMULATED_LOCATIONS: Record<string, { name: string; city: string; lat: number; lng: number }> = {
  mumbai_bkc: { name: 'Mumbai BKC (Bandra East)', city: 'Mumbai', lat: 19.066, lng: 72.868 },
  mumbai_south: { name: 'South Mumbai (Nariman Point)', city: 'Mumbai', lat: 18.928, lng: 72.825 },
  blr_koramangala: { name: 'Bengaluru (Koramangala/Indiranagar)', city: 'Bengaluru', lat: 12.935, lng: 77.624 },
  blr_whitefield: { name: 'Bengaluru (Whitefield ITPL)', city: 'Bengaluru', lat: 12.985, lng: 77.73 },
  hyd_hitec: { name: 'Hyderabad (Hitec City/Gachibowli)', city: 'Hyderabad', lat: 17.447, lng: 78.376 },
  delhi_connaught: { name: 'Delhi NCR (Connaught Place/Saket)', city: 'Delhi NCR', lat: 28.535, lng: 77.21 },
  delhi_noida: { name: 'Delhi NCR (Noida Sector 18)', city: 'Delhi NCR', lat: 28.57, lng: 77.32 },
  chennai_t_nagar: { name: 'Chennai (T. Nagar/Royapettah)', city: 'Chennai', lat: 13.045, lng: 78.24 },
  pune_magarpatta: { name: 'Pune (Magarpatta/Kalyani Nagar)', city: 'Pune', lat: 18.525, lng: 73.91 },
  kolkata_park_st: { name: 'Kolkata (Park Circus/Ballygunge)', city: 'Kolkata', lat: 22.535, lng: 88.36 },
  ahmedabad_sg: { name: 'Ahmedabad (SG Highway/Vastrapur)', city: 'Ahmedabad', lat: 23.04, lng: 72.52 },
  kochi_edappally: { name: 'Kochi (Edappally/Palarivattom)', city: 'Kochi', lat: 10.025, lng: 76.31 },
};

export function CinemasView({
  theatres,
  movies = [],
  onSelectTheatre,
  onSelectShow,
  onBack,
  selectedCity = 'All India',
  onCityChange,
}: CinemasViewProps) {
  const [cityFilter, setCityFilter] = useState<string>(selectedCity);
  const [chainFilter, setChainFilter] = useState<string>('All');
  const [formatFilter, setFormatFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Geolocation state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; label: string } | null>(() => {
    // Default to Mumbai BKC simulated location if browser has not granted GPS yet
    return {
      lat: 19.066,
      lng: 72.868,
      label: 'Mumbai BKC (Nearby Active)',
    };
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Expanded theatre showtimes map
  const [expandedTheatreId, setExpandedTheatreId] = useState<string | null>(null);
  const [theatreShows, setTheatreShows] = useState<Record<string, Show[]>>({});
  const [loadingShows, setLoadingShows] = useState<boolean>(false);

  // Selected date for showtimes (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Request actual HTML5 Geolocation from user's device
  const handleDetectGPS = () => {
    soundFx.playClick();
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: 'Your Current GPS Location',
        });
        setCityFilter('Closest Nearby');
      },
      (err) => {
        setIsLocating(false);
        setLocationError(`Location detection: ${err.message}. Using simulated Indian Metro position.`);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Sync city filter if changed externally
  useEffect(() => {
    if (selectedCity && selectedCity !== cityFilter) {
      setCityFilter(selectedCity);
    }
  }, [selectedCity]);

  // Fetch showtimes for expanded theatre
  useEffect(() => {
    if (!expandedTheatreId) return;

    let isMounted = true;
    async function loadShowsForTheatre() {
      setLoadingShows(true);
      try {
        const shows = await api.getShows({
          theatreId: expandedTheatreId || undefined,
          date: selectedDate,
        });
        if (isMounted) {
          setTheatreShows((prev) => ({
            ...prev,
            [expandedTheatreId!]: shows,
          }));
        }
      } catch (err) {
        console.warn('Could not load shows for theatre:', err);
      } finally {
        if (isMounted) setLoadingShows(false);
      }
    }

    loadShowsForTheatre();
    return () => {
      isMounted = false;
    };
  }, [expandedTheatreId, selectedDate]);

  // Handle City Change
  const handleCitySelect = (city: string) => {
    soundFx.playClick();
    setCityFilter(city);
    if (onCityChange) {
      onCityChange(city);
    }
  };

  // Unique cinema chains
  const chains = useMemo(() => {
    const list = Array.from(new Set(theatres.map((t) => t.chain)));
    return ['All', ...list];
  }, [theatres]);

  // Calculate distance for all theatres
  const theatresWithDistance = useMemo(() => {
    return theatres.map((t) => {
      let distanceKm: number | undefined = undefined;
      if (userLocation && t.latitude && t.longitude) {
        distanceKm = computeDistanceKm(userLocation.lat, userLocation.lng, t.latitude, t.longitude);
      }
      return {
        ...t,
        distanceKm,
      };
    });
  }, [theatres, userLocation]);

  // Filter and sort theatres
  const filteredTheatres = useMemo(() => {
    return theatresWithDistance
      .filter((t) => {
        // City filter
        if (cityFilter === 'Closest Nearby') {
          // Keep all, will sort by distance
        } else if (cityFilter === 'All India') {
          if (t.city === 'New York' || t.city === 'Los Angeles' || t.city === 'Chicago') {
            return false;
          }
        } else if (cityFilter === 'International (USA)') {
          if (t.city !== 'New York' && t.city !== 'Los Angeles' && t.city !== 'Chicago') {
            return false;
          }
        } else if (cityFilter !== 'All') {
          if (t.city.toLowerCase() !== cityFilter.toLowerCase()) {
            return false;
          }
        }

        // Chain filter
        if (chainFilter !== 'All' && t.chain !== chainFilter) {
          return false;
        }

        // Format filter
        if (formatFilter !== 'All') {
          const hasFormat =
            t.screens.some((s) => s.format.toLowerCase().includes(formatFilter.toLowerCase())) ||
            t.amenities.some((a) => a.toLowerCase().includes(formatFilter.toLowerCase()));
          if (!hasFormat) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match =
            t.name.toLowerCase().includes(q) ||
            t.city.toLowerCase().includes(q) ||
            t.address.toLowerCase().includes(q) ||
            (t.landmark && t.landmark.toLowerCase().includes(q)) ||
            t.chain.toLowerCase().includes(q) ||
            t.amenities.some((a) => a.toLowerCase().includes(q));
          if (!match) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // If Closest Nearby, sort strictly by distance
        if (cityFilter === 'Closest Nearby' || userLocation) {
          if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
            return a.distanceKm - b.distanceKm;
          }
          if (a.distanceKm !== undefined) return -1;
          if (b.distanceKm !== undefined) return 1;
        }
        return (b.rating || 0) - (a.rating || 0);
      });
  }, [theatresWithDistance, cityFilter, chainFilter, formatFilter, searchQuery, userLocation]);

  // Formatter for currency
  const formatCurrency = (amount: number, theatreCity: string) => {
    const isIndia = theatreCity !== 'New York' && theatreCity !== 'Los Angeles' && theatreCity !== 'Chicago';
    return isIndia ? `₹${amount}` : `$${amount}`;
  };

  const indianCities = [
    'All India',
    'Closest Nearby',
    'Mumbai',
    'Bengaluru',
    'Hyderabad',
    'Delhi NCR',
    'Chennai',
    'Pune',
    'Kolkata',
    'Ahmedabad',
    'Kochi',
    'International (USA)',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-slate-100">
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-mono font-semibold mb-5 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>BACK TO CATALOG RADAR</span>
        </button>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0d1410] via-[#09100c] to-[#060a08] border border-emerald-500/30 rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-bold mb-3">
              <Compass className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>INDIAN THEATRE RADAR // PREMIER SCREEN LOCATOR</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
              Nearby Indian Theatres & Laser Auditoriums
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-2 leading-relaxed font-sans">
              Find authentic IMAX Laser 4K, 128-channel Dolby Atmos, 4DX motion seats, and Insignia luxury dine-in
              recliners across Mumbai, Bengaluru, Hyderabad, Delhi NCR, Chennai, Pune, Kolkata, and beyond.
            </p>
          </div>

          {/* Quick GPS Locator Widget */}
          <div className="bg-black/80 border border-emerald-500/40 rounded-xl p-4 flex flex-col gap-3 min-w-[280px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <LocateFixed className="w-3.5 h-3.5 text-emerald-400" />
                Active Proximity Radar
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="text-xs font-mono font-semibold text-emerald-300 truncate">
              {userLocation?.label || 'GPS not active'}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDetectGPS}
                disabled={isLocating}
                className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold font-mono rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/30 cursor-pointer"
              >
                <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'CALCULATING GPS...' : 'USE MY LOCATION'}</span>
              </button>
            </div>

            {/* Quick Simulate Indian Metro Dropdown */}
            <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Simulate Metro:</span>
              <select
                className="bg-[#0d1410] border border-emerald-500/30 text-emerald-300 rounded px-2 py-1 text-[11px] font-mono focus:outline-none focus:border-emerald-400"
                onChange={(e) => {
                  const loc = INDIAN_SIMULATED_LOCATIONS[e.target.value];
                  if (loc) {
                    setUserLocation({
                      lat: loc.lat,
                      lng: loc.lng,
                      label: `${loc.name} (Simulated)`,
                    });
                    setCityFilter(loc.city);
                    soundFx.playClick();
                  }
                }}
                defaultValue="mumbai_bkc"
              >
                <option value="mumbai_bkc">Mumbai (BKC Jio Drive)</option>
                <option value="mumbai_south">Mumbai (South / Colaba)</option>
                <option value="blr_koramangala">Bengaluru (Koramangala)</option>
                <option value="blr_whitefield">Bengaluru (Whitefield)</option>
                <option value="hyd_hitec">Hyderabad (Hitec City)</option>
                <option value="delhi_connaught">Delhi NCR (Saket / South)</option>
                <option value="delhi_noida">Delhi NCR (Noida Sec 32)</option>
                <option value="chennai_t_nagar">Chennai (Royapettah)</option>
                <option value="pune_magarpatta">Pune (Magarpatta)</option>
                <option value="kolkata_park_st">Kolkata (Park Circus)</option>
                <option value="ahmedabad_sg">Ahmedabad (SG Highway)</option>
                <option value="kochi_edappally">Kochi (LuLu Edappally)</option>
              </select>
            </div>
          </div>
        </div>

        {locationError && (
          <div className="mt-4 p-2.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono">
            {locationError}
          </div>
        )}
      </div>

      {/* City Radar Pills Bar */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            Select Indian Region / Metro Hub:
          </span>
          <span className="text-xs font-mono text-slate-400">
            Showing <strong className="text-emerald-400">{filteredTheatres.length}</strong> cinemas
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {indianCities.map((city) => {
            const isSelected = cityFilter === city;
            return (
              <button
                key={city}
                onClick={() => handleCitySelect(city)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium whitespace-nowrap transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-[#0d1410] border-emerald-500/20 text-slate-300 hover:border-emerald-500/50 hover:text-white'
                }`}
              >
                {city === 'Closest Nearby' ? '📍 Closest Nearby' : city}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#090e0b] border border-emerald-500/30 rounded-xl p-4 mb-8 flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by cinema name, chain (PVR, Prasads, AMB, SPI), locality (BKC, Vasant Kunj, Whitefield)..."
            className="w-full pl-9 pr-4 py-2 bg-black/60 border border-emerald-500/30 rounded-lg text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
          />
        </div>

        {/* Chain Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">Chain:</span>
          <select
            value={chainFilter}
            onChange={(e) => setChainFilter(e.target.value)}
            className="bg-[#0d1410] border border-emerald-500/30 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-400"
          >
            {chains.map((ch) => (
              <option key={ch} value={ch}>
                {ch === 'All' ? 'All Cinema Chains' : ch}
              </option>
            ))}
          </select>
        </div>

        {/* Format Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">Experience:</span>
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="bg-[#0d1410] border border-emerald-500/30 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-400"
          >
            <option value="All">All Screen Types</option>
            <option value="IMAX">IMAX Laser 4K</option>
            <option value="4DX">4DX Motion Sensors</option>
            <option value="Dolby">Dolby Cinema & Atmos</option>
            <option value="Luxe">Luxe / Insignia Recliners</option>
          </select>
        </div>
      </div>

      {/* Theatres Grid */}
      {filteredTheatres.length === 0 ? (
        <div className="p-12 text-center bg-[#090e0b] border border-emerald-500/30 rounded-2xl">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold font-display text-white">No Cinemas Found in this Sector</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Try adjusting your search query, switching to "All India", or choosing a different metro area.
          </p>
          <button
            onClick={() => {
              setCityFilter('All India');
              setSearchQuery('');
              setChainFilter('All');
              setFormatFilter('All');
            }}
            className="mt-4 px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-mono font-bold rounded-lg hover:bg-emerald-400 transition-colors cursor-pointer"
          >
            RESET RADAR FILTERS
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTheatres.map((theatre) => {
            const isExpanded = expandedTheatreId === theatre.id;
            const showsForThisTheatre = theatreShows[theatre.id] || [];

            return (
              <div
                key={theatre.id}
                className="bg-[#090e0b] border border-emerald-500/30 hover:border-emerald-400/60 rounded-2xl p-6 transition-all shadow-xl hover:shadow-emerald-950/20 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/40 text-[10px] font-mono font-bold text-emerald-300 uppercase">
                        {theatre.chain}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {theatre.city}
                        {theatre.state ? `, ${theatre.state}` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {theatre.distanceKm !== undefined && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono font-bold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          <span>{theatre.distanceKm} km away</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{theatre.rating || 4.8}</span>
                      </span>
                    </div>
                  </div>

                  {/* Cinema Name & Address */}
                  <h3 className="text-lg sm:text-xl font-bold font-display text-white group-hover:text-emerald-300 transition-colors">
                    {theatre.name}
                  </h3>

                  <p className="text-xs text-slate-300 flex items-start gap-1.5 mt-2 font-sans">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{theatre.address}</span>
                  </p>

                  {theatre.landmark && (
                    <p className="text-[11px] text-emerald-400/80 font-mono mt-1 pl-5">
                      Landmark: {theatre.landmark}
                    </p>
                  )}

                  {theatre.contactNumber && (
                    <p className="text-[11px] text-slate-400 font-mono mt-1 pl-5 flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>{theatre.contactNumber}</span>
                    </p>
                  )}

                  {/* Screens & Auditoriums */}
                  <div className="mt-4 pt-4 border-t border-emerald-500/20">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-2">
                      Auditoriums ({theatre.screens.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {theatre.screens.map((scr) => (
                        <div
                          key={scr.id}
                          className="p-2 bg-[#0d1410] rounded-lg border border-emerald-500/20 text-xs flex items-center justify-between"
                        >
                          <span className="text-slate-200 font-medium truncate">{scr.name}</span>
                          <span className="font-mono text-emerald-300 text-[10px] px-1.5 py-0.5 bg-black rounded border border-emerald-500/30 whitespace-nowrap">
                            {scr.format}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Amenities Chips */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {theatre.amenities.map((am) => (
                      <span
                        key={am}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 border border-emerald-500/30 text-emerald-300/90"
                      >
                        {am}
                      </span>
                    ))}
                  </div>

                  {/* Expandable Live Showtimes Section */}
                  {isExpanded && (
                    <div className="mt-5 pt-4 border-t border-emerald-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                          <Ticket className="w-3.5 h-3.5" />
                          <span>LIVE SHOWTIMES TODAY ({theatre.city})</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {selectedDate}
                        </span>
                      </div>

                      {loadingShows ? (
                        <div className="py-6 text-center text-xs font-mono text-slate-400">
                          <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          FETCHING RADAR SHOWS...
                        </div>
                      ) : showsForThisTheatre.length === 0 ? (
                        <div className="p-4 rounded-xl bg-black border border-slate-800 text-center text-xs font-mono text-slate-400">
                          No shows available for the selected date. Check back shortly.
                        </div>
                      ) : (
                        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                          {showsForThisTheatre.map((sh) => {
                            const movie = movies.find((m) => m.id === sh.movieId);
                            const title = movie?.title || 'Blockbuster Movie';
                            const availableSeats = sh.totalSeats - sh.bookedSeatsCount;

                            return (
                              <div
                                key={sh.id}
                                className="p-3 bg-black/80 border border-emerald-500/25 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-400 transition-colors"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-sm text-white truncate font-display">
                                      {title}
                                    </h4>
                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                                      {sh.format}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-1">
                                    <span className="text-emerald-300 font-bold">{sh.startTime}</span>
                                    <span>·</span>
                                    <span>{sh.language}</span>
                                    <span>·</span>
                                    <span>{availableSeats} seats left</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                                  <div className="text-right">
                                    <span className="text-[10px] text-slate-400 block font-mono">from</span>
                                    <span className="font-bold font-mono text-emerald-400 text-sm">
                                      {formatCurrency(sh.pricing.standard, theatre.city)}
                                    </span>
                                  </div>

                                  <button
                                    onClick={() => {
                                      soundFx.playClick();
                                      if (movie && onSelectShow) {
                                        onSelectShow(sh, movie, theatre);
                                      } else {
                                        onSelectTheatre(theatre);
                                      }
                                    }}
                                    className="py-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold rounded-lg transition-all shadow-md shadow-emerald-500/20 cursor-pointer whitespace-nowrap"
                                  >
                                    BOOK SEATS
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-6 pt-4 border-t border-emerald-500/20 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setExpandedTheatreId(isExpanded ? null : theatre.id);
                    }}
                    className={`py-2 px-3 text-xs font-mono font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                      isExpanded
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-[#0d1410] border-emerald-500/30 hover:border-emerald-400 text-slate-200'
                    }`}
                  >
                    <span>{isExpanded ? 'Hide Showtimes' : 'View Showtimes'}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onSelectTheatre(theatre);
                    }}
                    className="py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    <span>Explore Movies</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
