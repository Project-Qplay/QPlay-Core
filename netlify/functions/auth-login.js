/**
 * Netlify Function for User Login
 * Replaces Flask /api/auth/login endpoint
 */

const { getCorsHeaders, handleCorsPreflightRequest } = require('./utils/cors');
const { validateSupabaseConfig, getSupabaseHeaders, getSupabaseUrl } = require('./utils/supabase');
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

  // Validate Supabase configuration
  const configValidation = validateSupabaseConfig();
  if (!configValidation.isValid) {
    return createErrorResponse(500, ErrorMessages.CONFIGURATION_ERROR, corsHeaders);
  }

  const SUPABASE_URL = getSupabaseUrl();

  try {
    const { email } = JSON.parse(event.body);
    
    // Validate email format
    if (!isValidEmail(email)) {
      return createErrorResponse(400, ErrorMessages.INVALID_EMAIL, corsHeaders);
    }

    // Find user by email
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}`, {
      headers: getSupabaseHeaders()
    });

    if (!response.ok) {
      console.error('Database query failed:', response.status);
      return createErrorResponse(500, ErrorMessages.SERVER_ERROR, corsHeaders);
    }

    const users = await response.json();
    
    if (users.length === 0) {
      return createErrorResponse(404, ErrorMessages.USER_NOT_FOUND, corsHeaders);
    }

    const user = users[0];

    // Update last login (optional)
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${user.id}`, {
        method: 'PATCH',
        headers: getSupabaseHeaders(),
        body: JSON.stringify({ last_login: new Date().toISOString() })
      });
    } catch (updateError) {
      console.warn('Failed to update last_login:', updateError);
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        user: user
      })
    };

  } catch (error) {
    console.error('Login error:', error);
    return createErrorResponse(500, ErrorMessages.SERVER_ERROR, corsHeaders, error);
  }
};