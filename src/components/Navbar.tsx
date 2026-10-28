import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { soundFx } from '../services/soundFx';
import {
  Film,
  User,
  Bell,
  Shield,
  LogOut,
  Ticket,
  Volume2,
  VolumeX,
  Download,
  Tv,
  Zap,
  Radio,
  Gamepad2,
  MapPin,
} from 'lucide-react';
import { NotificationItem } from '../types/cinema';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  onOpenAuthModal: () => void;
  downloadCount?: number;
  userAreaName?: string;
}

export function Navbar({
  currentTab,
  onSelectTab,
  notifications,
  onOpenNotifications,
  onOpenAuthModal,
  downloadCount = 0,
  userAreaName = 'Bandra BKC, Mumbai',
}: NavbarProps) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(soundFx.getMuted());

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleTabClick = (tab: string) => {
    soundFx.playClick();
    onSelectTab(tab);
  };

  const handleAudioToggle = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#070b09]/95 backdrop-blur-md border-b border-emerald-500/30 shadow-lg shadow-emerald-950/20 font-sans">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 h-18">
        {/* Zone 1: Brand title with Gamer Radar Tag */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleTabClick('movies')}
            className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
          >
            <div className="relative w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center text-emerald-400 font-black shadow-md shadow-emerald-500/20 group-hover:border-emerald-400 transition-colors">
              <Film className="w-5 h-5 text-emerald-400" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping opacity-75" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-xl tracking-wider text-slate-100 group-hover:text-emerald-400 transition-colors">
                  IMOVIES
                </span>
                <span className="text-[10px] font-mono tracking-widest text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">
                  CINEMA
                </span>
              </div>
              <p className="text-[10px] font-mono text-emerald-400/80 hidden sm:block tracking-wider">
                TACTICAL CINEMA // STREAM VAULT
              </p>
            </div>
          </button>

          {/* Quick Location Radar Pill */}
          <button
            onClick={() => handleTabClick('cinemas')}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono transition-all group cursor-pointer"
            title="Click to view Nearby Indian Theatres on Live Map"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-white truncate max-w-[160px]">{userAreaName}</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/30">
              Nearby GPS
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-mono font-medium tracking-wider text-slate-300">
          <button
            onClick={() => handleTabClick('movies')}
            className={`whitespace-nowrap transition-colors py-1 border-b-2 flex items-center gap-1.5 ${
              currentTab === 'movies'
                ? 'text-emerald-400 border-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-100'
            }`}
          >
            <span>CATALOG (100)</span>
          </button>
          <button
            onClick={() => handleTabClick('stream_vault')}
            className={`whitespace-nowrap transition-colors py-1 border-b-2 flex items-center gap-1.5 ${
              currentTab === 'stream_vault'
                ? 'text-emerald-400 border-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-100'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>4K STREAM VAULT</span>
          </button>
          <button
            onClick={() => handleTabClick('downloads')}
            className={`whitespace-nowrap transition-colors py-1 border-b-2 flex items-center gap-1.5 ${
              currentTab === 'downloads'
                ? 'text-emerald-400 border-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-100'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>OFFLINE DOWNLOADS</span>
            {downloadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold">
                {downloadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabClick('cinemas')}
            className={`whitespace-nowrap transition-colors py-1 border-b-2 flex items-center gap-1.5 ${
              currentTab === 'cinemas'
                ? 'text-emerald-400 border-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-100'
            }`}
          >
            <span>INDIAN THEATRES</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>
          <button
            onClick={() => handleTabClick('bookings')}
            className={`whitespace-nowrap transition-colors py-1 border-b-2 flex items-center gap-1.5 ${
              currentTab === 'bookings'
                ? 'text-emerald-400 border-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-100'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>PASSES & XP</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => handleTabClick('admin')}
              className={`whitespace-nowrap transition-colors py-1 border-b-2 flex items-center gap-1.5 ${
                currentTab === 'admin'
                  ? 'text-cyan-400 border-cyan-400 font-bold'
                  : 'border-transparent text-cyan-400/70 hover:text-cyan-300'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>ADMIN</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Audio Toggle, Gamer Level & Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Tactical Audio SFX Toggle */}
          <button
            onClick={handleAudioToggle}
            className={`p-2 rounded-lg border text-xs transition-colors flex items-center gap-1.5 font-mono ${
              !isMuted
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
            title={isMuted ? 'Unmute Tactical Sound SFX' : 'Mute Tactical Sound SFX'}
          >
            {!isMuted ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline text-[10px] font-bold">SFX ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span className="hidden sm:inline text-[10px]">MUTED</span>
              </>
            )}
          </button>

          {/* Gamer XP Telemetry Badge */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono">
            <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-400 block leading-none">RANK</span>
              <span className="text-emerald-400 font-bold text-[11px] leading-tight">
                VANGUARD LVL 4
              </span>
            </div>
          </div>

          {/* Notification Bell */}
          {isAuthenticated && (
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800/80 transition-colors focus:outline-none"
              title="Tactical Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
              )}
            </button>
          )}

          {/* User profile / Login */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pl-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 hover:border-emerald-400 transition-all focus:outline-none"
              >
                <span className="text-xs font-mono text-slate-200 hidden sm:inline max-w-[100px] truncate">
                  {user.name.split(' ')[0]}
                </span>
                <img
                  src={
                    user.avatar ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'
                  }
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-md object-cover ring-1 ring-emerald-500/50"
                />
              </button>

              {/* Profile dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#090e0b] border border-emerald-500/40 rounded-xl shadow-2xl py-2 z-50 text-xs font-mono">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="font-bold text-slate-100 text-sm truncate">{user.name}</p>
                    <p className="text-slate-400 truncate mt-0.5">{user.email}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Tactical Role:</span>
                      <span
                        className={`font-bold uppercase tracking-wider ${
                          isAdmin ? 'text-cyan-400' : 'text-emerald-400'
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                  </div>

                  {/* Verified Session Status */}
                  <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Google Verified
                    </span>
                    <span className="font-mono text-emerald-400/80">Active</span>
                  </div>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onSelectTab('downloads');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-slate-300 hover:bg-emerald-950/40 hover:text-emerald-300 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Offline Downloads</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onSelectTab('bookings');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-slate-300 hover:bg-emerald-950/40 hover:text-emerald-300 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Ticket className="w-3.5 h-3.5 text-emerald-400" />
                      <span>My Passes & Loyalty XP</span>
                    </div>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        onSelectTab('admin');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-slate-300 hover:bg-cyan-950/40 hover:text-cyan-300 flex items-center gap-2"
                    >
                      <Shield className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Admin Command Desk</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      logout();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-950/40 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenAuthModal();
              }}
              className="px-3.5 py-1.5 text-xs font-mono font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shadow-md shadow-emerald-500/20"
            >
              SIGN IN
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
