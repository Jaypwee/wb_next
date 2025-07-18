import { adminDb } from '../../../../lib/firebase-admin';
import { withAuth } from '../../../../lib/auth-middleware';
import { withCache, generateCacheKey } from '../../../../lib/cache';

async function getHandler(request) {
  try {
    // Get the search params from the URL
    const { searchParams } = new URL(request.url);
    const seasonName = searchParams.get('season_name');
    const startDate = searchParams.get('start_date');

    // Validate required parameters
    if (!seasonName || !startDate) {
      return new Response(JSON.stringify({ error: 'Missing required parameters: season_name and start_date' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the season document reference
    const seasonDocRef = adminDb.collection('sheets').doc(seasonName);

    // Get the season document to read the allies and enemies fields
    const seasonDoc = await seasonDocRef.get();
    if (!seasonDoc.exists) {
      return new Response(JSON.stringify({ error: 'Season document not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const seasonData = seasonDoc.data();
    const alliedServers = seasonData.allies || []; // Default to empty array if allies field doesn't exist
    const enemyServers = seasonData.enemies || []; // Default to empty array if enemies field doesn't exist
    const validServers = [...alliedServers, ...enemyServers]; // Combined list of valid servers

    // Helper function to get data from a date subcollection
    const getDateData = async (date) => {
      const dateCollectionRef = seasonDocRef.collection(date);
      const dateSnapshot = await dateCollectionRef.get();
      
      if (dateSnapshot.empty) {
        return null;
      }

      const dateData = {};
      const powerDistribution = {}; // Will be organized by server
      const totals = {};

      dateSnapshot.forEach(doc => {
        if (doc.id !== 'total') {
          const data = doc.data();
          
          // Only include users from valid servers (allies + enemies)
          if (data.homeServer && data.highestPower > 15000000 && validServers.includes(data.homeServer)) {
            dateData[doc.id] = data;
            
            // Calculate power distribution by server
            if (data.highestPower) {
              const server = data.homeServer;
              
              // Initialize server power distribution if not exists
              if (!powerDistribution[server]) {
                powerDistribution[server] = {
                  100: 0, // Below 100M
                  150: 0, // Below 150M
                  200: 0, // Below 200M
                  250: 0, // Below 250M
                  300: 0  // Above 250M
                };

                totals[server] = {
                  merits: 0,
                  unitsDead: 0,
                  unitsKilled: 0,
                  manaSpent: 0
                };
              }
              
              const powerValue = Number(String(data.highestPower).replace(/,/g, ''));
              const powerInMillions = powerValue / 1000000;
              
              if (powerInMillions < 100) {
                powerDistribution[server][100]++;
              } else if (powerInMillions < 150) {
                powerDistribution[server][150]++;
              } else if (powerInMillions < 200) {
                powerDistribution[server][200]++;
              } else if (powerInMillions < 250) {
                powerDistribution[server][250]++;
              } else {
                powerDistribution[server][300]++;
              }

              totals[server].merits += data.merits || 0;
              totals[server].unitsDead += data.unitsDead || 0;
              totals[server].unitsKilled += data.unitsKilled || 0;
              totals[server].manaSpent += data.manaSpent || 0;
            }
          }
        }
      });
      
      return { dateData, powerDistribution, totals };
    };

    // Get the start date data
    const startDateResult = await getDateData(startDate);
    if (!startDateResult) {
      return new Response(JSON.stringify({ error: `No data found for date: ${startDate}` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const { dateData: startDateData, powerDistribution: startPowerDistribution, totals } = startDateResult;

    // Transform powerDistribution into chart format
    const transformPowerDistributionToChart = (powerDist) => {
      const powerKeys = [100, 150, 200, 250, 300];
      
      const servers = Object.keys(powerDist);
      const chartsByRange = {};
      
      // Create a chart for each power range
      powerKeys.forEach(rangeKey => {
        const categories = servers;
        const series = servers.map(server => powerDist[server][rangeKey] || 0);
        
        chartsByRange[rangeKey] = {
          categories,
          series
        };
      });
      
      return chartsByRange;
    };

    const powerChartData = transformPowerDistributionToChart(startPowerDistribution);

    // Transform totals into chart format
    const transformTotalsToChart = (totalsData) => {
      const metrics = ['merits', 'unitsKilled', 'unitsDead', 'manaSpent'];
      
      const servers = Object.keys(totalsData);
      const chartsByMetric = {};
      
      // Create a chart for each metric
      metrics.forEach(metric => {
        const categories = servers;
        const series = servers.map(server => totalsData[server][metric] || 0);
        
        chartsByMetric[metric] = {
          categories,
          series
        };
      });
      
      return chartsByMetric;
    };

    const totalsChartData = transformTotalsToChart(totals);

    // Return the start date data and power distribution
    return new Response(JSON.stringify({
      id: seasonName,
      data: startDateData,
      // powerDistribution: startPowerDistribution,
      powerChartData,
      totals,
      totalsChartData,
      allies: alliedServers,
      enemies: enemyServers,
      startDate
    }), {
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
    // Custom cache key generator for KvK metrics
    keyGenerator: (request) => {
      const { searchParams } = new URL(request.url);
      return generateCacheKey('metrics-kvk', {
        seasonName: searchParams.get('season_name'),
        startDate: searchParams.get('start_date')
      });
    },
    // Skip cache for requests with invalid parameters
    skipCache: (request) => {
      return true
      const { searchParams } = new URL(request.url);
      const seasonName = searchParams.get('season_name');
      const startDate = searchParams.get('start_date');
      
      return !seasonName || !startDate;
    }
  })
);
