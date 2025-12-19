/**
 * Netlify Function for User Signup
 * Replaces Flask /api/auth/signup endpoint
 */

const { getCorsHeaders, handleCorsPreflightRequest } = require('./utils/cors');
// Use validateServiceKeyConfig since we write to users table
const { validateServiceKeyConfig, getSupabaseHeaders, getSupabaseUrl } = require('./utils/supabase');
const { isValidEmail } = require('./utils/validation');
const { createErrorResponse, ErrorMessages } = require('./utils/errors');

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

  // Validate Supabase configuration (including SERVICE_KEY since we write to users table)
  const configValidation = validateServiceKeyConfig();
  if (!configValidation.isValid) {
    return createErrorResponse(500, ErrorMessages.CONFIGURATION_ERROR, corsHeaders);
  }

  const SUPABASE_URL = getSupabaseUrl();

  try {
    const { email, username, full_name } = JSON.parse(event.body);

    // Validate email format
    if (!isValidEmail(email)) {
      return createErrorResponse(400, ErrorMessages.INVALID_EMAIL, corsHeaders);
    }

    // Check if user already exists
    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}`, {
      headers: getSupabaseHeaders()
    });

    if (checkResponse.ok) {
      const existingUsers = await checkResponse.json();
      if (existingUsers.length > 0) {
        return createErrorResponse(400, ErrorMessages.USER_EXISTS, corsHeaders);
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

    // Create user with service key (required for writing to users table)
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: 'POST',
      headers: getSupabaseHeaders(true),
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      console.error('Failed to create user:', response.status);
      return createErrorResponse(500, ErrorMessages.SERVER_ERROR, corsHeaders);
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
    return createErrorResponse(500, ErrorMessages.SERVER_ERROR, corsHeaders, error);
  }
};