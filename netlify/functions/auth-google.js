/**
 * Netlify Function for Google OAuth Authentication
 * Replaces Flask /api/auth/google endpoint
 */

const { OAuth2Client } = require('google-auth-library');
const { getCorsHeaders, handleCorsPreflightRequest } = require('./utils/cors');
const { validateServiceKeyConfig, getSupabaseHeaders, getSupabaseUrl } = require('./utils/supabase');
const { isValidCredential } = require('./utils/validation');
const { createErrorResponse, ErrorMessages } = require('./utils/errors');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

// Google OAuth client
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Generate a unique username with timestamp and random suffix
 * More robust than simple random suffix to avoid collisions
 * @param {string} email - User's email address
 * @returns {string} Generated username
 */
const generateUsername = (email) => {
  const base = email.split('@')[0].slice(0, 32); // Limit base to 32 chars to ensure username ≤ 50 chars
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 7);
  return `${base}_${timestamp}${random}`;
};

exports.handler = async (event, context) => {
  const requestOrigin = event.headers.origin || event.headers.Origin || '';
  const corsHeaders = getCorsHeaders(requestOrigin, ['POST', 'OPTIONS']);

  // Handle CORS preflight
  const preflightResponse = handleCorsPreflightRequest(event, ['POST', 'OPTIONS']);
  if (preflightResponse) {
    return preflightResponse;
  }

  if (event.httpMethod !== 'POST') {
    return createErrorResponse(405, ErrorMessages.METHOD_NOT_ALLOWED, corsHeaders);
  }

  // Validate Supabase configuration (including SERVICE_KEY since we create users)
  const configValidation = validateServiceKeyConfig();
  if (!configValidation.isValid) {
    return createErrorResponse(500, ErrorMessages.CONFIGURATION_ERROR, corsHeaders);
  }

  const SUPABASE_URL = getSupabaseUrl();

  try {
    const { credential } = JSON.parse(event.body);

    // Validate credential format
    if (!isValidCredential(credential)) {
      return createErrorResponse(400, ErrorMessages.INVALID_CREDENTIAL, corsHeaders);
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
    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}`, {
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
      const usernameCheckResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${encodeURIComponent(username)}`, {
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
      console.error('Failed to create user:', createUserResponse.status);
      return createErrorResponse(500, ErrorMessages.SERVER_ERROR, corsHeaders);
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
    return createErrorResponse(500, ErrorMessages.SERVER_ERROR, corsHeaders, error);
  }
};