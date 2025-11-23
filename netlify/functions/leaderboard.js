/**
 * Netlify Function for Leaderboard Management
 * Replaces Flask leaderboard endpoints
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

// Supabase helpers
const getSupabaseHeaders = () => ({
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json'
});

// Enrich leaderboard with user data
const enrichLeaderboardWithUserData = async (leaderboardData) => {
  const enriched = [];
  
  for (let i = 0; i < leaderboardData.length; i++) {
    const entry = { ...leaderboardData[i], rank: i + 1 };
    
    try {
      const userResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/users?id=eq.${entry.user_id}&select=username,full_name`,
        { headers: getSupabaseHeaders() }
      );
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData.length > 0) {
          entry.username = userData[0].username;
          entry.full_name = userData[0].full_name;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch user data for entry:', entry.user_id);
    }
    
    enriched.push(entry);
  }
  
  return enriched;
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
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

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
            const enriched = await enrichLeaderboardWithUserData(leaderboardData);
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
            const enriched = await enrichLeaderboardWithUserData(leaderboardData);
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

    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Leaderboard endpoint not found' })
    };

  } catch (error) {
    console.error('Leaderboard error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message })
    };
  }
};