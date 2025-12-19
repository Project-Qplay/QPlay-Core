/**
 * Supabase Configuration and Helpers Module
 * Provides secure Supabase client configuration with validation
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

/**
 * Validate that required Supabase environment variables are configured
 * @returns {Object} Validation result with isValid and error properties
 */
const validateSupabaseConfig = () => {
  if (!SUPABASE_URL) {
    console.error('Missing required environment variable: SUPABASE_URL');
    return { isValid: false, error: 'Service configuration error' };
  }

  if (!SUPABASE_ANON_KEY) {
    console.error('Missing required environment variable: SUPABASE_ANON_KEY');
    return { isValid: false, error: 'Service configuration error' };
  }

  return { isValid: true, error: null };
};

/**
 * Check if SERVICE_KEY is configured (for service-level operations)
 * @returns {boolean} True if SERVICE_KEY is available
 */
const hasServiceKey = () => {
  return !!SUPABASE_SERVICE_KEY;
};

/**
 * Validate that SERVICE_KEY is configured (call before using getSupabaseHeaders(true))
 * @returns {Object} Validation result with isValid and error properties
 */
const validateServiceKeyConfig = () => {
  const basicValidation = validateSupabaseConfig();
  if (!basicValidation.isValid) {
    return basicValidation;
  }

  if (!SUPABASE_SERVICE_KEY) {
    console.error('Missing required environment variable: SUPABASE_SERVICE_KEY');
    return { isValid: false, error: 'Service configuration error' };
  }

  return { isValid: true, error: null };
};

/**
 * Get Supabase headers for API requests
 * @param {boolean} useServiceKey - Whether to use the service key for elevated permissions
 * @returns {Object} Headers object for Supabase requests
 * @throws {Error} If required keys are not configured
 */
const getSupabaseHeaders = (useServiceKey = false) => {
  const key = useServiceKey ? SUPABASE_SERVICE_KEY : SUPABASE_ANON_KEY;

  if (!key) {
    const keyType = useServiceKey ? 'SUPABASE_SERVICE_KEY' : 'SUPABASE_ANON_KEY';
    console.error(`Missing required environment variable: ${keyType}`);
    throw new Error('Supabase key not configured');
  }

  return {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
};

/**
 * Get the Supabase URL
 * @returns {string} Supabase URL
 */
const getSupabaseUrl = () => {
  if (!SUPABASE_URL) {
    throw new Error('SUPABASE_URL not configured');
  }
  return SUPABASE_URL;
};

module.exports = {
  validateSupabaseConfig,
  validateServiceKeyConfig,
  hasServiceKey,
  getSupabaseHeaders,
  getSupabaseUrl
};

