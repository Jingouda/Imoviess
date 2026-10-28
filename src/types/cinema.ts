export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export type MovieStatus = 'now_showing' | 'coming_soon';

export interface Movie {
  id: string;
  title: string;
  tagline: string;
  description: string;
  genres: string[];
  languages: string[];
  durationMinutes: number;
  releaseDate: string;
  rating: number; // e.g. 8.9 / 10
  votesCount: number;
  certificate: 'U' | 'U/A' | 'PG' | 'PG-13' | 'R' | 'A' | 'G';
  director: string;
  cast: string[];
  posterUrl: string;
  backdropUrl: string;
  formats: string[]; // ['IMAX 3D', 'Dolby Cinema', '4DX', 'Standard 2D']
  status: MovieStatus;
  featured?: boolean;
  streamUrl?: string;
  trailerUrl?: string;
  downloadSize?: string; // e.g. '5.4 GB'
  streamQuality?: string[]; // e.g. ['4K UHD', 'Dolby Vision', '1080p']
  audioLanguages?: string[]; // e.g. ['Hindi 5.1', 'English Atmos']
  canWatchOnline?: boolean;
  canDownload?: boolean;
}

export interface DownloadedMovie {
  id: string;
  movieId: string;
  title: string;
  posterUrl: string;
  quality: string;
  fileSize: string;
  downloadedAt: string;
  progress: number;
  status: 'downloading' | 'completed' | 'paused';
  audioTrack: string;
  durationMinutes: number;
}


export interface TheatreScreen {
  id: string;
  name: string;
  format: string; // 'IMAX 3D' | 'Dolby Atmos' | 'ScreenX' | 'Classic'
  rows: number;
  cols: number;
  totalSeats: number;
}

export interface Theatre {
  id: string;
  name: string;
  chain: string; // 'PVR INOX', 'Cinepolis', 'Prasads Group', 'AMB Cinemas', 'SPI Cinemas', 'Aries Group', 'Regal Cinema', 'IMAX Cineplex'
  city: string;
  state?: string;
  address: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  contactNumber?: string;
  imageUrl?: string;
  amenities: string[];
  screens: TheatreScreen[];
}

export type SeatTier = 'standard' | 'premium' | 'vip';
export type SeatStatus = 'available' | 'locked' | 'booked';

export interface Seat {
  id: string; // e.g. 'A-1', 'G-12'
  row: string;
  number: number;
  tier: SeatTier;
  price: number;
  status: SeatStatus;
  lockedBy?: string; // userId
  lockedExpiresAt?: number; // timestamp
}

export interface ShowPricing {
  standard: number;
  premium: number;
  vip: number;
}

export interface Show {
  id: string;
  movieId: string;
  theatreId: string;
  screenId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // '10:30 AM'
  endTime: string; // '01:15 PM'
  format: string;
  language: string;
  pricing: ShowPricing;
  seats: Record<string, Seat>; // seatId -> Seat
  totalSeats: number;
  bookedSeatsCount: number;
}

export type BookingStatus = 'confirmed' | 'cancelled';
export type PaymentStatus = 'completed' | 'refunded' | 'failed';

export interface BookingSeat {
  seatId: string;
  row: string;
  number: number;
  tier: SeatTier;
  price: number;
}

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  type: 'earned' | 'redeemed' | 'reversed' | 'bonus';
  points: number; // positive or negative
  description: string;
  bookingId?: string;
  timestamp: string;
}

export interface LoyaltySummary {
  userId: string;
  totalPoints: number;
  lifetimeEarned: number;
  tier: LoyaltyTier;
  tierName: string;
  tierMultiplier: number;
  nextTier?: LoyaltyTier;
  nextTierName?: string;
  nextTierThreshold?: number;
  pointsToNextTier: number;
  progressPercent: number;
  cashValue: number; // e.g. 1450 pts = $14.50
}

export interface Booking {
  id: string;
  bookingCode: string; // 'IMV-7492-X'
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  theatreId: string;
  theatreName: string;
  theatreAddress: string;
  screenName: string;
  format: string;
  showId: string;
  showDate: string;
  showTime: string;
  seats: BookingSeat[];
  subtotal: number;
  convenienceFee: number;
  tax: number;
  totalAmount: number;
  loyaltyPointsEarned?: number;
  loyaltyPointsRedeemed?: number;
  loyaltyDiscount?: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  qrCodeToken: string;
  bookedAt: string;
  cancelledAt?: string;
  refundAmount?: number;
}

export interface PaymentTransaction {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  method: 'card' | 'upi' | 'apple_pay' | 'net_banking';
  status: PaymentStatus;
  transactionRef: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'reminder' | 'cancellation' | 'system';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalBookings: number;
  totalTicketsSold: number;
  occupancyRate: number;
  activeMoviesCount: number;
  activeTheatresCount: number;
  recentBookings: Booking[];
  revenueByMovie: { movieId: string; title: string; revenue: number; tickets: number }[];
  dailySales: { date: string; amount: number; tickets: number }[];
}
