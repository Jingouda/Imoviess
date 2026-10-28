import React, { useState, useEffect } from 'react';
import { Movie, Show, Theatre, Seat, Booking, LoyaltySummary } from '../types/cinema';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { X, CreditCard, ShieldCheck, Lock, Smartphone, Building, CheckCircle, Award, ArrowLeft } from 'lucide-react';

interface CheckoutModalProps {
  movie: Movie;
  show: Show;
  theatre: Theatre;
  selectedSeats: Seat[];
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

export function CheckoutModal({
  movie,
  show,
  theatre,
  selectedSeats,
  onClose,
  onBookingSuccess,
}: CheckoutModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const isIndia = theatre.city !== 'New York' && theatre.city !== 'Los Angeles' && theatre.city !== 'Chicago';
  const currencySymbol = isIndia ? '₹' : '$';

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'apple_pay' | 'net_banking'>('card');
  const [userName, setUserName] = useState(user?.name || 'Master Operator');
  const [userEmail, setUserEmail] = useState(user?.email || 'operator@imovies.in');
  const [userPhone, setUserPhone] = useState(user?.phone || '+91 98765 43210');

  useEffect(() => {
    if (user?.name) setUserName(user.name);
    if (user?.email) setUserEmail(user.email);
    if (user?.phone) setUserPhone(user.phone);
  }, [user]);

  // Loyalty Program State
  const [loyaltySummary, setLoyaltySummary] = useState<LoyaltySummary | null>(null);
  const [redeemPoints, setRedeemPoints] = useState<number>(0);

  useEffect(() => {
    async function loadLoyalty() {
      try {
        const sum = await api.getLoyaltySummary();
        setLoyaltySummary(sum);
      } catch (err) {
        console.warn('Could not load loyalty summary in checkout:', err);
      }
    }
    loadLoyalty();
  }, []);

  // Card inputs
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('11/28');
  const [cardCvv, setCardCvv] = useState('883');
  const [cardName, setCardName] = useState(userName);

  // UPI input
  const [upiId, setUpiId] = useState('operator@okhdfcbank');

  const [isProcessing, setIsProcessing] = useState(false);

  // Calculations
  const subtotal = selectedSeats.reduce((acc, s) => acc + s.price, 0);
  const convenienceFee = isIndia
    ? Number((selectedSeats.length * 25).toFixed(2))
    : Number((selectedSeats.length * 1.75).toFixed(2));
  const tax = isIndia
    ? Number((subtotal * 0.18).toFixed(2))
    : Number((subtotal * 0.08).toFixed(2));
  const grossTotal = Number((subtotal + convenienceFee + tax).toFixed(2));
  const loyaltyDiscount = isIndia
    ? Number(((redeemPoints / 100) * 10).toFixed(2))
    : Number((redeemPoints / 100).toFixed(2));
  const totalAmount = Math.max(0, Number((grossTotal - loyaltyDiscount).toFixed(2)));

  const estimatedPointsToEarn = Math.round(
    (isIndia ? totalAmount / 2 : totalAmount * 10) * (loyaltySummary?.tierMultiplier || 1)
  );

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // 1. Process payment via backend
      await api.processPayment({
        amount: totalAmount,
        method: paymentMethod,
        cardDetails: { cardNumber, cardExpiry, cardCvv },
        upiId,
      });

      // 2. Create the confirmed booking in DB
      const bookingData = {
        showId: show.id,
        movieId: movie.id,
        theatreId: theatre.id,
        userName,
        userPhone,
        seats: selectedSeats.map((s) => ({
          seatId: s.id,
          row: s.row,
          number: s.number,
          tier: s.tier,
          price: s.price,
        })),
        subtotal,
        convenienceFee,
        tax,
        totalAmount,
        loyaltyPointsRedeemed: redeemPoints,
        loyaltyDiscount,
        paymentMethod,
      };

      const newBooking = await api.createBooking(bookingData);
      showToast(
        `Booking confirmed! You earned ${estimatedPointsToEarn} loyalty points.`,
        'success'
      );
      onBookingSuccess(newBooking);
    } catch (err: any) {
      showToast(err.message || 'Payment processing failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121622] border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative my-8">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-semibold border border-slate-700/60"
              title="Back to seat selection"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <div className="p-2 bg-amber-400/10 text-amber-400 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Secure Checkout & Ticket Pass</h3>
              <p className="text-xs text-slate-400">256-bit encrypted cinema gateway</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handlePay} className="p-6 space-y-6">
          {/* Order Summary Card */}
          <div className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-xl space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-white text-base">{movie.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {theatre.name} · {show.format}
                </p>
                <p className="text-xs text-amber-400/90 font-medium mt-0.5">
                  {show.date} at {show.startTime}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Seats ({selectedSeats.length})</span>
                <p className="font-mono font-bold text-slate-100 text-sm">
                  {selectedSeats.map((s) => s.id).join(', ')}
                </p>
              </div>
            </div>

            {/* Pricing math */}
            <div className="pt-3 border-t border-slate-800/60 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Tickets Subtotal</span>
                <span className="font-mono text-slate-200">{currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{isIndia ? 'Online Convenience Fee (₹25/ticket)' : 'Convenience & Online Service Fee'}</span>
                <span className="font-mono text-slate-200">{currencySymbol}{convenienceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{isIndia ? 'Integrated GST (18%)' : 'Integrated State Cinema Tax'}</span>
                <span className="font-mono text-slate-200">{currencySymbol}{tax.toFixed(2)}</span>
              </div>
              {loyaltyDiscount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>Loyalty Points Discount ({redeemPoints} pts)</span>
                  </span>
                  <span className="font-mono">-{currencySymbol}{loyaltyDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-sm text-white">
                <span>Total Payable</span>
                <span className="font-mono text-amber-400 text-base">{currencySymbol}{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1 text-[11px] text-amber-300/80 font-medium">
                <span>XP Points you will earn on this booking:</span>
                <span className="font-mono text-amber-300 font-bold">+{estimatedPointsToEarn} XP</span>
              </div>
            </div>
          </div>

          {/* Loyalty Points Redemption Option */}
          {loyaltySummary && loyaltySummary.totalPoints >= 100 && (
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-400">
                  <Award className="w-4 h-4" />
                  <span>Redeem Loyalty Points for Discount</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Available: <strong className="text-white">{loyaltySummary.totalPoints.toLocaleString()}</strong> pts
                </span>
              </div>

              <p className="text-[11px] text-slate-300">
                Redeem 100 points for $1.00 instant discount off your ticket order.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setRedeemPoints(0)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                    redeemPoints === 0
                      ? 'bg-slate-700 text-white font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Don't use points
                </button>

                {loyaltySummary.totalPoints >= 250 && grossTotal >= 2.5 && (
                  <button
                    type="button"
                    onClick={() => setRedeemPoints(250)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                      redeemPoints === 250
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                    }`}
                  >
                    250 pts (-$2.50)
                  </button>
                )}

                {loyaltySummary.totalPoints >= 500 && grossTotal >= 5.0 && (
                  <button
                    type="button"
                    onClick={() => setRedeemPoints(500)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                      redeemPoints === 500
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                    }`}
                  >
                    500 pts (-$5.00)
                  </button>
                )}

                {loyaltySummary.totalPoints >= 1000 && grossTotal >= 10.0 && (
                  <button
                    type="button"
                    onClick={() => setRedeemPoints(1000)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                      redeemPoints === 1000
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                    }`}
                  >
                    1,000 pts (-$10.00)
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const maxAffordablePoints = Math.floor(grossTotal * 100);
                    const maxPoints = Math.min(loyaltySummary.totalPoints, maxAffordablePoints);
                    // Round down to multiple of 100
                    const cleanMax = Math.floor(maxPoints / 100) * 100;
                    setRedeemPoints(cleanMax);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                    redeemPoints > 1000 || (redeemPoints > 0 && redeemPoints !== 250 && redeemPoints !== 500 && redeemPoints !== 1000)
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  Max Available
                </button>
              </div>
            </div>
          )}

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Ticket Delivery & Contact Info
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Email for E-Ticket</label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Payment Method
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-amber-400 bg-amber-400/10 text-amber-300 font-semibold'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Credit / Debit</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-amber-400 bg-amber-400/10 text-amber-300 font-semibold'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>UPI / QR</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('apple_pay')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'apple_pay'
                    ? 'border-amber-400 bg-amber-400/10 text-amber-300 font-semibold'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Apple / Google</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('net_banking')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'net_banking'
                    ? 'border-amber-400 bg-amber-400/10 text-amber-300 font-semibold'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Net Banking</span>
              </button>
            </div>
          </div>

          {/* Payment Method Details */}
          {paymentMethod === 'card' && (
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Expiry Date (MM/YY)</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'upi' && (
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
              <label className="block text-[11px] text-slate-400 font-medium">Virtual Payment Address (VPA / UPI ID)</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@okhdfcbank"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
              />
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-mono">Quick App:</span>
                {['@okhdfcbank (GPay)', '@ybl (PhonePe)', '@paytm', '@ibl (BHIM)'].map((appHandle) => (
                  <button
                    key={appHandle}
                    type="button"
                    onClick={() => {
                      const prefix = user?.name ? user.name.toLowerCase().replace(/\s+/g, '') : 'operator';
                      setUpiId(`${prefix}${appHandle.split(' ')[0]}`);
                    }}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-emerald-400 border border-slate-700 cursor-pointer"
                  >
                    {appHandle}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400">
                A secure instant UPI payment request notification will be sent to your device to authorize.
              </p>
            </div>
          )}

          {paymentMethod === 'apple_pay' && (
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-center py-6">
              <p className="text-xs text-slate-300">
                Instant biometric authorization ready via TouchID / FaceID / Google Wallet token.
              </p>
            </div>
          )}

          {paymentMethod === 'net_banking' && (
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-2">
              <label className="block text-[11px] text-slate-400">Select Bank</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400">
                {isIndia ? (
                  <>
                    <option>HDFC Bank (All Branches)</option>
                    <option>State Bank of India (SBI)</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Kotak Mahindra Bank</option>
                    <option>Punjab National Bank (PNB)</option>
                    <option>Bank of Baroda</option>
                  </>
                ) : (
                  <>
                    <option>Chase Bank</option>
                    <option>Bank of America</option>
                    <option>Wells Fargo</option>
                    <option>Citibank</option>
                  </>
                )}
              </select>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Seats</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 text-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Authorizing Payment...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Pay {currencySymbol}{totalAmount.toFixed(2)} & Reserve</span>
                </>
              )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
