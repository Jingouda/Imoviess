import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ALL_100_MOVIES } from './movieData';
import {
  User,
  Movie,
  Theatre,
  Show,
  Seat,
  SeatTier,
  Booking,
  PaymentTransaction,
  NotificationItem,
  LoyaltyTransaction,
  LoyaltySummary,
  LoyaltyTier,
} from '../types/cinema';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.resolve(DATA_DIR, 'imovies_store.json');

interface DatabaseSchema {
  users: User[];
  movies: Movie[];
  theatres: Theatre[];
  shows: Show[];
  bookings: Booking[];
  payments: PaymentTransaction[];
  notifications: NotificationItem[];
  loyaltyLedger: LoyaltyTransaction[];
}

// Seat map helper
export function generateShowSeats(
  rows: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  colsPerRow = 14,
  basePrices = { standard: 12, premium: 18, vip: 28 },
  randomBookedRatio = 0.25
): Record<string, Seat> {
  const seats: Record<string, Seat> = {};

  rows.forEach((row, rowIndex) => {
    let tier: SeatTier = 'standard';
    let price = basePrices.standard;

    if (rowIndex >= rows.length - 2) {
      tier = 'vip';
      price = basePrices.vip;
    } else if (rowIndex >= 3) {
      tier = 'premium';
      price = basePrices.premium;
    }

    for (let c = 1; c <= colsPerRow; c++) {
      const seatId = `${row}-${c}`;
      // Randomly pre-book a few seats for realistic cinema state
      const isBooked = Math.random() < randomBookedRatio;
      seats[seatId] = {
        id: seatId,
        row,
        number: c,
        tier,
        price,
        status: isBooked ? 'booked' : 'available',
      };
    }
  });

  return seats;
}

// Initial Seed Data
const initialUsers: User[] = [
  {
    id: 'user_admin',
    name: 'Cinema Director (Admin)',
    email: 'admin@imovies.com',
    role: 'admin',
    phone: '+1 (555) 019-2834',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-01-10T12:00:00Z',
  },
];

