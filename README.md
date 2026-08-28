# 🎬 SeatFlick

A mobile cinema booking app built with React Native and Expo. Browse movies pulled live from The Movie Database (TMDB), pick a date, showtime and seats, and save your bookings and favourites on the device so they persist between sessions.

---

## ⚙️ Installation & Run Instructions

### Prerequisites
- **Node.js** (LTS version — v22 recommended)
- **Expo Go** app on a physical device, **or** an **Android emulator** via Android Studio
- A free **TMDB API key** (see below)

### Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/seatflick.git
   cd seatflick
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add your TMDB API key**
   Open `src/services/tmdb.js` and paste your free key into the `API_KEY` value:
   ```javascript
   const API_KEY = 'YOUR_TMDB_API_KEY';
   ```
   A key can be created for free at <https://www.themoviedb.org> under **Settings → API**.

4. **Start the app**
   ```bash
   npx expo start
   ```
   Then press **`a`** to open on an Android emulator, or scan the QR code with the Expo Go app on your phone.

---

## ✨ Feature List

- **Browse movies** — a live list of films fetched from the TMDB API, each with a poster and rating.
- **Categories** — switch between *Popular*, *Now Playing* and *Top Rated* (separate TMDB endpoints).
- **Search** — filter the movie list in real time by typing a title.
- **Movie details** — a dedicated screen per film with a large poster, release year, rating and description.
- **Favourites / watchlist** — tap the heart on any movie to save it; favourites live on their own tab and persist between sessions.
- **Seat booking flow** — choose a date (next 7 days), a showtime, and seats from an interactive grid.
- **Taken-seat detection** — seats already booked for the same movie, date and time are greyed out and cannot be re-selected.
- **Booking confirmation ticket** — a styled cinema ticket with a unique booking reference and barcode.
- **My Bookings** — every confirmed booking is saved and listed, and can be cancelled individually.
- **Settings** — clear all saved bookings.
- **Loading & error states** — spinners while data loads and friendly messages if the network fails.

---

## 📱 Screenshots

| Home | Movie Details | Seat Selection |
|------|---------------|----------------|
| ![Home](screenshots/home.png) | ![Details](screenshots/details.png) | ![Seats](screenshots/seats.png) |

| Ticket | My Bookings | Favourites |
|--------|-------------|------------|
| ![Ticket](screenshots/ticket.png) | ![Bookings](screenshots/bookings.png) | ![Favourites](screenshots/favourites.png) |

| Settings |
|----------|
| ![Settings](screenshots/settings.png) |

---

## 🛠 Technologies Used

- **React Native** — cross-platform mobile framework
- **Expo (SDK 54)** — tooling and runtime
- **Expo Router** — file-based navigation (bottom tabs + stack)
- **React Hooks** (`useState`, `useEffect`, `useCallback`, `useFocusEffect`) — state management
- **AsyncStorage** — local, on-device persistence for bookings and favourites
- **TMDB API** — live movie data
- **react-native-svg** — the custom SeatFlick logo
- **expo-blur** — the frosted-glass navigation bar
- **@expo/vector-icons (Ionicons)** — interface icons
- **expo-splash-screen** — branded launch screen

---

## 📁 Project Structure

```
src/
├── app/
│   ├── _layout.tsx            # Root stack navigator
│   ├── (tabs)/                # Bottom tab screens
│   │   ├── _layout.tsx        # Tab bar (frosted glass)
│   │   ├── index.tsx          # Home (search + categories)
│   │   ├── favourites.tsx     # Saved favourites
│   │   ├── bookings.tsx       # Saved bookings
│   │   └── settings.tsx       # Settings
│   ├── movie/[id].tsx         # Movie details
│   ├── seats.tsx              # Date/time/seat selection
│   └── confirm.tsx            # Summary + ticket
├── components/
│   └── Logo.jsx               # SVG brand logo
├── services/
│   ├── tmdb.js                # API calls
│   ├── bookings.js            # Booking persistence
│   └── favourites.js          # Favourites persistence
└── theme.js                   # Central colour palette
```

---

## 🔧 Known Issues & Future Improvements

- **API key in source** — for simplicity the TMDB key is stored in `tmdb.js`. A production app would move it to an environment variable (`.env`).
- **Simulated payment** — the booking flow does not process real payments.
- **Edit bookings** — bookings can currently be cancelled and re-created, but not edited in place. Edit-in-place is a planned improvement.
- **Local-only availability** — taken seats are tracked per device, not on a shared server.
- **Expo Go splash** — when run through Expo Go, Expo Go's own loading screen appears before the app's branded splash. A standalone development build would show only the SeatFlick splash.
- **Planned additions** — cast lists, trailers, and pull-to-refresh.

---

