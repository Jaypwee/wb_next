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

    // Get the document directly by ID
    const sheetDoc = await adminDb.collection('sheets').doc(seasonName).get();

    if (!sheetDoc.exists) {
      return new Response(JSON.stringify({ error: 'No sheet found with the provided season name' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sheetData = sheetDoc.data();

    // Filter keys that match the date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const dates = Object.keys(sheetData.individual)
      .filter(key => dateRegex.test(key))
      .sort(); // Sort dates in ascending order

    return new Response(JSON.stringify(dates), {
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
