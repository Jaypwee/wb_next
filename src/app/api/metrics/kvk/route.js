import { adminDb } from '../../../../lib/firebase-admin';
import { withAuth } from '../../../../lib/auth-middleware';
import { withCache, generateCacheKey } from '../../../../lib/cache';

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

    // Get the season document to read the allies field
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
        // Include all documents regardless of homeServer
        dateData[doc.id] = data;
      });
      
      return dateData;
    };

    // Get the start date data
    const startDateData = await getDateData(startDate);
    if (!startDateData) {
      return new Response(JSON.stringify({ error: `No data found for date: ${startDate}` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // If no endDate provided, return just the startDate data separated by allies/enemies
    if (!endDate) {
      const allies = {};
      const enemies = {};

      Object.keys(startDateData).forEach(userId => {
        const userData = startDateData[userId];
        if (alliedServers.includes(userData.homeServer)) {
          allies[userId] = userData;
        } else if (enemyServers.includes(userData.homeServer)) {
          enemies[userId] = userData;
        }
      });

      return new Response(JSON.stringify({
        id: seasonName,
        data: {
          allies,
          enemies
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the end date data
    const endDateData = await getDateData(endDate);
    if (!endDateData) {
      return new Response(JSON.stringify({ error: `No data found for date: ${endDate}` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Calculate differences for each user
    const alliesDifferences = {};
    const enemiesDifferences = {};
    const attributesToCompare = ['merits', 'unitsKilled', 'unitsDead', 'manaSpent', 't5KillCount'];

    for (const userId in endDateData) {
      if (startDateData[userId]) {
        const userDifferences = {
          name: endDateData[userId].name,
          currentPower: endDateData[userId].currentPower,
          highestPower: endDateData[userId].highestPower,
        };

        // Calculate differences for each attribute
        for (const attr of attributesToCompare) {
          const startValue = Number(String(startDateData[userId][attr]).replace(/,/g, ''));
          const endValue = Number(String(endDateData[userId][attr]).replace(/,/g, ''));
          userDifferences[attr] = endValue - startValue;
        }

        // Separate into allies and enemies based on homeServer
        if (alliedServers.includes(endDateData[userId].homeServer)) {
          alliesDifferences[userId] = userDifferences;
        } else {
          enemiesDifferences[userId] = userDifferences;
        }
      }
    }

    return new Response(JSON.stringify({
      id: seasonName,
      data: {
        allies: alliesDifferences,
        enemies: enemiesDifferences
      },
      startDate,
      endDate
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
