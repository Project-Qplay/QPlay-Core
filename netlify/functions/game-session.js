/**
 * Netlify Function for Game Session Management
 * Replaces Flask game session endpoints
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS'
};

// Supabase helpers
const getSupabaseHeaders = () => ({
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
});

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  const path = event.path;
  const method = event.httpMethod;

  try {
    // Start game session
    if (path.includes('/game/start') && method === 'POST') {
      const { user_id, difficulty = 'easy' } = JSON.parse(event.body);

      const gameSession = {
        user_id: user_id,
        started_at: new Date().toISOString(),
        difficulty: difficulty,
        current_room: 'superposition',
        is_completed: false,
        room_times: {},
        room_attempts: {}
      };

      const response = await fetch(`${SUPABASE_URL}/rest/v1/game_sessions`, {
        method: 'POST',
        headers: getSupabaseHeaders(),
        body: JSON.stringify(gameSession)
      });

      if (response.ok) {
        const sessions = await response.json();
        const session = sessions[0] || { ...gameSession, id: `demo-session-${Date.now()}` };
        
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            session: session
          })
        };
      } else {
        // Fallback session
        const session = { ...gameSession, id: `demo-session-${Date.now()}` };
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            session: session
          })
        };
      }
    }

    // Complete game session
    if (path.includes('/game/complete') && method === 'POST') {
      const {
        user_id,
        session_id,
        completion_time = 300,
        total_score = 1000,
        difficulty = 'easy',
        rooms_completed = 1,
        hints_used = 0,
        current_games_completed = 0,
        current_total_score = 0,
        current_total_playtime = 0
      } = JSON.parse(event.body);

      // Update user stats
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${user_id}`, {
          method: 'PATCH',
          headers: getSupabaseHeaders(),
          body: JSON.stringify({
            games_completed: current_games_completed + 1,
            total_score: current_total_score + total_score,
            total_playtime: current_total_playtime + completion_time,
            last_login: new Date().toISOString()
          })
        });
      } catch (error) {
        console.warn('Failed to update user stats:', error);
      }

      // Create leaderboard entry
      const leaderboardEntry = {
        user_id: user_id,
        session_id: session_id,
        category: 'total_score',
        completion_time: completion_time,
        total_score: total_score,
        difficulty: difficulty,
        rooms_completed: rooms_completed,
        hints_used: hints_used,
        achieved_at: new Date().toISOString()
      };

      try {
        await fetch(`${SUPABASE_URL}/rest/v1/leaderboard_entries`, {
          method: 'POST',
          headers: getSupabaseHeaders(),
          body: JSON.stringify(leaderboardEntry)
        });
      } catch (error) {
        console.warn('Failed to create leaderboard entry:', error);
      }

      // Update game session as completed
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/game_sessions?id=eq.${session_id}`, {
          method: 'PATCH',
          headers: getSupabaseHeaders(),
          body: JSON.stringify({
            completed_at: new Date().toISOString(),
            total_time: completion_time,
            is_completed: true
          })
        });
      } catch (error) {
        console.warn('Failed to update game session:', error);
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          message: 'Game completed successfully!',
          score: total_score,
          time: completion_time,
          leaderboard_entry: leaderboardEntry
        })
      };
    }

    // Save game progress
    if (path.includes('/game/save-progress') && method === 'POST') {
      const {
        session_id,
        current_room,
        room_times = {},
        room_attempts = {},
        room_scores = {}
      } = JSON.parse(event.body);

      try {
        await fetch(`${SUPABASE_URL}/rest/v1/game_sessions?id=eq.${session_id}`, {
          method: 'PATCH',
          headers: getSupabaseHeaders(),
          body: JSON.stringify({
            current_room: current_room,
            room_times: room_times,
            room_attempts: room_attempts,
            room_scores: room_scores
          })
        });
      } catch (error) {
        console.warn('Failed to save progress:', error);
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          message: 'Progress saved'
        })
      };
    }

    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Endpoint not found' })
    };

  } catch (error) {
    console.error('Game session error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message })
    };
  }
};