const initialTheatres: Theatre[] = [
  // --- MADHYA PRADESH (INDORE, BHOPAL, GWALIOR, JABALPUR, UJJAIN) ---
  {
    id: 'th_pvr_ti_indore',
    name: 'PVR INOX Treasure Island Mall',
    chain: 'PVR INOX',
    city: 'Indore',
    state: 'Madhya Pradesh',
    address: 'Treasure Island Mall, 11 Tukoganj, Main MG Road, South Tukoganj, Indore 452001',
    landmark: 'MG Road & Palasia Square, Central Indore',
    latitude: 22.7244,
    longitude: 75.8839,
    rating: 4.8,
    contactNumber: '+91 731 422 6600',
    amenities: ['PVR Premiere 4K', 'Dolby Atmos 7.1', 'Plush Leather Recliners', 'Gourmet Food Court', 'Indore Landmark Multiplex'],
    screens: [
      { id: 'scr_ind_1', name: 'Audi 1 (Dolby Atmos)', format: 'Dolby Atmos', rows: 8, cols: 14, totalSeats: 112 },
      { id: 'scr_ind_2', name: 'Audi 2 (PVR Premiere)', format: 'Dolby Cinema', rows: 8, cols: 14, totalSeats: 112 },
      { id: 'scr_ind_3', name: 'Audi 3 (Classic 2D)', format: 'Standard 2D', rows: 7, cols: 12, totalSeats: 84 },
    ],
  },
  {
    id: 'th_inox_phoenix_citadel_indore',
    name: 'PVR INOX Megaplex & IMAX Phoenix Citadel',
    chain: 'PVR INOX',
    city: 'Indore',
    state: 'Madhya Pradesh',
    address: 'Phoenix Citadel Mall, MR 10 Road, Near Bypass Junction, Indore 452016',
    landmark: 'MR 10 Junction & Phoenix Citadel Mega Mall',
    latitude: 22.7533,
    longitude: 75.8937,
    rating: 4.9,
    contactNumber: '+91 731 691 4000',
    amenities: ["Central India's Largest IMAX Laser 4K", 'Insignia Ultra Luxe Recliners', 'MX4D Motion Seats', 'Dolby Atmos 128-ch', 'Live Chef Kitchen'],
    screens: [
      { id: 'scr_ind_4', name: 'Screen 1 (IMAX Laser 4K)', format: 'IMAX 3D', rows: 9, cols: 16, totalSeats: 144 },
      { id: 'scr_ind_5', name: 'Screen 2 (MX4D Dynamic)', format: '4DX', rows: 8, cols: 14, totalSeats: 112 },
      { id: 'scr_ind_6', name: 'Screen 3 (Insignia Gold)', format: 'Dolby Cinema', rows: 7, cols: 12, totalSeats: 84 },
    ],
  },
  {
    id: 'th_cinepolis_nexus_indore',
    name: 'Cinepolis Nexus Indore Central',
    chain: 'Cinepolis',
    city: 'Indore',
    state: 'Madhya Pradesh',
    address: 'Nexus Indore Central Mall, RNT Marg, Chhoti Gwaltoli, Indore 452001',
    landmark: 'Near Indore Railway Station & Regal Square',
    latitude: 22.7165,
    longitude: 75.8754,
    rating: 4.7,
    contactNumber: '+91 731 400 8900',
    amenities: ['RealD 3D Projection', 'Dolby Digital Surround', 'Coffee Lounge & Nachos Bar', 'Prime Central Connectivity'],
    screens: [
      { id: 'scr_ind_7', name: 'Screen 1 (RealD 3D)', format: 'Standard 2D', rows: 8, cols: 14, totalSeats: 112 },
      { id: 'scr_ind_8', name: 'Screen 2 (Dolby Sound)', format: 'Dolby Atmos', rows: 7, cols: 12, totalSeats: 84 },
    ],
  },
  {
    id: 'th_pvr_c21_indore',
    name: 'PVR C21 Mall Vijay Nagar',
    chain: 'PVR INOX',
    city: 'Indore',
    state: 'Madhya Pradesh',
    address: 'C21 Mall, Plot 262, AB Road, Scheme 54 PU4, Vijay Nagar, Indore 452010',
    landmark: 'Vijay Nagar Square & Malhar Mega Mall',
    latitude: 22.7512,
    longitude: 75.8924,
    rating: 4.7,
    contactNumber: '+91 731 404 1200',
    amenities: ['Dolby Atmos', 'Gold Class Recliners', 'Multi-Cuisine Concessions', 'Vijay Nagar Shopping Hub'],
    screens: [
      { id: 'scr_ind_9', name: 'Audi 1 (Dolby Atmos)', format: 'Dolby Atmos', rows: 8, cols: 14, totalSeats: 112 },
      { id: 'scr_ind_10', name: 'Audi 2 (Classic)', format: 'Standard 2D', rows: 7, cols: 12, totalSeats: 84 },
    ],
  },
  {
    id: 'th_cinepolis_db_mall_bhopal',
    name: 'Cinepolis DB City Mall MP Nagar',
    chain: 'Cinepolis',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    address: 'DB City Mall, Hoshangabad Road, Arera Hills, MP Nagar Zone 1, Bhopal 462011',
    landmark: 'Opposite Railway Crossing & MP Nagar Zone 1, Bhopal',
    latitude: 23.2332,
    longitude: 77.4326,
    rating: 4.9,
    contactNumber: '+91 755 664 4000',
    amenities: ['6-Screen VIP Multiplex', 'VIP Motorized Recliners', 'Dolby Atmos 64-Channel', 'Live Coffee & Panini Bar', 'Bhopal Premier Landmark Mall'],
    screens: [
      { id: 'scr_bhp_1', name: 'Screen 1 VIP (Dolby Atmos)', format: 'Dolby Cinema', rows: 8, cols: 14, totalSeats: 112 },
      { id: 'scr_bhp_2', name: 'Screen 2 (Macro 4K)', format: 'Dolby Atmos', rows: 8, cols: 14, totalSeats: 112 },
      { id: 'scr_bhp_3', name: 'Screen 3 (RealD 3D)', format: 'Standard 2D', rows: 7, cols: 12, totalSeats: 84 },
    ],
  },
  {
    id: 'th_pvr_aura_mall_bhopal',
    name: 'PVR Aura Mall Trilanga',
    chain: 'PVR INOX',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    address: 'Aura Mall, Gulmohar Colony, E-8 Trilanga, Shahpura, Bhopal 462039',
    landmark: 'Shahpura Lake & Gulmohar Colony',
    latitude: 23.1895,
    longitude: 77.4322,
    rating: 4.8,
    contactNumber: '+91 755 492 5500',
    amenities: ['PVR Cinema Experience', 'Dolby 7.1 Surround', 'Plush Rocker Seats', 'Artisan Caramel Popcorn'],
    screens: [
      { id: 'scr_bhp_4', name: 'Audi 1 (Dolby Surround)', format: 'Dolby Atmos', rows: 8, cols: 14, totalSeats: 112 },
      { id: 'scr_bhp_5', name: 'Audi 2 (Classic)', format: 'Standard 2D', rows: 7, cols: 12, totalSeats: 84 },
    ],
  },
  {
    id: 'th_inox_century_21_bhopal',
    name: 'INOX Century 21 Mall',
    chain: 'PVR INOX',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    address: 'Century 21 Mall, Hoshangabad Main Road, Near Habibganj (Rani Kamlapati), Bhopal 462026',
    landmark: 'Rani Kamlapati World-Class Railway Station',
    latitude: 23.2081,
    longitude: 77.4412,
    rating: 4.7,
    contactNumber: '+91 755 401 2200',
    amenities: ['Laser 4K Projection', 'Dolby Atmos', 'Insignia Luxury Seats', 'Rapid Metro & Station Access'],
    screens: [
      { id: 'scr_bhp_6', name: 'Audi 1 Laser', format: 'Dolby Cinema', rows: 8, cols: 14, totalSeats: 112 },
      { id: 'scr_bhp_7', name: 'Audi 2 Prime', format: 'Standard 2D', rows: 7, cols: 12, totalSeats: 84 },
    ],
  },
  {
    id: 'th_inox_db_city_gwalior',
    name: 'INOX DB City Mall Gwalior',
    chain: 'PVR INOX',
    city: 'Gwalior',
    state: 'Madhya Pradesh',
    address: 'DB City Mall, Race Course Road, Near Railway Station, Gwalior 474002',
    landmark: 'Gwalior Junction & Race Course Road',
    latitude: 26.2089,
    longitude: 78.1887,
    rating: 4.8,
    contactNumber: '+91 751 408 8100',
    amenities: ['4-Screen Multiplex', 'Dolby Atmos Digital', 'Plush Recliners', 'Café Unwind Gourmet Snacks'],
    screens: [
      { id: 'scr_gwl_1', name: 'Audi 1 (Dolby Atmos)', format: 'Dolby Atmos', rows: 8, cols: 14, totalSeats: 112 },
      { id: 'scr_gwl_2', name: 'Audi 2 (Standard 2D)', format: 'Standard 2D', rows: 7, cols: 12, totalSeats: 84 },
    ],
  },
  {
    id: 'th_samdariya_jabalpur',
    name: 'Samdariya Mall & Multiplex',
    chain: 'Samdariya Cinemas',
    city: 'Jabalpur',
    state: 'Madhya Pradesh',
    address: 'Samdariya Mall, Civic Centre, Marhatal, Jabalpur 482002',
    landmark: 'Civic Centre Commercial Hub',
    latitude: 23.1678,
    longitude: 79.9339,
    rating: 4.7,
    contactNumber: '+91 761 405 5200',
    amenities: ['High-Definition 3D Projection', 'Dolby Surround 7.1', 'Rocking Seats', 'Jabalpur Landmark Concessions'],
    screens: [
      { id: 'scr_jbp_1', name: 'Audi 1 (Dolby 7.1)', format: 'Dolby Atmos', rows: 8, cols: 14, totalSeats: 112 },
      { id: 'scr_jbp_2', name: 'Audi 2 (Classic)', format: 'Standard 2D', rows: 7, cols: 12, totalSeats: 84 },
    ],
  },
  {
    id: 'th_pvr_cosmos_ujjain',
    name: 'PVR Cosmos Mall Ujjain',
    chain: 'PVR INOX',
    city: 'Ujjain',
    state: 'Madhya Pradesh',
    address: 'Cosmos Mall, Nanakheda, Indore Road, Ujjain 456010',
    landmark: 'Near Nanakheda Bus Stand & Mahakal Corridor Link',
    latitude: 23.1558,
    longitude: 75.7924,
    rating: 4.7,
    contactNumber: '+91 734 402 1100',
    amenities: ['PVR 3-Screen Multiplex', 'Dolby Digital', 'Comfort Seating', 'Quick Bites Concession Bar'],
    screens: [
      { id: 'scr_ujn_1', name: 'Audi 1 (Dolby Surround)', format: 'Dolby Atmos', rows: 8, cols: 14, totalSeats: 112 },
      { id: 'scr_ujn_2', name: 'Audi 2 (Standard)', format: 'Standard 2D', rows: 7, cols: 12, totalSeats: 84 },
    ],
  },

  // --- MUMBAI & MMR, MAHARASHTRA ---
  {
    id: 'th_pvr_inox_maison_bkc',
    name: 'PVR INOX Maison IMAX & Luxe',
    chain: 'PVR INOX',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'Jio World Drive, Maker Maxity, Bandra Kurla Complex (BKC), Bandra East, Mumbai 400051',
    landmark: 'Opposite Asian Heart Institute, BKC',
    latitude: 19.0657,
    longitude: 72.8682,
    rating: 4.9,
    contactNumber: '+91 22 6842 1200',
    amenities: ['IMAX Laser 4K', 'Dolby Atmos 128-ch', 'Insignia Butler Service', 'Gourmet Dine-In Bar', 'Valet Parking'],
    screens: [
      { id: 'scr_mum_1', name: 'Audi 1 (IMAX Laser)', format: 'IMAX 3D', rows: 8, cols: 14, totalSeats: 112 },
      { id: 'scr_mum_2', name: 'Audi 2 (Maison Luxe)', format: 'Dolby Cinema', rows: 7, cols: 12, totalSeats: 84 },
      { id: 'scr_mum_3', name: 'Audi 3 (Dolby Atmos)', format: 'Dolby Atmos', rows: 8, cols: 14, totalSeats: 112 },
    ],
  },
  {
    id: 'th_pvr_icon_phoenix_mumbai',
    name: 'PVR ICON Phoenix Palladium',
    chain: 'PVR INOX',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'High Street Phoenix, 462 Senapati Bapat Marg, Lower Parel, Mumbai 400013',
    landmark: 'Lower Parel Station & Palladium Mall',
    latitude: 18.9953,
    longitude: 72.8242,
    rating: 4.8,
    contactNumber: '+91 22 4347 1800',
    amenities: ['4DX Sensory Motion', 'Dolby Atmos', 'Gold Class Recliners', 'Café & Gelato Bar'],
    screens: [
      { id: 'scr_mum_4', name: 'Screen 1 (4DX Dynamic)', format: '4DX', rows: 8, cols: 14, totalSeats: 112 },
      { id: 'scr_mum_5', name: 'Screen 2 (Gold Class)', format: 'Dolby Atmos', rows: 7, cols: 12, totalSeats: 84 },
    ],
  },
  {
    id: 'th_cinepolis_viviana_thane',
    name: 'Cinepolis VIP Viviana Mall',
    chain: 'Cinepolis',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'Viviana Mall, Eastern Express Highway, Near Jupiter Hospital, Thane West, Mumbai MMR 400606',
    landmark: 'Majiwada Junction, Thane',
    latitude: 19.2089,
    longitude: 72.9712,
    rating: 4.7,
    contactNumber: '+91 22 6170 1400',
    amenities: ['VIP Motorized Recliners', 'RealD 3D Macro XE', 'Dolby Atmos', 'In-Seat Waiter Service'],
    screens: [
      { id: 'scr_mum_6', name: 'VIP Screen 1 (Macro XE)', format: 'Dolby Cinema', rows: 8, cols: 14, totalSeats: 112 },
      { id: 'scr_mum_7', name: 'Screen 2 (RealD 3D)', format: 'Standard 2D', rows: 7, cols: 12, totalSeats: 84 },
    ],
  },
  {
    id: 'th_regal_cinema_colaba',
    name: 'Regal Cinema Heritage Hall',
    chain: 'Heritage Cinemas',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'Colaba Causeway, Apollo Bandar, Colaba, South Mumbai 400001',
    landmark: 'Gateway of India & Taj Mahal Palace',
    latitude: 18.9248,
    longitude: 72.8315,
    rating: 4.6,
    contactNumber: '+91 22 2202 1017',
    amenities: ['Historic 1933 Art Deco Hall', '70mm Large Canvas', 'Dolby Surround 7.1', 'Royal Balcony Tier'],
    screens: [
      { id: 'scr_mum_8', name: 'Grand Heritage Auditorium', format: 'Standard 2D', rows: 8, cols: 14, totalSeats: 112 },
    ],
  },

  // --- BENGALURU, KARNATAKA ---
  {
    id: 'th_pvr_forum_south_bengaluru',
    name: 'PVR Superplex Forum South Bengaluru',
    chain: 'PVR INOX',
    city: 'Bengaluru',
    state: 'Karnataka',
    address: 'Forum South Bengaluru Mall, Konanakunte Cross, Kanakapura Road, Bengaluru 560062',
    landmark: 'Konanakunte Cross Metro Station',
    latitude: 12.8872,
    longitude: 77.5562,
    rating: 4.9,
    contactNumber: '+91 80 6912 3400',
    amenities: ['IMAX Laser 4K', '4DX Motion Seats', 'Dolby Atmos 128-ch', 'PlayHouse Kids Screen', 'Luxe Lounge'],
    screens: [
      { id: 'scr_blr_1', name: 'Screen 1 (IMAX Laser)', format: 'IMAX 3D', rows: 8, cols: 14, totalSeats: 112 },
      { id: 'scr_blr_2', name: 'Screen 2 (4DX Motion)', format: '4DX', rows: 8, cols: 14, totalSeats: 112 },
      { id: 'scr_blr_3', name: 'Screen 3 (Dolby Luxe)', format: 'Dolby Cinema', rows: 7, cols: 12, totalSeats: 84 },
    ],
  },
  {
    id: 'th_cinepolis_shantiniketan_blr',
    name: 'Cinepolis Forum Shantiniketan Whitefield',
    chain: 'Cinepolis',
    city: 'Bengaluru',
    state: 'Karnataka',
    address: 'Forum Shantiniketan, ITPL Main Road, Thigalarapalya, Whitefield, Bengaluru 560067',
    landmark: 'Next to ITPL & Pattandur Agrahara Metro',
    latitude: 12.9897,
    longitude: 77.7285,
    rating: 4.8,
    contactNumber: '+91 80 6814 2000',
    amenities: ['Macro XE Giant Canvas', 'Dolby Atmos', 'Plush Ergonomic Rockers', 'Gourmet Kitchen'],
    screens: [
      { id: 'scr_blr_4', name: 'Macro XE Auditorium', format: 'Dolby Atmos', rows: 8, cols: 14, totalSeats: 112 },
      { id: 'scr_blr_5', name: 'Audi 2 (RealD 3D)', format: 'Standard 2D', rows: 7, cols: 12, totalSeats: 84 },
    ],
  },
  {
    id: 'th_inox_garuda_mall_blr',
    name: 'INOX Insignia Garuda Mall',
    chain: 'PVR INOX',
    city: 'Bengaluru',
    state: 'Karnataka',
    address: 'Garuda Mall, Magrath Road, Ashok Nagar, Near Brigade Road, Bengaluru 560025',
    landmark: 'Near MG Road & Brigade Road Junction',
    latitude: 12.9702,
    longitude: 77.6095,
    rating: 4.7,
    contactNumber: '+91 80 4112 5500',
    amenities: ['Insignia Luxury Recliners', 'Dolby Atmos', 'Live Gourmet Counter', 'Central CBD Location'],
    screens: [
      { id: 'scr_blr_6', name: 'Insignia Audi 1', format: 'Dolby Cinema', rows: 7, cols: 12, totalSeats: 84 },
      { id: 'scr_blr_7', name: 'Prime Audi 2', format: 'Dolby Atmos', rows: 8, cols: 14, totalSeats: 112 },
    ],
  },
  {
    id: 'th_urvashi_digital_blr',
    name: 'Urvashi Digital 4K Cinema',
    chain: 'Independent Iconic',
    city: 'Bengaluru',
    state: 'Karnataka',
    address: '55 Siddaiah Road, Sudhama Nagar, Near Lalbagh Botanical Garden, Bengaluru 560027',
    landmark: 'Near Lalbagh West Gate',
    latitude: 12.9568,
    longitude: 77.5886,
    rating: 4.8,
    contactNumber: '+91 80 2223 3034',
    amenities: ['Massive Curved 4K Screen', 'Dual Christie Laser 4K', 'Dolby Atmos 64-Channel', 'Legendary Fan Euphoria'],
    screens: [
      { id: 'scr_blr_8', name: 'Urvashi Curved 4K Mega Hall', format: 'Dolby Atmos', rows: 9, cols: 16, totalSeats: 144 },
    ],
  },

  // --- HYDERABAD, TELANGANA ---
  {
    id: 'th_prasads_multiplex_hyd',
    name: 'Prasads Multiplex & Large Screen IMAX',
    chain: 'Prasads Group',
    city: 'Hyderabad',
    state: 'Telangana',
    address: 'NTR Gardens, Necklace Road, Hussain Sagar, Khairatabad, Hyderabad 500063',
    landmark: 'Next to NTR Gardens & Hussain Sagar Lake',
    latitude: 17.4125,
    longitude: 78.4682,
    rating: 4.9,
    contactNumber: '+91 40 2344 8888',
    amenities: ["India's Legendary 72ft Screen", 'Dual 4K Laser Projection', 'Dolby Atmos 64-Ch', 'Lakeview Promenade & Gaming Arcade'],
    screens: [
      { id: 'scr_hyd_1', name: 'Legendary Screen 6 (72ft Large Screen)', format: 'IMAX 3D', rows: 10, cols: 18, totalSeats: 180 },
      { id: 'scr_hyd_2', name: 'Audi 3 (Dolby Atmos)', format: 'Dolby Atmos', rows: 8, cols: 14, totalSeats: 112 },
      { id: 'scr_hyd_3', name: 'Audi 4 (Prime 4K)', format: 'Standard 2D', rows: 7, cols: 12, totalSeats: 84 },
    ],
  },
  {
    id: 'th_amb_cinemas_hyd',
    name: 'AMB Cinemas (Asian Mahesh Babu)',
    chain: 'AMB Cinemas',
    city: 'Hyderabad',
    state: 'Telangana',
    address: 'Gachibowli - Miyapur Road, Whitefields, Kondapur, Hyderabad 500084',
    landmark: 'Near Botanical Garden & Hitec City Cyber Towers',
    latitude: 17.4604,
    longitude: 78.3654,
    rating: 4.9,
    contactNumber: '+91 40 6815 5555',
    amenities: ['Laser Dolby Atmos', 'VIP M-Lounge', 'Motorized Recliners', 'Artisan Popcorn & Pastries', 'Celebrity Red Carpet Vibe'],
    screens: [
      { id: 'scr_hyd_4', name: 'Screen 1 Laser (M-Lounge)', format: 'Dolby Cinema', rows: 8, cols: 14, totalSeats: 112 },
      { id: 'scr_hyd_5', name: 'Screen 2 (Dolby Atmos)', format: 'Dolby Atmos', rows: 8, cols: 14, totalSeats: 112 },
    ],
  },
  {
    id: 'th_pvr_forum_sujana_hyd',
    name: 'PVR Forum Sujana Mall KPHB',
    chain: 'PVR INOX',
    city: 'Hyderabad',
    state: 'Telangana',
    address: 'Forum Sujana Mall, KPHB Phase 9, Kukatpally, Hyderabad 500072',
    landmark: 'Near JNTU Metro & KPHB Colony',
    latitude: 17.4842,
    longitude: 78.3888,
    rating: 4.7,
    contactNumber: '+91 40 6704 2200',
    amenities: ['4DX Sensory Effects', 'Dolby Atmos', 'Gold Class Recliners', 'Food Lounge'],
    screens: [
      { id: 'scr_hyd_6', name: 'Screen 1 (4DX Dynamic)', format: '4DX', rows: 8, cols: 14, totalSeats: 112 },
      { id: 'scr_hyd_7', name: 'Screen 2 (Dolby Atmos)', format: 'Dolby Atmos', rows: 8, cols: 14, totalSeats: 112 },
    ],
  },

  // --- DELHI NCR (NEW DELHI, NOIDA, GURUGRAM) ---
  {
    id: 'th_pvr_directors_cut_delhi',
    name: "PVR Director's Cut Ambience Mall",
    chain: 'PVR INOX',
    city: 'Delhi NCR',
    state: 'Delhi',
    address: 'Ambience Mall, Nelson Mandela Marg, Vasant Kunj II, New Delhi 110070',
    landmark: 'Next to DLF Promenade & Vasant Kunj Hub',
    latitude: 28.5402,
    longitude: 77.1558,
    rating: 4.9,
    contactNumber: '+91 11 4087 0000',
    amenities: ['Ultra-Luxury Recliners', 'Curated Chef Menu & Sommelier', 'Dolby Atmos', 'Dedicated Personal Butler'],
    screens: [
      { id: 'scr_del_1', name: "Audi 1 Director's Suite", format: 'Dolby Cinema', rows: 6, cols: 10, totalSeats: 60 },
      { id: 'scr_del_2', name: 'Audi 2 Platinum Luxe', format: 'Dolby Atmos', rows: 7, cols: 12, totalSeats: 84 },
    ],
  },
  {
    id: 'th_pvr_logix_noida',
    name: 'PVR Logix City Centre IMAX',
    chain: 'PVR INOX',
    city: 'Delhi NCR',
    state: 'Uttar Pradesh',
    address: 'Logix City Centre Mall, Wave City Center Metro, Sector 32, Noida 201301',
    landmark: 'Noida City Centre Metro Station',
    latitude: 28.5744,
    longitude: 77.3533,
    rating: 4.8,
    contactNumber: '+91 120 610 2000',
    amenities: ['Massive IMAX Laser Screen', '4DX Motion Theatre', 'Dolby Atmos Superplex', 'Food Court & Bowling'],
    screens: [
      { id: 'scr_del_3', name: 'Screen 1 (IMAX Laser)', format: 'IMAX 3D', rows: 8, cols: 14, totalSeats: 112 },
      { id: 'scr_del_4', name: 'Screen 2 (4DX Motion)', format: '4DX', rows: 8, cols: 14, totalSeats: 112 },
    ],
  },
  {
    id: 'th_cinepolis_dlf_saket',
    name: 'Cinepolis DLF Avenue Saket',
    chain: 'Cinepolis',
    city: 'Delhi NCR',
    state: 'Delhi',
    address: 'DLF Avenue, A4 Press Enclave Road, Saket District Centre, New Delhi 110017',
    landmark: 'Near Select Citywalk Mall & Malviya Nagar Metro',
    latitude: 28.5283,
    longitude: 77.2185,
    rating: 4.7,
    contactNumber: '+91 11 4987 8800',
    amenities: ['VIP Plush Recliners', 'Macro XE Big Screen', 'Dolby Atmos', 'Valet Parking'],
    screens: [
      { id: 'scr_del_5', name: 'Audi 1 VIP (Macro XE)', format: 'Dolby Cinema', rows: 8, cols: 14, totalSeats: 112 },
      { id: 'scr_del_6', name: 'Audi 2 (RealD 3D)', format: 'Standard 2D', rows: 7, cols: 12, totalSeats: 84 },
    ],
  },

  // --- CHENNAI, TAMIL NADU ---
  {
    id: 'th_sathyam_cinemas_chennai',
    name: 'Sathyam Cinemas (SPI PVR)',
    chain: 'SPI Cinemas',
    city: 'Chennai',
    state: 'Tamil Nadu',
    address: '8 Thiru Vi Ka Road, Royapettah, Chennai 600014',
    landmark: 'Near Express Avenue Mall & Mount Road',
    latitude: 13.0569,
    longitude: 80.2604,
    rating: 4.9,
    contactNumber: '+91 44 4392 0300',
    amenities: ['World-Famous Sathyam Butter Popcorn', 'RDX 4K Projection', 'Dolby Atmos 128-ch', 'Artistic Lobby & Heritage Vibe'],
    screens: [
      { id: 'scr_chn_1', name: 'Sathyam Grand Hall (RDX 4K)', format: 'Dolby Atmos', rows: 9, cols: 16, totalSeats: 144 },
      { id: 'scr_chn_2', name: 'Santham Laser Hall', format: 'Dolby Cinema', rows: 8, cols: 14, totalSeats: 112 },
    ],
  },
  {
    id: 'th_palazzo_cinemas_chennai',
    name: 'Palazzo Cinemas Forum Mall',
    chain: 'SPI Cinemas',
    city: 'Chennai',
    state: 'Tamil Nadu',
    address: 'The Forum Vijaya Mall, 183 Arcot Road, NSK Salai, Vadapalani, Chennai 600026',
    landmark: 'Vadapalani Metro Station & Forum Mall',
    latitude: 13.0505,
    longitude: 80.2104,
    rating: 4.8,
    contactNumber: '+91 44 4022 4000',
    amenities: ['IMAX 3D Experience', 'Italian Renaissance Palace Theme', 'Dolby Atmos', 'Artisan Gelato & Pastry Bar'],
    screens: [
      { id: 'scr_chn_3', name: 'Screen 1 (IMAX)', format: 'IMAX 3D', rows: 8, cols: 14, totalSeats: 112 },
      { id: 'scr_chn_4', name: 'Screen 2 (Renaissance Luxe)', format: 'Dolby Cinema', rows: 7, cols: 12, totalSeats: 84 },
    ],
  },

  // --- PUNE, MAHARASHTRA ---
  {
    id: 'th_cinepolis_seasons_pune',
    name: 'Cinepolis Seasons Mall Magarpatta',
    chain: 'Cinepolis',
    city: 'Pune',
    state: 'Maharashtra',
    address: 'Seasons Mall, Magarpatta City, Hadapsar, Pune 411028',
    landmark: 'Magarpatta Cybercity & Cybercity Tower',
    latitude: 18.5195,
    longitude: 73.9312,
    rating: 4.8,
    contactNumber: '+91 20 6723 5000',
    amenities: ['15-Screen Mega Superplex', 'IMAX 3D', '4DX Motion', 'VIP Club Lounge with In-Seat Dining'],
    screens: [
      { id: 'scr_pune_1', name: 'Audi 1 (IMAX Laser)', format: 'IMAX 3D', rows: 8, cols: 14, totalSeats: 112 },
      { id: 'scr_pune_2', name: 'Audi 2 (4DX)', format: '4DX', rows: 8, cols: 14, totalSeats: 112 },
    ],
  },
  {
    id: 'th_pvr_phoenix_pune',
    name: 'PVR ICON Phoenix Marketcity',
    chain: 'PVR INOX',
    city: 'Pune',
    state: 'Maharashtra',
    address: 'Phoenix Marketcity, Viman Nagar, Nagar Road, Pune 411014',
    landmark: 'Opposite Inorbit Mall, Viman Nagar',
    latitude: 18.5621,
    longitude: 73.9168,
    rating: 4.7,
    contactNumber: '+91 20 6689 0000',
    amenities: ['Gold Class Recliners', '4DX Motion Seats', 'Dolby Atmos', 'Craft Beverages'],
    screens: [
      { id: 'scr_pune_3', name: 'Screen 1 (Gold Class)', format: 'Dolby Cinema', rows: 7, cols: 12, totalSeats: 84 },
      { id: 'scr_pune_4', name: 'Screen 2 (Dolby Atmos)', format: 'Dolby Atmos', rows: 8, cols: 14, totalSeats: 112 },
    ],
  },

  // --- KOLKATA, WEST BENGAL ---
  {
    id: 'th_inox_quest_kolkata',
    name: 'INOX Insignia Quest Mall',
    chain: 'PVR INOX',
    city: 'Kolkata',
    state: 'West Bengal',
    address: 'Quest Mall, 33 Syed Amir Ali Avenue, Park Circus, Beckbagan, Kolkata 700017',
    landmark: 'Near Park Circus 7-Point Crossing',
    latitude: 22.5392,
    longitude: 88.3653,
    rating: 4.8,
    contactNumber: '+91 33 4001 0200',
    amenities: ['Insignia 7-Star Ultra Luxury', 'Dolby Atmos', 'Celebrity Chef Gourmet Menu', 'Personal Butler Service'],
    screens: [
      { id: 'scr_kol_1', name: 'Insignia Audi 1', format: 'Dolby Cinema', rows: 7, cols: 12, totalSeats: 84 },
      { id: 'scr_kol_2', name: 'Premier Audi 2', format: 'Dolby Atmos', rows: 8, cols: 14, totalSeats: 112 },
    ],
  },

  // --- AHMEDABAD, GUJARAT ---
  {
    id: 'th_pvr_acropolis_ahmedabad',
    name: 'PVR Acropolis Mall SG Highway',
    chain: 'PVR INOX',
    city: 'Ahmedabad',
    state: 'Gujarat',
    address: 'Acropolis Mall, Thaltej Cross Roads, SG Highway, Ahmedabad 380054',
    landmark: 'Thaltej Cross Roads, SG Highway',
    latitude: 23.0526,
    longitude: 72.5085,
    rating: 4.7,
    contactNumber: '+91 79 4004 5500',
    amenities: ['4DX Sensory Effects', 'Dolby Atmos 4K', 'Gold Class Recliners', 'Pure Vegetarian Snacks Hub'],
    screens: [
      { id: 'scr_ahm_1', name: 'Screen 1 (4DX Dynamic)', format: '4DX', rows: 8, cols: 14, totalSeats: 112 },
      { id: 'scr_ahm_2', name: 'Screen 2 (Dolby Atmos)', format: 'Dolby Atmos', rows: 8, cols: 14, totalSeats: 112 },
    ],
  },

  // --- KOCHI & KERALA ---
  {
    id: 'th_pvr_lulu_kochi',
    name: 'PVR LuLu Mall Edappally',
    chain: 'PVR INOX',
    city: 'Kochi',
    state: 'Kerala',
    address: 'LuLu International Shopping Mall, 34/1000, NH 544, Edappally, Kochi 682024',
    landmark: 'Direct LuLu Edappally Metro Skywalk',
    latitude: 10.0284,
    longitude: 76.3082,
    rating: 4.8,
    contactNumber: '+91 484 272 7000',
    amenities: ['11-Screen Multiplex', '4K Christie Laser', 'Dolby Atmos', 'Gold Class Loungers', 'LuLu Mall Direct Access'],
    screens: [
      { id: 'scr_koc_1', name: 'Audi 1 (4K Laser)', format: 'IMAX 3D', rows: 8, cols: 14, totalSeats: 112 },
      { id: 'scr_koc_2', name: 'Audi 2 (Dolby Atmos)', format: 'Dolby Atmos', rows: 8, cols: 14, totalSeats: 112 },
    ],
  },
  {
    id: 'th_aries_plex_sl_trivandrum',
    name: 'Aries Plex SL Cinemas',
    chain: 'Aries Group',
    city: 'Thiruvananthapuram',
    state: 'Kerala',
    address: 'SL Complex, Overbridge, Near Central Railway Station, Thampanoor, Thiruvananthapuram 695001',
    landmark: 'Opposite Trivandrum Central Railway Station',
    latitude: 8.4875,
    longitude: 76.9525,
    rating: 4.9,
    contactNumber: '+91 471 246 8888',
    amenities: ['Dual Christie 4K Laser Projection', '64-Channel Meyer Sound Dolby Atmos', 'EPIQ Giant Canvas', 'Premium Recliners'],
    screens: [
      { id: 'scr_tvm_1', name: 'Audi 1 (EPIQ 4K Laser)', format: 'IMAX 3D', rows: 9, cols: 16, totalSeats: 144 },
      { id: 'scr_tvm_2', name: 'Audi 2 (Dolby Atmos)', format: 'Dolby Atmos', rows: 8, cols: 14, totalSeats: 112 },
    ],
  },

  // --- INTERNATIONAL THEATRES ---
  {
    id: 'th_imax_metropolis',
    name: 'IMAX Metropolis Grand',
    chain: 'IMAX Cineplex',
    city: 'New York',
    state: 'NY, USA',
    address: '450 Broadway & 42nd St, Times Square, New York, NY 10036',
    landmark: 'Times Square & 42nd St Subway',
    latitude: 40.758,
    longitude: -73.9855,
    rating: 4.9,
    contactNumber: '+1 (212) 555-0199',
    amenities: ['IMAX Laser 4K', 'Dolby Atmos 128-ch', 'Full Recliners', 'Gourmet Dine-In Bar'],
    screens: [
      { id: 'scr_1', name: 'Auditorium 1 (IMAX Laser)', format: 'IMAX 3D', rows: 8, cols: 14, totalSeats: 112 },
      { id: 'scr_2', name: 'Auditorium 2 (Dolby Cinema)', format: 'Dolby Cinema', rows: 7, cols: 12, totalSeats: 84 },
    ],
  },
  {
    id: 'th_regal_olympic',
    name: 'Regal Olympic Luxe',
    chain: 'Regal Cinema',
    city: 'Los Angeles',
    state: 'CA, USA',
    address: '1000 W Olympic Blvd, Downtown, Los Angeles, CA 90015',
    landmark: 'Crypto.com Arena / LA Live',
    latitude: 34.043,
    longitude: -118.2673,
    rating: 4.8,
    contactNumber: '+1 (213) 555-0144',
    amenities: ['4DX Motion Seats', 'Dolby Atmos', 'VIP Lounge', 'Mobile Order Delivery'],
    screens: [
      { id: 'scr_3', name: 'Grand Theatre A (4DX)', format: '4DX', rows: 8, cols: 14, totalSeats: 112 },
      { id: 'scr_4', name: 'Screen 2 Premium', format: 'Dolby Atmos', rows: 7, cols: 12, totalSeats: 84 },
    ],
  },
  {
    id: 'th_pvr_heritage',
    name: 'ArcLight Heritage Cinema',
    chain: 'ArcLight Cinemas',
    city: 'Chicago',
    state: 'IL, USA',
    address: '600 N Michigan Ave, Magnificent Mile, Chicago, IL 60611',
    landmark: 'Magnificent Mile & Chicago Water Tower',
    latitude: 41.8935,
    longitude: -87.6243,
    rating: 4.7,
    contactNumber: '+1 (312) 555-0182',
    amenities: ['Laser Projection', 'Curved Acoustic Wall', 'Craft Beer Bar'],
    screens: [
      { id: 'scr_5', name: 'Screen 1 Master Hall', format: 'Standard 2D', rows: 8, cols: 14, totalSeats: 112 },
    ],
  },
];

