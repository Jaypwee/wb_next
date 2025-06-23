import axios from 'src/lib/axios';

/**
 * Fetches all users from the API
 * @returns {Promise<Object>} The user data from the API
 */
export async function fetchAllUsers() {
  try {
    const response = await axios.get('/api/user/all');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch users data');
  }
}

/**
 * Updates a user's infantry group status
 * @param {string} uid - The user's UID
 * @param {boolean} isInfantryGroup - Whether the user should be in the infantry group
 * @returns {Promise<Object>} The response from the API
 */
export async function updateUserInfantryGroup(uid, isInfantryGroup) {
  try {
    const response = await axios.put('/api/user/edit', { uid, isInfantryGroup });
    return response.data;
  } catch (error) {
    throw new Error('Failed to update user infantry group status');
  }
}

/**
 * Updates a user's labels
 * @param {string} uid - The user's UID
 * @param {Array<string>} labels - Array of label strings to set for the user
 * @returns {Promise<Object>} The response from the API
 */
export async function updateUserLabels(uid, labels) {
  try {
    const response = await axios.put('/api/user/edit', { uid, labels });
    return response.data;
  } catch (error) {
    throw new Error('Failed to update user labels');
  }
} 