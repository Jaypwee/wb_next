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
    const response = await axios.get(`/api/metrics/kvk${endDate ? '/season' : ''}?${params.toString()}`);
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

/**
 * Formats top300 data for pie chart by counting servers
 * @param {Array} top300Data - Array of objects with userId and server
 * @param {number} count - Optional count to limit the number of entries (default: all entries)
 * @returns {Object} Formatted pie chart data with categories and series
 */
export function formatTop300ForPieChart(top300Data, count) {
  if (!top300Data || !Array.isArray(top300Data)) {
    return { categories: [], series: [] };
  }

  console.log(top300Data);

  // Slice the data to the specified count if provided
  const slicedData = count ? top300Data.slice(0, count) : top300Data;

  // Count occurrences of each server
  const serverCounts = slicedData.reduce((acc, item) => {
    const server = item.server || 'Unknown';
    acc[server] = (acc[server] || 0) + 1;
    return acc;
  }, {});

  // Convert to categories and series arrays
  const categories = Object.keys(serverCounts);
  const series = Object.values(serverCounts);

  return {
    categories,
    series,
  };
}

/**
 * Fetches KvK overview data from the API
 * @param {Object} params - The parameters for the API call
 * @param {string} params.seasonName - The season name
 * @returns {Promise<Object>} The KvK overview data with chart data for merits, unitsDead, and manaSpent
 */
export async function fetchKvkOverviewData({ seasonName }) {
  // Build query parameters
  const params = new URLSearchParams({
    season_name: seasonName,
  });

  try {
    // Fetch data from API
    const response = await axios.get(`/api/metrics/kvk/overview?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch KvK overview data:', error);
    throw error;
  }
}