const legacyMovies: Movie[] = [
  {
    id: 'mov_odyssey_stars',
    title: 'Odyssey of Stars',
    tagline: 'Where journey ends, the universe begins.',
    description: 'When an interstellar anomaly triggers gravitational disruptions across the Solar perimeter, Commander Alexander Reed and astrophysicist Eliza Vostok lead humanity’s deepest deep-space expedition through the unknown ringed world of Kepler-186.',
    genres: ['Sci-Fi', 'Adventure', 'Mystery'],
    languages: ['English', 'Spanish', 'French'],
    durationMinutes: 164,
    releaseDate: '2026-10-18',
    rating: 9.3,
    votesCount: 48920,
    certificate: 'PG-13',
    director: 'Elias Thornton',
    cast: ['Alexander Reed', 'Eliza Vostok', 'Kaelen Miller', 'Elena Rostova'],
    posterUrl: '/src/assets/images/poster_sci_fi_1793119908580.jpg',
    backdropUrl: '/src/assets/images/hero_cinema_hall_1793119894097.jpg',
    formats: ['IMAX 3D', 'Dolby Cinema', '4DX', 'Standard 2D'],
    status: 'now_showing',
    featured: true,
  },
  {
    id: 'mov_chrono_protocol',
    title: 'Chrono Protocol',
    tagline: 'Time is the ultimate weapon.',
    description: 'An elite counter-temporal operative investigates a series of paradoxical memory assassinations in high-altitude Neo-Geneva, uncovering a conspiracy that spans three separate timelines.',
    genres: ['Action', 'Thriller', 'Sci-Fi'],
    languages: ['English', 'German', 'Japanese'],
    durationMinutes: 138,
    releaseDate: '2026-10-05',
    rating: 8.8,
    votesCount: 34150,
    certificate: 'R',
    director: 'Sofia Chen-Duval',
    cast: ['Marcus Sterling', 'Lyra Vance', 'Kenji Sato'],
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    backdropUrl: '/src/assets/images/hero_cinema_hall_1793119894097.jpg',
    formats: ['IMAX 3D', 'Dolby Cinema'],
    status: 'now_showing',
    featured: true,
  },
  {
    id: 'mov_the_virtuoso',
    title: 'The Virtuoso Maestro',
    tagline: 'Every note holds a reckoning.',
    description: 'A prodigy concert conductor battles progressive hearing loss while preparing the premier performance of a forbidden symphony that unearths her family’s war-time secrets.',
    genres: ['Drama', 'Music'],
    languages: ['English', 'French', 'Italian'],
    durationMinutes: 142,
    releaseDate: '2026-09-22',
    rating: 9.0,
    votesCount: 22890,
    certificate: 'PG-13',
    director: 'Julian Moreau',
    cast: ['Camille Laurent', 'Anthony Hopkins', 'Sebastian Cruz'],
    posterUrl: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=800&q=80',
    backdropUrl: '/src/assets/images/hero_cinema_hall_1793119894097.jpg',
    formats: ['Dolby Cinema', 'Standard 2D'],
    status: 'now_showing',
  },
  {
    id: 'mov_phantom_crest',
    title: 'Phantom Crest',
    tagline: 'In the shadows of the storm.',
    description: 'During a relentless Arctic whiteout, a deep-sea salvage crew discovers a submarine that disappeared in 1968, only to find something dormant waiting inside the hull.',
    genres: ['Horror', 'Mystery', 'Thriller'],
    languages: ['English'],
    durationMinutes: 119,
    releaseDate: '2026-10-14',
    rating: 8.4,
    votesCount: 19400,
    certificate: 'R',
    director: 'Lars Lindqvist',
    cast: ['Freja Lind', 'David Oyelowo', 'Thomas Kretschmann'],
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    backdropUrl: '/src/assets/images/hero_cinema_hall_1793119894097.jpg',
    formats: ['Standard 2D', 'Dolby Atmos'],
    status: 'now_showing',
  },
  {
    id: 'mov_solaris_blade',
    title: 'Solaris Blade: Neon Horizon',
    tagline: 'Rebellion rises from the neon depths.',
    description: 'An underground courier navigating the flooded canal levels of Sector 9 discovers a cryogenic capsule containing the prototype consciousness of humanity’s first artificial guardian.',
    genres: ['Cyberpunk', 'Action', 'Anime'],
    languages: ['Japanese', 'English'],
    durationMinutes: 126,
    releaseDate: '2026-11-12',
    rating: 9.1,
    votesCount: 12400,
    certificate: 'PG-13',
    director: 'Kenichi Takahashi',
    cast: ['Rin Takahashi', 'Ren Amamiya', 'Sarah Connors'],
    posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    backdropUrl: '/src/assets/images/hero_cinema_hall_1793119894097.jpg',
    formats: ['IMAX 3D', '4DX'],
    status: 'coming_soon',
  },
  {
    id: 'mov_wild_savannah',
    title: 'Wild Savannah: Giants of Mara',
    tagline: 'The untamed pulse of the earth.',
    description: 'Narrated by world-renowned naturalists, this visual spectacle captured over 4 years in 8K IMAX reveals the secret migrations, predator hierarchies, and survival dynamics of the Great Rift Valley.',
    genres: ['Documentary', 'Nature'],
    languages: ['English', 'Spanish'],
    durationMinutes: 98,
    releaseDate: '2026-11-20',
    rating: 9.4,
    votesCount: 8200,
    certificate: 'U',
    director: 'Amina Kiprop',
    cast: ['David Attenborough', 'Amina Kiprop'],
    posterUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
    backdropUrl: '/src/assets/images/hero_cinema_hall_1793119894097.jpg',
    formats: ['IMAX 3D', 'Dolby Cinema'],
    status: 'coming_soon',
  },
  {
    id: 'mov_cyber_eclipse',
    title: 'Cyber Eclipse',
    tagline: 'When the city goes dark, truth lights the fire.',
    description: 'In a neon-drenched metropolis under total corporate surveillance, an underground operative uncovers a planetary blackout conspiracy programmed to wipe the identities of millions.',
    genres: ['Action', 'Cyberpunk', 'Thriller'],
    languages: ['English', 'Japanese'],
    durationMinutes: 146,
    releaseDate: '2026-10-24',
    rating: 9.2,
    votesCount: 28410,
    certificate: 'R',
    director: 'Sofia Chen-Duval',
    cast: ['Kaelen Miller', 'Elena Rostova', 'Kenji Sato', 'Maya Lin'],
    posterUrl: '/src/assets/images/poster_cyber_thriller_1793169929489.jpg',
    backdropUrl: '/src/assets/images/hero_cinema_hall_1793119894097.jpg',
    formats: ['IMAX 3D', 'Dolby Cinema', '4DX'],
    status: 'now_showing',
    featured: true,
  },
  {
    id: 'mov_kingdom_ash',
    title: 'Kingdom of Ash',
    tagline: 'An ancient throne forged in fire and ice.',
    description: 'As eternal winter encroaches on the high citadels of Valerius, four banished guardians embark on a perilous ascent up the Dragon Crest to rekindle the slumbering primordial flame.',
    genres: ['Adventure', 'Fantasy', 'Action'],
    languages: ['English', 'Spanish', 'German'],
    durationMinutes: 168,
    releaseDate: '2026-10-20',
    rating: 9.4,
    votesCount: 41200,
    certificate: 'PG-13',
    director: 'Eliza Sharp',
    cast: ['Alexander Drake', 'Isabella Vance', 'Elias Thorne', 'Rowan Cole'],
    posterUrl: '/src/assets/images/poster_epic_fantasy_1793169929860.jpg',
    backdropUrl: '/src/assets/images/hero_cinema_hall_1793119894097.jpg',
    formats: ['IMAX 3D', 'Dolby Cinema'],
    status: 'now_showing',
  },
  {
    id: 'mov_starlight_voyage',
    title: 'Starlight Voyage',
    tagline: 'A galactic adventure for the whole family!',
    description: 'When an adventurous robotic cartographer crash-lands on a celestial floating archipelago, he befriends a bioluminescent cosmic creature and embarks on a whimsical quest across stellar rivers.',
    genres: ['Animation', 'Adventure', 'Family'],
    languages: ['English', 'Spanish', 'French'],
    durationMinutes: 104,
    releaseDate: '2026-10-22',
    rating: 8.9,
    votesCount: 18700,
    certificate: 'U',
    director: 'Pete Hansson',
    cast: ['Ben Schwartz', 'Awkwafina', 'Tom Holland', 'Zendaya'],
    posterUrl: '/src/assets/images/poster_animated_adventure_1793169929607.jpg',
    backdropUrl: '/src/assets/images/hero_cinema_hall_1793119894097.jpg',
    formats: ['IMAX 3D', 'Dolby Cinema', 'Standard 2D'],
    status: 'now_showing',
  },
  {
    id: 'mov_silent_witness',
    title: 'The Silent Witness',
    tagline: 'Truth lies in the shadows.',
    description: 'In 1954 New York, a rain-soaked detective with a troubled past is hired to investigate a mysterious disappearance in an abandoned jazz district, unraveling a web of political corruption and high-stakes espionage.',
    genres: ['Mystery', 'Crime', 'Drama'],
    languages: ['English'],
    durationMinutes: 131,
    releaseDate: '2026-10-15',
    rating: 8.7,
    votesCount: 15300,
    certificate: 'R',
    director: 'Elias Vance',
    cast: ['Gabriel Thornton', 'Anna Sullivan', 'Lars Mikkelsen'],
    posterUrl: '/src/assets/images/poster_noir_detective_1793169951028.jpg',
    backdropUrl: '/src/assets/images/hero_cinema_hall_1793119894097.jpg',
    formats: ['Dolby Cinema', 'Standard 2D'],
    status: 'now_showing',
  },
  {
    id: 'mov_letters_autumn',
    title: 'Letters to Autumn',
    tagline: 'An unexpected love, every single leaf.',
    description: 'When an American landscape architect arrives in Paris for a restorative autumn sabbatical, a misdelivered vintage love letter leads him into the whimsical world of a charismatic local bookbinder.',
    genres: ['Romance', 'Comedy', 'Drama'],
    languages: ['English', 'French'],
    durationMinutes: 118,
    releaseDate: '2026-10-25',
    rating: 9.1,
    votesCount: 23400,
    certificate: 'PG',
    director: 'Liam Harper',
    cast: ['Sarah Connolly', 'Thomas Moreau', 'Juliette Binoche'],
    posterUrl: '/src/assets/images/poster_romance_verona_1793170285497.jpg',
    backdropUrl: '/src/assets/images/hero_cinema_hall_1793119894097.jpg',
    formats: ['Dolby Cinema', 'Standard 2D'],
    status: 'now_showing',
  },
  {
    id: 'mov_vanguard_apex',
    title: 'Vanguard: Apex Dawn',
    tagline: 'The rise of the ultimate defender.',
    description: 'As a rogue syndicate deploys orbital gravitational disruptors above New Metropolis, cybernetically augmented pilot Julian Apex awakens the prototype Vanguard exosuit to mount Earth’s ultimate aerial defense.',
    genres: ['Action', 'Sci-Fi', 'Superhero'],
    languages: ['English', 'Japanese'],
    durationMinutes: 152,
    releaseDate: '2026-10-26',
    rating: 9.5,
    votesCount: 52100,
    certificate: 'PG-13',
    director: 'Marcus Sterling',
    cast: ['Chris Vance', 'Zoe Saldaña', 'Idris Alba'],
    posterUrl: '/src/assets/images/poster_superhero_vanguard_1793170285127.jpg',
    backdropUrl: '/src/assets/images/hero_cinema_hall_1793119894097.jpg',
    formats: ['IMAX 3D', 'Dolby Cinema', '4DX'],
    status: 'now_showing',
    featured: true,
  },
  {
    id: 'mov_blackwood_haunting',
    title: 'The Blackwood Haunting',
    tagline: 'Some secrets don’t stay buried.',
    description: 'A team of paranormal acoustics researchers spend three nights inside the cursed Blackwood Manor, cataloging frequency anomalies until the house begins rearranging its geometry around them.',
    genres: ['Horror', 'Supernatural', 'Mystery'],
    languages: ['English'],
    durationMinutes: 112,
    releaseDate: '2026-10-27',
    rating: 8.8,
    votesCount: 19800,
    certificate: 'R',
    director: 'Arthur Finch',
    cast: ['Eleanor Vance', 'Arthur Manch', 'Eliza Reeder'],
    posterUrl: '/src/assets/images/poster_horror_blackwood_1793170286180.jpg',
    backdropUrl: '/src/assets/images/hero_cinema_hall_1793119894097.jpg',
    formats: ['Dolby Cinema', 'Standard 2D'],
    status: 'now_showing',
  },
  {
    id: 'mov_dust_glory',
    title: 'Dust & Glory',
    tagline: 'Some seek riches. Others seek redemption. He seeks judgment.',
    description: 'In 1881 New Mexico territory, an aging lawman is forced out of retirement to track a ruthless outlaw gang across scorching salt flats before they reach the border river.',
    genres: ['Western', 'Action', 'Adventure'],
    languages: ['English', 'Spanish'],
    durationMinutes: 139,
    releaseDate: '2026-10-21',
    rating: 9.0,
    votesCount: 26300,
    certificate: 'R',
    director: 'Gregory Adams',
    cast: ['Jameson Reed', 'Sarah Elias', 'Vance McCoy'],
    posterUrl: '/src/assets/images/poster_western_frontier_1793170285618.jpg',
    backdropUrl: '/src/assets/images/hero_cinema_hall_1793119894097.jpg',
    formats: ['IMAX 3D', 'Standard 2D'],
    status: 'now_showing',
  },
  {
    id: 'mov_final_round',
    title: 'The Final Round: Iron Heart',
    tagline: 'Champions are made in the rounds they refuse to yield.',
    description: 'An undrafted welterweight boxer from South Philadelphia overcomes career-ending ligament injuries and personal tragedy to earn a shot at the undisputed world heavyweight title.',
    genres: ['Sports', 'Drama', 'Action'],
    languages: ['English'],
    durationMinutes: 134,
    releaseDate: '2026-10-19',
    rating: 8.9,
    votesCount: 21500,
    certificate: 'PG-13',
    director: 'Denzel Wright',
    cast: ['Michael B. Jordan', 'Tessa Thompson', 'Sylvester Stallone'],
    posterUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=800&q=80',
    backdropUrl: '/src/assets/images/hero_cinema_hall_1793119894097.jpg',
    formats: ['Dolby Cinema', 'Standard 2D'],
    status: 'now_showing',
  },
  {
    id: 'mov_rhythm_broadway',
    title: 'Rhythm of Broadway',
    tagline: 'Every street is a stage. Every heartbeat is music.',
    description: 'A fiery ensemble of tap dancers, classical violinists, and street jazz vocalists battle gentrification and rival producers to stage the biggest independent musical in Times Square history.',
    genres: ['Musical', 'Comedy', 'Drama'],
    languages: ['English'],
    durationMinutes: 125,
    releaseDate: '2026-10-23',
    rating: 9.2,
    votesCount: 31200,
    certificate: 'PG',
    director: 'Lin-Manuel Miranda',
    cast: ['Leslie Odom Jr.', 'Renée Elise Goldsberry', 'Anthony Ramos'],
    posterUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
    backdropUrl: '/src/assets/images/hero_cinema_hall_1793119894097.jpg',
    formats: ['Dolby Cinema', 'IMAX 3D'],
    status: 'now_showing',
  },
  {
    id: 'mov_iron_horizon',
    title: 'Iron Horizon: Siege of 1944',
    tagline: 'In the darkest hour of humanity, courage forged victory.',
    description: 'Trapped behind enemy lines in the freezing Ardennes Forest, a lone radio operator and five allied tank crewmen must hold a critical bridge against an advancing armored battalion.',
    genres: ['War', 'History', 'Action'],
    languages: ['English', 'German', 'French'],
    durationMinutes: 158,
    releaseDate: '2026-10-17',
    rating: 9.3,
    votesCount: 44100,
    certificate: 'R',
    director: 'Christopher Nolan',
    cast: ['Cillian Murphy', 'Tom Hardy', 'Kenneth Branagh'],
    posterUrl: 'https://images.unsplash.com/photo-1579965342575-16428a7c8881?auto=format&fit=crop&w=800&q=80',
    backdropUrl: '/src/assets/images/hero_cinema_hall_1793119894097.jpg',
    formats: ['IMAX 3D', 'Dolby Cinema'],
    status: 'now_showing',
  },
  {
    id: 'mov_barnaby_escape',
    title: 'Barnaby’s Big City Escape',
    tagline: 'One small paw. One giant metropolitan caper!',
    description: 'When an adventurous golden retriever accidentally boards a cross-country bullet train to Manhattan, he unites an eccentric alley-cat syndicate to foil an unscrupulous pet store tycoon.',
    genres: ['Family', 'Comedy', 'Adventure'],
    languages: ['English', 'Spanish'],
    durationMinutes: 96,
    releaseDate: '2026-10-26',
    rating: 8.8,
    votesCount: 16700,
    certificate: 'U',
    director: 'Brad Bird',
    cast: ['Jack Black', 'Paul Rudd', 'Tina Fey'],
    posterUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
    backdropUrl: '/src/assets/images/hero_cinema_hall_1793119894097.jpg',
    formats: ['Standard 2D', '4DX'],
    status: 'now_showing',
  },
  {
    id: 'mov_singularity_2099',
    title: 'Singularity 2099',
    tagline: 'Beyond the event horizon lies human rebirth.',
    description: 'Deep-space mining vessel Prometheus discovers a hyper-dense artificial neutron construct drifting in interstellar space that emits coherent mathematical signals from the future.',
    genres: ['Sci-Fi', 'Thriller', 'Mystery'],
    languages: ['English'],
    durationMinutes: 148,
    releaseDate: '2026-11-15',
    rating: 9.2,
    votesCount: 18200,
    certificate: 'PG-13',
    director: 'Denis Villeneuve',
    cast: ['Oscar Isaac', 'Rebecca Ferguson', 'Timothée Chalamet'],
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    backdropUrl: '/src/assets/images/hero_cinema_hall_1793119894097.jpg',
    formats: ['IMAX 3D', 'Dolby Cinema'],
    status: 'coming_soon',
  },
  {
    id: 'mov_grand_illusionist',
    title: 'The Grand Illusionist',
    tagline: 'Look closer. What you see is only what they want you to believe.',
    description: 'An elusive master mentalist orchestrates a series of impossible bank disappearances during live televised stage performances in London, challenging Scotland Yard to solve the riddle.',
    genres: ['Mystery', 'Crime', 'Thriller'],
    languages: ['English'],
    durationMinutes: 130,
    releaseDate: '2026-11-28',
    rating: 9.0,
    votesCount: 14500,
    certificate: 'PG-13',
    director: 'Christopher Priest',
    cast: ['Christian Bale', 'Hugh Jackman', 'Scarlett Johansson'],
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    backdropUrl: '/src/assets/images/hero_cinema_hall_1793119894097.jpg',
    formats: ['Dolby Cinema', 'Standard 2D'],
    status: 'coming_soon',
  },
];

