/**
 * Netlify Function for User Signup
 * Replaces Flask /api/auth/signup endpoint
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  try {
    const { email, username, full_name } = JSON.parse(event.body);
    
    if (!email) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: 'Email is required'
        })
      };
    }

    // Check if user already exists
    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${email}`, {
      headers: getSupabaseHeaders()
    });

    if (checkResponse.ok) {
      const existingUsers = await checkResponse.json();
      if (existingUsers.length > 0) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({
            success: false,
            error: 'User already exists'
          })
        };
      }
    }

    const userData = {
      email: email,
      username: username || email.split('@')[0],
      full_name: full_name || '',
      created_at: new Date().toISOString(),
      is_verified: true,
      is_premium: false,
      total_playtime: 0,
      games_completed: 0,
      best_completion_time: null,
      total_score: 0,
      quantum_mastery_level: 1,
      is_active: true
    };

    // Create user
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: 'POST',
      headers: getSupabaseHeaders(),
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: `Failed to create user. Status: ${response.status}`
        })
      };
    }

    const createdUsers = await response.json();
    const user = createdUsers[0] || userData;

    // Create initial leaderboard entry
    const leaderboardEntry = {
      user_id: user.id,
      category: 'total_score',
      completion_time: null,
      total_score: 0,
      difficulty: 'easy',
      rooms_completed: 0,
      hints_used: 0,
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

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        message: 'Account created successfully!',
        user: user
      })
    };

  } catch (error) {
    console.error('Signup error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: `Signup failed: ${error.message}`
      })
    };
  }
};