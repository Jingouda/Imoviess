import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Theatre, Show, Movie } from '../types/cinema';
import { soundFx } from '../services/soundFx';
import {
  MapPin,
  Navigation,
  Compass,
  Star,
  Clock,
  Ticket,
  ExternalLink,
  ChevronRight,
  Layers,
  Crosshair,
  Building,
  Car,
  LocateFixed,
} from 'lucide-react';

interface TheatresMapViewProps {
  theatres: (Theatre & { distanceKm?: number })[];
  movies: Movie[];
  userLocation: { lat: number; lng: number; label: string; areaName?: string };
  selectedTheatre: (Theatre & { distanceKm?: number }) | null;
  onSelectTheatre: (theatre: Theatre & { distanceKm?: number }) => void;
  onSelectShow: (show: Show, movie: Movie, theatre: Theatre) => void;
  theatreShows: Record<string, Show[]>;
  loadingShows: boolean;
  radiusKm: number;
  onRadiusChange: (radius: number) => void;
  onDetectGPS: () => void;
  isLocating: boolean;
}

export function TheatresMapView({
  theatres,
  movies,
  userLocation,
  selectedTheatre,
  onSelectTheatre,
  onSelectShow,
  theatreShows,
  loadingShows,
  radiusKm,
  onRadiusChange,
  onDetectGPS,
  isLocating,
}: TheatresMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const circleLayerRef = useRef<L.Circle | null>(null);

  const [activeTab, setActiveTab] = useState<'info' | 'showtimes'>('showtimes');

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Default center to user location or Mumbai
    const initialLat = userLocation?.lat || 19.066;
    const initialLng = userLocation?.lng || 72.868;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 12,
      zoomControl: false,
    });

    // Add zoom control at top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // High-tech dark CartoDB tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update User Marker & Radius Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation) return;

    // Remove existing user marker & circle
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }
    if (circleLayerRef.current) {
      circleLayerRef.current.remove();
    }

    // Custom user pulsating beacon icon
    const userIcon = L.divIcon({
      className: 'user-location-marker-container',
      html: `
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(0, 255, 157, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 14px; height: 14px; border-radius: 50%; background: #00ff9d; border: 2px solid #ffffff; box-shadow: 0 0 12px #00ff9d;"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 1000 })
      .addTo(map)
      .bindPopup(
        `<div style="font-family: monospace; font-size: 11px; color: #000; padding: 4px;">
          <strong>📍 Your Location</strong><br/>${userLocation.areaName || userLocation.label}
        </div>`
      );
    userMarkerRef.current = userMarker;

    // Draw proximity radius circle
    if (radiusKm < 100) {
      const circle = L.circle([userLocation.lat, userLocation.lng], {
        radius: radiusKm * 1000,
        color: '#10b981',
        weight: 1.5,
        fillColor: '#10b981',
        fillOpacity: 0.06,
        dashArray: '4, 8',
      }).addTo(map);
      circleLayerRef.current = circle;
    }
  }, [userLocation, radiusKm]);

  // Update Theatre Markers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    theatres.forEach((th) => {
      if (!th.latitude || !th.longitude) return;

      const isSelected = selectedTheatre?.id === th.id;
      const isWithinRadius = th.distanceKm !== undefined ? th.distanceKm <= radiusKm : true;

      // Custom high-tech cinema marker
      const markerHtml = `
        <div style="
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px 8px;
          border-radius: 8px;
          background: ${isSelected ? '#00ff9d' : isWithinRadius ? '#0d1410' : '#1f2937'};
          color: ${isSelected ? '#060907' : '#ffffff'};
          border: 1.5px solid ${isSelected ? '#ffffff' : isWithinRadius ? '#10b981' : '#4b5563'};
          font-family: monospace;
          font-size: 10px;
          font-weight: bold;
          white-space: nowrap;
          box-shadow: 0 4px 14px ${isSelected ? 'rgba(0, 255, 157, 0.6)' : 'rgba(0,0,0,0.6)'};
          transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
          transition: all 0.2s ease;
        ">
          <span style="margin-right: 4px;">🎬</span>
          <span>${th.name.split(' ')[0]}</span>
          ${th.distanceKm !== undefined ? `<span style="margin-left: 4px; opacity: 0.8; font-size: 9px;">${th.distanceKm}km</span>` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'theatre-map-marker',
        html: markerHtml,
        iconSize: [90, 30],
        iconAnchor: [45, 15],
      });

      const marker = L.marker([th.latitude, th.longitude], { icon: customIcon });

      // Rich popup on the marker
      const popupContent = `
        <div style="font-family: sans-serif; color: #111; padding: 6px; min-width: 200px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: bold; font-family: monospace; background: #00ff9d; color: #000; padding: 1px 6px; border-radius: 4px;">
              ${th.chain}
            </span>
            <span style="font-size: 11px; color: #d97706; font-weight: bold;">★ ${th.rating || 4.8}</span>
          </div>
          <strong style="font-size: 13px; color: #0f172a; display: block; margin-bottom: 2px;">${th.name}</strong>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 6px 0;">${th.address}</p>
          ${th.distanceKm !== undefined ? `<div style="font-size: 11px; font-weight: bold; color: #059669; margin-bottom: 6px;">📍 ${th.distanceKm} km away from your location</div>` : ''}
          <div style="font-size: 10px; color: #047857; font-family: monospace; font-weight: bold;">
            👉 Click marker to load live shows & book seats
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        soundFx.playClick();
        onSelectTheatre(th);
        map.flyTo([th.latitude!, th.longitude!], 14, { duration: 0.8 });
        // Smooth scroll to side intelligence panel on mobile / tablet
        if (sidePanelRef.current) {
          sidePanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });

      layer.addLayer(marker);
    });
  }, [theatres, selectedTheatre, radiusKm, onSelectTheatre]);

  const sidePanelRef = useRef<HTMLDivElement>(null);
  const showsContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll shows container when selected theatre changes
  useEffect(() => {
    if (selectedTheatre && showsContainerRef.current) {
      showsContainerRef.current.scrollTop = 0;
    }
  }, [selectedTheatre?.id]);

  // Center map on selected theatre if changed
  const handleFocusTheatre = (th: Theatre & { distanceKm?: number }) => {
    soundFx.playClick();
    onSelectTheatre(th);
    if (mapInstanceRef.current && th.latitude && th.longitude) {
      mapInstanceRef.current.flyTo([th.latitude, th.longitude], 14, { duration: 0.8 });
    }
    if (sidePanelRef.current) {
      sidePanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleCenterOnUser = () => {
    soundFx.playClick();
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 13, { duration: 0.8 });
    }
  };

  const showsForSelected = selectedTheatre ? theatreShows[selectedTheatre.id] || [] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-auto lg:h-[720px] rounded-2xl overflow-hidden border border-emerald-500/30 bg-[#070b09] shadow-2xl relative">
      {/* Map Zone (7 cols on desktop) */}
      <div className="lg:col-span-7 relative h-[420px] lg:h-full w-full overflow-hidden bg-black">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Map HUD Top Overlay */}
        <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2 pointer-events-auto">
          <div className="px-3 py-1.5 rounded-xl bg-[#090e0b]/90 border border-emerald-500/40 text-xs font-mono text-emerald-300 backdrop-blur-md shadow-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">RADAR:</span>
            <span>{theatres.length} Indian Cinemas Pinned</span>
          </div>

          <button
            onClick={handleCenterOnUser}
            className="p-2 rounded-xl bg-[#090e0b]/90 hover:bg-[#121c17] border border-emerald-500/40 text-emerald-300 text-xs font-mono backdrop-blur-md shadow-lg transition-colors flex items-center gap-1 cursor-pointer"
            title="Recenter on My Location"
          >
            <LocateFixed className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">My Position</span>
          </button>
        </div>

        {/* Floating Active Theatre Quick Booking Overlay on Map */}
        {selectedTheatre && (
          <div className="absolute top-14 left-3 right-3 sm:right-auto sm:max-w-md z-20 pointer-events-auto bg-[#0a0f0c]/95 border-2 border-emerald-400/80 rounded-2xl p-3 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-400 text-slate-950 text-[10px] font-mono font-black">
                    {selectedTheatre.chain}
                  </span>
                  <span className="text-[11px] font-mono text-slate-300">
                    {selectedTheatre.city}
                  </span>
                  {selectedTheatre.distanceKm !== undefined && (
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      · {selectedTheatre.distanceKm} km away
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold font-display text-white truncate">
                  {selectedTheatre.name}
                </h4>
              </div>

              <span className="text-xs font-mono font-bold text-amber-400 shrink-0 flex items-center gap-0.5">
                ★ {selectedTheatre.rating || 4.8}
              </span>
            </div>

            {/* Quick Showtimes List right inside Map HUD */}
            <div className="mt-2 pt-2 border-t border-emerald-500/20">
              <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 font-bold mb-1.5">
                <span className="flex items-center gap-1">
                  <Ticket className="w-3 h-3 text-emerald-400" />
                  LIVE BOOKING OPTIONS
                </span>
                <span className="text-slate-400">
                  {showsForSelected.length > 0 ? `${showsForSelected.length} shows today` : 'Loading...'}
                </span>
              </div>

              {loadingShows ? (
                <div className="py-2 text-center text-[11px] font-mono text-slate-400 flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <span>Loading shows for {selectedTheatre.name.split(' ')[0]}...</span>
                </div>
              ) : showsForSelected.length === 0 ? (
                <div className="text-[11px] font-mono text-slate-400 py-1">
                  No shows available right now. Check tomorrow's schedule.
                </div>
              ) : (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {showsForSelected.slice(0, 4).map((show) => {
                    const movie = movies.find((m) => m.id === show.movieId);
                    const isIndia = selectedTheatre.city !== 'New York' && selectedTheatre.city !== 'Los Angeles' && selectedTheatre.city !== 'Chicago';
                    const pricePrefix = isIndia ? '₹' : '$';

                    return (
                      <button
                        key={show.id}
                        onClick={() => {
                          soundFx.playClick();
                          if (movie) {
                            onSelectShow(show, movie, selectedTheatre);
                          }
                        }}
                        className="py-1 px-2 rounded-lg bg-black/80 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/40 text-slate-200 text-[10px] font-mono shrink-0 transition-all cursor-pointer group flex flex-col items-start min-w-[100px]"
                        title={`Book ${movie?.title || 'Movie'} at ${show.startTime}`}
                      >
                        <span className="font-bold text-emerald-300 group-hover:text-slate-950 truncate max-w-[110px] text-left block">
                          {show.startTime}
                        </span>
                        <span className="truncate max-w-[110px] text-left text-slate-400 group-hover:text-slate-900 text-[9px] block">
                          {movie?.title ? movie.title.slice(0, 16) : 'Feature'}
                        </span>
                        <span className="font-bold text-emerald-400 group-hover:text-slate-950 text-[10px] mt-0.5">
                          {pricePrefix}{show.pricing.standard} · BOOK
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floating Radius Filter Overlay Bottom Left */}
        <div className="absolute bottom-3 left-3 z-20 bg-[#090e0b]/95 border border-emerald-500/40 rounded-xl p-2.5 backdrop-blur-md shadow-xl text-xs font-mono space-y-1.5 pointer-events-auto">
          <div className="flex items-center justify-between gap-4 text-[11px] text-slate-400">
            <span>PROXIMITY RADIUS:</span>
            <strong className="text-emerald-400 font-bold">{radiusKm >= 100 ? 'All City' : `${radiusKm} km`}</strong>
          </div>
          <div className="flex items-center gap-1">
            {[5, 10, 20, 100].map((r) => (
              <button
                key={r}
                onClick={() => {
                  soundFx.playClick();
                  onRadiusChange(r);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all cursor-pointer ${
                  radiusKm === r
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                    : 'bg-black/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {r === 100 ? 'All' : `${r}km`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Side Intelligence Panel (5 cols on desktop) */}
      <div
        ref={sidePanelRef}
        className="lg:col-span-5 flex flex-col h-[520px] lg:h-full bg-[#0a0f0c] border-t lg:border-t-0 lg:border-l border-emerald-500/20 p-4 overflow-hidden"
      >
        {/* User Locality Header */}
        <div className="p-3.5 bg-black/60 border border-emerald-500/30 rounded-xl mb-3 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
                <Navigation className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block font-bold">
                  Your Area Vicinity
                </span>
                <p className="text-xs font-bold text-white truncate font-sans">
                  {userLocation.areaName || userLocation.label}
                </p>
              </div>
            </div>

            <button
              onClick={onDetectGPS}
              disabled={isLocating}
              className="py-1.5 px-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 text-[11px] font-mono font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? '...' : 'GPS Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Active Selected Cinema Card */}
        {selectedTheatre ? (
          <div className="flex-1 flex flex-col min-h-0 bg-[#0d1410] border border-emerald-500/30 rounded-xl p-4 overflow-hidden">
            <div className="shrink-0 pb-3 border-b border-emerald-500/20">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                      {selectedTheatre.chain}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {selectedTheatre.city}
                    </span>
                  </div>
                  <h3 className="text-base font-bold font-display text-white mt-1">
                    {selectedTheatre.name}
                  </h3>
                </div>

                <div className="text-right shrink-0">
                  {selectedTheatre.distanceKm !== undefined && (
                    <div className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono font-bold inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      <span>{selectedTheatre.distanceKm} km away</span>
                    </div>
                  )}
                  <div className="flex items-center justify-end gap-1 text-xs text-amber-400 font-mono font-bold mt-1">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{selectedTheatre.rating || 4.8}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 mt-1 font-sans">
                {selectedTheatre.address}
              </p>
              {selectedTheatre.landmark && (
                <p className="text-[10px] text-emerald-400/80 font-mono mt-0.5">
                  📍 {selectedTheatre.landmark}
                </p>
              )}

              {/* Driving ETA & Google Maps Action */}
              <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-emerald-500/10 text-[11px] font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {selectedTheatre.distanceKm
                      ? `~${Math.round(selectedTheatre.distanceKm * 2.2 + 4)} mins drive`
                      : 'Nearby'}
                  </span>
                </span>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedTheatre.latitude},${selectedTheatre.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                >
                  <span>Google Maps Route</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Live Showtimes & Direct Booking */}
            <div className="flex-1 flex flex-col min-h-0 mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-emerald-300 flex items-center gap-1">
                  <Ticket className="w-3.5 h-3.5 text-emerald-400" />
                  <span>LIVE SHOWS & DIRECT BOOKING</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">Today</span>
              </div>

              {loadingShows ? (
                <div className="py-8 text-center text-xs font-mono text-slate-400">
                  <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  SYNCING SEAT RADAR...
                </div>
              ) : showsForSelected.length === 0 ? (
                <div className="p-4 bg-black/60 rounded-xl border border-slate-800 text-center text-xs font-mono text-slate-400 my-auto">
                  No shows available at this theatre today.
                </div>
              ) : (
                <div ref={showsContainerRef} className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {showsForSelected.map((show) => {
                    const movie = movies.find((m) => m.id === show.movieId);
                    const title = movie?.title || 'Blockbuster Feature';
                    const availableSeats = show.totalSeats - show.bookedSeatsCount;
                    const isIndia = selectedTheatre.city !== 'New York' && selectedTheatre.city !== 'Los Angeles' && selectedTheatre.city !== 'Chicago';
                    const pricePrefix = isIndia ? '₹' : '$';

                    return (
                      <div
                        key={show.id}
                        className="p-2.5 bg-black/70 border border-emerald-500/25 hover:border-emerald-400 rounded-xl transition-all flex items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate font-display group-hover:text-emerald-300 transition-colors">
                            {title}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                            <span className="text-emerald-300 font-bold">{show.startTime}</span>
                            <span>·</span>
                            <span className="px-1 bg-slate-900 border border-slate-800 rounded text-slate-300">
                              {show.format}
                            </span>
                            <span>·</span>
                            <span>{availableSeats} seats left</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {pricePrefix}{show.pricing.standard}
                          </span>
                          <button
                            onClick={() => {
                              soundFx.playClick();
                              if (movie) {
                                onSelectShow(show, movie, selectedTheatre);
                              }
                            }}
                            className="py-1 px-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-mono font-black rounded-lg transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                          >
                            BOOK
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty state prompt to select from map */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#0d1410] border border-emerald-500/20 rounded-xl">
            <Building className="w-10 h-10 text-emerald-500/40 mb-3" />
            <h4 className="text-sm font-bold font-display text-white">Select a Cinema on Map or List</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs font-sans">
              Click any pin on the map to explore auditoriums, distance, directions, and book tickets instantly.
            </p>
          </div>
        )}

        {/* Quick Nearest Theatres List */}
        <div className="mt-3 pt-2 border-t border-emerald-500/20 shrink-0">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
            <span>CLOSEST THEATRES NEARBY:</span>
            <span>{theatres.filter((t) => t.distanceKm !== undefined && t.distanceKm <= radiusKm).length} within {radiusKm}km</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {theatres.slice(0, 6).map((th) => {
              const isSelected = selectedTheatre?.id === th.id;
              return (
                <button
                  key={th.id}
                  onClick={() => handleFocusTheatre(th)}
                  className={`p-2 rounded-lg border text-left shrink-0 min-w-[140px] max-w-[180px] transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-400 text-white'
                      : 'bg-black/60 border-emerald-500/20 text-slate-300 hover:border-emerald-500/50'
                  }`}
                >
                  <p className="text-[11px] font-bold truncate font-sans">{th.name}</p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1">
                    <span className="text-emerald-400 font-bold">{th.distanceKm !== undefined ? `${th.distanceKm} km` : th.city}</span>
                    <span>⭐ {th.rating || 4.8}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
