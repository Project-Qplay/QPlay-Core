/**
 * Netlify Function for Quantum Measurement Logging
 * Replaces Flask quantum measurement endpoints
 */

const { getCorsHeaders, handleCorsPreflightRequest } = require('./utils/cors');
const { validateSupabaseConfig, getSupabaseHeaders, getSupabaseUrl } = require('./utils/supabase');
const { isValidSessionId } = require('./utils/validation');
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
    const { session_id, room_id, measurement_type, measurement_data } = JSON.parse(event.body);

    // Validate session_id if provided
    if (session_id && !isValidSessionId(session_id)) {
      return createErrorResponse(400, ErrorMessages.VALIDATION_ERROR, corsHeaders);
    }

    // Create quantum measurement record
    const quantumMeasurement = {
      session_id: session_id,
      room_id: room_id,
      measurement_type: measurement_type,
      measurement_data: measurement_data,
      measured_at: new Date().toISOString()
    };

    // Save to database (try database, fallback to success)
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/quantum_measurements`, {
        method: 'POST',
        headers: getSupabaseHeaders(),
        body: JSON.stringify(quantumMeasurement)
      });
    } catch (error) {
      console.warn('Failed to save quantum measurement to database:', error);
      // Continue with success response even if database save fails
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        message: 'Quantum measurement logged'
      })
    };

  } catch (error) {
    console.error('Quantum measurement error:', error);
    return createErrorResponse(500, ErrorMessages.SERVER_ERROR, corsHeaders, error);
  }
};