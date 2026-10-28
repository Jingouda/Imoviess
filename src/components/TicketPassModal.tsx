import React from 'react';
import { Booking } from '../types/cinema';
import { QRCodeDisplay } from './QRCodeDisplay';
import { X, CheckCircle, Printer, Calendar, MapPin, Share2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface TicketPassModalProps {
  booking: Booking;
  onClose: () => void;
  onViewMyBookings: () => void;
}

export function TicketPassModal({
  booking,
  onClose,
  onViewMyBookings,
}: TicketPassModalProps) {
  const { showToast } = useToast();

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `IMovies Ticket: ${booking.movieTitle} at ${booking.theatreName} on ${booking.showDate} ${booking.showTime}. Booking ID: ${booking.bookingCode}`
      );
      showToast('Ticket booking link copied to clipboard!', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#131722] border border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl relative my-6">
        {/* Top banner */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 flex items-center justify-between text-slate-950">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 fill-slate-950 text-amber-500" />
            <span className="font-bold text-sm tracking-wide">CONFIRMED E-TICKET PASS</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/10 rounded transition-colors text-slate-950"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ticket Body */}
        <div className="p-6 space-y-6">
          {/* Movie Title & Info */}
          <div>
            <div className="flex items-center justify-between text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">
              <span>{booking.format}</span>
              <span className="font-mono text-slate-400">{booking.bookingCode}</span>
            </div>
            <h2 className="text-xl font-bold text-white font-display leading-tight">
              {booking.movieTitle}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{booking.theatreName}</span>
            </div>
          </div>

          {/* Screening Details Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs">
            <div>
              <span className="text-[11px] text-slate-400 block">Date</span>
              <span className="font-semibold text-slate-100">{booking.showDate}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Showtime</span>
              <span className="font-semibold text-amber-300">{booking.showTime}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Auditorium / Screen</span>
              <span className="font-semibold text-slate-100">{booking.screenName}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Reserved Seats ({booking.seats.length})</span>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {booking.seats.map((s) => s.seatId).join(', ')}
              </span>
            </div>
          </div>

          {/* Perforated divider look */}
          <div className="relative flex items-center justify-center my-2">
            <div className="w-full border-t border-dashed border-slate-700" />
            <div className="absolute -left-8 w-4 h-4 bg-slate-950 rounded-full" />
            <div className="absolute -right-8 w-4 h-4 bg-slate-950 rounded-full" />
          </div>

          {/* QR Code and Verification */}
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <QRCodeDisplay data={booking.qrCodeToken} size={150} />
            <p className="text-[11px] text-slate-400 max-w-xs">
              Scan this QR code at turnstiles or cinema usher kiosk for fast-track entry.
            </p>
          </div>

          {/* Guest Name & Total */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Ticket Holder</span>
              <span className="font-medium text-slate-200">{booking.userName}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">Paid Total</span>
              <span className="font-mono font-bold text-white text-base">
                {booking.totalAmount > 60 || booking.theatreAddress?.includes('India') || !booking.theatreAddress?.includes('USA') ? '₹' : '$'}
                {booking.totalAmount.toFixed(2)}
              </span>
              {booking.loyaltyPointsEarned && (
                <span className="text-[10px] text-emerald-400 font-mono block">
                  +{booking.loyaltyPointsEarned} pts earned
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={handlePrint}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Pass</span>
            </button>
            <button
              onClick={handleShare}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Info</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onViewMyBookings();
            }}
            className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-400/20 transition-all text-center block"
          >
            View in My Bookings
          </button>
        </div>
      </div>
    </div>
  );
}
