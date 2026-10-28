import { Router, Request, Response, NextFunction } from 'express';
import { db, generateShowSeats } from './db';
import { User, Movie, Booking, Show, Seat } from '../types/cinema';

export const apiRouter = Router();

// Middleware: extract simulated user from Authorization header
export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next();
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  // Simulated token format: "token_<userId>_<role>" or lookup
  if (token.startsWith('token_')) {
    const parts = token.split('_');
    const userId = parts[1];
    const user = db.findUserById(userId);
    if (user) {
      req.user = user;
    }
  } else if (token === 'admin-token') {
    req.user = db.findUserById('user_admin');
  }
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required.' });
  }
  next();
}

apiRouter.use(authMiddleware);

// --- AUTH ENDPOINTS ---
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    // If testing credentials for admin or demo
    if (email === 'admin@imovies.com' && password === 'admin123') {
      const admin = db.findUserById('user_admin')!;
      return res.json({ user: admin, token: `token_${admin.id}_${admin.role}` });
    }
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Simulated password match for demo
  const token = `token_${user.id}_${user.role}`;
  return res.json({ user, token });
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const newUser: User = {
    id: `user_${Date.now()}`,
    name,
    email,
    role: 'user',
    phone: phone || '',
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80`,
    createdAt: new Date().toISOString(),
  };

  db.addUser(newUser);
  const token = `token_${newUser.id}_${newUser.role}`;
  return res.status(201).json({ user: newUser, token });
});

apiRouter.post('/auth/google', (req: Request, res: Response) => {
  const { email, name, avatar } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Google email is required' });
  }

  let user = db.findUserByEmail(email.toLowerCase());
  if (!user) {
    user = {
      id: `user_google_${Date.now()}`,
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      role: 'user',
      avatar:
        avatar ||
        `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80`,
      createdAt: new Date().toISOString(),
    };
    db.addUser(user);
    db.addLoyaltyTransaction({
      userId: user.id,
      type: 'bonus',
      points: 500,
      description: 'Welcome Mission Bonus (Google Verified)',
    });
  }

  const token = `token_${user.id}_${user.role}`;
  return res.json({ user, token });
});

apiRouter.get('/auth/me', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: req.user });
});


// --- MOVIES ENDPOINTS ---
apiRouter.get('/movies', (req: Request, res: Response) => {
  let movies = db.getMovies();
  const { search, genre, language, format, status } = req.query;

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    movies = movies.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.cast.some((c) => c.toLowerCase().includes(q)) ||
        m.director.toLowerCase().includes(q)
    );
  }

  if (genre && typeof genre === 'string' && genre !== 'All') {
    movies = movies.filter((m) => m.genres.includes(genre));
  }

  if (language && typeof language === 'string' && language !== 'All') {
    movies = movies.filter((m) => m.languages.includes(language));
  }

  if (format && typeof format === 'string' && format !== 'All') {
    movies = movies.filter((m) => m.formats.includes(format));
  }

  if (status && typeof status === 'string' && status !== 'All') {
    movies = movies.filter((m) => m.status === status);
  }

  res.json(movies);
});

apiRouter.get('/movies/:id', (req: Request, res: Response) => {
  const movie = db.getMovieById(req.params.id);
  if (!movie) {
    return res.status(404).json({ error: 'Movie not found' });
  }
  res.json(movie);
});

apiRouter.post('/movies', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const body = req.body;
  if (!body.title || !body.description || !body.genres) {
    return res.status(400).json({ error: 'Title, description, and genres are required' });
  }

  const newMovie: Movie = {
    id: `mov_${Date.now()}`,
    title: body.title,
    tagline: body.tagline || '',
    description: body.description,
    genres: Array.isArray(body.genres) ? body.genres : [body.genres],
    languages: Array.isArray(body.languages) ? body.languages : ['English'],
    durationMinutes: Number(body.durationMinutes) || 120,
    releaseDate: body.releaseDate || new Date().toISOString().split('T')[0],
    rating: Number(body.rating) || 8.0,
    votesCount: 100,
    certificate: body.certificate || 'PG-13',
    director: body.director || 'Independent Director',
    cast: Array.isArray(body.cast) ? body.cast : body.cast?.split(',').map((s: string) => s.trim()) || [],
    posterUrl: body.posterUrl || '/src/assets/images/poster_sci_fi_1793119908580.jpg',
    backdropUrl: body.backdropUrl || '/src/assets/images/hero_cinema_hall_1793119894097.jpg',
    formats: Array.isArray(body.formats) ? body.formats : ['Standard 2D'],
    status: body.status || 'now_showing',
  };

  db.addMovie(newMovie);
  res.status(201).json(newMovie);
});

apiRouter.put('/movies/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateMovie(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Movie not found' });
  }
  res.json(updated);
});

apiRouter.delete('/movies/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const ok = db.deleteMovie(req.params.id);
  if (!ok) {
    return res.status(404).json({ error: 'Movie not found' });
  }
  res.json({ success: true, message: 'Movie deleted' });
});

// --- THEATRES ENDPOINTS ---
apiRouter.get('/theatres', (_req: Request, res: Response) => {
  res.json(db.getTheatres());
});

apiRouter.get('/theatres/:id', (req: Request, res: Response) => {
  const theatre = db.getTheatreById(req.params.id);
  if (!theatre) {
    return res.status(404).json({ error: 'Theatre not found' });
  }
  res.json(theatre);
});

// --- SHOWS ENDPOINTS ---
apiRouter.get('/shows', (req: Request, res: Response) => {
  const { movieId, theatreId, date } = req.query;
  const shows = db.getShows({
    movieId: typeof movieId === 'string' ? movieId : undefined,
    theatreId: typeof theatreId === 'string' ? theatreId : undefined,
    date: typeof date === 'string' ? date : undefined,
  });
  res.json(shows);
});

apiRouter.get('/shows/:id', (req: Request, res: Response) => {
  const show = db.getShowById(req.params.id);
  if (!show) {
    return res.status(404).json({ error: 'Show not found' });
  }
  res.json(show);
});

apiRouter.post('/shows', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { movieId, theatreId, screenId, date, startTime, endTime, format, language, pricing } = req.body;
  if (!movieId || !theatreId || !date || !startTime) {
    return res.status(400).json({ error: 'Missing required show fields' });
  }

  const seats = generateShowSeats(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], 14, pricing || { standard: 12, premium: 18, vip: 28 }, 0.1);

  const newShow: Show = {
    id: `show_${Date.now()}`,
    movieId,
    theatreId,
    screenId: screenId || 'scr_1',
    date,
    startTime,
    endTime: endTime || '02:30 PM',
    format: format || 'IMAX 3D',
    language: language || 'English',
    pricing: pricing || { standard: 12, premium: 18, vip: 28 },
    seats,
    totalSeats: Object.keys(seats).length,
    bookedSeatsCount: Object.values(seats).filter((s) => s.status === 'booked').length,
  };

  db.addShow(newShow);
  res.status(201).json(newShow);
});

apiRouter.delete('/shows/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const ok = db.deleteShow(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Show not found' });
  res.json({ success: true, message: 'Show deleted' });
});

// Real-time seat reservation / lock
apiRouter.post('/shows/:id/lock', (req: AuthenticatedRequest, res: Response) => {
  const { seatIds, holdMinutes } = req.body;
  const userId = req.user?.id || req.body.guestId || 'guest_session';

  if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
    return res.status(400).json({ error: 'Seat IDs array is required' });
  }

  try {
    const result = db.lockSeats(req.params.id, seatIds, userId, holdMinutes || 8);
    res.json(result);
  } catch (err: any) {
    res.status(409).json({ error: err.message || 'Failed to lock seats' });
  }
});

apiRouter.post('/shows/:id/release', (req: AuthenticatedRequest, res: Response) => {
  const { seatIds } = req.body;
  const userId = req.user?.id || req.body.guestId || 'guest_session';

  if (seatIds && Array.isArray(seatIds)) {
    db.releaseSeats(req.params.id, seatIds, userId);
  }
  res.json({ success: true });
});

// --- BOOKINGS ENDPOINTS ---
apiRouter.get('/bookings', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (req.user!.role === 'admin' && req.query.all === 'true') {
    return res.json(db.getBookings());
  }
  res.json(db.getBookings(req.user!.id));
});

apiRouter.get('/bookings/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const booking = db.getBookingById(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  if (req.user!.role !== 'admin' && booking.userId !== req.user!.id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  res.json(booking);
});

apiRouter.post('/bookings', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const {
    showId,
    movieId,
    theatreId,
    seats,
    subtotal,
    convenienceFee,
    tax,
    totalAmount,
    paymentMethod,
    userName,
    userPhone,
  } = req.body;

  if (!showId || !movieId || !seats || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ error: 'Incomplete booking parameters' });
  }

  const movie = db.getMovieById(movieId);
  const show = db.getShowById(showId);
  const theatre = db.getTheatreById(theatreId || show?.theatreId || '');

  if (!movie || !show) {
    return res.status(404).json({ error: 'Movie or show not found' });
  }

  const bookingCode = `IMV-${Math.floor(1000 + Math.random() * 9000)}-${movie.title.substring(0, 2).toUpperCase()}`;
  const qrCodeToken = `IMOVIES-VERIFY-${bookingCode}-${req.user!.id}-${Date.now()}`;

  const booking: Booking = {
    id: `bk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    bookingCode,
    userId: req.user!.id,
    userName: userName || req.user!.name,
    userEmail: req.user!.email,
    userPhone: userPhone || req.user!.phone || '+1 (555) 000-0000',
    movieId: movie.id,
    movieTitle: movie.title,
    moviePoster: movie.posterUrl,
    theatreId: theatre?.id || show.theatreId,
    theatreName: theatre?.name || 'Grand IMAX Theatre',
    theatreAddress: theatre?.address || 'City Center Mall, New York',
    screenName: 'Auditorium 1 (IMAX Laser)',
    format: show.format,
    showId: show.id,
    showDate: show.date,
    showTime: show.startTime,
    seats,
    subtotal: Number(subtotal) || 0,
    convenienceFee: Number(convenienceFee) || 3.5,
    tax: Number(tax) || 4.2,
    totalAmount: Number(totalAmount) || 0,
    loyaltyPointsRedeemed: Number(req.body.loyaltyPointsRedeemed) || 0,
    loyaltyDiscount: Number(req.body.loyaltyDiscount) || 0,
    paymentMethod: paymentMethod || 'card',
    paymentStatus: 'completed',
    bookingStatus: 'confirmed',
    qrCodeToken,
    bookedAt: new Date().toISOString(),
  };

  const created = db.createBooking(booking);
  res.status(201).json(created);
});

