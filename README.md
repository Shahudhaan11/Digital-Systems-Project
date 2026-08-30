# SeatFlick

![React Native](https://img.shields.io/badge/React_Native-20232A?logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo_SDK_57-000020?logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)
![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS%20%7C%20Web-informational)

**SeatFlick** is a mobile cinema booking app built with React Native and Expo. Browse movies pulled live from The Movie Database (TMDB), pick a date, showtime and seats, and book your ticket under a real account. Accounts, bookings and favourites are stored in Supabase, so they stay consistent across every device you log in from - all wrapped in a dark, frosted-glass interface. Guests can still browse the catalogue and pick seats freely; an account is only needed to complete a booking or save a favourite.

> _Your seat to every story._

<!-- Optional: add a demo GIF here later, e.g. ![Demo](screenshots/demo.gif) -->

---

## Features

| Feature                    | Description                                                                              |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| **Guest browsing**         | Browse movies, view details and pick a date/showtime/seats with no account required.      |
| **Accounts**                | Sign up with a unique username, log in/out, and reset a forgotten password by email.     |
| **Browse & categories**    | Live movie lists from TMDB, switchable between _Popular_, _Now Playing_ and _Top Rated_. |
| **Live search**            | Filter the movie list in real time as you type.                                          |
| **Movie details**          | Poster, release year, rating and synopsis for each film.                                 |
| **Favourites**             | Save movies with a tap (requires login); they live on their own tab and sync to your account. |
| **Seat booking**           | Pick a date (next 7 days), a showtime, and seats from an interactive grid (login required to confirm). |
| **Taken-seat detection**   | Seats already booked for the same showing are greyed out and locked, for every user and device. |
| **Ticket confirmation**    | A styled cinema ticket with a unique reference code and barcode.                         |
| **My Bookings**            | All confirmed bookings saved to your account, each cancellable individually.             |
| **Settings**               | Usage stats, clear-data controls, share, and app info.                                   |
| **Loading & error states** | Spinners while loading and friendly messages on network failure.                         |

---

## Installation & Run Instructions

### Prerequisites

- **Node.js** (LTS version - v22 recommended)
- **Expo Go** app on a physical device, **or** an **Android emulator** via Android Studio
- A free **TMDB API key** (see below)
- A free **Supabase project** (see below) - powers accounts, bookings and favourites

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/Shahudhaan11/Digital-Systems-Project.git
   cd Digital-Systems-Project
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create a Supabase project**
   Create a free project at <https://supabase.com>. Once it's ready, open the **SQL Editor** and run the contents of [`supabase/schema.sql`](./supabase/schema.sql) - this creates the `bookings`, `favourites` and `profiles` tables with row-level security, plus the trigger that enforces unique usernames.

   Then, in your Supabase project's **Authentication → Providers → Email** settings, turn **off** "Confirm email" - the app logs a new user in immediately after sign-up rather than waiting on a confirmation email.

   Finally, in **Authentication → URL Configuration → Redirect URLs**, add the URL the app runs on locally (e.g. `http://localhost:8081/**` for web) so the password-reset email link is allowed to work.

4. **Add your API keys**
   Keys are kept out of the repository for security, so you'll need your own. In the project root, create a file named `.env` containing:

   ```
   TMDB_API_KEY=your_tmdb_api_key_here
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_publishable_or_anon_key
   ```

   A TMDB key can be created for free at <https://www.themoviedb.org> under **Settings > API**. The Supabase URL and key are on your project's **Settings → API** page (use the publishable/anon key, never the secret/service-role key). The app reads all three automatically via `react-native-dotenv`.

5. **Start the app**
   ```bash
   npx expo start
   ```
   Then press **`a`** to open on an Android emulator, or scan the QR code with Expo Go on your phone.

---

## Screenshots

| Home                          | Movie Details                       | Seat Selection                  |
| ----------------------------- | ----------------------------------- | ------------------------------- |
| ![Home](screenshots/home.png) | ![Details](screenshots/details.png) | ![Seats](screenshots/seats.png) |

| Ticket                            | My Bookings                           | Favourites                                |
| --------------------------------- | ------------------------------------- | ----------------------------------------- |
| ![Ticket](screenshots/ticket.png) | ![Bookings](screenshots/bookings.png) | ![Favourites](screenshots/favourites.png) |

| Settings                              | Splash                            |
| ------------------------------------- | --------------------------------- |
| ![Settings](screenshots/settings.png) | ![Splash](screenshots/splash.png) |

---

## How It Works

A quick tour of the app's architecture and the decisions behind it:

- **Navigation (Expo Router).** Navigation is file-based. A root **stack** wraps a **bottom-tab** group (`Home`, `Favourites`, `Bookings`, `Settings`) plus the authentication screens (`welcome`, `login`, `forgot-password`, `reset-password`) and the booking screens (`movie/[id]`, `seats`, `confirm`). The root layout also holds a route guard that watches the current session and redirects a guest away from `confirm` (the actual booking step) towards `welcome`, and redirects a logged-in user away from the auth screens towards the tabs.
- **Authentication (Supabase Auth).** Session/user state is centralised in an `AuthProvider` React Context (`src/context/AuthProvider.jsx`), read by every screen via a `useAuth()` hook rather than each screen re-implementing its own session tracking. Sign-up passes the chosen username as user metadata; a database trigger (see `supabase/schema.sql`) enforces that it's actually unique, rolling back the whole signup atomically if it isn't.
- **State management (React Hooks).** Screen-local state (loading flags, the movie list, selected seats, search text, chosen category) is handled with `useState` and `useEffect`. `useFocusEffect` re-reads saved data whenever a tab regains focus, so lists stay current after a booking or favourite is added.
- **Persistence (Supabase).** Bookings, favourites and profiles live in a Supabase Postgres database rather than on-device storage, scoped per user by row-level security so one user's client can never read or write another user's data. A narrow `taken_seats` view exposes only the availability-relevant columns, so seat availability is accurate for every user and device checking the same showing, not just the current device. All data-access logic is isolated in `src/services/` rather than scattered through the screens.
- **Data & error handling (TMDB API).** All network calls live in `services/tmdb.js`. Every request shows a loading spinner and falls back to a friendly error message if the network or API key fails.
- **Seat availability.** When a date and showtime are chosen, the app checks the shared `taken_seats` view for that exact movie/date/time and disables any seats already taken - preventing double-booking per showing, across every user.
- **Theming.** A single `theme.js` palette drives every screen, keeping the dark, blue-accent look consistent and easy to change in one place.

---

## Technologies Used

- **React Native** - cross-platform mobile framework
- **Expo (SDK 57)** - tooling and runtime
- **Expo Router** - file-based navigation (bottom tabs + stack)
- **React Hooks** (`useState`, `useEffect`, `useCallback`, `useFocusEffect`) - state management
- **Supabase** (`@supabase/supabase-js`) - authentication and Postgres database for accounts, bookings and favourites, with row-level security
- **AsyncStorage** - caches the session token on native so a logged-in user stays signed in between launches
- **react-native-url-polyfill** - required for Supabase's client library to run in the React Native JS environment
- **TMDB API** - live movie data
- **react-native-dotenv** - keeps API keys in a private `.env` file, out of the repository
- **react-native-svg** - the custom SeatFlick logo
- **expo-blur** - the frosted-glass navigation bar
- **@expo/vector-icons (Ionicons)** - interface icons
- **expo-splash-screen** - branded launch screen

---

## Project Structure

```
src/
├── app/
│   ├── _layout.tsx            # Root stack navigator + auth route guard
│   ├── welcome.tsx            # Landing screen (Sign Up / Log In)
│   ├── login.tsx              # Sign-up / sign-in (single screen, mode-switched)
│   ├── forgot-password.tsx    # Request a password-reset email
│   ├── reset-password.tsx     # Set a new password (via emailed recovery link)
│   ├── (tabs)/                # Bottom tab screens
│   │   ├── _layout.tsx        # Tab bar (frosted glass)
│   │   ├── index.tsx          # Home (search + categories)
│   │   ├── favourites.tsx     # Saved favourites (requires login)
│   │   ├── bookings.tsx       # Saved bookings (requires login)
│   │   └── settings.tsx       # Settings (account, stats + about)
│   ├── movie/[id].tsx         # Movie details
│   ├── seats.tsx              # Date/time/seat selection
│   └── confirm.tsx            # Summary + ticket (requires login)
├── components/
│   └── Logo.jsx               # SVG brand logo
├── context/
│   └── AuthProvider.jsx       # Session/user state, via useAuth()
├── services/
│   ├── tmdb.js                # TMDB API calls
│   ├── supabase.js            # Supabase client
│   ├── bookings.js            # Booking persistence (Supabase)
│   └── favourites.js          # Favourites persistence (Supabase)
├── utils/
│   └── confirmDialog.ts       # Cross-platform confirm/alert (Alert.alert is a no-op on web)
└── theme.js                   # Central colour palette

supabase/
└── schema.sql                 # bookings/favourites/profiles tables, RLS policies, taken_seats view
```

---

## Known Issues & Future Improvements

- **Simulated payment** - the booking flow does not process real payments.
- **Edit bookings** - bookings can be cancelled and re-created, but not edited in place. Edit-in-place is a planned improvement.
- **Username uniqueness only, not other profile fields** - usernames are enforced unique at signup; there's no profile-editing flow yet.
- **Expo Go splash** - when run through Expo Go, Expo Go's own loading screen appears before the app's branded splash. A standalone development build would show only the SeatFlick splash.
- **Planned additions** - cast lists, trailers, pull-to-refresh, and social login providers.

---

## Reflection

This project was my introduction to React Native and the most challenging part of this learning journey was the environment itself, which was resolving a Node/npm version conflict during setup and an Expo SDK / Expo Go compatibility mismatch before the app would even run on a device. Once past that, building each feature gradually made the framework click as I learned how file-based routing combines stack and tab navigation, how React hooks manage screen state, and how AsyncStorage provides real-life persistence. Adding a second saved dataset (favourites) reinforced the pattern, and implementing taken-seat detection pushed me to think about data relationships rather than just displaying values. If I were to extend it, I'd move seat availability to a shared backend and add in-place booking edits.

---

## Attribution

Movie data provided by [The Movie Database (TMDB)](https://www.themoviedb.org). This product uses the TMDB API but is not endorsed or certified by TMDB.

---

_Built as a university project for the Digital Systems Project module (UFCFXK-30-3)._
