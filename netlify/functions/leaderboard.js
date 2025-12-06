/**
 * Netlify Function for Leaderboard Management
 * Replaces Flask leaderboard endpoints
 */

const { getCorsHeaders, handleCorsPreflightRequest } = require('./utils/cors');
const { validateSupabaseConfig, getSupabaseHeaders, getSupabaseUrl } = require('./utils/supabase');
const { createErrorResponse, ErrorMessages } = require('./utils/errors');

/**
 * Enrich leaderboard with user data using batch fetch
 * Optimized to avoid N+1 query pattern
 */
const enrichLeaderboardWithUserData = async (leaderboardData, SUPABASE_URL) => {
  if (leaderboardData.length === 0) {
    return [];
  }

  try {
    // Batch fetch all user data in a single query
    const userIds = leaderboardData.map(entry => entry.user_id).filter(Boolean);
    if (userIds.length === 0) {
      return leaderboardData.map((entry, index) => ({ ...entry, rank: index + 1 }));
    }

    // Encode each user ID individually before joining
    const userIdsParam = userIds.map(id => encodeURIComponent(id)).join(',');
    const userResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/users?id=in.(${userIdsParam})&select=id,username,full_name`,
      { headers: getSupabaseHeaders() }
    );

    if (userResponse.ok) {
      const users = await userResponse.json();
      const userMap = users.reduce((acc, user) => ({ ...acc, [user.id]: user }), {});

      return leaderboardData.map((entry, index) => ({
        ...entry,
        rank: index + 1,
        username: userMap[entry.user_id]?.username,
        full_name: userMap[entry.user_id]?.full_name
      }));
    }
  } catch (error) {
    console.warn('Failed to fetch user data for leaderboard:', error);
  }

  // Fallback: return leaderboard without user enrichment
  return leaderboardData.map((entry, index) => ({
    ...entry,
    rank: index + 1
  }));
};

// Demo data fallback
const getDemoScoreLeaderboard = () => ([
  { rank: 1, username: 'QuantumAlice', total_score: 4500, completion_time: 180, games_completed: 15 },
  { rank: 2, username: 'EntangleCharlie', total_score: 3200, completion_time: 200, games_completed: 12 },
  { rank: 3, username: 'SuperpositionBob', total_score: 2800, completion_time: 240, games_completed: 8 }
]);

const getDemoSpeedLeaderboard = () => ([
  { rank: 1, user_id: 'demo-user-1', username: 'SpeedyQuantum', full_name: 'Speedy Player', total_score: 1200, completion_time: 180, difficulty: 'hard' },
  { rank: 2, user_id: 'demo-user-2', username: 'FastAlice', full_name: 'Alice Cooper', total_score: 1000, completion_time: 220, difficulty: 'medium' },
  { rank: 3, user_id: 'demo-user-3', username: 'QuickBob', full_name: 'Bob Wilson', total_score: 800, completion_time: 260, difficulty: 'easy' }
]);

exports.handler = async (event, context) => {
  const requestOrigin = event.headers.origin || event.headers.Origin || '';
  const corsHeaders = getCorsHeaders(requestOrigin, ['GET', 'OPTIONS']);
  
  // Handle CORS preflight
  const preflightResponse = handleCorsPreflightRequest(event, ['GET', 'OPTIONS']);
  if (preflightResponse) {
    return preflightResponse;
  }

  if (event.httpMethod !== 'GET') {
    return createErrorResponse(405, ErrorMessages.METHOD_NOT_ALLOWED, corsHeaders);
  }

  // Validate Supabase configuration
  const configValidation = validateSupabaseConfig();
  if (!configValidation.isValid) {
    return createErrorResponse(500, ErrorMessages.CONFIGURATION_ERROR, corsHeaders);
  }

  const SUPABASE_URL = getSupabaseUrl();
  const path = event.path;
  const queryParams = event.queryStringParameters || {};
  const leaderboardType = queryParams.type || 'score';

  try {
    // Score-based leaderboard
    if (leaderboardType === 'score' || path.includes('/leaderboard/score')) {
      try {
        // Try to get real leaderboard from database
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/leaderboard_entries?category=eq.total_score&order=total_score.desc&limit=10`,
          { headers: getSupabaseHeaders() }
        );
        
        if (response.ok) {
          const leaderboardData = await response.json();
          
          if (leaderboardData.length > 0) {
            const enriched = await enrichLeaderboardWithUserData(leaderboardData, SUPABASE_URL);
            return {
              statusCode: 200,
              headers: corsHeaders,
              body: JSON.stringify({
                entries: enriched,
                type: 'score',
                source: 'database'
              })
            };
          }
        }
        
        // Fallback: Get users and create leaderboard from user stats
        const usersResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/users?order=total_score.desc&limit=10`,
          { headers: getSupabaseHeaders() }
        );
        
        if (usersResponse.ok) {
          const users = await usersResponse.json();
          if (users.length > 0) {
            const mockLeaderboard = users.map((user, index) => ({
              rank: index + 1,
              username: user.username || 'Unknown',
              full_name: user.full_name || '',
              total_score: user.total_score || 0,
              completion_time: user.best_completion_time,
              games_completed: user.games_completed || 0,
              quantum_mastery_level: user.quantum_mastery_level || 1
            }));
            
            return {
              statusCode: 200,
              headers: corsHeaders,
              body: JSON.stringify({
                entries: mockLeaderboard,
                type: 'score',
                source: 'user_stats'
              })
            };
          }
        }
        
      } catch (error) {
        console.warn('Database leaderboard failed:', error);
      }
      
      // Final fallback: demo data
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          entries: getDemoScoreLeaderboard(),
          type: 'score',
          source: 'demo'
        })
      };
    }

    // Speed-based leaderboard
    if (leaderboardType === 'speed' || path.includes('/leaderboard/speed')) {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/leaderboard_entries?category=eq.completion_time&order=completion_time.asc&limit=10`,
          { headers: getSupabaseHeaders() }
        );
        
        if (response.ok) {
          const leaderboardData = await response.json();
          
          if (leaderboardData.length > 0) {
            const enriched = await enrichLeaderboardWithUserData(leaderboardData, SUPABASE_URL);
            return {
              statusCode: 200,
              headers: corsHeaders,
              body: JSON.stringify({
                entries: enriched,
                type: 'speed',
                source: 'database'
              })
            };
          }
        }
      } catch (error) {
        console.warn('Database speed leaderboard failed:', error);
      }
      
      // Fallback: demo data
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          entries: getDemoSpeedLeaderboard(),
          type: 'speed',
          source: 'demo'
        })
      };
    }

    return createErrorResponse(404, ErrorMessages.NOT_FOUND, corsHeaders);

  } catch (error) {
    console.error('Leaderboard error:', error);
    return createErrorResponse(500, ErrorMessages.SERVER_ERROR, corsHeaders, error);
  }
};