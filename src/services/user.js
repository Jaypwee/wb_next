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
 * Fetches user overview data from the API
 * @returns {Promise<Object>} The overview data from the API
 */
export async function fetchUserOverview() {
  try {
    const response = await axios.get('/api/user/overview');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch user overview data');
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

/**
 * Updates a user's profile information
 * @param {string} uid - The user's UID
 * @param {Object} profileData - Object containing mainTroops, nationality, or avatar fields
 * @returns {Promise<Object>} The response from the API
 */
export async function updateUserProfile(uid, profileData) {
  try {
    const response = await axios.put('/api/user/edit', { uid, ...profileData });
    return response.data;
  } catch (error) {
    throw new Error('Failed to update user profile');
  }
}



/**
 * Uploads user avatar to Firebase Storage and updates the user's avatarUrl
 * @param {string} uid - The user's UID (not used - server gets it from auth token)
 * @param {File} file - The avatar file to upload
 * @returns {Promise<Object>} The response from the API
 */
export async function uploadUserAvatar(uid, file) {
  try {
    // Create FormData to send file to API
    const formData = new FormData();
    formData.append('file', file);
    // Note: uid is not sent - server gets it from authenticated token

    // Send file to API route for server-side upload
    const response = await axios.put('/api/user/edit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw new Error('Failed to upload avatar');
  }
} 