const initialMovies: Movie[] = ALL_100_MOVIES;

// Helper to generate shows for today and upcoming dates across ALL theatres
function createSeedShows(): Show[] {
  const dates = [
    new Date().toISOString().split('T')[0],
    new Date(Date.now() + 86400000).toISOString().split('T')[0],
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
  ];

  const times = [
    { start: '10:15 AM', end: '01:00 PM' },
    { start: '01:45 PM', end: '04:30 PM' },
    { start: '05:15 PM', end: '08:00 PM' },
    { start: '08:45 PM', end: '11:30 PM' },
    { start: '10:30 PM', end: '01:15 AM' },
  ];

  const shows: Show[] = [];
  let showIdx = 101;

  dates.forEach((date, dateIdx) => {
    initialTheatres.forEach((theatre, thIdx) => {
      const isIndia = theatre.city !== 'New York' && theatre.city !== 'Los Angeles' && theatre.city !== 'Chicago';

      theatre.screens.forEach((screen, scrIdx) => {
        let pricing = { standard: 14, premium: 20, vip: 30 };
        if (isIndia) {
          if (screen.format.includes('IMAX')) {
            pricing = { standard: 380, premium: 580, vip: 850 };
          } else if (screen.format.includes('4DX')) {
            pricing = { standard: 350, premium: 520, vip: 750 };
          } else if (screen.format.includes('Dolby Cinema')) {
            pricing = { standard: 320, premium: 480, vip: 700 };
          } else {
            pricing = { standard: 220, premium: 340, vip: 520 };
          }
        } else {
          if (screen.format.includes('IMAX')) {
            pricing = { standard: 18, premium: 24, vip: 34 };
          } else if (screen.format.includes('4DX')) {
            pricing = { standard: 16, premium: 22, vip: 30 };
          } else {
            pricing = { standard: 13, premium: 18, vip: 26 };
          }
        }

        // Schedule 2 to 3 movie shows per screen per day
        const slotCount = (thIdx + scrIdx) % 2 === 0 ? 3 : 2;
        for (let s = 0; s < slotCount; s++) {
          const slotTime = times[(dateIdx + thIdx * 2 + scrIdx + s * 2) % times.length];
          const movieIndex = (dateIdx * 5 + thIdx * 3 + scrIdx * 7 + s * 11) % ALL_100_MOVIES.length;
          const movie = ALL_100_MOVIES[movieIndex];

          const seats = generateShowSeats(
            ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
            screen.cols || 14,
            pricing,
            0.18
          );
          const bookedCount = Object.values(seats).filter((st) => st.status === 'booked').length;

          shows.push({
            id: `show_${showIdx++}`,
            movieId: movie.id,
            theatreId: theatre.id,
            screenId: screen.id,
            date,
            startTime: slotTime.start,
            endTime: slotTime.end,
            format: screen.format,
            language: movie.languages[0] || 'Hindi',
            pricing,
            seats,
            totalSeats: Object.keys(seats).length,
            bookedSeatsCount: bookedCount,
          });
        }
      });
    });
  });

  return shows;
}

