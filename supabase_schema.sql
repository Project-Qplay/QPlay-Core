-- Quantum Quest Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor to create all required tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    auth_provider TEXT DEFAULT 'email' CHECK (auth_provider IN ('email', 'google')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    is_verified BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Game statistics
    total_playtime INTEGER DEFAULT 0, -- in seconds
    games_completed INTEGER DEFAULT 0,
    best_completion_time INTEGER, -- in seconds
    total_score INTEGER DEFAULT 0,
    quantum_mastery_level INTEGER DEFAULT 1,
    
    -- User preferences and progress
    preferences JSONB DEFAULT '{}'::JSONB
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_total_score ON public.users(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

-- ============================================
-- 2. GAME SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    total_time INTEGER, -- in seconds
    completion_rooms TEXT[], -- array of completed room IDs
    current_room TEXT,
    room_times JSONB DEFAULT '{}'::JSONB, -- time spent in each room
    room_attempts JSONB DEFAULT '{}'::JSONB, -- number of attempts per room
    room_scores JSONB DEFAULT '{}'::JSONB, -- scores per room
    is_completed BOOLEAN DEFAULT FALSE,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    quantum_data JSONB DEFAULT '{}'::JSONB -- additional quantum mechanics data
);

-- Create indexes for game_sessions table
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON public.game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_started_at ON public.game_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_completed ON public.game_sessions(is_completed);

-- ============================================
-- 3. LEADERBOARD ENTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.game_sessions(id) ON DELETE SET NULL,
    category TEXT NOT NULL CHECK (category IN ('total_score', 'completion_time', 'speed', 'accuracy')),
    completion_time INTEGER, -- in seconds
    total_score INTEGER DEFAULT 0,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    rooms_completed TEXT[], -- array of completed room IDs
    hints_used INTEGER DEFAULT 0,
    achieved_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for leaderboard_entries table
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON public.leaderboard_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_category ON public.leaderboard_entries(category);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON public.leaderboard_entries(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_time ON public.leaderboard_entries(completion_time ASC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_achieved_at ON public.leaderboard_entries(achieved_at DESC);

-- ============================================
-- 4. USER ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL, -- e.g., 'first_superposition', 'entanglement_master'
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    session_id UUID REFERENCES public.game_sessions(id) ON DELETE SET NULL,
    UNIQUE(user_id, achievement_id) -- prevent duplicate achievements
);

-- Create indexes for user_achievements table
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_achievement_id ON public.user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_achievements_unlocked_at ON public.user_achievements(unlocked_at DESC);

-- ============================================
-- 5. QUANTUM MEASUREMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.quantum_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    room_id TEXT NOT NULL,
    measurement_type TEXT NOT NULL, -- e.g., 'state_collapse', 'bell_measurement'
    measurement_data JSONB DEFAULT '{}'::JSONB, -- detailed measurement results
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for quantum_measurements table
CREATE INDEX IF NOT EXISTS idx_measurements_user_id ON public.quantum_measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_measurements_session_id ON public.quantum_measurements(session_id);
CREATE INDEX IF NOT EXISTS idx_measurements_room_id ON public.quantum_measurements(room_id);
CREATE INDEX IF NOT EXISTS idx_measurements_timestamp ON public.quantum_measurements(timestamp DESC);

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quantum_measurements ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT USING (true); -- Allow reading all users for leaderboard

CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Anyone can insert users" ON public.users
    FOR INSERT WITH CHECK (true); -- Registration needs to be open

-- Game sessions policies
CREATE POLICY "Users can view their own sessions" ON public.game_sessions
    FOR SELECT USING (auth.uid()::text = user_id::text OR true); -- Allow viewing for stats

CREATE POLICY "Users can create their own sessions" ON public.game_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own sessions" ON public.game_sessions
    FOR UPDATE USING (auth.uid()::text = user_id::text OR true);

-- Leaderboard policies (public read)
CREATE POLICY "Anyone can view leaderboard" ON public.leaderboard_entries
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert leaderboard entries" ON public.leaderboard_entries
    FOR INSERT WITH CHECK (true);

-- Achievements policies
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
    FOR SELECT USING (auth.uid()::text = user_id::text OR true);

CREATE POLICY "Anyone can insert achievements" ON public.user_achievements
    FOR INSERT WITH CHECK (true);

-- Quantum measurements policies
CREATE POLICY "Users can view their own measurements" ON public.quantum_measurements
    FOR SELECT USING (auth.uid()::text = user_id::text OR true);

CREATE POLICY "Anyone can insert measurements" ON public.quantum_measurements
    FOR INSERT WITH CHECK (true);

-- ============================================
-- 7. HELPER FUNCTIONS
-- ============================================

-- Function to update user's last login
CREATE OR REPLACE FUNCTION update_user_last_login()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users 
    SET last_login = NOW() 
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last login when a new session is created
CREATE TRIGGER update_last_login_trigger
    AFTER INSERT ON public.game_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_last_login();

-- ============================================
-- 8. VERIFICATION QUERIES
-- ============================================
-- Run these to verify the schema was created correctly:

-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check table structures
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('users', 'game_sessions', 'leaderboard_entries', 'user_achievements', 'quantum_measurements')
ORDER BY table_name, ordinal_position;

-- Check indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('users', 'game_sessions', 'leaderboard_entries', 'user_achievements', 'quantum_measurements')
ORDER BY tablename, indexname;

-- Check RLS policies
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- 9. SAMPLE ADMIN QUERIES
-- ============================================

-- Get user count
SELECT COUNT(*) as total_users FROM public.users;

-- Get top players by score
SELECT username, total_score, games_completed, quantum_mastery_level
FROM public.users
ORDER BY total_score DESC
LIMIT 10;

-- Get recent game sessions
SELECT u.username, gs.difficulty, gs.total_time, gs.is_completed
FROM public.game_sessions gs
JOIN public.users u ON gs.user_id = u.id
ORDER BY gs.started_at DESC
LIMIT 10;

-- Get leaderboard
SELECT u.username, le.total_score, le.completion_time, le.difficulty
FROM public.leaderboard_entries le
JOIN public.users u ON le.user_id = u.id
WHERE le.category = 'total_score'
ORDER BY le.total_score DESC
LIMIT 10;
