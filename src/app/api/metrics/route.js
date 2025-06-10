import { adminDb } from '../../../lib/firebase-admin';

export async function GET(request) {
  try {
    // Get the search params from the URL
    const { searchParams } = new URL(request.url);
    const seasonName = searchParams.get('season_name');
    const date = searchParams.get('date');

    // Validate required parameters
    if (!seasonName || !date) {
      return new Response(JSON.stringify({ error: 'Missing required parameters: season_name and date' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return new Response(JSON.stringify({ error: 'Invalid date format. Please use YYYY-MM-DD' }), {
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

    return new Response(JSON.stringify({
      id: sheetDoc.id,
      data: sheetData[date]
    }), {
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
