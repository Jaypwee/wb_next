import { NextResponse } from 'next/server';

import { adminDb } from 'src/lib/firebase-admin';
import { withAuth } from 'src/lib/auth-middleware';
import { withCache, generateCacheKey } from 'src/lib/cache';

async function getHandler(request) {
  try {
    // Get the search params from the URL
    const { searchParams } = new URL(request.url);
    const seasonName = searchParams.get('season_name');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Validate required parameters
    if (!seasonName || !startDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: season_name and start_date' },
        { status: 400 }
      );
    }

    // Get the season document reference
    const seasonDocRef = adminDb.collection('sheets').doc(seasonName);

    // Get the season document to read the allies field
    const seasonDoc = await seasonDocRef.get();
    if (!seasonDoc.exists) {
      return NextResponse.json(
        { error: 'Season document not found' },
        { status: 404 }
      );
    }

    const seasonData = seasonDoc.data();
    const alliedServers = seasonData.allies || []; // Default to empty array if allies field doesn't exist
    const enemyServers = seasonData.enemies || []; // Default to empty array if enemies field doesn't exist
    const validServers = [...alliedServers, ...enemyServers];
    
    // Helper function to get data from a date subcollection
    const getDateData = async (date) => {
      if (!date) {
        return null;
      }
      console.log('getDateData', date);
      const dateCollectionRef = seasonDocRef.collection(date);
      const dateSnapshot = await dateCollectionRef.get();
      
      if (dateSnapshot.empty) {
        return null;
      }

      const dateData = {};
      dateSnapshot.forEach(doc => {
        if (doc.id !== 'total') {
          const data = doc.data();
          // Include all documents regardless of homeServer
          dateData[doc.id] = data;
        }
      });
      
      return dateData;
    };

    // Get the start date data
    const startDateData = await getDateData(startDate);
    if (!startDateData) {
      return NextResponse.json(
        { error: `No data found for date: ${startDate}` },
        { status: 404 }
      );
    }

    // Optionally get the end date data (when provided)
    let endDateData = null;
    if (endDate) {
      endDateData = await getDateData(endDate);
      if (!endDateData) {
        return NextResponse.json(
          { error: `No data found for date: ${endDate}` },
          { status: 404 }
        );
      }
    }

    // Build response data
    const differences = {};
    const attributesToCompare = ['merits', 'unitsKilled', 'unitsDead', 'manaSpent', 't5KillCount'];

    if (endDateData) {
      // Calculate differences for each user when end date is provided
      for (const userId in endDateData) {
        if (startDateData[userId] && validServers.includes(endDateData[userId].homeServer)) {
          const userDifferences = {
            name: endDateData[userId].name,
            currentPower: endDateData[userId].currentPower,
            highestPower: endDateData[userId].highestPower,
            homeServer: endDateData[userId].homeServer,
          };

          for (const attr of attributesToCompare) {
            const startValue = Number(String(startDateData[userId][attr]).replace(/,/g, ''));
            const endValue = Number(String(endDateData[userId][attr]).replace(/,/g, ''));
            userDifferences[attr] = endValue - startValue;
          }

          differences[userId] = userDifferences;
        }
      }
    } else {
      // Single-date mode: return values from the start date directly
      for (const userId in startDateData) {
        if (validServers.includes(startDateData[userId].homeServer)) {
          const userValues = {
            name: startDateData[userId].name,
            currentPower: startDateData[userId].currentPower,
            highestPower: startDateData[userId].highestPower,
            homeServer: startDateData[userId].homeServer,
          };

          for (const attr of attributesToCompare) {
            const value = Number(String(startDateData[userId][attr]).replace(/,/g, ''));
            userValues[attr] = value;
          }

          differences[userId] = userValues;
        }
      }
    }

    return NextResponse.json({
        id: seasonName,
        data: {
          differences,
          validServers,
        }
      });

  } catch (error) {
    console.error('Error in KVK season API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Apply authentication and caching
export const GET = withAuth(
  withCache(getHandler, {
    // Custom cache key generator for KvK season metrics
    keyGenerator: (request) => {
      const { searchParams } = new URL(request.url);
      return generateCacheKey('metrics-kvk-season-detailed', {
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