// Legacy static generator for backward compatibility
function legacySeedShows(): Show[] {
  const dates = [
    new Date().toISOString().split('T')[0],
    new Date(Date.now() + 86400000).toISOString().split('T')[0],
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
  ];

  const times = [
    { start: '10:30 AM', end: '01:15 PM' },
    { start: '02:00 PM', end: '04:45 PM' },
    { start: '05:30 PM', end: '08:15 PM' },
    { start: '09:00 PM', end: '11:45 PM' },
  ];

  const shows: Show[] = [];
  let showIdx = 101;

  dates.forEach((date) => {
    // Shows for Odyssey of Stars
    times.forEach((t, i) => {
      const seats = generateShowSeats(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], 14, { standard: 14, premium: 20, vip: 30 });
      const bookedCount = Object.values(seats).filter((s) => s.status === 'booked').length;
      shows.push({
        id: `show_${showIdx++}`,
        movieId: 'mov_odyssey_stars',
        theatreId: 'th_imax_metropolis',
        screenId: 'scr_1',
        date,
        startTime: t.start,
        endTime: t.end,
        format: i % 2 === 0 ? 'IMAX 3D' : 'Dolby Cinema',
        language: 'English',
        pricing: { standard: 14, premium: 20, vip: 30 },
        seats,
        totalSeats: Object.keys(seats).length,
        bookedSeatsCount: bookedCount,
      });
    });

    // Shows for Chrono Protocol
    [times[1], times[3]].forEach((t) => {
      const seats = generateShowSeats(['A', 'B', 'C', 'D', 'E', 'F', 'G'], 12, { standard: 12, premium: 18, vip: 26 });
      const bookedCount = Object.values(seats).filter((s) => s.status === 'booked').length;
      shows.push({
        id: `show_${showIdx++}`,
        movieId: 'mov_chrono_protocol',
        theatreId: 'th_regal_olympic',
        screenId: 'scr_3',
        date,
        startTime: t.start,
        endTime: t.end,
        format: '4DX',
        language: 'English',
        pricing: { standard: 12, premium: 18, vip: 26 },
        seats,
        totalSeats: Object.keys(seats).length,
        bookedSeatsCount: bookedCount,
      });
    });

    // Shows for The Virtuoso Maestro
    [times[0], times[2]].forEach((t) => {
      const seats = generateShowSeats(['A', 'B', 'C', 'D', 'E', 'F', 'G'], 12, { standard: 11, premium: 16, vip: 24 });
      const bookedCount = Object.values(seats).filter((s) => s.status === 'booked').length;
      shows.push({
        id: `show_${showIdx++}`,
        movieId: 'mov_the_virtuoso',
        theatreId: 'th_pvr_heritage',
        screenId: 'scr_5',
        date,
        startTime: t.start,
        endTime: t.end,
        format: 'Standard 2D',
        language: 'English',
        pricing: { standard: 11, premium: 16, vip: 24 },
        seats,
        totalSeats: Object.keys(seats).length,
        bookedSeatsCount: bookedCount,
      });
    });

    // Shows for Cyber Eclipse
    [times[1], times[3]].forEach((t, i) => {
      const seats = generateShowSeats(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], 14, { standard: 15, premium: 22, vip: 32 });
      const bookedCount = Object.values(seats).filter((s) => s.status === 'booked').length;
      shows.push({
        id: `show_${showIdx++}`,
        movieId: 'mov_cyber_eclipse',
        theatreId: 'th_imax_metropolis',
        screenId: 'scr_1',
        date,
        startTime: t.start,
        endTime: t.end,
        format: i === 0 ? 'IMAX 3D' : '4DX',
        language: 'English',
        pricing: { standard: 15, premium: 22, vip: 32 },
        seats,
        totalSeats: Object.keys(seats).length,
        bookedSeatsCount: bookedCount,
      });
    });

    // Shows for Kingdom of Ash
    [times[0], times[2]].forEach((t) => {
      const seats = generateShowSeats(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], 14, { standard: 14, premium: 20, vip: 30 });
      const bookedCount = Object.values(seats).filter((s) => s.status === 'booked').length;
      shows.push({
        id: `show_${showIdx++}`,
        movieId: 'mov_kingdom_ash',
        theatreId: 'th_imax_metropolis',
        screenId: 'scr_2',
        date,
        startTime: t.start,
        endTime: t.end,
        format: 'Dolby Cinema',
        language: 'English',
        pricing: { standard: 14, premium: 20, vip: 30 },
        seats,
        totalSeats: Object.keys(seats).length,
        bookedSeatsCount: bookedCount,
      });
    });

    // Shows for Starlight Voyage
    [times[0], times[1]].forEach((t) => {
      const seats = generateShowSeats(['A', 'B', 'C', 'D', 'E', 'F', 'G'], 12, { standard: 10, premium: 15, vip: 22 });
      const bookedCount = Object.values(seats).filter((s) => s.status === 'booked').length;
      shows.push({
        id: `show_${showIdx++}`,
        movieId: 'mov_starlight_voyage',
        theatreId: 'th_regal_olympic',
        screenId: 'scr_4',
        date,
        startTime: t.start,
        endTime: t.end,
        format: 'Dolby Atmos',
        language: 'English',
        pricing: { standard: 10, premium: 15, vip: 22 },
        seats,
        totalSeats: Object.keys(seats).length,
        bookedSeatsCount: bookedCount,
      });
    });

    // Shows for The Silent Witness
    [times[2], times[3]].forEach((t) => {
      const seats = generateShowSeats(['A', 'B', 'C', 'D', 'E', 'F', 'G'], 12, { standard: 12, premium: 16, vip: 24 });
      const bookedCount = Object.values(seats).filter((s) => s.status === 'booked').length;
      shows.push({
        id: `show_${showIdx++}`,
        movieId: 'mov_silent_witness',
        theatreId: 'th_pvr_heritage',
        screenId: 'scr_5',
        date,
        startTime: t.start,
        endTime: t.end,
        format: 'Standard 2D',
        language: 'English',
        pricing: { standard: 12, premium: 16, vip: 24 },
        seats,
        totalSeats: Object.keys(seats).length,
        bookedSeatsCount: bookedCount,
      });
    });

    // Shows for Vanguard: Apex Dawn
    times.forEach((t, i) => {
      const seats = generateShowSeats(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], 14, { standard: 16, premium: 24, vip: 34 });
      const bookedCount = Object.values(seats).filter((s) => s.status === 'booked').length;
      shows.push({
        id: `show_${showIdx++}`,
        movieId: 'mov_vanguard_apex',
        theatreId: 'th_imax_metropolis',
        screenId: 'scr_1',
        date,
        startTime: t.start,
        endTime: t.end,
        format: i % 2 === 0 ? 'IMAX 3D' : '4DX',
        language: 'English',
        pricing: { standard: 16, premium: 24, vip: 34 },
        seats,
        totalSeats: Object.keys(seats).length,
        bookedSeatsCount: bookedCount,
      });
    });

    // Shows for Letters to Autumn
    [times[0], times[2]].forEach((t) => {
      const seats = generateShowSeats(['A', 'B', 'C', 'D', 'E', 'F', 'G'], 12, { standard: 12, premium: 17, vip: 25 });
      const bookedCount = Object.values(seats).filter((s) => s.status === 'booked').length;
      shows.push({
        id: `show_${showIdx++}`,
        movieId: 'mov_letters_autumn',
        theatreId: 'th_pvr_heritage',
        screenId: 'scr_5',
        date,
        startTime: t.start,
        endTime: t.end,
        format: 'Dolby Cinema',
        language: 'English',
        pricing: { standard: 12, premium: 17, vip: 25 },
        seats,
        totalSeats: Object.keys(seats).length,
        bookedSeatsCount: bookedCount,
      });
    });

    // Shows for The Blackwood Haunting
    [times[2], times[3]].forEach((t) => {
      const seats = generateShowSeats(['A', 'B', 'C', 'D', 'E', 'F', 'G'], 12, { standard: 13, premium: 18, vip: 26 });
      const bookedCount = Object.values(seats).filter((s) => s.status === 'booked').length;
      shows.push({
        id: `show_${showIdx++}`,
        movieId: 'mov_blackwood_haunting',
        theatreId: 'th_regal_olympic',
        screenId: 'scr_4',
        date,
        startTime: t.start,
        endTime: t.end,
        format: 'Dolby Cinema',
        language: 'English',
        pricing: { standard: 13, premium: 18, vip: 26 },
        seats,
        totalSeats: Object.keys(seats).length,
        bookedSeatsCount: bookedCount,
      });
    });

    // Shows for Dust & Glory
    [times[1], times[3]].forEach((t) => {
      const seats = generateShowSeats(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], 14, { standard: 14, premium: 20, vip: 28 });
      const bookedCount = Object.values(seats).filter((s) => s.status === 'booked').length;
      shows.push({
        id: `show_${showIdx++}`,
        movieId: 'mov_dust_glory',
        theatreId: 'th_imax_metropolis',
        screenId: 'scr_2',
        date,
        startTime: t.start,
        endTime: t.end,
        format: 'IMAX 3D',
        language: 'English',
        pricing: { standard: 14, premium: 20, vip: 28 },
        seats,
        totalSeats: Object.keys(seats).length,
        bookedSeatsCount: bookedCount,
      });
    });

    // Shows for The Final Round
    [times[0], times[2]].forEach((t) => {
      const seats = generateShowSeats(['A', 'B', 'C', 'D', 'E', 'F', 'G'], 12, { standard: 12, premium: 17, vip: 25 });
      const bookedCount = Object.values(seats).filter((s) => s.status === 'booked').length;
      shows.push({
        id: `show_${showIdx++}`,
        movieId: 'mov_final_round',
        theatreId: 'th_regal_olympic',
        screenId: 'scr_3',
        date,
        startTime: t.start,
        endTime: t.end,
        format: 'Dolby Cinema',
        language: 'English',
        pricing: { standard: 12, premium: 17, vip: 25 },
        seats,
        totalSeats: Object.keys(seats).length,
        bookedSeatsCount: bookedCount,
      });
    });

    // Shows for Rhythm of Broadway
    [times[1], times[3]].forEach((t) => {
      const seats = generateShowSeats(['A', 'B', 'C', 'D', 'E', 'F', 'G'], 12, { standard: 13, premium: 19, vip: 28 });
      const bookedCount = Object.values(seats).filter((s) => s.status === 'booked').length;
      shows.push({
        id: `show_${showIdx++}`,
        movieId: 'mov_rhythm_broadway',
        theatreId: 'th_pvr_heritage',
        screenId: 'scr_5',
        date,
        startTime: t.start,
        endTime: t.end,
        format: 'Dolby Cinema',
        language: 'English',
        pricing: { standard: 13, premium: 19, vip: 28 },
        seats,
        totalSeats: Object.keys(seats).length,
        bookedSeatsCount: bookedCount,
      });
    });

    // Shows for Iron Horizon
    [times[1], times[2]].forEach((t) => {
      const seats = generateShowSeats(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], 14, { standard: 15, premium: 22, vip: 30 });
      const bookedCount = Object.values(seats).filter((s) => s.status === 'booked').length;
      shows.push({
        id: `show_${showIdx++}`,
        movieId: 'mov_iron_horizon',
        theatreId: 'th_imax_metropolis',
        screenId: 'scr_1',
        date,
        startTime: t.start,
        endTime: t.end,
        format: 'IMAX 3D',
        language: 'English',
        pricing: { standard: 15, premium: 22, vip: 30 },
        seats,
        totalSeats: Object.keys(seats).length,
        bookedSeatsCount: bookedCount,
      });
    });

    // Shows for Barnaby’s Big City Escape
    [times[0], times[1]].forEach((t) => {
      const seats = generateShowSeats(['A', 'B', 'C', 'D', 'E', 'F', 'G'], 12, { standard: 10, premium: 15, vip: 22 });
      const bookedCount = Object.values(seats).filter((s) => s.status === 'booked').length;
      shows.push({
        id: `show_${showIdx++}`,
        movieId: 'mov_barnaby_escape',
        theatreId: 'th_regal_olympic',
        screenId: 'scr_4',
        date,
        startTime: t.start,
        endTime: t.end,
        format: 'Standard 2D',
        language: 'English',
        pricing: { standard: 10, premium: 15, vip: 22 },
        seats,
        totalSeats: Object.keys(seats).length,
        bookedSeatsCount: bookedCount,
      });
    });
  });

  return shows;
}