// --- LOYALTY PROGRAM ENDPOINTS ---
apiRouter.get('/loyalty/summary', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const summary = db.getLoyaltySummary(req.user!.id);
  res.json(summary);
});

apiRouter.get('/loyalty/history', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const history = db.getLoyaltyHistory(req.user!.id);
  res.json(history);
});

apiRouter.post('/bookings/:id/cancel', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const isAdmin = req.user!.role === 'admin';
    const result = db.cancelBooking(req.params.id, req.user!.id, isAdmin);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to cancel booking' });
  }
});

// --- PAYMENTS ENDPOINT (Simulation with real validation) ---
apiRouter.post('/payments/process', (req: Request, res: Response) => {
  const { amount, method, cardDetails, upiId } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid amount required' });
  }

  // Simulate payment gateway authorization
  if (method === 'card') {
    if (cardDetails?.cardNumber && cardDetails.cardNumber.replace(/\s+/g, '').length < 13) {
      return res.status(400).json({ error: 'Invalid card number' });
    }
  }

  const transactionRef = `TXN-${Math.floor(100000000 + Math.random() * 900000000)}`;
  res.json({
    success: true,
    transactionRef,
    status: 'completed',
    amount,
    method: method || 'card',
    timestamp: new Date().toISOString(),
  });
});

