import axios from 'src/lib/axios';

/**
 * Available metric series for the chart
 */
export const METRIC_SERIES = {
  MERITS: {
    name: 'metrics.dataGrid.merits',
    key: 'merits',
  },
  UNITS_KILLED: {
    name: 'T5 Units Killed',
    key: 'unitsKilled',
  },
  UNITS_DEAD: {
    name: 'Units Dead',
    key: 'unitsDead',
  },
  MANA_SPENT: {
    name: 'Mana Spent',
    key: 'manaSpent',
  },
  T5_KILL_COUNT: {
    name: 'T5 Kill Count',
    key: 't5KillCount',
  },
};

/**
 * Formats the API response data for the DataGrid
 * @param {Object} params - The parameters for formatting
 * @param {Object} params.data - The API response data
 * @param {string} params.type - The metric type (e.g., 'MERITS', 'UNITS_KILLED')
 * @returns {Array} The formatted data for DataGrid
 */
export function formatDataGridData({ data, type = 'MERITS' }) {
  // Get the metric configuration
  const metric = METRIC_SERIES[type];
  
  // Convert data object to array of entries for sorting
  const entries = Object.entries(data);

  // Sort entries based on the metric value
  const sortedEntries = entries.sort(([, a], [, b]) => {
    const aValue = a[metric.key] || 0;
    const bValue = b[metric.key] || 0;
    return bValue - aValue; // Sort in descending order
  });

  // Format data for DataGrid
  return sortedEntries.map(([userId, userData], index) => ({
    id: userId,
    icon: '', // Empty column for icons/images
    rank: index + 1,
    name: userData.name,
    value: (userData[metric.key] || 0).toLocaleString(),
    highestPower: (userData.highestPower || 0).toLocaleString(),
    currentPower: (userData.currentPower || userData.power || 0).toLocaleString(),
  }));
}

/**
 * Formats the API response data for the bar chart
 * @param {Object} params - The parameters for formatting
 * @param {Object} params.data - The API response data
 * @param {string} params.startDate - The start date
 * @param {string} params.endDate - Optional end date for comparison
 * @param {Array} params.series - Array of series to include in the chart
 * @returns {Object} The formatted chart data
 */
export function formatChartData({ data, startDate, endDate, type = 'MERITS' }) {
  // Convert data object to array of entries for sorting
  const entries = Object.entries(data);
  const series = [METRIC_SERIES[type]];

  // Sort entries based on the first series value
  const sortedEntries = entries.sort(([, a], [, b]) => {
    const aValue = a[series[0].key] || 0;
    const bValue = b[series[0].key] || 0;
    return bValue - aValue; // Sort in descending order
  });

  console.log(sortedEntries);

  // Extract sorted categories (using names) and create series data
  const categories = sortedEntries.map(([, userData]) => userData.name);
  const seriesData = series.map(metric => ({
    name: metric.name,
    data: sortedEntries.map(([, userData]) => userData[metric.key] || 0),
  }));

  return {
    title: endDate ? 'Metrics Comparison' : 'Metrics Overview',
    subheader: endDate 
      ? `Comparing data from ${startDate} to ${endDate}`
      : `Data for ${startDate}`,
    categories,
    series: seriesData,
  };
}

/**
 * Fetches metrics data from the API and formats it for the chart
 * @param {Object} params - The parameters for the API call
 * @param {string} params.seasonName - The season name
 * @param {string} params.startDate - The start date
 * @param {string} params.endDate - Optional end date for comparison
 * @param {Array} params.series - Optional array of series to include in the chart
 * @returns {Promise<Object>} The formatted chart data
 */
export async function fetchMetricsData({ seasonName, startDate, endDate, series }) {
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