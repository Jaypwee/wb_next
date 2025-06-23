import { adminDb } from '../../../../lib/firebase-admin';

export async function GET() {
  try {
    // Get reference to the sheets collection
    const sheetsRef = adminDb.collection('sheets');
    
    // Get all documents from the collection
    const querySnapshot = await sheetsRef.get();
    
    // Extract document IDs and find current season based on lastUpdatedAt
    let currentSeason = null;
    let latestUpdate = null;
    
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.lastUpdatedAt) {
        const updateTime = new Date(data.lastUpdatedAt);
        if (!latestUpdate || updateTime > latestUpdate) {
          latestUpdate = updateTime;
          currentSeason = doc.id;
        }
      }
    });

    const sheetIds = querySnapshot.docs.map(doc => doc.id);

    return new Response(JSON.stringify({
      total_seasons: sheetIds,
      current_season: currentSeason
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching sheet IDs:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
