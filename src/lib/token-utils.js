import axios from './axios';
import { AUTH } from './firebase';

/**
 * Get a fresh ID token from Firebase Auth
 * @param {boolean} forceRefresh - Whether to force refresh the token
 * @returns {Promise<string>} The ID token
 */
export async function getIdToken(forceRefresh = false) {
  try {
    const user = AUTH.currentUser;
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    return await user.getIdToken(forceRefresh);
  } catch (error) {
    console.error('Error getting ID token:', error);
    throw error;
  }
}

/**
 * Refresh the axios authorization header with a fresh token
 * @returns {Promise<void>}
 */
export async function refreshAuthHeader() {
  try {
    const idToken = await getIdToken(true); // Force refresh
    axios.defaults.headers.common.Authorization = `Bearer ${idToken}`;
  } catch (error) {
    console.error('Error refreshing auth header:', error);
    // Remove authorization header if refresh fails
    delete axios.defaults.headers.common.Authorization;
    throw error;
  }
}

/**
 * Make an authenticated API request with automatic token refresh on 401
 * @param {Function} apiCall - The API call function
 * @param {number} retries - Number of retries (default: 1)
 * @returns {Promise<any>} The API response
 */
export async function makeAuthenticatedRequest(apiCall, retries = 1) {
  try {
    return await apiCall();
  } catch (error) {
    // If we get a 401 and have retries left, try refreshing the token
    if (error.response?.status === 401 && retries > 0) {
      try {
        await refreshAuthHeader();
        return await makeAuthenticatedRequest(apiCall, retries - 1);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        throw error;
      }
    }
    throw error;
  }
} 