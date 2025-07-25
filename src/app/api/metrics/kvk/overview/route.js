import { NextResponse } from 'next/server';

import { adminDb } from 'src/lib/firebase-admin';
import { withAuth } from 'src/lib/auth-middleware';
import { withCache, generateCacheKey } from 'src/lib/cache';

// Function to transform computed results into ApexCharts format
function transformToChartData(computedResults) {
  // Get all dates (categories) and sort them
  const categories = Object.keys(computedResults).sort();
  
  // Get all unique server names across all dates
  const allServers = new Set();
  categories.forEach(date => {
    Object.keys(computedResults[date] || {}).forEach(server => {
      allServers.add(server);
    });
  });
  
  const servers = Array.from(allServers).sort();
  
  // Initialize chart data structure
  const chartData = {
    merits: {
      categories,
      series: []
    },
    unitsDead: {
      categories,
      series: []
    },
    manaSpent: {
      categories,
      series: []
    }
  };
  
  // Create series for each server and each metric
  servers.forEach(server => {
    const meritsData = [];
    const unitsDeadData = [];
    const manaSpentData = [];
    
    categories.forEach(date => {
      const dateData = computedResults[date] || {};
      const serverData = dateData[server] || {};
      
      meritsData.push(serverData.merits || 0);
      unitsDeadData.push(serverData.unitsDead || 0);
      manaSpentData.push(serverData.manaSpent || 0);
    });
    
    chartData.merits.series.push({
      name: server,
      data: meritsData
    });
    
    chartData.unitsDead.series.push({
      name: server,
      data: unitsDeadData
    });
    
    chartData.manaSpent.series.push({
      name: server,
      data: manaSpentData
    });
  });
  
  return chartData;
}

async function getHandler(request) {
  try {
    // Get the search params from the URL
    const { searchParams } = new URL(request.url);
    const seasonName = searchParams.get('season_name');

    // Validate required parameters
    if (!seasonName) {
      return NextResponse.json(
        { error: 'Missing required parameter: season_name' },
        { status: 400 }
      );
    }

    // Get the season document reference
    const seasonDocRef = adminDb.collection('sheets').doc(seasonName);

    // Check if the season document exists
    const seasonDoc = await seasonDocRef.get();
    if (!seasonDoc.exists) {
      return NextResponse.json(
        { error: 'Season document not found' },
        { status: 404 }
      );
    }

    // Get all subcollections from the season document
    const subcollections = await seasonDocRef.listCollections();
    const subcollectionNames = subcollections.map(sub => sub.id);

    // Filter out 'preseason' and 'start' subcollections
    const dataSubcollections = subcollectionNames.filter(
      name => name !== 'preseason' && name !== 'start'
    );

    // Check if there are any data subcollections
    if (dataSubcollections.length < 2) {
      return NextResponse.json(
        { data: null },
        { status: 200 }
      );
    }

    // Get the 'start' subcollection's total document
    const startTotalRef = seasonDocRef.collection('start').doc('total');
    const startTotalDoc = await startTotalRef.get();

    if (!startTotalDoc.exists) {
      return NextResponse.json(
        { error: 'Start total document not found' },
        { status: 404 }
      );
    }

    const startTotalData = startTotalDoc.data();

    // Initialize the computed results object
    const computedResults = {};
    // Process each data subcollection
    for (const subcollectionName of dataSubcollections) {
      const totalRef = seasonDocRef.collection(subcollectionName).doc('total');
      const totalDoc = await totalRef.get();

      if (totalDoc.exists) {
        const totalData = totalDoc.data();
        
        // Compute the difference for each key
        const subcollectionResult = {};
        
        for (const key in totalData) {
          if (startTotalData[key] && totalData[key]) {
            subcollectionResult[key] = {
              manaSpent: (totalData[key].manaSpent || 0) - (startTotalData[key].manaSpent || 0),
              unitsDead: (totalData[key].unitsDead || 0) - (startTotalData[key].unitsDead || 0),
              merits: (totalData[key].merits || 0) - (startTotalData[key].merits || 0)
            };
          }
        }
        
        computedResults[subcollectionName] = subcollectionResult;
      }
    }

    // Transform computed results into chart data format
    const chartData = transformToChartData(computedResults);

    return NextResponse.json({ data: chartData }, { status: 200 });

  } catch (error) {
    console.error('Error in KVK overview API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Apply authentication and caching
export const GET = withAuth(
  withCache(getHandler, {
    // Custom cache key generator for KvK overview metrics
    keyGenerator: (request) => {
      const { searchParams } = new URL(request.url);
      return generateCacheKey('metrics-kvk-overview', {
        seasonName: searchParams.get('season_name')
      });
    },
    // Skip cache for requests with invalid parameters
    skipCache: (request) => {
      const { searchParams } = new URL(request.url);
      const seasonName = searchParams.get('season_name');
      
      return !seasonName;
    }
  })
);
