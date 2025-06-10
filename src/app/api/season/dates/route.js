import { adminDb } from '../../../../lib/firebase-admin';

export async function GET(request) {
  try {
    // Get the season_name from query parameters
    const { searchParams } = new URL(request.url);
    const seasonName = searchParams.get('season_name');

    // Validate required parameter
    if (!seasonName) {
      return new Response(JSON.stringify({ error: 'Missing required parameter: season_name' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Query Firestore for the sheet with matching season_name
    const sheetsRef = adminDb.collection('sheets');
    const querySnapshot = await sheetsRef.where('season_name', '==', seasonName).get();

    if (querySnapshot.empty) {
      return new Response(JSON.stringify({ error: 'No sheet found with the provided season name' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the first matching document
    const sheetDoc = querySnapshot.docs[0];
    const sheetData = sheetDoc.data();

    // Filter keys that match the date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const dateKeys = Object.keys(sheetData).filter(key => dateRegex.test(key));

    return new Response(JSON.stringify(dateKeys), {
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
