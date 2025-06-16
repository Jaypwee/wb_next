import * as XLSX from 'xlsx';
import { NextResponse } from 'next/server';

import { adminDb } from 'src/lib/firebase-admin';

const REQUIRED_COLUMNS = {
  0: 'Lord ID',
  1: 'Name',
  5: 'Current Power',
  6: 'Power',
  7: 'Merits',
  8: 'Units Killed',
  9: 'Units Dead',
  10: 'Units Healed',
  15: 'T5 Kill Count',
  32: 'Mana Spent',
  34: 'Gems Spent'
};

export async function POST(request) {
  try {
    // Get the file and metadata from the request
    const formData = await request.formData();
    const file = formData.get('file');
    const seasonName = formData.get('seasonName');
    const title = formData.get('title');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!seasonName || !title) {
      return NextResponse.json(
        { error: 'Missing required metadata (seasonName or title)' },
        { status: 400 }
      );
    }

    console.log('Processing upload for:', { seasonName, title });

    // Check if it's an Excel file
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      return NextResponse.json(
        { error: 'File must be an Excel file (.xlsx or .xls)' },
        { status: 400 }
      );
    }

    // Read the file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    
    // Get all sheet names
    const sheetNames = workbook.SheetNames;
    console.log('Available sheets:', sheetNames);

    // Skip first two sheets and process the rest
    const targetSheets = sheetNames.slice(2);
    console.log('Processing sheets:', targetSheets);

    // Get all user IDs from users collection
    const usersSnapshot = await adminDb.collection('users').get();
    const validUserIds = new Set(usersSnapshot.docs.map(doc => doc.id));
    
    // Parse data into the required format
    const parsedData = {};
    
    // Process each target sheet
    for (const sheetName of targetSheets) {
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Validate headers
      const headers = data[0];
      console.log(`Headers for ${sheetName}:`, headers);
      
      const missingColumns = [];
      Object.entries(REQUIRED_COLUMNS).forEach(([index, columnName]) => {
        if (headers[parseInt(index)] !== columnName) {
          missingColumns.push(columnName);
        }
      });

      if (missingColumns.length > 0) {
        console.log(`Skipping sheet ${sheetName} due to missing columns:`, missingColumns);
        continue;
      }

      // Process rows for this sheet
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const lordId = String(row[0]); // Convert to string and ensure it's the first column

        if (lordId && validUserIds.has(lordId)) {
          parsedData[lordId] = {
            name: row[1],
            currentPower: Number(row[5]),
            power: Number(row[6]),
            merits: Number(row[7]),
            unitsKilled: Number(row[8]),
            unitsDead: Number(row[9]),
            unitsHealed: Number(row[10]),
            t5KillCount: Number(row[15]),
            manaSpent: Number(row[32]),
            gemsSpent: Number(row[34])
          };
        }
      }
    }

    console.log('Number of records parsed:', Object.keys(parsedData).length);

    // Write to Firestore
    const sheetsRef = adminDb.collection('sheets').doc(seasonName);
    const sheetDoc = await sheetsRef.get();

    if (!sheetDoc.exists) {
      // Create new document if it doesn't exist
      await sheetsRef.set({
        individual: {
          [title]: parsedData
        },
        kvk: {}
      });
    } else {
      // Update existing document
      await sheetsRef.update({
        [`individual.${title}`]: parsedData
      });
    }

    return NextResponse.json({ 
      processedSheets: targetSheets,
      seasonName,
      title,
      recordCount: Object.keys(parsedData).length
    });

  } catch (error) {
    console.error('Error processing Excel file:', error);
    return NextResponse.json(
      { error: 'Error processing file' },
      { status: 500 }
    );
  }
}
