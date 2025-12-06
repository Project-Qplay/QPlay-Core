/**
 * Error Handling Module
 * Provides secure error responses that don't expose internal details
 */

/**
 * Create a standardized error response
 * @param {number} statusCode - HTTP status code
 * @param {string} userMessage - User-friendly error message
 * @param {Object} headers - Response headers
 * @param {Error} [internalError] - Optional internal error for logging
 * @returns {Object} Netlify function response object
 */
const createErrorResponse = (statusCode, userMessage, headers, internalError = null) => {
  // Log internal error details for debugging (server-side only)
  if (internalError) {
    console.error('Internal error:', {
      message: internalError.message,
      stack: internalError.stack,
      statusCode
    });
  }
  
  return {
    statusCode,
    headers,
    body: JSON.stringify({
      success: false,
      error: userMessage
    })
  };
};

/**
 * Generic error messages for common scenarios
 */
const ErrorMessages = {
  VALIDATION_ERROR: 'Invalid input provided',
  AUTHENTICATION_ERROR: 'Authentication failed',
  NOT_FOUND: 'Resource not found',
  SERVER_ERROR: 'An error occurred. Please try again later.',
  METHOD_NOT_ALLOWED: 'Method not allowed',
  CONFIGURATION_ERROR: 'Service temporarily unavailable',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_USER_ID: 'Invalid user ID format',
  INVALID_CREDENTIAL: 'Invalid credential format',
  USER_EXISTS: 'User already exists',
  USER_NOT_FOUND: 'User not found'
};

module.exports = {
  createErrorResponse,
  ErrorMessages
};
