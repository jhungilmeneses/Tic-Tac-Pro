# Tic-Tac-Pro# 🎮 Tic-Tac-Toe Pro: Infinite & Online Multiplayer

A premium, highly interactive Tic-Tac-Toe application that redefines the classic game with **Infinite Mode**, **adaptive AI difficulty scaling**, **custom theme engines**, a **Web Audio API synthesizer**, and a **real-time Flask backend** for user accounts, persistence, and online party synchronization.

---

## ✨ Features & Game Functions

### 1. Game Modes
*   **Classic Mode**: The traditional 3x3 Tic-Tac-Toe. Align 3 of your symbols vertically, horizontally, or diagonally to win.
*   **Infinite Mode (3-Move Limit)**: A dynamic, high-stakes variation where each player is limited to **3 moves on the board at any time**. When a player makes their 4th move, the oldest move they placed is automatically cleared. This prevents stalemates/draws and forces deep tactical thinking!

### 2. Match Types
*   **Local PvP (Player vs. Player)**: Play against a friend on the same device. Customize names, select unique avatars, and track win streaks.
*   **Player vs. AI (PvA)**: Battle against an adaptive AI algorithm.
    *   **3 Difficulties**: `Easy`, `Medium`, and `Hard`.
    *   **Adaptive Intelligence (Levels 1–5)**: Winning matches increases your progress level. As you progress, the AI's mistake probability decreases.
    *   **Heuristic Engine**: When not making mistakes, the AI executes tactical checks: checks for winning moves, blocks opponent wins, prioritizes the center, takes corners, or plays randomly.
*   **Online Party Rooms**: Create or join online matches via a unique **6-digit alphanumeric party code**. Game states, player actions, names, avatars, and streaks are fully synchronized in real-time between clients through the backend API.

### 3. Custom Themes & Personalization
Choose from **11 hand-crafted visual themes** with custom-curated color palettes, light/dark mode compliance, and specific Lucide avatar sets:
*   **Modern** (Default: Slate, Indigo/Rose symbols with user/smile avatars)
*   **Cyber** (Felt neon, Cyan/Fuchsia symbols with terminal/bot avatars)
*   **Fantasy** (Warm amber, Purple/Gold symbols with crown/gem avatars)
*   **Pre-Historic** (Stone hues, Orange/Brown symbols with bone/leaf avatars)
*   **Underwater** (Cool blue, Teal/Aqua symbols with fish/anchor avatars)
*   **Birthday** (Festive pink, Yellow symbols with cake/cherry avatars)
*   **Halloween** (Spooky orange/slate, Purple symbols with ghost/skull avatars)
*   **Christmas** (Emerald/Red colors with snowflake/bell avatars)
*   **Easter** (Spring green, Pink/Blue symbols with rabbit/egg avatars)
*   **Military** (Tactical stone/lime, Shield/Crosshair avatars)
*   **Racing** (Monochrome/Red flags, Car/Timer avatars)

### 4. Dynamic Web Audio Engine
The application uses the browser's **Web Audio API** to synthesize audio on the fly. No static audio file downloads are required!
*   **Move Sound Effects**: Different frequencies for `X` and `O` inputs.
*   **Ambiance Synthesizer**: Low-frequency synthesizer drone (`110Hz`) modulated by a low-frequency oscillator (LFO) for deep atmospheric texture.
*   **Mute & Volume Control**: Independent master volume controls with realtime analyser integration.
*   **Sound Visualizer**: A frequency visualizer component drawing live Waveform / DFT frequency bins on a canvas.

---

## 🛠 Tech Stack

### Frontend Tools & Libraries
*   **React 19**: Serves as the core UI rendering framework, managing component lifecycles, states, contexts, and views.
*   **TypeScript**: Ensures static typing and interface compliance across state parameters, components, and payload structures.
*   **Vite**: The build bundler and dev server that serves the frontend and handles routing proxies (`/api` proxy configuration).
*   **Tailwind CSS v4**: Implements utility styling, responsive layouts, hover states, and dynamic colors mapped to the 11 custom visual themes.
*   **Motion for React (Framer Motion)**: Powers smooth spring animations, modal triggers, slide-ins (like the sidebar), and coordinate updates during game sessions.
*   **Recharts**: Renders high-quality SVG charts showing score history, win-draw-loss trends, and performance stats.
*   **Canvas-Confetti**: Fires colorful particle bursts on client success when a round/match is won.
*   **Lucide React**: Provides standardized vector icons used for player avatars, mute states, difficulty flags, and settings icons.
*   **Web Audio API** (in `audio.ts`): Creates dynamic, synthesized game audio tones, background ambient drones, and audio analysers in real-time without relying on static media files.

