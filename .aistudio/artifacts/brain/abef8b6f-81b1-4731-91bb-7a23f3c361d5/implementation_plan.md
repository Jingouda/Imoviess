# IMovies Cinema & Stream Vault — Tactical Gamer GUI with 100+ Movies, Watch Online & Download

Transform the IMovies platform into a comprehensive **Tactical Esports Arena Entertainment Terminal** featuring:
1. A massive library of **100 curated movies** spanning all genres (Sci-Fi, Action, Hindi/Bollywood, Cyberpunk, Horror, Anime, Comedy, Romance, Thriller, Fantasy, Drama, Crime, War, and Documentary).
2. Dual consumption modes: **Theatrical Seat Booking** AND **Instant Online 4K Watch & Offline Download Vault**.
3. Tactical Esports Arena GUI with dark titanium surfaces, glowing neon emerald HUD accents, XP Gamer Rank progression, and zero-latency Web Audio sound effects.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The plan has been updated to incorporate the 100-movie multi-genre catalog and direct Online Watch & Offline Download capabilities:

- **100 Curated Blockbusters Across All Genres**:
  - **Hindi & Indian Epics (30+ titles)**: *Kalki 2898 AD*, *Jawan*, *RRR*, *Stree 2*, *Animal*, *Fighter*, *Brahmāstra*, *Pathaan*, *KGF: Chapter 2*, *Baahubali 2*, *Dangal*, *Gadar 2*, *Singham Again*, *War*, *Leo*, *Salaar*, *Vikram*, *Kantara*, *Drishyam 2*, *Chhichhore*, *Andhadhun*, *Zindagi Na Milegi Dobara*, *3 Idiots*, *Tumbbad*, *PK*, *Gangs of Wasseypur*, *Kabir Singh*, *Shershaah*, *Uri: The Surgical Strike*, *Article 370*.
  - **Hollywood & Sci-Fi / Action (35+ titles)**: *Dune: Part Two*, *Cyberpunk 2077: Phantom Liberty*, *Interstellar*, *The Batman: Part II*, *Oppenheimer*, *Spider-Man: Beyond the Spider-Verse*, *Blade Runner 2049*, *Deadpool & Wolverine*, *Avatar: Fire and Ash*, *Gladiator II*, *John Wick: Chapter 4*, *Top Gun: Maverick*, *Inception*, *Godzilla x Kong*, *Mad Max: Fury Road*, *The Matrix Resurrections*, *Avengers: Secret Wars*, *Mission: Impossible - Dead Reckoning*, *Everything Everywhere All At Once*, *Tenet*, *Alien: Romulus*, *The Dark Knight*, *Fight Club*, *Pulp Fiction*, *The Wolf of Wall Street*, *Inglourious Basterds*, *Whiplash*, *Interstellar IMAX*, *Joker: Folie à Deux*, *Furiosa: A Mad Max Saga*, *Twisters*, *A Quiet Place: Day One*, *Civil War*, *Poor Things*.
  - **Anime, Fantasy, Horror & Family (35+ titles)**: *Demon Slayer: Infinity Castle*, *Spirited Away*, *Your Name*, *Jujutsu Kaisen 0*, *Suzume*, *Princess Mononoke*, *Attack on Titan: The Last Attack*, *The Boy and the Heron*, *The Conjuring: Last Rites*, *Hereditary*, *Midsommar*, *Get Out*, *A Nightmare on Elm Street*, *Inside Out 2*, *Spider-Man: Into the Spider-Verse*, *Puss in Boots: The Last Wish*, *The Super Mario Bros. Movie*, *Kubo and the Two Strings*, *Superbad*, *Grand Budapest Hotel*, *Knives Out*, *Glass Onion*, *La La Land*, *Past Lives*, *Before Sunrise*, *The Shawshank Redemption*, *Parasite*, *1917*, *Oppenheimer 70mm*, *Spider-Man: No Way Home*, *Arrival*, *District 9*, *Edge of Tomorrow*, *Blade Runner*, *Spirited Away*.
- **"Watch Online" & "Download" Engine**:
  - **Watch Online Modal**: Dedicated tactical 4K Cyber-Player with theater lights toggle, audio language selector (English / Hindi / Dual Audio), subtitle tracks, stream quality toggling (4K UHD, 1080p, 720p), playback controls, and ambient cinema backdrop glow.
  - **Download Vault**: Direct offline download drawer/modal with resolution selector (4K 8.4GB, 1080p 2.8GB, 720p 1.1GB), download speed telemetry, offline license generator, and simulated direct download pass.
  - **Theatrical Reservation**: Retains full tactical seat radar booking, seat locking, and holographic QR passes.

---

## 1. Overview & Core Concept

IMovies evolves into a full-spectrum digital cinema station. Users can choose to either book theatrical seats in real auditoriums or stream/download full titles directly to their personal rig.

