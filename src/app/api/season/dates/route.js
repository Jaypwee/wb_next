import { adminDb } from '../../../../lib/firebase-admin';

export async function GET(request) {
  try {
    // Get the season_name from query parameters
    const { searchParams } = new URL(request.url);
    const seasonName = searchParams.get('season_name');
    const metricType = searchParams.get('metric_type');

    // Validate required parameter
    if (!seasonName) {
      return new Response(JSON.stringify({ error: 'Missing required parameter: season_name' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the subcollections of the season document
    const seasonDocRef = adminDb.collection('sheets').doc(seasonName);
    const subcollections = await seasonDocRef.listCollections();

    if (subcollections.length === 0) {
      return new Response(JSON.stringify({ error: 'No subcollections found for the provided season name' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Extract subcollection names (dates)
    let allDates = [];
    if (metricType && metricType.toLowerCase() === 'kvk') {
      const filtered = await Promise.all(
        subcollections.map(async (collection) => {
          try {
            const metadataSnap = await collection.doc('metadata').get();
            const typeValue = metadataSnap.exists ? (metadataSnap.get('type') ?? (metadataSnap.data()?.type)) : null;
            return typeof typeValue === 'string' && typeValue.toLowerCase() === 'kvk' ? collection.id : null;
          } catch (err) {
            console.error('Failed to read metadata for', collection.id, err);
            return null;
          }
        })
      );
      allDates = filtered.filter(Boolean);
    } else {
      allDates = subcollections.map((collection) => collection.id);
    }

    // Separate special dates from regular dates
    const preSeasonDates = allDates.filter(date => date.toLowerCase().includes('preseason')); 
    const startDates = allDates.filter(date => date.toLowerCase().includes('start'));
    const finalDates = allDates.filter(date => date.toLowerCase().includes('final'));
    const regularDates = allDates.filter(date => 
      !date.toLowerCase().includes('start') && !date.toLowerCase().includes('final') && !date.toLowerCase().includes('preseason')
    );

    // Sort regular dates (assuming they follow date format)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    regularDates.sort((a, b) => {
      // If both are date format, sort chronologically
      if (dateRegex.test(a) && dateRegex.test(b)) {
        return a.localeCompare(b);
      }
      // Otherwise sort alphabetically
      return a.localeCompare(b);
    });

    // Combine in the desired order: [start, ... dates ..., final]
    const dates = [...preSeasonDates, ...startDates, ...regularDates, ...finalDates];

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
