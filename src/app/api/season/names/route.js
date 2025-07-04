import { adminDb } from '../../../../lib/firebase-admin';
import { withAuthAndRole } from '../../../../lib/auth-middleware';

export async function GET() {
  try {
    // Get reference to the sheets collection
    const sheetsRef = adminDb.collection('sheets');
    
    // Get all documents from the collection
    const querySnapshot = await sheetsRef.get();
    
    // Extract document IDs and find current season based on lastUpdatedAt
    let currentSeason = null;
    let latestUpdate = null;
    
    // Create array of documents with their data for sorting
    const seasonsWithData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data()
    }));
    
    // Find current season (most recently updated)
    seasonsWithData.forEach(season => {
      if (season.data.lastUpdatedAt) {
        const updateTime = new Date(season.data.lastUpdatedAt);
        if (!latestUpdate || updateTime > latestUpdate) {
          latestUpdate = updateTime;
          currentSeason = season.id;
        }
      }
    });

    // Sort seasons by lastUpdatedAt in descending order (most recent first)
    const sortedSeasons = seasonsWithData.sort((a, b) => {
      const dateA = a.data.lastUpdatedAt ? new Date(a.data.lastUpdatedAt) : new Date(0);
      const dateB = b.data.lastUpdatedAt ? new Date(b.data.lastUpdatedAt) : new Date(0);
      return dateB - dateA; // Descending order
    });

    const sheetIds = sortedSeasons.map(season => season.id);

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

async function createSeasonHandler(request) {
  try {
    // Parse the request body
    const { season_name } = await request.json();

    // Validate season_name
    if (!season_name || typeof season_name !== 'string' || season_name.trim() === '') {
      return new Response(JSON.stringify({ error: 'Valid season_name is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get reference to the sheets collection
    const sheetsRef = adminDb.collection('sheets');
    
    // Check if a document with this name already exists
    const existingDoc = await sheetsRef.doc(season_name.trim()).get();
    if (existingDoc.exists) {
      return new Response(JSON.stringify({ error: 'Season name already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create new document with the season name as the document ID
    await sheetsRef.doc(season_name.trim()).set({
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ 
      message: 'Season created successfully',
      season_name: season_name.trim()
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating season:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const POST = withAuthAndRole(createSeasonHandler, 'admin');