### Backend Tools & Libraries
*   **Flask 3.1.0 (Python)**: Powers the web API server, routing player moves, registration, profile settings, and party lobbies.
*   **Flask-CORS 5.0.1**: Manages Cross-Origin Resource Sharing, permitting the React web app on port 3000 to interact with the backend API on port 5000.
*   **Bcrypt 5.0.0**: Handles secure password hashing, salting, and verification during registration and login operations.
*   **SQLite3 & sqlite3 driver**: Acts as the persistent relational database storing user records, guest status, settings configurations, and matchmaking data.
*   **urllib.request & json** (in `test_api.py`): Facilitates script-based API integration testing to confirm endpoints perform correctly against the database.

---

## 📂 Project Structure

```text
├── backend/
│   ├── app.py             # Main Flask server, API endpoints & SQLite initialization
│   ├── requirements.txt   # Python package dependencies
│   ├── test_api.py        # Integration test script for backend API
│   └── tic_tac_toe.db     # SQLite Database (generated on startup)
├── src/
│   ├── components/        # Subcomponents
│   │   ├── AIProgressPanel.tsx       # AI level tracking panel
│   │   ├── AchievementsModal.tsx     # Player achievement rewards
│   │   ├── AudioSettingsModal.tsx    # Synthesizer settings controls
│   │   ├── AuthPage.tsx              # Login / Register forms
│   │   ├── AvatarSelectionModal.tsx  # Avatar selection grid
│   │   ├── MainMenu.tsx              # Landing navigation view
│   │   ├── MoveHistorySidebar.tsx    # Sidebar listing game move logs
│   │   ├── PartyPage.tsx             # Room manager & lobby syncing
│   │   ├── PvPMenu.tsx               # Local PvP configuration
│   │   ├── ScoreChart.tsx            # Statistical visual chart
│   │   ├── SoundVisualizer.tsx       # Canvas visualizer for the synthesizer
│   │   ├── Square.tsx                # Game cell with Framer Motion hover/effects
│   │   └── StatsModal.tsx            # Records/high scores viewer
│   ├── audio.ts           # Web Audio API Synth Engine
│   ├── App.tsx            # Core application router, state coordinator, & game loop
│   ├── themes.ts          # Config objects for the 11 custom visual themes
│   ├── types.ts           # Typescript typings for states, themes, & players
│   ├── utils.ts           # Win checker & heuristic minimax AI algorithms
│   ├── index.css          # Global CSS Tailwind directives
│   └── main.tsx           # React bootstrap entry point
├── package.json           # Frontend dependencies, configurations, and build scripts
└── vite.config.ts         # Vite bundler, plugin settings & dev server API proxy
```

---

## 💾 Database Schema

The database consists of **5 relational tables**:
1.  **`users`**: Stores user authentication data.
    *   `id` (PRIMARY KEY, AUTOINCREMENT)
    *   `username` (TEXT, UNIQUE, NOT NULL)
    *   `email` (TEXT, UNIQUE, NOT NULL)
    *   `password_hash` (TEXT, NOT NULL)
    *   `created_at` (TEXT, default CURRENT_TIMESTAMP)
2.  **`records`**: Stores scores/progress for authenticated accounts.
    *   `id` (PRIMARY KEY, AUTOINCREMENT)
    *   `user_id` (FOREIGN KEY referencing `users.id` ON DELETE CASCADE)
    *   `pvp_high` (INTEGER, default 0)
    *   `pva_high` (INTEGER, default 0)
    *   `ai_progress_easy`, `ai_progress_medium`, `ai_progress_hard` (INTEGER, default 0)
