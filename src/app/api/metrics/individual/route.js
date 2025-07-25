import { adminDb } from '../../../../lib/firebase-admin';
import { withAuth } from '../../../../lib/auth-middleware';
import { withCache, generateCacheKey } from '../../../../lib/cache';

/**
 * Available metric series for the chart
 */
const METRIC_SERIES = {
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
 * Available metric types that correspond to TAB_OPTIONS in the frontend
 */
const METRIC_TYPES = ['MERITS', 'UNITS_KILLED', 'UNITS_DEAD', 'MANA_SPENT'];

/**
 * Formats the API response data for the DataGrid
 * @param {Object} params - The parameters for formatting
 * @param {Object} params.data - The API response data
 * @param {string} params.type - The metric type (e.g., 'MERITS', 'UNITS_KILLED')
 * @returns {Array} The formatted data for DataGrid
 */
function formatDataGridData({ data, type = 'MERITS' }) {
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
 * @param {string} params.type - The metric type (e.g., 'MERITS', 'UNITS_KILLED')
 * @returns {Object} The formatted chart data
 */
function formatChartData({ data, startDate, endDate, type = 'MERITS' }) {
  // Convert data object to array of entries for sorting
  const entries = Object.entries(data);
  const series = [METRIC_SERIES[type]];

  // Sort entries based on the first series value
  const sortedEntries = entries.sort(([, a], [, b]) => {
    const aValue = a[series[0].key] || 0;
    const bValue = b[series[0].key] || 0;
    return bValue - aValue; // Sort in descending order
  });
  
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
 * Helper function to format data for all metric types
 * @param {Object} data - The raw data to format
 * @param {string} startDate - The start date
 * @param {string} endDate - Optional end date for comparison
 * @returns {Object} Formatted data organized by type
 */
function formatDataForAllTypes(data, startDate, endDate) {
  const formattedChartByType = {};
  const formattedGridByType = {};
  
  METRIC_TYPES.forEach((type) => {
    formattedChartByType[type] = formatChartData({
      data,
      startDate,
      endDate,
      type
    });
    
    formattedGridByType[type] = formatDataGridData({
      data,
      type
    });
  });

  return { formattedChartByType, formattedGridByType };
}

async function getHandler(request) {
  try {
    // Get the search params from the URL
    const { searchParams } = new URL(request.url);
    const seasonName = searchParams.get('season_name');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Validate required parameters
    if (!seasonName || !startDate) {
      return new Response(JSON.stringify({ error: 'Missing required parameters: season_name and start_date' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the season document reference
    const seasonDocRef = adminDb.collection('sheets').doc(seasonName);

    // Helper function to get data from a date subcollection
    const getDateData = async (date) => {
      const dateCollectionRef = seasonDocRef.collection(date);
      const dateSnapshot = await dateCollectionRef.get();
      
      if (dateSnapshot.empty) {
        return null;
      }

      const dateData = {};
      dateSnapshot.forEach(doc => {
        const data = doc.data();
        // Only include documents where homeServer equals 249
        if (data.homeServer === 249) {
          dateData[doc.id] = data;
        }
      });
      
      // Return null if no documents match the homeServer filter
      return Object.keys(dateData).length > 0 ? dateData : null;
    };

    // Get the start date data
    const startDateData = await getDateData(startDate);
    if (!startDateData) {
      return new Response(JSON.stringify({ error: `No data found for date: ${startDate}` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let finalData = startDateData;

    // If endDate is provided, calculate differences
    if (endDate) {
      // Get the end date data
      const endDateData = await getDateData(endDate);
      if (!endDateData) {
        return new Response(JSON.stringify({ error: `No data found for date: ${endDate}` }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Calculate differences for each user
      const differences = {};
      const attributesToCompare = ['merits', 'unitsKilled', 'unitsDead', 'manaSpent', 't5KillCount'];

      for (const userId in endDateData) {
        if (startDateData[userId]) {
          differences[userId] = {
            name: endDateData[userId].name,
            currentPower: endDateData[userId].currentPower,
            highestPower: endDateData[userId].highestPower,
          };

          // Calculate differences for each attribute
          for (const attr of attributesToCompare) {
            const startValue = Number(String(startDateData[userId][attr]).replace(/,/g, ''));
            const endValue = Number(String(endDateData[userId][attr]).replace(/,/g, ''));
            differences[userId][attr] = endValue - startValue;
          }
        }
      }

      finalData = differences;
    }

    // Format data for all metric types
    const { formattedChartByType, formattedGridByType } = formatDataForAllTypes(
      finalData,
      startDate,
      endDate
    );

    // Return response with both raw and formatted data
    const response = {
      id: seasonName,
      // data: finalData,
      startDate,
      endDate: endDate || null,
      // Add formatted data for charts and grids
      formattedChartData: formattedChartByType,
      formattedGridData: formattedGridByType
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Apply authentication and caching
export const GET = withAuth(
  withCache(getHandler, {
    // Custom cache key generator for metrics
    keyGenerator: (request) => {
      const { searchParams } = new URL(request.url);
      return generateCacheKey('metrics-individual', {
        seasonName: searchParams.get('season_name'),
        startDate: searchParams.get('start_date'),
        endDate: searchParams.get('end_date') || 'single'
      });
    },
    // Skip cache for requests with invalid parameters
    skipCache: (request) => {
      const { searchParams } = new URL(request.url);
      const seasonName = searchParams.get('season_name');
      const startDate = searchParams.get('start_date');
      
      return !seasonName || !startDate;
    }
  })
);

