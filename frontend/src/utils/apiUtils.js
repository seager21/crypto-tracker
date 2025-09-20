/**
 * Enhanced fetch function with timeout and retry capabilities
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 * @param {number} retries - Number of retries on failure
 * @returns {Promise<Response>} - Fetch response
 */
export async function fetchWithRetry(url, options = {}, timeout = 8000, retries = 3) {
  // Create an AbortController to handle the timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Add the signal to the options
  const fetchOptions = {
    ...options,
    signal: controller.signal,
    headers: {
      ...options.headers,
      'Cache-Control': 'no-cache',
    },
  };

  let lastError;

  // Try the fetch with exponential backoff
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return response;
    } catch (error) {
      lastError = error;

      // Don't retry if it was a user abort
      if (error.name === 'AbortError') {
        console.warn(`Request to ${url} timed out after ${timeout}ms`);
        if (i === retries - 1) break;
      }

      // Calculate exponential backoff delay (with jitter)
      const delay = Math.min(1000 * Math.pow(2, i) + Math.random() * 1000, 10000);
      console.warn(`Fetch attempt ${i + 1} failed for ${url}. Retrying in ${delay}ms...`);

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // Clean up the timeout if we exit the loop
  clearTimeout(timeoutId);

  // All retries failed
  console.error(`All ${retries} fetch attempts failed for ${url}`, lastError);
  throw lastError;
}

/**
 * Health check function to verify API connection
 * @returns {Promise<boolean>} - True if API is available
 */
export async function checkApiConnection() {
  try {
    const response = await fetchWithRetry('/api/health', {}, 3000, 1);
    return response.ok;
  } catch (error) {
    console.warn('API health check failed:', error);
    return false;
  }
}

/**
 * Get cryptocurrency data with connection handling
 * @param {string} endpoint - API endpoint to call
 * @returns {Promise<Object>} - API response data
 */
export async function getCryptoData(endpoint) {
  try {
    const response = await fetchWithRetry(`/api${endpoint}`, {}, 8000, 3);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching crypto data from ${endpoint}:`, error);
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
}
