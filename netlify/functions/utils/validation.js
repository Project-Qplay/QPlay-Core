/**
 * Input Validation Module
 * Provides validation utilities for API inputs
 */

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email format is valid
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate user ID format (UUID or alphanumeric with hyphens)
 * @param {string} userId - User ID to validate
 * @returns {boolean} True if user ID format is valid
 */
const isValidUserId = (userId) => {
  if (!userId || typeof userId !== 'string') {
    return false;
  }
  // Allow UUIDs and alphanumeric strings with hyphens and underscores
  const userIdRegex = /^[a-zA-Z0-9_-]+$/;
  return userIdRegex.test(userId) && userId.length <= 128;
};

/**
 * Validate credential string (JWT token format)
 * @param {string} credential - Credential to validate
 * @returns {boolean} True if credential format is valid
 */
const isValidCredential = (credential) => {
  if (!credential || typeof credential !== 'string') {
    return false;
  }
  // Basic check for non-empty string with reasonable length
  return credential.length > 0 && credential.length < 10000;
};

/**
 * Validate session ID format
 * @param {string} sessionId - Session ID to validate
 * @returns {boolean} True if session ID format is valid
 */
const isValidSessionId = (sessionId) => {
  if (!sessionId || typeof sessionId !== 'string') {
    return false;
  }
  // Allow UUIDs and demo session IDs
  const sessionIdRegex = /^[a-zA-Z0-9_-]+$/;
  return sessionIdRegex.test(sessionId) && sessionId.length <= 128;
};

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {boolean} True if username format is valid
 */
const isValidUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return false;
  }
  // Allow alphanumeric, underscores, and hyphens, 3-50 characters
  const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;
  return usernameRegex.test(username);
};

module.exports = {
  isValidEmail,
  isValidUserId,
  isValidCredential,
  isValidSessionId,
  isValidUsername
};
