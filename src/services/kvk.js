import axios from 'src/lib/axios';

export const CHART_SERIES = {
  MERITS: {
    name: 'metrics.dataGrid.merits',
    key: 'merits',
  },
  UNITS_DEAD: {
    name: 'metrics.series.unitsDead',
    key: 'unitsDead',
  },
  MANA_SPENT: {
    name: 'metrics.series.manaSpent',
    key: 'manaSpent',
  },
};


// ----------------------------------------------------------------------

/**
 * Fetches KvK data from the API
 * @param {Object} params - The parameters for the API call
 * @param {string} params.seasonName - The season name
 * @param {string} params.startDate - The start date
 * @param {string} params.endDate - Optional end date for comparison
 * @returns {Promise<Object>} The KvK data
 */
export async function fetchKvkData({ seasonName, startDate, endDate }) {
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
    const response = await axios.get(`/api/metrics/kvk?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch KvK data');
  }
} 

/**
 * Formats the API response data for the area chart
 * @param {Object} params - The parameters for formatting
 * @param {Object} params.data - The API response data with start, dates, and final
 * @param {string} params.type - The chart series type (key from CHART_SERIES)
 * @returns {Object} The formatted chart data for ApexChart area chart
 */
export function formatAreaChartData({ data, type }) {
  const seriesConfig = CHART_SERIES[type];
  if (!seriesConfig) {
    throw new Error(`Invalid chart series type: ${type}`);
  }

  // Filter out 'start' and create categories (dates and 'final')
  const entries = Object.entries(data).filter(([key]) => key !== 'start');
  
  // Sort entries to put dates in chronological order, with 'final' at the end
  const sortedEntries = entries.sort(([keyA], [keyB]) => {
    if (keyA === 'final') return 1;
    if (keyB === 'final') return -1;
    return new Date(keyA) - new Date(keyB);
  });

  // Extract categories and use raw values from API
  const categories = sortedEntries.map(([key]) => key);
  const seriesData = sortedEntries.map(([, value]) => value[seriesConfig.key] || 0);

  return {
    title: 'KvK Progress',
    subheader: `${seriesConfig.name} progression over time`,
    categories,
    series: [{
      name: seriesConfig.name,
      data: seriesData,
    }],
  };
}