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

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || (endDate && !dateRegex.test(endDate))) {
      return new Response(JSON.stringify({ error: 'Invalid date format. Please use YYYY-MM-DD' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the sheet document by ID
    const sheetDoc = await adminDb.collection('sheets').doc(seasonName).get();

    if (!sheetDoc.exists) {
      return new Response(JSON.stringify({ error: 'No sheet found with the provided season name' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sheetData = sheetDoc.data();

    // If no endDate provided, return just the startDate data
    if (!endDate) {
      return new Response(JSON.stringify({
        id: sheetDoc.id,
        data: sheetData.individual?.[startDate]
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get both start and end date data
    const startDateData = sheetData.individual?.[startDate];
    const endDateData = sheetData.individual?.[endDate];

    console.log('in route')

    if (!startDateData || !endDateData) {
      return new Response(JSON.stringify({ error: 'Data not found for one or both dates' }), {
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
        console.log(differences[userId]);

        // Calculate differences for each attribute
        for (const attr of attributesToCompare) {
          const startValue = Number(String(startDateData[userId][attr]).replace(/,/g, ''));
          const endValue = Number(String(endDateData[userId][attr]).replace(/,/g, ''));
          differences[userId][attr] = endValue - startValue;
        }
      }
    }

    return new Response(JSON.stringify({
      id: sheetDoc.id,
      data: differences,
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

