import { NextResponse } from 'next/server';

import { adminDb } from 'src/lib/firebase-admin';
import { withAuth } from 'src/lib/auth-middleware';

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
    if (dataSubcollections.length === 0) {
      return NextResponse.json(
        { error: 'No data to show - no subcollections found besides preseason and start' },
        { status: 400 }
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

    return NextResponse.json({ data: computedResults }, { status: 200 });

  } catch (error) {
    console.error('Error in KVK overview API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler);
