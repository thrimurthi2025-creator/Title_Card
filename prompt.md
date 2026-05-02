# Lumiere: Cinema Title Card Tracker - MVP Development Prompt

## 1. Project Overview
**Lumiere** is a high-fidelity cinema companion application. Its unique selling point is the **Title Card Tracker**, which allows users to synchronize a timer with the movie they are watching to find the exact moment the movie's title appears on screen. It features a community-driven database of movies, ratings, comments, and local theater mapping.

## 2. Visual Identity & Aesthetic (Neo-Brutalism)
The app uses a **Neo-Brutalist** design system. This must be translated into Flutter using:
- **Colors**: 
  - Primary (Background): `#FFFFFF` or `#f8f9fa`
  - Secondary (UI pop): `#ff3e3e` (Red)
  - Tertiary: `#f4e04d` (Yellow)
  - Quaternary: `#9b59b6` (Purple)
  - Accent: `#ff8b3d` (Orange)
- **Strokes**: All cards, buttons, and inputs must have a **2.0px - 3.0px solid black border** (`Colors.black`).
- **Shadows**: Use "hard" shadows with zero blur. Offset them (e.g., `5.0, 5.0`) to create a 3D "Pop Art" effect.
- **Typography**: Bold, heavy sans-serif headings (Inter or Space Grotesk). Monospaced fonts for timers and data.

## 3. Core Features & Screen Logic

### A. Authentication
- **Provider**: Firebase Authentication.
- **Method**: Google Sign-In only.
- **Logic**: On first login, create a user document in Firestore under `/users/{uid}`.

### B. Home Screen
- **Hero Section**: Horizontal carousel of "Featured" movies with large backdrops and neo-brutalist titles.
- **Search Bar**: Real-time filtering of the movie database.
- **Spotlight**: A grid of movies categorized by genre or "Recent Additions".
- **Floating Action Button**: Quick access to the "Tracker".

### C. Movie Details
- **Hero Header**: High-quality backdrop with an overlay title.
- **Metadata**: Display Release Year, Genre, and Total Duration.
- **Rating System**: Interactive 5-star rating. Logic: Calculate average from the `/ratings` collection.
- **Comments Section**: Real-time list from `/movies/{movieId}/comments`. Supports posting, character counting (280 chars), and deletion by owner.
- **Action**: "Track this Movie" button that launches the Tracker preset with this movie's data.

### D. Title Card Tracker (The "Magic" Feature)
- **Logic**:
  - Requires a `targetTime` (e.g., "00:12:45").
  - Implementation: A `Stopwatch` or `Timer` in Flutter.
  - **Progress Bar**: A custom painter or linear progress indicator that fills as `currentTime` approaches `targetTime`.
  - **Alerts**: At 1 minute and 10 seconds before the `targetTime`, trigger a pulsing UI alert/vibration.
  - **Format**: `MM:SS` or `HH:MM:SS`.

### E. Theater Discovery (Nearby)
- **Integration**: Google Maps API or Flutter Map.
- **Logic**: Fetch user location (Geolocator). Display markers for nearby theaters.
- **UI**: Custom map style (minimalistic) with custom "Pop Art" markers.

### F. Admin Dashboard (Restricted to specific emails)
- **Access**: Logic check: `if (user.email == 'admin@example.com')`.
- **Features**: 
  - List all movies.
  - Form to add new movies (Title, Year, Duration, Genre, Description, Image URL, Title Card Timestamp).
  - Delete/Update existing movies.

### G. User Profile
- **Stats**: Count of movies tracked, comments made, and ratings given.
- **Settings**: Logout, Profile Image upload (Firebase Storage).

## 4. Backend Architecture (Firebase)

### Firestore Schema:
- **`movies`**: `id, title, releaseYear, totalDuration, genre, description, titleCardTime (string), image (url), rating (number), isFeatured (bool)`
- **`users`**: `uid, name, email, photoURL, bio, createdAt`
- **`comments`**: `id, movieId, userId, userName, userPhoto, text, createdAt`
- **`ratings`**: `userId_movieId (composite key), userId, movieId, rating, createdAt`

## 5. Technical Requirements for Flutter Implementation
- **Architecture**: Clean Architecture or MVC.
- **State Management**: `Provider`, `Riverpod`, or `Bloc`.
- **Navigation**: Use `GoRouter` for deep linking (especially for movie details).
- **Animations**: Use `flutter_animate` or standard `ImplicitAnimations` for the pop-up effects and transitions.
- **Data Fetching**: Use `Cloud Firestore` with `StreamBuilder` for real-time comments.

## 6. Prompt for Antigravity (Copy/Paste this)
> "Act as a Senior Flutter Developer. I have a cinema movie tracker web app called Lumiere. I need you to convert the logic and UI provided in the 'prompt.md' file into a production-ready Flutter app. Ensure the Neo-Brutalist design (hard shadows, thick borders) is pixel-perfect. Use Firebase for backend and authentication. Priority is the Title Card Tracker logic and the high-contrast aesthetic. Start by setting up the theme and the Home screen."
