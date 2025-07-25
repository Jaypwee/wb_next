import axios from 'src/lib/axios';

/**
 *  * Available metric series for the chart
 */
export const METRIC_SERIES = {
  MERITS: {
    name: 'metrics.dataGrid.merits',
    key: 'merits',
  },
  UNITS_KILLED: {
    name: 'metrics.series.unitsKilled',
    key: 'unitsKilled',
  },
  UNITS_DEAD: {
    name: 'metrics.series.unitsDead',
    key: 'unitsDead',
  },
  MANA_SPENT: {
    name: 'metrics.series.manaSpent',
    key: 'manaSpent',
  },
  T5_KILL_COUNT: {
    name: 'metrics.series.t5KillCount',
    key: 't5KillCount',
  },
};
/**
 * Fetches metrics data from the API with pre-formatted chart and grid data
 * @param {Object} params - The parameters for the API call
 * @param {string} params.seasonName - The season name
 * @param {string} params.startDate - The start date
 * @param {string} params.endDate - Optional end date for comparison
 * @returns {Promise<Object>} The complete API response with formatted data
 */
export async function fetchMetricsData({ seasonName, startDate, endDate }) {
  // Build query parameters
  const params = new URLSearchParams({
    season_name: seasonName,
    start_date: startDate,
  });
  if (endDate) {
    params.append('end_date', endDate);
  }

  try {
    // Fetch data from API
    const response = await axios.get(`/api/metrics/individual?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch metrics data');
  }
} 