# IMovies Cinema Loyalty Points & Rewards Tracking System

A seamless loyalty points tracking and rewards engine for IMovies, granting users points on every booking, displaying their tier progress and points balance in an interactive widget within the **My Bookings** view, and enabling instant point redemptions for discounts at checkout.

---

### Implementation Status: COMPLETED & VERIFIED

All planned features for the loyalty point tracking system have been implemented and verified:
- Backend persistence & ledger transactions (`/api/loyalty/summary`, `/api/loyalty/history`)
- Real-time point accrual on bookings (10 pts per $1 spent, adjusted by tier multiplier)
- Automatic point reversal & refunded point restoration on cancellations
- Compact `LoyaltyWidget` in the **My Bookings** view with tier progress, cash value, and ledger history
- Checkout point redemptions for instant dollar discounts (100 pts = $1.00 off)
- E-Ticket Pass and individual booking cards displaying earned loyalty point rewards
- **Tier Progression**:
  - **Bronze Reel** (0 – 999 pts): Standard earning (10 pts/$1).
  - **Silver Screen** (1,000 – 2,499 pts): 1.1x earning multiplier + free concession snack voucher flag.
  - **Gold Marquee** (2,500 – 4,999 pts): 1.25x earning multiplier + zero booking fee waiver.
  - **Platinum Premier** (5,000+ pts): 1.5x multiplier + complimentary VIP seat upgrade availability.
- **Checkout Redemption Integration**: Users can toggle "Redeem Loyalty Points" in the checkout modal to offset their ticket total in increments of 100 points.

---

### 1. Overview & Core Concept

- **What It Does**: Enhances the cinema ticket booking lifecycle by automatically tracking loyalty points earned on completed reservations, managing tier statuses with progress bars, logging historical credit/debit ledger entries, and embedding a compact, high-contrast loyalty widget directly into the **My Bookings** view.
- **Target Audience / Persona**: Frequent moviegoers, cinephiles, and occasional guests who want tangible rewards, fee waivers, and discounts for their cinema visits.
- **Key Value**: Increases repeat bookings, incentivizes higher-tier auditorium purchases (IMAX / VIP Recliners), and rewards loyal customers with direct checkout savings.

---

### 2. User Experience & Visual Design

#### A. Loyalty Widget in "My Bookings" View
- **Compact Header Badge & Balance Display**: Placed prominently at the top of the **My Bookings** view alongside the booking filters, framed in deep obsidian (`#121622`) with an amber/gold border accent.
- **Current Tier & Progress Gauge**:
  - Displays current rank (e.g., *Silver Screen Member*).
  - Visual progress bar showing points needed for the next milestone (e.g., `1,450 / 2,500 pts to Gold Marquee`).
  - Equivalent cash value indicator (e.g., `Points Cash Value: $14.50`).
- **Interactive Points Ledger Popover / Drawer**:
  - Clicking "View Point History" reveals a clean itemized log of all point events:
    - *Ticket Booking (IMV-9428-TX)*: `+700 pts`
    - *Cancellation Reversal (IMV-3104-OD)*: `-240 pts`
    - *Checkout Redemption*: `-500 pts`
- **Zero-Pill Typographic Discipline**:
  - Clean unboxed labels with quiet dot separators (`Silver Tier · 1,450 pts · $14.50 redeemable value`).
  - Monospace tabular numerals (`tabular-nums`) for exact point counters.

#### B. Checkout Redemption Experience
- In the `CheckoutModal`, a dedicated **"IMovies Loyalty Rewards"** section displays:
  - Available user balance.
  - Slider or 1-click button: *"Apply 500 Points (-$5.00)"* or custom point amount.
  - Real-time line-item deduction in the price breakdown summary before final card or UPI payment authorization.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Server-Authoritative Ledger vs. Client-Only Computed Balance**
  - *Chosen Approach*: Maintain a dedicated `loyaltyTransactions` ledger in the backend `db.ts` alongside user accounts.
  - *Why*: Prevents tampering with points balances, ensures atomic updates during cancellations and checkout redemptions, and allows points to persist accurately across sessions.
  - *Alternatives Considered*: Calculating points on the fly from bookings array was rejected because it cannot track manual redemptions or promotional bonus points.

- **Decision 2: Automatic Reversal on Cancellation**
  - *Chosen Approach*: When a user cancels a booking for a 90% refund, the exact points granted for that booking are deducted from their loyalty balance.
  - *Why*: Eliminates arbitrary point inflation exploits.

- **Decision 3: Placement in "My Bookings"**
  - *Chosen Approach*: Positioned as a dedicated dashboard strip above the Upcoming/Past tabs, plus accessible from the top navbar user dropdown.
  - *Why*: Keeps points contextually adjacent to the user's booking history without cluttering the movie discovery homepage.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                       IMovies Client                        │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                 Navbar & User Menu                  │   │
│   │   (Displays quick balance: 1,450 pts)               │   │
│   └─────────────────────────────────────────────────────┘   │
│                              │                              │
│   ┌──────────────────────────▼──────────────────────────┐   │
│   │                  My Bookings View                   │   │
│   │   ┌─────────────────────────────────────────────┐   │   │
│   │   │           LoyaltyPointsWidget               │   │   │
│   │   │  - Tier Badge (Bronze/Silver/Gold/Platinum) │   │   │
│   │   │  - Balance & Cash Worth ($)                 │   │   │
│   │   │  - Progress to Next Tier                    │   │   │
│   │   │  - "View History" Ledger Modal              │   │   │
│   │   └─────────────────────────────────────────────┘   │   │
│   │   ┌─────────────────────────────────────────────┐   │   │
│   │   │ Upcoming / Past Bookings Grid               │   │   │
│   │   └─────────────────────────────────────────────┘   │   │
│   └─────────────────────────────────────────────────────┘   │
│                              │                              │
│   ┌──────────────────────────▼──────────────────────────┐   │
│   │                   Checkout Modal                    │   │
│   │   - Loyalty Point Redemption Checkbox / Slider      │   │
│   │   - Instant discount applied to final amount        │   │
│   └─────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────┘
                               │ API Requests (/api/loyalty/*)
┌──────────────────────────────▼──────────────────────────────┐
│                  Express & In-Memory Store                  │
│                                                             │
│   Endpoints:                                                │
│   - GET  /api/loyalty/summary     (Balance, tier, progress) │
│   - GET  /api/loyalty/history     (Ledger itemized log)     │
│   - POST /api/loyalty/redeem      (Redeem points)           │
│                                                             │
│   Automatic hooks on db operations:                         │
│   - createBooking()  -> credit points based on totalAmount  │
│   - cancelBooking()  -> debit previously awarded points     │
└─────────────────────────────────────────────────────────────┘
```

#### Data Model Extensions:
1. **`LoyaltyAccount`**:
   - `userId`: string
   - `totalPoints`: number
   - `lifetimeEarned`: number
   - `tier`: `'bronze' | 'silver' | 'gold' | 'platinum'`
2. **`LoyaltyTransaction`**:
   - `id`: string
   - `userId`: string
   - `type`: `'earned' | 'redeemed' | 'reversed' | 'bonus'`
   - `points`: number
   - `description`: string
   - `bookingId`?: string
   - `timestamp`: string
