import axios from 'src/lib/axios';

/**
 * Fetches the leadership data from the API
 * @returns {Promise<Object>} The leadership object from the API
 */
export async function fetchLeadership() {
  try {
    const response = await axios.get('/api/leadership');
    return response.data.leadership;
  } catch (error) {
    throw new Error('Failed to fetch leadership data');
  }
}

/**
 * Updates the leadership data in the home collection
 * @param {Object} leadership - The leadership object to update
 * @returns {Promise<Object>} The response from the API
 */
export async function updateLeadership(leadership) {
  try {
    const response = await axios.put('/api/leadership', { leadership });
    return response.data;
  } catch (error) {
    throw new Error('Failed to update leadership data');
  }
}
