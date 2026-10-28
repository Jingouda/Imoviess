import React, { useState, useEffect } from 'react';
import { Show, Seat, SeatTier, Movie, Theatre } from '../types/cinema';
import { soundFx } from '../services/soundFx';
import { ArrowLeft, Clock, ShieldCheck, Crosshair, Radio, Zap, Sparkles } from 'lucide-react';

interface SeatMatrixProps {
  show: Show;
  movie: Movie;
  theatre: Theatre;
  onBack: () => void;
  onProceedToCheckout: (selectedSeats: Seat[]) => void;
  onLockSeats: (seatIds: string[]) => Promise<boolean>;
}

export function SeatMatrix({
  show,
  movie,
  theatre,
  onBack,
  onProceedToCheckout,
  onLockSeats,
}: SeatMatrixProps) {
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [lockCountdown, setLockCountdown] = useState<number>(480);
  const [isLocking, setIsLocking] = useState<boolean>(false);

  const isIndia = theatre.city !== 'New York' && theatre.city !== 'Los Angeles' && theatre.city !== 'Chicago';
  const currSymbol = isIndia ? '₹' : '$';

  const rowNames = Array.from(
    new Set(Object.values(show.seats).map((s) => s.row))
  ).sort();

  const handleSeatClick = (seat: Seat) => {
    if (
      seat.status === 'booked' ||
      (seat.status === 'locked' && !selectedSeatIds.includes(seat.id))
    ) {
      return;
    }

    if (selectedSeatIds.includes(seat.id)) {
      soundFx.playSeatDeselect();
      setSelectedSeatIds((prev) => prev.filter((id) => id !== seat.id));
    } else {
      if (selectedSeatIds.length >= 8) return;
      soundFx.playSeatSelect();
      setSelectedSeatIds((prev) => [...prev, seat.id]);
    }
  };

  useEffect(() => {
    if (selectedSeatIds.length === 0) return;
    const interval = setInterval(() => {
      setLockCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedSeatIds.length]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const selectedSeatsList = selectedSeatIds
    .map((id) => show.seats[id])
    .filter(Boolean);

  const subtotal = selectedSeatsList.reduce((sum, s) => sum + s.price, 0);

  const handleProceed = async () => {
    if (selectedSeatIds.length === 0) return;
    soundFx.playClick();
    setIsLocking(true);
    try {
      const ok = await onLockSeats(selectedSeatIds);
      if (ok) {
        onProceedToCheckout(selectedSeatsList);
      }
    } finally {
      setIsLocking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b09] text-slate-100 pb-28 font-sans">
      {/* Top HUD Telemetry Bar */}
      <div className="border-b border-emerald-500/30 bg-[#090e0b]/90 backdrop-blur-md sticky top-18 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundFx.playClick();
              onBack();
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-emerald-950/60 text-emerald-400 hover:text-emerald-300 transition-all text-xs font-mono font-bold border border-emerald-500/40"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RADAR RETURN</span>
          </button>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 font-mono">
              <span>{movie.title}</span>
              <span className="text-xs text-emerald-500">//</span>
              <span className="text-xs text-emerald-400 font-bold tracking-wider">
                [{show.format}]
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              GRID: {theatre.name.toUpperCase()} · DATE: {show.date} · T-MINUS: {show.startTime}
            </p>
          </div>
        </div>

        {selectedSeatIds.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-500/50 px-3 py-1.5 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.25)]">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>LOCK RESERVED: {formatCountdown(lockCountdown)}</span>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Holographic Curved Cinema Screen */}
        <div className="mb-12 text-center relative">
          <div className="relative mx-auto max-w-2xl h-10 bg-gradient-to-b from-emerald-400/40 via-emerald-900/10 to-transparent cinema-screen-arc border-t-2 border-emerald-400 shadow-[0_12px_40px_rgba(0,255,157,0.3)]" />
          <p className="text-[10px] font-mono tracking-widest text-emerald-400 mt-2 font-bold uppercase flex items-center justify-center gap-2">
            <Crosshair className="w-3 h-3 text-emerald-400 animate-spin" />
            <span>HOLOGRAPHIC LASER PROJECTION ARC // 4K 120HZ</span>
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-10 text-xs font-mono text-slate-400 bg-[#0d1410] border border-emerald-500/25 p-3.5 rounded-xl max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded border border-slate-700 bg-slate-900" />
            <span>AVAILABLE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-emerald-400 text-slate-950 font-black shadow-[0_0_12px_rgba(0,255,157,0.8)] border border-emerald-300" />
            <span className="text-emerald-300 font-bold">TARGET LOCKED</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-slate-950 border border-slate-900 opacity-40 cursor-not-allowed" />
            <span>OCCUPIED</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-cyan-950/60 border border-cyan-500/50" />
            <span className="text-cyan-300">COMMAND VIP (${show.pricing.vip})</span>
          </div>
        </div>

        {/* Tactical Seat Matrix Grid */}
        <div className="overflow-x-auto pb-6">
          <div className="min-w-[680px] max-w-3xl mx-auto space-y-3">
            {rowNames.map((rowName) => {
              const rowSeats = Object.values(show.seats)
                .filter((s) => s.row === rowName)
                .sort((a, b) => a.number - b.number);

              return (
                <div key={rowName} className="flex items-center gap-3 justify-center">
                  {/* Row Label Left */}
                  <span className="w-6 text-center text-xs font-bold text-emerald-500/70 font-mono">
                    {rowName}
                  </span>

                  {/* Seat Row */}
                  <div className="flex items-center gap-1.5">
                    {rowSeats.map((seat) => {
                      const isSelected = selectedSeatIds.includes(seat.id);
                      const isBooked = seat.status === 'booked';
                      const isLocked = seat.status === 'locked' && !isSelected;
                      const hasRightAisle = seat.number === 4 || seat.number === 10;

                      return (
                        <React.Fragment key={seat.id}>
                          <button
                            onClick={() => handleSeatClick(seat)}
                            disabled={isBooked || isLocked}
                            title={`Target Coordinate ${seat.id} (${seat.tier.toUpperCase()} - $${seat.price})`}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded text-[11px] font-mono font-bold transition-all flex items-center justify-center relative group/seat ${
                              isSelected
                                ? 'bg-emerald-400 text-slate-950 font-black scale-110 shadow-[0_0_18px_rgba(0,255,157,0.8)] border border-emerald-200 z-10'
                                : isBooked
                                ? 'bg-slate-950 text-slate-700 border border-slate-900 cursor-not-allowed opacity-30'
                                : isLocked
                                ? 'bg-slate-900 text-slate-600 border border-amber-900/40 cursor-not-allowed'
                                : seat.tier === 'vip'
                                ? 'bg-cyan-950/40 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/60 hover:scale-105 hover:shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                                : seat.tier === 'premium'
                                ? 'bg-[#111a14] border border-emerald-500/40 text-emerald-300 hover:bg-emerald-950 hover:scale-105'
                                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-emerald-300 hover:scale-105'
                            }`}
                          >
                            {seat.number}
                          </button>
                          {hasRightAisle && <div className="w-5 sm:w-7" />}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Row Label Right */}
                  <span className="w-6 text-center text-xs font-bold text-emerald-500/70 font-mono">
                    {rowName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sector Telemetry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mt-8 font-mono">
          <div className="p-3 bg-[#0d1410] rounded-xl border border-emerald-500/20 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-200">FRONTLINE ASSAULT</p>
              <p className="text-[10px] text-slate-400">Rows A - C</p>
            </div>
            <span className="text-sm font-bold text-emerald-400">{currSymbol}{show.pricing.standard}</span>
          </div>
          <div className="p-3 bg-[#0d1410] rounded-xl border border-emerald-500/20 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-200">MID-FIELD RECON</p>
              <p className="text-[10px] text-slate-400">Rows D - F</p>
            </div>
            <span className="text-sm font-bold text-emerald-400">{currSymbol}{show.pricing.premium}</span>
          </div>
          <div className="p-3 bg-[#0d1410] rounded-xl border border-emerald-500/20 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-cyan-300">COMMAND VIP DECK</p>
              <p className="text-[10px] text-slate-400">Rows G - H</p>
            </div>
            <span className="text-sm font-bold text-cyan-400">{currSymbol}{show.pricing.vip}</span>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Order Bar */}
      {selectedSeatIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#090e0b]/95 border-t border-emerald-500/40 backdrop-blur-lg p-4 z-40 shadow-2xl font-mono">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div>
                <p className="text-xs text-slate-400">
                  LOCKED COORDINATES ({selectedSeatIds.length})
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedSeatsList.map((s) => (
                    <span
                      key={s.id}
                      className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-bold"
                    >
                      [{s.id}]
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
              <div className="text-right">
                <p className="text-xs text-slate-400">TOTAL MISSION COST</p>
                <p className="text-xl font-bold text-emerald-400">{currSymbol}{subtotal.toFixed(2)}</p>
              </div>

              <button
                onClick={handleProceed}
                disabled={isLocking}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50 cursor-pointer"
              >
                <span>{isLocking ? 'HOLDING LOCK...' : 'CONFIRM & DEPLOY TO PASS'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
