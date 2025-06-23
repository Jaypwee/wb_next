import { NextResponse } from 'next/server';

import { adminDb } from 'src/lib/firebase-admin';
import { withAuth } from 'src/lib/auth-middleware';

async function getAllUsersHandler(request) {
  try {
    const authenticatedUser = request.user;
    
    console.log(`User ${authenticatedUser.email} (${authenticatedUser.uid}) accessing all users`);

    // Get reference to the users collection
    const usersRef = adminDb.collection('users');
    
    // Get all documents from the collection
    const querySnapshot = await usersRef.get();
    
    // Transform the data into the requested format
    const result = {};
    
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      result[doc.id] = {
        nationality: data.nationality || null,
        mainTroops: data.mainTroops || null,
        nickname: data.nickname || null,
        highestPower: data.highestPower || null,
        unitsKilled: data.unitsKilled || null,
        unitsDead: data.unitsDead || null,
        manaSpent: data.manaSpent || null,
        isInfantryGroup: data.isInfantryGroup || false,
        labels: data.labels || [],
      };
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the protected GET handler - any authenticated user can access
export const GET = withAuth(getAllUsersHandler);
