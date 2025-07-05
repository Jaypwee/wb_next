import { NextResponse } from 'next/server';

import { adminDb } from 'src/lib/firebase-admin';

async function getUserOverviewHandler() {
  try {
    // Get reference to the users collection
    const usersRef = adminDb.collection('users');
    
    // Get all documents from the collection
    const querySnapshot = await usersRef.get();
    
    // Initialize counters
    const mainTroopsCount = {};
    const nationalityCount = {};
    let totalUsers = 0;
    
    // Process each document
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      totalUsers++;
      
      // Count mainTroops
      const mainTroops = data.mainTroops || 'unknown';
      mainTroopsCount[mainTroops] = (mainTroopsCount[mainTroops] || 0) + 1;
      
      // Count nationality
      const nationality = data.nationality || 'unknown';
      nationalityCount[nationality] = (nationalityCount[nationality] || 0) + 1;
    });

    // Return the counts in the requested format
    const result = {
      totalUsers,
      mainTroops: mainTroopsCount,
      nationality: nationalityCount
    };

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('Error fetching user overview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the public GET handler
export const GET = getUserOverviewHandler;
