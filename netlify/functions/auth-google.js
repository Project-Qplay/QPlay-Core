/**
 * Netlify Function for Google OAuth Authentication
 * Replaces Flask /api/auth/google endpoint
 */

const { OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Google OAuth client
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Supabase helpers
const getSupabaseHeaders = (useServiceKey = false) => {
  const key = useServiceKey ? SUPABASE_SERVICE_KEY : SUPABASE_ANON_KEY;
  return {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
};

const generateUsername = (email) => {
  const base = email.split('@')[0];
  const suffix = Math.floor(1000 + Math.random() * 9000).toString();
  return `${base}_${suffix}`;
};

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
    const { credential } = JSON.parse(event.body);

    if (!credential) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'Missing credential' })
      };
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const full_name = payload.name || '';
    const avatar_url = payload.picture || '';

    // Check if user already exists
    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${email}`, {
      headers: getSupabaseHeaders()
    });

    if (checkResponse.ok) {
      const existingUsers = await checkResponse.json();
      if (existingUsers.length > 0) {
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            message: 'Google login successful',
            user: existingUsers[0]
          })
        };
      }
    }

    // Generate unique username
    let username = generateUsername(email);
    let usernameExists = true;
    while (usernameExists) {
      const usernameCheckResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${username}`, {
        headers: getSupabaseHeaders()
      });
      if (usernameCheckResponse.ok) {
        const usernameCheck = await usernameCheckResponse.json();
        usernameExists = usernameCheck.length > 0;
        if (usernameExists) {
          username = generateUsername(email);
        }
      } else {
        break;
      }
    }

    // Create new user
    const userData = {
      email: email,
      username: username,
      full_name: full_name,
      avatar_url: avatar_url,
      auth_provider: 'google',
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

    const createUserResponse = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: 'POST',
      headers: getSupabaseHeaders(true),
      body: JSON.stringify(userData)
    });

    if (!createUserResponse.ok) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: `Failed to create user. Status: ${createUserResponse.status}`
        })
      };
    }

    const createdUser = await createUserResponse.json();
    const user = createdUser[0];

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
        headers: getSupabaseHeaders(true),
        body: JSON.stringify(leaderboardEntry)
      });
    } catch (error) {
      console.warn('Failed to create leaderboard entry:', error);
    }

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        message: 'Google account created',
        user: user
      })
    };

  } catch (error) {
    console.error('Google auth error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: `Unexpected error: ${error.message}`
      })
    };
  }
};