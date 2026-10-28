import React, { useState, useEffect, useMemo } from 'react';
import { Theatre, Show, Movie } from '../types/cinema';
import { api } from '../services/api';
import { soundFx } from '../services/soundFx';
import { TheatresMapView } from './TheatresMapView';
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
  Map as MapIcon,
  List,
  Car,
  AlertCircle,
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
const INDIAN_SIMULATED_LOCATIONS: Record<
  string,
  { name: string; areaName: string; city: string; state?: string; lat: number; lng: number }
> = {
  // --- MADHYA PRADESH HUBS ---
  indore_ti: {
    name: 'Indore (PVR Treasure Island)',
    areaName: 'MG Road / South Tukoganj, Indore (MP)',
    city: 'Indore',
    state: 'Madhya Pradesh',
    lat: 22.7244,
    lng: 75.8839,
  },
  indore_phoenix: {
    name: 'Indore (Phoenix Citadel IMAX)',
    areaName: 'MR 10 / Bypass Junction, Indore (MP)',
    city: 'Indore',
    state: 'Madhya Pradesh',
    lat: 22.7533,
    lng: 75.8937,
  },
  indore_nexus: {
    name: 'Indore (Cinepolis Nexus Central)',
    areaName: 'RNT Marg / Railway Station, Indore (MP)',
    city: 'Indore',
    state: 'Madhya Pradesh',
    lat: 22.7165,
    lng: 75.8754,
  },
  indore_c21: {
    name: 'Indore (PVR C21 Vijay Nagar)',
    areaName: 'Vijay Nagar / Scheme 54, Indore (MP)',
    city: 'Indore',
    state: 'Madhya Pradesh',
    lat: 22.7512,
    lng: 75.8924,
  },
  bhopal_db: {
    name: 'Bhopal (Cinepolis DB City Mall)',
    areaName: 'MP Nagar Zone 1 / Arera Hills, Bhopal (MP)',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    lat: 23.2332,
    lng: 77.4326,
  },
  bhopal_aura: {
    name: 'Bhopal (PVR Aura Mall)',
    areaName: 'Trilanga / Shahpura Lake, Bhopal (MP)',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    lat: 23.1895,
    lng: 77.4322,
  },
  bhopal_century21: {
    name: 'Bhopal (INOX Century 21 Mall)',
    areaName: 'Hoshangabad Road / Habibganj, Bhopal (MP)',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    lat: 23.2081,
    lng: 77.4412,
  },
  gwalior_db: {
    name: 'Gwalior (INOX DB City Mall)',
    areaName: 'Race Course Road / Railway Station, Gwalior (MP)',
    city: 'Gwalior',
    state: 'Madhya Pradesh',
    lat: 26.2089,
    lng: 78.1887,
  },
  jabalpur_samdariya: {
    name: 'Jabalpur (Samdariya Mall)',
    areaName: 'Civic Centre / Marhatal, Jabalpur (MP)',
    city: 'Jabalpur',
    state: 'Madhya Pradesh',
    lat: 23.1678,
    lng: 79.9339,
  },
  ujjain_cosmos: {
    name: 'Ujjain (PVR Cosmos Mall)',
    areaName: 'Nanakheda / Indore Road, Ujjain (MP)',
    city: 'Ujjain',
    state: 'Madhya Pradesh',
    lat: 23.1558,
    lng: 75.7924,
  },

  // --- OTHER METROS ---
  mumbai_bkc: {
    name: 'Mumbai BKC',
    areaName: 'Bandra Kurla Complex (BKC), Mumbai',
    city: 'Mumbai',
    lat: 19.066,
    lng: 72.868,
  },
  mumbai_lower_parel: {
    name: 'Mumbai Lower Parel',
    areaName: 'Lower Parel / Worli, Mumbai',
    city: 'Mumbai',
    lat: 18.995,
    lng: 72.824,
  },
  mumbai_colaba: {
    name: 'South Mumbai Colaba',
    areaName: 'Colaba Causeway, South Mumbai',
    city: 'Mumbai',
    lat: 18.925,
    lng: 72.831,
  },
  mumbai_thane: {
    name: 'Thane Majiwada',
    areaName: 'Viviana Mall, Thane West, Mumbai MMR',
    city: 'Mumbai',
    lat: 19.208,
    lng: 72.971,
  },
  blr_koramangala: {
    name: 'Bengaluru Koramangala',
    areaName: 'Koramangala / Indiranagar, Bengaluru',
    city: 'Bengaluru',
    lat: 12.935,
    lng: 77.624,
  },
  blr_whitefield: {
    name: 'Bengaluru Whitefield',
    areaName: 'Whitefield ITPL, Bengaluru',
    city: 'Bengaluru',
    lat: 12.985,
    lng: 77.73,
  },
  blr_south: {
    name: 'Bengaluru South (Kanakapura)',
    areaName: 'Konanakunte / JP Nagar, Bengaluru',
    city: 'Bengaluru',
    lat: 12.887,
    lng: 77.556,
  },
  hyd_hitec: {
    name: 'Hyderabad Hitec City',
    areaName: 'Gachibowli / Kondapur, Hyderabad',
    city: 'Hyderabad',
    lat: 17.447,
    lng: 78.376,
  },
  hyd_necklace: {
    name: 'Hyderabad Necklace Road',
    areaName: 'NTR Gardens / Hussain Sagar, Hyderabad',
    city: 'Hyderabad',
    lat: 17.412,
    lng: 78.468,
  },
  delhi_saket: {
    name: 'Delhi NCR Saket',
    areaName: 'Saket District Centre, South Delhi',
    city: 'Delhi NCR',
    lat: 28.528,
    lng: 77.218,
  },
  delhi_vasant_kunj: {
    name: 'Delhi NCR Vasant Kunj',
    areaName: 'Ambience Mall, Vasant Kunj, New Delhi',
    city: 'Delhi NCR',
    lat: 28.54,
    lng: 77.155,
  },
  delhi_noida: {
    name: 'Delhi NCR Noida',
    areaName: 'Sector 32 / Wave City, Noida',
    city: 'Delhi NCR',
    lat: 28.574,
    lng: 77.353,
  },
  chennai_royapettah: {
    name: 'Chennai Royapettah',
    areaName: 'Royapettah / Express Avenue, Chennai',
    city: 'Chennai',
    lat: 13.056,
    lng: 80.26,
  },
  pune_magarpatta: {
    name: 'Pune Magarpatta',
    areaName: 'Seasons Mall, Hadapsar, Pune',
    city: 'Pune',
    lat: 18.519,
    lng: 73.931,
  },
  kolkata_park_circus: {
    name: 'Kolkata Park Circus',
    areaName: 'Quest Mall, Park Circus, Kolkata',
    city: 'Kolkata',
    lat: 22.539,
    lng: 88.365,
  },
  ahmedabad_sg: {
    name: 'Ahmedabad SG Highway',
    areaName: 'Acropolis Mall, SG Highway, Ahmedabad',
    city: 'Ahmedabad',
    lat: 23.052,
    lng: 72.508,
  },
  kochi_edappally: {
    name: 'Kochi Edappally',
    areaName: 'LuLu Mall, Edappally, Kochi',
    city: 'Kochi',
    lat: 10.028,
    lng: 76.308,
  },
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
  // View mode: 'map' (interactive Leaflet radar) or 'directory' (cards grid)
  const [viewMode, setViewMode] = useState<'map' | 'directory'>('map');
  const [cityFilter, setCityFilter] = useState<string>(selectedCity);
  const [chainFilter, setChainFilter] = useState<string>('All');
  const [formatFilter, setFormatFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [radiusKm, setRadiusKm] = useState<number>(20);

  // Geolocation state: Default to Madhya Pradesh (Indore)
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    label: string;
    areaName?: string;
  }>(() => {
    return {
      lat: 22.7244,
      lng: 75.8839,
      label: 'Indore, MP (PVR Treasure Island)',
      areaName: 'MG Road / South Tukoganj, Indore, Madhya Pradesh',
    };
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Quick preset helper
  const setPresetLocation = (key: string) => {
    soundFx.playClick();
    const loc = INDIAN_SIMULATED_LOCATIONS[key];
    if (loc) {
      setUserLocation({
        lat: loc.lat,
        lng: loc.lng,
        label: loc.name,
        areaName: loc.areaName,
      });
      setCityFilter(loc.city);
      setLocationError(null);
      if (onCityChange) onCityChange(loc.city);
    }
  };

  // Expanded theatre showtimes map
  const [expandedTheatreId, setExpandedTheatreId] = useState<string | null>(null);
  const [selectedMapTheatre, setSelectedMapTheatre] = useState<(Theatre & { distanceKm?: number }) | null>(null);
  const [theatreShows, setTheatreShows] = useState<Record<string, Show[]>>({});
  const [loadingShows, setLoadingShows] = useState<boolean>(false);

  // Selected date for showtimes (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Request actual HTML5 Geolocation with dual-accuracy retry and intelligent MP reverse-detection
  const handleDetectGPS = () => {
    soundFx.playClick();
    if (!navigator.geolocation) {
      setLocationError('Geolocation API is not supported by your browser. Using Madhya Pradesh coordinates.');
      setPresetLocation('indore_ti');
      return;
    }
    setIsLocating(true);
    setLocationError(null);

    const onPositionSuccess = (pos: GeolocationPosition) => {
      setIsLocating(false);
      const { latitude, longitude } = pos.coords;

      // Intelligent MP detection
      let areaLabel = 'Your Current Live Device GPS';
      let areaDescription = `Latitude: ${latitude.toFixed(4)}, Longitude: ${longitude.toFixed(4)}`;
      let detectedCity = 'Closest Nearby';

      // Check if coordinate is in Madhya Pradesh bounding box (21.0 - 26.9 N, 74.0 - 82.8 E)
      if (latitude >= 21.0 && latitude <= 26.9 && longitude >= 74.0 && longitude <= 82.8) {
        if (Math.abs(latitude - 22.72) < 0.4 && Math.abs(longitude - 75.88) < 0.4) {
          areaLabel = 'Live GPS: Indore, Madhya Pradesh';
          areaDescription = 'Indore Metro Area (Central MP)';
          detectedCity = 'Indore';
        } else if (Math.abs(latitude - 23.23) < 0.4 && Math.abs(longitude - 77.43) < 0.4) {
          areaLabel = 'Live GPS: Bhopal, Madhya Pradesh';
          areaDescription = 'Bhopal City / MP Nagar (Capital MP)';
          detectedCity = 'Bhopal';
        } else if (Math.abs(latitude - 26.20) < 0.5 && Math.abs(longitude - 78.18) < 0.5) {
          areaLabel = 'Live GPS: Gwalior, Madhya Pradesh';
          areaDescription = 'Gwalior Division (Northern MP)';
          detectedCity = 'Gwalior';
        } else if (Math.abs(latitude - 23.16) < 0.5 && Math.abs(longitude - 79.93) < 0.5) {
          areaLabel = 'Live GPS: Jabalpur, Madhya Pradesh';
          areaDescription = 'Jabalpur Mahakoshal (Eastern MP)';
          detectedCity = 'Jabalpur';
        } else if (Math.abs(latitude - 23.15) < 0.4 && Math.abs(longitude - 75.79) < 0.4) {
          areaLabel = 'Live GPS: Ujjain, Madhya Pradesh';
          areaDescription = 'Ujjain Mahakal Corridor (Malwa MP)';
          detectedCity = 'Ujjain';
        } else {
          areaLabel = 'Live GPS: Madhya Pradesh Region';
          areaDescription = `Madhya Pradesh (${latitude.toFixed(3)}°N, ${longitude.toFixed(3)}°E)`;
          detectedCity = 'Madhya Pradesh (All MP)';
        }
      }

      setUserLocation({
        lat: latitude,
        lng: longitude,
        label: areaLabel,
        areaName: areaDescription,
      });
      setCityFilter(detectedCity);
    };

    // Low-accuracy fallback attempt
    const tryLowAccuracy = () => {
      navigator.geolocation.getCurrentPosition(
        onPositionSuccess,
        (fallbackErr) => {
          setIsLocating(false);
          setLocationError(
            `GPS unavailable (${fallbackErr.message || 'permission required or timeout'}). Showing Madhya Pradesh (Indore). Quick-jump to your city below.`
          );
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    };

    // First attempt: high accuracy with 3.5s timeout
    navigator.geolocation.getCurrentPosition(
      onPositionSuccess,
      (err) => {
        if (err.code === err.TIMEOUT || err.code === err.POSITION_UNAVAILABLE) {
          tryLowAccuracy();
        } else {
          setIsLocating(false);
          setLocationError(
            `Device GPS permission was restricted (${err.message}). Showing Madhya Pradesh (Indore). Tap any MP city below to set location.`
          );
        }
      },
      { timeout: 3500, enableHighAccuracy: true, maximumAge: 10000 }
    );
  };

  // Sync city filter if changed externally
  useEffect(() => {
    if (selectedCity && selectedCity !== cityFilter) {
      setCityFilter(selectedCity);
    }
  }, [selectedCity]);

  // Fetch showtimes for expanded theatre or selected map theatre
  const targetTheatreIdForShows = expandedTheatreId || selectedMapTheatre?.id;
  useEffect(() => {
    if (!targetTheatreIdForShows) return;

    let isMounted = true;
    async function loadShowsForTheatre() {
      setLoadingShows(true);
      try {
        const shows = await api.getShows({
          theatreId: targetTheatreIdForShows || undefined,
          date: selectedDate,
        });
        if (isMounted) {
          setTheatreShows((prev) => ({
            ...prev,
            [targetTheatreIdForShows!]: shows,
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
  }, [targetTheatreIdForShows, selectedDate]);

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

  // Default selected map theatre to closest theatre
  useEffect(() => {
    if (!selectedMapTheatre && theatresWithDistance.length > 0) {
      const sorted = [...theatresWithDistance].sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
      setSelectedMapTheatre(sorted[0]);
    }
  }, [theatresWithDistance]);

  // Filter and sort theatres
  const filteredTheatres = useMemo(() => {
    return theatresWithDistance
      .filter((t) => {
        // City filter
        if (cityFilter === 'Closest Nearby') {
          // Keep all, will sort by distance
        } else if (cityFilter === 'Madhya Pradesh (All MP)') {
          if (t.state !== 'Madhya Pradesh' && !['Indore', 'Bhopal', 'Gwalior', 'Jabalpur', 'Ujjain'].includes(t.city)) {
            return false;
          }
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
            (t.state && t.state.toLowerCase().includes(q)) ||
            t.address.toLowerCase().includes(q) ||
            (t.landmark && t.landmark.toLowerCase().includes(q)) ||
            t.chain.toLowerCase().includes(q) ||
            t.amenities.some((a) => a.toLowerCase().includes(q));
          if (!match) return false;
        }

        return true;
      })
      .sort((a, b) => {
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

  // Closest theatre in vicinity
  const closestTheatre = useMemo(() => {
    const list = [...theatresWithDistance].filter((t) => t.distanceKm !== undefined);
    list.sort((a, b) => a.distanceKm! - b.distanceKm!);
    return list[0] || null;
  }, [theatresWithDistance]);

  // Formatter for currency
  const formatCurrency = (amount: number, theatreCity: string) => {
    const isIndia = theatreCity !== 'New York' && theatreCity !== 'Los Angeles' && theatreCity !== 'Chicago';
    return isIndia ? `₹${amount}` : `$${amount}`;
  };

  const indianCities = [
    'Madhya Pradesh (All MP)',
    'Indore',
    'Bhopal',
    'Gwalior',
    'Jabalpur',
    'Ujjain',
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

      {/* Main Proximity & GPS Radar Banner */}
      <div className="bg-gradient-to-r from-[#0d1410] via-[#09100c] to-[#060a08] border border-emerald-500/30 rounded-2xl p-6 sm:p-8 mb-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-bold">
              <Compass className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>LIVE GPS RADAR // INDIAN & MADHYA PRADESH CINEMA LOCATOR</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
              Nearby Indian Theatres Near You
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-300">
              <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Detected Area:</span>
              </span>
              <strong className="text-white underline decoration-emerald-500/50 underline-offset-4">
                {userLocation.areaName || userLocation.label}
              </strong>
              {closestTheatre && closestTheatre.distanceKm !== undefined && (
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
                  Closest: {closestTheatre.name} ({closestTheatre.distanceKm} km · ~{Math.round(closestTheatre.distanceKm * 2.2 + 3)} min drive)
                </span>
              )}
            </div>
          </div>

          {/* Location Controls & GPS Box */}
          <div className="bg-black/80 border border-emerald-500/40 rounded-xl p-4 flex flex-col gap-3 min-w-[300px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                <LocateFixed className="w-3.5 h-3.5 text-emerald-400" />
                Device GPS & Area Switcher
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <button
              onClick={handleDetectGPS}
              disabled={isLocating}
              className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold font-mono rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 cursor-pointer"
            >
              <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'TRIANGULATING GPS...' : 'ACCESS CURRENT GPS LOCATION'}</span>
            </button>

            {/* Quick Area / Locality Dropdown */}
            <div className="pt-2 border-t border-emerald-500/20 flex flex-col gap-1 text-[11px] font-mono">
              <span className="text-slate-400">Or Select Indian Locality / Mall:</span>
              <select
                className="w-full bg-[#0d1410] border border-emerald-500/40 text-emerald-300 rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-emerald-400"
                onChange={(e) => {
                  setPresetLocation(e.target.value);
                }}
                defaultValue="indore_ti"
              >
                <optgroup label="Madhya Pradesh (MP)">
                  <option value="indore_ti">Indore (PVR Treasure Island / MG Rd)</option>
                  <option value="indore_phoenix">Indore (INOX Phoenix Citadel IMAX)</option>
                  <option value="indore_nexus">Indore (Cinepolis Nexus Central)</option>
                  <option value="indore_c21">Indore (PVR C21 Vijay Nagar)</option>
                  <option value="bhopal_db">Bhopal (Cinepolis DB City Mall)</option>
                  <option value="bhopal_aura">Bhopal (PVR Aura Mall Trilanga)</option>
                  <option value="bhopal_century21">Bhopal (INOX Century 21 Mall)</option>
                  <option value="gwalior_db">Gwalior (INOX DB City Mall)</option>
                  <option value="jabalpur_samdariya">Jabalpur (Samdariya Mall)</option>
                  <option value="ujjain_cosmos">Ujjain (PVR Cosmos Mall)</option>
                </optgroup>
                <optgroup label="Mumbai & MMR">
                  <option value="mumbai_bkc">Bandra Kurla Complex (BKC Jio Drive)</option>
                  <option value="mumbai_lower_parel">Lower Parel (Phoenix Palladium)</option>
                  <option value="mumbai_colaba">South Mumbai (Colaba / Nariman Pt)</option>
                  <option value="mumbai_thane">Thane (Viviana Mall / Majiwada)</option>
                </optgroup>
                <optgroup label="Bengaluru">
                  <option value="blr_koramangala">Koramangala / Indiranagar / MG Rd</option>
                  <option value="blr_whitefield">Whitefield (Forum Shantiniketan)</option>
                  <option value="blr_south">South Bengaluru (Kanakapura Rd)</option>
                </optgroup>
                <optgroup label="Hyderabad">
                  <option value="hyd_hitec">Hitec City / Gachibowli / Kondapur</option>
                  <option value="hyd_necklace">Necklace Road / NTR Gardens (Prasads)</option>
                </optgroup>
                <optgroup label="Delhi NCR">
                  <option value="delhi_saket">Saket / DLF Avenue (South Delhi)</option>
                  <option value="delhi_vasant_kunj">Vasant Kunj (Ambience Mall)</option>
                  <option value="delhi_noida">Noida (Sector 32 City Centre)</option>
                </optgroup>
                <optgroup label="Other Metros">
                  <option value="chennai_royapettah">Chennai (Royapettah / Sathyam)</option>
                  <option value="pune_magarpatta">Pune (Magarpatta Seasons Mall)</option>
                  <option value="kolkata_park_circus">Kolkata (Park Circus Quest Mall)</option>
                  <option value="ahmedabad_sg">Ahmedabad (SG Highway Acropolis)</option>
                  <option value="kochi_edappally">Kochi (LuLu Mall Edappally)</option>
                </optgroup>
              </select>
            </div>
          </div>
        </div>

        {/* Dedicated Madhya Pradesh Quick-Access Hubs Bar */}
        <div className="relative z-10 mt-5 pt-4 border-t border-emerald-500/20 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            MADHYA PRADESH HUBS:
          </span>
          {[
            { id: 'indore_ti', label: 'Indore (PVR TI)' },
            { id: 'indore_phoenix', label: 'Indore (Citadel IMAX)' },
            { id: 'bhopal_db', label: 'Bhopal (DB Mall)' },
            { id: 'bhopal_aura', label: 'Bhopal (Aura Mall)' },
            { id: 'gwalior_db', label: 'Gwalior (DB City)' },
            { id: 'jabalpur_samdariya', label: 'Jabalpur (Samdariya)' },
            { id: 'ujjain_cosmos', label: 'Ujjain (Cosmos)' },
          ].map((hub) => (
            <button
              key={hub.id}
              onClick={() => setPresetLocation(hub.id)}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/40 text-[11px] font-mono font-bold text-emerald-300 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <span>📍</span>
              <span>{hub.label}</span>
            </button>
          ))}
        </div>

        {locationError && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-mono space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{locationError}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-red-500/20">
              <span className="text-[10px] text-red-300">Set Madhya Pradesh Locality:</span>
              <button
                onClick={() => setPresetLocation('indore_ti')}
                className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold text-[10px] cursor-pointer"
              >
                Set to Indore (MG Rd)
              </button>
              <button
                onClick={() => setPresetLocation('bhopal_db')}
                className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold text-[10px] cursor-pointer"
              >
                Set to Bhopal (DB Mall)
              </button>
              <button
                onClick={() => setPresetLocation('gwalior_db')}
                className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold text-[10px] cursor-pointer"
              >
                Set to Gwalior
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Switcher: Interactive Map vs Directory Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* City Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none flex-1">
          {indianCities.map((city) => {
            const isSelected = cityFilter === city;
            return (
              <button
                key={city}
                onClick={() => handleCitySelect(city)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium whitespace-nowrap transition-all border cursor-pointer ${
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

        {/* View Toggle Button */}
        <div className="flex items-center gap-1 p-1 bg-black/80 border border-emerald-500/30 rounded-xl shrink-0 self-start sm:self-auto">
          <button
            onClick={() => {
              soundFx.playClick();
              setViewMode('map');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'map'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>INTERACTIVE MAP & RADAR</span>
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setViewMode('directory');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'directory'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>CINEMAS DIRECTORY ({filteredTheatres.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: LIVE INTERACTIVE MAP RADAR */}
      {viewMode === 'map' && (
        <div className="mb-10">
          <TheatresMapView
            theatres={filteredTheatres}
            movies={movies}
            userLocation={userLocation}
            selectedTheatre={selectedMapTheatre}
            onSelectTheatre={(th) => setSelectedMapTheatre(th)}
            onSelectShow={(show, movie, theatre) => {
              if (onSelectShow) {
                onSelectShow(show, movie, theatre);
              }
            }}
            theatreShows={theatreShows}
            loadingShows={loadingShows}
            radiusKm={radiusKm}
            onRadiusChange={(r) => setRadiusKm(r)}
            onDetectGPS={handleDetectGPS}
            isLocating={isLocating}
          />
        </div>
      )}

      {/* VIEW 2: SEARCH & FULL DIRECTORY GRID */}
      <div className="space-y-6">
        {/* Search and Secondary Filter Row */}
        <div className="bg-[#090e0b] border border-emerald-500/30 rounded-xl p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by cinema name, chain (PVR, Cinepolis, Prasads, AMB, SPI), or locality..."
              className="w-full pl-9 pr-4 py-2 bg-black/60 border border-emerald-500/30 rounded-lg text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
            />
          </div>

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

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">Screen:</span>
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="bg-[#0d1410] border border-emerald-500/30 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-400"
            >
              <option value="All">All Formats</option>
              <option value="IMAX">IMAX Laser 4K</option>
              <option value="4DX">4DX Dynamic</option>
              <option value="Dolby">Dolby Atmos / Cinema</option>
              <option value="Luxe">Luxe Recliners</option>
            </select>
          </div>
        </div>

        {/* Directory Grid */}
        {filteredTheatres.length === 0 ? (
          <div className="p-12 text-center bg-[#090e0b] border border-emerald-500/30 rounded-2xl">
            <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold font-display text-white">No Cinemas Found in this Area</h3>
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
                          <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 text-[11px] font-mono font-bold flex items-center gap-1">
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

                    {/* Driving Time & Directions Link */}
                    <div className="mt-2.5 pl-5 flex items-center gap-4 text-[11px] font-mono">
                      {theatre.distanceKm !== undefined && (
                        <span className="text-slate-400 flex items-center gap-1">
                          <Car className="w-3.5 h-3.5 text-emerald-400" />
                          <span>~{Math.round(theatre.distanceKm * 2.2 + 3)} mins drive</span>
                        </span>
                      )}

                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${theatre.latitude},${theatre.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors"
                      >
                        <span>Google Maps Directions</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {theatre.contactNumber && (
                      <p className="text-[11px] text-slate-400 font-mono mt-1.5 pl-5 flex items-center gap-1.5">
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
                            <span>TODAY'S SCHEDULE & DIRECT BOOKING</span>
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
                        setSelectedMapTheatre(theatre);
                        setViewMode('map');
                      }}
                      className="py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>View on Map</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