3.  **`guest_records`**: Stores scores/progress for guest accounts.
    *   `guest_id` (TEXT, UNIQUE, NOT NULL)
    *   `pvp_highscore`, `pva_highscore` (INTEGER, default 0)
    *   `ai_progress_easy`, `ai_progress_medium`, `ai_progress_hard` (INTEGER, default 0)
4.  **`settings`**: Visual and sound configurations.
    *   `user_id` / `guest_id` (identifiers linking to user accounts or guests)
    *   `theme_id` (TEXT, default 'modern')
    *   `color_mode` (TEXT, default 'dark')
    *   `muted` (INTEGER, 0 or 1)
    *   `avatar_x`, `avatar_o` (TEXT icons)
    *   `last_game_mode`, `last_ai_difficulty` (TEXT config cache)
5.  **`party_sessions`**: Session synchronization records for multiplayer party games.
    *   `code` (TEXT PRIMARY KEY)
    *   `leader_username`, `member_username` (TEXT)
    *   `leader_guest_id`, `member_guest_id` (TEXT)
    *   `status` (TEXT, e.g. `'waiting'`, `'ready'`, `'playing'`, `'closed'`)
    *   `game_state` (JSON string serialized game status: scores, squares, moveHistory, etc.)

---

## 🌐 API Endpoints

The Flask server listens on `http://localhost:5000` (proxied by Vite through `/api/*`):

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/health` | Backend status & timestamp check |
| **POST** | `/api/auth/register` | Register a new user account |
| **POST** | `/api/auth/login` | Login user and return user id |
| **GET** | `/api/records` | Fetch scores and AI progress for a user or guest ID |
| **POST** | `/api/records` | Save/update highscores and progress |
| **GET** | `/api/settings` | Retrieve user preferences (themes, mute status, etc.) |
| **POST** | `/api/settings` | Save visual settings & sound parameters |
| **POST** | `/api/party/create` | Create an online party session (returns 6-char room code) |
| **POST** | `/api/party/join` | Join an online party lobby using room code |
| **GET** | `/api/party/<code>` | Fetch details of a party session |
| **DELETE** | `/api/party/<code>` | Close and dismantle a party lobby |
| **POST** | `/api/party/<code>/start` | Transition room status to playing and initialize game state |
| **POST** | `/api/party/<code>/move` | Submit and validate a move in an active party match |
| **GET** | `/api/party/<code>/state` | Poll current game state during multiplayer play |
| **POST** | `/api/party/<code>/reset` | Restart the game board for a new round in the party room |
| **POST** | `/api/party/<code>/settings` | Adjust custom participant settings inside the lobby |

---

## 🚀 Getting Started & Local Setup

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [Python 3.8+](https://www.python.org/)

### Installation & Run

1.  **Clone the project** and navigate to the directory.
2.  **Install Frontend Dependencies**:
    ```bash
    npm install
    ```
3.  **Install Backend Dependencies**:
    ```bash
    cd backend
    pip install -r requirements.txt
    cd ..
    ```
4.  **Configuration**:
    *   Create a `.env.local` in the root folder based on `.env.example`.
5.  **Run the Flask Backend**:
    *   Start the server in a separate terminal:
    ```bash
    python backend/app.py
    ```
    *   *The server starts on `http://localhost:5000` and creates the `tic_tac_toe.db` file automatically.*
6.  **Run the React Development Server**:
    *   Start the Vite frontend in another terminal:
    ```bash
    npm run dev
    ```
    *   *Open `http://localhost:3000` in your web browser to play the game!*

---

## 🧪 Integration Testing

An automated verification test script for the API endpoints is provided in `backend/test_api.py`.

To execute it:
1. Ensure the Flask server is running on `http://localhost:5000`.
2. Run the script:
   ```bash
   python backend/test_api.py
   ```

   <img width="706" height="318" alt="image" src="https://github.com/user-attachments/assets/28672bcb-cd3e-4587-8384-5636c4646346" />
   <img width="200" height="285" alt="image" src="https://github.com/user-attachments/assets/fc49877d-aab8-4489-86fd-fb447a226f10" />


This will run through tests checking:
*   Endpoint health
*   User registration and database record insertion
*   Saving and loading high scores
*   Saving and loading client preferences
*   Final database sanity check
