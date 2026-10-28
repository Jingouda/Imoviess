import React, { useState } from 'react';
import { Booking } from '../types/cinema';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { LoyaltyWidget } from './LoyaltyWidget';
import { Ticket, Calendar, Clock, MapPin, QrCode, AlertTriangle, ArrowRight, ArrowLeft, Award } from 'lucide-react';

interface MyBookingsViewProps {
  bookings: Booking[];
  onRefreshBookings: () => void;
  onViewTicket: (booking: Booking) => void;
  onBrowseMovies: () => void;
}

export function MyBookingsView({
  bookings,
  onRefreshBookings,
  onViewTicket,
  onBrowseMovies,
}: MyBookingsViewProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const now = new Date().toISOString().split('T')[0];

  const upcomingBookings = bookings.filter(
    (b) => b.bookingStatus === 'confirmed' && b.showDate >= now
  );

  const pastBookings = bookings.filter(
    (b) => b.bookingStatus === 'cancelled' || b.showDate < now
  );

  const displayed = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    setIsSubmittingCancel(true);
    try {
      await api.cancelBooking(cancellingBooking.id);
      showToast(`Booking ${cancellingBooking.bookingCode} cancelled. 90% refund processed.`, 'success');
      setCancellingBooking(null);
      onRefreshBookings();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel booking', 'error');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back to Movies button */}
      <button
        onClick={onBrowseMovies}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 font-semibold mb-5 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Movies</span>
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
            My Cinema Bookings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Access your fast-track digital passes, reserved seats, and booking histories.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'upcoming'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Upcoming ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'past'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            History & Cancelled ({pastBookings.length})
          </button>
        </div>
      </div>

      {/* Loyalty Points Tracking Widget */}
      <LoyaltyWidget onPointsRedeemedOrUpdated={onRefreshBookings} />

      {/* Bookings List */}
      {displayed.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl max-w-lg mx-auto">
          <div className="w-12 h-12 bg-amber-400/10 rounded-2xl flex items-center justify-center text-amber-400 mx-auto mb-3">
            <Ticket className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            {activeTab === 'upcoming' ? 'No Upcoming Reservations' : 'No Past Bookings'}
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            {activeTab === 'upcoming'
              ? 'Browse currently showing movies and pick your favorite seats in IMAX or Dolby Cinema.'
              : 'Your concluded cinema shows and cancelled bookings will appear here.'}
          </p>
          <button
            onClick={onBrowseMovies}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-400/20 inline-flex items-center gap-2"
          >
            <span>Browse Now Showing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayed.map((booking) => {
            const isConfirmed = booking.bookingStatus === 'confirmed';

            return (
              <div
                key={booking.id}
                className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {booking.bookingCode}
                      </span>
                      {booking.loyaltyPointsEarned && isConfirmed && (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          <span>+{booking.loyaltyPointsEarned} pts</span>
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isConfirmed
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {isConfirmed ? 'Confirmed' : 'Cancelled / Refunded'}
                    </span>
                  </div>

                  {/* Movie and Details */}
                  <div className="flex gap-4">
                    <img
                      src={booking.moviePoster}
                      alt={booking.movieTitle}
                      referrerPolicy="no-referrer"
                      className="w-16 h-24 object-cover rounded-lg shrink-0 border border-slate-800"
                    />
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <h3 className="font-bold text-white text-base truncate font-display">
                        {booking.movieTitle}
                      </h3>
                      <p className="text-xs text-amber-300/90 font-medium">
                        {booking.format} · {booking.screenName}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{booking.theatreName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Show info grid */}
                  <div className="grid grid-cols-3 gap-2 mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800/60 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Date</span>
                      <span className="font-semibold text-slate-200">{booking.showDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Time</span>
                      <span className="font-semibold text-amber-300">{booking.showTime}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Seats ({booking.seats.length})</span>
                      <span className="font-mono font-bold text-slate-100">
                        {booking.seats.map((s) => s.seatId).join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer and Actions */}
                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Amount</span>
                    <span className="text-sm font-bold font-mono text-white">
                      {booking.totalAmount > 60 ? '₹' : '$'}{booking.totalAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isConfirmed && (
                      <button
                        onClick={() => setCancellingBooking(booking)}
                        className="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/40 rounded-lg transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={() => onViewTicket(booking)}
                      className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>View E-Pass</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121622] border border-rose-900/50 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-500/10">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Confirm Cancellation</h3>
                <p className="text-xs text-slate-400">Booking {cancellingBooking.bookingCode}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to cancel your reservation for{' '}
              <strong className="text-white">{cancellingBooking.movieTitle}</strong> on{' '}
              <strong className="text-white">{cancellingBooking.showDate}</strong>?
            </p>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Original Paid Amount:</span>
                <span className="font-mono text-slate-200">
                  ${cancellingBooking.totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Cancellation Fee (10%):</span>
                <span className="font-mono text-rose-400">
                  -${(cancellingBooking.totalAmount * 0.1).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t border-slate-800 text-emerald-400">
                <span>Estimated Refund (90%):</span>
                <span className="font-mono">
                  ${(cancellingBooking.totalAmount * 0.9).toFixed(2)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              Seats {cancellingBooking.seats.map((s) => s.seatId).join(', ')} will be immediately released
              back to the auditorium show inventory.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCancellingBooking(null)}
                disabled={isSubmittingCancel}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Keep Reservation
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isSubmittingCancel}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50"
              >
                {isSubmittingCancel ? 'Processing Refund...' : 'Confirm & Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