### Primary User Flows
1. **Browse & Filter**: Filter 100 movies by Genre (14 categories), Language (Hindi, English, Japanese, Dual Audio), Format (IMAX, Dolby, 4K Stream), and Availability (In Theatres, Stream Online, Download Ready).
2. **Watch Online**: Click "Watch Online" on any title to launch the futuristic Cyber-Stream Player with 4K resolution options, full controls, and theater ambient mode.
3. **Download Offline**: Click "Download" to trigger the Tactical Download Manager with simulated high-speed download progress, format choices, and downloaded storage status.
4. **Theatrical Experience**: Click "Book Seats" to open the Tactical Seat Radar with holographic screen arc, seat lock countdown, and checkout pass.

---

## 2. User Experience & Visual Design

### A. Visual Identity & Color Tokens
- **Surface**: Matte Titanium (`#070a08`), Carbon Fiber (`#0d1410`), Stealth Panel (`#131c17`).
- **HUD Accents**: Neon Emerald (`#00ff9d`, `#10b981`), Cyber Cyan (`#06b6d4`), Telemetry Amber (`#f59e0b`), Critical Red (`#ef4444`).
- **HUD Frame Styling**: Diagonal chamfers, tactical reticle brackets, scanline texture, and glow pulses.

### B. Navigation & Mode Tabs
- **`MOVIES`**: The full 100-movie catalog with quick-action cards (Book / Watch / Download).
- **`STREAM VAULT`**: Curated online watch section featuring 4K HDR releases, trending streams, and continue-watching state.
- **`DOWNLOADS`**: User's offline download vault with downloaded movies, storage telemetry, and playback launcher.
- **`CINEMAS`**: Theatrical auditorium locator and formats.
- **`MY BOOKINGS & PASSES`**: Theatrical passes and digital streaming licenses.
- **`ADMIN CONSOLE`**: Full catalog and showtime manager.

### C. Synthesized Web Audio Sound Effects
- **Stream Ignition**: Ambient sci-fi power-up chord when launching video stream.
- **Download Initiated**: Tactical high-frequency telemetry beep.
- **Seat Lock / Navigation**: Crisp 1200Hz tactical chirp.
- **Audio HUD Toggle**: Header switch with mute state persistence.

---

## 3. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        IMOVIES COMMAND & STREAM HUB                    │
├────────────────────────────────────────────────────────────────────────┤
│  Top Command Header: Mission Logo · XP Bar · Audio Switch · Stream Nav │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌───────────────────────┐  ┌───────────────────────────────────────┐  │
│  │ Hero Spotlight Banner │  │ Multi-Genre & Availability Filter HUD │  │
│  │ [Watch Now] [Download]│  │ [Hindi / English / Dual Audio]        │  │
│  │ [Book Theatrical Pass]│  │ [Action/Sci-Fi/Horror/Comedy/Drama]   │  │
│  └───────────────────────┘  └───────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 100-Movie Grid with 2:3 Vertical Posters & Action Triggers       │  │
│  │ [Poster Key Art] · [Title] · [Genre & Lang] · [IMDb Rating]      │  │
│  │ Buttons: [▶ Watch Online]  [⤓ Download]  [🎟 Book Seats]          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────┐  │
│  │ Tactical 4K Cyber-Stream Player │  │ Tactical Download Manager   │  │
│  │ - 4K/1080p Quality Switcher     │  │ - 4K / 1080p / 720p Choices │  │
│  │ - English / Hindi Audio Tracks  │  │ - Real-time Progress Bar    │  │
│  │ - Subtitles & Theater Ambience  │  │ - Saved to Offline Vault    │  │
│  └─────────────────────────────────┘  └─────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Tactical Seat Radar Modal (for Theatrical Reservations)          │  │
│  │ Holographic Curved Screen · Seat Matrix · Real-time Lock Timer   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Key System Components Created & Updated:
1. **`src/server/db.ts` & `src/server/movieData.ts`**: Expand the database to include 100 high-fidelity movies with verified, authentic theatrical release posters (Kalki, Jawan, RRR, Animal, Dune, Batman, Oppenheimer, etc.) from Amazon/IMDb CDN. Completely purged `user_demo` and legacy Alex Vance accounts.
2. **`src/components/LoginGate.tsx` & `src/App.tsx`**: Enforced Login-First security gate requiring Google or Gmail authentication before entering the cinema catalog or streaming dashboard.
3. **`src/components/Navbar.tsx` & `src/components/AuthModal.tsx`**: Integrated "Continue with Google" and direct Gmail enrollment. Permanently removed the manual user/admin role switch toggle and Alex Vance demo presets.
4. **`src/components/PosterApiKeyModal.tsx` & API**: Added dedicated Movie Poster API Key management for OMDb and TMDb with 100/100 verified poster verification and live status telemetry.
5. **`src/components/WatchOnlineModal.tsx`**: High-tech video streaming player modal with quality selection, audio dub switcher, and ambient glow.
6. **`src/components/DownloadModal.tsx` & `DownloadsView.tsx`**: Tactical offline download manager with progress simulation and storage management.
7. **`src/services/soundFx.ts`**: Web Audio synthesizer for gamer UI sound effects.

