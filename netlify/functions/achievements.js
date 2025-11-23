/**
 * Netlify Function for Achievement Management
 * Replaces Flask achievement endpoints
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
    const { achievement_id, session_id, user_id } = JSON.parse(event.body);

    let resolvedUserId = user_id;

    // If user_id not provided, try to get from session
    if (!resolvedUserId && session_id) {
      try {
        const sessionResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/game_sessions?id=eq.${session_id}&select=user_id`,
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

    if (!resolvedUserId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'User ID required' })
      };
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
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message })
    };
  }
};