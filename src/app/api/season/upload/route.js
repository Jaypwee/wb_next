import { NextResponse } from 'next/server';

import { adminDb } from 'src/lib/firebase-admin';
import { withAuthAndRole } from 'src/lib/auth-middleware';
import { invalidateAllSeasonIndividualMetrics } from 'src/lib/cache-invalidation';

import { processFileUpload } from '../../utils/file-processor';

const DATA_TYPE = {
  INDIVIDUAL: 'individual',
  KVK: 'kvk'
};

async function postHandler(request) {
  try {
    // Get the files and metadata from the request
    const formData = await request.formData();
    const files = formData.getAll('files');
    const seasonName = formData.get('seasonName');
    const title = formData.get('title');
    const type = formData.get('type');

    // Get authenticated user for logging context
    const authenticatedUser = request.user;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    if (!seasonName || !title) {
      return NextResponse.json(
        { error: 'Season name and title are required' },
        { status: 400 }
      );
    }

    console.log('Processing upload for:', { seasonName, title, fileCount: files.length });

    // Validate all files first
    for (const file of files) {
      if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
        return NextResponse.json(
          { error: `File ${file.name} must be an Excel file (.xlsx or .xls) or CSV file (.csv)` },
          { status: 400 }
        );
      }
    }

    // Process all files and accumulate results
    const allParsedData = {};
    const allTotalData = {};
    const allTargetSheets = [];
    let totalRecordCount = 0;
    // Get the season document reference
    const seasonDocRef = adminDb.collection('sheets').doc(seasonName);

    // Get the season document to read the allies field
    const seasonDoc = await seasonDocRef.get();
    const titleCollectionRef = seasonDocRef.collection(title);
    const seasonData = seasonDoc.data();
    const validServers = seasonData.allies.concat(seasonData.enemies);

    for (const file of files) {
      // Process each file upload using utility function
      const { parsedData, totalData, targetSheets, recordCount } = await processFileUpload(file, adminDb, title, validServers);
    
      // Accumulate results
      Object.assign(allParsedData, parsedData);
      Object.assign(allTotalData, totalData);
      allTargetSheets.push(...targetSheets);
      totalRecordCount += recordCount;
    }

    // Write to Firestore using logged operations

    // Create subcollection with title and add the parsed data using batch commits
   
    
    // Split data into batches (Firestore limit is 500 operations per batch)
    const entries = Object.entries(allParsedData);
    const batchSize = 500;
    const batches = [];

    // Write total data to Firestore
    const totalDataBatch = adminDb.batch();
    const totalDocRef = titleCollectionRef.doc('total');
    totalDataBatch.set(totalDocRef, allTotalData);
    batches.push(totalDataBatch);

    
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = adminDb.batch();
      const batchEntries = entries.slice(i, i + batchSize);
      
      for (const [userId, userData] of batchEntries) {
        const docRef = titleCollectionRef.doc(userId);
        batch.set(docRef, userData);
      }
      
      batches.push(batch);
    }
    
    // Execute all batches
    await Promise.all(batches.map(batch => batch.commit()));
    
    console.log(`Successfully uploaded ${entries.length} entries in ${batches.length} batch(es)`)

    // Invalidate cache for this season after successful upload
    try {
      await invalidateAllSeasonIndividualMetrics(seasonName);
      console.log('Cache invalidated successfully for season:', seasonName);
    } catch (cacheError) {
      // Log cache error but don't fail the upload
      console.error('Cache invalidation failed:', cacheError);
    }

    return NextResponse.json({
      seasonName,
      title,
      recordCount: totalRecordCount,
    });

  } catch (error) {
    console.error('Error processing Excel file:', error);
    return NextResponse.json(
      { error: 'Error processing file' },
      { status: 500 }
    );
  }
}

export const POST = withAuthAndRole(postHandler, 'admin');