const initialShows = createSeedShows();

const initialBookings: Booking[] = [];
const initialPayments: PaymentTransaction[] = [];
const initialNotifications: NotificationItem[] = [];
const initialLoyaltyLedger: LoyaltyTransaction[] = [];

class CinemaDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadOrInit();
    // Run background lock sweeper every 30 seconds
    setInterval(() => this.cleanExpiredLocks(), 30000);
  }

  private loadOrInit(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.movies && parsed.shows && parsed.users) {
          let updated = false;
          // Ensure movies collection has all 100 authentic blockbuster movies
          parsed.movies = initialMovies;
          // Refresh theatres collection to include all authentic Indian and international theatres
          parsed.theatres = initialTheatres;
          // Ensure shows collection has shows for all 100 movies across all Indian & international theatres
          if (!parsed.shows || parsed.shows.length < initialShows.length || !parsed.shows.some((s: Show) => s.theatreId === 'th_pvr_ti_indore' || s.theatreId === 'th_cinepolis_db_mall_bhopal')) {
            parsed.shows = initialShows;
          }
          // Purge any legacy demo user (Alex Vance)
          if (parsed.users) {
            parsed.users = parsed.users.filter((u: User) => u.id !== 'user_demo' && u.email !== 'alex@cinephile.com');
          }
          if (parsed.bookings) {
            parsed.bookings = parsed.bookings.filter((b: Booking) => b.userId !== 'user_demo');
          }
          if (parsed.loyaltyLedger) {
            parsed.loyaltyLedger = parsed.loyaltyLedger.filter((l: LoyaltyTransaction) => l.userId !== 'user_demo');
          }
          updated = true;
          if (updated) {
            this.save(parsed);
          }
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Could not read existing store, initializing new seed DB:', err);
    }

    const defaultData: DatabaseSchema = {
      users: initialUsers,
      movies: initialMovies,
      theatres: initialTheatres,
      shows: initialShows,
      bookings: initialBookings,
      payments: initialPayments,
      notifications: initialNotifications,
      loyaltyLedger: initialLoyaltyLedger,
    };
    this.save(defaultData);
    return defaultData;
  }

  private save(dataToSave = this.data) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database to file:', err);
    }
  }

  public cleanExpiredLocks() {
    const now = Date.now();
    let changed = false;

    this.data.shows.forEach((show) => {
      Object.values(show.seats).forEach((seat) => {
        if (seat.status === 'locked' && seat.lockedExpiresAt && seat.lockedExpiresAt < now) {
          seat.status = 'available';
          delete seat.lockedBy;
          delete seat.lockedExpiresAt;
          changed = true;
        }
      });
    });

    if (changed) {
      this.save();
    }
  }

  // Users
  public getUsers() {
    return this.data.users;
  }

  public findUserById(id: string) {
    return this.data.users.find((u) => u.id === id);
  }

  public findUserByEmail(email: string) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public addUser(user: User) {
    this.data.users.push(user);
    this.save();
    return user;
  }

  // Movies
  public getMovies() {
    return this.data.movies;
  }

  public getMovieById(id: string) {
    return this.data.movies.find((m) => m.id === id);
  }

  public addMovie(movie: Movie) {
    this.data.movies.unshift(movie);
    this.save();
    return movie;
  }

  public updateMovie(id: string, updates: Partial<Movie>) {
    const index = this.data.movies.findIndex((m) => m.id === id);
    if (index === -1) return null;
    this.data.movies[index] = { ...this.data.movies[index], ...updates };
    this.save();
    return this.data.movies[index];
  }

  public deleteMovie(id: string) {
    const index = this.data.movies.findIndex((m) => m.id === id);
    if (index === -1) return false;
    this.data.movies.splice(index, 1);
    // Also remove associated shows
    this.data.shows = this.data.shows.filter((s) => s.movieId !== id);
    this.save();
    return true;
  }

  // Theatres
  public getTheatres() {
    return this.data.theatres;
  }

  public getTheatreById(id: string) {
    return this.data.theatres.find((t) => t.id === id);
  }

  public addTheatre(theatre: Theatre) {
    this.data.theatres.push(theatre);
    this.save();
    return theatre;
  }

  // Shows
  public getShows(filter?: { movieId?: string; theatreId?: string; date?: string }) {
    this.cleanExpiredLocks();
    return this.data.shows.filter((s) => {
      if (filter?.movieId && s.movieId !== filter.movieId) return false;
      if (filter?.theatreId && s.theatreId !== filter.theatreId) return false;
      if (filter?.date && s.date !== filter.date) return false;
      return true;
    });
  }

  public getShowById(id: string) {
    this.cleanExpiredLocks();
    return this.data.shows.find((s) => s.id === id);
  }

  public addShow(show: Show) {
    this.data.shows.push(show);
    this.save();
    return show;
  }

  public deleteShow(id: string) {
    const idx = this.data.shows.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.data.shows.splice(idx, 1);
    this.save();
    return true;
  }

  // Lock Seats for checkout (8 minutes hold)
  public lockSeats(showId: string, seatIds: string[], userId: string, holdMinutes = 8) {
    this.cleanExpiredLocks();
    const show = this.data.shows.find((s) => s.id === showId);
    if (!show) throw new Error('Show not found');

    const expiresAt = Date.now() + holdMinutes * 60 * 1000;

    // First verify all requested seats are available or locked by this user
    for (const seatId of seatIds) {
      const seat = show.seats[seatId];
      if (!seat) throw new Error(`Seat ${seatId} does not exist`);
      if (seat.status === 'booked') throw new Error(`Seat ${seatId} is already booked`);
      if (seat.status === 'locked' && seat.lockedBy !== userId && seat.lockedExpiresAt && seat.lockedExpiresAt > Date.now()) {
        throw new Error(`Seat ${seatId} is currently reserved by another guest`);
      }
    }

    // Lock them
    for (const seatId of seatIds) {
      const seat = show.seats[seatId];
      seat.status = 'locked';
      seat.lockedBy = userId;
      seat.lockedExpiresAt = expiresAt;
    }

    this.save();
    return {
      success: true,
      expiresAt,
      seats: seatIds.map((id) => show.seats[id]),
    };
  }

  public releaseSeats(showId: string, seatIds: string[], userId: string) {
    const show = this.data.shows.find((s) => s.id === showId);
    if (!show) return;

    seatIds.forEach((id) => {
      const seat = show.seats[id];
      if (seat && seat.status === 'locked' && seat.lockedBy === userId) {
        seat.status = 'available';
        delete seat.lockedBy;
        delete seat.lockedExpiresAt;
      }
    });
    this.save();
  }

  // Bookings
  public getBookings(userId?: string) {
    if (userId) {
      return this.data.bookings.filter((b) => b.userId === userId);
    }
    return this.data.bookings;
  }

  public getBookingById(id: string) {
    return this.data.bookings.find((b) => b.id === id);
  }

  public createBooking(booking: Booking) {
    // Permanently mark seats as booked in the show
    const show = this.data.shows.find((s) => s.id === booking.showId);
    if (show) {
      booking.seats.forEach((bookedSeat) => {
        if (show.seats[bookedSeat.seatId]) {
          show.seats[bookedSeat.seatId].status = 'booked';
          delete show.seats[bookedSeat.seatId].lockedBy;
          delete show.seats[bookedSeat.seatId].lockedExpiresAt;
        }
      });
      show.bookedSeatsCount = Object.values(show.seats).filter((s) => s.status === 'booked').length;
    }

    this.data.bookings.unshift(booking);

    // Create payment transaction record
    const paymentRecord: PaymentTransaction = {
      id: `pay_${Date.now()}`,
      bookingId: booking.id,
      userId: booking.userId,
      amount: booking.totalAmount,
      method: (booking.paymentMethod as any) || 'card',
      status: 'completed',
      transactionRef: `TXN-${Math.floor(100000000 + Math.random() * 900000000)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.payments.unshift(paymentRecord);

    // Create user notification
    this.data.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: booking.userId,
      title: 'Ticket Confirmed',
      message: `Your reservation for "${booking.movieTitle}" (${booking.seats.map((s) => s.seatId).join(', ')}) is confirmed at ${booking.theatreName}.`,
      type: 'booking',
      read: false,
      createdAt: new Date().toISOString(),
      link: '/dashboard',
    });

    // Calculate and award loyalty points
    const loyaltySummary = this.getLoyaltySummary(booking.userId);
    const basePoints = Math.round(booking.totalAmount * 10);
    const earnedPoints = Math.round(basePoints * loyaltySummary.tierMultiplier);
    booking.loyaltyPointsEarned = earnedPoints;

    // If points were redeemed for a discount
    if (booking.loyaltyPointsRedeemed && booking.loyaltyPointsRedeemed > 0) {
      this.addLoyaltyTransaction({
        userId: booking.userId,
        type: 'redeemed',
        points: -booking.loyaltyPointsRedeemed,
        description: `Redeemed for $${(booking.loyaltyPointsRedeemed / 100).toFixed(2)} discount on ${booking.movieTitle} (${booking.bookingCode})`,
        bookingId: booking.id,
      });
    }

    // Award earned points
    this.addLoyaltyTransaction({
      userId: booking.userId,
      type: 'earned',
      points: earnedPoints,
      description: `Earned on booking "${booking.movieTitle}" (${booking.bookingCode})`,
      bookingId: booking.id,
    });

    this.save();
    return booking;
  }

  public cancelBooking(bookingId: string, userId: string, isAdmin = false) {
    const booking = this.data.bookings.find((b) => b.id === bookingId);
    if (!booking) throw new Error('Booking not found');
    if (!isAdmin && booking.userId !== userId) throw new Error('Unauthorized cancellation');
    if (booking.bookingStatus === 'cancelled') throw new Error('Booking is already cancelled');

    booking.bookingStatus = 'cancelled';
    booking.cancelledAt = new Date().toISOString();
    // 90% refund policy (10% cancellation charge)
    booking.refundAmount = Number((booking.totalAmount * 0.9).toFixed(2));
    booking.paymentStatus = 'refunded';

    // Release seats in the show
    const show = this.data.shows.find((s) => s.id === booking.showId);
    if (show) {
      booking.seats.forEach((seat) => {
        if (show.seats[seat.seatId]) {
          show.seats[seat.seatId].status = 'available';
          delete show.seats[seat.seatId].lockedBy;
          delete show.seats[seat.seatId].lockedExpiresAt;
        }
      });
      show.bookedSeatsCount = Object.values(show.seats).filter((s) => s.status === 'booked').length;
    }

    // Reverse earned loyalty points
    if (booking.loyaltyPointsEarned && booking.loyaltyPointsEarned > 0) {
      this.addLoyaltyTransaction({
        userId: booking.userId,
        type: 'reversed',
        points: -booking.loyaltyPointsEarned,
        description: `Points reversed due to booking cancellation (${booking.bookingCode})`,
        bookingId: booking.id,
      });
    }

    // Refund redeemed loyalty points back to user balance
    if (booking.loyaltyPointsRedeemed && booking.loyaltyPointsRedeemed > 0) {
      this.addLoyaltyTransaction({
        userId: booking.userId,
        type: 'bonus',
        points: booking.loyaltyPointsRedeemed,
        description: `Redeemed points refunded on cancellation (${booking.bookingCode})`,
        bookingId: booking.id,
      });
    }

    // Add cancellation notification
    this.data.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: booking.userId,
      title: 'Booking Cancelled',
      message: `Your booking ${booking.bookingCode} for "${booking.movieTitle}" was cancelled. Refund of $${booking.refundAmount} initiated.`,
      type: 'cancellation',
      read: false,
      createdAt: new Date().toISOString(),
    });

    this.save();
    return booking;
  }

  // --- LOYALTY PROGRAM METHODS ---
  public getLoyaltySummary(userId: string): LoyaltySummary {
    const userTxs = (this.data.loyaltyLedger || []).filter((tx) => tx.userId === userId);
    const totalPoints = userTxs.reduce((sum, tx) => sum + tx.points, 0);
    const lifetimeEarned = userTxs
      .filter((tx) => tx.points > 0)
      .reduce((sum, tx) => sum + tx.points, 0);

    let tier: LoyaltyTier = 'bronze';
    let tierName = 'Bronze Reel';
    let tierMultiplier = 1.0;
    let nextTier: LoyaltyTier | undefined = 'silver';
    let nextTierName: string | undefined = 'Silver Screen';
    let nextTierThreshold: number | undefined = 1000;
    let pointsToNextTier = Math.max(0, 1000 - totalPoints);
    let progressPercent = Math.min(100, Math.round((totalPoints / 1000) * 100));

    if (totalPoints >= 5000) {
      tier = 'platinum';
      tierName = 'Platinum Premier';
      tierMultiplier = 1.5;
      nextTier = undefined;
      nextTierName = undefined;
      nextTierThreshold = undefined;
      pointsToNextTier = 0;
      progressPercent = 100;
    } else if (totalPoints >= 2500) {
      tier = 'gold';
      tierName = 'Gold Marquee';
      tierMultiplier = 1.25;
      nextTier = 'platinum';
      nextTierName = 'Platinum Premier';
      nextTierThreshold = 5000;
      pointsToNextTier = 5000 - totalPoints;
      progressPercent = Math.min(100, Math.round(((totalPoints - 2500) / 2500) * 100));
    } else if (totalPoints >= 1000) {
      tier = 'silver';
      tierName = 'Silver Screen';
      tierMultiplier = 1.1;
      nextTier = 'gold';
      nextTierName = 'Gold Marquee';
      nextTierThreshold = 2500;
      pointsToNextTier = 2500 - totalPoints;
      progressPercent = Math.min(100, Math.round(((totalPoints - 1000) / 1500) * 100));
    }

    return {
      userId,
      totalPoints: Math.max(0, totalPoints),
      lifetimeEarned,
      tier,
      tierName,
      tierMultiplier,
      nextTier,
      nextTierName,
      nextTierThreshold,
      pointsToNextTier,
      progressPercent,
      cashValue: Number((Math.max(0, totalPoints) / 100).toFixed(2)),
    };
  }

  public getLoyaltyHistory(userId: string) {
    return (this.data.loyaltyLedger || [])
      .filter((tx) => tx.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addLoyaltyTransaction(tx: Omit<LoyaltyTransaction, 'id' | 'timestamp'>) {
    if (!this.data.loyaltyLedger) {
      this.data.loyaltyLedger = [];
    }
    const newTx: LoyaltyTransaction = {
      ...tx,
      id: `ltx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.loyaltyLedger.unshift(newTx);
    this.save();
    return newTx;
  }

  // Notifications
  public getNotifications(userId: string) {
    return this.data.notifications.filter((n) => n.userId === userId);
  }

  public markNotificationAsRead(id: string) {
    const notif = this.data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.save();
    }
    return notif;
  }

  public markAllNotificationsAsRead(userId: string) {
    this.data.notifications.forEach((n) => {
      if (n.userId === userId) n.read = true;
    });
    this.save();
  }

  // Analytics for Admin
  public getAnalytics() {
    const confirmedBookings = this.data.bookings.filter((b) => b.bookingStatus === 'confirmed');
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalTicketsSold = confirmedBookings.reduce((sum, b) => sum + b.seats.length, 0);

    let totalCapacity = 0;
    let totalBookedInShows = 0;
    this.data.shows.forEach((s) => {
      totalCapacity += s.totalSeats;
      totalBookedInShows += s.bookedSeatsCount;
    });

    const occupancyRate = totalCapacity > 0 ? Math.round((totalBookedInShows / totalCapacity) * 100) : 0;

    // Revenue by movie
    const movieMap: Record<string, { title: string; revenue: number; tickets: number }> = {};
    confirmedBookings.forEach((b) => {
      if (!movieMap[b.movieId]) {
        movieMap[b.movieId] = { title: b.movieTitle, revenue: 0, tickets: 0 };
      }
      movieMap[b.movieId].revenue += b.totalAmount;
      movieMap[b.movieId].tickets += b.seats.length;
    });

    const revenueByMovie = Object.entries(movieMap).map(([movieId, val]) => ({
      movieId,
      title: val.title,
      revenue: Number(val.revenue.toFixed(2)),
      tickets: val.tickets,
    }));

    // Daily sales last 7 days
    const dailySalesMap: Record<string, { amount: number; tickets: number }> = {};
    confirmedBookings.forEach((b) => {
      const d = b.bookedAt.split('T')[0];
      if (!dailySalesMap[d]) dailySalesMap[d] = { amount: 0, tickets: 0 };
      dailySalesMap[d].amount += b.totalAmount;
      dailySalesMap[d].tickets += b.seats.length;
    });

    const dailySales = Object.entries(dailySalesMap).map(([date, val]) => ({
      date,
      amount: Number(val.amount.toFixed(2)),
      tickets: val.tickets,
    }));

    return {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalBookings: this.data.bookings.length,
      totalTicketsSold,
      occupancyRate,
      activeMoviesCount: this.data.movies.filter((m) => m.status === 'now_showing').length,
      activeTheatresCount: this.data.theatres.length,
      recentBookings: this.data.bookings.slice(0, 10),
      revenueByMovie,
      dailySales,
    };
  }

  public resetDemoData() {
    this.data = {
      users: initialUsers,
      movies: initialMovies,
      theatres: initialTheatres,
      shows: createSeedShows(),
      bookings: initialBookings,
      payments: initialPayments,
      notifications: initialNotifications,
      loyaltyLedger: initialLoyaltyLedger,
    };
    this.save();
    return true;
  }
}

export const db = new CinemaDatabase();
