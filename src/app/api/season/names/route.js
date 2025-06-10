import { adminDb } from '../../../../lib/firebase-admin';

export async function GET() {
  try {
    // Get reference to the sheets collection
    const sheetsRef = adminDb.collection('sheets');
    
    // Get all documents from the collection
    const querySnapshot = await sheetsRef.get();
    
    // Extract document IDs and find current season
    let currentSeason = null;
    let latestDate = null;
    
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.season_end) {
        const seasonEnd = new Date(data.season_end);
        if (!latestDate || seasonEnd > latestDate) {
          latestDate = seasonEnd;
          currentSeason = data.season_name;
        }
      }
    });

    const sheetIds = querySnapshot.docs.map(doc => doc.id);

    return new Response(JSON.stringify({
      sheetIds,
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
