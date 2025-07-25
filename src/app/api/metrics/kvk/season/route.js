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

    // Get the end date data
    const endDateData = await getDateData(endDate);
    if (!endDateData) {
      return NextResponse.json(
        { error: `No data found for date: ${endDate}` },
        { status: 404 }
      );
    }

    // Calculate differences for each user
    const alliesDifferences = {};
    const enemiesDifferences = {};
    const attributesToCompare = ['merits', 'unitsKilled', 'unitsDead', 'manaSpent', 't5KillCount'];

    const totalMetrics = {};

    validServers.forEach(server => {
      totalMetrics[server] = {
        powerLoss: 0,
        manaSpent: 0,
        merits: 0,
        unitsDead: 0,
        highestPower: 0,
      };
    });

    for (const userId in endDateData) {
      if (startDateData[userId] && validServers.includes(endDateData[userId].homeServer)) {
        const userDifferences = {
          name: endDateData[userId].name,
          currentPower: endDateData[userId].currentPower,
          highestPower: endDateData[userId].highestPower,
          homeServer: endDateData[userId].homeServer,
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

        totalMetrics[endDateData[userId].homeServer].highestPower += endDateData[userId].highestPower;
        totalMetrics[endDateData[userId].homeServer].powerLoss += endDateData[userId].currentPower - endDateData[userId].highestPower;
        totalMetrics[endDateData[userId].homeServer].manaSpent += (endDateData[userId].manaSpent || 0) - (startDateData[userId].manaSpent || 0);
        totalMetrics[endDateData[userId].homeServer].merits += (endDateData[userId].merits || 0) - (startDateData[userId].merits || 0);
        totalMetrics[endDateData[userId].homeServer].unitsDead += (endDateData[userId].unitsDead || 0) - (startDateData[userId].unitsDead || 0);
      }
    }

    // Combine allies and enemies data for leaderboards
    const allUserData = { ...alliesDifferences, ...enemiesDifferences };
    
    // Create top 300 leaderboards for each metric
    const getTop300 = (metric, dataset) => Object.entries(dataset)
        .filter(([, d]) => {
          const value = d[metric];
          return value !== null && value !== undefined && !isNaN(value) && value !== 0 && isFinite(value);
        })
        .sort(([, a], [, b]) => {
          const aValue = Number(a[metric]) || 0;
          const bValue = Number(b[metric]) || 0;
          return bValue - aValue; // Descending order
        })
        .slice(0, 300)
        .map(([userId, d]) => ({ userId, server: d.homeServer, [metric]: d[metric] }));

    const alliesTop300 = {
      merits: getTop300('merits', alliesDifferences),
      manaSpent: getTop300('manaSpent', alliesDifferences),
      unitsDead: getTop300('unitsDead', alliesDifferences)
    };

    const enemiesTop300 = {
      merits: getTop300('merits', enemiesDifferences),
      manaSpent: getTop300('manaSpent', enemiesDifferences),
      unitsDead: getTop300('unitsDead', enemiesDifferences)
    };

      const totalTop300 = {
       merits: getTop300('merits', allUserData),
       manaSpent: getTop300('manaSpent', allUserData),
       unitsDead: getTop300('unitsDead', allUserData)
     };

     // Transform totalMetrics into chart data structures
     const serverNames = Object.keys(totalMetrics);
     
     // Pie chart data for manaSpent, merits, and unitsDead
     const pieChartData = {
       manaSpent: {
         categories: serverNames,
         series: serverNames.map(server => totalMetrics[server].manaSpent)
       },
       merits: {
         categories: serverNames,
         series: serverNames.map(server => totalMetrics[server].merits)
       },
       unitsDead: {
         categories: serverNames,
         series: serverNames.map(server => totalMetrics[server].unitsDead)
       }
     };

     // Bar chart data for powerLoss (sorted in reverse order by powerLoss value)
     const powerLossEntries = serverNames.map(server => ({
       server,
       powerLoss: totalMetrics[server].powerLoss
     })).sort((a, b) => b.powerLoss - a.powerLoss); // Sort in reverse order (highest first)
     
     const barChartData = {
       powerLoss: {
         categories: powerLossEntries.map(entry => entry.server),
         series: powerLossEntries.map(entry => entry.powerLoss)
       },
       meritAp: {
        categories: serverNames,
        series: serverNames.map(server => (totalMetrics[server].merits / totalMetrics[server].highestPower) * 100)
       }
     };

      return NextResponse.json({
        id: seasonName,
        data: {
          alliesTop300,
          enemiesTop300,
          totalTop300,
          allies: alliesDifferences,
          enemies: enemiesDifferences,
          chartData: {
            pieCharts: pieChartData,
            barCharts: barChartData
          }
        },
        startDate,
        endDate
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
      return generateCacheKey('metrics-kvk-season', {
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
