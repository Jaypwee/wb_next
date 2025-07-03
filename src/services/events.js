import axios from 'src/lib/axios';

/**
 * Fetches all events from the schedule API
 * @returns {Promise<Array>} Array of events
 */
export async function fetchEvents() {
  try {
    const response = await axios.get('/api/season/schedule');
    return response.data.events || [];
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch events');
  }
}

/**
 * Saves events to the schedule API
 * @param {Array} events - Array of events to save
 * @returns {Promise<void>}
 */
export async function saveEvents(events) {
  try {
    await axios.post('/api/season/schedule', { events });
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to save events');
  }
} 