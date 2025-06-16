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
    const dateKeys = Object.keys(sheetData).filter(key => dateRegex.test(key));

    // Create an object with week labels
    const datesWithWeeks = dateKeys.reduce((acc, date, index) => {
      acc[date] = `Week ${index + 1}`;
      return acc;
    }, {});

    return new Response(JSON.stringify(datesWithWeeks), {
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
