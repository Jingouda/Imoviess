import React, { useState, useEffect } from 'react';
import { LoyaltySummary, LoyaltyTransaction } from '../types/cinema';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Award,
  Sparkles,
  TrendingUp,
  History,
  X,
  ShieldCheck,
  ChevronRight,
  Info,
  Gift,
  CheckCircle2,
} from 'lucide-react';

interface LoyaltyWidgetProps {
  onPointsRedeemedOrUpdated?: () => void;
}

export function LoyaltyWidget({ onPointsRedeemedOrUpdated }: LoyaltyWidgetProps) {
  const { showToast } = useToast();
  const [summary, setSummary] = useState<LoyaltySummary | null>(null);
  const [history, setHistory] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showPerksModal, setShowPerksModal] = useState<boolean>(false);

  const fetchLoyaltyData = async () => {
    try {
      const [sumData, histData] = await Promise.all([
        api.getLoyaltySummary(),
        api.getLoyaltyHistory(),
      ]);
      setSummary(sumData);
      setHistory(histData);
    } catch (err) {
      console.warn('Failed to load loyalty data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#121622] border border-slate-800 rounded-2xl p-4 animate-pulse mb-8">
        <div className="h-4 bg-slate-800 rounded w-1/4 mb-3" />
        <div className="h-8 bg-slate-850 rounded w-1/2" />
      </div>
    );
  }

  if (!summary) return null;

  // Tier color styling
  const tierColors: Record<string, { bg: string; text: string; border: string; accent: string }> = {
    bronze: {
      bg: 'bg-amber-950/30',
      text: 'text-amber-300',
      border: 'border-amber-700/40',
      accent: 'from-amber-700 to-amber-900',
    },
    silver: {
      bg: 'bg-slate-800/40',
      text: 'text-slate-200',
      border: 'border-slate-400/40',
      accent: 'from-slate-300 to-slate-500',
    },
    gold: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-400/40',
      accent: 'from-amber-400 to-amber-600',
    },
    platinum: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-300',
      border: 'border-rose-400/40',
      accent: 'from-rose-400 to-indigo-400',
    },
  };

  const style = tierColors[summary.tier] || tierColors.bronze;

  return (
    <>
      {/* Compact Loyalty Widget Banner */}
      <div className="bg-[#121622] border border-slate-800/90 hover:border-amber-500/30 rounded-2xl p-4 sm:p-5 mb-8 transition-all shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          {/* Left: Balance & Tier */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20 shrink-0">
              <Award className="w-6 h-6" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${style.bg} ${style.text} ${style.border}`}>
                  {summary.tierName}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-300 font-medium">
                  {summary.tierMultiplier}x Earning Multiplier
                </span>
                <button
                  onClick={() => setShowPerksModal(true)}
                  className="text-amber-400 hover:text-amber-300 text-[11px] underline underline-offset-2 ml-1"
                >
                  View Tier Perks
                </button>
              </div>

              <div className="flex items-baseline gap-3 mt-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
                  {summary.totalPoints.toLocaleString()}
                </span>
                <span className="text-xs text-amber-400/90 font-semibold uppercase tracking-wider">
                  Loyalty Points
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  (Worth ${summary.cashValue.toFixed(2)} at checkout)
                </span>
              </div>
            </div>
          </div>

          {/* Right: Progress & Ledger Action */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:max-w-md w-full justify-end">
            {summary.nextTierName && (
              <div className="flex-1 min-w-[200px]">
                <div className="flex justify-between items-center text-[11px] mb-1.5">
                  <span className="text-slate-400">
                    Next:{' '}
                    <strong className="text-slate-200">{summary.nextTierName}</strong>
                  </span>
                  <span className="font-mono text-amber-300 font-bold">
                    {summary.pointsToNextTier} pts to go
                  </span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500"
                    style={{ width: `${summary.progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={() => setShowHistoryModal(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Points History</span>
            </button>
          </div>
        </div>
      </div>

      {/* POPUP MODAL: POINTS HISTORY / LEDGER */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121622] border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-400/10 text-amber-400 rounded-lg">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Points Activity Ledger</h3>
                  <p className="text-xs text-slate-400">
                    Current balance:{' '}
                    <strong className="text-amber-400 font-mono">
                      {summary.totalPoints.toLocaleString()} pts
                    </strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 max-h-80 overflow-y-auto divide-y divide-slate-800/80 space-y-2 text-xs">
              {history.length === 0 ? (
                <p className="text-center py-8 text-slate-400 text-xs">No points transactions recorded yet.</p>
              ) : (
                history.map((tx) => {
                  const isPositive = tx.points > 0;
                  return (
                    <div key={tx.id} className="pt-2.5 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-200 text-xs">{tx.description}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {new Date(tx.timestamp).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-mono font-bold text-sm ${
                            isPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isPositive ? `+${tx.points}` : tx.points} pts
                        </span>
                        <span className="block text-[10px] text-slate-400 uppercase tracking-wider">
                          {tx.type}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 text-right">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: TIER PERKS INFO */}
      {showPerksModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121622] border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-400/10 text-amber-400 rounded-lg">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">IMovies Membership Tiers</h3>
                  <p className="text-xs text-slate-400">Earn 10 base points per $1 spent</p>
                </div>
              </div>
              <button
                onClick={() => setShowPerksModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="p-3 rounded-xl border border-amber-900/40 bg-amber-950/20">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-amber-300">Bronze Reel (0 - 999 pts)</span>
                  <span className="font-mono text-slate-400">1.0x Points</span>
                </div>
                <p className="text-slate-400 text-[11px]">Standard point earning on all shows and screenings.</p>
              </div>

              <div className="p-3 rounded-xl border border-slate-700/50 bg-slate-900/60">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-200">Silver Screen (1,000 - 2,499 pts)</span>
                  <span className="font-mono text-amber-300">1.1x Points</span>
                </div>
                <p className="text-slate-300 text-[11px]">10% bonus points + free gourmet popcorn refill voucher.</p>
              </div>

              <div className="p-3 rounded-xl border border-amber-500/40 bg-amber-500/10">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-amber-400">Gold Marquee (2,500 - 4,999 pts)</span>
                  <span className="font-mono text-amber-300">1.25x Points</span>
                </div>
                <p className="text-slate-300 text-[11px]">25% bonus points + zero online booking fees waiver.</p>
              </div>

              <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-500/10">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-rose-300">Platinum Premier (5,000+ pts)</span>
                  <span className="font-mono text-amber-300">1.5x Points</span>
                </div>
                <p className="text-slate-300 text-[11px]">50% bonus points + complimentary VIP seat upgrades.</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-right">
              <button
                onClick={() => setShowPerksModal(false)}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