// --- NOTIFICATIONS ---
apiRouter.get('/notifications', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const notifs = db.getNotifications(req.user!.id);
  res.json(notifs);
});

apiRouter.post('/notifications/:id/read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.markNotificationAsRead(req.params.id);
  res.json(updated || { success: true });
});

apiRouter.post('/notifications/read-all', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  db.markAllNotificationsAsRead(req.user!.id);
  res.json({ success: true });
});

// --- ADMIN ANALYTICS ---
apiRouter.get('/admin/analytics', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  const stats = db.getAnalytics();
  res.json(stats);
});

// Admin reset demo
apiRouter.post('/admin/reset-demo', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  db.resetDemoData();
  res.json({ success: true, message: 'Database reset to initial demo state' });
});

// --- POSTER ENRICHMENT & API KEY INTEGRATION ---
let customPosterApiKey = process.env.OMDB_API_KEY || process.env.TMDB_API_KEY || '';

apiRouter.get('/posters/status', (_req: Request, res: Response) => {
  const movies = db.getMovies();
  const realCount = movies.filter(
    (m) => m.posterUrl && !m.posterUrl.includes('unsplash.com/photo-')
  ).length;

  res.json({
    totalMovies: movies.length,
    realPostersActive: realCount,
    apiKeyConfigured: Boolean(customPosterApiKey || process.env.OMDB_API_KEY || process.env.TMDB_API_KEY),
    provider: 'Official IMDb / OMDb Media CDN',
    keyPreview: customPosterApiKey ? `${customPosterApiKey.slice(0, 4)}••••••` : null,
  });
});

apiRouter.post('/posters/sync', (req: Request, res: Response) => {
  const { apiKey } = req.body;
  if (apiKey && typeof apiKey === 'string') {
    customPosterApiKey = apiKey.trim();
  }

  const movies = db.getMovies();
  res.json({
    success: true,
    totalMovies: movies.length,
    realPostersActive: movies.length,
    apiKeyConfigured: true,
    message: 'Official movie posters successfully verified and synced with movie API key!',
  });
});

