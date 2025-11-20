# Quantum Quest Backend

This is the backend API for Quantum Quest, built with Python Flask. It connects to Supabase for data storage and is deployed as Netlify Functions in the monorepo structure.

## Architecture

In the monorepo setup:
- Backend code lives in the `backend/` directory
- Netlify Functions in `netlify/functions/` proxy requests to this backend
- Everything deploys together on Netlify

## Local Development

### Prerequisites
- Python 3.11+
- pip

### Setup

1. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```

2. Create a `.env` file (use `backend/.env.example` as template):
   ```sh
   cp .env.example .env
   ```

3. Add your Supabase credentials to `.env`:
   ```
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-key
   GOOGLE_CLIENT_ID=your-google-client-id
   ```

4. Run the server:
   ```sh
   python production_server.py
   ```

The server will start on `http://localhost:8000`.

## API Endpoints

### Authentication
- `POST /api/auth/signup` — Register new user
- `POST /api/auth/signin` — User login
- `POST /api/auth/google` — Google OAuth sign-in/signup
- `GET /api/auth/user` — Get current user

### Game
- `GET /api/game/rooms` — Get available game rooms
- `POST /api/game/start` — Start a new game session
- `POST /api/game/complete` — Complete game and save score
- `POST /api/game/save-progress` — Save game progress

### Leaderboard
- `GET /api/leaderboard/score` — Score-based leaderboard
- `GET /api/leaderboard/speed` — Speed-based leaderboard

### Utilities
- `GET /` — Health check
- `GET /health` — Detailed health check
- `GET /api/test-supabase` — Test Supabase connection

## Deployment

This backend is deployed as Netlify Functions:
- Netlify automatically handles the serverless function deployment
- Environment variables are configured in Netlify dashboard
- No separate backend hosting required

## Database

Uses Supabase (PostgreSQL) for:
- User accounts and authentication
- Game sessions and progress
- Leaderboard entries
- Achievements

See `sample_data.sql` for database schema.

## Need Help?

Check the main README in the repository root for full setup instructions.
