/**
 * Netlify Function for Game Session Management
 * Replaces Flask game session endpoints
 */

const { getCorsHeaders, handleCorsPreflightRequest } = require('./utils/cors');
const { validateSupabaseConfig, getSupabaseHeaders, getSupabaseUrl } = require('./utils/supabase');
const { isValidUserId, isValidSessionId } = require('./utils/validation');
const { createErrorResponse, ErrorMessages } = require('./utils/errors');

exports.handler = async (event, context) => {
  const requestOrigin = event.headers.origin || event.headers.Origin || '';
  const corsHeaders = getCorsHeaders(requestOrigin, ['GET', 'POST', 'PATCH', 'OPTIONS']);
  
  // Handle CORS preflight
  const preflightResponse = handleCorsPreflightRequest(event, ['GET', 'POST', 'PATCH', 'OPTIONS']);
  if (preflightResponse) {
    return preflightResponse;
  }

  // Validate Supabase configuration
  const configValidation = validateSupabaseConfig();
  if (!configValidation.isValid) {
    return createErrorResponse(500, ErrorMessages.CONFIGURATION_ERROR, corsHeaders);
  }

  const SUPABASE_URL = getSupabaseUrl();
  const path = event.path;
  const method = event.httpMethod;

  try {
    // Start game session
    if (path.includes('/game/start') && method === 'POST') {
      const { user_id, difficulty = 'easy' } = JSON.parse(event.body);

      // Validate user_id if provided
      if (user_id && !isValidUserId(user_id)) {
        return createErrorResponse(400, ErrorMessages.INVALID_USER_ID, corsHeaders);
      }

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

      // Validate user_id
      if (user_id && !isValidUserId(user_id)) {
        return createErrorResponse(400, ErrorMessages.INVALID_USER_ID, corsHeaders);
      }

      // Update user stats
      if (user_id) {
        try {
          await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(user_id)}`, {
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
      if (session_id && isValidSessionId(session_id)) {
        try {
          await fetch(`${SUPABASE_URL}/rest/v1/game_sessions?id=eq.${encodeURIComponent(session_id)}`, {
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

      if (session_id && isValidSessionId(session_id)) {
        try {
          await fetch(`${SUPABASE_URL}/rest/v1/game_sessions?id=eq.${encodeURIComponent(session_id)}`, {
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

    return createErrorResponse(404, ErrorMessages.NOT_FOUND, corsHeaders);

  } catch (error) {
    console.error('Game session error:', error);
    return createErrorResponse(500, ErrorMessages.SERVER_ERROR, corsHeaders, error);
  }
};