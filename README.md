# Quantum Quest (QPlay-Core)

Quantum Quest is a fun quantum-themed game. This monorepo contains both the frontend (React) and backend (Python Flask) deployed together on Netlify.

---

## Project Structure

This is a monorepo with the following structure:
- `src/` — Frontend React application
- `backend/` — Python Flask backend API
- `netlify/functions/` — Netlify serverless functions
- `dist/` — Build output for deployment

---

## Deployment

This project is configured for **Netlify deployment** with integrated backend functions:

### Netlify Setup

1. **Connect your repository** to Netlify
2. **Build settings** (auto-configured via `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

3. **Environment variables** (configure in Netlify dashboard):
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-key
   GOOGLE_CLIENT_ID=your-google-client-id
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   ```

### How It Works

- Frontend and backend are deployed together on Netlify
- API requests (e.g., `/api/*`) are automatically proxied to serverless functions
- No separate backend deployment needed!

---

## Local Development

### 1. Prerequisites
- **Node.js** (for the frontend)
- **Python 3.11+** (for the backend)

### 2. Install Dependencies
```sh
npm install
cd backend && pip install -r requirements.txt
```

Or use the setup script:
```sh
npm run setup:complete
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:
```sh
cp .env.example .env
```

Edit `.env` and add your Supabase and Google OAuth credentials.

### 4. Run Development Servers

**Option A: Run both frontend and backend together**
```sh
npm run dev:full
```

**Option B: Run separately**

Backend (in one terminal):
```sh
npm run dev:backend
# or
cd backend && python production_server.py
```

Frontend (in another terminal):
```sh
npm run dev
```

Then open http://localhost:5173 in your browser.

---

## Building for Production

```sh
npm run build
```

This creates a `dist/` folder with the production-ready frontend.

---

## API Endpoints

The backend provides these main API endpoints:

- `/api/auth/signup` — User registration
- `/api/auth/signin` — User login
- `/api/auth/google` — Google OAuth authentication
- `/api/game/start` — Start a new game session
- `/api/game/complete` — Complete a game and save score
- `/api/leaderboard/score` — Get score-based leaderboard
- `/api/leaderboard/speed` — Get speed-based leaderboard

All endpoints are accessible at `/api/*` in both development and production.

---

## Architecture

### Monorepo Structure

This project uses a monorepo structure where:
- Frontend and backend share the same repository
- Netlify handles both static site hosting and serverless functions
- API requests are proxied through Netlify's redirect rules

### Benefits

- ✅ Single deployment process
- ✅ Unified version control
- ✅ No CORS issues (same origin)
- ✅ Simplified configuration
- ✅ Cost-effective (no separate backend hosting)

---

## Credits

- Cat 3D model used in the game: [LowPoly Cat Rig + Run Animation](https://sketchfab.com/3d-models/lowpoly-cat-rig-run-animation-c36df576c9ae4ed28e89069b1a2f427a) by Omabuarts Studio on Sketchfab

---