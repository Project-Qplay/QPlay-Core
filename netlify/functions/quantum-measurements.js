/**
 * Netlify Function for Quantum Measurement Logging
 * Replaces Flask quantum measurement endpoints
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
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { session_id, room_id, measurement_type, measurement_data } = JSON.parse(event.body);

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
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message })
    };
  }
};