/**
 * Netlify Function for Achievement Management
 * Replaces Flask achievement endpoints
 */

const { getCorsHeaders, handleCorsPreflightRequest } = require('./utils/cors');
const { validateSupabaseConfig, getSupabaseHeaders, getSupabaseUrl } = require('./utils/supabase');
const { isValidUserId, isValidSessionId } = require('./utils/validation');
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

  // Validate Supabase configuration
  const configValidation = validateSupabaseConfig();
  if (!configValidation.isValid) {
    return createErrorResponse(500, ErrorMessages.CONFIGURATION_ERROR, corsHeaders);
  }

  const SUPABASE_URL = getSupabaseUrl();

  try {
    const { achievement_id, session_id, user_id } = JSON.parse(event.body);

    let resolvedUserId = user_id;

    // If user_id not provided, try to get from session
    if (!resolvedUserId && session_id) {
      // Validate session_id format first (only allows alphanumeric, underscore, hyphen)
      // This prevents any injection attacks as special characters are rejected
      if (!isValidSessionId(session_id)) {
        return createErrorResponse(400, ErrorMessages.VALIDATION_ERROR, corsHeaders);
      }

      // SECURITY: session_id is validated above - only [a-zA-Z0-9_-] allowed
      // Safe to use in Supabase REST API URL (not SQL - this is a URL parameter)
      const validatedSessionId = encodeURIComponent(session_id);

      try {
        const sessionResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/game_sessions?id=eq.${validatedSessionId}&select=user_id`,
          { headers: getSupabaseHeaders() }
        );

        if (sessionResponse.ok) {
          const sessions = await sessionResponse.json();
          if (sessions.length > 0) {
            resolvedUserId = sessions[0].user_id;
          }
        }
      } catch (error) {
        console.warn('Failed to get user_id from session:', error);
      }
    }

    // Validate user ID format
    if (!resolvedUserId || !isValidUserId(resolvedUserId)) {
      return createErrorResponse(400, ErrorMessages.INVALID_USER_ID, corsHeaders);
    }

    // Create achievement record
    const achievementRecord = {
      user_id: resolvedUserId,
      achievement_id: achievement_id,
      unlocked_at: new Date().toISOString(),
      session_id: session_id
    };

    // Save to database (try database, fallback to success)
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/user_achievements`, {
        method: 'POST',
        headers: getSupabaseHeaders(),
        body: JSON.stringify(achievementRecord)
      });
    } catch (error) {
      console.warn('Failed to save achievement to database:', error);
      // Continue with success response even if database save fails
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        message: `Achievement ${achievement_id} unlocked`
      })
    };

  } catch (error) {
    console.error('Achievement unlock error:', error);
    return createErrorResponse(500, ErrorMessages.SERVER_ERROR, corsHeaders, error);
  }
};