/**
 * CORS Configuration Module
 * Provides secure CORS headers with environment-aware origins
 */

// Get allowed origins from environment or use defaults
const getAllowedOrigins = () => {
  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
  }

  // Default allowed origins for development and production
  const defaults = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8888',
    'https://qplay.netlify.app',
    'https://quantum-escape.netlify.app'
  ];

  // Add any site URL from Netlify
  if (process.env.URL) {
    defaults.push(process.env.URL);
  }

  return defaults;
};

/**
 * Get CORS headers with proper origin validation
 * @param {string} requestOrigin - The origin from the request headers
 * @param {string[]} methods - Allowed HTTP methods
 * @returns {Object} CORS headers object
 */
const getCorsHeaders = (requestOrigin, methods = ['GET', 'POST', 'OPTIONS']) => {
  const allowedOrigins = getAllowedOrigins();

  // Check if the request origin is in the allowed list
  // If not allowed, return null origin to block the request
  const origin = allowedOrigins.includes(requestOrigin)
    ? requestOrigin
    : null;

  return origin
    ? {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': methods.join(', '),
      'Access-Control-Allow-Credentials': 'true'
    }
    : {
      'Access-Control-Allow-Methods': methods.join(', ')
    };
};

/**
 * Handle CORS preflight request
 * @param {Object} event - Netlify function event
 * @param {string[]} methods - Allowed HTTP methods
 * @returns {Object|null} Response object for OPTIONS requests, null otherwise
 */
const handleCorsPreflightRequest = (event, methods = ['GET', 'POST', 'OPTIONS']) => {
  if (event.httpMethod === 'OPTIONS') {
    const requestOrigin = event.headers.origin || event.headers.Origin || '';
    return {
      statusCode: 200,
      headers: getCorsHeaders(requestOrigin, methods),
      body: ''
    };
  }
  return null;
};

module.exports = {
  getCorsHeaders,
  handleCorsPreflightRequest,
  getAllowedOrigins
};
