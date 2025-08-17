import axios from 'src/lib/axios';

/**
 * Fetches season information including total seasons and current season
 * @returns {Promise<{total_seasons: string[], current_season: string}>}
 */
export async function fetchSeasonInfo() {
  try {
    const response = await axios.get('/api/season/names');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch season info');
  }
}

/**
 * Fetches dates for a specific season
 * @param {string} seasonName - The name of the season to fetch dates for
 * @returns {Promise<string[]>} Array of formatted strings like "Week x (YYYY-MM-DD)"
 */
export async function fetchSeasonDates(seasonName, metricType) {
  try {
    const response = await axios.get(`/api/season/dates?season_name=${seasonName}&metric_type=${metricType}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch season dates');
  }
} 