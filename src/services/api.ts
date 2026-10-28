import { Movie, Theatre, Show, Booking, NotificationItem, AnalyticsSummary, User, LoyaltySummary, LoyaltyTransaction } from '../types/cinema';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('imovies_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errMessage = 'Request failed';
    try {
      const errData = await res.json();
      errMessage = errData.error || errMessage;
    } catch {
      // fallback
    }
    throw new Error(errMessage);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  loginWithGoogle: (data: { name: string; email: string; avatar?: string }) =>
    request<{ user: User; token: string }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request<{ user: User }>('/auth/me'),

  // Movies
  getMovies: (filters?: { search?: string; genre?: string; language?: string; format?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.genre) params.append('genre', filters.genre);
    if (filters?.language) params.append('language', filters.language);
    if (filters?.format) params.append('format', filters.format);
    if (filters?.status) params.append('status', filters.status);
    const qs = params.toString();
    return request<Movie[]>(`/movies${qs ? `?${qs}` : ''}`);
  },

  getMovie: (id: string) => request<Movie>(`/movies/${id}`),

  createMovie: (movieData: Partial<Movie>) =>
    request<Movie>('/movies', {
      method: 'POST',
      body: JSON.stringify(movieData),
    }),

  updateMovie: (id: string, updates: Partial<Movie>) =>
    request<Movie>(`/movies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  deleteMovie: (id: string) =>
    request<{ success: boolean }>(`/movies/${id}`, {
      method: 'DELETE',
    }),

  // Theatres
  getTheatres: () => request<Theatre[]>('/theatres'),
  getTheatre: (id: string) => request<Theatre>(`/theatres/${id}`),

  // Shows
  getShows: (filters?: { movieId?: string; theatreId?: string; date?: string }) => {
    const params = new URLSearchParams();
    if (filters?.movieId) params.append('movieId', filters.movieId);
    if (filters?.theatreId) params.append('theatreId', filters.theatreId);
    if (filters?.date) params.append('date', filters.date);
    const qs = params.toString();
    return request<Show[]>(`/shows${qs ? `?${qs}` : ''}`);
  },

  getShow: (id: string) => request<Show>(`/shows/${id}`),

  createShow: (showData: any) =>
    request<Show>('/shows', {
      method: 'POST',
      body: JSON.stringify(showData),
    }),

  deleteShow: (id: string) =>
    request<{ success: boolean }>(`/shows/${id}`, {
      method: 'DELETE',
    }),

  lockSeats: (showId: string, seatIds: string[], holdMinutes = 8) =>
    request<{ success: boolean; expiresAt: number; seats: any[] }>(`/shows/${showId}/lock`, {
      method: 'POST',
      body: JSON.stringify({ seatIds, holdMinutes }),
    }),

  releaseSeats: (showId: string, seatIds: string[]) =>
    request<{ success: boolean }>(`/shows/${showId}/release`, {
      method: 'POST',
      body: JSON.stringify({ seatIds }),
    }),

  // Bookings
  getBookings: (all = false) => request<Booking[]>(`/bookings${all ? '?all=true' : ''}`),

  getBooking: (id: string) => request<Booking>(`/bookings/${id}`),

  createBooking: (bookingData: any) =>
    request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    }),

  cancelBooking: (bookingId: string) =>
    request<Booking>(`/bookings/${bookingId}/cancel`, {
      method: 'POST',
    }),

  // Payments
  processPayment: (paymentData: any) =>
    request<{ success: boolean; transactionRef: string; status: string; amount: number; method: string }>(
      '/payments/process',
      {
        method: 'POST',
        body: JSON.stringify(paymentData),
      }
    ),

  // Notifications
  getNotifications: () => request<NotificationItem[]>('/notifications'),
  markNotificationRead: (id: string) =>
    request<NotificationItem>(`/notifications/${id}/read`, {
      method: 'POST',
    }),
  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/notifications/read-all', {
      method: 'POST',
    }),

  // Admin
  getAnalytics: () => request<AnalyticsSummary>('/admin/analytics'),
  resetDemoData: () =>
    request<{ success: boolean; message: string }>('/admin/reset-demo', {
      method: 'POST',
    }),

  // Loyalty Program
  getLoyaltySummary: () => request<LoyaltySummary>('/loyalty/summary'),
  getLoyaltyHistory: () => request<LoyaltyTransaction[]>('/loyalty/history'),

  // Movie Poster API Integration
  getPosterStatus: () =>
    request<{
      totalMovies: number;
      realPostersActive: number;
      apiKeyConfigured: boolean;
      provider: string;
      keyPreview?: string;
    }>('/posters/status'),
  syncPosters: (apiKey?: string) =>
    request<{
      success: boolean;
      totalMovies: number;
      realPostersActive: number;
      apiKeyConfigured: boolean;
      message: string;
    }>('/posters/sync', {
      method: 'POST',
      body: JSON.stringify({ apiKey }),
    }),
};
